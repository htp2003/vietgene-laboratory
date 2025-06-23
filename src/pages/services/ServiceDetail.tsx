import React, { useState, useEffect } from "react";
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
  Loader,
} from "lucide-react";
import {
  ServiceService,
  mapApiServiceToFrontend,
  formatPrice,
} from "../../services/serviceService";

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<any>(null);
  const [relatedServices, setRelatedServices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch service detail and related services
  useEffect(() => {
    const fetchServiceDetail = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // Fetch service detail
        const apiService = await ServiceService.getServiceById(id);
        const mappedService = mapApiServiceToFrontend(apiService);
        setService(mappedService);

        // Fetch all services for related services
        const allServices = await ServiceService.getAllServices();
        const mappedAllServices = allServices.map(mapApiServiceToFrontend);

        // Filter related services (same category, exclude current)
        const related = mappedAllServices
          .filter(
            (s) =>
              s.id !== mappedService.id &&
              s.test_category === mappedService.test_category
          )
          .slice(0, 3);

        setRelatedServices(related);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch service detail:", err);
        setError("Không thể tải chi tiết dịch vụ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetail();
  }, [id]);

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải chi tiết dịch vụ...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Không tìm thấy dịch vụ"}
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
                        service.service_type === "civil" ||
                        service.service_type === "Nhanh"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {service.service_type === "civil"
                        ? "Dân sự"
                        : service.service_type === "Nhanh"
                        ? "Nhanh"
                        : "Pháp lý"}
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
                {service.process_steps?.map((step: string, index: number) => (
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
                    {service.sample_types?.map(
                      (type: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700">{type}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Phương thức lấy mẫu
                  </h3>
                  <div className="space-y-2">
                    {service.collection_methods?.includes("self_collect") && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">
                          Tự lấy mẫu tại nhà
                        </span>
                      </div>
                    )}
                    {service.collection_methods?.includes(
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
                {service.faq?.map((item: any, index: number) => (
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
        {relatedServices.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Dịch vụ liên quan
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedServices.map((relatedService) => (
                <Link
                  key={relatedService.id}
                  to={`/services/${relatedService.id}`}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 block"
                >
                  <div className="flex items-center gap-3 mb-4">
                    {getIcon(relatedService.icon)}
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        relatedService.service_type === "civil" ||
                        relatedService.service_type === "Nhanh"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {relatedService.service_type === "civil"
                        ? "Dân sự"
                        : relatedService.service_type === "Nhanh"
                        ? "Nhanh"
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
        )}
      </div>
    </div>
  );
};

export default ServiceDetail;
