import React, { useState } from 'react';
import { FaPlus, FaNewspaper, FaEye, FaClock, FaStar } from 'react-icons/fa';
import { useBlog, BlogFormData } from '../../hooks/useBlog';
import { NewsArticle } from '../../services/newsService';
import BlogModal from '../../components/admin/blog/BlogModal';
import BlogList from '../../components/admin/blog/BlogList';

export default function BlogManagement() {
  const {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    approvePost,
    getFilteredPosts,
    getBlogStats,
  } = useBlog();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsArticle | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    imageUrl: '', 
    status: 'draft' as 'draft' | 'published',
  });

  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');


  const handleFileChange = (file: File | null) => {
  };

  const handleOpenModal = (post: NewsArticle | null = null) => {
    if (post) {
      setForm({
        title: post.title || '',
        content: post.content || '',
        imageUrl: post.imageUrl || post.featured_image || '',
        status: post.status || 'draft',
      });
      setEditingPost(post);
    } else {
      setForm({
        title: '',
        content: '',
        imageUrl: '',
        status: 'draft',
      });
      setEditingPost(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingPost(null);
    setForm({
      title: '',
      content: '',
      imageUrl: '',
      status: 'draft',
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'status') {
      setForm(prev => ({ ...prev, status: value as 'draft' | 'published' })); 
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.content.trim()) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }

    setSubmitting(true);

    try {
      const apiData = {
        title: form.title.trim(),
        content: form.content.trim(),
        imageUrl: form.imageUrl.trim(),
      };

      console.log('📤 Sending to API:', apiData);

      let response;
      
      if (editingPost) {

        response = await updatePost(editingPost.id, apiData);
      } else {

        response = await createPost(apiData as any);
      }

      if (response.success) {
        alert(response.message);
        handleCloseModal();
      } else {
        alert(`Lỗi: ${response.message}`);
      }
    } catch (err: any) {
      console.error('Error submitting post:', err);
      alert('Có lỗi xảy ra khi lưu bài viết');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (post: NewsArticle) => {
    if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      try {
        const response = await deletePost(post.id);
        if (response.success) {
          alert(response.message);
        } else {
          alert(`Lỗi: ${response.message}`);
        }
      } catch (err: any) {
        console.error('Error deleting post:', err);
        alert('Có lỗi xảy ra khi xóa bài viết');
      }
    }
  };

  const handleApprove = async (post: NewsArticle) => {
    try {
      const response = await approvePost(post);
      if (response.success) {
        alert(response.message);
      } else {
        alert(`Lỗi: ${response.message}`);
      }
    } catch (err: any) {
      console.error('Error approving post:', err);
      alert('Có lỗi xảy ra khi duyệt bài viết');
    }
  };

  const filteredPosts = getFilteredPosts(searchTerm, filterStatus);
  const stats = getBlogStats();

  return (
    <div className="space-y-6 p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Blog</h1>
          <p className="text-gray-600 mt-1">Tạo và quản lý các bài viết blog</p>
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus />
          Thêm bài viết
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaNewspaper size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng số</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaStar size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã xuất bản</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.published}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FaClock size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bản nháp</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.draft}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100 text-gray-600">
              <FaEye size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lượt xem</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalViews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="lg:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <p className="text-gray-600">Đang tải danh sách bài viết...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-center items-center h-48">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow text-center max-w-md">
              <h3 className="font-semibold text-lg mb-2">Có lỗi xảy ra</h3>
              <p className="mb-4">{error.message}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Danh sách bài viết ({filteredPosts.length})
            </h2>
          </div>
          
          <BlogList
            posts={filteredPosts}
            categories={[]}
            users={[]}
            loading={false}
            error={null}
            onEdit={handleOpenModal}
            onDelete={(id) => {
              const post = posts.find(p => p.id === id.toString());
              if (post) handleDelete(post);
            }}
            onApprove={(post) => handleApprove(post)}
          />
          
          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FaNewspaper size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {filterStatus || searchTerm ? 'Không có bài viết phù hợp' : 'Chưa có bài viết nào'}
              </h3>
              <p className="text-gray-500 mb-4">
                {filterStatus || searchTerm 
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.' 
                  : 'Tạo bài viết đầu tiên để bắt đầu chia sẻ nội dung.'
                }
              </p>
              {!filterStatus && !searchTerm && (
                <button
                  onClick={() => handleOpenModal(null)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tạo bài viết đầu tiên
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Blog Modal */}
      <BlogModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onFileChange={handleFileChange} // Dummy function
        form={form}
        onFormChange={handleFormChange}
        categories={[]} 
        editing={!!editingPost}
        submitting={submitting}
      />
    </div>
  );
}