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
      `🚀 News API Request: ${config.method?.toUpperCase()} ${config.url}`
    );

    // Add auth token if available
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
      `✅ News API Response: ${response.status} ${response.statusText}`
    );
    console.log("📥 Response data:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ News API Response error:", error);
    return Promise.reject(error);
  }
);

export interface NewsArticle {
  id: string; // ✅ API trả về string ID
  title: string;
  content: string;
  userId?: string; // ✅ API field
  imageUrl?: string; // ✅ API field (thay vì featured_image)
  createdAt: string; // ✅ API field (thay vì created_at)
  updatedAt?: string; // ✅ API field
  // ✅ Optional fields for compatibility
  author?: {
    full_name: string;
    avatar?: string;
  };
  status?: "draft" | "published"; // ✅ Simplified status (removed pending)
  view_count?: number;
  featured_image?: string; // Alias for imageUrl
  created_at?: string; // Alias for createdAt
  excerpt?: string;
  reading_time?: number;
  is_featured?: boolean;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export const newsService = {
  // ✅ Get all news articles
  getAllNews: async () => {
    try {
      console.log("📰 Fetching all news articles...");

      const response = await apiClient.get<ApiResponse<NewsArticle[]>>(
        "/status"
      );

      if (response.data.code === 200) {
        // ✅ Transform API data to match frontend expectations
        const transformedData = response.data.result.map((item: any) => ({
          ...item,
          // ✅ Map API fields to expected fields
          featured_image: item.imageUrl,
          created_at: item.createdAt,
          updated_at: item.updatedAt,
          status: "published", // ✅ Default status since API doesn't provide status
          view_count: Math.floor(Math.random() * 1000), // ✅ Mock view count
          author: {
            full_name: "VietGene Lab",
          },
          excerpt: item.content?.substring(0, 150) + "...",
          reading_time: Math.ceil(item.content?.length / 1000) || 5,
          is_featured: Math.random() > 0.7, // ✅ Random featured status
        }));

        return {
          success: true,
          data: transformedData,
          message: "Lấy danh sách tin tức thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy danh sách tin tức",
        };
      }
    } catch (error: any) {
      console.error("❌ Get all news error:", error);

      if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message || error.response.statusText;

        switch (status) {
          case 404:
            return {
              success: false,
              message: "Không tìm thấy tin tức",
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
          message: "Không thể kết nối đến server",
        };
      } else {
        return {
          success: false,
          message: "Có lỗi xảy ra: " + error.message,
        };
      }
    }
  },

  // ✅ Get single news article by ID
  getNewsById: async (postId: number | string) => {
    try {
      console.log(`📰 Fetching news article with ID: ${postId}...`);

      const response = await apiClient.get<ApiResponse<NewsArticle>>(
        `/status/${postId}`
      );

      if (response.data.code === 200) {
        // ✅ Transform single article data
        const item = response.data.result;
        const transformedData = {
          ...item,
          featured_image: item.imageUrl,
          created_at: item.createdAt,
          updated_at: item.updatedAt,
          status: "published" as const,
          view_count: Math.floor(Math.random() * 1000),
          author: {
            full_name: "VietGene Lab",
          },
          excerpt: item.content?.substring(0, 150) + "...",
          reading_time: Math.ceil(item.content?.length / 1000) || 5,
          is_featured: Math.random() > 0.7,
        };

        return {
          success: true,
          data: transformedData,
          message: "Lấy bài viết thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy bài viết",
        };
      }
    } catch (error: any) {
      console.error("❌ Get news by ID error:", error);

      if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message || error.response.statusText;

        switch (status) {
          case 404:
            return {
              success: false,
              message: "Không tìm thấy bài viết",
            };
          case 403:
            return {
              success: false,
              message: "Bạn không có quyền xem bài viết này",
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
          message: "Không thể kết nối đến server",
        };
      } else {
        return {
          success: false,
          message: "Có lỗi xảy ra: " + error.message,
        };
      }
    }
  },

  // ✅ Create new news article (for admin)
  createNews: async (newsData: Partial<NewsArticle>) => {
    try {
      console.log("📝 Creating new news article...");
      console.log("📤 Data being sent:", newsData);

      const response = await apiClient.post<ApiResponse<NewsArticle>>(
        "/status",
        newsData
      );

      if (response.data.code === 200 || response.data.code === 201) {
        // Transform the response data
        const item = response.data.result;
        const transformedData = {
          ...item,
          featured_image: item.imageUrl,
          created_at: item.createdAt,
          updated_at: item.updatedAt,
          status: "draft" as const, // ✅ New posts start as draft
          view_count: 0,
          author: {
            full_name: "VietGene Lab",
          },
          excerpt: item.content?.substring(0, 150) + "...",
          reading_time: Math.ceil(item.content?.length / 1000) || 5,
          is_featured: false,
        };

        return {
          success: true,
          data: transformedData,
          message: "Tạo bài viết thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể tạo bài viết",
        };
      }
    } catch (error: any) {
      console.error("❌ Create news error:", error);
      return {
        success: false,
        message: "Có lỗi xảy ra khi tạo bài viết",
      };
    }
  },

  // ✅ Update news article (for admin)
  updateNews: async (
    postId: number | string,
    newsData: Partial<NewsArticle>
  ) => {
    try {
      console.log(`📝 Updating news article with ID: ${postId}...`);
      console.log("📤 Original data received:", newsData);

      // ✅ Only send fields that API accepts
      const apiData = {
        title: newsData.title,
        content: newsData.content,
        imageUrl: newsData.imageUrl
      };

      // Remove undefined values
      Object.keys(apiData).forEach(key => {
        if (apiData[key as keyof typeof apiData] === undefined) {
          delete apiData[key as keyof typeof apiData];
        }
      });

      console.log("📤 Clean API data being sent:", apiData);

      const response = await apiClient.put<ApiResponse<NewsArticle>>(
        `/status/${postId}`,
        apiData
      );

      if (response.data.code === 200) {
        // Transform the response data
        const item = response.data.result;
        const transformedData = {
          ...item,
          featured_image: item.imageUrl,
          created_at: item.createdAt,
          updated_at: item.updatedAt,
          status: "published" as const, // ✅ Updated posts are published
          view_count: Math.floor(Math.random() * 1000),
          author: {
            full_name: "VietGene Lab",
          },
          excerpt: item.content?.substring(0, 150) + "...",
          reading_time: Math.ceil(item.content?.length / 1000) || 5,
          is_featured: Math.random() > 0.7,
        };

        return {
          success: true,
          data: transformedData,
          message: "Cập nhật bài viết thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể cập nhật bài viết",
        };
      }
    } catch (error: any) {
      console.error("❌ Update news error:", error);
      return {
        success: false,
        message: "Có lỗi xảy ra khi cập nhật bài viết",
      };
    }
  },

  // ✅ Delete news article (for admin)
  deleteNews: async (postId: number | string) => {
    try {
      console.log(`🗑️ Deleting news article with ID: ${postId}...`);

      const response = await apiClient.delete<ApiResponse<any>>(
        `/status/${postId}`
      );

      if (response.data.code === 200) {
        return {
          success: true,
          message: "Xóa bài viết thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể xóa bài viết",
        };
      }
    } catch (error: any) {
      console.error("❌ Delete news error:", error);
      return {
        success: false,
        message: "Có lỗi xảy ra khi xóa bài viết",
      };
    }
  },
};

export default newsService;