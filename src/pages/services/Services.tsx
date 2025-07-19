import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Microscope,
  FlaskConical,
  Dna,
  TreePine,
  Scale,
  FileCheck,
  Loader,
  AlertCircle,
} from "lucide-react";
import {
  ServiceService,
  mapApiServiceToFrontend,
  formatPrice,
  getCategoryName,
  getServiceTypeName,
} from "../../services/serviceService";

const Services: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        console.log("Starting to fetch services...");

        const apiServices = await ServiceService.getAllServices();
        console.log("Raw API services:", apiServices);

        if (!apiServices || apiServices.length === 0) {
          console.warn("No services returned from API");
          setServices([]);
          setError("Chưa có dịch vụ nào được thiết lập.");
          return;
        }

        const mappedServices = apiServices
          .map((service, index) => {
            console.log(`=== MAPPING SERVICE ${index} ===`);
            console.log("Raw API service:", service);
            console.log(
              "testPrice:",
              service.testPrice,
              typeof service.testPrice
            );
            console.log(
              "durationDays:",
              service.durationDays,
              typeof service.durationDays
            );

            try {
              const mapped = mapApiServiceToFrontend(service);
              console.log("=== MAPPED RESULT ===");
              console.log("Final price:", mapped.price, typeof mapped.price);
              console.log(
                "Final duration:",
                mapped.duration_days,
                typeof mapped.duration_days
              );
              console.log("=====================");
              return mapped;
            } catch (mappingError) {
              console.error(`Error mapping service ${index}:`, mappingError);
              return null;
            }
          })
          .filter(Boolean);

        console.log("Final mapped services:", mappedServices);
        setServices(mappedServices);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch services:", err);
        setError("Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = services.filter((service) => {
    const categoryMatch =
      selectedFilter === "all" || service.test_category === selectedFilter;
    const typeMatch =
      selectedType === "all" || service.service_type === selectedType;
    return categoryMatch && typeMatch;
  });

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
    return <IconComponent className="w-8 h-8 text-red-600" />;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dịch vụ...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Dịch vụ xét nghiệm <span className="text-red-600">DNA</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chúng tôi cung cấp đầy đủ các dịch vụ xét nghiệm DNA với công nghệ
            hiện đại, độ chính xác cao và quy trình chuyên nghiệp
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Category Filter */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Loại xét nghiệm
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "Tất cả" },
                    { value: "Cơ bản", label: "Cơ bản" },
                    { value: "paternity", label: "Cha con" },
                    { value: "maternity", label: "Mẹ con" },
                    { value: "sibling", label: "Anh chị em" },
                    { value: "ancestry", label: "Huyết thống" },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setSelectedFilter(filter.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedFilter === filter.value
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div> */}

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mục đích sử dụng
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "Tất cả" },
                    { value: "Nhanh", label: "Nhanh" },
                    { value: "civil", label: "Dân sự" },
                    { value: "administrative", label: "Pháp lý" },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedType === type.value
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredServices.map((service) => {
            console.log(
              "Rendering service:",
              service.service_name,
              "Price:",
              service.price,
              "Duration:",
              service.duration_days
            );
            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-8 pb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>{getIcon(service.icon)}</div>
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          service.service_type === "civil" ||
                          service.service_type === "Nhanh"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {getServiceTypeName(service.service_type)}
                      </span>
                      {/* <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getCategoryName(service.test_category)}
                      </span> */}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                    {service.service_name}
                  </h3>

                  <p className="text-gray-600 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {service.features?.map((feature: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <svg
                          className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-8 pb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(service.price)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Kết quả trong {service.duration_days || "N/A"} ngày
                      </div>
                    </div>

                    {service.requires_legal_documents && (
                      <div className="text-orange-600 text-xs font-medium bg-orange-50 px-2 py-1 rounded">
                        Cần giấy tờ pháp lý
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to={`/services/${service.id}`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-center"
                    >
                      Xem chi tiết
                    </Link>
                    <Link
                      to={`/order/${service.id}`}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors text-center"
                    >
                      Đặt ngay
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredServices.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy dịch vụ phù hợp
            </h3>
            <p className="text-gray-600">
              Hãy thử thay đổi bộ lọc để xem thêm các dịch vụ khác
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              Cần tư vấn để chọn dịch vụ phù hợp?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-white text-red-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Liên hệ tư vấn
              </Link>
              <Link
                to="/about"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-red-600 transition-colors"
              >
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
