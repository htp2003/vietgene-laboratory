import { apiClient } from '../../config/api';
import { ApiResponse, ApiUser, UserUpdateRequest } from '../../types/appointment';

export class UserService {
  // ✅ In-memory cache to avoid duplicate API calls
  private static userCache = new Map<string, ApiUser>();
  private static cacheExpiry = new Map<string, number>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static readonly FALLBACK_CACHE_DURATION = 30 * 1000; // 30 seconds for failed requests

  // ✅ Get all users with caching
  static async getAllUsers(): Promise<ApiUser[]> {
    try {
      console.log("👥 Fetching all users...");
      
      const response = await Promise.race([
        apiClient.get<ApiResponse<ApiUser[]>>("/user"),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Get all users timeout')), 15000)
        )
      ]) as any;
      
      if (response.data.code === 200) {
        const users = response.data.result;
        
        // ✅ Cache all users for future individual lookups
        users.forEach((user: ApiUser) => {
          this.cacheUser(user.id, user);
        });
        
        console.log("✅ Fetched and cached users:", users.length);
        return users;
      } else {
        console.warn("⚠️ Failed to fetch users:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      return [];
    }
  }

  // ✅ Optimized getUserById with caching, retry logic, and timeout
  static async getUserById(id: string, retries = 2): Promise<ApiUser | null> {
    // ✅ Check cache first
    if (this.isUserCached(id)) {
      console.log(`📦 Cache hit for user ${id}`);
      return this.userCache.get(id)!;
    }

    let lastError: any;
    
    // ✅ Retry loop with exponential backoff
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🔍 Fetching user ${id} (attempt ${attempt + 1}/${retries + 1})`);
        
        // ✅ Create timeout promise
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`User fetch timeout for ${id}`)), 6000)
        );

        // ✅ Race between API call and timeout
        const apiPromise = apiClient.get<ApiResponse<ApiUser>>(`/user/${id}`);
        
        const response = await Promise.race([apiPromise, timeoutPromise]) as any;

        if (response.data.code === 200) {
          const user = response.data.result;
          
          // ✅ Cache successful result
          this.cacheUser(id, user);
          
          console.log(`✅ Successfully fetched user ${id}`);
          return user;
        } else {
          throw new Error(`API returned code ${response.data.code}: ${response.data.message}`);
        }

      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ Attempt ${attempt + 1} failed for user ${id}:`, error.message);
        
        // ✅ Exponential backoff: 300ms, 600ms, 1200ms
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 300;
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // ✅ All attempts failed - create and cache fallback user
    console.error(`❌ All attempts failed for user ${id}:`, lastError?.message || 'Unknown error');
    
    const fallbackUser: ApiUser = {
      id: id,
      username: 'unknown',
      full_name: 'Unknown User',
      email: '',
      dob: new Date().toISOString(),
      roles: []
    };
    
    // ✅ Cache fallback with shorter duration
    this.cacheUser(id, fallbackUser, this.FALLBACK_CACHE_DURATION);

    return fallbackUser;
  }

  // ✅ Batch fetch multiple users (if API supports it, otherwise parallel individual calls)
  static async getUsersByIds(userIds: string[]): Promise<Map<string, ApiUser | null>> {
    const results = new Map<string, ApiUser | null>();
    const uncachedIds: string[] = [];

    // ✅ Check cache first
    for (const userId of userIds) {
      if (this.isUserCached(userId)) {
        results.set(userId, this.userCache.get(userId)!);
      } else {
        uncachedIds.push(userId);
      }
    }

    if (uncachedIds.length === 0) {
      console.log(`📦 All ${userIds.length} users found in cache`);
      return results;
    }

    console.log(`🔄 Need to fetch ${uncachedIds.length} uncached users out of ${userIds.length} total`);

    // ✅ Try batch API first (if your API supports it)
    try {
      const batchResponse = await Promise.race([
        this.tryBatchFetch(uncachedIds),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Batch fetch timeout')), 8000)
        )
      ]) as Map<string, ApiUser | null>;

      if (batchResponse) {
        // ✅ Merge batch results
        batchResponse.forEach((user, userId) => {
          if (user) {
            this.cacheUser(userId, user);
          }
          results.set(userId, user);
        });
        
        console.log(`✅ Batch fetched ${batchResponse.size} users`);
        return results;
      }
    } catch (error) {
      console.warn('⚠️ Batch fetch failed, falling back to individual requests:', error);
    }

    // ✅ Fallback: Parallel individual requests with concurrency limit
    const CONCURRENT_LIMIT = 3; // Limit concurrent requests to avoid overwhelming API
    
    for (let i = 0; i < uncachedIds.length; i += CONCURRENT_LIMIT) {
      const batch = uncachedIds.slice(i, i + CONCURRENT_LIMIT);
      
      console.log(`📦 Fetching batch ${Math.floor(i/CONCURRENT_LIMIT) + 1}/${Math.ceil(uncachedIds.length/CONCURRENT_LIMIT)} (${batch.length} users)`);
      
      const promises = batch.map(async (userId) => {
        try {
          const user = await this.getUserById(userId, 1); // Reduced retries for batch operations
          results.set(userId, user);
        } catch (error) {
          console.error(`❌ Failed to fetch user ${userId} in batch:`, error);
          results.set(userId, null);
        }
      });

      await Promise.allSettled(promises);
      
      // ✅ Brief delay between batches to avoid API overload
      if (i + CONCURRENT_LIMIT < uncachedIds.length) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }

    console.log(`✅ Completed fetching ${uncachedIds.length} users individually`);
    return results;
  }

  // ✅ Try batch fetch (implement if your API supports it)
  private static async tryBatchFetch(userIds: string[]): Promise<Map<string, ApiUser | null> | null> {
    try {
      // ✅ This would be ideal if your API supports batch user fetch
      // For now, return null to indicate batch fetch is not available
      console.log(`🔄 Batch fetch not implemented for ${userIds.length} users`);
      return null;
      
      // ✅ Uncomment and modify if you have a batch endpoint:
      /*
      const response = await apiClient.post<ApiResponse<ApiUser[]>>('/users/batch', {
        userIds: userIds
      });
      
      if (response.data.code === 200) {
        const users = response.data.result;
        const userMap = new Map<string, ApiUser | null>();
        
        // Map all requested IDs
        userIds.forEach(id => {
          const user = users.find(u => u.id === id);
          userMap.set(id, user || null);
        });
        
        return userMap;
      }
      
      return null;
      */
    } catch (error) {
      console.warn('Batch fetch error:', error);
      return null;
    }
  }

  // ✅ Get current user profile with caching
  static async getCurrentUserProfile(): Promise<ApiUser | null> {
    try {
      console.log("👤 Fetching current user profile...");
      
      const response = await Promise.race([
        apiClient.get<ApiResponse<ApiUser>>("/user/profile"),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
        )
      ]) as any;
      
      if (response.data.code === 200) {
        const user = response.data.result;
        
        // ✅ Cache current user profile
        this.cacheUser(user.id, user);
        
        console.log("✅ Fetched user profile");
        return user;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error fetching user profile:", error);
      return null;
    }
  }

  // ✅ Update user with cache invalidation
  static async updateUser(userId: string, userData: UserUpdateRequest): Promise<ApiUser | null> {
    try {
      console.log(`👤 Updating user ${userId}...`);
      
      const response = await apiClient.put<ApiResponse<ApiUser>>(`/user/${userId}`, userData);
      
      if (response.data.code === 200) {
        const updatedUser = response.data.result;
        
        // ✅ Update cache with new data
        this.cacheUser(userId, updatedUser);
        
        console.log("✅ User updated successfully");
        return updatedUser;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error updating user:", error);
      return null;
    }
  }

  // ✅ Cache management methods
  private static isUserCached(userId: string): boolean {
    if (!this.userCache.has(userId)) {
      return false;
    }
    
    const expiry = this.cacheExpiry.get(userId) || 0;
    if (Date.now() > expiry) {
      // ✅ Cache expired - remove it
      this.userCache.delete(userId);
      this.cacheExpiry.delete(userId);
      return false;
    }
    
    return true;
  }

  private static cacheUser(userId: string, userData: ApiUser, duration = this.CACHE_DURATION): void {
    this.userCache.set(userId, userData);
    this.cacheExpiry.set(userId, Date.now() + duration);
  }

  // ✅ Cache utility methods
  static clearUserCache(): void {
    this.userCache.clear();
    this.cacheExpiry.clear();
    console.log('🗑️ User cache cleared');
  }

  static getCacheStats(): { size: number, entries: Array<{id: string, expiresIn: number}> } {
    const now = Date.now();
    const entries = Array.from(this.userCache.keys()).map(id => ({
      id,
      expiresIn: Math.max(0, (this.cacheExpiry.get(id) || 0) - now)
    }));
    
    return {
      size: this.userCache.size,
      entries
    };
  }

  // ✅ Cache prewarming (useful for loading common users)
  static async prewarmCache(userIds: string[]): Promise<void> {
    console.log(`🔥 Prewarming cache for ${userIds.length} users...`);
    await this.getUsersByIds(userIds);
    console.log('✅ Cache prewarming completed');
  }
}