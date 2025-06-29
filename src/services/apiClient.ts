// services/apiClient.ts
import axios from "axios";

const API_BASE_URL = "https://dna-service-se1857.onrender.com/dna_service";

// ✅ Simple development check without env
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Create axios instance with optimized settings
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // ✅ Reduced from 15s to 10s
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // ✅ Only log in development
    if (isDevelopment) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

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
    // ✅ Only log in development
    if (isDevelopment) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error("❌ API Response error:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;