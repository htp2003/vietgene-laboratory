import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  LogOut,
  ChevronDown,
  Clock,
  Package,
  CheckCircle,
} from "lucide-react";
import { authService } from "../../services/authService";

interface User {
  userId: number;
  username: string;
  authenticated: boolean;
  // Optional fields từ API (nếu có)
  id?: number;
  email?: string;
  full_name?: string;
  fullName?: string;
  role?: string;
  roles?: Array<{
    name: string;
    description: string;
  }>;
  phone?: string;
  address?: string;
  created_at?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  userId: string;
  createdAt?: string;
  orderId?: string; // Extract from message or type
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const notificationRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const navLinks = [
    { path: "/", label: "Trang chủ" },
    { path: "/news", label: "Tin tức" },
    { path: "/services", label: "Dịch vụ" },
    { path: "/about", label: "Giới thiệu" },
    { path: "/contact", label: "Liên hệ" },
  ];

  // Load user and start notification polling
  useEffect(() => {
    const initializeUser = async () => {
      // Check authentication state
      if (!authService.isAuthenticated()) {
        console.log("❌ User not authenticated");
        return;
      }

      try {
        const savedUser = authService.getCurrentUser();
        console.log("👤 User data from authService:", savedUser);

        if (savedUser) {
          setUser(savedUser);

          // Start loading notifications immediately after setting user
          console.log(
            "🔄 Starting notification system for user:",
            savedUser.id || savedUser.userId
          );

          // Small delay to ensure state is updated
          setTimeout(() => {
            loadNotifications();
            startNotificationPolling();
          }, 500);
        } else {
          console.log("❌ No user data found");
        }
      } catch (error) {
        console.error("❌ Error initializing user:", error);
        authService.logout();
      }
    };

    initializeUser();

    // Cleanup polling on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // API Functions
  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);

      // Use authService to get token and user
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();

      if (!token) {
        console.log("⚠️ No token found, skipping notification load");
        return;
      }

      if (!currentUser) {
        console.log("⚠️ No user found, skipping notification load");
        return;
      }

      console.log(
        "🔍 Loading notifications for user:",
        currentUser.id || currentUser.userId
      );

      // Use the same base URL as authService
      const response = await fetch(
        "https://dna-service-se1857.onrender.com/dna_service/notifications",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("🔍 Notification response status:", response.status);
      console.log(
        "🔍 Notification response headers:",
        response.headers.get("content-type")
      );

      if (response.ok) {
        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.warn("⚠️ API returned non-JSON response:", contentType);
          const text = await response.text();
          console.log("📄 Response text:", text.substring(0, 200));

          // If we get HTML, likely authentication issue
          if (text.includes("<html") || text.includes("<!DOCTYPE")) {
            console.error(
              "❌ Received HTML instead of JSON - likely auth issue"
            );
            return;
          }
          return;
        }

        const result = await response.json();
        console.log("📢 Raw notifications:", result);

        // Handle different possible response formats
        let notificationArray = [];

        if (Array.isArray(result)) {
          // Direct array response
          notificationArray = result;
        } else if (result.result && Array.isArray(result.result)) {
          // Wrapped in result property
          notificationArray = result.result;
        } else if (result.data && Array.isArray(result.data)) {
          // Wrapped in data property
          notificationArray = result.data;
        } else {
          console.warn("⚠️ Unexpected API response format:", result);
          setNotifications([]);
          return;
        }

        // Enhanced notifications with order extraction
        const enhancedNotifications = notificationArray.map((notif: any) => ({
          ...notif,
          orderId: extractOrderIdFromNotification(notif),
          createdAt:
            notif.createdAt || notif.created_at || new Date().toISOString(),
        }));

        // Sort by latest first, unread first
        enhancedNotifications.sort((a: Notification, b: Notification) => {
          if (a.is_read !== b.is_read) {
            return a.is_read ? 1 : -1; // Unread first
          }
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        });

        setNotifications(enhancedNotifications);
        console.log(
          `✅ Loaded ${enhancedNotifications.length} notifications from API`
        );
      } else if (response.status === 401) {
        console.error("❌ Unauthorized - token may be expired");
        // Let authService handle token refresh
      } else if (response.status === 404) {
        console.log(
          "📭 No notifications endpoint found or no notifications for user"
        );
        setNotifications([]);
      } else {
        console.error(
          "❌ Failed to load notifications:",
          response.status,
          response.statusText
        );

        // Try to get error details
        try {
          const errorText = await response.text();
          console.log("📄 Error response:", errorText.substring(0, 200));
        } catch (e) {
          console.log("❌ Could not read error response");
        }
      }
    } catch (error) {
      console.error("❌ Error loading notifications:", error);
      // Don't break the app if notifications fail
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      // Find the notification
      const notification = notifications.find((n) => n.id === notificationId);
      if (!notification || notification.is_read) return;

      const token = authService.getToken();
      if (!token) {
        console.log("⚠️ No token found for marking notification as read");
        return;
      }

      const response = await fetch(
        `https://dna-service-se1857.onrender.com/dna_service/notifications/${notificationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: notification.title,
            message: notification.message,
            type: notification.type,
            is_read: true,
          }),
        }
      );

      if (response.ok) {
        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          console.log("✅ Mark as read response:", result);
        }

        // Update local state regardless of response format
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
        console.log(`✅ Marked notification ${notificationId} as read`);
      } else {
        console.error(
          "❌ Failed to mark notification as read:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("❌ Error marking notification as read:", error);
      // Still update UI optimistically
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    }
  };

  const extractOrderIdFromNotification = (
    notification: any
  ): string | undefined => {
    // Try to extract order ID from message or title
    const orderPatterns = [
      /đơn hàng\s+([A-Z0-9-]+)/i,
      /order[:\s]+([A-Z0-9-]+)/i,
      /DNA-([A-Z0-9]+)/i,
      /mã\s*([A-Z0-9-]+)/i,
      /khách hàng\s+(.+?)\s+đang/i, // Extract customer name for now
    ];

    const text = `${notification.title} ${notification.message}`;

    for (const pattern of orderPatterns) {
      const match = text.match(pattern);
      if (match) {
        console.log(
          `🔍 Extracted from notification: "${match[1]}" using pattern: ${pattern}`
        );
        return match[1];
      }
    }

    // For StatusUpdate type, we might need to navigate to appointments or orders
    if (notification.type === "StatusUpdate") {
      console.log(
        "📋 StatusUpdate notification - will navigate to dashboard/appointments"
      );
      return "dashboard"; // Special case to navigate to dashboard
    }

    console.log("⚠️ No order ID found in notification:", text);
    return undefined;
  };

  const startNotificationPolling = () => {
    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // Start polling every 7 seconds
    pollIntervalRef.current = setInterval(() => {
      // Always check fresh from authService (not React state)
      const currentUser = authService.getCurrentUser();
      const currentToken = authService.getToken();
      const isAuthenticated = authService.isAuthenticated();

      if (currentUser && currentToken && isAuthenticated) {
        console.log("🔄 Polling notifications...");
        loadNotifications();
      } else {
        console.log(
          "⚠️ User or token not found, stopping notification polling"
        );
        console.log(
          "Debug - User:",
          !!currentUser,
          "Token:",
          !!currentToken,
          "Authenticated:",
          isAuthenticated
        );
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    }, 7000);

    console.log("🔄 Started notification polling (7s interval)");
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
    }

    // Close dropdown
    setIsNotificationOpen(false);

    // Navigate based on notification type and content
    if (notification.orderId) {
      if (notification.orderId === "dashboard") {
        // For StatusUpdate or general notifications
        navigate("/dashboard");
      } else {
        // For specific order notifications
        navigate(`/orders/${notification.orderId}`);
      }
    } else {
      // Default fallback based on notification type
      switch (notification.type.toLowerCase()) {
        case "statusupdate":
          navigate("/dashboard"); // User can check appointments/orders
          break;
        case "order_update":
        case "order":
          navigate("/dashboard"); // Go to orders section
          break;
        case "result_ready":
        case "completed":
          navigate("/dashboard"); // Go to see results
          break;
        default:
          navigate("/dashboard");
      }
    }

    console.log(`🔗 Navigated for notification type: ${notification.type}`);
  };

  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "statusupdate":
        return Clock;
      case "order_update":
      case "order":
        return Package;
      case "result_ready":
      case "completed":
        return CheckCircle;
      case "payment":
        return CheckCircle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "statusupdate":
        return "text-orange-600 bg-orange-100";
      case "order_update":
      case "order":
        return "text-blue-600 bg-blue-100";
      case "result_ready":
      case "completed":
        return "text-green-600 bg-green-100";
      case "payment":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatNotificationTime = (dateString?: string) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) return "Vừa xong";
      if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} giờ trước`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} ngày trước`;

      return date.toLocaleDateString("vi-VN");
    } catch {
      return "";
    }
  };

  const handleLogout = () => {
    // Clear polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // Use authService logout method
    authService.logout();
    setUser(null);
    setNotifications([]);
    setIsUserMenuOpen(false);
    navigate("/");
  };

  const userMenuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: User,
    },
    // {
    //   label: "Đơn hàng của tôi",
    //   path: "/orders/1",
    //   icon: User,
    // },
    {
      label: "Cài đặt tài khoản",
      path: "/profile",
      icon: User,
    },
  ];

  // ✅ Helper function để hiển thị tên user
  const getUserDisplayName = () => {
    if (!user) return "";
    return user.full_name || user.fullName || user.username || "User";
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">VG</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              VietGene Lab
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "text-red-600 border-b-2 border-red-600 pb-1"
                    : "text-gray-700 hover:text-black"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  {/* <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2 text-gray-700 hover:text-black transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button> */}

                  {/* Notification Dropdown */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">
                          Thông báo
                        </h3>
                        {loadingNotifications && (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                        )}
                      </div>

                      {/* Notification List */}
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p>Chưa có thông báo nào</p>
                          </div>
                        ) : (
                          <div className="py-2">
                            {notifications.map((notification) => {
                              const IconComponent = getNotificationIcon(
                                notification.type
                              );
                              const colorClass = getNotificationColor(
                                notification.type
                              );

                              return (
                                <button
                                  key={notification.id}
                                  onClick={() =>
                                    handleNotificationClick(notification)
                                  }
                                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-l-4 ${
                                    notification.is_read
                                      ? "border-transparent"
                                      : "border-red-500 bg-red-50"
                                  }`}
                                >
                                  <div className="flex items-start space-x-3">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}
                                    >
                                      <IconComponent className="w-4 h-4" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <p
                                          className={`text-sm font-medium ${
                                            notification.is_read
                                              ? "text-gray-900"
                                              : "text-gray-900 font-semibold"
                                          }`}
                                        >
                                          {notification.title}
                                        </p>
                                        {!notification.is_read && (
                                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                        )}
                                      </div>

                                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                        {notification.message}
                                      </p>

                                      <p className="text-xs text-gray-400">
                                        {formatNotificationTime(
                                          notification.createdAt
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                          <Link
                            to="/dashboard"
                            onClick={() => setIsNotificationOpen(false)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Xem tất cả →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 text-gray-700 hover:text-black transition-colors"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {getUserDisplayName()}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {getUserDisplayName()}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        {userMenuItems.map((item, index) => (
                          <Link
                            key={index}
                            to={item.path}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <item.icon className="w-4 h-4 mr-3 text-gray-400" />
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-200 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Guest User Buttons
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-black"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {/* Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 text-sm transition-colors ${
                  location.pathname === link.path
                    ? "text-red-600 bg-gray-50"
                    : "text-gray-700 hover:text-black hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Auth Section */}
            <div className="mt-4 px-4 space-y-2 border-t border-gray-200 pt-4">
              {user ? (
                // Authenticated Mobile Menu
                <>
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {getUserDisplayName()}
                          </p>
                        </div>
                      </div>

                      {/* Mobile Notification Badge */}
                      <div className="relative">
                        <Bell className="w-5 h-5 text-gray-400" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {userMenuItems.map((item, index) => (
                    <Link
                      key={index}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center py-2 text-gray-700 hover:text-black transition-colors"
                    >
                      <item.icon className="w-4 h-4 mr-3 text-gray-400" />
                      {item.label}
                    </Link>
                  ))}

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full py-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Đăng xuất
                  </button>
                </>
              ) : (
                // Guest Mobile Menu
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-center py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-center py-2 bg-black text-white rounded-md hover:bg-gray-800"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
