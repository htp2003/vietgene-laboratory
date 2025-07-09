import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Loader2
} from 'lucide-react';

import { NotificationService, NotificationResponse } from '../../services/staffService/notificationService';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [markingAsRead, setMarkingAsRead] = useState<string[]>([]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize notifications and start polling
  useEffect(() => {
    const handleNotificationUpdate = (updatedNotifications: NotificationResponse[]) => {
      setNotifications(updatedNotifications);
    };

    // Start polling for real-time updates
    NotificationService.startPolling(handleNotificationUpdate);

    // Cleanup on unmount
    return () => {
      NotificationService.stopPolling();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = NotificationService.getUnreadCount(notifications);
  const recentNotifications = NotificationService.getRecentNotifications(notifications);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
    setError('');
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (markingAsRead.includes(notificationId)) return;

    try {
      setMarkingAsRead(prev => [...prev, notificationId]);
      
      await NotificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      
      console.log('✅ Notification marked as read:', notificationId);
    } catch (error: any) {
      console.error('❌ Error marking notification as read:', error);
      setError('Có lỗi khi đánh dấu thông báo đã đọc');
    } finally {
      setMarkingAsRead(prev => prev.filter(id => id !== notificationId));
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    
    if (unreadIds.length === 0) return;

    try {
      setLoading(true);
      setError('');
      
      await NotificationService.markMultipleAsRead(unreadIds);
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      
      console.log('✅ All notifications marked as read');
    } catch (error: any) {
      console.error('❌ Error marking all notifications as read:', error);
      setError('Có lỗi khi đánh dấu tất cả thông báo đã đọc');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Booking':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'StatusUpdate':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationStyle = (isRead: boolean) => {
    return isRead 
      ? 'bg-white hover:bg-gray-50' 
      : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-400';
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={handleToggleDropdown}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              Thông báo ({unreadCount} chưa đọc)
            </h3>
            
            <div className="flex items-center gap-2">
              {/* Mark All as Read Button */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 flex items-center gap-1"
                >
                  {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCheck className="w-3 h-3" />
                  )}
                  Đánh dấu tất cả
                </button>
              )}
              
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border-b border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 cursor-pointer transition-colors ${getNotificationStyle(notification.is_read)}`}
                    onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Notification Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          
                          {/* Mark as Read Button */}
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              disabled={markingAsRead.includes(notification.id)}
                              className="ml-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            >
                              {markingAsRead.includes(notification.id) ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {notification.createdAt 
                              ? NotificationService.formatNotificationTime(notification.createdAt)
                              : 'Vừa xong'
                            }
                          </span>
                          
                          {/* Unread Indicator */}
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Chưa có thông báo
                </h3>
                <p className="text-sm text-gray-500">
                  Thông báo mới sẽ xuất hiện ở đây
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to notifications page if you have one
                  console.log('Navigate to full notifications page');
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;