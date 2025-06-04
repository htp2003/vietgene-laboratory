import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Package,
  FileText,
  Bell,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Download,
  Phone,
  Mail,
  Settings,
  LogOut,
  TrendingUp,
} from "lucide-react";

// Mock user data
const mockUser = {
  id: 1,
  fullName: "Nguyễn Văn Demo",
  email: "demo@vietgene.vn",
  phone: "0987654321",
  joinDate: "2024-01-15",
  avatar: null,
};

// Mock orders data
const mockOrders = [
  {
    id: 1,
    orderCode: "DNA-ABC123XY",
    serviceName: "Xét nghiệm quan hệ cha con",
    status: "testing",
    createdDate: "2025-06-01",
    estimatedResult: "2025-06-08",
    price: 2500000,
    progress: 80,
  },
  {
    id: 2,
    orderCode: "DNA-DEF456ZW",
    serviceName: "Xét nghiệm quan hệ mẹ con",
    status: "completed",
    createdDate: "2025-05-20",
    completedDate: "2025-05-27",
    price: 2300000,
    progress: 100,
  },
  {
    id: 3,
    orderCode: "DNA-GHI789UV",
    serviceName: "Xét nghiệm anh chị em ruột",
    status: "sample_collected",
    createdDate: "2025-05-30",
    estimatedResult: "2025-06-10",
    price: 2800000,
    progress: 60,
  },
];

// Mock notifications
const mockNotifications = [
  {
    id: 1,
    title: "Kết quả xét nghiệm đã sẵn sàng",
    message: "Kết quả xét nghiệm DNA-DEF456ZW đã hoàn thành",
    type: "result_ready",
    date: "2025-06-04",
    isRead: false,
  },
  {
    id: 2,
    title: "Đơn hàng đang được xử lý",
    message: "Đơn hàng DNA-ABC123XY đang trong quá trình phân tích",
    type: "order_update",
    date: "2025-06-03",
    isRead: true,
  },
  {
    id: 3,
    title: "Lịch hẹn sắp tới",
    message: "Bạn có lịch hẹn lấy mẫu vào ngày 10/06/2025",
    type: "appointment",
    date: "2025-06-02",
    isRead: true,
  },
];

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useState(mockUser);
  const [orders] = useState(mockOrders);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      navigate("/login");
    }
  }, [navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: {
        label: "Chờ xử lý",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      },
      confirmed: {
        label: "Đã xác nhận",
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
      },
      kit_sent: {
        label: "Đã gửi kit",
        color: "bg-purple-100 text-purple-800",
        icon: Package,
      },
      sample_collected: {
        label: "Đã thu mẫu",
        color: "bg-indigo-100 text-indigo-800",
        icon: FileText,
      },
      testing: {
        label: "Đang xét nghiệm",
        color: "bg-orange-100 text-orange-800",
        icon: Clock,
      },
      completed: {
        label: "Hoàn thành",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      cancelled: {
        label: "Đã hủy",
        color: "bg-red-100 text-red-800",
        icon: AlertCircle,
      },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const markNotificationAsRead = (notificationId: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const activeOrders = orders.filter(
    (o) => o.status !== "completed" && o.status !== "cancelled"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VG</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  VietGene Lab
                </span>
              </Link>
              <span className="text-gray-400">|</span>
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-red-600" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Đơn hàng hoạt động</p>
                <p className="text-3xl font-bold text-gray-900">
                  {activeOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Kết quả đã có</p>
                <p className="text-3xl font-bold text-gray-900">
                  {completedOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Thông báo mới</p>
                <p className="text-3xl font-bold text-gray-900">
                  {unreadNotifications}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Đơn hàng gần đây
                  </h2>
                  <Link
                    to="/orders"
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Xem tất cả
                  </Link>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {order.serviceName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Mã: {order.orderCode}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm text-gray-600">
                            <p>Ngày đặt: {formatDate(order.createdDate)}</p>
                            {order.status !== "completed" &&
                              order.estimatedResult && (
                                <p>
                                  Dự kiến: {formatDate(order.estimatedResult)}
                                </p>
                              )}
                            {order.completedDate && (
                              <p>
                                Hoàn thành: {formatDate(order.completedDate)}
                              </p>
                            )}
                          </div>
                          <p className="font-semibold text-red-600">
                            {formatPrice(order.price)}
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Tiến độ</span>
                            <span>{order.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-600 h-2 rounded-full transition-all"
                              style={{ width: `${order.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                            <Eye className="w-4 h-4" />
                            Xem chi tiết
                          </button>
                          {order.status === "completed" && (
                            <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                              <Download className="w-4 h-4" />
                              Tải kết quả
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {orders.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Bạn chưa có đơn hàng nào
                    </p>
                    <Link
                      to="/services"
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Đặt dịch vụ ngay
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Thao tác nhanh</h3>
              <div className="space-y-3">
                <Link
                  to="/services"
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Đặt dịch vụ mới
                </Link>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Settings className="w-5 h-5" />
                  Cài đặt tài khoản
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Thông báo mới</h3>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      notification.isRead
                        ? "border-gray-200 bg-gray-50"
                        : "border-red-200 bg-red-50"
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(notification.date)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-4">Cần hỗ trợ?</h3>
              <p className="text-red-100 text-sm mb-4">
                Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn 24/7
              </p>
              <div className="space-y-2">
                <a
                  href="tel:19001234"
                  className="flex items-center gap-2 text-white hover:text-red-100"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">1900 1234</span>
                </a>
                <a
                  href="mailto:support@vietgene.vn"
                  className="flex items-center gap-2 text-white hover:text-red-100"
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">support@vietgene.vn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
