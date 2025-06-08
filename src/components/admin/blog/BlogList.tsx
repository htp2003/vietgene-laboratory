import React from 'react';
import { BlogPost, Category } from '../../../api/blog.api';
import { User } from '../../../api/users.api';
import { FaCheck, FaEdit, FaTrash } from 'react-icons/fa';

interface BlogListProps {
  posts: BlogPost[];
  categories: Category[];
  users: User[];
  loading: boolean;
  error: string | null;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: number) => void;
  onApprove: (post: BlogPost) => void;
}

const BlogList: React.FC<BlogListProps> = ({ posts, categories, users, onEdit, onDelete, onApprove }) => {
  return (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead >
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">Tiêu đề</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">Chuyên mục</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">Tác giả</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">Lượt xem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">Ngày tạo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-4 text-gray-400">Chưa có bài viết</td></tr>
            ) : (
              posts.map(post => {
                const cat = categories.find(c => c.id === post.category_id);
                const author = users.find((u) => u.id === post.author_id);
                let statusBadge = '';
                if (post.status === 'published') statusBadge = 'bg-green-100 text-green-700';
                else if (post.status === 'pending') statusBadge = 'bg-yellow-100 text-yellow-800';
                else statusBadge = 'bg-gray-100 text-gray-700';
                return (
                  <tr key={post.id} className="hover:bg-blue-50">
                    <td className="px-6 py-3 font-medium">{post.title}</td>
                    <td className="px-6 py-3 ">{cat?.category_name || '-'}</td>
                    <td className="px-6 py-3 ">{author?.fullName || '-'}</td>
                    <td className="px-6 py-3 ">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusBadge}`}>{
                        post.status === 'published' ? 'Công khai' : post.status === 'pending' ? 'Chờ duyệt' : 'Nháp'
                      }</span>
                    </td>
                    <td className="px-6 py-3  text-center">{post.view_count}</td>
                    <td className="px-6 py-3 ">{new Date(post.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-3  flex gap-2">
                    <div className="flex items-center gap-3">
                      <button className="text-blue-600 hover:text-blue-900" onClick={() => onEdit(post)}><FaEdit size={18} /></button>
                      <button className="text-red-600 hover:text-red-900" onClick={() => onDelete(post.id)}><FaTrash size={18} /></button>
                      {post.status === 'pending' && (
                        <button className="text-green-600 hover:text-green-900" onClick={() => onApprove(post)}><FaCheck size={18} /></button>
                      )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

    </div>
  );
};

export default BlogList;
