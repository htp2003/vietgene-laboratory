import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  User,
  Eye,
  Search,
  Clock,
  ArrowRight,
  TrendingUp,
  Star,
} from "lucide-react";

// Mock data based on blog_posts table
const mockNews = [
  {
    id: 1,
    title: "Công nghệ xét nghiệm DNA mới: Độ chính xác lên đến 99.99%",
    content:
      "VietGene Lab vừa áp dụng công nghệ STR Analysis thế hệ mới với độ chính xác vượt trội, giúp khách hàng có được kết quả tin cậy nhất...",
    author_id: 1,
    author: {
      full_name: "TS. Nguyễn Văn Minh",
      avatar: null,
    },
    status: "published",
    view_count: 1250,
    featured_image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop",
    created_at: "2025-06-15T09:00:00Z",
    excerpt:
      "Khám phá công nghệ xét nghiệm DNA tiên tiến nhất hiện nay với độ chính xác vượt trội...",
    reading_time: 5,
    is_featured: true,
  },
  {
    id: 2,
    title: "Hướng dẫn chuẩn bị trước khi xét nghiệm DNA",
    content:
      "Để có kết quả xét nghiệm chính xác nhất, khách hàng cần lưu ý một số điều quan trọng trước khi tiến hành lấy mẫu...",
    author_id: 2,
    author: {
      full_name: "ThS. Trần Thị Lan",
      avatar: null,
    },
    status: "published",
    view_count: 890,
    featured_image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop",
    created_at: "2025-06-12T14:30:00Z",
    excerpt:
      "Những lưu ý quan trọng giúp đảm bảo chất lượng mẫu xét nghiệm tốt nhất...",
    reading_time: 3,
    is_featured: false,
  },
  {
    id: 3,
    title: "Xét nghiệm huyết thống: Khám phá nguồn gốc gia đình",
    content:
      "Dịch vụ xét nghiệm huyết thống giúp bạn tìm hiểu về nguồn gốc, lịch sử di cư và kết nối với họ hàng xa...",
    author_id: 1,
    author: {
      full_name: "TS. Nguyễn Văn Minh",
      avatar: null,
    },
    status: "published",
    view_count: 672,
    featured_image:
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=400&fit=crop",
    created_at: "2025-06-10T11:15:00Z",
    excerpt:
      "Hành trình khám phá nguồn gốc gia đình qua công nghệ xét nghiệm DNA hiện đại...",
    reading_time: 7,
    is_featured: true,
  },
  {
    id: 4,
    title: "VietGene Lab đạt chứng nhận ISO 15189:2012",
    content:
      "Chúng tôi vinh dự thông báo VietGene Lab đã chính thức đạt được chứng nhận ISO 15189:2012 - tiêu chuẩn quốc tế về phòng thí nghiệm y tế...",
    author_id: 3,
    author: {
      full_name: "BS. Lê Quang Hùng",
      avatar: null,
    },
    status: "published",
    view_count: 445,
    featured_image:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=400&fit=crop",
    created_at: "2025-06-08T16:45:00Z",
    excerpt:
      "Một cột mốc quan trọng khẳng định chất lượng dịch vụ đạt tiêu chuẩn quốc tế...",
    reading_time: 4,
    is_featured: false,
  },
  {
    id: 5,
    title: "Câu hỏi thường gặp về xét nghiệm quan hệ cha con",
    content:
      "Tổng hợp những câu hỏi phổ biến nhất mà khách hàng thường quan tâm khi thực hiện xét nghiệm quan hệ cha con...",
    author_id: 2,
    author: {
      full_name: "ThS. Trần Thị Lan",
      avatar: null,
    },
    status: "published",
    view_count: 1180,
    featured_image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop",
    created_at: "2025-06-06T10:20:00Z",
    excerpt:
      "Giải đáp chi tiết các thắc mắc phổ biến về quy trình và kết quả xét nghiệm...",
    reading_time: 6,
    is_featured: false,
  },
  {
    id: 6,
    title: "Bảo mật thông tin khách hàng - Cam kết của VietGene Lab",
    content:
      "Chúng tôi hiểu rằng thông tin xét nghiệm DNA là vô cùng nhạy cảm. Vì vậy, VietGene Lab cam kết bảo mật tuyệt đối...",
    author_id: 1,
    author: {
      full_name: "TS. Nguyễn Văn Minh",
      avatar: null,
    },
    status: "published",
    view_count: 567,
    featured_image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop",
    created_at: "2025-06-04T13:10:00Z",
    excerpt:
      "Tìm hiểu về các biện pháp bảo mật tiên tiến để bảo vệ thông tin cá nhân...",
    reading_time: 4,
    is_featured: false,
  },
];

const News: React.FC = () => {
  const [news, setNews] = useState(mockNews);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const filteredNews = news.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedNews = [...filteredNews].sort((a, b) => {
    if (sortBy === "latest") {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      return b.view_count - a.view_count;
    }
  });

  const featuredNews = sortedNews.filter((article) => article.is_featured);
  const regularNews = sortedNews.filter((article) => !article.is_featured);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải tin tức...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Tin tức & Kiến thức
            </h1>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              Cập nhật những thông tin mới nhất về công nghệ xét nghiệm DNA và
              các kiến thức hữu ích
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("latest")}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                sortBy === "latest"
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Mới nhất
            </button>
            <button
              onClick={() => setSortBy("popular")}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                sortBy === "popular"
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Phổ biến
            </button>
          </div>
        </div>

        {/* Featured Articles */}
        {featuredNews.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-8">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                Bài viết nổi bật
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {featuredNews.slice(0, 2).map((article) => (
                <Link
                  key={article.id}
                  to={`/news/${article.id}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Nổi bật
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{article.author.full_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(article.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{formatViewCount(article.view_count)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{article.reading_time} phút</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Articles */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Tất cả bài viết
            </h2>
            <span className="text-gray-500">{sortedNews.length} bài viết</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularNews.map((article) => (
              <Link
                key={article.id}
                to={`/news/${article.id}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={article.featured_image}
                    alt={article.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{article.author.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatViewCount(article.view_count)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{article.reading_time}p</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatDate(article.created_at)}
                      </span>
                      <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                        <span>Đọc thêm</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* No Results */}
        {sortedNews.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy bài viết
            </h3>
            <p className="text-gray-600">
              Hãy thử với từ khóa khác hoặc xóa bộ lọc tìm kiếm
            </p>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 md:p-12 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Thống kê nội dung</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">{news.length}</div>
              <div className="text-red-100">Bài viết</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">
                {news
                  .reduce((sum, article) => sum + article.view_count, 0)
                  .toLocaleString()}
              </div>
              <div className="text-red-100">Lượt xem</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">
                {featuredNews.length}
              </div>
              <div className="text-red-100">Bài nổi bật</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">
                {Math.round(
                  news.reduce((sum, article) => sum + article.reading_time, 0) /
                    news.length
                )}
              </div>
              <div className="text-red-100">Phút đọc TB</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;
