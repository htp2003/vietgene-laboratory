import apiClient from "../apiClient";

export interface NotificationRequest {
  title: string;
  message: string;
  type: string;
  is_read?: boolean;
}

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  userId: string;
  createdAt?: string;
}

export interface ApiNotificationResponse {
  code: number;
  message: string;
  result: NotificationResponse;
}

export interface ApiNotificationsListResponse {
  code: number;
  message: string;
  result: NotificationResponse[];
}

export interface StaffUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  roles: Array<{
    name: string;
    description: string;
  }>;
}

export interface ApiUsersResponse {
  code: number;
  message: string;
  result: StaffUser[];
}

export class NotificationService {
  private static pollingInterval: number | null = null;
  private static callbacks: Array<(notifications: NotificationResponse[]) => void> = [];

  /**
   * Get all notifications for current user
   */
  static async getAllNotifications(): Promise<NotificationResponse[]> {
    try {
      console.log('🔔 Getting all notifications...');
      
      const response = await apiClient.get<ApiNotificationsListResponse>('/notifications');
      
      if (response.data.code === 200) {
        console.log('✅ Notifications fetched successfully:', response.data.result.length);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch notifications');
      }
    } catch (error: any) {
      console.error('❌ Error fetching notifications:', error);
      throw new Error('Có lỗi xảy ra khi tải danh sách thông báo');
    }
  }

  /**
   * Get notification by ID
   */
  static async getNotificationById(notificationId: string): Promise<NotificationResponse> {
    try {
      console.log('🔍 Getting notification by ID:', notificationId);
      
      const response = await apiClient.get<ApiNotificationResponse>(`/notifications/${notificationId}`);
      
      if (response.data.code === 200) {
        console.log('✅ Notification fetched successfully:', response.data.result);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch notification');
      }
    } catch (error: any) {
      console.error('❌ Error fetching notification:', error);
      throw new Error('Có lỗi xảy ra khi tải thông báo');
    }
  }

  /**
   * Create notification for a specific user
   */
  static async createNotification(userId: string, notificationData: NotificationRequest): Promise<NotificationResponse> {
    try {
      console.log('📝 Creating notification for user:', userId, notificationData);
      
      const response = await apiClient.post<ApiNotificationResponse>('/notifications', notificationData);
      
      if (response.data.code === 200) {
        console.log('✅ Notification created successfully:', response.data.result);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to create notification');
      }
    } catch (error: any) {
      console.error('❌ Error creating notification:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Có lỗi xảy ra khi tạo thông báo');
    }
  }

  /**
   * Update notification (mainly for marking as read)
   */
  static async updateNotification(notificationId: string, updateData: Partial<NotificationRequest>): Promise<NotificationResponse> {
    try {
      console.log('📝 Updating notification:', notificationId, updateData);
      
      const response = await apiClient.put<ApiNotificationResponse>(`/notifications/${notificationId}`, updateData);
      
      if (response.data.code === 200) {
        console.log('✅ Notification updated successfully:', response.data.result);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to update notification');
      }
    } catch (error: any) {
      console.error('❌ Error updating notification:', error);
      throw new Error('Có lỗi xảy ra khi cập nhật thông báo');
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<NotificationResponse> {
    return this.updateNotification(notificationId, { is_read: true });
  }

  /**
   * Mark multiple notifications as read
   */
  static async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    try {
      console.log('📝 Marking multiple notifications as read:', notificationIds.length);
      
      const promises = notificationIds.map(id => this.markAsRead(id));
      await Promise.all(promises);
      
      console.log('✅ All notifications marked as read');
    } catch (error: any) {
      console.error('❌ Error marking notifications as read:', error);
      throw new Error('Có lỗi xảy ra khi đánh dấu thông báo đã đọc');
    }
  }

  /**
   * Delete notification - NEW FEATURE
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting notification:', notificationId);
      
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      
      console.log('✅ Notification deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting notification:', error);
      throw new Error('Có lỗi xảy ra khi xóa thông báo');
    }
  }

  /**
   * Delete multiple notifications - NEW FEATURE
   */
  static async deleteMultipleNotifications(notificationIds: string[]): Promise<void> {
    try {
      console.log('🗑️ Deleting multiple notifications:', notificationIds.length);
      
      const promises = notificationIds.map(id => this.deleteNotification(id));
      await Promise.all(promises);
      
      console.log('✅ All notifications deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting notifications:', error);
      throw new Error('Có lỗi xảy ra khi xóa thông báo');
    }
  }

  /**
   * Delete all read notifications - NEW FEATURE
   */
  static async deleteAllReadNotifications(): Promise<void> {
    try {
      console.log('🗑️ Deleting all read notifications...');
      
      // Get all notifications
      const notifications = await this.getAllNotifications();
      
      // Filter read notifications
      const readNotifications = notifications.filter(n => n.is_read);
      
      if (readNotifications.length === 0) {
        console.log('ℹ️ No read notifications to delete');
        return;
      }
      
      // Delete all read notifications
      const readNotificationIds = readNotifications.map(n => n.id);
      await this.deleteMultipleNotifications(readNotificationIds);
      
      console.log('✅ All read notifications deleted');
    } catch (error: any) {
      console.error('❌ Error deleting read notifications:', error);
      throw new Error('Có lỗi xảy ra khi xóa thông báo đã đọc');
    }
  }

  /**
   * Get all staff users (for sending notifications)
   */
  static async getAllStaffUsers(): Promise<StaffUser[]> {
    try {
      console.log('👥 Getting all staff users...');
      
      const response = await apiClient.get<ApiUsersResponse>('/user');
      
      if (response.data.code === 200) {
        // Filter for staff users only
        const staffUsers = response.data.result.filter(user => 
          user.roles.some(role => 
            role.name.toLowerCase().includes('staff') || 
            role.name.toLowerCase().includes('manager') ||
            role.name.toLowerCase().includes('admin')
          )
        );
        
        console.log('✅ Staff users fetched successfully:', staffUsers.length);
        return staffUsers;
      } else {
        throw new Error(response.data.message || 'Failed to fetch staff users');
      }
    } catch (error: any) {
      console.error('❌ Error fetching staff users:', error);
      throw new Error('Có lỗi xảy ra khi tải danh sách nhân viên');
    }
  }

  /**
   * Send notification to all staff about new appointment - ONLY FOR NEW ORDERS
   */
  static async notifyStaffAboutNewAppointment(customerName: string, appointmentId: string): Promise<void> {
    try {
      console.log('📢 Notifying staff about new appointment:', { customerName, appointmentId });
      
      // Get all staff users
      const staffUsers = await this.getAllStaffUsers();
      
      if (staffUsers.length === 0) {
        console.warn('⚠️ No staff users found to notify');
        return;
      }
      
      // Create notification for each staff member - ONLY FOR NEW ORDERS
      const notificationData: NotificationRequest = {
        title: '🆕 Đơn hàng mới',
        message: `Khách hàng ${customerName} đã đặt lịch xét nghiệm mới`,
        type: 'NewOrder', // Changed type to be more specific
        is_read: false
      };
      
      const promises = staffUsers.map(staff => 
        this.createNotification(staff.id, notificationData)
      );
      
      await Promise.all(promises);
      
      console.log('✅ All staff members notified about new appointment');
    } catch (error: any) {
      console.error('❌ Error notifying staff about new appointment:', error);
      // Don't throw error to avoid breaking the main flow
      console.warn('⚠️ Failed to send notifications to staff, but appointment was created successfully');
    }
  }

  /**
   * REMOVED - No longer notifying about status changes
   * This method is deprecated and should not be used
   */
  static async notifyStaffAboutStatusChange(customerName: string, appointmentId: string, newStatus: string): Promise<void> {
    console.log('ℹ️ Status change notifications are disabled. Not sending notification for:', { customerName, appointmentId, newStatus });
    // This method now does nothing - status change notifications are disabled
    return;
  }

  /**
   * Start real-time polling for notifications
   */
  static startPolling(callback: (notifications: NotificationResponse[]) => void, intervalMs: number = 30000): void {
    console.log('🔄 Starting notification polling...');
    
    // Add callback to list
    this.callbacks.push(callback);
    
    // Start polling if not already started
    if (!this.pollingInterval) {
      this.pollingInterval = window.setInterval(async () => {
        try {
          const notifications = await this.getAllNotifications();
          
          // Filter notifications to only show new orders (not status updates)
          const filteredNotifications = notifications.filter(n => 
            n.type === 'NewOrder' || n.type === 'Booking' // Keep legacy 'Booking' type for existing notifications
          );
          
          // Call all registered callbacks with filtered notifications
          this.callbacks.forEach(cb => cb(filteredNotifications));
          
        } catch (error) {
          console.error('❌ Error in notification polling:', error);
        }
      }, intervalMs) as unknown as number;
      
      // Initial fetch
      this.getAllNotifications()
        .then(notifications => {
          // Filter notifications to only show new orders
          const filteredNotifications = notifications.filter(n => 
            n.type === 'NewOrder' || n.type === 'Booking' // Keep legacy 'Booking' type for existing notifications
          );
          this.callbacks.forEach(cb => cb(filteredNotifications));
        })
        .catch(error => {
          console.error('❌ Error in initial notification fetch:', error);
        });
    }
  }

  /**
   * Stop real-time polling
   */
  static stopPolling(): void {
    console.log('⏹️ Stopping notification polling...');
    
    if (this.pollingInterval) {
      window.clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    // Clear callbacks
    this.callbacks = [];
  }

  /**
   * Get unread notifications count
   */
  static getUnreadCount(notifications: NotificationResponse[]): number {
    return notifications.filter(n => !n.is_read).length;
  }

  /**
   * Get recent notifications (last 50) - filtered for new orders only
   */
  static getRecentNotifications(notifications: NotificationResponse[]): NotificationResponse[] {
    return notifications
      .filter(n => n.type === 'NewOrder' || n.type === 'Booking') // Only show new order notifications
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 50);
  }

  /**
   * Get notifications by type
   */
  static getNotificationsByType(notifications: NotificationResponse[], type: string): NotificationResponse[] {
    return notifications.filter(n => n.type === type);
  }

  /**
   * Get only new order notifications
   */
  static getNewOrderNotifications(notifications: NotificationResponse[]): NotificationResponse[] {
    return notifications.filter(n => n.type === 'NewOrder' || n.type === 'Booking');
  }

  /**
   * Format notification time
   */
  static formatNotificationTime(createdAt: string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      return 'Vừa xong';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return created.toLocaleDateString('vi-VN');
    }
  }

  /**
   * Clear all notifications (mark as read and delete)
   */
  static async clearAllNotifications(): Promise<void> {
    try {
      console.log('🧹 Clearing all notifications...');
      
      const notifications = await this.getAllNotifications();
      
      if (notifications.length === 0) {
        console.log('ℹ️ No notifications to clear');
        return;
      }
      
      // Mark all as read first, then delete
      const notificationIds = notifications.map(n => n.id);
      
      // Mark all as read
      await this.markMultipleAsRead(notificationIds);
      
      // Delete all
      await this.deleteMultipleNotifications(notificationIds);
      
      console.log('✅ All notifications cleared');
    } catch (error: any) {
      console.error('❌ Error clearing notifications:', error);
      throw new Error('Có lỗi xảy ra khi xóa tất cả thông báo');
    }
  }
}