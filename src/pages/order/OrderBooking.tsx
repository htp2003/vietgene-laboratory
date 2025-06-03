import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  Home,
} from "lucide-react";

// Mock service data
const services = [
  {
    id: 1,
    service_name: "Xét nghiệm quan hệ cha con",
    test_category: "paternity",
    service_type: "civil",
    price: 2500000,
    duration_days: 5,
    collection_methods: "self_collect,facility_collect",
    requires_legal_documents: false,
  },
  {
    id: 2,
    service_name: "Xét nghiệm quan hệ mẹ con",
    test_category: "maternity",
    service_type: "civil",
    price: 2300000,
    duration_days: 5,
    collection_methods: "self_collect,facility_collect",
    requires_legal_documents: false,
  },
];

interface OrderForm {
  customerInfo: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    identityCard: string;
  };
  serviceInfo: {
    quantity: number;
    collectionMethod: "self_collect" | "facility_collect";
    appointmentDate: string;
    notes: string;
  };
  participantInfo: {
    participants: Array<{
      name: string;
      relationship: string;
      age: string;
    }>;
  };
  paymentInfo: {
    method: "cash" | "card" | "transfer";
  };
}

const OrderBooking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const service = services.find((s) => s.id === parseInt(id || "0"));
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OrderForm>({
    customerInfo: {
      fullName: "",
      phone: "",
      email: "",
      address: "",
      identityCard: "",
    },
    serviceInfo: {
      quantity: 1,
      collectionMethod: "self_collect",
      appointmentDate: "",
      notes: "",
    },
    participantInfo: {
      participants: [
        { name: "", relationship: "Cha", age: "" },
        { name: "", relationship: "Con", age: "" },
      ],
    },
    paymentInfo: {
      method: "transfer",
    },
  });

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy dịch vụ
          </h2>
          <Link
            to="/services"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Quay lại danh sách dịch vụ
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateTotal = () => {
    return service.price * formData.serviceInfo.quantity;
  };

  const updateFormData = (section: keyof OrderForm, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const updateParticipant = (index: number, field: string, value: string) => {
    const newParticipants = [...formData.participantInfo.participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      participantInfo: { participants: newParticipants },
    }));
  };

  const addParticipant = () => {
    setFormData((prev) => ({
      ...prev,
      participantInfo: {
        participants: [
          ...prev.participantInfo.participants,
          { name: "", relationship: "", age: "" },
        ],
      },
    }));
  };

  const removeParticipant = (index: number) => {
    if (formData.participantInfo.participants.length > 2) {
      const newParticipants = formData.participantInfo.participants.filter(
        (_, i) => i !== index
      );
      setFormData((prev) => ({
        ...prev,
        participantInfo: { participants: newParticipants },
      }));
    }
  };

  const handleSubmit = () => {
    // TODO: Submit order to API
    console.log("Order submitted:", formData);
    navigate("/order/success");
  };

  const steps = [
    { number: 1, title: "Thông tin khách hàng", icon: User },
    { number: 2, title: "Thông tin người tham gia", icon: User },
    { number: 3, title: "Phương thức lấy mẫu", icon: Calendar },
    { number: 4, title: "Thanh toán", icon: CreditCard },
  ];

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : isActive
                    ? "bg-red-600 border-red-600 text-white"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  isActive
                    ? "text-red-600"
                    : isCompleted
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-4 ${
                    isCompleted ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Thông tin khách hàng</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ và tên *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={formData.customerInfo.fullName}
            onChange={(e) =>
              updateFormData("customerInfo", { fullName: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại *
          </label>
          <input
            type="tel"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={formData.customerInfo.phone}
            onChange={(e) =>
              updateFormData("customerInfo", { phone: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={formData.customerInfo.email}
            onChange={(e) =>
              updateFormData("customerInfo", { email: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CMND/CCCD *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={formData.customerInfo.identityCard}
            onChange={(e) =>
              updateFormData("customerInfo", { identityCard: e.target.value })
            }
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ *
          </label>
          <textarea
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={formData.customerInfo.address}
            onChange={(e) =>
              updateFormData("customerInfo", { address: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Thông tin người tham gia xét nghiệm
        </h2>
        <button
          onClick={addParticipant}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Thêm người
        </button>
      </div>

      <div className="space-y-4">
        {formData.participantInfo.participants.map((participant, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">
                Người tham gia {index + 1}
              </h3>
              {formData.participantInfo.participants.length > 2 && (
                <button
                  onClick={() => removeParticipant(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Xóa
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={participant.name}
                  onChange={(e) =>
                    updateParticipant(index, "name", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mối quan hệ *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={participant.relationship}
                  onChange={(e) =>
                    updateParticipant(index, "relationship", e.target.value)
                  }
                >
                  <option value="">Chọn mối quan hệ</option>
                  <option value="Cha">Cha</option>
                  <option value="Mẹ">Mẹ</option>
                  <option value="Con">Con</option>
                  <option value="Anh/Chị">Anh/Chị</option>
                  <option value="Em">Em</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tuổi *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="150"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={participant.age}
                  onChange={(e) =>
                    updateParticipant(index, "age", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Phương thức lấy mẫu</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div
          className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
            formData.serviceInfo.collectionMethod === "self_collect"
              ? "border-red-500 bg-red-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() =>
            updateFormData("serviceInfo", { collectionMethod: "self_collect" })
          }
        >
          <div className="flex items-center gap-3 mb-4">
            <Home className="w-8 h-8 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Lấy mẫu tại nhà
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Chúng tôi sẽ gửi kit lấy mẫu đến địa chỉ của bạn. Bạn có thể tự lấy
            mẫu và gửi lại.
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Thuận tiện, riêng tư</li>
            <li>• Hướng dẫn chi tiết đi kèm</li>
            <li>• Miễn phí vận chuyển</li>
          </ul>
        </div>

        <div
          className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
            formData.serviceInfo.collectionMethod === "facility_collect"
              ? "border-red-500 bg-red-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() =>
            updateFormData("serviceInfo", {
              collectionMethod: "facility_collect",
            })
          }
        >
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-8 h-8 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Lấy mẫu tại cơ sở
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Đến trực tiếp cơ sở của chúng tôi để lấy mẫu với sự hỗ trợ của
            chuyên viên.
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Chuyên nghiệp, chính xác</li>
            <li>• Tư vấn trực tiếp</li>
            <li>• Nhanh chóng, tiết kiệm thời gian</li>
          </ul>
        </div>
      </div>

      {formData.serviceInfo.collectionMethod === "facility_collect" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày hẹn lấy mẫu *
          </label>
          <input
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={formData.serviceInfo.appointmentDate}
            onChange={(e) =>
              updateFormData("serviceInfo", { appointmentDate: e.target.value })
            }
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ghi chú thêm
        </label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          placeholder="Bất kỳ yêu cầu đặc biệt nào..."
          value={formData.serviceInfo.notes}
          onChange={(e) =>
            updateFormData("serviceInfo", { notes: e.target.value })
          }
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Phương thức thanh toán
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            value: "transfer",
            label: "Chuyển khoản",
            desc: "Thanh toán qua ngân hàng",
          },
          {
            value: "cash",
            label: "Tiền mặt",
            desc: "Thanh toán khi nhận dịch vụ",
          },
        ].map((method) => (
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
            <h3 className="font-semibold text-gray-900 mb-1">{method.label}</h3>
            <p className="text-sm text-gray-600">{method.desc}</p>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tóm tắt đơn hàng
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Dịch vụ:</span>
            <span className="font-medium">{service.service_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Số lượng:</span>
            <span className="font-medium">{formData.serviceInfo.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Đơn giá:</span>
            <span className="font-medium">{formatPrice(service.price)}</span>
          </div>
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
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đặt dịch vụ</h1>
            <p className="text-gray-600">{service.service_name}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {renderStepIndicator()}

          <div className="mb-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Quay lại
            </button>

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Tiếp tục
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Hoàn tất đặt hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBooking;
