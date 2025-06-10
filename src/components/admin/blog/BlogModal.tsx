import React from 'react';
import { Category } from '../../../api/blog.api';

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: {
    title: string;
    content: string;
    category_id: number;
    status: 'draft' | 'pending' | 'published';
    featured_image: string;
  };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  categories: Category[];
  editing: boolean;
}

const BlogModal: React.FC<BlogModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  onFormChange,
  categories,
  editing
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h3 className="font-semibold text-lg mb-4">{editing ? 'Sửa bài viết' : 'Thêm bài viết'}</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Tiêu đề</label>
            <input
              type="text"
              name="title"
              className="border rounded px-3 py-2 w-full"
              value={form.title}
              onChange={onFormChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Chuyên mục</label>
            <select
              name="category_id"
              className="border rounded px-3 py-2 w-full"
              value={form.category_id}
              onChange={onFormChange}
              required
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.category_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Nội dung</label>
            <textarea
              name="content"
              className="border rounded px-3 py-2 w-full min-h-[100px]"
              value={form.content}
              onChange={onFormChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Trạng thái</label>
            <select
              name="status"
              className="border rounded px-3 py-2 w-full"
              value={form.status}
              onChange={onFormChange}
              required
            >
              <option value="draft">Nháp</option>
              <option value="pending">Chờ duyệt</option>
              <option value="published">Công khai</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 mr-2"
            >Cancel</button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >{editing ? 'Save' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogModal;
