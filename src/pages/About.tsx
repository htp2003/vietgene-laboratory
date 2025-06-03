import React from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Users,
  Shield,
  Clock,
  Target,
  Heart,
  CheckCircle,
  Star,
  Building,
  Calendar,
  TrendingUp,
  Microscope,
} from "lucide-react";

const About: React.FC = () => {
  const stats = [
    { number: "8,000+", label: "Khách hàng tin tưởng", icon: Users },
    { number: "99.99%", label: "Độ chính xác", icon: Target },
    { number: "5-7", label: "Ngày có kết quả", icon: Clock },
    { number: "10+", label: "Năm kinh nghiệm", icon: Calendar },
  ];

  const team = [
    {
      name: "TS. Hà Tấn Phát",
      position: "Giám đốc khoa học",
      education: "Tiến sĩ Sinh học phân tử - ĐH Y Harvard",
      experience:
        "15 năm kinh nghiệm trong lĩnh vực xét nghiệm DNA, chưa làm ai chết vì xét nghiệm",
      image: null,
    },
    {
      name: "ThS. Trần Anh Sơn",
      position: "Trưởng phòng Lab",
      education: "Thạc sĩ Công nghệ sinh học - ĐH Quốc gia",
      experience:
        "12 năm kinh nghiệm quản lý phòng thí nghiệm, chưa ra khỏi phòng lab bao giờ",
      image: null,
    },
    {
      name: "BS. Phan Văn Dõi",
      position: "Chuyên gia tư vấn",
      education: "Bác sĩ chuyên khoa Di truyền - ĐH Y Hà Nội",
      experience:
        "10 năm kinh nghiệm tư vấn di truyền học, chưa từng tư vấn sai",
      image: null,
    },
  ];

  const certifications = [
    {
      name: "ISO 15189:2012",
      description: "Tiêu chuẩn quốc tế về phòng thí nghiệm y tế",
      year: "2020",
    },
    {
      name: "CAP Certification",
      description: "Chứng nhận từ Hiệp hội Bệnh lý học Hoa Kỳ",
      year: "2021",
    },
    {
      name: "AABB Accredited",
      description: "Chứng nhận từ Hiệp hội Ngân hàng máu Hoa Kỳ",
      year: "2022",
    },
    {
      name: "VILAS Certified",
      description: "Chứng nhận từ Hiệp hội Phòng thí nghiệm Việt Nam",
      year: "2023",
    },
  ];

  const values = [
    {
      icon: Shield,
      title: "Bảo mật tuyệt đối",
      description:
        "Thông tin khách hàng được mã hóa và bảo mật theo tiêu chuẩn cao nhất quốc tế",
    },
    {
      icon: Target,
      title: "Chính xác tối đa",
      description:
        "Sử dụng công nghệ tiên tiến nhất với độ chính xác lên đến 99.99%",
    },
    {
      icon: Heart,
      title: "Tận tâm phục vụ",
      description:
        "Đội ngũ chuyên gia luôn đồng hành và hỗ trợ khách hàng 24/7",
    },
    {
      icon: TrendingUp,
      title: "Không ngừng cải tiến",
      description:
        "Liên tục cập nhật công nghệ và quy trình để mang lại dịch vụ tốt nhất",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Về <span className="text-red-200">VietGene Lab</span>
          </h1>
          <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto">
            Đơn vị hàng đầu Việt Nam trong lĩnh vực xét nghiệm DNA với công nghệ
            tiên tiến và đội ngũ chuyên gia giàu kinh nghiệm
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Stats Section */}
        <div className="py-16">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="py-16">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sứ mệnh</h2>
              <p className="text-gray-600 leading-relaxed">
                Mang đến cho mọi gia đình Việt Nam dịch vụ xét nghiệm DNA chính
                xác, nhanh chóng và đáng tin cậy. Chúng tôi cam kết sử dụng công
                nghệ tiên tiến nhất, kết hợp với đội ngũ chuyên gia giàu kinh
                nghiệm để giải quyết những thắc mắc về mối quan hệ huyết thống.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Tầm nhìn
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Trở thành đơn vị hàng đầu khu vực Đông Nam Á trong lĩnh vực xét
                nghiệm DNA, được khách hàng tin tưởng và lựa chọn. Chúng tôi
                hướng tới việc mở rộng dịch vụ và ứng dụng công nghệ AI để mang
                lại trải nghiệm tốt nhất cho khách hàng.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Giá trị cốt lõi
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những nguyên tắc định hướng mọi hoạt động của chúng tôi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Đội ngũ chuyên gia
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Các chuyên gia hàng đầu với nhiều năm kinh nghiệm trong lĩnh vực
              xét nghiệm DNA
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-red-600" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-red-600 font-medium mb-3">
                    {member.position}
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>{member.education}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Building className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>{member.experience}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Chứng nhận & Tiêu chuẩn
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              VietGene Lab đạt được các chứng nhận quốc tế về chất lượng và tiêu
              chuẩn
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{cert.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{cert.description}</p>
                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                  {cert.year}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Section */}
        <div className="py-16">
          <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 md:p-12 text-white">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-6">
                  <Microscope className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-6">Công nghệ tiên tiến</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">
                        STR Analysis (Short Tandem Repeat)
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Phân tích trình tự lặp ngắn với độ chính xác cao
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">PCR Amplification</h3>
                      <p className="text-gray-300 text-sm">
                        Khuếch đại DNA với hệ thống PCR real-time
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">
                        Capillary Electrophoresis
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Điện di mao quản phân tích với độ phân giải cao
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">LIMS System</h3>
                      <p className="text-gray-300 text-sm">
                        Hệ thống quản lý thông tin phòng lab tự động (Chúng tôi
                        mới chế ra)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <div className="inline-block bg-red-600 rounded-2xl p-8">
                  <div className="text-4xl font-bold mb-2">99.99%</div>
                  <div className="text-red-100">Độ chính xác</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16">
          <div className="bg-red-50 rounded-2xl p-8 md:p-12 text-center border border-red-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Hãy để VietGene Lab đồng hành cùng bạn trong hành trình tìm hiểu
              về mối quan hệ huyết thống
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/services"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Xem dịch vụ
              </Link>
              <Link
                to="/contact"
                className="bg-white hover:bg-gray-50 text-gray-800 px-8 py-3 rounded-lg font-medium border border-gray-300 transition-colors"
              >
                Liên hệ tư vấn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
