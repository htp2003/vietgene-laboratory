import React from 'react';
import { FaTimes, FaNewspaper, FaImage, FaEdit, FaEye } from 'react-icons/fa';

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: {
    title: string;
    content: string;
    imageUrl: string;
    status?: 'draft' | 'published'; // ✅ Removed 'pending'
  };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  categories: any[]; // Not used in current implementation
  editing: boolean;
  submitting?: boolean;
}

const BlogModal: React.FC<BlogModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  onFormChange,
  editing,
  submitting = false
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaNewspaper className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {editing ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {editing ? 'Cập nhật thông tin bài viết' : 'Tạo bài viết mới cho blog'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={onSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề bài viết <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={onFormChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Nhập tiêu đề bài viết..."
                required
                disabled={submitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Tiêu đề hấp dẫn sẽ thu hút nhiều người đọc hơn
              </p>
            </div>

            {/* Image URL */}
            <div>
              <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaImage size={14} />
                Hình ảnh đại diện
              </label>
              <input
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={onFormChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="https://example.com/image.jpg"
                disabled={submitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                URL hình ảnh sẽ hiển thị như thumbnail của bài viết
              </p>
              
              {/* Image Preview */}
              {form.imageUrl && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Xem trước:</p>
                  <div className="relative inline-block">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaEdit size={14} />
                Nội dung bài viết <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={form.content}
                onChange={onFormChange}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                placeholder="Viết nội dung bài viết của bạn tại đây..."
                required
                disabled={submitting}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Nội dung chi tiết và hữu ích sẽ mang lại giá trị cho người đọc
                </p>
                <p className="text-xs text-gray-400">
                  {form.content.length} ký tự
                </p>
              </div>
            </div>

            {/* Status (optional - could be used for admin control) */}
            {editing && (
              <div>
                <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaEye size={14} />
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={form.status || 'draft'}
                  onChange={onFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={submitting}
                >
                  <option value="draft">Bản nháp</option>
                  <option value="published">Đã xuất bản</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Chọn trạng thái phù hợp cho bài viết
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={onSubmit}
            disabled={submitting || !form.title.trim() || !form.content.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium flex items-center gap-2 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Đang lưu...
              </>
            ) : (
              <>
                {editing ? (
                  <>
                    <FaEdit size={16} />
                    Cập nhật
                  </>
                ) : (
                  <>
                    <FaNewspaper size={16} />
                    Tạo bài viết
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogModal;