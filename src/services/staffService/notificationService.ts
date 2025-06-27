import { apiClient } from '../../config/api';
import { ApiResponse, ApiNotification, NotificationRequest } from '../../types/appointment';

export class NotificationService {
  
  // ✅ Get all notifications
  static async getAllNotifications(): Promise<ApiNotification[]> {
    try {
      console.log("🔔 Fetching all notifications...");
      
      const response = await apiClient.get<ApiResponse<ApiNotification[]>>("/notifications");
      
      if (response.data.code === 200) {
        console.log("✅ Fetched notifications:", response.data.result.length);
        return response.data.result;
      } else {
        console.warn("⚠️ Failed to fetch notifications:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
      return [];
    }
  }

  // ✅ Get notification by ID
  static async getNotificationById(notificationId: string): Promise<ApiNotification | null> {
    try {
      console.log(`🔔 Fetching notification: ${notificationId}`);
      
      const response = await apiClient.get<ApiResponse<ApiNotification>>(`/notifications/${notificationId}`);
      
      if (response.data.code === 200) {
        console.log("✅ Fetched notification:", response.data.result);
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to fetch notification ${notificationId}:`, error);
      return null;
    }
  }

  // ✅ Create notification
  static async createNotification(notificationData: NotificationRequest): Promise<ApiNotification | null> {
    try {
      console.log("🔔 Creating notification...");

      const response = await apiClient.post<ApiResponse<ApiNotification>>("/notifications", notificationData);

      if (response.data.code === 200) {
        console.log("✅ Notification created successfully");
        return response.data.result;
      } else {
        console.error("❌ Failed to create notification:", response.data.message);
        return null;
      }

    } catch (error) {
      console.error("❌ Error creating notification:", error);
      return null;
    }
  }

  // ✅ Update notification
  static async updateNotification(notificationId: string, notificationData: NotificationRequest): Promise<ApiNotification | null> {
    try {
      console.log(`🔔 Updating notification: ${notificationId}`);
      
      const response = await apiClient.put<ApiResponse<ApiNotification>>(`/notifications/${notificationId}`, notificationData);
      
      if (response.data.code === 200) {
        console.log("✅ Notification updated successfully");
        return response.data.result;
      } else {
        console.error("❌ Failed to update notification:", response.data.message);
        return null;
      }
    } catch (error) {
      console.error("❌ Error updating notification:", error);
      return null;
    }
  }

  // ✅ Delete notification
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      console.log(`🔔 Deleting notification: ${notificationId}`);
      
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      
      if (response.data.code === 200) {
        console.log("✅ Notification deleted successfully");
        return true;
      } else {
        console.error("❌ Failed to delete notification:", response.data.message);
        return false;
      }
    } catch (error) {
      console.error("❌ Error deleting notification:", error);
      return false;
    }
  }
}