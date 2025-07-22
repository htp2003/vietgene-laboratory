// services/staffService/appointmentSampleIntegration.ts
import { SampleStatusManager, SampleStatus } from "./sampleStatusManager";
import { Appointment } from "../../types/appointment";

export interface AppointmentStatusUpdateResult {
  appointmentUpdated: boolean;
  samplesUpdateResult?: {
    success: boolean;
    updatedCount: number;
    errorCount: number;
    errors: string[];
  };
}

export class AppointmentSampleIntegration {
  /**
   * Update appointment status và tự động update samples tương ứng
   */
  static async updateAppointmentWithSamples(
    appointment: Appointment,
    newAppointmentStatus: Appointment["status"],
    updateStatusCallback: (appointmentId: string, status: Appointment["status"]) => Promise<void>
  ): Promise<AppointmentStatusUpdateResult> {
    try {
      console.log(`🔄 Updating appointment ${appointment.id} to ${newAppointmentStatus} with sample sync`);

      // 1. Xác định sample status tương ứng
      const sampleStatus = SampleStatusManager.getSampleStatusFromAppointmentStatus(newAppointmentStatus);
      
      // 2. Update appointment status trước
      await updateStatusCallback(appointment.id, newAppointmentStatus);
      
      const result: AppointmentStatusUpdateResult = {
        appointmentUpdated: true
      };

      // 3. Update samples nếu có mapping
      if (sampleStatus && appointment.rawData?.order?.orderId) {
        try {
          console.log(`🧪 Updating samples for order ${appointment.rawData.order.orderId} to: ${sampleStatus}`);
          
          const samplesResult = await SampleStatusManager.updateSamplesForOrder(
            appointment.rawData.order.orderId,
            sampleStatus,
            newAppointmentStatus
          );

          result.samplesUpdateResult = {
            success: samplesResult.success,
            updatedCount: samplesResult.updatedSamples.length,
            errorCount: samplesResult.errors.length,
            errors: samplesResult.errors.map(e => `Sample ${e.sampleId}: ${e.error}`)
          };

          if (samplesResult.success) {
            console.log(`✅ Successfully updated ${samplesResult.updatedSamples.length} samples`);
          } else {
            console.warn(`⚠️ Partial success: ${samplesResult.updatedSamples.length} updated, ${samplesResult.errors.length} errors`);
          }

        } catch (sampleError: any) {
          console.error('❌ Error updating samples:', sampleError);
          result.samplesUpdateResult = {
            success: false,
            updatedCount: 0,
            errorCount: 1,
            errors: [sampleError.message]
          };
        }
      } else {
        console.log(`ℹ️ No sample status mapping for appointment status: ${newAppointmentStatus}`);
      }

      return result;

    } catch (error: any) {
      console.error('❌ Error in appointment-sample integration:', error);
      throw new Error(`Không thể cập nhật appointment và samples: ${error.message}`);
    }
  }

  /**
   * Kiểm tra appointment có samples không
   */
  static async checkAppointmentHasSamples(appointment: Appointment): Promise<boolean> {
    try {
      if (!appointment.rawData?.order?.orderId) {
        return false;
      }

      const samplesResult = await SampleStatusManager.updateSamplesForOrder(
        appointment.rawData.order.orderId,
        SampleStatus.RECEIVED, // Dummy status để check
        "check"
      );

      return samplesResult.updatedSamples.length > 0;
    } catch (error) {
      console.warn('Could not check if appointment has samples:', error);
      return false;
    }
  }

  /**
   * Lấy trạng thái samples của một appointment
   */
  static async getAppointmentSamplesStatus(appointment: Appointment): Promise<{
    hasSamples: boolean;
    samplesCount: number;
    statusCounts: Record<string, number>;
  }> {
    try {
      if (!appointment.rawData?.order?.orderId) {
        return {
          hasSamples: false,
          samplesCount: 0,
          statusCounts: {}
        };
      }

      // Get sample kits for order
      const { SampleKitsService } = await import("./sampleService");
      const sampleKits = await SampleKitsService.getSampleKitsByOrderId(appointment.rawData.order.orderId);
      
      let allSamples: any[] = [];
      for (const kit of sampleKits) {
        try {
          const { SampleService } = await import("./sampleService");
          const samples = await SampleService.getSamplesBySampleKitsId(kit.id);
          allSamples.push(...samples);
        } catch (error) {
          console.warn(`Could not get samples for kit ${kit.id}:`, error);
        }
      }

      const statusCounts: Record<string, number> = {};
      allSamples.forEach(sample => {
        statusCounts[sample.status] = (statusCounts[sample.status] || 0) + 1;
      });

      return {
        hasSamples: allSamples.length > 0,
        samplesCount: allSamples.length,
        statusCounts
      };

    } catch (error: any) {
      console.error('Error getting appointment samples status:', error);
      return {
        hasSamples: false,
        samplesCount: 0,
        statusCounts: {}
      };
    }
  }

  /**
   * Validate có thể chuyển appointment status không (dựa trên sample status)
   */
  static async validateAppointmentStatusChange(
    appointment: Appointment,
    newStatus: Appointment["status"]
  ): Promise<{ 
    canUpdate: boolean; 
    reason?: string;
    samplesInfo?: any;
  }> {
    try {
      // Nếu không liên quan đến samples thì luôn cho phép
      const sampleStatus = SampleStatusManager.getSampleStatusFromAppointmentStatus(newStatus);
      if (!sampleStatus) {
        return { canUpdate: true };
      }

      // Kiểm tra samples hiện tại
      const samplesInfo = await this.getAppointmentSamplesStatus(appointment);
      
      if (!samplesInfo.hasSamples) {
        // Nếu chưa có samples mà muốn chuyển sang Testing/Completed thì không được
        if (newStatus === "Testing" || newStatus === "Completed") {
          return {
            canUpdate: false,
            reason: "Chưa có mẫu xét nghiệm nào được tạo",
            samplesInfo
          };
        }
      }

      return { 
        canUpdate: true,
        samplesInfo
      };

    } catch (error: any) {
      console.error('Error validating appointment status change:', error);
      return {
        canUpdate: true, // Default cho phép để không block workflow
        reason: `Không thể validate: ${error.message}`
      };
    }
  }
}