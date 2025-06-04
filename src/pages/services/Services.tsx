import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Microscope,
  FlaskConical,
  Dna,
  TreePine,
  Scale,
  FileCheck,
} from "lucide-react";

// Mock data based on your database schema
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
    features: [
      "Độ chính xác 99.99%",
      "Kết quả trong 5-7 ngày",
      "Hỗ trợ lấy mẫu tại nhà",
      "Bảo mật thông tin tuyệt đối",
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
    features: [
      "Công nghệ hiện đại",
      "Quy trình nhanh chóng",
      "Tư vấn miễn phí",
      "Hỗ trợ 24/7",
    ],
  },
  {
    id: 3,
    service_name: "Xét nghiệm anh chị em ruột",
    test_category: "sibling",
    service_type: "civil",
    description:
      "Xác định mối quan hệ huyết thống giữa các anh chị em cùng cha mẹ",
    price: 2800000,
    duration_days: 7,
    collection_methods: "self_collect,facility_collect",
    requires_legal_documents: false,
    icon: "dna",
    features: [
      "Phân tích DNA toàn diện",
      "Báo cáo chi tiết",
      "Tư vấn chuyên nghiệp",
      "Bảo đảm chất lượng",
    ],
  },
  {
    id: 4,
    service_name: "Xét nghiệm huyết thống tổ tiên",
    test_category: "ancestry",
    service_type: "civil",
    description: "Khám phá nguồn gốc và lịch sử gia đình qua phân tích DNA",
    price: 3500000,
    duration_days: 10,
    collection_methods: "self_collect,facility_collect",
    requires_legal_documents: false,
    icon: "treePine",
    features: [
      "Bản đồ nguồn gốc chi tiết",
      "Lịch sử di cư gia đình",
      "Kết nối với họ hàng xa",
      "Báo cáo đa dạng sinh học",
    ],
  },
  {
    id: 5,
    service_name: "Xét nghiệm pháp lý cha con",
    test_category: "paternity",
    service_type: "administrative",
    description:
      "Xét nghiệm được công nhận về mặt pháp lý cho các thủ tục hành chính",
    price: 3200000,
    duration_days: 7,
    collection_methods: "facility_collect",
    requires_legal_documents: true,
    icon: "scale",
    features: [
      "Được pháp luật công nhận",
      "Quy trình nghiêm ngặt",
      "Giấy tờ pháp lý đầy đủ",
      "Hỗ trợ thủ tục hành chính",
    ],
  },
  {
    id: 6,
    service_name: "Xét nghiệm pháp lý anh chị em",
    test_category: "sibling",
    service_type: "administrative",
    description:
      "Xét nghiệm anh chị em có giá trị pháp lý cho các thủ tục thừa kế",
    price: 3500000,
    duration_days: 8,
    collection_methods: "facility_collect",
    requires_legal_documents: true,
    icon: "fileCheck",
    features: [
      "Có giá trị tại tòa án",
      "Phục vụ thủ tục thừa kế",
      "Quy trình chuẩn quốc tế",
      "Bảo mật cao độ",
    ],
  },
];

const Services: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredServices = services.filter((service) => {
    const categoryMatch =
      selectedFilter === "all" || service.test_category === selectedFilter;
    const typeMatch =
      selectedType === "all" || service.service_type === selectedType;
    return categoryMatch && typeMatch;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      paternity: "Cha con",
      maternity: "Mẹ con",
      sibling: "Anh chị em",
      ancestry: "Huyết thống",
    };
    return names[category] || category;
  };

  const getServiceTypeName = (type: string) => {
    return type === "civil" ? "Dân sự" : "Pháp lý";
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
    return <IconComponent className="w-8 h-8 text-red-600" />;
  };

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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Loại xét nghiệm
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "Tất cả" },
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
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mục đích sử dụng
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "Tất cả" },
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
          {filteredServices.map((service) => (
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
                        service.service_type === "civil"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {getServiceTypeName(service.service_type)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {getCategoryName(service.test_category)}
                    </span>
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
                  {service.features.map((feature, index) => (
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
                      Kết quả trong {service.duration_days} ngày
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
          ))}
        </div>

        {/* No Results */}
        {filteredServices.length === 0 && (
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
