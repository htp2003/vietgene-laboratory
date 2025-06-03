import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Download,
  CreditCard,
  Truck,
  Home,
  RefreshCw,
  MessageCircle,
} from "lucide-react";

// Mock order data - normally would fetch from API
const mockOrderDetails = {
  1: {
    id: 1,
    orderCode: "DNA-ABC123XY",
    serviceName: "Xét nghiệm quan hệ cha con",
    serviceType: "civil",
    status: "testing",
    createdDate: "2025-06-01",
    updatedDate: "2025-06-04",
    estimatedResult: "2025-06-08",
    price: 2500000,
    progress: 80,
    customer: {
      fullName: "Nguyễn Văn Demo",
      email: "demo@vietgene.vn",
      phone: "0987654321",
      address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
      identityCard: "079123456789",
    },
    participants: [
      { name: "Nguyễn Văn Demo", relationship: "Cha", age: "35" },
      { name: "Nguyễn Văn Junior", relationship: "Con", age: "8" },
    ],
    collectionMethod: "self_collect",
    appointmentDate: null,
    paymentMethod: "transfer",
    paymentStatus: "paid",
    paymentDate: "2025-06-01",
    transactionId: "TXN123456789",
    notes: "Gửi kit đến địa chỉ nhà riêng, liên hệ trước khi giao.",
    trackingSteps: [
      {
        step: 1,
        title: "Đơn hàng được xác nhận",
        status: "completed",
        date: "2025-06-01 09:30",
        description: "Đơn hàng đã được xác nhận và thanh toán thành công",
      },
      {
        step: 2,
        title: "Chuẩn bị kit xét nghiệm",
        status: "completed",
        date: "2025-06-01 14:20",
        description: "Kit xét nghiệm đã được chuẩn bị và đóng gói",
      },
      {
        step: 3,
        title: "Gửi kit đến khách hàng",
        status: "completed",
        date: "2025-06-02 08:15",
        description:
          "Kit đã được gửi qua đường vận chuyển. Mã vận đơn: VN123456789",
      },
      {
        step: 4,
        title: "Khách hàng nhận kit",
        status: "completed",
        date: "2025-06-03 16:45",
        description:
          "Kit đã được giao thành công và khách hàng đã xác nhận nhận hàng",
      },
      {
        step: 5,
        title: "Thu thập mẫu",
        status: "completed",
        date: "2025-06-04 10:30",
        description: "Mẫu xét nghiệm đã được thu thập và gửi về phòng lab",
      },
      {
        step: 6,
        title: "Phân tích tại phòng lab",
        status: "current",
        date: "",
        description:
          "Mẫu đang được phân tích tại phòng lab với công nghệ tiên tiến",
      },
      {
        step: 7,
        title: "Kiểm tra và xác nhận kết quả",
        status: "pending",
        date: "",
        description: "Kết quả sẽ được kiểm tra và xác nhận bởi chuyên gia",
      },
      {
        step: 8,
        title: "Kết quả hoàn thành",
        status: "pending",
        date: "",
        description: "Kết quả sẽ được gửi qua email và SMS",
      },
    ],
    timeline: [
      { date: "2025-06-01", event: "Đơn hàng được tạo", type: "order" },
      { date: "2025-06-01", event: "Thanh toán thành công", type: "payment" },
      { date: "2025-06-02", event: "Kit được gửi đi", type: "shipping" },
      { date: "2025-06-03", event: "Khách hàng nhận kit", type: "delivery" },
      { date: "2025-06-04", event: "Mẫu được thu thập", type: "sample" },
    ],
  },
};

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState(mockOrderDetails[1]);
  const [activeTab, setActiveTab] = useState("progress");

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      navigate("/login");
      return;
    }

    // Mock: fetch order data by ID
    const orderId = parseInt(id || "1");
    const orderData =
      mockOrderDetails[orderId as keyof typeof mockOrderDetails];
    if (!orderData) {
      navigate("/dashboard");
      return;
    }
    setOrder(orderData);
  }, [id, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        icon: RefreshCw,
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

  const getPaymentMethodName = (method: string) => {
    const methods = {
      transfer: "Chuyển khoản ngân hàng",
      cash: "Tiền mặt",
      card: "Thẻ tín dụng",
    };
    return methods[method as keyof typeof methods] || method;
  };

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Quay lại Dashboard
              </button>
              <span className="text-gray-400">|</span>
              <h1 className="text-xl font-semibold text-gray-900">
                Chi tiết đơn hàng
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${statusInfo.color}`}
              >
                <StatusIcon className="w-4 h-4" />
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Order Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {order.serviceName}
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-semibold text-red-600">
                    {order.orderCode}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Loại dịch vụ:</span>
                  <span className="font-medium">
                    {order.serviceType === "civil" ? "Dân sự" : "Pháp lý"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ngày đặt:</span>
                  <span className="font-medium">
                    {formatDate(order.createdDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cập nhật cuối:</span>
                  <span className="font-medium">
                    {formatDate(order.updatedDate)}
                  </span>
                </div>
                {order.estimatedResult && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Dự kiến hoàn thành:</span>
                    <span className="font-medium text-orange-600">
                      {formatDate(order.estimatedResult)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Tiến độ xử lý
                </h3>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Hoàn thành</span>
                    <span>{order.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${order.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {formatPrice(order.price)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Thanh toán:{" "}
                    {order.paymentStatus === "paid"
                      ? "Đã thanh toán"
                      : "Chưa thanh toán"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { id: "progress", label: "Tiến trình", icon: Clock },
                { id: "details", label: "Thông tin chi tiết", icon: FileText },
                { id: "payment", label: "Thanh toán", icon: CreditCard },
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-red-500 text-red-600 bg-red-50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-8">
            {/* Progress Tab */}
            {activeTab === "progress" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Tiến trình xử lý đơn hàng
                </h3>
                <div className="space-y-6">
                  {order.trackingSteps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          step.status === "completed"
                            ? "bg-green-500 border-green-500 text-white"
                            : step.status === "current"
                            ? "bg-red-600 border-red-600 text-white animate-pulse"
                            : "border-gray-300 text-gray-400 bg-white"
                        }`}
                      >
                        {step.status === "completed" ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : step.status === "current" ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <span className="text-sm font-semibold">
                            {step.step}
                          </span>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4
                            className={`font-semibold ${
                              step.status === "completed" ||
                              step.status === "current"
                                ? "text-gray-900"
                                : "text-gray-500"
                            }`}
                          >
                            {step.title}
                          </h4>
                          {step.date && (
                            <span className="text-sm text-gray-500">
                              {formatDateTime(step.date)}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm ${
                            step.status === "completed" ||
                            step.status === "current"
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
                          {step.description}
                        </p>
                        {step.status === "current" && (
                          <div className="mt-2 flex items-center gap-2 text-red-600">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-medium">
                              Đang xử lý...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="space-y-8">
                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Thông tin khách hàng
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Họ và tên</p>
                            <p className="font-medium text-gray-900">
                              {order.customer.fullName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">
                              {order.customer.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">
                              Số điện thoại
                            </p>
                            <p className="font-medium text-gray-900">
                              {order.customer.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm text-gray-600">Địa chỉ</p>
                            <p className="font-medium text-gray-900">
                              {order.customer.address}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">CMND/CCCD</p>
                            <p className="font-medium text-gray-900">
                              {order.customer.identityCard}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Người tham gia xét nghiệm
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {order.participants.map((participant, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {participant.name}
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            Mối quan hệ:{" "}
                            <span className="font-medium">
                              {participant.relationship}
                            </span>
                          </p>
                          <p>
                            Tuổi:{" "}
                            <span className="font-medium">
                              {participant.age}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Collection Method */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Phương thức lấy mẫu
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                      {order.collectionMethod === "self_collect" ? (
                        <Home className="w-5 h-5 text-red-600" />
                      ) : (
                        <Truck className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-medium text-gray-900">
                        {order.collectionMethod === "self_collect"
                          ? "Lấy mẫu tại nhà"
                          : "Lấy mẫu tại cơ sở"}
                      </span>
                    </div>
                    {order.appointmentDate && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Ngày hẹn</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(order.appointmentDate)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Ghi chú
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <p className="text-gray-700">{order.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === "payment" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Thông tin thanh toán
                </h3>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Chi tiết thanh toán
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dịch vụ:</span>
                          <span className="font-medium">
                            {order.serviceName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Đơn giá:</span>
                          <span className="font-medium">
                            {formatPrice(order.price)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-300 pt-3">
                          <span className="font-semibold text-gray-900">
                            Tổng cộng:
                          </span>
                          <span className="font-bold text-red-600 text-lg">
                            {formatPrice(order.price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Phương thức thanh toán
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Phương thức</p>
                            <p className="font-medium text-gray-900">
                              {getPaymentMethodName(order.paymentMethod)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-600">Trạng thái</p>
                            <p
                              className={`font-medium ${
                                order.paymentStatus === "paid"
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {order.paymentStatus === "paid"
                                ? "Đã thanh toán"
                                : "Chưa thanh toán"}
                            </p>
                          </div>
                        </div>
                        {order.paymentDate && (
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">
                                Ngày thanh toán
                              </p>
                              <p className="font-medium text-gray-900">
                                {formatDate(order.paymentDate)}
                              </p>
                            </div>
                          </div>
                        )}
                        {order.transactionId && (
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">
                                Mã giao dịch
                              </p>
                              <p className="font-medium text-gray-900 font-mono">
                                {order.transactionId}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Liên hệ hỗ trợ
          </button>

          {order.status === "completed" && (
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Tải kết quả xét nghiệm
            </button>
          )}

          <Link
            to="/services"
            className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5" />
            Đặt dịch vụ mới
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
