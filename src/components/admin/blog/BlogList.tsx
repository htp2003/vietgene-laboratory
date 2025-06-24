import React from 'react';
import { FaCheck, FaEdit, FaTrash, FaEye, FaImage, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { NewsArticle } from '../../../services/newsService';

interface BlogListProps {
  posts: NewsArticle[];
  categories: any[]; // Not used in current implementation
  users: any[]; // Not used in current implementation
  loading: boolean;
  error: string | null;
  onEdit: (post: NewsArticle) => void;
  onDelete: (id: number | string) => void;
  onApprove: (post: NewsArticle) => void;
}

const BlogList: React.FC<BlogListProps> = ({ 
  posts, 
  onEdit, 
  onDelete, 
  onApprove 
}) => {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'published':
        return 'Đã xuất bản';
      case 'draft':
        return 'Bản nháp';
      default:
        return 'Bản nháp';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <FaImage className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Không có bài viết nào</h3>
        <p className="text-gray-500">Danh sách bài viết trống hoặc không có bài viết phù hợp với bộ lọc.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bài viết
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tác giả
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lượt xem
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày tạo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {posts.map(post => (
            <tr key={post.id} className="hover:bg-gray-50 transition-colors">
              {/* Post Info */}
              <td className="px-6 py-4">
                <div className="flex items-start space-x-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    {post.imageUrl || post.featured_image ? (
                      <img
                        src={post.imageUrl || post.featured_image}
                        alt={post.title}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <FaImage className="text-gray-400" size={20} />
                      </div>
                    )}
                  </div>
                  
                  {/* Title and Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {post.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {truncateText(post.content)}
                    </div>
                    {post.reading_time && (
                      <div className="text-xs text-gray-400 mt-1 flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        {post.reading_time} phút đọc
                      </div>
                    )}
                  </div>
                </div>
              </td>

              {/* Author */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-blue-600" size={14} />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {post.author?.full_name || 'VietGene Lab'}
                    </div>
                  </div>
                </div>
              </td>

              {/* Status */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(post.status)}`}>
                  {getStatusText(post.status)}
                </span>
              </td>

              {/* View Count */}
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center">
                  <FaEye className="text-gray-400 mr-1" size={14} />
                  <span className="text-sm text-gray-900">
                    {post.view_count || 0}
                  </span>
                </div>
              </td>

              {/* Created Date */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatDate(post.createdAt)}
                </div>
                {post.updatedAt && post.updatedAt !== post.createdAt && (
                  <div className="text-xs text-gray-500">
                    Cập nhật: {formatDate(post.updatedAt)}
                  </div>
                )}
              </td>

              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center  gap-2">
                  {/* Edit Button */}
                  <button
                    onClick={() => onEdit(post)}
                    className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-full hover:bg-blue-50"
                    title="Chỉnh sửa"
                  >
                    <FaEdit size={16} />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => onDelete(post.id)}
                    className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-50"
                    title="Xóa"
                  >
                    <FaTrash size={16} />
                  </button>

                  {/* Approve Button - Only show for draft posts (since API doesn't have pending) */}
                  {post.status === 'draft' && (
                    <button
                      onClick={() => onApprove(post)}
                      className="text-green-600 hover:text-green-900 transition-colors p-2 rounded-full hover:bg-green-50"
                      title="Xuất bản bài viết"
                    >
                      <FaCheck size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BlogList;