import React, { useState } from 'react';
import { useBlogPosts, useCategories } from '../../hooks/useBlogPosts';
import { mockUsers } from '../../api/users.api';
import BlogModal from '../../components/admin/blog/BlogModal';
import BlogList from '../../components/admin/blog/BlogList';

export default function BlogManagement() {
  const { posts, loading, error, addPost, updatePost, deletePost } = useBlogPosts();
  const { categories } = useCategories();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [form, setForm] = useState<{
    title: string;
    content: string;
    category_id: number;
    status: 'draft' | 'pending' | 'published';
    featured_image: string;
  }>({
    title: '',
    content: '',
    category_id: categories[0]?.id ?? 1,
    status: 'draft',
    featured_image: '',
  });
  const [filterCat, setFilterCat] = useState<number | ''>('');

  const handleOpenModal = (post: any = null) => {
    if (post) {
      setForm({
        title: post.title,
        content: post.content,
        category_id: post.category_id,
        status: post.status,
        featured_image: post.featured_image || '',
      });
      setEditingPost(post);
    } else {
      setForm({
        title: '',
        content: '',
        category_id: categories[0]?.id ?? 1,
        status: 'draft',
        featured_image: '',
      });
      setEditingPost(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingPost(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'status') {
      setForm(prev => ({ ...prev, status: value as 'draft' | 'pending' | 'published' }));
    } else if (name === 'category_id') {
      setForm(prev => ({ ...prev, category_id: Number(value) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    if (editingPost) {
      await updatePost({ ...editingPost, ...form });
    } else {
      await addPost({ ...form, author_id: '1', status: 'draft' }); // giả lập author_id: '1'
    }
    handleCloseModal();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      await deletePost(id);
    }
  };

  const filteredPosts = filterCat
    ? posts.filter(p => p.category_id === filterCat)
    : posts;

  // Duyệt bài viết (admin)
  const handleApprove = async (post: any) => {
    await updatePost({ ...post, status: 'published' });
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Quản lý Blog</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => handleOpenModal(null)}
        >
          + Add new blog
        </button>
      </div>
      {/* Loading và error giống các management khác */}
      {loading && (
        <div className="flex justify-center items-center h-96">
          <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      )}
      {error && !loading && (
        <div className="flex justify-center items-center h-48">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded shadow text-lg">
            {error}
          </div>
        </div>
      )}
      {!loading && !error && (
        <>
          <div className="mb-4 flex gap-4 items-center">
            <label className="font-medium">Lọc theo chuyên mục:</label>
            <select
              className="border rounded px-3 py-2"
              value={filterCat}
              onChange={e => setFilterCat(e.target.value ? Number(e.target.value) : '')}
            >
              <option value=''>Tất cả</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.category_name}</option>
              ))}
            </select>
          </div>
          <BlogList
            posts={filteredPosts}
            categories={categories}
            users={mockUsers}
            loading={false}
            error={null}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
            onApprove={handleApprove}
          />
        </>
      )}
      <BlogModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        form={form}
        onFormChange={handleFormChange}
        categories={categories}
        editing={!!editingPost}
      />
    </div>
  );
}
