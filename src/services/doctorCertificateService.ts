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
    console.log(`📜 Certificate API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
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
    console.log(`✅ Certificate API Response: ${response.status} ${response.statusText}`);
    console.log("📥 Response data:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ Certificate API Response error:", error);
    
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

export interface DoctorCertificate {
  id: string;
  certificateName: string;
  licenseNumber: string;
  issuedBy: string;
  issueDate: string;
  expiryDate: string;
  doctorId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CertificateRequest {
  certificateName: string;
  licenseNumber: string;
  issuedBy: string;
  issueDate: string;
  expiryDate: string;
  doctorId: string;
}

// API Response interface
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export const doctorCertificateService = {
  // Get all certificates
  getAllCertificates: async (): Promise<{ success: boolean; data?: DoctorCertificate[]; message: string }> => {
    try {
      console.log("📜 Fetching all certificates...");
      
      const response = await apiClient.get<ApiResponse<DoctorCertificate[]>>("/certificates");
      
      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: "Lấy danh sách chứng chỉ thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy danh sách chứng chỉ",
        };
      }
    } catch (error: any) {
      console.error("❌ Get all certificates error:", error);
      return handleApiError(error);
    }
  },

  // Get certificates by doctor ID
  getCertificatesByDoctorId: async (doctorId: string): Promise<{ success: boolean; data?: DoctorCertificate[]; message: string }> => {
    try {
      console.log(`📜 Fetching certificates for doctor ID: ${doctorId}...`);
      
      const response = await apiClient.get<ApiResponse<DoctorCertificate[]>>(`/certificates/doctor/${doctorId}`);
      
      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: "Lấy danh sách chứng chỉ thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy danh sách chứng chỉ",
        };
      }
    } catch (error: any) {
      console.error("❌ Get certificates by doctor ID error:", error);
      return handleApiError(error);
    }
  },

  // Get certificate by ID
  getCertificateById: async (certificateId: string): Promise<{ success: boolean; data?: DoctorCertificate; message: string }> => {
    try {
      console.log(`📜 Fetching certificate with ID: ${certificateId}...`);
      
      const response = await apiClient.get<ApiResponse<DoctorCertificate>>(`/certificates/${certificateId}`);
      
      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: "Lấy thông tin chứng chỉ thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy thông tin chứng chỉ",
        };
      }
    } catch (error: any) {
      console.error("❌ Get certificate by ID error:", error);
      return handleApiError(error);
    }
  },

  // Create new certificate
  createCertificate: async (certificateData: CertificateRequest): Promise<{ success: boolean; data?: DoctorCertificate; message: string }> => {
    try {
      console.log("➕ Creating new certificate...");
      console.log("📤 Data being sent:", certificateData);

      // Validate required fields
      if (!certificateData.certificateName?.trim()) {
        return { success: false, message: "Tên chứng chỉ không được để trống" };
      }
      if (!certificateData.licenseNumber?.trim()) {
        return { success: false, message: "Số giấy phép không được để trống" };
      }
      if (!certificateData.issuedBy?.trim()) {
        return { success: false, message: "Nơi cấp không được để trống" };
      }
      if (!certificateData.issueDate) {
        return { success: false, message: "Ngày cấp không được để trống" };
      }
      if (!certificateData.expiryDate) {
        return { success: false, message: "Ngày hết hạn không được để trống" };
      }
      if (!certificateData.doctorId?.trim()) {
        return { success: false, message: "ID bác sĩ không được để trống" };
      }

      // Validate dates
      const issueDate = new Date(certificateData.issueDate);
      const expiryDate = new Date(certificateData.expiryDate);
      
      if (expiryDate <= issueDate) {
        return { success: false, message: "Ngày hết hạn phải sau ngày cấp" };
      }
      
      const response = await apiClient.post<ApiResponse<DoctorCertificate>>("/certificates", certificateData);
      
      if (response.data.code === 200 || response.data.code === 201) {
        return {
          success: true,
          data: response.data.result,
          message: "Tạo chứng chỉ thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể tạo chứng chỉ",
        };
      }
    } catch (error: any) {
      console.error("❌ Create certificate error:", error);
      return handleApiError(error);
    }
  },

  // Update certificate
  updateCertificate: async (certificateId: string, certificateData: Partial<CertificateRequest>): Promise<{ success: boolean; data?: DoctorCertificate; message: string }> => {
    try {
      console.log(`📝 Updating certificate with ID: ${certificateId}...`);
      console.log("📤 Data being sent:", certificateData);
      
      // Validate inputs
      if (!certificateId || certificateId.trim() === '') {
        return {
          success: false,
          message: "ID chứng chỉ không hợp lệ"
        };
      }

      // Validate dates if both are provided
      if (certificateData.issueDate && certificateData.expiryDate) {
        const issueDate = new Date(certificateData.issueDate);
        const expiryDate = new Date(certificateData.expiryDate);
        
        if (expiryDate <= issueDate) {
          return { success: false, message: "Ngày hết hạn phải sau ngày cấp" };
        }
      }
      
      const response = await apiClient.put<ApiResponse<DoctorCertificate>>(`/certificates/${certificateId}`, certificateData);
      
      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: "Cập nhật chứng chỉ thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể cập nhật chứng chỉ",
        };
      }
    } catch (error: any) {
      console.error("❌ Update certificate error:", error);
      return handleApiError(error);
    }
  },

  // Delete certificate
  deleteCertificate: async (certificateId: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log(`🗑️ Deleting certificate with ID: ${certificateId}...`);
      
      if (!certificateId || certificateId.trim() === '') {
        return {
          success: false,
          message: "ID chứng chỉ không hợp lệ"
        };
      }
      
      const response = await apiClient.delete<ApiResponse<any>>(`/certificates/${certificateId}`);
      
      if (response.data.code === 200) {
        return {
          success: true,
          message: "Xóa chứng chỉ thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể xóa chứng chỉ",
        };
      }
    } catch (error: any) {
      console.error("❌ Delete certificate error:", error);
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
        return { success: false, message: "Không tìm thấy chứng chỉ" };
      case 409:
        return { success: false, message: "Số giấy phép đã tồn tại" };
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

export default doctorCertificateService;