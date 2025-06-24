import React, { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaCheck, 
  FaTrash, 
  FaCheckDouble, 
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import notificationService, {Notification} from '../../../services/notificationService';

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({ className = "" }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getAllNotifications();
      
      if (response.success && response.data) {
        setNotifications(response.data);
        const unread = response.data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load notifications on mount and when dropdown opens
  useEffect(() => {
    fetchNotifications();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mark single notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, is_read: true }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await notificationService.deleteNotification(notificationId);
      
      if (response.success) {
        const deletedNotification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        if (deletedNotification && !deletedNotification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    if (!type) return <FaInfoCircle className="w-4 h-4 text-blue-500" />;
    
    switch (type.toLowerCase()) {
      case 'success':
        return <FaCheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <FaTimesCircle className="w-4 h-4 text-red-500" />;
      case 'info':
      default:
        return <FaInfoCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications(); // Refresh when opening
          }
        }}
        className="relative hover:bg-gray-100 p-2 rounded-lg transition-colors"
      >
        <FaBell size={20} className="text-gray-600 hover:text-gray-800 transition-colors" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <FaBell className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  title="Đánh dấu tất cả đã đọc"
                >
                  <FaCheckDouble size={12} />
                  Đọc tất cả
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={14} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Đang tải...</span>
              </div>
            ) : recentNotifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTimeAgo(notification.createdAt || new Date().toISOString())}
                            </p>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Đánh dấu đã đọc"
                              >
                                <FaCheck size={12} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Xóa thông báo"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <FaBell className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm">Không có thông báo nào</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 5 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                Xem tất cả ({notifications.length} thông báo)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}