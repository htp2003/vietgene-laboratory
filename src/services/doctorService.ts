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
    console.log(`🩺 Doctor API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
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
    console.log(`✅ Doctor API Response: ${response.status} ${response.statusText}`);
    console.log("📥 Response data:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ Doctor API Response error:", error);
    
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

// Doctor interface matching API response exactly
export interface Doctor {
  userId: string;
  doctorId: string;
  doctorCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Doctor request interface for create/update
export interface DoctorRequest {
  doctorCode: string;
  isActive: boolean;
}

// API Response interface
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// Doctor Service
export const doctorService = {
  // Get all doctors
  getAllDoctors: async (): Promise<{ success: boolean; data?: Doctor[]; message: string }> => {
    try {
      console.log("👩‍⚕️ Fetching all doctors...");
      
      const response = await apiClient.get<ApiResponse<Doctor[]>>("/doctors");
      
      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: "Lấy danh sách bác sĩ thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy danh sách bác sĩ",
        };
      }
    } catch (error: any) {
      console.error("❌ Get all doctors error:", error);
      return handleApiError(error);
    }
  },

  // Get doctor by ID
  getDoctorById: async (doctorId: string): Promise<{ success: boolean; data?: Doctor; message: string }> => {
    try {
      console.log(`👨‍⚕️ Fetching doctor with ID: ${doctorId}...`);
      
      const response = await apiClient.get<ApiResponse<Doctor>>(`/doctors/${doctorId}`);
      
      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: "Lấy thông tin bác sĩ thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy thông tin bác sĩ",
        };
      }
    } catch (error: any) {
      console.error("❌ Get doctor by ID error:", error);
      return handleApiError(error);
    }
  },

  // Create new doctor
  createDoctor: async (doctorData: DoctorRequest): Promise<{ success: boolean; data?: Doctor; message: string }> => {
    try {
      console.log("➕ Creating new doctor...");
      console.log("📤 Data being sent:", doctorData);
      
      const response = await apiClient.post<ApiResponse<Doctor>>("/doctors", doctorData);
      
      if (response.data.code === 200 || response.data.code === 201) {
        return {
          success: true,
          data: response.data.result,
          message: "Tạo bác sĩ thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể tạo bác sĩ",
        };
      }
    } catch (error: any) {
      console.error("❌ Create doctor error:", error);
      return handleApiError(error);
    }
  },

  // Update doctor
  updateDoctor: async (doctorId: string, doctorData: DoctorRequest): Promise<{ success: boolean; data?: Doctor; message: string }> => {
    try {
      console.log(`📝 Updating doctor with ID: ${doctorId}...`);
      console.log("📤 Data being sent:", doctorData);
      
      // Validate inputs
      if (!doctorId || doctorId.trim() === '') {
        return {
          success: false,
          message: "ID bác sĩ không hợp lệ"
        };
      }

      if (!doctorData || !doctorData.doctorCode?.trim()) {
        return {
          success: false,
          message: "Mã bác sĩ không được để trống"
        };
      }
      
      const response = await apiClient.put<ApiResponse<Doctor>>(`/doctors/${doctorId}`, doctorData);
      
      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: "Cập nhật bác sĩ thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể cập nhật bác sĩ",
        };
      }
    } catch (error: any) {
      console.error("❌ Update doctor error:", error);
      return handleApiError(error);
    }
  },

  // Delete doctor
  deleteDoctor: async (doctorId: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log(`🗑️ Deleting doctor with ID: ${doctorId}...`);
      
      if (!doctorId || doctorId.trim() === '') {
        return {
          success: false,
          message: "ID bác sĩ không hợp lệ"
        };
      }
      
      const response = await apiClient.delete<ApiResponse<any>>(`/doctors/${doctorId}`);
      
      if (response.data.code === 200) {
        return {
          success: true,
          message: "Xóa bác sĩ thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể xóa bác sĩ",
        };
      }
    } catch (error: any) {
      console.error("❌ Delete doctor error:", error);
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
        return { success: false, message: "Không tìm thấy bác sĩ" };
      case 409:
        return { success: false, message: "Mã bác sĩ đã tồn tại" };
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

export default doctorService;