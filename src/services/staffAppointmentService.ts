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
      localStorage.removeUser("user");
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

// ✅ Updated ApiAppointment interface to match new API structure
export interface ApiAppointment {
  id: string;
  appointment_date: string; // ISO date string
  appointment_type: string;
  status: boolean; // ✅ Changed from string to boolean
  notes: string;
  userId: string;
  serviceId: string;
  createdAt: string;
  updatedAt: string;
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
  phone?: string; // ✅ Added phone field
  address?: string; // ✅ Added address field
  dob: string;
  roles: Array<{
    name: string;
    description: string;
  }>;
}

// Frontend compatible appointment interface
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
  orderId?: string; // ✅ Made optional since it might not always exist
  orderDetailId?: string; // ✅ Made optional since it might not always exist
  tasks?: ApiTask[]; // ✅ Made optional since tasks might not exist for all appointments
  rawData?: { // ✅ Made optional
    appointment: ApiAppointment;
    order?: ApiOrder;
    orderDetail?: ApiOrderDetail;
    service?: ApiService;
    user?: ApiUser;
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
  
  // ✅ Updated to handle new API structure with simpler approach
  static async getAllAppointments(): Promise<Appointment[]> {
    try {
      console.log("📅 Fetching all appointments...");

      // 1. Lấy appointments với API mới
      const appointmentsResponse = await apiClient.get<ApiResponse<ApiAppointment[]>>("/appointment");
      
      if (appointmentsResponse.data.code !== 200) {
        throw new Error(`Failed to fetch appointments: ${appointmentsResponse.data.message}`);
      }

      const appointments = appointmentsResponse.data.result;
      console.log("✅ Fetched appointments:", appointments.length);

      // 2. Process each appointment với error handling tốt hơn
      const enrichedAppointments = await Promise.all(
        appointments.map(async (appointment) => {
          try {
            return await this.enrichAppointmentData(appointment);
          } catch (error) {
            console.error(`Error processing appointment ${appointment.id}:`, error);
            // Return basic appointment data even if enrichment fails
            return this.createBasicAppointment(appointment);
          }
        })
      );

      // Filter out null values
      const validAppointments = enrichedAppointments.filter(Boolean) as Appointment[];
      
      console.log("✅ Successfully processed appointments:", validAppointments.length);
      return validAppointments;

    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to fetch appointments");
    }
  }

  // ✅ New method to enrich appointment data
  static async enrichAppointmentData(appointment: ApiAppointment): Promise<Appointment> {
    try {
      // Get user data
      const user = await this.getUserById(appointment.userId);
      
      // Get service data  
      const service = await this.getServiceById(appointment.serviceId);

      // Try to get related order/task data (optional)
      let order: ApiOrder | undefined;
      let orderDetail: ApiOrderDetail | undefined;
      let tasks: ApiTask[] = [];

      try {
        // This part is optional and may fail
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

      // Map to frontend format
      return this.mapToFrontendAppointment(appointment, user, service, order, orderDetail, tasks);

    } catch (error) {
      console.error(`Error enriching appointment ${appointment.id}:`, error);
      throw error;
    }
  }

  // ✅ Helper method to get user by ID
  static async getUserById(userId: string): Promise<ApiUser | null> {
    try {
      const response = await apiClient.get<ApiResponse<ApiUser>>(`/user/${userId}`);
      return response.data.code === 200 ? response.data.result : null;
    } catch (error) {
      console.warn(`Failed to fetch user ${userId}:`, error);
      return null;
    }
  }

  // ✅ Helper method to get service by ID
  static async getServiceById(serviceId: string): Promise<ApiService | null> {
    try {
      const response = await apiClient.get<ApiResponse<ApiService>>(`/service/${serviceId}`);
      return response.data.code === 200 ? response.data.result : null;
    } catch (error) {
      console.warn(`Failed to fetch service ${serviceId}:`, error);
      return null;
    }
  }

  // ✅ Create basic appointment when full data is not available
  static createBasicAppointment(appointment: ApiAppointment): Appointment {
    const appointmentDate = new Date(appointment.appointment_date);
    
    return {
      id: appointment.id,
      customerName: 'Loading...', // Will be updated when user data loads
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

  // ✅ Updated mapping method with better null handling
  static mapToFrontendAppointment(
    appointment: ApiAppointment,
    user: ApiUser | null,
    service: ApiService | null,
    order?: ApiOrder,
    orderDetail?: ApiOrderDetail,
    tasks: ApiTask[] = []
  ): Appointment {
    
    const appointmentDate = new Date(appointment.appointment_date);
    
    return {
      id: appointment.id,
      customerName: user?.full_name || user?.username || 'N/A',
      phone: user?.phone || 'N/A',
      email: user?.email || 'N/A',
      date: appointmentDate.toISOString().split('T')[0], // YYYY-MM-DD
      time: appointmentDate.toTimeString().split(' ')[0].substring(0, 5), // HH:MM
      serviceType: service?.service_category || appointment.appointment_type,
      serviceName: service?.service_name || appointment.appointment_type,
      status: this.mapAppointmentStatus(appointment.status, tasks),
      locationType: this.mapLocationType(service?.collection_method || 0),
      legalType: this.mapLegalType(service?.required_legal_document || false),
      address: user?.address,
      notes: appointment.notes || '',
      orderId: order?.orderId,
      orderDetailId: orderDetail?.id,
      tasks: tasks,
      rawData: {
        appointment,
        order,
        orderDetail,
        service: service || undefined,
        user: user || undefined
      }
    };
  }

  // ✅ Updated status mapping for boolean status
  static mapAppointmentStatus(apiStatus: boolean, tasks: ApiTask[]): Appointment['status'] {
    if (!apiStatus) return 'Cancelled';
    
    // If no tasks, determine status based on appointment status
    if (!tasks || tasks.length === 0) {
      return apiStatus ? 'Confirmed' : 'Pending';
    }
    
    // Dựa vào tasks để xác định status chi tiết
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
    const totalTasks = tasks.length;
    
    if (completedTasks === 0) return 'Confirmed';
    if (completedTasks === totalTasks) return 'Completed';
    
    // Dựa vào task type để xác định trạng thái cụ thể
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

  // ✅ Updated location type mapping
  static mapLocationType(collectionMethod: number): 'Tại nhà' | 'Cơ sở y tế' {
    // Assuming: 1 = at home, 2 = at facility (adjust based on your API)
    return collectionMethod === 1 ? 'Tại nhà' : 'Cơ sở y tế';
  }

  // ✅ Keep existing legal type mapping
  static mapLegalType(requiredLegalDocument: boolean): 'Pháp Lý' | 'Dân Sự' {
    return requiredLegalDocument ? 'Pháp Lý' : 'Dân Sự';
  }

  // ✅ Updated appointment confirmation
  static async confirmAppointment(appointmentId: string): Promise<boolean> {
    try {
      console.log(`✅ Confirming appointment ${appointmentId}...`);

      const response = await apiClient.put(`/appointment/${appointmentId}`, {
        status: true, // Set to confirmed
        notes: "Appointment confirmed by staff"
      });

      if (response.data.code === 200) {
        console.log("✅ Appointment confirmed successfully");
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

  // ✅ Updated appointment cancellation
  static async cancelAppointment(appointmentId: string, reason?: string): Promise<boolean> {
    try {
      console.log(`❌ Cancelling appointment ${appointmentId}...`);

      const response = await apiClient.put(`/appointment/${appointmentId}`, {
        status: false, // Set to cancelled
        notes: reason || "Appointment cancelled by staff"
      });

      if (response.data.code === 200) {
        console.log("✅ Appointment cancelled successfully");
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

  // ✅ Keep existing task update method
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

  // ✅ Keep existing medical record creation
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

  // ✅ Keep existing notification sending
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

  // ✅ Keep existing complete appointment workflow
  static async completeAppointment(
    appointment: Appointment, 
    medicalData: MedicalRecordData,
    notificationMessage: string
  ): Promise<boolean> {
    try {
      console.log(`🎯 Completing appointment ${appointment.id}...`);

      // 1. Update appointment status to completed
      await this.confirmAppointment(appointment.id);

      // 2. Complete all tasks if they exist
      if (appointment.tasks && appointment.tasks.length > 0) {
        const taskUpdates = appointment.tasks.map(task => 
          this.updateTaskStatus(task.id, 'COMPLETED', 'Completed by staff')
        );
        await Promise.all(taskUpdates);
      }

      // 3. Create medical record
      await this.createMedicalRecord(medicalData);

      // 4. Send notification if user data exists
      if (appointment.rawData?.user?.id) {
        await this.sendNotification(appointment.rawData.user.id, {
          title: "Kết quả xét nghiệm đã sẵn sàng",
          message: notificationMessage,
          type: "RESULT_READY",
          is_read: false
        });
      }

      console.log("✅ Appointment completed successfully");
      return true;

    } catch (error) {
      console.error("❌ Error completing appointment:", error);
      return false;
    }
  }

  // ✅ Keep existing get appointment by ID
  static async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    try {
      console.log(`🔍 Fetching appointment ${appointmentId}...`);

      const response = await apiClient.get<ApiResponse<ApiAppointment>>(`/appointment/${appointmentId}`);
      
      if (response.data.code === 200) {
        const apiAppointment = response.data.result;
        return await this.enrichAppointmentData(apiAppointment);
      }

      return null;

    } catch (error) {
      console.error("❌ Error fetching appointment by ID:", error);
      return null;
    }
  }

  // ✅ New method to update appointment status generically
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