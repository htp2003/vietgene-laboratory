// src/hooks/useBlogPosts.ts
import { useEffect, useState } from 'react';
import { blogApi, BlogPost, Category } from '../api/blog.api';

export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await blogApi.getAll();
      setPosts(data);
    } catch (e: any) {
      setError(e.message || 'Lỗi khi tải blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const addPost = async (post: Omit<BlogPost, 'id' | 'created_at' | 'view_count'>) => {
    setLoading(true);
    try {
      const newPost = await blogApi.add(post);
      setPosts(prev => [...prev, newPost]);
    } catch (e: any) {
      setError(e.message || 'Lỗi khi thêm bài viết');
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (post: BlogPost) => {
    setLoading(true);
    try {
      const updated = await blogApi.update(post);
      if (updated) {
        setPosts(prev => prev.map(p => p.id === post.id ? updated : p));
      }
    } catch (e: any) {
      setError(e.message || 'Lỗi khi cập nhật bài viết');
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: number) => {
    setLoading(true);
    try {
      await blogApi.delete(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (e: any) {
      setError(e.message || 'Lỗi khi xóa bài viết');
    } finally {
      setLoading(false);
    }
  };

  return { posts, loading, error, fetchPosts, addPost, updatePost, deletePost };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await blogApi.getCategories();
      setCategories(data);
    } catch (e: any) {
      setError(e.message || 'Lỗi khi tải category');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const addCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
    setLoading(true);
    try {
      const newCat = await blogApi.addCategory(category);
      setCategories(prev => [...prev, newCat]);
    } catch (e: any) {
      setError(e.message || 'Lỗi khi thêm category');
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (category: Category) => {
    setLoading(true);
    try {
      const updated = await blogApi.updateCategory(category);
      if (updated) {
        setCategories(prev => prev.map(c => c.id === category.id ? updated : c));
      }
    } catch (e: any) {
      setError(e.message || 'Lỗi khi cập nhật category');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    setLoading(true);
    try {
      await blogApi.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (e: any) {
      setError(e.message || 'Lỗi khi xóa category');
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, error, fetchCategories, addCategory, updateCategory, deleteCategory };
}
