import React, { useState, useEffect } from "react";
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
  Loader,
  Clock,
  Plus,
  X,
} from "lucide-react";
import {
  ServiceService,
  mapApiServiceToFrontend,
  formatPrice,
} from "../../services/serviceService";
import { orderService, Doctor, TimeSlot } from "../../services/orderService";

interface OrderForm {
  customerInfo: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    identityCard: string;
  };
  serviceInfo: {
    serviceId: string;
    quantity: number;
    collectionMethod: "home" | "facility";
    appointmentDate: string;
    appointmentTime: string;
    doctorId: string;
    timeSlotId: string;
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

  // States
  const [service, setService] = useState<any>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      serviceId: id || "",
      quantity: 1,
      collectionMethod: "home",
      appointmentDate: "",
      appointmentTime: "",
      doctorId: "",
      timeSlotId: "",
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

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch service by ID
        if (id) {
          console.log("🔍 Fetching service with ID:", id);
          const apiService = await ServiceService.getServiceById(id);
          const mappedService = mapApiServiceToFrontend(apiService);
          setService(mappedService);
          console.log("✅ Service loaded:", mappedService);
        }

        // Fetch doctors for facility collection
        console.log("🔍 Fetching doctors...");
        const doctorsList = await orderService.getAllDoctors();
        setDoctors(doctorsList.filter((doctor) => doctor.isActive));
        console.log("✅ Doctors loaded:", doctorsList.length);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Auto-fill user info if logged in
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (currentUser.id) {
      setFormData((prev) => ({
        ...prev,
        customerInfo: {
          ...prev.customerInfo,
          fullName: currentUser.full_name || currentUser.fullName || "",
          email: currentUser.email || "",
          phone: currentUser.username || "", // Username is often phone
        },
      }));
    }
  }, []);

  // Helper functions
  const calculateTotal = () => {
    return service?.price * formData.serviceInfo.quantity || 0;
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

  const handleDoctorSelect = async (doctorId: string) => {
    try {
      console.log("🔍 Fetching time slots for doctor:", doctorId);
      const timeSlots = await orderService.getDoctorTimeSlots(doctorId);
      setAvailableTimeSlots(timeSlots);

      updateFormData("serviceInfo", {
        doctorId,
        timeSlotId: "",
        appointmentTime: "",
      });

      console.log("✅ Time slots loaded:", timeSlots.length);
    } catch (error) {
      console.error("❌ Error fetching time slots:", error);
      setError("Không thể tải lịch khám của bác sĩ");
    }
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    const timeSlot = availableTimeSlots.find(
      (slot) => slot.id.toString() === timeSlotId
    );
    if (timeSlot) {
      updateFormData("serviceInfo", {
        timeSlotId,
        appointmentTime: `${timeSlot.startTime} - ${timeSlot.endTime}`,
      });
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    return days[dayOfWeek];
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.customerInfo.fullName &&
          formData.customerInfo.phone &&
          formData.customerInfo.email &&
          formData.customerInfo.address &&
          formData.customerInfo.identityCard
        );
      case 2:
        return formData.participantInfo.participants.every(
          (p) => p.name && p.relationship && p.age
        );
      case 3:
        if (formData.serviceInfo.collectionMethod === "facility") {
          return !!(
            formData.serviceInfo.doctorId &&
            formData.serviceInfo.timeSlotId &&
            formData.serviceInfo.appointmentDate
          );
        }
        return true;
      case 4:
        return !!formData.paymentInfo.method;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      console.log("🚀 Submitting order...");
      console.log("📋 Form Data:", formData);

      // Prepare order data for API
      const orderData = {
        customerInfo: formData.customerInfo,
        serviceInfo: {
          ...formData.serviceInfo,
          serviceId: id!,
        },
        participantInfo: formData.participantInfo,
        paymentInfo: formData.paymentInfo,
      };

      // Call API to create complete order
      const orderId = await orderService.createCompleteOrder(orderData);

      console.log("✅ Order created successfully with ID:", orderId);

      // Navigate to success page
      navigate("/order/success", {
        state: {
          orderId,
          orderData: {
            ...orderData,
            service,
            orderId,
            orderCode: "DNA-" + orderId.slice(-8).toUpperCase(),
            totalAmount: calculateTotal(),
          },
        },
      });
    } catch (err) {
      console.error("❌ Error submitting order:", err);
      setError("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin dịch vụ...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không thể tải dịch vụ
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/services"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            ← Quay lại danh sách dịch vụ
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Thông tin khách hàng", icon: User },
    { number: 2, title: "Người tham gia", icon: User },
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
                className={`ml-2 text-sm font-medium hidden sm:block ${
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
                  className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
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
            placeholder="Nhập họ và tên đầy đủ"
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
            placeholder="0987654321"
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
            placeholder="example@email.com"
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
            placeholder="123456789012"
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
            placeholder="Nhập địa chỉ chi tiết..."
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
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm người
        </button>
      </div>

      <div className="space-y-4">
        {formData.participantInfo.participants.map((participant, index) => (
          <div key={index} className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4" />
                Người tham gia {index + 1}
              </h3>
              {formData.participantInfo.participants.length > 2 && (
                <button
                  onClick={() => removeParticipant(index)}
                  className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 transition-colors"
                >
                  <X className="w-4 h-4" />
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
                  placeholder="Nhập họ tên"
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
                  <option value="Ông">Ông</option>
                  <option value="Bà">Bà</option>
                  <option value="Cháu">Cháu</option>
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
                  placeholder="25"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Lưu ý:</strong> Cần ít nhất 2 người tham gia xét nghiệm để có
          thể xác định mối quan hệ huyết thống.
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Phương thức lấy mẫu</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div
          className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
            formData.serviceInfo.collectionMethod === "home"
              ? "border-red-500 bg-red-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() =>
            updateFormData("serviceInfo", { collectionMethod: "home" })
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
            <li>• Kit được gửi trong 2-3 ngày</li>
          </ul>
        </div>

        <div
          className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
            formData.serviceInfo.collectionMethod === "facility"
              ? "border-red-500 bg-red-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() =>
            updateFormData("serviceInfo", {
              collectionMethod: "facility",
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
            <li>• Tư vấn trực tiếp từ bác sĩ</li>
            <li>• Nhanh chóng, tiết kiệm thời gian</li>
            <li>• Đảm bảo chất lượng mẫu</li>
          </ul>
        </div>
      </div>

      {formData.serviceInfo.collectionMethod === "facility" && (
        <>
          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn bác sĩ tư vấn *
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.serviceInfo.doctorId === doctor.id
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleDoctorSelect(doctor.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {doctor.user?.fullName || `Bác sĩ ${doctor.doctorCode}`}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Chuyên gia xét nghiệm DNA
                      </p>
                      <div className="space-y-1 text-xs text-gray-500">
                        <p>Mã BS: {doctor.doctorCode}</p>
                        {doctor.user?.email && <p>{doctor.user.email}</p>}
                        {doctor.user?.phone && <p>{doctor.user.phone}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {doctors.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Hiện không có bác sĩ nào khả dụng
                </p>
              </div>
            )}
          </div>

          {/* Time Slot Selection */}
          {formData.serviceInfo.doctorId && availableTimeSlots.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Chọn khung giờ *
              </label>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableTimeSlots
                  .filter((slot) => slot.isAvailable)
                  .map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                        formData.serviceInfo.timeSlotId === slot.id.toString()
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleTimeSlotSelect(slot.id.toString())}
                    >
                      <div className="font-medium text-sm">
                        {getDayName(slot.dayOfWeek)}
                      </div>
                      <div className="text-lg font-semibold">
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </div>
                  ))}
              </div>
              {availableTimeSlots.filter((slot) => slot.isAvailable).length ===
                0 && (
                <div className="text-center py-4">
                  <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">
                    Bác sĩ này hiện không có lịch trống
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Appointment Date */}
          {formData.serviceInfo.timeSlotId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày hẹn *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={formData.serviceInfo.appointmentDate}
                onChange={(e) =>
                  updateFormData("serviceInfo", {
                    appointmentDate: e.target.value,
                  })
                }
              />
              {formData.serviceInfo.appointmentTime && (
                <p className="text-sm text-gray-600 mt-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Thời gian: {formData.serviceInfo.appointmentTime}
                </p>
              )}
            </div>
          )}
        </>
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
            icon: CreditCard,
          },
          {
            value: "cash",
            label: "Tiền mặt",
            desc: "Thanh toán khi nhận dịch vụ",
            icon: Phone,
          },
          {
            value: "card",
            label: "Thẻ tín dụng",
            desc: "Thanh toán online",
            icon: CreditCard,
          },
        ].map((method) => {
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
          {formData.serviceInfo.collectionMethod === "facility" &&
            formData.serviceInfo.doctorId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Bác sĩ tư vấn:</span>
                <span className="font-medium">
                  {doctors.find((d) => d.id === formData.serviceInfo.doctorId)
                    ?.user?.fullName ||
                    doctors.find((d) => d.id === formData.serviceInfo.doctorId)
                      ?.doctorCode}
                </span>
              </div>
            )}
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
            <p className="text-gray-600">{service?.service_name}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {renderStepIndicator()}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

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
              ← Quay lại
            </button>

            {currentStep < 4 ? (
              <button
                onClick={() => {
                  if (validateStep(currentStep)) {
                    setCurrentStep(currentStep + 1);
                    setError(null);
                  } else {
                    setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Tiếp tục →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !validateStep(4)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  submitting || !validateStep(4)
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {submitting && <Loader className="w-4 h-4 animate-spin" />}
                {submitting ? "Đang xử lý..." : "Hoàn tất đặt hàng"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBooking;
