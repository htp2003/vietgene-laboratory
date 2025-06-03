import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  Package,
  Phone,
  Mail,
  FileText,
  ArrowRight,
  Home,
  User,
} from "lucide-react";

// Mock order data - normally would come from API/state
const mockOrderData = {
  orderId: "VG" + Date.now().toString().slice(-8),
  orderCode: "DNA-" + Math.random().toString(36).substr(2, 8).toUpperCase(),
  service: {
    name: "Xét nghiệm quan hệ cha con",
    type: "civil",
    price: 2500000,
    duration: 5,
  },
  customer: {
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0987654321",
  },
  collectionMethod: "self_collect", // or 'facility_collect'
  appointmentDate: "2025-06-10",
  participants: [
    { name: "Nguyễn Văn A", relationship: "Cha", age: "35" },
    { name: "Nguyễn Văn B", relationship: "Con", age: "8" },
  ],
  payment: {
    method: "transfer",
    status: "pending",
    amount: 2500000,
  },
  estimatedResult: "2025-06-15",
  trackingSteps: [
    {
      step: 1,
      title: "Đơn hàng được xác nhận",
      status: "completed",
      date: "2025-06-04",
    },
    { step: 2, title: "Chuẩn bị kit xét nghiệm", status: "current", date: "" },
    { step: 3, title: "Gửi kit đến khách hàng", status: "pending", date: "" },
    { step: 4, title: "Thu thập mẫu", status: "pending", date: "" },
    { step: 5, title: "Phân tích tại phòng lab", status: "pending", date: "" },
    { step: 6, title: "Kết quả hoàn thành", status: "pending", date: "" },
  ],
};

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [orderData] = useState(mockOrderData);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

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

  const getPaymentMethodName = (method: string) => {
    const methods = {
      transfer: "Chuyển khoản",
      cash: "Tiền mặt",
    };
    return methods[method as keyof typeof methods] || method;
  };

  const getCollectionMethodName = (method: string) => {
    return method === "self_collect" ? "Lấy mẫu tại nhà" : "Lấy mẫu tại cơ sở";
  };

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
              <p className="text-xl font-bold text-red-600">
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
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{orderData.customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{orderData.customer.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 mb-4">
              Người tham gia xét nghiệm
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {orderData.participants.map((participant, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">
                    {participant.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {participant.relationship} - {participant.age} tuổi
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Collection Method */}
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
              {orderData.collectionMethod === "facility_collect" &&
                orderData.appointmentDate && (
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
            {orderData.collectionMethod === "self_collect" ? (
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
