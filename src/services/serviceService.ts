import axios from "axios";

// Base URL cho API
const API_BASE_URL = "https://dna-service-se1857.onrender.com/dna_service";

// Axios instance với config chung
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor để thêm token nếu cần
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor để handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Interface cho Service data từ API - Match exact backend fields
export interface ApiService {
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  serviceType: string;
  serviceDescription: string; // Backend field name
  imageUrl?: string;
  testPrice: number;
  durationDays: number;
  collectionMethod: number;
  requiredLegalDocument: boolean;
  createdAt: string;
  active: boolean;
}

// Interface cho Service data frontend
export interface Service {
  id: string;
  service_name: string;
  test_category: string;
  service_type: string;
  description: string;
  price: number;
  duration_days: number;
  collection_methods: string;
  requires_legal_documents: boolean;
  icon: string;
  features: string[];
  detailed_description?: string;
  process_steps?: string[];
  sample_types?: string[];
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

// Interface cho API Response
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// Service class
export class ServiceService {
  // Lấy tất cả services
  static async getAllServices(): Promise<ApiService[]> {
    try {
      console.log("Fetching services from:", `${API_BASE_URL}/service/all`);
      const response = await apiClient.get<ApiResponse<ApiService[]>>(
        "/service/all"
      );
      console.log("API Response:", response.data);

      if (response.data.code === 200 && response.data.result) {
        return response.data.result;
      } else {
        console.warn("Unexpected API response:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      throw error;
    }
  }

  // Lấy service theo ID
  static async getServiceById(serviceId: string): Promise<ApiService> {
    try {
      console.log("Fetching service by ID:", serviceId);
      const response = await apiClient.get<ApiResponse<ApiService>>(
        `/service/${serviceId}`
      );
      console.log("Service detail response:", response.data);

      if (response.data.code === 200 && response.data.result) {
        return response.data.result;
      } else {
        throw new Error(`Service not found: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error fetching service by ID:", error);
      throw error;
    }
  }

  // Lấy services theo userId (nếu cần)
  static async getServicesByUserId(userId: string): Promise<ApiService[]> {
    try {
      const response = await apiClient.get<ApiResponse<ApiService[]>>(
        `/service/${userId}/all`
      );

      if (response.data.code === 200 && response.data.result) {
        return response.data.result;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching services by user ID:", error);
      throw error;
    }
  }

  // Tạo service mới (cho admin)
  static async createService(
    serviceData: Partial<ApiService>
  ): Promise<ApiService> {
    try {
      const response = await apiClient.post<ApiResponse<ApiService>>(
        "/service",
        serviceData
      );
      return response.data.result;
    } catch (error) {
      console.error("Error creating service:", error);
      throw error;
    }
  }

  // Cập nhật service (cho admin)
  static async updateService(
    serviceId: string,
    serviceData: Partial<ApiService>
  ): Promise<ApiService> {
    try {
      const response = await apiClient.put<ApiResponse<ApiService>>(
        `/service/${serviceId}`,
        serviceData
      );
      return response.data.result;
    } catch (error) {
      console.error("Error updating service:", error);
      throw error;
    }
  }

  // Xóa service (cho admin)
  static async deleteService(serviceId: string): Promise<void> {
    try {
      await apiClient.delete(`/service/${serviceId}`);
    } catch (error) {
      console.error("Error deleting service:", error);
      throw error;
    }
  }
}

// Helper functions để format data
export const formatPrice = (price: number | undefined | null): string => {
  console.log("formatPrice input:", price, typeof price);

  if (price === undefined || price === null || isNaN(Number(price))) {
    console.log("Price is invalid, returning fallback");
    return "Liên hệ";
  }

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price));

  return formattedPrice;
};

export const getCategoryName = (category: string | undefined): string => {
  if (!category) return "Chưa phân loại";

  const names: { [key: string]: string } = {
    "Cơ bản": "Cơ bản",
    paternity: "Cha con",
    maternity: "Mẹ con",
    sibling: "Anh chị em",
    ancestry: "Huyết thống",
  };
  return names[category] || category;
};

export const getServiceTypeName = (type: string | undefined): string => {
  if (!type) return "Chưa xác định";

  const types: { [key: string]: string } = {
    civil: "Dân sự",
    administrative: "Pháp lý",
  };
  return types[type] || type;
};

// Helper function để map icon theo category
const getIconByCategory = (category: string | undefined): string => {
  if (!category) return "microscope";

  const iconMap: { [key: string]: string } = {
    "Cơ bản": "microscope",
    paternity: "microscope",
    maternity: "flaskConical",
    sibling: "dna",
    ancestry: "treePine",
    administrative: "scale",
    legal: "fileCheck",
  };
  return iconMap[category] || "microscope";
};

// Map API data to frontend format - FIX SNAKE_CASE
export const mapApiServiceToFrontend = (apiService: any): Service => {
  console.log("=== MAPPING FUNCTION ===");
  console.log("Raw API service:", apiService);

  if (!apiService) {
    throw new Error("API service data is null or undefined");
  }

  // Backend sử dụng snake_case, không phải camelCase
  console.log("service_name:", apiService.service_name);
  console.log("service_category:", apiService.service_category);
  console.log("service_type:", apiService.service_type);
  console.log("service_description:", apiService.service_description);
  console.log(
    "test_price:",
    apiService.test_price,
    typeof apiService.test_price
  );
  console.log(
    "duration_days:",
    apiService.duration_days,
    typeof apiService.duration_days
  );
  console.log("collection_method:", apiService.collection_method);
  console.log("required_legal_document:", apiService.required_legal_document);

  const mapped: Service = {
    id: apiService.serviceId || apiService.service_id || apiService.id,
    service_name: apiService.service_name || "Chưa có tên",
    test_category: apiService.service_category || "Chưa phân loại",
    service_type: apiService.service_type || "Chưa xác định",
    description: apiService.service_description || "Dịch vụ xét nghiệm DNA",
    price: apiService.test_price || apiService.testPrice || 0,
    duration_days: apiService.duration_days || apiService.durationDays || 7,
    collection_methods:
      apiService.collection_method === 1 || apiService.collectionMethod === 1
        ? "self_collect,facility_collect"
        : "facility_collect",
    requires_legal_documents:
      apiService.required_legal_document ||
      apiService.requiredLegalDocument ||
      false,
    icon: getIconByCategory(
      apiService.service_category || apiService.serviceCategory
    ),
    features: [
      "Độ chính xác cao",
      `Kết quả trong ${
        apiService.duration_days || apiService.durationDays || 7
      } ngày`,
      "Tư vấn miễn phí",
      "Bảo mật thông tin",
    ],
    detailed_description:
      apiService.service_description ||
      apiService.serviceDescription ||
      "Dịch vụ xét nghiệm DNA chuyên nghiệp với độ chính xác cao.",
    process_steps: [
      "Tư vấn và đăng ký dịch vụ",
      "Lấy mẫu DNA",
      "Vận chuyển mẫu về phòng lab",
      "Phân tích DNA tại phòng lab",
      "Kiểm tra và xác nhận kết quả",
      "Gửi báo cáo kết quả cho khách hàng",
    ],
    sample_types: ["Nước bọt", "Máu"],
    faq: [
      {
        question: "Độ chính xác của xét nghiệm như thế nào?",
        answer:
          "Độ chính xác lên đến 99.99% cho kết quả loại trừ và 99.9999% cho kết quả xác nhận.",
      },
      {
        question: `Thời gian có kết quả là bao lâu?`,
        answer: `Thường trong vòng ${
          apiService.duration_days || apiService.durationDays || 7
        } ngày làm việc kể từ khi mẫu được nhận tại phòng lab.`,
      },
    ],
  };
  return mapped;
};

export default ServiceService;
