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
  Loader,
  Eye,
  Users,
} from "lucide-react";
import { orderService } from "../../services/orderService";
import { formatPrice } from "../../services/serviceService";

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("progress");

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id) {
        navigate("/dashboard");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("🔍 Fetching order detail for ID:", id);

        // Get complete order data from API/mock
        const completeOrderData = await orderService.getCompleteOrderData(id);
        console.log("📦 Complete order data received:", completeOrderData);

        setOrder(completeOrderData);
      } catch (err) {
        console.error("❌ Error fetching order detail:", err);
        setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Không tìm thấy đơn hàng"}
          </h2>
          <Link
            to="/dashboard"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Quay lại Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Helper functions
  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return "Chưa có";
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Không hợp lệ";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa có";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Không hợp lệ";
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, any> = {
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
      processing: {
        label: "Đang xử lý",
        color: "bg-purple-100 text-purple-800",
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
    return statusMap[status] || statusMap.pending;
  };

  const getPaymentMethodName = (method: string) => {
    const methods: Record<string, string> = {
      transfer: "Chuyển khoản ngân hàng",
      cash: "Tiền mặt",
      card: "Thẻ tín dụng",
    };
    return methods[method] || method;
  };

  const getPaymentStatusName = (status: string) => {
    const statuses: Record<string, string> = {
      pending: "Chờ thanh toán",
      paid: "Đã thanh toán",
      failed: "Thanh toán thất bại",
      refunded: "Đã hoàn tiền",
    };
    return statuses[status] || status;
  };

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  // Generate tracking steps based on order status
  const getTrackingSteps = (orderStatus: string) => {
    const baseSteps = [
      {
        step: 1,
        title: "Đơn hàng được xác nhận",
        status: "completed",
        date: order.createdAt,
        description: "Đơn hàng đã được tạo và xác nhận thành công",
      },
      {
        step: 2,
        title: "Chuẩn bị kit xét nghiệm",
        status: orderStatus === "pending" ? "current" : "completed",
        date:
          orderStatus === "pending" ? "" : order.updatedAt || order.update_at,
        description: "Kit xét nghiệm đang được chuẩn bị và đóng gói",
      },
      {
        step: 3,
        title: "Gửi kit đến khách hàng",
        status:
          orderStatus === "processing"
            ? "current"
            : orderStatus === "completed"
            ? "completed"
            : "pending",
        date:
          orderStatus === "completed" ? order.updatedAt || order.update_at : "",
        description: "Kit được gửi qua đường vận chuyển",
      },
      {
        step: 4,
        title: "Phân tích tại phòng lab",
        status: orderStatus === "completed" ? "completed" : "pending",
        date:
          orderStatus === "completed" ? order.updatedAt || order.update_at : "",
        description: "Mẫu đang được phân tích tại phòng lab",
      },
      {
        step: 5,
        title: "Kết quả hoàn thành",
        status: orderStatus === "completed" ? "completed" : "pending",
        date:
          orderStatus === "completed" ? order.updatedAt || order.update_at : "",
        description: "Kết quả đã hoàn thành và sẵn sàng tải về",
      },
    ];
    return baseSteps;
  };

  const trackingSteps = getTrackingSteps(order.status);

  // Safe access to nested properties
  const orderCode = order.orderCode || order.order_code || order.id;
  const totalAmount = order.totalAmount || order.total_amount || 0;
  const paymentMethod = order.paymentMethod || order.payment_method || "";
  const paymentStatus = order.paymentStatus || order.payment_status || "";
  const paymentDate = order.paymentDate || order.payment_date;
  const transactionId = order.transactionId || order.transaction_id;
  const notes = order.notes || "";
  const createdAt = order.createdAt || order.created_at;
  const updatedAt = order.updatedAt || order.updated_at || order.update_at;

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
                Đơn hàng #{orderCode}
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-semibold text-red-600 font-mono">
                    {orderCode}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ngày đặt:</span>
                  <span className="font-medium">{formatDate(createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cập nhật cuối:</span>
                  <span className="font-medium">{formatDate(updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span
                    className={`font-medium px-2 py-1 rounded text-xs ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Thông tin thanh toán
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng tiền:</span>
                    <span className="font-bold text-lg text-red-600">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức:</span>
                    <span className="font-medium">
                      {getPaymentMethodName(paymentMethod)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span
                      className={`font-medium px-2 py-1 rounded text-xs ${
                        paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {getPaymentStatusName(paymentStatus)}
                    </span>
                  </div>
                  {paymentDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày thanh toán:</span>
                      <span className="font-medium">
                        {formatDate(paymentDate)}
                      </span>
                    </div>
                  )}
                  {transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã GD:</span>
                      <span className="font-medium font-mono text-xs">
                        {transactionId}
                      </span>
                    </div>
                  )}
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
                { id: "participants", label: "Người tham gia", icon: Users },
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
                  {trackingSteps.map((step, index) => (
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
                {/* Order Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Thông tin đơn hàng
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Mã đơn hàng</p>
                          <p className="font-medium text-gray-900 font-mono">
                            {orderCode}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Trạng thái</p>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Ngày tạo</p>
                          <p className="font-medium text-gray-900">
                            {formatDateTime(createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Tổng tiền</p>
                          <p className="font-bold text-lg text-red-600">
                            {formatPrice(totalAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Thanh toán</p>
                          <p className="font-medium text-gray-900">
                            {getPaymentMethodName(paymentMethod)}
                          </p>
                        </div>
                        {notes && (
                          <div>
                            <p className="text-sm text-gray-600">Ghi chú</p>
                            <p className="font-medium text-gray-900">{notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details (Services) */}
                {order.orderDetails && order.orderDetails.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Dịch vụ đã đặt
                    </h3>
                    <div className="space-y-4">
                      {order.orderDetails.map((detail: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              Dịch vụ #{index + 1}
                            </h4>
                            <span className="font-bold text-red-600">
                              {formatPrice(
                                detail.subtotal ||
                                  detail.unitPrice ||
                                  detail.unit_price ||
                                  0
                              )}
                            </span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">
                                Số lượng:{" "}
                                <span className="font-medium">
                                  {detail.quantity || 1}
                                </span>
                              </p>
                              <p className="text-gray-600">
                                Đơn giá:{" "}
                                <span className="font-medium">
                                  {formatPrice(
                                    detail.unitPrice || detail.unit_price || 0
                                  )}
                                </span>
                              </p>
                            </div>
                            {(detail.notes || detail.note) && (
                              <div>
                                <p className="text-gray-600">Ghi chú:</p>
                                <p className="font-medium">
                                  {detail.notes || detail.note}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Participants Tab */}
            {activeTab === "participants" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Người tham gia xét nghiệm
                </h3>

                {order.participants && order.participants.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {order.participants.map(
                      (participant: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {participant.participantName ||
                                  participant.participant_name ||
                                  `Người tham gia ${index + 1}`}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Người tham gia #{index + 1}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Mối quan hệ:
                              </span>
                              <span className="font-medium">
                                {participant.relationship || "Chưa xác định"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tuổi:</span>
                              <span className="font-medium">
                                {participant.age || "Chưa xác định"} tuổi
                              </span>
                            </div>
                            {(participant.notes || participant.note) && (
                              <div>
                                <p className="text-gray-600 mb-1">Ghi chú:</p>
                                <p className="font-medium text-xs bg-white p-2 rounded">
                                  {participant.notes || participant.note}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Chưa có thông tin người tham gia
                    </p>
                  </div>
                )}
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
