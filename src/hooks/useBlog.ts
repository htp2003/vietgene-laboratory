import { useState, useEffect, useCallback } from 'react';
import newsService, { NewsArticle } from '../services/newsService';

export interface BlogFormData {
  title: string;
  content: string;
  imageUrl: string;
  imageFile?: File | null;
  status?: 'draft' | 'published'; // ✅ Removed 'pending'
}

export interface BlogStats {
  total: number;
  published: number;
  draft: number;
  pending: number;
  totalViews: number;
}

export const useBlog = () => {
  const [posts, setPosts] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all blog posts
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await newsService.getAllNews();
      
      if (response.success && response.data) {
        setPosts(response.data);
      } else {
        setError(new Error(response.message));
      }
    } catch (err: any) {
      setError(new Error('Có lỗi xảy ra khi tải danh sách bài viết'));
      console.error('Fetch posts error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new blog post
  const createPost = useCallback(async (postData: BlogFormData) => {
    try {
      setError(null);
      
      const response = await newsService.createNews({
        title: postData.title.trim(),
        content: postData.content.trim(),
        imageUrl: postData.imageUrl.trim(),
      });
      
      if (response.success && response.data) {
        // Add the new post to the beginning of the list
        setPosts(prev => [response.data!, ...prev]);
        return { success: true, message: response.message };
      } else {
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi tạo bài viết';
      setError(new Error(errorMessage));
      console.error('Create post error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Update blog post
  const updatePost = useCallback(async (postId: string, postData: Partial<NewsArticle>) => {
    try {
      setError(null);
      
      console.log('🔄 Frontend Update Post Request:', {
        postId,
        postData
      });
      
      const response = await newsService.updateNews(postId, postData);
      
      if (response.success && response.data) {
        // Update the post in the list
        setPosts(prev => 
          prev.map(post => 
            post.id === postId 
              ? { ...response.data! }
              : post
          )
        );
        
        console.log('✅ Post updated successfully in state');
        return { success: true, message: response.message };
      } else {
        console.error('❌ Update failed:', response.message);
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi cập nhật bài viết';
      console.error('💥 Update post error in hook:', err);
      setError(new Error(errorMessage));
      return { success: false, message: errorMessage };
    }
  }, []);

  // Delete blog post
  const deletePost = useCallback(async (postId: string) => {
    try {
      setError(null);
      
      const response = await newsService.deleteNews(postId);
      
      if (response.success) {
        // Remove the post from the list
        setPosts(prev => prev.filter(post => post.id !== postId));
        return { success: true, message: response.message };
      } else {
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi xóa bài viết';
      setError(new Error(errorMessage));
      console.error('Delete post error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Get post by ID
  const getPostById = useCallback(async (postId: string) => {
    try {
      setError(null);
      
      const response = await newsService.getNewsById(postId);
      
      if (response.success && response.data) {
        return { success: true, data: response.data, message: response.message };
      } else {
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi tải bài viết';
      setError(new Error(errorMessage));
      console.error('Get post by ID error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Approve post (change status to published)
  const approvePost = useCallback(async (post: NewsArticle) => {
    try {
      setError(null);
      
      // ✅ Only send the fields API accepts
      const response = await newsService.updateNews(post.id, {
        title: post.title,
        content: post.content,
        imageUrl: post.imageUrl || post.featured_image
      });
      
      if (response.success && response.data) {
        // Update the post status in the list
        setPosts(prev => 
          prev.map(p => 
            p.id === post.id 
              ? { ...response.data!, status: 'published' }
              : p
          )
        );
        return { success: true, message: 'Đã xuất bản bài viết thành công' };
      } else {
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi xuất bản bài viết';
      setError(new Error(errorMessage));
      console.error('Approve post error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Search posts (client-side filtering)
  const searchPosts = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) {
      return posts;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return posts.filter(post => 
      post.title.toLowerCase().includes(lowerSearchTerm) ||
      post.content.toLowerCase().includes(lowerSearchTerm) ||
      (post.author?.full_name || '').toLowerCase().includes(lowerSearchTerm)
    );
  }, [posts]);

  // Filter posts by status
  const filterPostsByStatus = useCallback((status: string) => {
    if (!status) {
      return posts;
    }
    
    return posts.filter(post => post.status === status);
  }, [posts]);

  // Get combined search and filter results
  const getFilteredPosts = useCallback((searchTerm: string, statusFilter: string) => {
    let filtered = posts;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(lowerSearchTerm) ||
        post.content.toLowerCase().includes(lowerSearchTerm) ||
        (post.author?.full_name || '').toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(post => post.status === statusFilter);
    }
    
    return filtered;
  }, [posts]);

  // Get blog statistics
  const getBlogStats = useCallback((): BlogStats => {
    const stats = {
      total: posts.length,
      published: posts.filter(post => post.status === 'published').length,
      draft: posts.filter(post => post.status === 'draft').length,
      pending: 0, // API doesn't support pending status currently
      totalViews: posts.reduce((sum, post) => sum + (post.view_count || 0), 0),
    };
    
    return stats;
  }, [posts]);

  // Get recent posts
  const getRecentPosts = useCallback((limit: number = 5) => {
    return posts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }, [posts]);

  // Get popular posts (by view count)
  const getPopularPosts = useCallback((limit: number = 5) => {
    return posts
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, limit);
  }, [posts]);

  // Get featured posts
  const getFeaturedPosts = useCallback(() => {
    return posts.filter(post => post.is_featured);
  }, [posts]);

  // Load posts on component mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    // State
    posts,
    loading,
    error,
    
    // Actions
    createPost,
    updatePost,
    deletePost,
    getPostById,
    approvePost,
    refetch: fetchPosts,
    
    // Filtering & Search
    searchPosts,
    filterPostsByStatus,
    getFilteredPosts,
    
    // Statistics & Analytics
    getBlogStats,
    getRecentPosts,
    getPopularPosts,
    getFeaturedPosts,
  };
};

export default useBlog;