// medicalRecordService.ts
import axios from "axios";

const API_BASE_URL = "https://dna-service-se1857.onrender.com/dna_service";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `🏥 Medical API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    console.log("📤 Request data:", config.data);

    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Token attached:", token.substring(0, 20) + "...");
    } else {
      console.warn("⚠️ No token found in localStorage");
    }

    return config;
  },
  (error) => {
    console.error("❌ Medical API Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `✅ Medical API Response: ${response.status} ${response.statusText}`
    );
    console.log("📥 Response data:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ Medical API Response error:", error);

    // Handle token expiration
    if (error.response?.status === 401) {
      console.warn("🔒 Token expired, redirecting to login");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Medical Record interfaces
export interface MedicalRecord {
  id: string;
  record_code: number;
  medical_history: string;
  allergies: string;
  medications: string;
  health_conditions: string;
  emergency_contact_phone: string;
  emergency_contact_name: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface MedicalRecordRequest {
  record_code?: number;
  medical_history: string;
  allergies: string;
  medications: string;
  health_conditions: string;
  emergency_contact_phone: string;
  emergency_contact_name: string;
}

// API Response interface
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// Medical Record Service
export const medicalRecordService = {
  // Get my medical records (current user)
  getMyMedicalRecords: async (): Promise<{
    success: boolean;
    data?: MedicalRecord[];
    message: string;
  }> => {
    try {
      console.log("🏥 Fetching my medical records...");

      const response = await apiClient.get<ApiResponse<MedicalRecord[]>>(
        "/medical-records/my"
      );

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: "Lấy danh sách hồ sơ y tế thành công",
        };
      } else {
        return {
          success: false,
          message:
            response.data.message || "Không thể lấy danh sách hồ sơ y tế",
        };
      }
    } catch (error: any) {
      console.error("❌ Get my medical records error:", error);
      return handleApiError(error);
    }
  },

  // Get all medical records (for staff/admin)
  getAllMedicalRecords: async (): Promise<{
    success: boolean;
    data?: MedicalRecord[];
    message: string;
  }> => {
    try {
      console.log("🏥 Fetching all medical records...");

      const response = await apiClient.get<ApiResponse<MedicalRecord[]>>(
        "/medical-records"
      );

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: "Lấy danh sách hồ sơ y tế thành công",
        };
      } else {
        return {
          success: false,
          message:
            response.data.message || "Không thể lấy danh sách hồ sơ y tế",
        };
      }
    } catch (error: any) {
      console.error("❌ Get all medical records error:", error);
      return handleApiError(error);
    }
  },

  // Get medical record by ID
  getMedicalRecordById: async (
    id: string
  ): Promise<{ success: boolean; data?: MedicalRecord; message: string }> => {
    try {
      console.log(`🏥 Fetching medical record with ID: ${id}...`);

      const response = await apiClient.get<ApiResponse<MedicalRecord>>(
        `/medical-records/${id}`
      );

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: "Lấy thông tin hồ sơ y tế thành công",
        };
      } else {
        return {
          success: false,
          message:
            response.data.message || "Không thể lấy thông tin hồ sơ y tế",
        };
      }
    } catch (error: any) {
      console.error("❌ Get medical record by ID error:", error);
      return handleApiError(error);
    }
  },

  // Create new medical record
  createMedicalRecord: async (
    data: MedicalRecordRequest
  ): Promise<{ success: boolean; data?: MedicalRecord; message: string }> => {
    try {
      console.log("➕ Creating new medical record...");
      console.log("📤 Request data:", data);

      const response = await apiClient.post<ApiResponse<MedicalRecord>>(
        "/medical-records",
        data
      );

      if (response.data.code === 200 || response.data.code === 201) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || "Tạo hồ sơ y tế thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể tạo hồ sơ y tế",
        };
      }
    } catch (error: any) {
      console.error("❌ Create medical record error:", error);
      return handleApiError(error);
    }
  },

  // Update medical record
  updateMedicalRecord: async (
    id: string,
    data: MedicalRecordRequest
  ): Promise<{ success: boolean; data?: MedicalRecord; message: string }> => {
    try {
      console.log(`📝 Updating medical record with ID: ${id}...`);
      console.log("📤 Request data:", data);

      const response = await apiClient.put<ApiResponse<MedicalRecord>>(
        `/medical-records/${id}`,
        data
      );

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || "Cập nhật hồ sơ y tế thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể cập nhật hồ sơ y tế",
        };
      }
    } catch (error: any) {
      console.error("❌ Update medical record error:", error);
      return handleApiError(error);
    }
  },

  // Delete medical record
  deleteMedicalRecord: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      console.log(`🗑️ Deleting medical record with ID: ${id}...`);

      const response = await apiClient.delete<ApiResponse<void>>(
        `/medical-records/${id}`
      );

      if (response.data.code === 200) {
        return {
          success: true,
          message: response.data.message || "Xóa hồ sơ y tế thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể xóa hồ sơ y tế",
        };
      }
    } catch (error: any) {
      console.error("❌ Delete medical record error:", error);
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
        return {
          success: false,
          message: "Bạn cần đăng nhập để thực hiện thao tác này",
        };
      case 403:
        return {
          success: false,
          message: "Bạn không có quyền thực hiện thao tác này",
        };
      case 404:
        return { success: false, message: "Không tìm thấy hồ sơ y tế" };
      case 409:
        return { success: false, message: "Hồ sơ y tế đã tồn tại" };
      case 500:
        return { success: false, message: "Lỗi server, vui lòng thử lại sau" };
      default:
        return { success: false, message: `Lỗi ${status}: ${message}` };
    }
  } else if (error.request) {
    return {
      success: false,
      message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
    };
  } else {
    return { success: false, message: `Có lỗi xảy ra: ${error.message}` };
  }
}

export default medicalRecordService;
