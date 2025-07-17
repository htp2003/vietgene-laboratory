import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Download,
  Phone,
  Mail,
  Settings,
  Search,
  User,
  RefreshCw,
} from "lucide-react";

import { authService } from "../../services/authService";
import { orderService } from "../../services/orderService";
import { formatPrice } from "../../services/serviceService";

interface Order {
  id: string;
  orderCode: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  service?: {
    name: string;
    type: string;
  };
  participantCount?: number;
  sampleCount?: number;
}

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Mock notifications
  const [notifications] = useState([
    {
      id: 1,
      title: "Kết quả xét nghiệm đã sẵn sàng",
      message: "Kết quả xét nghiệm đã hoàn thành và sẵn sàng tải về",
      type: "result_ready",
      date: "2025-06-24",
      isRead: false,
    },
    {
      id: 2,
      title: "Đơn hàng đang được xử lý",
      message: "Kit xét nghiệm đang được chuẩn bị",
      type: "order_update",
      date: "2025-06-23",
      isRead: false,
    },
    {
      id: 3,
      title: "Thanh toán thành công",
      message: "Đơn hàng của bạn đã được thanh toán thành công",
      type: "payment",
      date: "2025-06-22",
      isRead: true,
    },
  ]);

  // Load dashboard data - SIMPLIFIED
  useEffect(() => {
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check authentication
      if (!authService.isAuthenticated()) {
        navigate("/login");
        return;
      }

      // Get current user
      const user = authService.getCurrentUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setCurrentUser(user);

      // Load orders with minimal data - NO DETAILED API CALLS
      await loadUserOrdersOptimized(user.id);

      console.log("✅ Dashboard loaded successfully");
    } catch (err) {
      console.error("❌ Error loading dashboard:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải dữ liệu dashboard. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  // OPTIMIZED: Only load basic order data, no detailed calls
  const loadUserOrdersOptimized = async (userId: string) => {
    try {
      console.log("🔍 Loading orders for user:", userId);

      // Only get basic order data - NO getCompleteOrderData calls
      const userOrders = await orderService.getUserOrders(userId);
      console.log("📦 Raw orders from API:", userOrders);

      if (userOrders && userOrders.length > 0) {
        // Transform orders with BASIC data only
        const basicOrders: Order[] = userOrders.map((apiOrder: any) => {
          return {
            id: apiOrder.orderId || apiOrder.id,
            orderCode:
              apiOrder.order_code ||
              apiOrder.orderCode ||
              `DNA-${(apiOrder.orderId || apiOrder.id).slice(-8)}`,
            status: apiOrder.status || "pending",
            totalAmount: apiOrder.total_amount || apiOrder.totalAmount || 0,
            paymentStatus:
              apiOrder.payment_status || apiOrder.paymentStatus || "pending",
            paymentMethod:
              apiOrder.payment_method || apiOrder.paymentMethod || "transfer",
            createdAt:
              apiOrder.createdAt ||
              apiOrder.created_at ||
              new Date().toISOString(),
            updatedAt:
              apiOrder.updatedAt ||
              apiOrder.updated_at ||
              apiOrder.update_at ||
              new Date().toISOString(),
            notes: apiOrder.notes || "",

            // Basic service info without additional API calls
            service: {
              name: "Xét nghiệm DNA",
              type: "dna_test",
            },

            // Placeholder counts - will be loaded on demand
            participantCount: 0,
            sampleCount: 0,
          };
        });

        console.log("✅ Basic orders loaded:", basicOrders);
        setOrders(basicOrders);
        setFilteredOrders(basicOrders);
      } else {
        console.log("📭 No orders found for user");
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error("❌ Error loading user orders:", error);
      throw new Error("Không thể tải danh sách đơn hàng của bạn");
    }
  };

  // Quick refresh without detailed loading
  const handleRefresh = async () => {
    if (!currentUser) return;

    try {
      setRefreshing(true);
      await loadUserOrdersOptimized(currentUser.id);
    } catch (error) {
      console.error("❌ Error refreshing orders:", error);
      setError("Không thể làm mới dữ liệu");
    } finally {
      setRefreshing(false);
    }
  };

  // Filter orders when filter or search changes
  useEffect(() => {
    let filtered = orders;

    if (activeFilter !== "all") {
      filtered = filtered.filter((order) => order.status === activeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.service?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, activeFilter, searchTerm]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, any> = {
      pending: {
        label: "Chờ xử lý",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        progress: 10,
      },
      confirmed: {
        label: "Đã xác nhận",
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
        progress: 25,
      },
      kit_sent: {
        label: "Đã gửi kit",
        color: "bg-purple-100 text-purple-800",
        icon: Package,
        progress: 40,
      },
      sample_collected: {
        label: "Đã thu mẫu",
        color: "bg-indigo-100 text-indigo-800",
        icon: Package,
        progress: 60,
      },
      processing: {
        label: "Đang xét nghiệm",
        color: "bg-orange-100 text-orange-800",
        icon: RefreshCw,
        progress: 80,
      },
      completed: {
        label: "Hoàn thành",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        progress: 100,
      },
      cancelled: {
        label: "Đã hủy",
        color: "bg-red-100 text-red-800",
        icon: AlertCircle,
        progress: 0,
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  const getPaymentStatusInfo = (status: string) => {
    return status === "paid"
      ? { label: "Đã thanh toán", color: "text-green-600" }
      : { label: "Chờ thanh toán", color: "text-yellow-600" };
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  // Calculate stats
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const activeOrders = orders.filter(
    (o) => o.status !== "completed" && o.status !== "cancelled"
  ).length;
  const unreadNotifications = notifications.filter((n) => !n.isRead).length;

  const filterOptions = [
    { value: "all", label: "Tất cả", count: orders.length },
    {
      value: "pending",
      label: "Chờ xử lý",
      count: orders.filter((o) => o.status === "pending").length,
    },
    {
      value: "processing",
      label: "Đang xử lý",
      count: orders.filter((o) => o.status === "processing").length,
    },
    {
      value: "completed",
      label: "Hoàn thành",
      count: orders.filter((o) => o.status === "completed").length,
    },
  ];

  // Simple loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Đang tải dashboard...
          </h2>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Xin chào,{" "}
                {currentUser?.full_name ||
                  currentUser?.fullName ||
                  "Khách hàng"}
                ! Quản lý đơn hàng và theo dõi kết quả xét nghiệm của bạn.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Đang tải..." : "Làm mới"}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Đơn hàng hoạt động</p>
                <p className="text-3xl font-bold text-blue-600">
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
                <p className="text-3xl font-bold text-green-600">
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
                <p className="text-3xl font-bold text-orange-600">
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Đơn hàng của tôi
                  </h2>
                  <span className="text-sm text-gray-500">
                    {filteredOrders.length} đơn hàng
                  </span>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo mã đơn hàng..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setActiveFilter(option.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                          activeFilter === option.value
                            ? "bg-red-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {option.label}
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            activeFilter === option.value
                              ? "bg-red-500 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {option.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm || activeFilter !== "all"
                        ? "Không tìm thấy đơn hàng"
                        : "Chưa có đơn hàng nào"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm || activeFilter !== "all"
                        ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                        : "Bắt đầu đặt dịch vụ xét nghiệm DNA ngay hôm nay"}
                    </p>
                    {!searchTerm && activeFilter === "all" && (
                      <Link
                        to="/services"
                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Đặt dịch vụ ngay
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => {
                      const statusInfo = getStatusInfo(order.status);
                      const paymentInfo = getPaymentStatusInfo(
                        order.paymentStatus
                      );
                      const StatusIcon = statusInfo.icon;

                      return (
                        <div
                          key={order.id}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <StatusIcon
                                  className={`w-5 h-5 text-red-600 ${
                                    statusInfo.icon === RefreshCw
                                      ? "animate-spin"
                                      : ""
                                  }`}
                                />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                  {order.service?.name || "Dịch vụ DNA"}
                                </h3>
                                <p className="text-sm text-gray-500 font-mono">
                                  Mã: {order.orderCode}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-red-600">
                                {formatPrice(order.totalAmount)}
                              </p>
                              <p className={`text-sm ${paymentInfo.color}`}>
                                {paymentInfo.label}
                              </p>
                            </div>
                          </div>

                          {/* Order Info and Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>
                                Ngày đặt: {formatDate(order.createdAt)}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                              >
                                {statusInfo.label}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewOrder(order.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                Xem chi tiết
                              </button>
                              {order.status === "completed" && (
                                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                                  <Download className="w-4 h-4" />
                                  Tải kết quả
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                <Link
                  to="/profile"
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Settings className="w-5 h-5" />
                  Cài đặt tài khoản
                </Link>
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
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
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
                  className="flex items-center gap-2 text-white hover:text-red-100 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">1900 1234</span>
                </a>
                <a
                  href="mailto:support@vietgene.vn"
                  className="flex items-center gap-2 text-white hover:text-red-100 transition-colors"
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
