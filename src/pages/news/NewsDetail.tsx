import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  User,
  Eye,
  Clock,
  ArrowLeft,
  Share2,
  BookmarkPlus,
  MessageCircle,
  ThumbsUp,
  ChevronRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { newsService, NewsArticle } from "../../services/newsService";

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    if (id) {
      fetchArticle(id);
      fetchRelatedArticles();
    } else {
      setError("ID bài viết không hợp lệ");
      setLoading(false);
    }
  }, [id]);

  const fetchArticle = async (postId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await newsService.getNewsById(postId);

      if (response.success && response.data) {
        setArticle(response.data);
      } else {
        setError(response.message || "Không thể tải bài viết");
        toast.error(response.message || "Không thể tải bài viết");
      }
    } catch (error: any) {
      console.error("❌ Fetch article error:", error);
      setError("Có lỗi xảy ra khi tải bài viết");
      toast.error("Có lỗi xảy ra khi tải bài viết");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async () => {
    try {
      const response = await newsService.getAllNews();
      if (response.success && response.data) {
        // Get 3 random articles excluding current one
        const filtered = response.data
          .filter((a) => a.id.toString() !== id)
          .slice(0, 3);
        setRelatedArticles(filtered);
      }
    } catch (error) {
      console.error("❌ Fetch related articles error:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handleShare = () => {
    if (navigator.share && article) {
      navigator.share({
        title: article.title,
        text: article.excerpt || article.title,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép link bài viết!");
    }
  };

  const handleBookmark = () => {
    toast.success("Đã lưu bài viết!");
    // TODO: Implement bookmark functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy bài viết
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "Bài viết bạn đang tìm không tồn tại hoặc đã bị xóa."}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/news")}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Về trang tin tức
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-300 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/news")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách tin tức</span>
        </button>

        {/* Article Header */}
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Featured Image */}
          {(article.featured_image || article.imageUrl) && (
            <div className="relative h-64 md:h-80">
              <img
                src={article.featured_image || article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author?.full_name || "VietGene Lab"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDate(article.created_at || article.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{formatViewCount(article.view_count || 0)} lượt xem</span>
              </div>
              {article.reading_time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{article.reading_time} phút đọc</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Chia sẻ</span>
              </button>
              <button
                onClick={handleBookmark}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>Lưu bài viết</span>
              </button>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <div
                className="text-gray-800 leading-relaxed"
                style={{ whiteSpace: "pre-line" }}
              >
                {article.content}
              </div>
            </div>

            {/* Tags/Categories would go here if available */}

            {/* Article Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                    <ThumbsUp className="w-5 h-5" />
                    <span>Hữu ích</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span>Bình luận</span>
                  </button>
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Chia sẻ</span>
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Bài viết liên quan
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  to={`/news/${relatedArticle.id}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {(relatedArticle.featured_image ||
                    relatedArticle.imageUrl) && (
                    <div className="relative h-32">
                      <img
                        src={
                          relatedArticle.featured_image ||
                          relatedArticle.imageUrl
                        }
                        alt={relatedArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                      {relatedArticle.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {formatDate(
                          relatedArticle.created_at || relatedArticle.createdAt
                        )}
                      </span>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>
                          {formatViewCount(relatedArticle.view_count || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast Container */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
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

export default NewsDetail;
