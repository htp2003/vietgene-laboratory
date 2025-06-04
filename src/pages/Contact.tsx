import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  MessageCircle,
  Building,
  Car,
  Bus,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  serviceType: string;
}

const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const contactInfo = [
    {
      icon: Phone,
      title: "Hotline",
      primary: "1900 1234",
      secondary: "(028) 3823 4567",
      description: "Hỗ trợ khách hàng 24/7",
    },
    {
      icon: Mail,
      title: "Email",
      primary: "support@vietgene.vn",
      secondary: "info@vietgene.vn",
      description: "Phản hồi trong vòng 2 giờ",
    },
    {
      icon: MapPin,
      title: "Địa chỉ",
      primary: "123 Nguyễn Văn Linh",
      secondary: "Quận 7, TP.HCM",
      description: "Thứ 2 - Chủ nhật: 8:00 - 20:00",
    },
    {
      icon: Clock,
      title: "Giờ làm việc",
      primary: "Thứ 2 - Thứ 6: 8:00 - 18:00",
      secondary: "Thứ 7 - CN: 8:00 - 17:00",
      description: "Nghỉ các ngày lễ, tết",
    },
  ];

  const locations = [
    {
      name: "Chi nhánh chính - TP.HCM",
      address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
      phone: "(028) 3823 4567",
      hours: "T2-CN: 8:00 - 20:00",
      services: ["Tất cả dịch vụ", "Lấy mẫu tại chỗ", "Tư vấn trực tiếp"],
    },
    {
      name: "Chi nhánh Hà Nội",
      address: "456 Cầu Giấy, Quận Cầu Giấy, Hà Nội",
      phone: "(024) 3456 7890",
      hours: "T2-CN: 8:00 - 19:00",
      services: ["Tất cả dịch vụ", "Lấy mẫu tại chỗ", "Tư vấn trực tiếp"],
    },
    {
      name: "Chi nhánh Đà Nẵng",
      address: "789 Hùng Vương, Quận Hải Châu, Đà Nẵng",
      phone: "(0236) 3789 012",
      hours: "T2-CN: 8:00 - 18:00",
      services: ["Dịch vụ cơ bản", "Lấy mẫu tại chỗ"],
    },
  ];

  const faqItems = [
    {
      question: "Tôi cần chuẩn bị gì khi đến lấy mẫu?",
      answer:
        "Bạn chỉ cần mang theo CMND/CCCD và đến đúng giờ hẹn. Không cần nhịn ăn hay chuẩn bị gì đặc biệt.",
    },
    {
      question: "Kết quả có thể bị sai không?",
      answer:
        "Với công nghệ hiện đại và quy trình nghiêm ngặt, độ chính xác của chúng tôi lên đến 99.99%. Mọi kết quả đều được kiểm tra kỹ lưỡng.",
    },
    {
      question: "Thông tin cá nhân có được bảo mật không?",
      answer:
        "Tuyệt đối bảo mật. Chúng tôi cam kết không chia sẻ thông tin khách hàng cho bất kỳ bên thứ ba nào.",
    },
    {
      question: "Có thể hủy đơn hàng không?",
      answer:
        "Bạn có thể hủy đơn hàng trước khi mẫu được gửi đi phân tích. Vui lòng liên hệ hotline để được hỗ trợ.",
    },
  ];

  const handleFormSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading("Đang gửi tin nhắn...");

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(
        "Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi trong vòng 24h.",
        {
          id: loadingToast,
          duration: 4000,
        }
      );

      reset(); // Clear form
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!", {
        id: loadingToast,
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Liên hệ với chúng tôi
          </h1>
          <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto">
            Đội ngũ chuyên gia VietGene Lab luôn sẵn sàng hỗ trợ và tư vấn cho
            bạn
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Contact Info Cards */}
        <div className="py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {info.title}
                  </h3>
                  <p className="text-gray-900 font-medium mb-1">
                    {info.primary}
                  </p>
                  <p className="text-gray-600 mb-2">{info.secondary}</p>
                  <p className="text-sm text-gray-500">{info.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 pb-16">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Gửi tin nhắn</h2>
            </div>

            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    {...register("fullName", {
                      required: "Vui lòng nhập họ và tên",
                      minLength: {
                        value: 2,
                        message: "Họ tên phải có ít nhất 2 ký tự",
                      },
                    })}
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                      errors.fullName ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Nhập họ và tên"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    {...register("email", {
                      required: "Vui lòng nhập email",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Email không hợp lệ",
                      },
                    })}
                    type="email"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Nhập email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    {...register("phone", {
                      required: "Vui lòng nhập số điện thoại",
                      pattern: {
                        value: /^(0[3|5|7|8|9])+([0-9]{8})$/,
                        message: "Số điện thoại không hợp lệ",
                      },
                    })}
                    type="tel"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                      errors.phone ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dịch vụ quan tâm
                  </label>
                  <select
                    {...register("serviceType")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  >
                    <option value="">Chọn dịch vụ</option>
                    <option value="paternity">Xét nghiệm cha con</option>
                    <option value="maternity">Xét nghiệm mẹ con</option>
                    <option value="sibling">Xét nghiệm anh chị em</option>
                    <option value="ancestry">Xét nghiệm huyết thống</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chủ đề *
                </label>
                <input
                  {...register("subject", {
                    required: "Vui lòng nhập chủ đề",
                    minLength: {
                      value: 5,
                      message: "Chủ đề phải có ít nhất 5 ký tự",
                    },
                  })}
                  type="text"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    errors.subject ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Tư vấn về dịch vụ xét nghiệm DNA"
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung tin nhắn *
                </label>
                <textarea
                  {...register("message", {
                    required: "Vui lòng nhập nội dung tin nhắn",
                    minLength: {
                      value: 10,
                      message: "Tin nhắn phải có ít nhất 10 ký tự",
                    },
                  })}
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none ${
                    errors.message ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Mô tả chi tiết câu hỏi hoặc yêu cầu của bạn..."
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Gửi tin nhắn</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* FAQ & Locations */}
          <div className="space-y-8">
            {/* FAQ */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Câu hỏi thường gặp
              </h2>
              <div className="space-y-6">
                {faqItems.map((item, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {item.question}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Cần hỗ trợ ngay?</h3>
              <p className="text-red-100 mb-6">
                Gọi hotline để được tư vấn trực tiếp từ chuyên gia
              </p>
              <div className="space-y-3">
                <a
                  href="tel:19001234"
                  className="flex items-center gap-3 text-white hover:text-red-200 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">1900 1234</p>
                    <p className="text-sm text-red-200">Hỗ trợ 24/7</p>
                  </div>
                </a>
                <a
                  href="mailto:support@vietgene.vn"
                  className="flex items-center gap-3 text-white hover:text-red-200 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">support@vietgene.vn</p>
                    <p className="text-sm text-red-200">Phản hồi trong 2h</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Địa điểm làm việc
            </h2>
            <p className="text-xl text-gray-600">
              Hệ thống chi nhánh VietGene Lab trên toàn quốc
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {locations.map((location, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Building className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {location.name}
                  </h3>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{location.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{location.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{location.hours}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Dịch vụ có sẵn:
                  </h4>
                  <div className="space-y-1">
                    {location.services.map((service, serviceIndex) => (
                      <div
                        key={serviceIndex}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex gap-2">
                    <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <Car className="w-4 h-4" />
                      Chỉ đường
                    </button>
                    <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      Gọi ngay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div className="py-16">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bản đồ chi nhánh chính
              </h2>
              <p className="text-gray-600">
                123 Nguyễn Văn Linh, Quận 7, TP.HCM
              </p>
            </div>

            {/* Mock Map */}
            <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Bản đồ sẽ được tích hợp ở đây
                </p>
                <div className="flex gap-4 justify-center">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Car className="w-4 h-4" />
                    <span>Có chỗ đậu xe</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Bus className="w-4 h-4" />
                    <span>Gần trạm xe buýt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
            padding: "16px",
            borderRadius: "8px",
            fontSize: "14px",
          },
          success: {
            style: {
              background: "#10b981",
            },
          },
          error: {
            style: {
              background: "#ef4444",
            },
          },
          loading: {
            style: {
              background: "#6b7280",
            },
          },
        }}
      />
    </div>
  );
};

export default Contact;
