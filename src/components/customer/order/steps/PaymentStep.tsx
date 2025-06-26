import React from "react";
import { CreditCard, Phone } from "lucide-react";
import { OrderForm } from "../../../../hooks/useOrderBooking";
import { Doctor } from "../../../../services/orderService";
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
  const paymentMethods = [
    {
      value: "transfer",
      label: "Chuyển khoản",
      desc: "Thanh toán qua ngân hàng",
      icon: CreditCard,
    },
    {
      value: "cash",
      label: "Tiền mặt",
      desc: "Thanh toán khi nhận dịch vụ",
      icon: Phone,
    },
  ];

  const selectedDoctor = doctors.find(
    (d) =>
      d.doctorId === formData.serviceInfo.doctorId ||
      d.id === formData.serviceInfo.doctorId ||
      d.userId === formData.serviceInfo.doctorId
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Phương thức thanh toán
      </h2>

      {/* Payment Method Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          return (
            <div
              key={method.value}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.paymentInfo.method === method.value
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() =>
                updateFormData("paymentInfo", { method: method.value })
              }
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-900">{method.label}</h3>
              </div>
              <p className="text-sm text-gray-600">{method.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Payment Information */}
      {formData.paymentInfo.method === "transfer" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            Thông tin chuyển khoản
          </h4>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>Ngân hàng:</strong> Vietcombank
            </p>
            <p>
              <strong>Số tài khoản:</strong> 1234567890
            </p>
            <p>
              <strong>Chủ tài khoản:</strong> CÔNG TY TNHH XÉT NGHIỆM DNA
            </p>
            <p>
              <strong>Nội dung:</strong>{" "}
              {`DNA-${formData.customerInfo.fullName.replace(/\s+/g, "")}`}
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
              {formatPrice(service?.price || 0)}
            </span>
          </div>

          {/* Total */}
          <div className="border-t border-gray-300 pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng cộng:</span>
              <span className="text-red-600">
                {formatPrice(calculateTotal())}
              </span>
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
          <li>• Kết quả xét nghiệm sẽ có trong 7-10 ngày làm việc</li>
          <li>• Mẫu xét nghiệm cần được bảo quản đúng cách</li>
          <li>• Vui lòng mang theo CMND/CCCD khi đến lấy mẫu</li>
          <li>• Hoàn tiền 100% nếu có lỗi từ phía cơ sở</li>
        </ul>
      </div>
    </div>
  );
};
