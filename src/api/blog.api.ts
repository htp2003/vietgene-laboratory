// src/api/blog.api.ts

// --- Type Definitions ---
export interface Category {
  id: number;
  category_name: string;
  is_active: boolean;
  created_at: Date;
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  author_id: string; // user id (string)
  category_id: number;
  status: 'draft' | 'published' | 'pending';
  view_count: number;
  featured_image?: string;
  created_at: Date;
}

// --- Mock Data ---
let mockCategories: Category[] = [
  { id: 1, category_name: 'Khoa học', is_active: true, created_at: new Date() },
  { id: 2, category_name: 'Công nghệ', is_active: true, created_at: new Date() },
];

let mockBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Giới thiệu DNA Testing',
    content: 'Nội dung bài viết về DNA testing...',
    author_id: '1',
    category_id: 1,
    status: 'published',
    view_count: 100,
    featured_image: '',
    created_at: new Date(),
  },
  {
    id: 2,
    title: 'Ứng dụng Công nghệ Sinh học',
    content: 'Nội dung ứng dụng công nghệ sinh học...',
    author_id: '2',
    category_id: 2,
    status: 'pending',
    view_count: 20,
    featured_image: '',
    created_at: new Date(),
  }
];

// --- API ---
export const blogApi = {
  // Category CRUD
  getCategories: async (): Promise<Category[]> => {
    await new Promise(r => setTimeout(r, 300));
    return [...mockCategories];
  },
  addCategory: async (category: Omit<Category, 'id' | 'created_at'>): Promise<Category> => {
    const newCategory: Category = {
      ...category,
      id: Math.max(0, ...mockCategories.map(c => c.id)) + 1,
      created_at: new Date(),
    };
    mockCategories.push(newCategory);
    return newCategory;
  },
  updateCategory: async (category: Category): Promise<Category | undefined> => {
    const idx = mockCategories.findIndex(c => c.id === category.id);
    if (idx !== -1) {
      mockCategories[idx] = { ...mockCategories[idx], ...category };
      return mockCategories[idx];
    }
    return undefined;
  },
  deleteCategory: async (categoryId: number): Promise<void> => {
    mockCategories = mockCategories.filter(c => c.id !== categoryId);
  },

  // BlogPost CRUD
  getAll: async (): Promise<BlogPost[]> => {
    await new Promise(r => setTimeout(r, 300));
    return [...mockBlogPosts];
  },
  getById: async (id: number): Promise<BlogPost | undefined> => {
    await new Promise(r => setTimeout(r, 200));
    return mockBlogPosts.find(post => post.id === id);
  },
  add: async (post: Omit<BlogPost, 'id' | 'created_at' | 'view_count'>): Promise<BlogPost> => {
    const newPost: BlogPost = {
      ...post,
      id: Math.max(0, ...mockBlogPosts.map(p => p.id)) + 1,
      created_at: new Date(),
      view_count: 0,
    };
    mockBlogPosts.push(newPost);
    return newPost;
  },
  update: async (post: BlogPost): Promise<BlogPost | undefined> => {
    const idx = mockBlogPosts.findIndex(p => p.id === post.id);
    if (idx !== -1) {
      mockBlogPosts[idx] = { ...mockBlogPosts[idx], ...post };
      return mockBlogPosts[idx];
    }
    return undefined;
  },
  delete: async (id: number): Promise<void> => {
    mockBlogPosts = mockBlogPosts.filter(p => p.id !== id);
  },
};
