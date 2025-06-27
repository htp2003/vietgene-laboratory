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
    console.log(`🔔 Notification API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Notification request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Notification API Response: ${response.status} ${response.statusText}`);
    return response;
  },
  (error) => {
    console.error("❌ Notification API Response error:", error);
    return Promise.reject(error);
  }
);

// Notification interface matching API
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

// API Response interface
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// Notification Service
export const notificationService = {
  // Get all notifications for current user
  getAllNotifications: async (): Promise<{ success: boolean; data?: Notification[]; message: string }> => {
    try {
      console.log("🔔 Fetching all notifications...");
      
      const response = await apiClient.get<ApiResponse<Notification[]>>("/notifications");
      
      if (response.data.code === 200) {
        // Transform and sort notifications
        const transformedData = response.data.result
          .map((notification: any) => ({
            ...notification,
            createdAt: notification.createdAt || new Date().toISOString(),
          }))
          .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

        return {
          success: true,
          data: transformedData,
          message: "Lấy danh sách thông báo thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy danh sách thông báo",
        };
      }
    } catch (error: any) {
      console.error("❌ Get all notifications error:", error);
      return handleApiError(error);
    }
  },

  // Get single notification by ID
  getNotificationById: async (notificationId: string): Promise<{ success: boolean; data?: Notification; message: string }> => {
    try {
      console.log(`🔔 Fetching notification with ID: ${notificationId}...`);
      
      const response = await apiClient.get<ApiResponse<Notification>>(`/notifications/${notificationId}`);
      
      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: "Lấy thông báo thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy thông báo",
        };
      }
    } catch (error: any) {
      console.error("❌ Get notification by ID error:", error);
      return handleApiError(error);
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<{ success: boolean; data?: Notification; message: string }> => {
    try {
      console.log(`✅ Marking notification as read: ${notificationId}...`);
      
      const response = await apiClient.put<ApiResponse<Notification>>(`/notifications/${notificationId}`, {
        is_read: true
      });
      
      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: "Đánh dấu đã đọc thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể đánh dấu đã đọc",
        };
      }
    } catch (error: any) {
      console.error("❌ Mark as read error:", error);
      return handleApiError(error);
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
    try {
      console.log("✅ Marking all notifications as read...");
      
      // Get all unread notifications first
      const allNotifications = await notificationService.getAllNotifications();
      
      if (allNotifications.success && allNotifications.data) {
        const unreadNotifications = allNotifications.data.filter(n => !n.is_read);
        
        // Mark each unread notification as read
        const markPromises = unreadNotifications.map(notification => 
          notificationService.markAsRead(notification.id)
        );
        
        await Promise.all(markPromises);
        
        return {
          success: true,
          message: `Đã đánh dấu ${unreadNotifications.length} thông báo là đã đọc`,
        };
      } else {
        return {
          success: false,
          message: "Không thể lấy danh sách thông báo",
        };
      }
    } catch (error: any) {
      console.error("❌ Mark all as read error:", error);
      return {
        success: false,
        message: "Có lỗi xảy ra khi đánh dấu tất cả đã đọc",
      };
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log(`🗑️ Deleting notification with ID: ${notificationId}...`);
      
      const response = await apiClient.delete<ApiResponse<any>>(`/notifications/${notificationId}`);
      
      if (response.data.code === 200) {
        return {
          success: true,
          message: "Xóa thông báo thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể xóa thông báo",
        };
      }
    } catch (error: any) {
      console.error("❌ Delete notification error:", error);
      return handleApiError(error);
    }
  },

  // Create notification (for admin)
  createNotification: async (notificationData: Partial<Notification>): Promise<{ success: boolean; data?: Notification; message: string }> => {
    try {
      console.log("➕ Creating new notification...");
      
      const response = await apiClient.post<ApiResponse<Notification>>("/notifications", notificationData);
      
      if (response.data.code === 200 || response.data.code === 201) {
        return {
          success: true,
          data: response.data.result,
          message: "Tạo thông báo thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể tạo thông báo",
        };
      }
    } catch (error: any) {
      console.error("❌ Create notification error:", error);
      return handleApiError(error);
    }
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ success: boolean; count: number; message: string }> => {
    try {
      const response = await notificationService.getAllNotifications();
      
      if (response.success && response.data) {
        const unreadCount = response.data.filter(n => !n.is_read).length;
        return {
          success: true,
          count: unreadCount,
          message: "Lấy số thông báo chưa đọc thành công",
        };
      } else {
        return {
          success: false,
          count: 0,
          message: response.message,
        };
      }
    } catch (error: any) {
      console.error("❌ Get unread count error:", error);
      return {
        success: false,
        count: 0,
        message: "Có lỗi xảy ra khi lấy số thông báo chưa đọc",
      };
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
        return { success: false, message: "Dữ liệu không hợp lệ" };
      case 401:
        return { success: false, message: "Bạn cần đăng nhập để xem thông báo" };
      case 403:
        return { success: false, message: "Bạn không có quyền truy cập thông báo này" };
      case 404:
        return { success: false, message: "Không tìm thấy thông báo" };
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

export default notificationService;