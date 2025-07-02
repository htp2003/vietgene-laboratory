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
import { OrderParticipant, OrderParticipantsService } from './orderParticipantService';

export class AppointmentService {
  
  // ✅ Optimized getAllAppointments with chunk processing and error resilience
  static async getAllAppointments(): Promise<Appointment[]> {
    try {
      console.log("📅 Fetching all appointments with optimized processing...");

      const appointmentsResponse = await Promise.race([
        apiClient.get<ApiResponse<ApiAppointment[]>>("/appointment/all"),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout after 15s')), 15000)
        )
      ]) as any;
      
      if (appointmentsResponse.data.code !== 200) {
        throw new Error(`Failed to fetch appointments: ${appointmentsResponse.data.message}`);
      }

      const appointments = appointmentsResponse.data.result;
      console.log("✅ Fetched basic appointments:", appointments.length);

      // ✅ Chunk processing to avoid overwhelming the API
      const CHUNK_SIZE = 5;
      const enrichedAppointments: Appointment[] = [];
      
      console.log(`🔄 Processing appointments in chunks of ${CHUNK_SIZE}...`);
      
      for (let i = 0; i < appointments.length; i += CHUNK_SIZE) {
        const chunk = appointments.slice(i, i + CHUNK_SIZE);
        const chunkNumber = Math.floor(i/CHUNK_SIZE) + 1;
        const totalChunks = Math.ceil(appointments.length/CHUNK_SIZE);
        
        console.log(`📦 Processing chunk ${chunkNumber}/${totalChunks} (${chunk.length} appointments)`);
        
        // ✅ Process chunk with Promise.allSettled for error resilience
        const enrichedChunk = await Promise.allSettled(
          chunk.map(appointment => this.enrichAppointmentDataSafe(appointment))
        );
        
        // ✅ Handle results - keep appointment even if enrichment fails
        enrichedChunk.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            enrichedAppointments.push(result.value);
          } else {
            console.warn(`⚠️ Failed to enrich appointment ${chunk[index].id}:`, result.reason?.message);
            // Create fallback appointment
            enrichedAppointments.push(this.createBasicAppointment(chunk[index]));
          }
        });
        
        // ✅ Brief delay between chunks to avoid API overload
        if (i + CHUNK_SIZE < appointments.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      // ✅ Restore status from localStorage
      enrichedAppointments.forEach(appointment => {
        const storedStatus = StatusUtils.loadAppointmentStatus(appointment.id);
        if (storedStatus) {
          appointment.status = storedStatus.status as Appointment['status'];
          appointment.currentStep = storedStatus.currentStep;
          appointment.completedSteps = storedStatus.completedSteps;
          appointment.lastStatusUpdate = storedStatus.lastUpdated;
        }
      });

      const successfulEnrichments = enrichedAppointments.filter(a => a.customerName !== 'Loading...').length;
      console.log(`✅ Successfully processed ${enrichedAppointments.length} appointments (${successfulEnrichments} with full data)`);
      
      return enrichedAppointments;

    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to fetch appointments");
    }
  }

  // ✅ Safe enrichment with timeout and fallback
  static async enrichAppointmentDataSafe(appointment: ApiAppointment): Promise<Appointment> {
    try {
      // ✅ Timeout wrapper for the entire enrichment process
      const enrichmentPromise = this.enrichAppointmentData(appointment);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Enrichment timeout for appointment ${appointment.id}`)), 8000)
      );

      const enrichedAppointment = await Promise.race([enrichmentPromise, timeoutPromise]) as Appointment;
      
      return enrichedAppointment;
      
    } catch (error) {
      console.warn(`⚠️ Enrichment failed for appointment ${appointment.id}, using fallback:`, error);
      return this.createBasicAppointment(appointment);
    }
  }

  // ✅ Get appointment by ID
  static async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    try {
      console.log(`🔍 Fetching appointment ${appointmentId}...`);

      const response = await Promise.race([
        apiClient.get<ApiResponse<ApiAppointment>>(`/appointment/${appointmentId}`),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]) as any;

      if (response.data.code === 200) {
        const apiAppointment = response.data.result;
        const enrichedAppointment = await this.enrichAppointmentDataSafe(apiAppointment);
        
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

  // ✅ Optimized enrichAppointmentData with better error handling
  static async enrichAppointmentData(appointment: ApiAppointment): Promise<Appointment> {
    try {
      console.log(`🔍 Enriching appointment ${appointment.id}...`);

      // ✅ Parallel data fetching with individual error handling
      const [userResult, doctorResult, orderResult] = await Promise.allSettled([
        // User data (most important)
        UserService.getUserById(appointment.userId),
        
        // Doctor info (optional)
        appointment.doctor_time_slot ? this.fetchDoctorInfo(appointment.doctor_time_slot) : Promise.resolve(undefined),
        
        // Order/Service data (optional)
        appointment.orderId ? this.fetchOrderAndServiceInfo(appointment.orderId) : Promise.resolve({ order: undefined, service: undefined, participants: [] })
      ]);

      // ✅ Extract results with fallbacks
      const user = userResult.status === 'fulfilled' ? userResult.value : null;
      const doctorInfo = doctorResult.status === 'fulfilled' ? doctorResult.value : undefined;
      const { order, service, participants } = orderResult.status === 'fulfilled' ? orderResult.value : { order: undefined, service: undefined, participants: [] };

      if (!user) {
        console.warn(`⚠️ Could not fetch user data for appointment ${appointment.id}`);
      }

      return this.mapToFrontendAppointment(appointment, user, service, doctorInfo, order, participants);

    } catch (error) {
      console.error(`❌ Error enriching appointment ${appointment.id}:`, error);
      throw error;
    }
  }

  // ✅ Separate doctor info fetching with timeout
  static async fetchDoctorInfo(doctorTimeSlotId: string): Promise<Appointment['doctorInfo'] | undefined> {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Doctor info timeout')), 3000)
      );

      const timeSlot = await Promise.race([
        DoctorService.getDoctorTimeSlot(doctorTimeSlotId),
        timeoutPromise
      ]) as any;
      
      if (timeSlot) {
        const doctor = await Promise.race([
          DoctorService.getDoctorById(timeSlot.doctorId),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Doctor fetch timeout')), 3000))
        ]) as any;
        
        if (doctor) {
          return {
            name: doctor.doctorName,
            timeSlot: DoctorService.formatTimeSlot(timeSlot),
            dayOfWeek: DoctorService.formatDayOfWeek(timeSlot.dayOfWeek)
          };
        }
      }
      
      return undefined;
      
    } catch (error) {
      console.warn(`⚠️ Could not fetch doctor info for time slot ${doctorTimeSlotId}:`, error);
      return undefined;
    }
  }

  // ✅ Separate order/service info fetching with timeout
  static async fetchOrderAndServiceInfo(orderId: string): Promise<{ order?: any, service?: any, participants?: any[] }> {
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Order info timeout')), 4000)
    );

    const orderResponse = await Promise.race([
      apiClient.get(`/orders/${orderId}`),
      timeoutPromise
    ]) as any;
    
    if (orderResponse.data.code !== 200) {
      return { order: undefined, service: undefined, participants: [] };
    }
    
    const order = orderResponse.data.result;
    
    // ✅ Parallel loading of service info and participants
    const [serviceResult, participantsResult] = await Promise.allSettled([
      // Load service info
      (async () => {
        try {
          const orderDetailsResponse = await Promise.race([
            apiClient.get(`/order-details/${orderId}/all`),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Order details timeout')), 3000))
          ]) as any;
          
          if (orderDetailsResponse.data.code === 200 && orderDetailsResponse.data.result.length > 0) {
            const orderDetail = orderDetailsResponse.data.result[0];
            const service = await Promise.race([
              StaffService.getServiceById(orderDetail.dnaServiceId),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Service timeout')), 3000))
            ]);
            
            return service;
          }
          return undefined;
        } catch (error) {
          console.warn(`⚠️ Could not fetch service data for order ${orderId}:`, error);
          return undefined;
        }
      })(),
      
      // Load participants
      (async () => {
        try {
          const participants = await OrderParticipantsService.getParticipantsByOrderIdCached(orderId);
          return participants;
        } catch (error) {
          console.warn(`⚠️ Could not fetch participants for order ${orderId}:`, error);
          return [];
        }
      })()
    ]);
    
    const service = serviceResult.status === 'fulfilled' ? serviceResult.value : undefined;
    const participants = participantsResult.status === 'fulfilled' ? participantsResult.value : [];
    
    return { order, service, participants };
    
  } catch (error) {
    console.warn(`⚠️ Could not fetch order data for order ${orderId}:`, error);
    return { order: undefined, service: undefined, participants: [] };
  }
}

  // ✅ Map API appointment to frontend appointment
  static mapToFrontendAppointment(
    appointment: ApiAppointment,
    user: any,
    service: any,
    doctorInfo?: Appointment['doctorInfo'],
    order?: any,
    participants?: OrderParticipant[]
  ): Appointment {
    
    const appointmentDate = new Date(appointment.appointment_date);
    const status = this.mapAppointmentStatus(appointment.status);
    
    return {
      id: appointment.id,
      customerName: user?.full_name || user?.username || 'Unknown Customer',
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
        user: user || undefined,
        participants: participants || []
      }
    };
  }

  // ✅ Enhanced createBasicAppointment (fallback)
  static createBasicAppointment(appointment: ApiAppointment): Appointment {
    const appointmentDate = new Date(appointment.appointment_date);

    return {
      id: appointment.id,
      customerName: 'Loading...', // Indicator that user data failed to load
      phone: 'N/A',
      email: 'N/A',
      date: appointmentDate.toISOString().split('T')[0],
      time: appointmentDate.toTimeString().split(' ')[0].substring(0, 5),
      serviceType: appointment.appointment_type,
      serviceName: appointment.appointment_type,
      status: appointment.status ? 'Confirmed' : 'Pending',
      locationType: 'Cơ sở y tế', // Default fallback
      legalType: 'Dân Sự', // Default fallback
      notes: appointment.notes || '',
      currentStep: appointment.status ? 2 : 1,
      // completedSteps: appointment.status ? [1, 2] : [1],
      lastStatusUpdate: appointment.updatedAt || appointment.createdAt,
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