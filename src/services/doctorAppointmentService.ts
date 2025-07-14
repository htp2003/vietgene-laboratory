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
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`📅 Appointment API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token attached:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No token found in localStorage');
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
    console.log(`✅ Appointment API Response: ${response.status} ${response.statusText}`);
    console.log("📥 Response data:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ Appointment API Response error:", error);
    
    // Handle token expiration
    if (error.response?.status === 401) {
      console.warn('🔒 Token expired, redirecting to login');
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export interface Appointment {
  id: string;
  appointment_date: string;
  appointment_type: string;
  status: boolean;
  notes: string;
  userId: string;
  doctor_time_slot: string; 
  createdAt: string;
  updatedAt?: string;
  orderId: string;
}

export interface AppointmentRequest {
  appointment_date: string;
  appointment_type: string;
  status: boolean;
  notes: string;
}

// API Response interface
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export const DoctorAppointmentService = {
  // Get all appointments
  getAllAppointments: async (): Promise<{ success: boolean; data?: Appointment[]; message: string }> => {
    try {
      console.log("📅 Fetching all appointments...");
      
      const response = await apiClient.get<ApiResponse<Appointment[]>>("/appointment/all");
      
      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: "Lấy danh sách lịch hẹn thành công",

};
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy danh sách lịch hẹn",
        };
      }
    } catch (error: any) {
      console.error("❌ Get all appointments error:", error);
      return handleApiError(error);
    }
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId: string): Promise<{ success: boolean; data?: Appointment; message: string }> => {
    try {
      console.log(`📅 Fetching appointment with ID: ${appointmentId}...`);
      
      const response = await apiClient.get<ApiResponse<Appointment>>(`/appointment/${appointmentId}`);
      
      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: "Lấy thông tin lịch hẹn thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy thông tin lịch hẹn",
        };
      }
    } catch (error: any) {
      console.error("❌ Get appointment by ID error:", error);
      return handleApiError(error);
    }
  },





  // Delete appointment
  deleteAppointment: async (appointmentId: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log(`🗑️ Deleting appointment with ID: ${appointmentId}...`);
      
      const response = await apiClient.delete<ApiResponse<any>>(`/appointment/${appointmentId}`);
      
      if (response.data.code === 200) {
        return {
          success: true,
          message: "Xóa lịch hẹn thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể xóa lịch hẹn",
        };
      }
    } catch (error: any) {
      console.error("❌ Delete appointment error:", error);
      return handleApiError(error);
    }
  },

  // Get appointments for a specific doctor (by matching doctor_time_slot)
  getDoctorAppointments: async (doctorId: string): Promise<{ success: boolean; data?: Appointment[]; message: string }> => {
    try {
      console.log(`📅 Fetching appointments for doctor ID: ${doctorId}...`);
      
      // First, get all doctor's time slots to get their IDs
      const timeSlotsResponse = await apiClient.get<ApiResponse<any[]>>(`/doctor-time-slots/doctor/${doctorId}`);
      
      if (!timeSlotsResponse.data || timeSlotsResponse.data.code !== 200) {
        return {
          success: false,
          message: "Không thể lấy danh sách khung giờ của bác sĩ"
        };
      }
      
      const doctorTimeSlots = timeSlotsResponse.data.result || [];
      const timeSlotIds = doctorTimeSlots.map((slot: any) => slot.id);
      
      if (timeSlotIds.length === 0) {
        return {
          success: true,
          data: [],
          message: "Bác sĩ chưa có khung giờ nào"
        };
      }
      
      // Then, get all appointments
      const appointmentsResponse = await DoctorAppointmentService.getAllAppointments();
      
      if (!appointmentsResponse.success || !appointmentsResponse.data) {
        return {
          success: false,
          message: "Không thể lấy danh sách lịch hẹn"
        };
      }
      
      // Filter appointments that belong to doctor's time slots
      const doctorAppointments = appointmentsResponse.data.filter((appointment: Appointment) => 
        timeSlotIds.includes(appointment.doctor_time_slot)
      );
      
      return {
        success: true,
        data: doctorAppointments,
        message: "Lấy danh sách lịch hẹn của bác sĩ thành công"
      };
      
    } catch (error: any) {
      console.error("❌ Get doctor appointments error:", error);
      return handleApiError(error);
    }
  },

  // Get today's appointments for a specific doctor
  getDoctorTodaysAppointments: async (doctorId: string): Promise<{ success: boolean; data?: Appointment[]; message: string }> => {
    try {
      const response = await DoctorAppointmentService.getDoctorAppointments(doctorId);
      
      if (response.success && response.data) {
        const today = new Date().toDateString();
        const todaysAppointments = response.data.filter((appointment: Appointment) => {
          const appointmentDate = new Date(appointment.appointment_date).toDateString();
          return appointmentDate === today;
        });
        
        return {
          success: true,
          data: todaysAppointments,
          message: "Lấy lịch hẹn hôm nay của bác sĩ thành công"
        };
      } else {
        return response;
      }
    } catch (error: any) {
      console.error("❌ Get doctor today's appointments error:", error);
      return handleApiError(error);
    }
  },

  // Get today's appointments
  getTodaysAppointments: async (): Promise<{ success: boolean; data?: Appointment[]; message: string }> => {
    try {
      const response = await DoctorAppointmentService.getAllAppointments();
      
      if (response.success && response.data) {
        const today = new Date().toDateString();
        const todaysAppointments = response.data.filter(appointment => {
          const appointmentDate = new Date(appointment.appointment_date).toDateString();
          return appointmentDate === today;
        });
        
        return {
          success: true,
          data: todaysAppointments,
          message: "Lấy lịch hẹn hôm nay thành công",
        };
      } else {
        return response;
      }
    } catch (error: any) {
      console.error("❌ Get today's appointments error:", error);
      return handleApiError(error);
    }
  },
};

// Error handler helper
function handleApiError(error: any): { success: false; message: string } {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.response.statusText;

    switch (status) {
      case 400:
        return { success: false, message: `Dữ liệu không hợp lệ: ${message}` };
      case 401:
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return { success: false, message: "Bạn cần đăng nhập để thực hiện thao tác này" };
      case 403:
        return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
      case 404:
        return { success: false, message: "Không tìm thấy lịch hẹn" };
      case 500:
        return { success: false, message: "Lỗi server, vui lòng thử lại sau" };
      default:
        return { success: false, message: `Lỗi ${status}: ${message}` };
    }
  } else if (error.request) {
    return { success: false, message: "Không thể kết nối đến server" };
  } else {
    return { success: false, message: `Có lỗi xảy ra: ${error.message}` };
  }
}

export default DoctorAppointmentService;