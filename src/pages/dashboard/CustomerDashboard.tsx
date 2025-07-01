// pages/dashboard/CustomerDashboard.tsx (Updated for View-Only Medical)
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  ShoppingCart,
  Clock,
  CheckCircle,
  FileText,
  Calendar,
  Bell,
  Settings,
  Heart,
  Shield,
  Package,
  AlertCircle,
  Plus,
  Eye,
  ArrowRight,
  UserCheck,
  Stethoscope,
} from "lucide-react";
import { authService } from "../../services/authService";
import MedicalRecords from "../../components/medical/MedicalRecords";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  medicalRecords: number;
}

interface RecentOrder {
  id: string;
  code: string;
  serviceName: string;
  status: "pending" | "processing" | "completed";
  date: string;
  amount: number;
}

const CustomerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "medical" | "notifications"
  >("overview");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    medicalRecords: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load user profile
      const profileResponse = await authService.getUserProfile();
      if (profileResponse.success) {
        setUserProfile(profileResponse.data);
      }

      // Mock data for demonstration
      setStats({
        totalOrders: 12,
        pendingOrders: 3,
        completedOrders: 8,
        medicalRecords: 1,
      });

      setRecentOrders([
        {
          id: "1",
          code: "DNA001",
          serviceName: "Xét nghiệm ADN huyết thống",
          status: "completed",
          date: "2024-01-15",
          amount: 2500000,
        },
        {
          id: "2",
          code: "DNA002",
          serviceName: "Xét nghiệm ADN dân sự",
          status: "processing",
          date: "2024-01-20",
          amount: 1800000,
        },
        {
          id: "3",
          code: "DNA003",
          serviceName: "Xét nghiệm ADN hành chính",
          status: "pending",
          date: "2024-01-22",
          amount: 3200000,
        },
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "processing":
        return "Đang xử lý";
      case "pending":
        return "Chờ xử lý";
      default:
        return "Không xác định";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Xin chào,{" "}
                {userProfile?.full_name ||
                  userProfile?.fullName ||
                  "Khách hàng"}
                ! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Chào mừng bạn đến với bảng điều khiển cá nhân. Quản lý dịch vụ
                xét nghiệm DNA của bạn tại đây.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/services"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Đặt dịch vụ mới
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Settings className="w-5 h-5" />
                Cài đặt
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang xử lý</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hồ sơ y tế</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.medicalRecords}
                </p>
                <p className="text-xs text-gray-500 mt-1">Chỉ xem</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "overview"
                    ? "border-red-500 text-red-600 bg-red-50"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <User className="w-4 h-4" />
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "orders"
                    ? "border-red-500 text-red-600 bg-red-50"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Package className="w-4 h-4" />
                Đơn hàng
              </button>
              <button
                onClick={() => setActiveTab("medical")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "medical"
                    ? "border-red-500 text-red-600 bg-red-50"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Eye className="w-4 h-4" />
                Hồ sơ y tế
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Chỉ xem
                </span>
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "notifications"
                    ? "border-red-500 text-red-600 bg-red-50"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Bell className="w-4 h-4" />
                Thông báo
              </button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Quick Actions */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Thao tác nhanh
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Link
                      to="/services"
                      className="flex items-center gap-4 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Plus className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Đặt dịch vụ mới
                        </h4>
                        <p className="text-sm text-gray-600">
                          Xét nghiệm ADN huyết thống
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                    </Link>

                    <button
                      onClick={() => setActiveTab("medical")}
                      className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Xem hồ sơ y tế
                        </h4>
                        <p className="text-sm text-gray-600">
                          Thông tin sức khỏe của bạn
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                    </button>

                    <Link
                      to="/profile"
                      className="flex items-center gap-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Settings className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Cài đặt tài khoản
                        </h4>
                        <p className="text-sm text-gray-600">
                          Thông tin cá nhân
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                    </Link>
                  </div>
                </div>

                {/* Recent Orders */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      Đơn hàng gần đây
                    </h3>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Xem tất cả
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentOrders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {order.serviceName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Mã: {order.code} • {formatDate(order.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(order.amount)}
                          </p>
                          <Link
                            to={`/orders/${order.id}`}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Danh sách đơn hàng
                  </h3>
                  <Link
                    to="/services"
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Đặt dịch vụ mới
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-lg">
                            {order.serviceName}
                          </h4>
                          <p className="text-gray-600">
                            Mã đơn hàng: {order.code}
                          </p>
                          <p className="text-sm text-gray-500">
                            Ngày đặt: {formatDate(order.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-medium text-gray-900 text-lg">
                            {formatCurrency(order.amount)}
                          </p>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <Link
                          to={`/orders/${order.id}`}
                          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Chi tiết
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {recentOrders.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Chưa có đơn hàng nào
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Đặt dịch vụ xét nghiệm DNA đầu tiên của bạn ngay hôm nay!
                    </p>
                    <Link
                      to="/services"
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Đặt dịch vụ ngay
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "medical" && (
              <div>
                {/* Medical Records Header Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Stethoscope className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">
                        Hồ sơ y tế - Chỉ xem
                      </h4>
                      <p className="text-sm text-blue-800">
                        Bạn chỉ có thể xem hồ sơ y tế. Nhân viên y tế sẽ tạo và
                        cập nhật hồ sơ cho bạn khi cần thiết.
                      </p>
                    </div>
                  </div>
                </div>

                <MedicalRecords />
              </div>
            )}

            {activeTab === "notifications" && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Thông báo
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bell className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Kết quả xét nghiệm đã sẵn sàng
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Kết quả xét nghiệm ADN DNA001 đã hoàn thành. Bạn có thể
                        xem chi tiết trong phần đơn hàng.
                      </p>
                      <p className="text-gray-500 text-xs mt-2">2 giờ trước</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Thanh toán thành công
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Đơn hàng DNA002 đã được thanh toán thành công. Chúng tôi
                        sẽ sớm liên hệ với bạn để thu thập mẫu.
                      </p>
                      <p className="text-gray-500 text-xs mt-2">1 ngày trước</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Hồ sơ y tế đã được cập nhật
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Nhân viên y tế đã cập nhật hồ sơ y tế của bạn với thông
                        tin mới nhất. Bạn có thể xem trong tab "Hồ sơ y tế".
                      </p>
                      <p className="text-gray-500 text-xs mt-2">3 ngày trước</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">
                Bảo mật và Quyền riêng tư
              </h4>
              <p className="text-blue-800 text-sm mb-2">
                • Tất cả thông tin cá nhân và kết quả xét nghiệm được mã hóa và
                bảo mật tuyệt đối
              </p>
              <p className="text-blue-800 text-sm mb-2">
                • Hồ sơ y tế chỉ được xem bởi bạn và nhân viên y tế được ủy
                quyền
              </p>
              <p className="text-blue-800 text-sm">
                • Chúng tôi tuân thủ nghiêm ngặt các quy định về bảo vệ dữ liệu
                cá nhân và y tế
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
