// services/staffService/sampleStatusManager.ts
import { SampleService, SampleResponse } from "./sampleService";
import { SampleKitsService } from "./sampleService";

// Định nghĩa các trạng thái sample
export enum SampleStatus {
  RECEIVED = "received",
  PROCESSING = "processing", 
  COMPLETED = "completed",
  FAILED = "failed",
  REJECTED = "rejected"
}

// Mapping từ appointment status sang sample status
export const APPOINTMENT_TO_SAMPLE_STATUS = {
  "SampleReceived": SampleStatus.RECEIVED,
  "Testing": SampleStatus.PROCESSING,
  "Completed": SampleStatus.COMPLETED
};

export interface SampleStatusUpdateResult {
  success: boolean;
  updatedSamples: SampleResponse[];
  errors: { sampleId: string; error: string; }[];
}

export class SampleStatusManager {
  /**
   * Update sample status với validation
   */
  static async updateSampleStatus(
    sampleId: string, 
    newStatus: SampleStatus,
    notes?: string
  ): Promise<SampleResponse> {
    try {
      console.log(`🔄 Updating sample ${sampleId} status to: ${newStatus}`);

      // Lấy thông tin sample hiện tại
      const currentSample = await SampleService.getSampleById(sampleId);
      
      // Validate transition (optional - có thể bỏ qua nếu muốn flexible)
      if (!this.isValidStatusTransition(currentSample.status as SampleStatus, newStatus)) {
        console.warn(`⚠️ Status transition from ${currentSample.status} to ${newStatus} may not be ideal, but proceeding...`);
      }

      // Chuẩn bị data update
      const updateData: any = {
        status: newStatus
      };

      // Thêm timestamp vào notes
      const timestamp = new Date().toLocaleString('vi-VN');
      if (notes) {
        updateData.notes = currentSample.notes ? 
          `${currentSample.notes}\n[${timestamp}] ${notes}` : 
          `[${timestamp}] ${notes}`;
      } else {
        // Auto notes based on status
        const autoNote = this.getAutoNoteForStatus(newStatus, timestamp);
        if (autoNote) {
          updateData.notes = currentSample.notes ? 
            `${currentSample.notes}\n${autoNote}` : 
            autoNote;
        }
      }

      // Thực hiện update
      const updatedSample = await SampleService.updateSample(sampleId, updateData);
      
      console.log(`✅ Sample status updated: ${currentSample.status} → ${newStatus}`);
      return updatedSample;

    } catch (error: any) {
      console.error(`❌ Error updating sample ${sampleId} status:`, error);
      throw new Error(`Không thể cập nhật trạng thái mẫu ${sampleId}: ${error.message}`);
    }
  }

  /**
   * Update tất cả samples của một order khi appointment status thay đổi
   */
  static async updateSamplesForOrder(
    orderId: string, 
    newSampleStatus: SampleStatus,
    appointmentStatus: string
  ): Promise<SampleStatusUpdateResult> {
    try {
      console.log(`🔄 Updating samples for order ${orderId} to status: ${newSampleStatus}`);

      // Lấy sample kits của order
      const sampleKits = await SampleKitsService.getSampleKitsByOrderId(orderId);
      
      if (sampleKits.length === 0) {
        console.log(`⚠️ No sample kits found for order: ${orderId}`);
        return {
          success: true,
          updatedSamples: [],
          errors: []
        };
      }

      // Lấy tất cả samples từ các kits
      const allSamples: SampleResponse[] = [];
      for (const kit of sampleKits) {
        try {
          const samples = await SampleService.getSamplesBySampleKitsId(kit.id);
          allSamples.push(...samples);
        } catch (error) {
          console.warn(`⚠️ Could not get samples for kit ${kit.id}:`, error);
        }
      }

      if (allSamples.length === 0) {
        console.log(`⚠️ No samples found for order: ${orderId}`);
        return {
          success: true,
          updatedSamples: [],
          errors: []
        };
      }

      console.log(`📋 Found ${allSamples.length} samples to update`);

      // Update từng sample
      const updatedSamples: SampleResponse[] = [];
      const errors: { sampleId: string; error: string; }[] = [];

      const updateNote = `Tự động cập nhật từ appointment status: ${appointmentStatus}`;

      for (const sample of allSamples) {
        try {
          // Chỉ update samples có thể chuyển được (không update completed samples)
          if (this.shouldUpdateSample(sample.status as SampleStatus, newSampleStatus)) {
            const updatedSample = await this.updateSampleStatus(
              sample.id, 
              newSampleStatus, 
              updateNote
            );
            updatedSamples.push(updatedSample);
          } else {
            console.log(`⏭️ Skipping sample ${sample.id} - status ${sample.status} cannot transition to ${newSampleStatus}`);
          }
        } catch (error: any) {
          console.error(`❌ Failed to update sample ${sample.id}:`, error);
          errors.push({
            sampleId: sample.id,
            error: error.message
          });
        }
      }

      const result = {
        success: errors.length === 0,
        updatedSamples,
        errors
      };

      console.log(`✅ Sample update completed: ${updatedSamples.length} updated, ${errors.length} errors`);
      
      return result;

    } catch (error: any) {
      console.error(`❌ Error updating samples for order ${orderId}:`, error);
      throw new Error(`Không thể cập nhật samples cho order ${orderId}: ${error.message}`);
    }
  }

  /**
   * Kiểm tra có nên update sample không
   */
  private static shouldUpdateSample(currentStatus: SampleStatus, newStatus: SampleStatus): boolean {
    // Không update nếu đã completed hoặc failed
    if (currentStatus === SampleStatus.COMPLETED || currentStatus === SampleStatus.FAILED) {
      return false;
    }

    // Không update nếu status không thay đổi
    if (currentStatus === newStatus) {
      return false;
    }

    return true;
  }

  /**
   * Validate status transition (optional)
   */
  private static isValidStatusTransition(currentStatus: SampleStatus, newStatus: SampleStatus): boolean {
    const validTransitions: Record<SampleStatus, SampleStatus[]> = {
      [SampleStatus.RECEIVED]: [SampleStatus.PROCESSING, SampleStatus.REJECTED],
      [SampleStatus.PROCESSING]: [SampleStatus.COMPLETED, SampleStatus.FAILED],
      [SampleStatus.COMPLETED]: [], // No transitions from completed
      [SampleStatus.FAILED]: [SampleStatus.PROCESSING], // Can retry
      [SampleStatus.REJECTED]: [] // No transitions from rejected
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Tạo auto note cho status
   */
  private static getAutoNoteForStatus(status: SampleStatus, timestamp: string): string {
    switch (status) {
      case SampleStatus.RECEIVED:
        return `[${timestamp}] Mẫu đã được nhận`;
      case SampleStatus.PROCESSING:
        return `[${timestamp}] Bắt đầu xét nghiệm`;
      case SampleStatus.COMPLETED:
        return `[${timestamp}] Xét nghiệm hoàn thành`;
      case SampleStatus.FAILED:
        return `[${timestamp}] Xét nghiệm thất bại`;
      case SampleStatus.REJECTED:
        return `[${timestamp}] Mẫu bị từ chối`;
      default:
        return `[${timestamp}] Cập nhật trạng thái: ${status}`;
    }
  }

  /**
   * Lấy sample status từ appointment status
   */
  static getSampleStatusFromAppointmentStatus(appointmentStatus: string): SampleStatus | null {
    return APPOINTMENT_TO_SAMPLE_STATUS[appointmentStatus as keyof typeof APPOINTMENT_TO_SAMPLE_STATUS] || null;
  }

  /**
   * Batch update multiple samples
   */
  static async batchUpdateSamples(
    sampleIds: string[], 
    newStatus: SampleStatus,
    notes?: string
  ): Promise<SampleStatusUpdateResult> {
    console.log(`🔄 Batch updating ${sampleIds.length} samples to: ${newStatus}`);

    const updatedSamples: SampleResponse[] = [];
    const errors: { sampleId: string; error: string; }[] = [];

    for (const sampleId of sampleIds) {
      try {
        const updated = await this.updateSampleStatus(sampleId, newStatus, notes);
        updatedSamples.push(updated);
      } catch (error: any) {
        errors.push({
          sampleId,
          error: error.message
        });
      }
    }

    return {
      success: errors.length === 0,
      updatedSamples,
      errors
    };
  }

  /**
   * Lấy thống kê samples theo status
   */
  static async getSampleStatusStats(): Promise<Record<SampleStatus, number>> {
    try {
      const allSamples = await SampleService.getAllSamples();
      
      const stats: Record<SampleStatus, number> = {
        [SampleStatus.RECEIVED]: 0,
        [SampleStatus.PROCESSING]: 0,
        [SampleStatus.COMPLETED]: 0,
        [SampleStatus.FAILED]: 0,
        [SampleStatus.REJECTED]: 0
      };

      allSamples.forEach(sample => {
        const status = sample.status as SampleStatus;
        if (stats[status] !== undefined) {
          stats[status]++;
        }
      });

      return stats;
    } catch (error: any) {
      console.error('❌ Error getting sample status stats:', error);
      throw error;
    }
  }
}