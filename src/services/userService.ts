// userService.ts - Fixed version
import axios from "axios";

const API_BASE_URL = "https://dna-service-se1857.onrender.com/dna_service";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 User API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('📤 Request data:', config.data);
    
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
    console.log(`✅ User API Response: ${response.status} ${response.statusText}`);
    console.log('📥 Response data:', response.data);
    return response;
  },
  (error) => {
    console.error("❌ User API Response error:", error);
    
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

// Role interface
export interface Role {
  name: string;
  description: string;
}

// User interface matching API response
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  dob: string; // date format
  roles: Role[];
  
  // Additional fields for frontend compatibility
  fullName?: string;
  phone?: string;
  address?: string;
  role?: 'customer' | 'staff' | 'admin';
  createdAt?: Date;
  doctor_id?: number | null;
}

// User creation request interface
export interface UserCreationRequest {
  username: string;
  password: string;
  email: string;
  full_name: string;
  dob: string;
}

// User update request interface - FIXED to match API exactly
export interface UserUpdateRequest {
  username?: string;
  password?: string;
  email?: string;
  full_name?: string;
  dob?: string;
  roles?: string[]; // Array of role names like ["ROLE_ADMIN"]
}

// API Response interface
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// HELPER: Transform user role from API to frontend format
function transformApiRoleToFrontend(apiRoles: Role[]): 'customer' | 'staff' | 'admin' {
  const roleName = apiRoles?.[0]?.name || 'ROLE_USER';
  switch (roleName) {
    case 'ROLE_ADMIN':
      return 'admin';
    case 'ROLE_STAFF':
      return 'staff';
    case 'ROLE_USER':
    default:
      return 'customer';
  }
}

// HELPER: Transform user data from API to frontend format
function transformApiUserToFrontend(apiUser: any): User {
  return {
    ...apiUser,
    fullName: apiUser.full_name,
    role: transformApiRoleToFrontend(apiUser.roles),
    createdAt: new Date(),
    phone: '',
    address: '',
    doctor_id: null,
  };
}

// User Service
export const userService = {
  // Get all users
  getAllUsers: async (): Promise<{ success: boolean; data?: User[]; message: string }> => {
    try {
      console.log("👥 Fetching all users...");
      
      const response = await apiClient.get<ApiResponse<User[]>>("/user");
      
      if (response.data.code === 200) {
        const transformedData = response.data.result.map(transformApiUserToFrontend);

        return {
          success: true,
          data: transformedData,
          message: "Lấy danh sách người dùng thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy danh sách người dùng",
        };
      }
    } catch (error: any) {
      console.error("❌ Get all users error:", error);
      return handleApiError(error);
    }
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<{ success: boolean; data?: User; message: string }> => {
    try {
      console.log(`👤 Fetching user with ID: ${userId}...`);
      
      const response = await apiClient.get<ApiResponse<User>>(`/user/${userId}`);
      
      if (response.data.code === 200) {
        const transformedData = transformApiUserToFrontend(response.data.result);

        return {
          success: true,
          data: transformedData,
          message: "Lấy thông tin người dùng thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy thông tin người dùng",
        };
      }
    } catch (error: any) {
      console.error("❌ Get user by ID error:", error);
      return handleApiError(error);
    }
  },

  // Get user profile (current user)
  getUserProfile: async (): Promise<{ success: boolean; data?: User; message: string }> => {
    try {
      console.log("👤 Fetching user profile...");
      
      const response = await apiClient.get<ApiResponse<User>>("/user/profile");
      
      if (response.data.code === 200) {
        const transformedData = transformApiUserToFrontend(response.data.result);

        return {
          success: true,
          data: transformedData,
          message: "Lấy thông tin profile thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy thông tin profile",
        };
      }
    } catch (error: any) {
      console.error("❌ Get user profile error:", error);
      return handleApiError(error);
    }
  },

  // Create new user
  createUser: async (userData: UserCreationRequest): Promise<{ success: boolean; data?: User; message: string }> => {
    try {
      console.log("➕ Creating new user...");
      
      const response = await apiClient.post<ApiResponse<User>>("/user/register", userData);
      
      if (response.data.code === 200 || response.data.code === 201) {
        const transformedData = transformApiUserToFrontend(response.data.result);

        return {
          success: true,
          data: transformedData,
          message: "Tạo người dùng thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể tạo người dùng",
        };
      }
    } catch (error: any) {
      console.error("❌ Create user error:", error);
      return handleApiError(error);
    }
  },

  // Create staff user
  createStaffUser: async (userData: UserCreationRequest): Promise<{ success: boolean; data?: User; message: string }> => {
    try {
      console.log("➕ Creating new staff user...");
      
      const response = await apiClient.post<ApiResponse<User>>("/user/register/staff", userData);
      
      if (response.data.code === 200 || response.data.code === 201) {
        const transformedData = transformApiUserToFrontend(response.data.result);

        return {
          success: true,
          data: transformedData,
          message: "Tạo nhân viên thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể tạo nhân viên",
        };
      }
    } catch (error: any) {
      console.error("❌ Create staff user error:", error);
      return handleApiError(error);
    }
  },

  // Update user - FIXED VERSION
  updateUser: async (userId: string, userData: UserUpdateRequest): Promise<{ success: boolean; data?: User; message: string }> => {
    try {
      console.log(`📝 Updating user with ID: ${userId}...`);
      console.log('🔍 Original update data:', JSON.stringify(userData, null, 2));
      
      // Validate token first
      const token = localStorage.getItem("token");
      if (!token) {
        console.error('❌ No token found!');
        return {
          success: false,
          message: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"
        };
      }
      
      console.log('🔑 Token exists:', token.substring(0, 20) + '...');
      
      // Validate input data
      if (!userData || Object.keys(userData).length === 0) {
        return {
          success: false,
          message: "Không có dữ liệu để cập nhật"
        };
      }
      
      // Validate userId
      if (!userId || userId.trim() === '') {
        return {
          success: false,
          message: "ID người dùng không hợp lệ"
        };
      }
      
      // Prepare API request data - only send fields that have values
      const apiData: UserUpdateRequest = {};
      
      if (userData.username && userData.username.trim()) {
        apiData.username = userData.username.trim();
      }
      
      if (userData.email && userData.email.trim()) {
        apiData.email = userData.email.trim();
      }
      
      if (userData.full_name && userData.full_name.trim()) {
        apiData.full_name = userData.full_name.trim();
      }
      
      if (userData.dob && userData.dob.trim()) {
        // Ensure date format is correct (YYYY-MM-DD)
        const dateValue = userData.dob.trim();
        if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
          apiData.dob = dateValue;
        } else {
          console.warn('⚠️ Invalid date format, skipping dob update');
        }
      }
      
      if (userData.roles && userData.roles.length > 0) {
        apiData.roles = userData.roles;
      }
      
      // Don't send password unless specifically provided
      if (userData.password && userData.password.trim()) {
        apiData.password = userData.password.trim();
      }
      
      console.log('📤 Final API data being sent:', JSON.stringify(apiData, null, 2));
      
      // Make the API call
      const response = await apiClient.put<ApiResponse<User>>(`/user/${userId}`, apiData);
      
      console.log('✅ Update response status:', response.status);
      console.log('📥 Update response data:', JSON.stringify(response.data, null, 2));
      
      // Check response
      if (response.data.code === 200) {
        const transformedData = transformApiUserToFrontend(response.data.result);
        console.log('✅ Transformed user data:', transformedData);

        return {
          success: true,
          data: transformedData,
          message: response.data.message || "Cập nhật người dùng thành công",
        };
      } else {
        console.error('❌ API returned error code:', response.data.code);
        return {
          success: false,
          message: response.data.message || "Không thể cập nhật người dùng",
        };
      }
    } catch (error: any) {
      console.error("❌ Update user error:", error);
      
      if (error.response) {
        console.error("📥 Error response status:", error.response.status);
        console.error("📥 Error response data:", JSON.stringify(error.response.data, null, 2));
        console.error("📤 Failed request config:", {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          headers: {
            ...error.config?.headers,
            Authorization: error.config?.headers?.Authorization ? 'Bearer [HIDDEN]' : 'Missing'
          }
        });
        
        const status = error.response.status;
        const apiMessage = error.response.data?.message || error.response.statusText;
        
        switch (status) {
          case 400:
            return { 
              success: false, 
              message: `Dữ liệu không hợp lệ: ${apiMessage}` 
            };
          case 401:
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return { 
              success: false, 
              message: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại" 
            };
          case 403:
            return { 
              success: false, 
              message: "Bạn không có quyền cập nhật thông tin người dùng này" 
            };
          case 404:
            return { 
              success: false, 
              message: "Không tìm thấy người dùng" 
            };
          case 500:
            return { 
              success: false, 
              message: "Lỗi server, vui lòng thử lại sau" 
            };
          default:
            return { 
              success: false, 
              message: `Lỗi ${status}: ${apiMessage}` 
            };
        }
      } else if (error.request) {
        console.error("📡 Network error - no response received");
        return { 
          success: false, 
          message: "Không thể kết nối đến server, vui lòng kiểm tra kết nối mạng" 
        };
      } else {
        console.error("⚙️ Request setup error:", error.message);
        return { 
          success: false, 
          message: `Có lỗi xảy ra: ${error.message}` 
        };
      }
    }
  },

  // Delete user
  deleteUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log(`🗑️ Deleting user with ID: ${userId}...`);
      
      const response = await apiClient.delete<ApiResponse<string>>(`/user/${userId}`);
      
      if (response.data.code === 200) {
        return {
          success: true,
          message: response.data.message || "Xóa người dùng thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể xóa người dùng",
        };
      }
    } catch (error: any) {
      console.error("❌ Delete user error:", error);
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
        return { success: false, message: "Không tìm thấy người dùng" };
      case 409:
        return { success: false, message: "Tên đăng nhập hoặc email đã tồn tại" };
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

export default userService;