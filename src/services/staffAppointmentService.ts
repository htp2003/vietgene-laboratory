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
// apiClient.interceptors.response.use(
//   (response) => {
//     console.log(
//       `✅ Staff Appointment API Response: ${response.status} ${response.statusText}`
//     );
//     return response;
//   },
//   (error) => {
//     console.error("❌ Staff Appointment API Response error:", error);
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

// ===================== INTERFACES =====================

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

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
  orderId: string;
  orderDetailId: string;
  tasks: ApiTask[];
  rawData: {
    appointment: ApiAppointment;
    order: ApiOrder;
    orderDetail: ApiOrderDetail;
    service: ApiService;
    user: ApiUser;
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
  
  // ✅ Lấy tất cả appointments với đầy đủ thông tin
  static async getAllAppointments(): Promise<Appointment[]> {
    try {
      console.log("📅 Fetching all appointments...");

      // 1. Lấy appointments
      const appointmentsResponse = await apiClient.get<ApiResponse<ApiAppointment[]>>("/appointment");
      
      if (appointmentsResponse.data.code !== 200) {
        throw new Error(`Failed to fetch appointments: ${appointmentsResponse.data.message}`);
      }

      const appointments = appointmentsResponse.data.result;
      console.log("✅ Fetched appointments:", appointments.length);

      // 2. Lấy orders để map với appointments
      const ordersResponse = await apiClient.get<ApiResponse<ApiOrder[]>>("/orders");
      const orders = ordersResponse.data.code === 200 ? ordersResponse.data.result : [];

      // 3. Xử lý từng appointment
      const enrichedAppointments = await Promise.all(
        appointments.map(async (appointment) => {
          try {
            // Tìm order tương ứng (cần logic mapping phù hợp)
            const relatedOrder = orders.find(order => 
              order.userId === appointment.userId || 
              order.orderId === appointment.serviceId // Tùy logic backend
            );

            if (!relatedOrder) {
              console.warn(`No order found for appointment ${appointment.id}`);
              return null;
            }

            // Lấy order details
            const orderDetailsResponse = await apiClient.get<ApiResponse<ApiOrderDetail[]>>(
              `/order-details/${relatedOrder.orderId}/all`
            );
            const orderDetails = orderDetailsResponse.data.code === 200 ? 
              orderDetailsResponse.data.result : [];

            const orderDetail = orderDetails[0]; // Lấy detail đầu tiên
            if (!orderDetail) {
              console.warn(`No order detail found for order ${relatedOrder.orderId}`);
              return null;
            }

            // Lấy thông tin service
            const serviceResponse = await apiClient.get<ApiResponse<ApiService>>(
              `/service/${orderDetail.dnaServiceId}`
            );
            const service = serviceResponse.data.code === 200 ? 
              serviceResponse.data.result : null;

            // Lấy thông tin user
            const userResponse = await apiClient.get<ApiResponse<ApiUser>>(
              `/user/${appointment.userId}`
            );
            const user = userResponse.data.code === 200 ? 
              userResponse.data.result : null;

            // Lấy tasks cho order detail
            const tasksResponse = await apiClient.get<ApiResponse<ApiTask[]>>(
              `/tasks/order-detail/${orderDetail.id}`
            );
            const tasks = tasksResponse.data.code === 200 ? 
              tasksResponse.data.result : [];

            if (!service || !user) {
              console.warn(`Missing service or user data for appointment ${appointment.id}`);
              return null;
            }

            // Map sang format frontend
            return this.mapToFrontendAppointment(
              appointment, relatedOrder, orderDetail, service, user, tasks
            );

          } catch (error) {
            console.error(`Error processing appointment ${appointment.id}:`, error);
            return null;
          }
        })
      );

      // Filter out null values
      const validAppointments = enrichedAppointments.filter(Boolean) as Appointment[];
      
      console.log("✅ Successfully processed appointments:", validAppointments.length);
      return validAppointments;

    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      throw error;
    }
  }

  // ✅ Map API data sang frontend format
  static mapToFrontendAppointment(
    appointment: ApiAppointment,
    order: ApiOrder,
    orderDetail: ApiOrderDetail,
    service: ApiService,
    user: ApiUser,
    tasks: ApiTask[]
  ): Appointment {
    
    const appointmentDate = new Date(appointment.appointment_date);
    
    return {
      id: appointment.id,
      customerName: user.full_name || 'N/A',
      phone: 'N/A', // Backend chưa có field phone trong user
      email: user.email || 'N/A',
      date: appointmentDate.toISOString().split('T')[0], // YYYY-MM-DD
      time: appointmentDate.toTimeString().split(' ')[0].substring(0, 5), // HH:MM
      serviceType: service.service_category || 'N/A',
      serviceName: service.service_name || 'N/A',
      status: this.mapAppointmentStatus(appointment.status, tasks),
      locationType: this.mapLocationType(appointment.appointment_type),
      legalType: this.mapLegalType(service.required_legal_document),
      address: undefined, // Backend chưa có field address
      notes: appointment.notes || '',
      orderId: order.orderId,
      orderDetailId: orderDetail.id,
      tasks: tasks,
      rawData: {
        appointment,
        order,
        orderDetail,
        service,
        user
      }
    };
  }

  // ✅ Map appointment status từ API
  static mapAppointmentStatus(apiStatus: boolean, tasks: ApiTask[]): Appointment['status'] {
    if (!apiStatus) return 'Cancelled';
    
    // Dựa vào tasks để xác định status
    if (tasks.length === 0) return 'Pending';
    
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

  // ✅ Map location type
  static mapLocationType(appointmentType: string): 'Tại nhà' | 'Cơ sở y tế' {
    return appointmentType?.toLowerCase().includes('home') || 
           appointmentType?.toLowerCase().includes('nhà') ? 'Tại nhà' : 'Cơ sở y tế';
  }

  // ✅ Map legal type
  static mapLegalType(requiredLegalDocument: boolean): 'Pháp Lý' | 'Dân Sự' {
    return requiredLegalDocument ? 'Pháp Lý' : 'Dân Sự';
  }

  // ✅ Cập nhật task status
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

  // ✅ Tạo medical record với kết quả xét nghiệm
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

  // ✅ Gửi notification cho user
  static async sendNotification(userId: string, data: NotificationData): Promise<boolean> {
    try {
      console.log(`🔔 Sending notification to user ${userId}...`);

      const response = await apiClient.post<ApiResponse<any>>("/notifications", {
        ...data,
        userId: userId // Có thể cần thêm userId vào request body
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

  // ✅ Complete appointment workflow
  static async completeAppointment(
    appointment: Appointment, 
    medicalData: MedicalRecordData,
    notificationMessage: string
  ): Promise<boolean> {
    try {
      console.log(`🎯 Completing appointment ${appointment.id}...`);

      // 1. Hoàn thành tất cả tasks
      const taskUpdates = appointment.tasks.map(task => 
        this.updateTaskStatus(task.id, 'COMPLETED', 'Completed by staff')
      );
      await Promise.all(taskUpdates);

      // 2. Tạo medical record
      await this.createMedicalRecord(medicalData);

      // 3. Gửi notification
      await this.sendNotification(appointment.rawData.user.id, {
        title: "Kết quả xét nghiệm đã sẵn sàng",
        message: notificationMessage,
        type: "RESULT_READY",
        is_read: false
      });

      console.log("✅ Appointment completed successfully");
      return true;

    } catch (error) {
      console.error("❌ Error completing appointment:", error);
      return false;
    }
  }

  // ✅ Get appointment by ID with full details
  static async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    try {
      console.log(`🔍 Fetching appointment ${appointmentId}...`);

      const appointments = await this.getAllAppointments();
      const appointment = appointments.find(a => a.id === appointmentId);

      return appointment || null;

    } catch (error) {
      console.error("❌ Error fetching appointment by ID:", error);
      return null;
    }
  }
}

export default StaffAppointmentService;