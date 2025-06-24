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
  CreditCard,
  RefreshCw,
  MessageCircle,
  Loader,
  Users,
  TestTube,
  FileText,
  Download,
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
        const completeOrderData = await orderService.getCompleteOrderData(id);
        setOrder(completeOrderData);
      } catch (err) {
        console.error("❌ Error fetching order detail:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải thông tin đơn hàng. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id, navigate]);

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
        description: "Đơn hàng đang được xử lý",
      },
      confirmed: {
        label: "Đã xác nhận",
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
        description: "Đơn hàng đã được xác nhận",
      },
      processing: {
        label: "Đang xử lý",
        color: "bg-purple-100 text-purple-800",
        icon: RefreshCw,
        description: "Đang chuẩn bị và xử lý mẫu",
      },
      completed: {
        label: "Hoàn thành",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        description: "Xét nghiệm hoàn thành, kết quả đã sẵn sàng",
      },
      cancelled: {
        label: "Đã hủy",
        color: "bg-red-100 text-red-800",
        icon: AlertCircle,
        description: "Đơn hàng đã bị hủy",
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

  const getSampleStatusInfo = (status: string) => {
    const statusMap: Record<string, any> = {
      pending_collection: {
        label: "Chờ thu thập",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        description: "Đang chờ thu thập mẫu",
      },
      scheduled: {
        label: "Đã lên lịch",
        color: "bg-blue-100 text-blue-800",
        icon: Calendar,
        description: "Đã lên lịch thu thập mẫu",
      },
      collected: {
        label: "Đã thu thập",
        color: "bg-purple-100 text-purple-800",
        icon: TestTube,
        description: "Mẫu đã được thu thập",
      },
      shipped: {
        label: "Đang vận chuyển",
        color: "bg-indigo-100 text-indigo-800",
        icon: Package,
        description: "Mẫu đang được vận chuyển về lab",
      },
      received: {
        label: "Đã nhận tại lab",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        description: "Lab đã nhận được mẫu",
      },
      analyzing: {
        label: "Đang phân tích",
        color: "bg-orange-100 text-orange-800",
        icon: RefreshCw,
        description: "Mẫu đang được phân tích",
      },
      completed: {
        label: "Hoàn thành",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        description: "Phân tích mẫu đã hoàn thành",
      },
    };
    return statusMap[status] || statusMap.pending_collection;
  };

  const getTrackingSteps = (orderData: any) => {
    return [
      {
        step: 1,
        title: "Đơn hàng được xác nhận",
        status: "completed",
        date: orderData.createdAt || orderData.created_at,
        description: "Đơn hàng đã được tạo và xác nhận thành công",
      },
      {
        step: 2,
        title: "Chuẩn bị thu thập mẫu",
        status: orderData.status === "pending" ? "current" : "completed",
        date:
          orderData.status !== "pending"
            ? orderData.updatedAt || orderData.update_at
            : "",
        description: "Chuẩn bị kit xét nghiệm và lịch thu thập mẫu",
      },
      {
        step: 3,
        title: "Thu thập mẫu",
        status:
          orderData.status === "processing"
            ? "current"
            : orderData.status === "completed"
            ? "completed"
            : "pending",
        date:
          orderData.status === "completed"
            ? orderData.updatedAt || orderData.update_at
            : "",
        description: "Mẫu xét nghiệm đang được thu thập",
      },
      {
        step: 4,
        title: "Phân tích tại phòng lab",
        status: orderData.status === "completed" ? "completed" : "pending",
        date:
          orderData.status === "completed"
            ? orderData.updatedAt || orderData.update_at
            : "",
        description: "Mẫu đang được phân tích tại phòng lab",
      },
      {
        step: 5,
        title: "Kết quả hoàn thành",
        status: orderData.status === "completed" ? "completed" : "pending",
        date:
          orderData.status === "completed"
            ? orderData.updatedAt || orderData.update_at
            : "",
        description: "Kết quả đã hoàn thành và sẵn sàng tải về",
      },
    ];
  };

  const getOrderData = (order: any) => {
    if (!order) return {};
    return {
      orderCode: order.orderCode || order.order_code || order.id,
      totalAmount: order.totalAmount || order.total_amount || 0,
      paymentMethod: order.paymentMethod || order.payment_method || "",
      paymentStatus: order.paymentStatus || order.payment_status || "",
      paymentDate: order.paymentDate || order.payment_date,
      transactionId: order.transactionId || order.transaction_id,
      notes: order.notes || "",
      createdAt: order.createdAt || order.created_at,
      updatedAt: order.updatedAt || order.updated_at || order.update_at,
      status: order.status || "pending",
    };
  };

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

  const orderData = getOrderData(order);
  const statusInfo = getStatusInfo(orderData.status);
  const StatusIcon = statusInfo.icon;
  const trackingSteps = getTrackingSteps(order);

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
                Đơn hàng #{orderData.orderCode}
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-semibold text-red-600 font-mono">
                    {orderData.orderCode}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ngày đặt:</span>
                  <span className="font-medium">
                    {formatDate(orderData.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cập nhật cuối:</span>
                  <span className="font-medium">
                    {formatDate(orderData.updatedAt)}
                  </span>
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
                      {formatPrice(orderData.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức:</span>
                    <span className="font-medium">
                      {getPaymentMethodName(orderData.paymentMethod)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span
                      className={`font-medium px-2 py-1 rounded text-xs ${
                        orderData.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {getPaymentStatusName(orderData.paymentStatus)}
                    </span>
                  </div>
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
                { id: "samples", label: "Mẫu xét nghiệm", icon: TestTube },
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
                    {tab.id === "samples" && order.samples?.length > 0 && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        {order.samples.length}
                      </span>
                    )}
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
                            {orderData.orderCode}
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
                            {formatDateTime(orderData.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Tổng tiền</p>
                          <p className="font-bold text-lg text-red-600">
                            {formatPrice(orderData.totalAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Thanh toán</p>
                          <p className="font-medium text-gray-900">
                            {getPaymentMethodName(orderData.paymentMethod)}
                          </p>
                        </div>
                        {orderData.notes && (
                          <div>
                            <p className="text-sm text-gray-600">Ghi chú</p>
                            <p className="font-medium text-gray-900">
                              {orderData.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
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

            {/* Samples Tab */}
            {activeTab === "samples" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Mẫu xét nghiệm
                </h3>

                {order.samples && order.samples.length > 0 ? (
                  <div className="space-y-4">
                    {order.samples.map((sample: any, index: number) => {
                      const sampleStatusInfo = getSampleStatusInfo(
                        sample.status
                      );
                      const SampleIcon = sampleStatusInfo.icon;

                      return (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <TestTube className="w-6 h-6 text-red-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {sample.sample_code || `SAM-${index + 1}`}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {sample.sample_type || "Mẫu nước bọt"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${sampleStatusInfo.color}`}
                              >
                                <SampleIcon className="w-3 h-3" />
                                {sampleStatusInfo.label}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {sampleStatusInfo.description}
                              </p>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 font-medium">
                                Phương thức:
                              </p>
                              <p className="text-gray-900">
                                {sample.collection_method === "home"
                                  ? "🏠 Lấy mẫu tại nhà"
                                  : "🏥 Lấy mẫu tại cơ sở"}
                              </p>
                            </div>

                            {sample.collection_date && (
                              <div>
                                <p className="text-gray-600 font-medium">
                                  Ngày thu thập:
                                </p>
                                <p className="text-gray-900">
                                  {formatDateTime(sample.collection_date)}
                                </p>
                              </div>
                            )}

                            {sample.received_date && (
                              <div>
                                <p className="text-gray-600 font-medium">
                                  Ngày nhận tại lab:
                                </p>
                                <p className="text-gray-900">
                                  {formatDateTime(sample.received_date)}
                                </p>
                              </div>
                            )}

                            {sample.shipping_tracking && (
                              <div>
                                <p className="text-gray-600 font-medium">
                                  Mã vận chuyển:
                                </p>
                                <p className="text-gray-900 font-mono text-xs">
                                  {sample.shipping_tracking}
                                </p>
                              </div>
                            )}

                            {sample.sample_quality && (
                              <div>
                                <p className="text-gray-600 font-medium">
                                  Chất lượng:
                                </p>
                                <p className="text-gray-900">
                                  {sample.sample_quality}
                                </p>
                              </div>
                            )}

                            <div>
                              <p className="text-gray-600 font-medium">
                                Người tham gia:
                              </p>
                              <p className="text-gray-900">
                                {/* Extract participant name from notes */}
                                {sample.notes?.includes("Sample for")
                                  ? sample.notes
                                      .split("Sample for ")[1]
                                      ?.split(" (")[0]
                                  : "Chưa xác định"}
                              </p>
                            </div>
                          </div>

                          {sample.notes && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-red-500">
                              <p className="text-gray-600 text-sm font-medium mb-1">
                                Ghi chú:
                              </p>
                              <p className="text-sm text-gray-800">
                                {sample.notes}
                              </p>
                            </div>
                          )}

                          {/* Sample Progress Bar */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Tiến độ mẫu
                              </span>
                              <span className="text-sm text-gray-500">
                                {sample.status === "completed"
                                  ? "100%"
                                  : sample.status === "analyzing"
                                  ? "80%"
                                  : sample.status === "received"
                                  ? "60%"
                                  : sample.status === "collected"
                                  ? "40%"
                                  : sample.status === "scheduled"
                                  ? "20%"
                                  : "10%"}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  sample.status === "completed"
                                    ? "bg-green-500 w-full"
                                    : sample.status === "analyzing"
                                    ? "bg-orange-500 w-4/5"
                                    : sample.status === "received"
                                    ? "bg-blue-500 w-3/5"
                                    : sample.status === "collected"
                                    ? "bg-purple-500 w-2/5"
                                    : sample.status === "scheduled"
                                    ? "bg-yellow-500 w-1/5"
                                    : "bg-gray-400 w-1/12"
                                }`}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TestTube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Chưa có mẫu xét nghiệm
                    </h4>
                    <p className="text-gray-500 mb-4">
                      Mẫu sẽ được tạo tự động sau khi đơn hàng được xác nhận
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Lưu ý:</strong> Số lượng mẫu sẽ tương ứng với
                        số người tham gia xét nghiệm
                      </p>
                    </div>
                  </div>
                )}

                {/* Samples Summary */}
                {order.samples && order.samples.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <TestTube className="w-5 h-5" />
                      Tổng quan mẫu xét nghiệm
                    </h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {order.samples.length}
                        </p>
                        <p className="text-gray-600">Tổng số mẫu</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {
                            order.samples.filter((s: any) => s.collection_date)
                              .length
                          }
                        </p>
                        <p className="text-gray-600">Đã thu thập</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {
                            order.samples.filter((s: any) => s.received_date)
                              .length
                          }
                        </p>
                        <p className="text-gray-600">Đã nhận lab</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {
                            order.samples.filter(
                              (s: any) => s.status === "completed"
                            ).length
                          }
                        </p>
                        <p className="text-gray-600">Hoàn thành</p>
                      </div>
                    </div>
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

          {orderData.status === "completed" && (
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
