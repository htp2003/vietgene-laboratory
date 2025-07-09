// types/notification.ts
export interface NotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
  is_read?: boolean;
}

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export type NotificationType = 
  | 'Booking'           // New appointment created
  | 'StatusUpdate'      // Appointment status changed
  | 'UrgentBooking'     // Urgent appointment (legal DNA test)
  | 'AttentionRequired' // Appointment needs attention
  | 'Reminder'          // Upcoming appointment reminder
  | 'DailySummary'      // Daily appointment summary
  | 'SystemAlert'       // System-related alerts
  | 'TaskAssigned'      // Task assigned to staff
  | 'ResultReady';      // Test result ready

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  recent: NotificationResponse[];
}

export interface NotificationFilter {
  type?: NotificationType;
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export interface NotificationPreferences {
  userId: string;
  enableSound: boolean;
  enableDesktop: boolean;
  enableEmail: boolean;
  notificationTypes: NotificationType[];
}

// Notification configuration for different types
export const NOTIFICATION_CONFIG = {
  'Booking': {
    icon: '📅',
    color: 'blue',
    priority: 'medium',
    autoRead: false
  },
  'StatusUpdate': {
    icon: '🔄',
    color: 'orange',
    priority: 'medium',
    autoRead: false
  },
  'UrgentBooking': {
    icon: '🚨',
    color: 'red',
    priority: 'high',
    autoRead: false
  },
  'AttentionRequired': {
    icon: '⚠️',
    color: 'yellow',
    priority: 'high',
    autoRead: false
  },
  'Reminder': {
    icon: '⏰',
    color: 'purple',
    priority: 'low',
    autoRead: true
  },
  'DailySummary': {
    icon: '📊',
    color: 'green',
    priority: 'low',
    autoRead: true
  },
  'SystemAlert': {
    icon: '⚡',
    color: 'red',
    priority: 'high',
    autoRead: false
  },
  'TaskAssigned': {
    icon: '📋',
    color: 'blue',
    priority: 'medium',
    autoRead: false
  },
  'ResultReady': {
    icon: '✅',
    color: 'green',
    priority: 'high',
    autoRead: false
  }
} as const;

// Notification sound configuration
export const NOTIFICATION_SOUNDS = {
  'UrgentBooking': 'urgent-alert.mp3',
  'AttentionRequired': 'attention.mp3',
  'Booking': 'new-notification.mp3',
  'StatusUpdate': 'status-update.mp3',
  'ResultReady': 'result-ready.mp3'
} as const;

// Helper functions for notification handling
export const NotificationHelpers = {
  /**
   * Get notification config by type
   */
  getConfig: (type: NotificationType) => NOTIFICATION_CONFIG[type],

  /**
   * Get notification color class
   */
  getColorClass: (type: NotificationType): string => {
    const config = NOTIFICATION_CONFIG[type];
    const colorMap = {
      blue: 'text-blue-600 bg-blue-50',
      orange: 'text-orange-600 bg-orange-50',
      red: 'text-red-600 bg-red-50',
      yellow: 'text-yellow-600 bg-yellow-50',
      purple: 'text-purple-600 bg-purple-50',
      green: 'text-green-600 bg-green-50'
    };
    return colorMap[config.color] || colorMap.blue;
  },

  /**
   * Get notification priority badge
   */
  getPriorityBadge: (type: NotificationType): string => {
    const config = NOTIFICATION_CONFIG[type];
    const priorityMap = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-gray-100 text-gray-700'
    };
    return priorityMap[config.priority];
  },

  /**
   * Check if notification should auto-read
   */
  shouldAutoRead: (type: NotificationType): boolean => {
    return NOTIFICATION_CONFIG[type].autoRead;
  },

  /**
   * Get notification sound
   */
  getSound: (type: NotificationType): string | undefined => {
    return NOTIFICATION_SOUNDS[type as keyof typeof NOTIFICATION_SOUNDS];
  },

  /**
   * Format notification message with customer name
   */
  formatMessage: (type: NotificationType, customerName: string, extra?: string): string => {
    const messageTemplates = {
      'Booking': `Khách hàng ${customerName} đã đặt lịch xét nghiệm`,
      'StatusUpdate': `Lịch hẹn của khách hàng ${customerName} ${extra || 'có cập nhật'}`,
      'UrgentBooking': `Khách hàng ${customerName} đã đặt lịch xét nghiệm KHẨN CẤP`,
      'AttentionRequired': `Lịch hẹn của khách hàng ${customerName} cần chú ý: ${extra || 'cần xử lý'}`,
      'Reminder': `Lịch hẹn của khách hàng ${customerName} sắp tới`,
      'DailySummary': `Tổng kết lịch hẹn trong ngày`,
      'SystemAlert': `Cảnh báo hệ thống: ${extra || 'cần kiểm tra'}`,
      'TaskAssigned': `Bạn được giao nhiệm vụ xử lý lịch hẹn của ${customerName}`,
      'ResultReady': `Kết quả xét nghiệm của khách hàng ${customerName} đã sẵn sàng`
    };
    
    return messageTemplates[type] || `Thông báo về khách hàng ${customerName}`;
  }
};

export default NotificationHelpers;