import axios from "axios";

const API_BASE_URL = "https://dna-service-se1857.onrender.com/dna_service";

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
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    console.log("📤 Request data:", config.data);
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
    console.log(`✅ API Response: ${response.status} ${response.statusText}`);
    console.log("📥 Response data:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ Response error:", error);
    if (error.response) {
      console.error("Error status:", error.response.status);
      console.error("Error data:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, password: string) => {
    try {
      console.log("🔐 Attempting login for username:", username);

      const response = await apiClient.post("/auth/login", {
        username,
        password,
      });

      // Check response structure
      if (response.data.code === 200 && response.data.result?.authenticated) {
        return {
          success: true,
          data: response.data,
          message: "Đăng nhập thành công",
        };
      } else {
        return {
          success: false,
          message:
            response.data.message || "Thông tin đăng nhập không chính xác",
        };
      }
    } catch (error: any) {
      console.error("❌ Login error:", error);

      if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message || error.response.statusText;

        switch (status) {
          case 401:
            return {
              success: false,
              message: "Tên đăng nhập hoặc mật khẩu không chính xác",
            };
          case 403:
            return {
              success: false,
              message: "Tài khoản của bạn đã bị khóa",
            };
          case 500:
            return {
              success: false,
              message: "Lỗi server, vui lòng thử lại sau",
            };
          default:
            return {
              success: false,
              message: `Lỗi ${status}: ${message}`,
            };
        }
      } else if (error.request) {
        return {
          success: false,
          message:
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        };
      } else {
        return {
          success: false,
          message: "Có lỗi xảy ra: " + error.message,
        };
      }
    }
  },

  // ✅ Thêm getUserProfile method
  getUserProfile: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await apiClient.get("/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy thông tin profile",
        };
      }
    } catch (error: any) {
      console.error("❌ Get profile error:", error);
      return {
        success: false,
        message: "Lỗi khi lấy thông tin profile",
      };
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: (): string | null => {
    return localStorage.getItem("token");
  },
};

export default authService;
