import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Microscope,
  FlaskConical,
  Dna,
  TreePine,
  Scale,
  FileCheck,
} from "lucide-react";

// Mock data - same as Services page
const services = [
  {
    id: 1,
    service_name: "Xét nghiệm quan hệ cha con",
    test_category: "paternity",
    service_type: "civil",
    description:
      "Xác định mối quan hệ huyết thống giữa cha và con với độ chính xác cao nhất",
    price: 2500000,
    duration_days: 5,
    collection_methods: "self_collect,facility_collect",
    requires_legal_documents: false,
    icon: "microscope",
    detailed_description:
      "Xét nghiệm quan hệ cha con là phương pháp khoa học hiện đại nhất để xác định mối quan hệ huyết thống giữa người cha và con. Chúng tôi sử dụng công nghệ phân tích DNA tiên tiến với độ chính xác lên đến 99.99% cho kết quả loại trừ và 99.9999% cho kết quả xác nhận.",
    process_steps: [
      "Tư vấn và đăng ký dịch vụ",
      "Lấy mẫu DNA (nước bọt hoặc máu)",
      "Vận chuyển mẫu về phòng lab",
      "Phân tích DNA tại phòng lab",
      "Kiểm tra và xác nhận kết quả",
      "Gửi báo cáo kết quả cho khách hàng",
    ],
    sample_types: ["Nước bọt", "Máu"],
    legal_value: false,
    documents_required: [],
    faq: [
      {
        question: "Độ chính xác của xét nghiệm như thế nào?",
        answer:
          "Độ chính xác lên đến 99.99% cho kết quả loại trừ và 99.9999% cho kết quả xác nhận quan hệ cha con.",
      },
      {
        question: "Thời gian có kết quả là bao lâu?",
        answer:
          "Thường trong vòng 5-7 ngày làm việc kể từ khi mẫu được nhận tại phòng lab.",
      },
      {
        question: "Có thể lấy mẫu tại nhà không?",
        answer:
          "Có, chúng tôi hỗ trợ dịch vụ lấy mẫu tại nhà hoặc bạn có thể đến trực tiếp cơ sở của chúng tôi.",
      },
    ],
  },
  {
    id: 2,
    service_name: "Xét nghiệm quan hệ mẹ con",
    test_category: "maternity",
    service_type: "civil",
    description:
      "Xác định mối quan hệ huyết thống giữa mẹ và con một cách chính xác",
    price: 2300000,
    duration_days: 5,
    collection_methods: "self_collect,facility_collect",
    requires_legal_documents: false,
    icon: "flaskConical",
    detailed_description:
      "Xét nghiệm quan hệ mẹ con sử dụng công nghệ phân tích DNA mitochondrial và autosomal để xác định mối quan hệ huyết thống giữa người mẹ và con với độ chính xác cao.",
    process_steps: [
      "Đăng ký và tư vấn dịch vụ",
      "Thu thập mẫu DNA từ mẹ và con",
      "Bảo quản và vận chuyển mẫu",
      "Phân tích DNA mitochondrial",
      "So sánh và đối chiếu kết quả",
      "Xuất báo cáo chi tiết",
    ],
    sample_types: ["Nước bọt", "Tế bào má"],
    legal_value: false,
    documents_required: [],
    faq: [
      {
        question: "Xét nghiệm mẹ con khác gì với xét nghiệm cha con?",
        answer:
          "Xét nghiệm mẹ con phân tích DNA mitochondrial được truyền từ mẹ, trong khi xét nghiệm cha con phân tích DNA autosomal.",
      },
      {
        question: "Có cần mẫu từ cả mẹ và con không?",
        answer:
          "Có, cần mẫu từ cả người mẹ và con để so sánh và đưa ra kết quả chính xác.",
      },
    ],
  },
];

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const service = services.find((s) => s.id === parseInt(id || "0"));

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

  const getIcon = (iconName: string) => {
    const iconMap = {
      microscope: Microscope,
      flaskConical: FlaskConical,
      dna: Dna,
      treePine: TreePine,
      scale: Scale,
      fileCheck: FileCheck,
    };

    const IconComponent =
      iconMap[iconName as keyof typeof iconMap] || Microscope;
    return <IconComponent className="w-12 h-12 text-red-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <span className="text-gray-400">/</span>
          <Link to="/services" className="text-gray-600 hover:text-gray-900">
            Dịch vụ
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">
            {service.service_name}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start gap-6 mb-6">
                {getIcon(service.icon)}
                <div className="flex-1">
                  <div className="flex gap-2 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        service.service_type === "civil"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {service.service_type === "civil" ? "Dân sự" : "Pháp lý"}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {service.test_category}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {service.service_name}
                  </h1>
                  <p className="text-gray-600 leading-relaxed">
                    {service.detailed_description || service.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Process Steps */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Quy trình thực hiện
              </h2>
              <div className="space-y-4">
                {service.process_steps?.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-700">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Thông tin mẫu xét nghiệm
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Loại mẫu</h3>
                  <div className="space-y-2">
                    {service.sample_types?.map((type, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Phương thức lấy mẫu
                  </h3>
                  <div className="space-y-2">
                    {service.collection_methods.includes("self_collect") && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">
                          Tự lấy mẫu tại nhà
                        </span>
                      </div>
                    )}
                    {service.collection_methods.includes(
                      "facility_collect"
                    ) && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Lấy mẫu tại cơ sở</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Câu hỏi thường gặp
              </h2>
              <div className="space-y-6">
                {service.faq?.map((item, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {item.question}
                    </h3>
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Booking Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatPrice(service.price)}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Kết quả trong {service.duration_days} ngày</span>
                  </div>
                </div>

                {service.requires_legal_documents && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-orange-800 text-sm font-medium">
                          Cần giấy tờ pháp lý
                        </p>
                        <p className="text-orange-700 text-xs mt-1">
                          Dịch vụ này yêu cầu giấy tờ pháp lý để thực hiện
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Link
                    to={`/order/${service.id}`}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium text-center block transition-colors"
                  >
                    Đặt dịch vụ ngay
                  </Link>
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors">
                    Tư vấn miễn phí
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Cần hỗ trợ?</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-gray-900">Hotline</p>
                      <p className="text-gray-600">1900 1234</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">support@vietgene.vn</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Services */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Dịch vụ liên quan
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services
              .filter(
                (s) =>
                  s.id !== service.id &&
                  s.test_category === service.test_category
              )
              .slice(0, 3)
              .map((relatedService) => (
                <Link
                  key={relatedService.id}
                  to={`/services/${relatedService.id}`}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 block"
                >
                  <div className="flex items-center gap-3 mb-4">
                    {getIcon(relatedService.icon)}
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        relatedService.service_type === "civil"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {relatedService.service_type === "civil"
                        ? "Dân sự"
                        : "Pháp lý"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {relatedService.service_name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {relatedService.description}
                  </p>
                  <div className="text-lg font-bold text-red-600">
                    {formatPrice(relatedService.price)}
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
