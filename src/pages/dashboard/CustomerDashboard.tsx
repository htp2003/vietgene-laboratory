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
    id?: string;
  };
  progress?: number;
  participants?: Array<{
    id: string;
    participantName: string;
    relationship: string;
    age: number;
  }>;
  orderDetails?: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  samples?: Array<{
    id: string;
    sampleCode: string;
    status: string;
    collectionMethod: string;
  }>;
  appointment?: {
    id: string;
    appointmentDate: string;
    appointmentType: string;
    status: string;
    notes?: string;
    doctorTimeSlot?: string;
  } | null;
}

// Progress Loading Component
const ProgressLoader: React.FC<{
  progress: number;
  message: string;
  subMessage?: string;
}> = ({ progress, message, subMessage }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md w-full px-6">
        {/* Logo or Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-8 h-8 text-red-600" />
        </div>

        {/* Main Message */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>

        {/* Sub Message */}
        {subMessage && <p className="text-gray-600 mb-6">{subMessage}</p>}

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
          </div>
        </div>

        {/* Progress Percentage */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Đang tải dữ liệu...</span>
          <span className="font-medium text-red-600">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Đang khởi tạo...");
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

  // Simulate loading progress
  const simulateProgress = (
    targetProgress: number,
    message: string,
    duration: number = 1000
  ) => {
    return new Promise<void>((resolve) => {
      setLoadingMessage(message);
      const startProgress = loadingProgress;
      const progressDiff = targetProgress - startProgress;
      const stepTime = duration / Math.abs(progressDiff);

      let currentProgress = startProgress;
      const interval = setInterval(() => {
        currentProgress += progressDiff > 0 ? 1 : -1;
        setLoadingProgress(currentProgress);

        if (currentProgress === targetProgress) {
          clearInterval(interval);
          resolve();
        }
      }, stepTime);
    });
  };

  // Load dashboard data with progress simulation
  useEffect(() => {
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      setError(null);

      // Step 1: Check authentication
      await simulateProgress(15, "Đang xác thực người dùng...", 300);
      if (!authService.isAuthenticated()) {
        navigate("/login");
        return;
      }

      // Step 2: Get current user
      await simulateProgress(30, "Đang tải thông tin tài khoản...", 400);
      const user = authService.getCurrentUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setCurrentUser(user);

      // Step 3: Load user orders
      await simulateProgress(50, "Đang tải danh sách đơn hàng...", 500);
      await loadUserOrders(user.id);

      // Step 4: Complete
      await simulateProgress(100, "Hoàn tất!", 300);

      console.log("✅ Dashboard loaded successfully");
    } catch (err) {
      console.error("❌ Error loading dashboard:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải dữ liệu dashboard. Vui lòng thử lại sau."
      );
    } finally {
      // Small delay to show 100% completion
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const loadUserOrders = async (userId: string) => {
    try {
      console.log("🔍 Loading orders for user:", userId);

      // Update progress during order loading
      setLoadingMessage("Đang tải đơn hàng từ server...");
      const userOrders = await orderService.getUserOrders(userId);

      await simulateProgress(70, "Đang xử lý dữ liệu đơn hàng...", 300);
      console.log("📦 Raw orders from API:", userOrders);

      if (userOrders && userOrders.length > 0) {
        await simulateProgress(85, "Đang tải chi tiết đơn hàng...", 400);

        // Transform and enhance orders with additional data
        const enhancedOrders = await Promise.all(
          userOrders.map(async (apiOrder: any, index: number) => {
            try {
              // Update progress for each order
              const progressStep = Math.floor(5 / userOrders.length);
              await simulateProgress(
                85 + (index + 1) * progressStep,
                `Đang xử lý đơn hàng ${index + 1}/${userOrders.length}...`,
                200
              );

              // ✅ FIX: Use the corrected getCompleteOrderData method
              const completeOrderData = await orderService.getCompleteOrderData(
                apiOrder.orderId || apiOrder.id
              );

              console.log(
                `📋 Complete data for order ${apiOrder.orderId}:`,
                completeOrderData
              );

              // Transform API data to component format
              const transformedOrder: Order = {
                id: apiOrder.orderId || apiOrder.id,
                orderCode:
                  apiOrder.order_code ||
                  apiOrder.orderCode ||
                  `DNA-${(apiOrder.orderId || apiOrder.id).slice(-8)}`,
                status: apiOrder.status || "pending",
                totalAmount: apiOrder.total_amount || apiOrder.totalAmount || 0,
                paymentStatus:
                  apiOrder.payment_status ||
                  apiOrder.paymentStatus ||
                  "pending",
                paymentMethod:
                  apiOrder.payment_method ||
                  apiOrder.paymentMethod ||
                  "transfer",
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

                // Service info from order details
                service: {
                  name:
                    getServiceNameFromOrderDetails(
                      completeOrderData.orderDetails
                    ) || "Xét nghiệm DNA",
                  type: "dna_test",
                  id: completeOrderData.orderDetails?.[0]?.dnaServiceId,
                },

                // Participants
                participants:
                  completeOrderData.participants?.map((p: any) => ({
                    id: p.id,
                    participantName:
                      p.participantName ||
                      p.participant_name ||
                      "Không xác định",
                    relationship: p.relationship || "Không xác định",
                    age: p.age || 0,
                  })) || [],

                // Order details
                orderDetails:
                  completeOrderData.orderDetails?.map((od: any) => ({
                    id: od.id,
                    quantity: od.quantity || 1,
                    unitPrice: od.unit_price || od.unitPrice || 0,
                    subtotal: od.subtotal || 0,
                  })) || [],

                // Samples
                samples:
                  completeOrderData.samples?.map((s: any) => ({
                    id: s.id,
                    sampleCode: s.sample_code || s.sampleCode || "",
                    status: s.status || "pending",
                    collectionMethod:
                      s.collection_method || s.collectionMethod || "home",
                  })) || [],

                // ✅ FIX: Handle appointment data properly
                appointment: completeOrderData.appointment
                  ? {
                      id: completeOrderData.appointment.id,
                      appointmentDate:
                        completeOrderData.appointment.appointment_date,
                      appointmentType:
                        completeOrderData.appointment.appointment_type,
                      status: completeOrderData.appointment.status,
                      notes: completeOrderData.appointment.notes,
                      doctorTimeSlot:
                        completeOrderData.appointment.doctor_time_slot,
                    }
                  : null,

                // Calculate progress based on status and samples
                progress: calculateOrderProgress(
                  apiOrder.status,
                  completeOrderData.samples,
                  completeOrderData.appointment
                ),
              };

              return transformedOrder;
            } catch (error) {
              console.warn(
                `⚠️ Error loading complete data for order ${apiOrder.orderId}:`,
                error
              );

              // Fallback to basic order data
              return {
                id: apiOrder.orderId || apiOrder.id,
                orderCode:
                  apiOrder.order_code ||
                  `DNA-${(apiOrder.orderId || apiOrder.id).slice(-8)}`,
                status: apiOrder.status || "pending",
                totalAmount: apiOrder.total_amount || 0,
                paymentStatus: apiOrder.payment_status || "pending",
                paymentMethod: apiOrder.payment_method || "transfer",
                createdAt:
                  apiOrder.createdAt ||
                  apiOrder.created_at ||
                  new Date().toISOString(),
                updatedAt:
                  apiOrder.updatedAt ||
                  apiOrder.updated_at ||
                  new Date().toISOString(),
                service: {
                  name: "Xét nghiệm DNA",
                  type: "dna_test",
                },
                participants: [],
                progress: getStatusInfo(apiOrder.status || "pending").progress,
              } as Order;
            }
          })
        );

        console.log("✅ Enhanced orders:", enhancedOrders);
        setOrders(enhancedOrders);
        setFilteredOrders(enhancedOrders);
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

  const calculateOrderProgress = (
    status: string,
    samples: any[],
    appointment: any
  ): number => {
    const baseProgress = getStatusInfo(status).progress;
    let appointmentProgress = 0;
    if (appointment) {
      appointmentProgress = appointment.status ? 30 : 20;
    }

    let sampleProgress = 0;
    if (samples && samples.length > 0) {
      const sampleProgressMap: Record<string, number> = {
        pending_collection: 10,
        scheduled: 20,
        collected: 40,
        shipped: 50,
        received: 60,
        analyzing: 80,
        completed: 100,
      };

      sampleProgress =
        samples.reduce((acc, sample) => {
          return acc + (sampleProgressMap[sample.status] || 0);
        }, 0) / samples.length;
    }

    return Math.max(baseProgress, appointmentProgress, sampleProgress);
  };

  const getServiceNameFromOrderDetails = (orderDetails: any[]): string => {
    if (!orderDetails || orderDetails.length === 0) {
      return "Xét nghiệm DNA";
    }
    return "Xét nghiệm quan hệ huyết thống DNA";
  };

  // Refresh with progress
  const handleRefresh = async () => {
    if (!currentUser) return;

    try {
      setRefreshing(true);
      setLoadingProgress(0);

      await simulateProgress(30, "Đang làm mới dữ liệu...", 300);
      await loadUserOrders(currentUser.id);
      await simulateProgress(100, "Làm mới hoàn tất!", 200);
    } catch (error) {
      console.error("❌ Error refreshing orders:", error);
      setError("Không thể làm mới dữ liệu");
    } finally {
      setTimeout(() => {
        setRefreshing(false);
        setLoadingProgress(0);
      }, 300);
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

  // Show progress loader during initial loading
  if (loading) {
    return (
      <ProgressLoader
        progress={loadingProgress}
        message={loadingMessage}
        subMessage="Vui lòng đợi trong giây lát..."
      />
    );
  }

  // Show mini progress bar during refresh
  const MiniProgressBar = () => {
    if (!refreshing) return null;

    return (
      <div className="fixed top-0 left-0 w-full z-50">
        <div className="h-1 bg-gray-200">
          <div
            className="h-1 bg-red-600 transition-all duration-300"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MiniProgressBar />

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
                      const progress = order.progress || statusInfo.progress;

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
                                {/* Show participants count and samples count */}
                                <div className="flex items-center gap-4 mt-1">
                                  {order.participants &&
                                    order.participants.length > 0 && (
                                      <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {order.participants.length} người tham
                                        gia
                                      </p>
                                    )}
                                  {order.samples &&
                                    order.samples.length > 0 && (
                                      <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Package className="w-3 h-3" />
                                        {order.samples.length} mẫu
                                      </p>
                                    )}
                                </div>
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

                          {/* Enhanced Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                              <span>Tiến độ</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500 ease-out relative"
                                style={{ width: `${progress}%` }}
                              >
                                {/* Animated shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
                              </div>
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
