import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Phone,
  QrCode,
  Copy,
  Loader,
  AlertCircle,
} from "lucide-react";
import { OrderForm } from "../../../../hooks/useOrderBooking";
import { Doctor } from "../../../../services/orderService";
import {
  paymentService,
  PaymentUtils,
} from "../../../../services/paymentService";
import { formatPrice } from "../../../../utils/orderUtils";

interface PaymentStepProps {
  formData: OrderForm;
  updateFormData: (section: keyof OrderForm, data: any) => void;
  service: any;
  doctors: Doctor[];
  calculateTotal: () => number;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  formData,
  updateFormData,
  service,
  doctors,
  calculateTotal,
}) => {
  // ===== 🔄 STATE MANAGEMENT =====
  const [qrData, setQrData] = useState<{
    loading: boolean;
    qrImageUrl?: string;
    bankInfo?: any;
    error?: string;
  }>({ loading: false });

  const [copiedField, setCopiedField] = useState<string | null>(null);

  // ===== 📋 PAYMENT METHODS CONFIG =====
  const paymentMethods = [
    {
      value: "transfer",
      label: "Chuyển khoản",
      desc: "Thanh toán qua ngân hàng + QR Code",
      icon: CreditCard,
      available: true,
    },
    {
      value: "cash",
      label: "Tiền mặt",
      desc: "Thanh toán khi nhận dịch vụ",
      icon: Phone,
      available: true,
    },
  ];

  // ===== 🎯 DERIVED DATA =====
  const selectedDoctor = doctors.find(
    (d) =>
      d.doctorId === formData.serviceInfo.doctorId ||
      d.id === formData.serviceInfo.doctorId ||
      d.userId === formData.serviceInfo.doctorId
  );

  const totalAmount = calculateTotal();
  const orderCode = `DNA-${formData.customerInfo.fullName.replace(
    /\s+/g,
    ""
  )}-${Date.now().toString().slice(-6)}`;

  // ===== 🔄 EFFECTS =====
  useEffect(() => {
    // Generate QR when payment method is transfer and we have amount
    if (formData.paymentInfo.method === "transfer" && totalAmount > 0) {
      generateQRCode();
    }
  }, [
    formData.paymentInfo.method,
    totalAmount,
    formData.customerInfo.fullName,
  ]);

  // ===== 💳 QR CODE GENERATION =====
  const generateQRCode = async () => {
    setQrData({ loading: true });

    try {
      const result = await paymentService.generateQRCode(
        totalAmount,
        orderCode,
        formData.customerInfo.fullName
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
      setQrData({
        loading: false,
        error: "Không thể tạo QR code",
        bankInfo: paymentService.getBankInfo(totalAmount, orderCode),
      });
    }
  };

  // ===== 📋 COPY TO CLIPBOARD =====
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  // ===== 🎨 RENDER METHODS =====
  const renderBankInfo = () => {
    if (!qrData.bankInfo) return null;

    const { accountNo, accountName, amount, content } = qrData.bankInfo;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Thông tin chuyển khoản
        </h4>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Bank Details */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-blue-600 mb-1">Ngân hàng:</p>
              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <span className="font-medium">Vietcombank</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-blue-600 mb-1">Số tài khoản:</p>
              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <span className="font-mono font-medium">{accountNo}</span>
                <button
                  onClick={() => copyToClipboard(accountNo, "account")}
                  className="text-blue-600 hover:text-blue-700 ml-2"
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
              <p className="text-sm text-blue-600 mb-1">Chủ tài khoản:</p>
              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <span className="font-medium">{accountName}</span>
                <button
                  onClick={() => copyToClipboard(accountName, "name")}
                  className="text-blue-600 hover:text-blue-700 ml-2"
                >
                  {copiedField === "name" ? "✓" : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Amount & Content */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-blue-600 mb-1">Số tiền:</p>
              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <span className="font-bold text-lg text-red-600">
                  {PaymentUtils.formatPrice(parseInt(amount))}
                </span>
                <button
                  onClick={() => copyToClipboard(amount, "amount")}
                  className="text-blue-600 hover:text-blue-700 ml-2"
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
              <p className="text-sm text-blue-600 mb-1">
                Nội dung chuyển khoản:
              </p>
              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <span className="font-mono text-sm break-all">{content}</span>
                <button
                  onClick={() => copyToClipboard(content, "content")}
                  className="text-blue-600 hover:text-blue-700 ml-2 flex-shrink-0"
                >
                  {copiedField === "content" ? (
                    "✓"
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="text-center">
              <p className="text-sm text-blue-600 mb-3">Hoặc quét mã QR:</p>
              {qrData.loading ? (
                <div className="bg-white p-8 rounded-lg border flex items-center justify-center">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="ml-2 text-blue-600">Đang tạo QR...</span>
                </div>
              ) : qrData.qrImageUrl ? (
                <div className="bg-white p-4 rounded-lg border inline-block">
                  <img
                    src={qrData.qrImageUrl}
                    alt="QR Code thanh toán"
                    className="w-40 h-40 mx-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
              ) : qrData.error ? (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{qrData.error}</span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">
                    Vui lòng chuyển khoản thủ công theo thông tin trên
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 p-8 rounded-lg border">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Đang chuẩn bị QR code...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Phương thức thanh toán
      </h2>

      {/* Payment Method Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = formData.paymentInfo.method === method.value;

          return (
            <div
              key={method.value}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              } ${!method.available ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() =>
                method.available &&
                updateFormData("paymentInfo", { method: method.value })
              }
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-900">{method.label}</h3>
                {!method.available && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    Sắp có
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{method.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Payment Details */}
      {formData.paymentInfo.method === "transfer" && renderBankInfo()}

      {formData.paymentInfo.method === "cash" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Thanh toán tiền mặt
          </h4>
          <div className="space-y-2 text-sm text-green-800">
            <p>• Thanh toán khi nhận dịch vụ</p>
            <p>• Nhân viên sẽ liên hệ xác nhận thời gian</p>
            <p>
              • Chuẩn bị đúng số tiền:{" "}
              <strong>{formatPrice(totalAmount)}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tóm tắt đơn hàng
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Dịch vụ:</span>
            <span className="font-medium">{service?.service_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Số lượng:</span>
            <span className="font-medium">{formData.serviceInfo.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Số người tham gia:</span>
            <span className="font-medium">
              {formData.participantInfo.participants.length} người
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phương thức lấy mẫu:</span>
            <span className="font-medium">
              {formData.serviceInfo.collectionMethod === "home"
                ? "Lấy mẫu tại nhà"
                : "Lấy mẫu tại cơ sở"}
            </span>
          </div>

          {/* Doctor Information */}
          {formData.serviceInfo.collectionMethod === "facility" &&
            selectedDoctor && (
              <div className="flex justify-between">
                <span className="text-gray-600">Bác sĩ tư vấn:</span>
                <span className="font-medium">
                  {selectedDoctor.doctorName ||
                    selectedDoctor.name ||
                    `Bác sĩ ${
                      selectedDoctor.doctorCode || selectedDoctor.code
                    }`}
                </span>
              </div>
            )}

          {/* Appointment Information */}
          {formData.serviceInfo.appointmentDate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Ngày hẹn:</span>
              <span className="font-medium">
                {new Date(
                  formData.serviceInfo.appointmentDate
                ).toLocaleDateString("vi-VN")}
                {formData.serviceInfo.appointmentTime &&
                  ` - ${formData.serviceInfo.appointmentTime}`}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600">Đơn giá:</span>
            <span className="font-medium">
              {formatPrice(service?.price || service?.test_price || 0)}
            </span>
          </div>

          {/* Total */}
          <div className="border-t border-gray-300 pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng cộng:</span>
              <span className="text-red-600">{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">
          Điều khoản và điều kiện
        </h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>
            • Kết quả xét nghiệm sẽ có trong {service?.duration_days || 7}-10
            ngày làm việc
          </li>
          <li>• Mẫu xét nghiệm cần được bảo quản đúng cách</li>
          <li>• Vui lòng mang theo CMND/CCCD khi đến lấy mẫu</li>
          <li>• Hoàn tiền 100% nếu có lỗi từ phía cơ sở</li>
          <li>• Sau khi chuyển khoản, đơn hàng sẽ được xử lý trong 24h</li>
        </ul>
      </div>
    </div>
  );
};
