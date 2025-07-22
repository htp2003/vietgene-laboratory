import React, { useRef } from 'react';
import { FaTimes, FaNewspaper, FaImage, FaEdit, FaEye, FaTrash, FaUpload } from 'react-icons/fa';

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: {
    title: string;
    content: string;
    imageFile?: File | null;
    imageUrl: string;
    status?: 'draft' | 'published';
  };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onFileChange: (file: File | null) => void;
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
  onFileChange,
  editing,
  submitting = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!isOpen) return null;

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileChange(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getImagePreviewUrl = () => {
    if (form.imageFile) {
      return URL.createObjectURL(form.imageFile);
    }
    return form.imageUrl || '';
  };

  const hasImage = form.imageFile || form.imageUrl

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

            {/* Image Upload */}
            <div>
              <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaImage size={14} />
                Hình ảnh đại diện
              </label>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={submitting}
              />

              {/* Upload area */}
              <div className="space-y-3">
                {!hasImage ? (
                  <div
                    onClick={handleUploadClick}
                    className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <div className="text-center">
                      <FaUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        Nhấp để chọn hình ảnh
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF tối đa 10MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      {/* Image preview */}
                      <div className="relative">
                        <img
                          src={getImagePreviewUrl()}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>

                      {/* File info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {form.imageFile ? form.imageFile.name : 'Hình ảnh hiện tại'}
                        </p>
                        {form.imageFile && (
                          <p className="text-xs text-gray-500 mt-1">
                            {(form.imageFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={handleUploadClick}
                            disabled={submitting}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                          >
                            Thay đổi
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={submitting}
                            className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50 flex items-center gap-1"
                          >
                            <FaTrash size={10} />
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Hình ảnh sẽ hiển thị như thumbnail của bài viết
              </p>
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