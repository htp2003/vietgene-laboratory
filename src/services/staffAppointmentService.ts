import axios from "axios";

const API_BASE_URL = "https://dna-service-se1857.onrender.com/dna_service";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `🚀 Staff Appointment API Request: ${config.method?.toUpperCase()} ${config.url}`
    );

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `✅ Staff Appointment API Response: ${response.status} ${response.statusText}`
    );
    return response;
  },
  (error) => {
    console.error("❌ Staff Appointment API Response error:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ===================== INTERFACES =====================

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// ✅ Add Doctor interfaces based on API schema
export interface ApiDoctor {
  userId: string;
  doctorId: string;
  doctorCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorRequest {
  doctorCode: string;
  isActive: boolean;
}

// ✅ Enhanced ApiAppointment interface
export interface ApiAppointment {
  id: string;
  appointment_date: string;
  appointment_type: string;
  status: boolean;
  notes: string;
  userId: string;
  serviceId: string;
  createdAt: string;
  updatedAt: string;
  // ✅ Add doctor field if available in API response
  doctorId?: string;
}

export interface AppointmentStatusData {
  id: string;
  currentStep: number;
  status: string;
  lastUpdated: string;
  completedSteps: string[];
}

export interface ApiTask {
  id: string;
  task_title: string;
  task_description: string;
  task_type: string;
  status: string;
  dueDate: string;
  completedDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  dnaServiceId: string;
  orderDetailId: string;
  medicalRecordId: string;
}

export interface ApiOrder {
  userId: string;
  orderId: string;
  order_code: number;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  payment_date: string;
  transaction_id: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiOrderDetail {
  id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  note: string;
  dnaServiceId: string;
  orderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiService {
  userId: string;
  serviceId: string;
  service_name: string;
  service_description: string;
  service_category: string;
  service_type: string;
  imageUrl: string;
  test_price: number;
  duration_days: number;
  collection_method: number;
  required_legal_document: boolean;
  createdAt: string;
  is_active: boolean;
}

export interface ApiUser {
  id: string;
  username: string;
  password?: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  dob: string;
  roles: Array<{
    name: string;
    description: string;
  }>;
}

// ✅ Enhanced Appointment interface with doctor info
export interface Appointment {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  serviceType: string;
  serviceName: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'DeliveringKit' | 'KitDelivered' | 'SampleReceived' | 'Testing';
  locationType: 'Tại nhà' | 'Cơ sở y tế';
  legalType: 'Pháp Lý' | 'Dân Sự';
  address?: string;
  notes?: string;
  orderId?: string;
  orderDetailId?: string;
  tasks?: ApiTask[];
  // ✅ Add doctor information
  doctor?: {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
  };
  currentStep?: number;
  completedSteps?: string[];
  lastStatusUpdate?: string;
  rawData?: {
    appointment: ApiAppointment;
    order?: ApiOrder;
    orderDetail?: ApiOrderDetail;
    service?: ApiService;
    user?: ApiUser;
    doctor?: ApiDoctor; // ✅ Add doctor to raw data
  };
}

export interface MedicalRecordData {
  record_code: number;
  medical_history: string;
  allergies: string;
  medications: string;
  health_conditions: string;
  emergency_contact_phone: string;
  emergency_contact_name: string;
}

export interface NotificationData {
  title: string;
  message: string;
  type: string;
  is_read: boolean;
}

// ===================== SERVICE CLASS =====================

export class StaffAppointmentService {
  
  // Status persistence utilities (keep existing)
  static STORAGE_KEY_PREFIX = 'appointment_status_';
  
  static saveAppointmentStatus(appointmentId: string, status: string, step: number): void {
    try {
      const statusData: AppointmentStatusData = {
        id: appointmentId,
        currentStep: step,
        status: status,
        lastUpdated: new Date().toISOString(),
        completedSteps: this.getCompletedSteps(step)
      };
      
      localStorage.setItem(
        `${this.STORAGE_KEY_PREFIX}${appointmentId}`, 
        JSON.stringify(statusData)
      );
      
      console.log(`💾 Saved appointment status: ${appointmentId} -> ${status} (step ${step})`);
    } catch (error) {
      console.warn('Failed to save appointment status to localStorage:', error);
    }
  }
  
  static loadAppointmentStatus(appointmentId: string): AppointmentStatusData | null {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}${appointmentId}`);
      if (stored) {
        const statusData = JSON.parse(stored) as AppointmentStatusData;
        console.log(`📖 Loaded appointment status: ${appointmentId} -> ${statusData.status} (step ${statusData.currentStep})`);
        return statusData;
      }
    } catch (error) {
      console.warn('Failed to load appointment status from localStorage:', error);
    }
    return null;
  }
  
  static clearAppointmentStatus(appointmentId: string): void {
    try {
      localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${appointmentId}`);
      console.log(`🗑️ Cleared stored status for appointment: ${appointmentId}`);
    } catch (error) {
      console.warn('Failed to clear appointment status:', error);
    }
  }
  
  static getCompletedSteps(currentStep: number): string[] {
    const steps = [
      'booking', 'confirmed', 'kit_delivered', 'sample_received', 'testing', 'completed'
    ];
    return steps.slice(0, currentStep);
  }
  
  static getStepFromStatus(status: string): number {
    const statusStepMap: Record<string, number> = {
      'Pending': 1,
      'Confirmed': 2,
      'DeliveringKit': 2,
      'KitDelivered': 3,
      'SampleReceived': 4,
      'Testing': 5,
      'Completed': 6,
      'Cancelled': 0
    };
    return statusStepMap[status] || 1;
  }

  // ✅ NEW: Doctor-related methods
  static async getAllDoctors(): Promise<ApiDoctor[]> {
    try {
      console.log("👨‍⚕️ Fetching all doctors...");
      
      const response = await apiClient.get<ApiResponse<ApiDoctor[]>>("/doctors");
      
      if (response.data.code === 200) {
        console.log("✅ Fetched doctors:", response.data.result.length);
        return response.data.result;
      } else {
        console.warn("⚠️ Failed to fetch doctors:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching doctors:", error);
      return [];
    }
  }

  static async getDoctorById(doctorId: string): Promise<ApiDoctor | null> {
    try {
      console.log(`👨‍⚕️ Fetching doctor ${doctorId}...`);
      
      const response = await apiClient.get<ApiResponse<ApiDoctor>>(`/doctors/${doctorId}`);
      
      if (response.data.code === 200) {
        console.log("✅ Fetched doctor:", response.data.result);
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to fetch doctor ${doctorId}:`, error);
      return null;
    }
  }

  static async createDoctor(doctorData: DoctorRequest): Promise<ApiDoctor | null> {
    try {
      console.log("👨‍⚕️ Creating new doctor...");
      
      const response = await apiClient.post<ApiResponse<ApiDoctor>>("/doctors", doctorData);
      
      if (response.data.code === 200) {
        console.log("✅ Doctor created successfully");
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error creating doctor:", error);
      return null;
    }
  }

  static async updateDoctor(doctorId: string, doctorData: DoctorRequest): Promise<boolean> {
    try {
      console.log(`👨‍⚕️ Updating doctor ${doctorId}...`);
      
      const response = await apiClient.put(`/doctors/${doctorId}`, doctorData);
      
      if (response.data.code === 200) {
        console.log("✅ Doctor updated successfully");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("❌ Error updating doctor:", error);
      return false;
    }
  }

  // ✅ Enhanced getAllAppointments with doctor info
  static async getAllAppointments(): Promise<Appointment[]> {
    try {
      console.log("📅 Fetching all appointments with doctor info...");

      const appointmentsResponse = await apiClient.get<ApiResponse<ApiAppointment[]>>("/appointment/all");
      
      if (appointmentsResponse.data.code !== 200) {
        throw new Error(`Failed to fetch appointments: ${appointmentsResponse.data.message}`);
      }

      const appointments = appointmentsResponse.data.result;
      console.log("✅ Fetched appointments:", appointments.length);

      // ✅ Fetch all doctors once for better performance
      const doctors = await this.getAllDoctors();
      const doctorMap = new Map(doctors.map(doctor => [doctor.doctorId, doctor]));

      const enrichedAppointments = await Promise.all(
        appointments.map(async (appointment) => {
          try {
            const enrichedAppointment = await this.enrichAppointmentDataWithDoctor(appointment, doctorMap);
            
            // Restore status from localStorage if available
            const storedStatus = this.loadAppointmentStatus(appointment.id);
            if (storedStatus) {
              enrichedAppointment.status = storedStatus.status as Appointment['status'];
              enrichedAppointment.currentStep = storedStatus.currentStep;
              enrichedAppointment.completedSteps = storedStatus.completedSteps;
              enrichedAppointment.lastStatusUpdate = storedStatus.lastUpdated;
              
              console.log(`🔄 Restored status for ${appointment.id}: ${storedStatus.status}`);
            }
            
            return enrichedAppointment;
          } catch (error) {
            console.error(`Error processing appointment ${appointment.id}:`, error);
            return this.createBasicAppointment(appointment);
          }
        })
      );

      const validAppointments = enrichedAppointments.filter(Boolean) as Appointment[];
      
      console.log("✅ Successfully processed appointments with doctor info:", validAppointments.length);
      return validAppointments;

    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to fetch appointments");
    }
  }

  // ✅ Enhanced enrichment method with doctor info
  static async enrichAppointmentDataWithDoctor(
    appointment: ApiAppointment, 
    doctorMap: Map<string, ApiDoctor>
  ): Promise<Appointment> {
    try {
      // Get user data
      const user = await this.getUserById(appointment.userId);
      
      // Get service data  
      const service = await this.getServiceById(appointment.serviceId);

      // ✅ Get doctor data if available
      let doctor: ApiDoctor | undefined;
      if (appointment.doctorId) {
        doctor = doctorMap.get(appointment.doctorId);
        if (!doctor) {
          // Fallback: try to fetch doctor individually
          doctor = await this.getDoctorById(appointment.doctorId) || undefined;
        }
      } else if (service && service.collection_method === 2) {
        // ✅ For facility-based services, try to assign a doctor
        // This might need business logic to assign available doctors
        const availableDoctors = Array.from(doctorMap.values()).filter(d => d.isActive);
        if (availableDoctors.length > 0) {
          // Simple assignment: could be enhanced with scheduling logic
          doctor = availableDoctors[0];
        }
      }

      // Try to get related order/task data (optional)
      let order: ApiOrder | undefined;
      let orderDetail: ApiOrderDetail | undefined;
      let tasks: ApiTask[] = [];

      try {
        const ordersResponse = await apiClient.get<ApiResponse<ApiOrder[]>>("/orders");
        if (ordersResponse.data.code === 200) {
          order = ordersResponse.data.result.find(o => o.userId === appointment.userId);
          
          if (order) {
            const orderDetailsResponse = await apiClient.get<ApiResponse<ApiOrderDetail[]>>(
              `/order-details/${order.orderId}/all`
            );
            if (orderDetailsResponse.data.code === 200) {
              orderDetail = orderDetailsResponse.data.result[0];
              
              if (orderDetail) {
                const tasksResponse = await apiClient.get<ApiResponse<ApiTask[]>>(
                  `/tasks/order-detail/${orderDetail.id}`
                );
                if (tasksResponse.data.code === 200) {
                  tasks = tasksResponse.data.result;
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Could not fetch order/task data for appointment ${appointment.id}:`, error);
      }

      return this.mapToFrontendAppointmentWithDoctor(appointment, user, service, doctor, order, orderDetail, tasks);

    } catch (error) {
      console.error(`Error enriching appointment ${appointment.id}:`, error);
      throw error;
    }
  }

  // ✅ Enhanced mapping method with doctor info
  static mapToFrontendAppointmentWithDoctor(
    appointment: ApiAppointment,
    user: ApiUser | null,
    service: ApiService | null,
    doctor: ApiDoctor | undefined,
    order?: ApiOrder,
    orderDetail?: ApiOrderDetail,
    tasks: ApiTask[] = []
  ): Appointment {
    
    const appointmentDate = new Date(appointment.appointment_date);
    const status = this.mapAppointmentStatus(appointment.status, tasks);
    
    // ✅ Create doctor info object
    let doctorInfo: Appointment['doctor'] | undefined;
    if (doctor && user) {
      // Get doctor's user info for full name
      this.getUserById(doctor.userId).then(doctorUser => {
        if (doctorUser) {
          doctorInfo = {
            id: doctor.doctorId,
            code: doctor.doctorCode,
            name: doctorUser.full_name || doctorUser.username || 'Unknown Doctor',
            isActive: doctor.isActive
          };
        }
      }).catch(() => {
        // Fallback if can't get doctor user info
        doctorInfo = {
          id: doctor.doctorId,
          code: doctor.doctorCode,
          name: `Doctor ${doctor.doctorCode}`,
          isActive: doctor.isActive
        };
      });
    }
    
    return {
      id: appointment.id,
      customerName: user?.full_name || user?.username || 'N/A',
      phone: user?.phone || 'N/A',
      email: user?.email || 'N/A',
      date: appointmentDate.toISOString().split('T')[0],
      time: appointmentDate.toTimeString().split(' ')[0].substring(0, 5),
      serviceType: service?.service_category || appointment.appointment_type,
      serviceName: service?.service_name || appointment.appointment_type,
      status: status,
      locationType: this.mapLocationType(service?.collection_method || 0),
      legalType: this.mapLegalType(service?.required_legal_document || false),
      address: user?.address,
      notes: appointment.notes || '',
      orderId: order?.orderId,
      orderDetailId: orderDetail?.id,
      tasks: tasks,
      doctor: doctorInfo, // ✅ Add doctor info
      currentStep: this.getStepFromStatus(status),
      completedSteps: this.getCompletedSteps(this.getStepFromStatus(status)),
      lastStatusUpdate: appointment.updatedAt,
      rawData: {
        appointment,
        order,
        orderDetail,
        service: service || undefined,
        user: user || undefined,
        doctor: doctor // ✅ Add doctor to raw data
      }
    };
  }

  // ✅ Keep all existing methods unchanged...
  static async getUserById(userId: string): Promise<ApiUser | null> {
    try {
      const response = await apiClient.get<ApiResponse<ApiUser>>(`/user/${userId}`);
      return response.data.code === 200 ? response.data.result : null;
    } catch (error) {
      console.warn(`Failed to fetch user ${userId}:`, error);
      return null;
    }
  }

  static async getServiceById(serviceId: string): Promise<ApiService | null> {
    try {
      const response = await apiClient.get<ApiResponse<ApiService>>(`/service/${serviceId}`);
      return response.data.code === 200 ? response.data.result : null;
    } catch (error) {
      console.warn(`Failed to fetch service ${serviceId}:`, error);
      return null;
    }
  }

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

  static mapAppointmentStatus(apiStatus: boolean, tasks: ApiTask[]): Appointment['status'] {
    if (!apiStatus) return 'Cancelled';
    
    if (!tasks || tasks.length === 0) {
      return apiStatus ? 'Confirmed' : 'Pending';
    }
    
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
    const totalTasks = tasks.length;
    
    if (completedTasks === 0) return 'Confirmed';
    if (completedTasks === totalTasks) return 'Completed';
    
    const sampleTask = tasks.find(task => task.task_type === 'SAMPLE_COLLECTION');
    const testingTask = tasks.find(task => task.task_type === 'TESTING');
    
    if (sampleTask?.status === 'COMPLETED' && testingTask?.status !== 'COMPLETED') {
      return 'SampleReceived';
    }
    
    if (testingTask?.status === 'IN_PROGRESS') {
      return 'Testing';
    }
    
    return 'Confirmed';
  }

  static mapLocationType(collectionMethod: number): 'Tại nhà' | 'Cơ sở y tế' {
    return collectionMethod === 1 ? 'Tại nhà' : 'Cơ sở y tế';
  }

  static mapLegalType(requiredLegalDocument: boolean): 'Pháp Lý' | 'Dân Sự' {
    return requiredLegalDocument ? 'Pháp Lý' : 'Dân Sự';
  }

  // ✅ Keep all other existing methods...
  static async updateAppointmentStatusWithPersistence(
    appointmentId: string, 
    newStatus: Appointment['status'],
    notes?: string
  ): Promise<boolean> {
    try {
      console.log(`🔄 Updating appointment ${appointmentId}: ${newStatus}`);
      
      const success = await this.updateAppointmentStatus(
        appointmentId, 
        newStatus !== 'Cancelled', 
        notes
      );
      
      if (success) {
        const step = this.getStepFromStatus(newStatus);
        this.saveAppointmentStatus(appointmentId, newStatus, step);
        
        console.log(`✅ Successfully updated and persisted status: ${appointmentId} -> ${newStatus}`);
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error("❌ Error updating appointment status with persistence:", error);
      return false;
    }
  }

  static async confirmAppointment(appointmentId: string): Promise<boolean> {
    try {
      console.log(`✅ Confirming appointment ${appointmentId}...`);

      const response = await apiClient.put(`/appointment/${appointmentId}`, {
        status: true,
        notes: "Appointment confirmed by staff"
      });

      if (response.data.code === 200) {
        this.saveAppointmentStatus(appointmentId, 'Confirmed', 2);
        console.log("✅ Appointment confirmed and status saved");
        return true;
      } else {
        console.error("❌ Failed to confirm appointment:", response.data.message);
        return false;
      }

    } catch (error) {
      console.error("❌ Error confirming appointment:", error);
      return false;
    }
  }

  static async cancelAppointment(appointmentId: string, reason?: string): Promise<boolean> {
    try {
      console.log(`❌ Cancelling appointment ${appointmentId}...`);

      const response = await apiClient.put(`/appointment/${appointmentId}`, {
        status: false,
        notes: reason || "Appointment cancelled by staff"
      });

      if (response.data.code === 200) {
        this.saveAppointmentStatus(appointmentId, 'Cancelled', 0);
        console.log("✅ Appointment cancelled and status saved");
        return true;
      } else {
        console.error("❌ Failed to cancel appointment:", response.data.message);
        return false;
      }

    } catch (error) {
      console.error("❌ Error cancelling appointment:", error);
      return false;
    }
  }

  static async completeAppointment(
    appointment: Appointment, 
    medicalData: MedicalRecordData,
    notificationMessage: string
  ): Promise<boolean> {
    try {
      console.log(`🎯 Completing appointment ${appointment.id}...`);

      const response = await apiClient.put(`/appointment/${appointment.id}`, {
        status: true,
        notes: "Appointment completed with test results"
      });

      if (response.data.code !== 200) {
        throw new Error('Failed to update appointment status');
      }

      if (appointment.tasks && appointment.tasks.length > 0) {
        const taskUpdates = appointment.tasks.map(task => 
          this.updateTaskStatus(task.id, 'COMPLETED', 'Completed by staff')
        );
        await Promise.all(taskUpdates);
      }

      await this.createMedicalRecord(medicalData);

      if (appointment.rawData?.user?.id) {
        await this.sendNotification(appointment.rawData.user.id, {
          title: "Kết quả xét nghiệm đã sẵn sàng",
          message: notificationMessage,
          type: "RESULT_READY",
          is_read: false
        });
      }

      this.saveAppointmentStatus(appointment.id, 'Completed', 6);

      console.log("✅ Appointment completed successfully and status persisted");
      return true;

    } catch (error) {
      console.error("❌ Error completing appointment:", error);
      return false;
    }
  }

  static async updateTaskStatus(taskId: string, status: string, notes?: string): Promise<boolean> {
    try {
      console.log(`📝 Updating task ${taskId} to status: ${status}`);

      const response = await apiClient.put(`/tasks/${taskId}`, {
        status: status,
        notes: notes || '',
        completedDate: status === 'COMPLETED' ? new Date().toISOString() : null
      });

      if (response.data.code === 200) {
        console.log("✅ Task updated successfully");
        return true;
      } else {
        console.error("❌ Failed to update task:", response.data.message);
        return false;
      }

    } catch (error) {
      console.error("❌ Error updating task:", error);
      return false;
    }
  }

  static async createMedicalRecord(data: MedicalRecordData): Promise<boolean> {
    try {
      console.log("🏥 Creating medical record...");

      const response = await apiClient.post<ApiResponse<any>>("/medical-records", data);

      if (response.data.code === 200) {
        console.log("✅ Medical record created successfully");
        return true;
      } else {
        console.error("❌ Failed to create medical record:", response.data.message);
        return false;
      }

    } catch (error) {
      console.error("❌ Error creating medical record:", error);
      return false;
    }
  }

  static async sendNotification(userId: string, data: NotificationData): Promise<boolean> {
    try {
      console.log(`🔔 Sending notification to user ${userId}...`);

      const response = await apiClient.post<ApiResponse<any>>("/notifications", {
        ...data,
        userId: userId
      });

      if (response.data.code === 200) {
        console.log("✅ Notification sent successfully");
        return true;
      } else {
        console.error("❌ Failed to send notification:", response.data.message);
        return false;
      }

    } catch (error) {
      console.error("❌ Error sending notification:", error);
      return false;
    }
  }

  static async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    try {
      console.log(`🔍 Fetching appointment ${appointmentId}...`);

      const response = await apiClient.get<ApiResponse<ApiAppointment>>(`/appointment/${appointmentId}`);
      
      if (response.data.code === 200) {
        const apiAppointment = response.data.result;
        
        // Get doctors for enrichment
        const doctors = await this.getAllDoctors();
        const doctorMap = new Map(doctors.map(doctor => [doctor.doctorId, doctor]));
        
        const enrichedAppointment = await this.enrichAppointmentDataWithDoctor(apiAppointment, doctorMap);
        
        const storedStatus = this.loadAppointmentStatus(appointmentId);
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

  static async updateAppointmentStatus(appointmentId: string, status: boolean, notes?: string): Promise<boolean> {
    try {
      console.log(`🔄 Updating appointment ${appointmentId} status to: ${status}`);

      const response = await apiClient.put(`/appointment/${appointmentId}`, {
        status: status,
        notes: notes || ''
      });

      if (response.data.code === 200) {
        console.log("✅ Appointment status updated successfully");
        return true;
      } else {
        console.error("❌ Failed to update appointment status:", response.data.message);
        return false;
      }

    } catch (error) {
      console.error("❌ Error updating appointment status:", error);
      return false;
    }
  }
}

export default StaffAppointmentService;