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
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { newsService, NewsArticle } from "../../services/newsService";

const News: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📰 Fetching news from API...");
      const response = await newsService.getAllNews();

      if (response.success && response.data) {
        console.log("✅ News data received:", response.data);
        setNews(response.data);
      } else {
        console.error("❌ Failed to fetch news:", response.message);
        setError(response.message || "Không thể tải tin tức");
        toast.error(response.message || "Không thể tải tin tức");
      }
    } catch (error: any) {
      console.error("💥 News fetch error:", error);
      setError("Có lỗi xảy ra khi tải tin tức");
      toast.error("Có lỗi xảy ra khi tải tin tức");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchNews();
  };

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

  // Loading State
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

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không thể tải tin tức
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Thử lại
          </button>
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
                    {article.featured_image ? (
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                        <div className="text-red-400 text-center">
                          <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">VietGene Lab</p>
                        </div>
                      </div>
                    )}
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
                      {article.excerpt ||
                        article.content.substring(0, 150) + "..."}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>
                            {article.author?.full_name || "VietGene Lab"}
                          </span>
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
                        {article.reading_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{article.reading_time} phút</span>
                          </div>
                        )}
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
                  {article.featured_image ? (
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-gray-400 text-center">
                        <TrendingUp className="w-8 h-8 mx-auto mb-1" />
                        <p className="text-xs">VietGene Lab</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {article.excerpt ||
                      article.content.substring(0, 100) + "..."}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{article.author?.full_name || "VietGene Lab"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatViewCount(article.view_count)}</span>
                      </div>
                      {article.reading_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{article.reading_time}p</span>
                        </div>
                      )}
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
        {sortedNews.length === 0 && !loading && (
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
        {news.length > 0 && (
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
                  {news.filter((a) => a.reading_time).length > 0
                    ? Math.round(
                        news
                          .filter((a) => a.reading_time)
                          .reduce(
                            (sum, article) => sum + (article.reading_time || 0),
                            0
                          ) / news.filter((a) => a.reading_time).length
                      )
                    : 0}
                </div>
                <div className="text-red-100">Phút đọc TB</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Container */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
            padding: "16px",
            borderRadius: "8px",
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
        }}
      />
    </div>
  );
};

export default News;
