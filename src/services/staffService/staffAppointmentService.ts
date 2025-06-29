import { apiClient } from '../../config/api';
import { 
  ApiResponse, 
  ApiAppointment, 
  Appointment,
  AppointmentRequest
} from '../../types/appointment';
import { DoctorService } from './doctorService';
import { UserService } from './userService';
import { StaffService } from './staffService';
import { StatusUtils } from '../../utils/status';

export class AppointmentService {
  
  // ✅ Get all appointments (using correct endpoint)
  static async getAllAppointments(): Promise<Appointment[]> {
    try {
      console.log("📅 Fetching all appointments...");

      const appointmentsResponse = await apiClient.get<ApiResponse<ApiAppointment[]>>("/appointment/all");
      
      if (appointmentsResponse.data.code !== 200) {
        throw new Error(`Failed to fetch appointments: ${appointmentsResponse.data.message}`);
      }

      const appointments = appointmentsResponse.data.result;
      console.log("✅ Fetched appointments:", appointments.length);

      const enrichedAppointments = await Promise.all(
        appointments.map(async (appointment) => {
          try {
            const enrichedAppointment = await this.enrichAppointmentData(appointment);
            
            // Restore status from localStorage if available
            const storedStatus = StatusUtils.loadAppointmentStatus(appointment.id);
            if (storedStatus) {
              enrichedAppointment.status = storedStatus.status as Appointment['status'];
              enrichedAppointment.currentStep = storedStatus.currentStep;
              enrichedAppointment.completedSteps = storedStatus.completedSteps;
              enrichedAppointment.lastStatusUpdate = storedStatus.lastUpdated;
            }
            
            return enrichedAppointment;
          } catch (error) {
            console.error(`Error processing appointment ${appointment.id}:`, error);
            return this.createBasicAppointment(appointment);
          }
        })
      );

      const validAppointments = enrichedAppointments.filter(Boolean) as Appointment[];
      
      console.log("✅ Successfully processed appointments:", validAppointments.length);
      return validAppointments;

    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to fetch appointments");
    }
  }

  // ✅ Get appointment by ID
  static async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    try {
      console.log(`🔍 Fetching appointment ${appointmentId}...`);

      const response = await apiClient.get<ApiResponse<ApiAppointment>>(`/appointment/${appointmentId}`);

      if (response.data.code === 200) {
        const apiAppointment = response.data.result;
        const enrichedAppointment = await this.enrichAppointmentData(apiAppointment);
        
        const storedStatus = StatusUtils.loadAppointmentStatus(appointmentId);
        if (storedStatus) {
          enrichedAppointment.status = storedStatus.status as Appointment['status'];
          enrichedAppointment.currentStep = storedStatus.currentStep;
          enrichedAppointment.completedSteps = storedStatus.completedSteps;
          enrichedAppointment.lastStatusUpdate = storedStatus.lastUpdated;
        }
        
        return enrichedAppointment;
      }

      return null;

    } catch (error) {
      console.error("❌ Error fetching appointment by ID:", error);
      return null;
    }
  }

  // ✅ Create appointment (for orderId)
  static async createAppointment(orderId: string, appointmentData: AppointmentRequest): Promise<ApiAppointment | null> {
    try {
      console.log(`📅 Creating appointment for order ${orderId}...`);
      
      const response = await apiClient.post<ApiResponse<ApiAppointment>>(`/appointment/${orderId}`, appointmentData);
      
      if (response.data.code === 200) {
        console.log("✅ Appointment created successfully");
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error creating appointment:", error);
      return null;
    }
  }

  // ✅ Update appointment
  static async updateAppointment(appointmentId: string, appointmentData: Partial<AppointmentRequest>): Promise<boolean> {
    try {
      console.log(`🔄 Updating appointment ${appointmentId}...`);

      const response = await apiClient.put(`/appointment/${appointmentId}`, appointmentData);

      if (response.data.code === 200) {
        console.log("✅ Appointment updated successfully");
        return true;
      } else {
        console.error("❌ Failed to update appointment:", response.data.message);
        return false;
      }

    } catch (error) {
      console.error("❌ Error updating appointment:", error);
      return false;
    }
  }

  // ✅ Delete appointment
  static async deleteAppointment(appointmentId: string): Promise<boolean> {
    try {
      console.log(`❌ Deleting appointment ${appointmentId}...`);

      const response = await apiClient.delete(`/appointment/${appointmentId}`);

      if (response.data.code === 200) {
        StatusUtils.clearAppointmentStatus(appointmentId);
        console.log("✅ Appointment deleted successfully");
        return true;
      } else {
        console.error("❌ Failed to delete appointment:", response.data.message);
        return false;
      }

    } catch (error) {
      console.error("❌ Error deleting appointment:", error);
      return false;
    }
  }

  // ✅ Confirm appointment (convenience method)
  static async confirmAppointment(appointmentId: string): Promise<boolean> {
    return this.updateAppointment(appointmentId, {
      status: true,
      notes: "Appointment confirmed by staff"
    });
  }

  // ✅ Cancel appointment (convenience method)
  static async cancelAppointment(appointmentId: string, reason?: string): Promise<boolean> {
    const success = await this.updateAppointment(appointmentId, {
      status: false,
      notes: reason || "Appointment cancelled by staff"
    });
    
    if (success) {
      StatusUtils.saveAppointmentStatus(appointmentId, 'Cancelled', 0);
    }
    
    return success;
  }

  // ✅ Get appointments by user (for staff to see user's appointments)
  static async getAppointmentsByUser(): Promise<ApiAppointment[]> {
    try {
      console.log("📅 Fetching appointments for current user...");
      
      const response = await apiClient.get<ApiResponse<ApiAppointment[]>>("/appointment/user/all");
      
      if (response.data.code === 200) {
        console.log("✅ Fetched user appointments:", response.data.result.length);
        return response.data.result;
      } else {
        console.warn("⚠️ Failed to fetch user appointments:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching user appointments:", error);
      return [];
    }
  }

  // ✅ Enrich appointment data with related information
  static async enrichAppointmentData(appointment: ApiAppointment): Promise<Appointment> {
    try {
      // Get user data
      const user = await UserService.getUserById(appointment.userId);

      // Get doctor info if doctor_time_slot is available
      let doctorInfo: Appointment['doctorInfo'] | undefined;
      
      if (appointment.doctor_time_slot) {
        try {
          const timeSlot = await DoctorService.getDoctorTimeSlot(appointment.doctor_time_slot);
          if (timeSlot) {
            const doctor = await DoctorService.getDoctorById(timeSlot.doctorId);
            if (doctor) {
              doctorInfo = {
                name: doctor.doctorName,
                timeSlot: DoctorService.formatTimeSlot(timeSlot),
                dayOfWeek: DoctorService.formatDayOfWeek(timeSlot.dayOfWeek)
              };
            }
          }
        } catch (error) {
          console.warn(`Could not fetch doctor info for appointment ${appointment.id}:`, error);
        }
      }

      // Try to get related order and service data
      let order: any = undefined;
      let service: any = undefined;

      try {
        if (appointment.orderId) {
          const orderResponse = await apiClient.get(`/orders/${appointment.orderId}`);
          if (orderResponse.data.code === 200) {
            order = orderResponse.data.result;
            
            // Try to get service info from order details
            const orderDetailsResponse = await apiClient.get(`/order-details/${appointment.orderId}/all`);
            if (orderDetailsResponse.data.code === 200 && orderDetailsResponse.data.result.length > 0) {
              const orderDetail = orderDetailsResponse.data.result[0];
              service = await StaffService.getServiceById(orderDetail.dnaServiceId);
            }
          }
        }
      } catch (error) {
        console.warn(`Could not fetch order/service data for appointment ${appointment.id}:`, error);
      }

      return this.mapToFrontendAppointment(appointment, user, service, doctorInfo, order);

    } catch (error) {
      console.error(`Error enriching appointment ${appointment.id}:`, error);
      throw error;
    }
  }

  // ✅ Map API appointment to frontend appointment
  static mapToFrontendAppointment(
    appointment: ApiAppointment,
    user: any,
    service: any,
    doctorInfo?: Appointment['doctorInfo'],
    order?: any
  ): Appointment {
    
    const appointmentDate = new Date(appointment.appointment_date);
    const status = this.mapAppointmentStatus(appointment.status);
    
    return {
      id: appointment.id,
      customerName: user?.full_name || user?.username || 'N/A',
      phone: 'N/A', // Not available in user schema, might need to get from other source
      email: user?.email || 'N/A',
      date: appointmentDate.toISOString().split('T')[0],
      time: appointmentDate.toTimeString().split(' ')[0].substring(0, 5),
      serviceType: service?.service_category || appointment.appointment_type,
      serviceName: service?.service_name || appointment.appointment_type,
      status: status,
      locationType: StatusUtils.mapLocationType(service?.collection_method || 0),
      legalType: StatusUtils.mapLegalType(service?.required_legal_document || false),
      address: undefined, // Not available in current schema
      notes: appointment.notes || '',
      tasks: [], // Will be populated separately if needed
      doctorInfo: doctorInfo,
      currentStep: StatusUtils.getStepFromStatus(status),
      completedSteps: StatusUtils.getCompletedSteps(StatusUtils.getStepFromStatus(status)),
      lastStatusUpdate: appointment.updatedAt,
      rawData: {
        appointment,
        order,
        service: service || undefined,
        user: user || undefined
      }
    };
  }

  // ✅ Create basic appointment (fallback)
  static createBasicAppointment(appointment: ApiAppointment): Appointment {
    const appointmentDate = new Date(appointment.appointment_date);

    return {
      id: appointment.id,
      customerName: 'Loading...',
      phone: 'N/A',
      email: 'N/A',
      date: appointmentDate.toISOString().split('T')[0],
      time: appointmentDate.toTimeString().split(' ')[0].substring(0, 5),
      serviceType: appointment.appointment_type,
      serviceName: appointment.appointment_type,
      status: appointment.status ? 'Confirmed' : 'Pending',
      locationType: 'Cơ sở y tế',
      legalType: 'Dân Sự',
      notes: appointment.notes || '',
      rawData: {
        appointment
      }
    };
  }

  // ✅ Map appointment status
  static mapAppointmentStatus(apiStatus: boolean): Appointment['status'] {
    return apiStatus ? 'Confirmed' : 'Pending';
  }
}