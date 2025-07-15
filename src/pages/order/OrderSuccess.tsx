import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  Package,
  Phone,
  Mail,
  User,
  Loader,
  AlertCircle,
  CreditCard,
  Copy,
  Home,
  QrCode,
} from "lucide-react";
import { orderService } from "../../services/orderService";
import { paymentService, PaymentUtils } from "../../services/paymentService";
import { ServiceService, formatPrice } from "../../services/serviceService";

interface OrderSuccessData {
  orderId: string;
  orderCode: string;
  service: {
    name: string;
    type: string;
    price: number;
    duration: number;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  collectionMethod: string;
  appointmentDate?: string;
  participants: Array<{
    name: string;
    relationship: string;
    age: string;
  }>;
  payment: {
    method: string;
    status: string;
    amount: number;
  };
  estimatedResult: string;
  trackingSteps: Array<{
    step: number;
    title: string;
    status: string;
    date: string;
  }>;
}

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ===== 🔄 STATE MANAGEMENT =====
  const [orderData, setOrderData] = useState<OrderSuccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // QR Code state
  const [qrData, setQrData] = useState<{
    loading: boolean;
    qrImageUrl?: string;
    bankInfo?: any;
    error?: string;
  }>({ loading: false });

  const [copiedField, setCopiedField] = useState<string | null>(null);

  // ===== 🚀 INITIALIZATION =====
  useEffect(() => {
    window.scrollTo(0, 0);
    loadOrderData();
  }, []);

  // Generate QR when order data loads and payment is transfer
  useEffect(() => {
    if (
      orderData &&
      orderData.payment.method === "transfer" &&
      orderData.payment.status === "pending"
    ) {
      generateQRCode();
    }
  }, [orderData]);

  // ===== 📊 DATA LOADING =====
  const loadOrderData = async () => {
    try {
      setLoading(true);
      setError(null);

      const stateData = location.state;

      if (stateData?.orderId) {
        console.log(
          "🔍 Loading order data from API for ID:",
          stateData.orderId
        );

        // Fetch complete order data from API
        const completeOrderData = await orderService.getCompleteOrderData(
          stateData.orderId
        );
        console.log("✅ Complete order data:", completeOrderData);

        // Get service details
        let serviceData = null;
        if (
          completeOrderData.orderDetails &&
          completeOrderData.orderDetails.length > 0
        ) {
          const firstDetail = completeOrderData.orderDetails[0];
          if (firstDetail.dnaServiceId) {
            try {
              const serviceResponse = await ServiceService.getServiceById(
                firstDetail.dnaServiceId
              );
              serviceData = serviceResponse;
              console.log("✅ Service data loaded:", serviceData);
            } catch (err) {
              console.warn("⚠️ Could not load service data:", err);
            }
          }
        }

        // Transform API data to component format
        const transformedData: OrderSuccessData = {
          orderId: completeOrderData.orderId || completeOrderData.id,
          orderCode:
            completeOrderData.order_code ||
            `DNA-${
              completeOrderData.orderId?.slice(-8) ||
              Date.now().toString().slice(-8)
            }`,
          service: {
            name:
              serviceData?.service_name ||
              stateData.service?.name ||
              "Xét nghiệm DNA",
            type: serviceData?.service_type === "civil" ? "civil" : "legal",
            price:
              serviceData?.price ||
              serviceData?.test_price ||
              stateData.service?.price ||
              completeOrderData.total_amount ||
              0,
            duration:
              serviceData?.duration_days || stateData.service?.duration || 7,
          },
          customer: {
            name: stateData.customer?.name || "Khách hàng",
            email: stateData.customer?.email || "",
            phone: stateData.customer?.phone || "",
          },
          collectionMethod:
            stateData.collectionMethod ||
            completeOrderData.collection_method ||
            "home",
          appointmentDate:
            stateData.appointmentDate ||
            completeOrderData.appointment?.appointment_date,
          participants:
            completeOrderData.participants || stateData.participants || [],
          payment: {
            method:
              completeOrderData.payment_method ||
              stateData.payment?.method ||
              "transfer",
            status:
              completeOrderData.payment_status ||
              stateData.payment?.status ||
              "pending",
            amount:
              completeOrderData.total_amount || stateData.payment?.amount || 0,
          },
          estimatedResult: calculateEstimatedResult(
            completeOrderData.created_at || completeOrderData.createdAt,
            serviceData?.duration_days || 7
          ),
          trackingSteps: generateTrackingSteps(completeOrderData),
        };

        setOrderData(transformedData);
        console.log("✅ Order data transformed:", transformedData);
      } else if (stateData) {
        // Use data passed from OrderBooking (fallback)
        console.log("📋 Using state data from OrderBooking");
        const transformedData: OrderSuccessData = {
          orderId: stateData.orderId || "ORDER_" + Date.now(),
          orderCode:
            stateData.orderCode || `DNA-${Date.now().toString().slice(-8)}`,
          service: stateData.service || {
            name: "Xét nghiệm DNA",
            type: "civil",
            price: 2500000,
            duration: 7,
          },
          customer: stateData.customer || {
            name: "Khách hàng",
            email: "",
            phone: "",
          },
          collectionMethod: stateData.collectionMethod || "home",
          appointmentDate: stateData.appointmentDate,
          participants: stateData.participants || [],
          payment: stateData.payment || {
            method: "transfer",
            status: "pending",
            amount: 2500000,
          },
          estimatedResult: calculateEstimatedResult(
            new Date().toISOString(),
            7
          ),
          trackingSteps: generateDefaultTrackingSteps(),
        };
        setOrderData(transformedData);
      } else {
        console.log("⚠️ No order data available, redirecting...");
        navigate("/services");
        return;
      }
    } catch (err) {
      console.error("❌ Error loading order data:", err);
      setError(
        err instanceof Error ? err.message : "Không thể tải thông tin đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  // ===== 💳 QR CODE GENERATION =====
  const generateQRCode = async () => {
    if (!orderData) return;

    setQrData({ loading: true });

    try {
      const result = await paymentService.generateQRCode(
        orderData.payment.amount,
        orderData.orderCode,
        orderData.customer.name
      );

      if (result.success) {
        setQrData({
          loading: false,
          qrImageUrl: result.qrDataURL,
          bankInfo: result.bankInfo,
        });
      } else {
        setQrData({
          loading: false,
          bankInfo: result.bankInfo,
          error: result.message,
        });
      }
    } catch (error: any) {
      console.error("❌ QR generation failed:", error);
      setQrData({
        loading: false,
        error: "Không thể tạo QR code",
        bankInfo: paymentService.getBankInfo(
          orderData.payment.amount,
          orderData.orderCode
        ),
      });
    }
  };

  // ===== 📋 UTILITY FUNCTIONS =====
  const calculateEstimatedResult = (
    createdDate: string,
    durationDays: number
  ): string => {
    try {
      const created = new Date(createdDate);
      const estimated = new Date(created);
      estimated.setDate(estimated.getDate() + durationDays);
      return estimated.toISOString().split("T")[0];
    } catch {
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + durationDays);
      return fallback.toISOString().split("T")[0];
    }
  };

  const generateTrackingSteps = (orderData: any) => {
    const createdDate =
      orderData.created_at || orderData.createdAt || new Date().toISOString();
    const status = orderData.status || "pending";

    return [
      {
        step: 1,
        title: "Đơn hàng được xác nhận",
        status: "completed",
        date: createdDate,
      },
      {
        step: 2,
        title: "Chuẩn bị kit xét nghiệm",
        status: status === "pending" ? "current" : "completed",
        date:
          status !== "pending"
            ? orderData.update_at || orderData.updatedAt || ""
            : "",
      },
      {
        step: 3,
        title: "Gửi kit đến khách hàng",
        status:
          status === "processing"
            ? "current"
            : status === "completed"
            ? "completed"
            : "pending",
        date: "",
      },
      {
        step: 4,
        title: "Thu thập mẫu",
        status: status === "completed" ? "completed" : "pending",
        date: "",
      },
      {
        step: 5,
        title: "Phân tích tại phòng lab",
        status: status === "completed" ? "completed" : "pending",
        date: "",
      },
      {
        step: 6,
        title: "Kết quả hoàn thành",
        status: status === "completed" ? "completed" : "pending",
        date:
          status === "completed"
            ? orderData.update_at || orderData.updatedAt || ""
            : "",
      },
    ];
  };

  const generateDefaultTrackingSteps = () => {
    const now = new Date().toISOString();
    return [
      {
        step: 1,
        title: "Đơn hàng được xác nhận",
        status: "completed",
        date: now,
      },
      {
        step: 2,
        title: "Chuẩn bị kit xét nghiệm",
        status: "current",
        date: "",
      },
      { step: 3, title: "Gửi kit đến khách hàng", status: "pending", date: "" },
      { step: 4, title: "Thu thập mẫu", status: "pending", date: "" },
      {
        step: 5,
        title: "Phân tích tại phòng lab",
        status: "pending",
        date: "",
      },
      { step: 6, title: "Kết quả hoàn thành", status: "pending", date: "" },
    ];
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa xác định";
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

  const getPaymentMethodName = (method: string) => {
    const methods: Record<string, string> = {
      transfer: "Chuyển khoản",
      cash: "Tiền mặt",
      card: "Thẻ tín dụng",
    };
    return methods[method] || method;
  };

  const getCollectionMethodName = (method: string) => {
    return method === "home" || method === "self_collect"
      ? "Lấy mẫu tại nhà"
      : "Lấy mẫu tại cơ sở";
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  // ===== 🎨 RENDER PAYMENT INSTRUCTIONS =====
  const renderPaymentInstructions = () => {
    if (!orderData || orderData.payment.status !== "pending") return null;

    if (orderData.payment.method === "transfer") {
      return (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-8">
          <h3 className="text-2xl font-bold mb-6 text-center">
            Hướng dẫn thanh toán
          </h3>

          <div className="space-y-6">
            <div className="bg-blue-800/30 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Chuyển khoản ngân hàng
              </h4>

              {qrData.bankInfo && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Bank Info */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-blue-200 text-sm">Ngân hàng:</p>
                      <div className="flex items-center justify-between bg-blue-900/50 p-3 rounded">
                        <span className="text-white font-semibold">
                          Vietcombank
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">Số tài khoản:</p>
                      <div className="flex items-center justify-between bg-blue-900/50 p-3 rounded">
                        <span className="text-white font-mono text-lg">
                          {qrData.bankInfo.accountNo}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              qrData.bankInfo.accountNo,
                              "account"
                            )
                          }
                          className="text-blue-200 hover:text-white ml-2"
                        >
                          {copiedField === "account" ? (
                            "✓"
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">Chủ tài khoản:</p>
                      <div className="flex items-center justify-between bg-blue-900/50 p-3 rounded">
                        <span className="text-white font-semibold">
                          {qrData.bankInfo.accountName}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(qrData.bankInfo.accountName, "name")
                          }
                          className="text-blue-200 hover:text-white ml-2"
                        >
                          {copiedField === "name" ? (
                            "✓"
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Amount & Content */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-blue-200 text-sm">Số tiền:</p>
                      <div className="flex items-center justify-between bg-blue-900/50 p-3 rounded">
                        <span className="text-white font-bold text-xl">
                          {PaymentUtils.formatPrice(
                            parseInt(qrData.bankInfo.amount)
                          )}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(qrData.bankInfo.amount, "amount")
                          }
                          className="text-blue-200 hover:text-white ml-2"
                        >
                          {copiedField === "amount" ? (
                            "✓"
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">
                        Nội dung chuyển khoản:
                      </p>
                      <div className="flex items-center justify-between bg-blue-900/50 p-3 rounded">
                        <span className="text-white font-mono break-all">
                          {qrData.bankInfo.content}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(qrData.bankInfo.content, "content")
                          }
                          className="text-blue-200 hover:text-white ml-2 flex-shrink-0"
                        >
                          {copiedField === "content" ? (
                            "✓"
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code Section */}
              <div className="text-center mt-6">
                <p className="text-blue-100 mb-4">
                  💡 Quét mã QR để chuyển khoản nhanh chóng
                </p>
                <div className="bg-white rounded-lg p-4 inline-block">
                  {qrData.loading ? (
                    <div className="w-48 h-48 flex items-center justify-center">
                      <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                  ) : qrData.qrImageUrl ? (
                    <img
                      src={qrData.qrImageUrl}
                      alt="QR Code thanh toán"
                      className="w-48 h-48 mx-auto"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling!.classList.remove("hidden");
                      }}
                    />
                  ) : (
                    <div className="w-48 h-48 flex flex-col items-center justify-center text-gray-500">
                      <QrCode className="w-16 h-16 mb-2" />
                      <p className="text-sm">
                        {qrData.error || "QR Code không khả dụng"}
                      </p>
                      <p className="text-xs mt-1">
                        Vui lòng chuyển khoản thủ công
                      </p>
                    </div>
                  )}
                  <div className="hidden text-gray-500 text-sm p-8">
                    QR Code không khả dụng
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-blue-100 text-sm">
                ⚡ Sau khi thanh toán, đơn hàng sẽ được xử lý ngay lập tức
              </p>
            </div>
          </div>
        </div>
      );
    } else if (orderData.payment.method === "cash") {
      return (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white text-center mb-8">
          <h3 className="text-2xl font-bold mb-4">Thanh toán tiền mặt</h3>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Phone className="w-6 h-6" />
            <span className="text-xl font-semibold">
              {PaymentUtils.formatPrice(orderData.payment.amount)}
            </span>
          </div>
          <p className="text-green-100">
            Thanh toán khi nhận dịch vụ. Nhân viên sẽ liên hệ xác nhận thời
            gian.
          </p>
        </div>
      );
    }

    return null;
  };

  // ===== 🔄 LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  // ===== ❌ ERROR STATE =====
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/services"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Đặt dịch vụ mới
            </Link>
            <Link
              to="/dashboard"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Xem dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===== 📭 NO DATA STATE =====
  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-gray-600 mb-6">
            Thông tin đơn hàng không khả dụng
          </p>
          <Link
            to="/services"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Đặt dịch vụ mới
          </Link>
        </div>
      </div>
    );
  }

  // ===== 🎉 MAIN RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Đặt dịch vụ thành công!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cảm ơn bạn đã tin tưởng VietGene Lab. Chúng tôi đã nhận được yêu cầu
            của bạn và sẽ liên hệ sớm nhất.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Thông tin đơn hàng
            </h2>
            <div className="text-right">
              <p className="text-sm text-gray-500">Mã đơn hàng</p>
              <p className="text-xl font-bold text-red-600 font-mono">
                {orderData.orderCode}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Service Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Dịch vụ đã đặt
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {orderData.service.name}
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    Loại:{" "}
                    {orderData.service.type === "civil" ? "Dân sự" : "Pháp lý"}
                  </p>
                  <p>Thời gian: {orderData.service.duration} ngày làm việc</p>
                  <p className="font-semibold text-lg text-red-600">
                    {formatPrice(orderData.service.price)}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Thông tin khách hàng
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{orderData.customer.name}</span>
                </div>
                {orderData.customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{orderData.customer.email}</span>
                  </div>
                )}
                {orderData.customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{orderData.customer.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Participants */}
          {orderData.participants && orderData.participants.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-4">
                Người tham gia xét nghiệm
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {orderData.participants.map((participant, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900">
                      {participant.participantName ||
                        participant.participant_name ||
                        participant.name ||
                        `Người tham gia ${index + 1}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {participant.relationship || "Chưa xác định"} -{" "}
                      {participant.age || "?"} tuổi
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collection Method and Payment */}
          <div className="mt-8 grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Phương thức lấy mẫu
              </h3>
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-red-600" />
                <span>
                  {getCollectionMethodName(orderData.collectionMethod)}
                </span>
              </div>
              {orderData.appointmentDate && (
                <p className="text-sm text-gray-600 mt-2">
                  Ngày hẹn: {formatDate(orderData.appointmentDate)}
                </p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Thanh toán</h3>
              <div className="space-y-2 text-sm">
                <p>
                  Phương thức: {getPaymentMethodName(orderData.payment.method)}
                </p>
                <p>
                  Trạng thái:
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      orderData.payment.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {orderData.payment.status === "paid"
                      ? "Đã thanh toán"
                      : "Chờ thanh toán"}
                  </span>
                </p>
                <p className="font-semibold text-lg text-red-600">
                  Tổng: {formatPrice(orderData.payment.amount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Tracking */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Tiến trình xử lý
          </h2>
          <div className="space-y-4">
            {orderData.trackingSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step.status === "completed"
                      ? "bg-green-500 border-green-500 text-white"
                      : step.status === "current"
                      ? "bg-red-600 border-red-600 text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {step.status === "completed" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.step}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      step.status === "completed" || step.status === "current"
                        ? "text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </p>
                  {step.date && (
                    <p className="text-sm text-gray-500">
                      {formatDate(step.date)}
                    </p>
                  )}
                </div>
                {step.status === "current" && (
                  <div className="flex items-center gap-2 text-red-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Đang xử lý</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment Instructions */}
        {renderPaymentInstructions()}

        {/* Expected Result */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white text-center mb-8">
          <h3 className="text-2xl font-bold mb-4">Kết quả dự kiến</h3>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-6 h-6" />
            <span className="text-xl font-semibold">
              {formatDate(orderData.estimatedResult)}
            </span>
          </div>
          <p className="text-red-100">
            Chúng tôi sẽ gửi thông báo qua email và SMS khi có kết quả
          </p>
        </div>

        {/* Important Notes */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-4">Lưu ý quan trọng</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>
              • Vui lòng lưu mã đơn hàng <strong>{orderData.orderCode}</strong>{" "}
              để theo dõi tiến trình
            </li>
            <li>
              • Chúng tôi sẽ liên hệ với bạn trong vòng 24h để xác nhận thông
              tin
            </li>
            {orderData.collectionMethod === "home" ||
            orderData.collectionMethod === "self_collect" ? (
              <li>
                • Kit lấy mẫu sẽ được gửi đến địa chỉ của bạn trong 2-3 ngày làm
                việc
              </li>
            ) : (
              <li>
                • Vui lòng đến đúng ngày hẹn đã đặt và mang theo CMND/CCCD
              </li>
            )}
            <li>
              • Mọi thắc mắc vui lòng liên hệ hotline:{" "}
              <strong>1900 1234</strong>
            </li>
            {orderData.payment.method === "transfer" &&
              orderData.payment.status === "pending" && (
                <li>
                  • Sau khi chuyển khoản, đơn hàng sẽ được xử lý trong vòng 24h
                </li>
              )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/services"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-medium transition-colors text-center"
          >
            Đặt thêm dịch vụ
          </Link>
          <Link
            to="/dashboard"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors text-center flex items-center justify-center gap-2"
          >
            <User className="w-5 h-5" />
            Xem dashboard
          </Link>
          <Link
            to="/"
            className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-colors text-center flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </Link>
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Cần hỗ trợ? Liên hệ với chúng tôi
          </p>
          <div className="flex justify-center gap-6">
            <a
              href="tel:19001234"
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
            >
              <Phone className="w-5 h-5" />
              1900 1234
            </a>
            <a
              href="mailto:support@vietgene.vn"
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
            >
              <Mail className="w-5 h-5" />
              support@vietgene.vn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
