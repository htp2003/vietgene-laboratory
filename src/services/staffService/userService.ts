import { apiClient } from '../../config/api';
import { ApiResponse, ApiUser, UserUpdateRequest } from '../../types/appointment';

export class UserService {
  
  // ✅ Get all users
  static async getAllUsers(): Promise<ApiUser[]> {
    try {
      console.log("👥 Fetching all users...");
      
      const response = await apiClient.get<ApiResponse<ApiUser[]>>("/user");
      
      if (response.data.code === 200) {
        console.log("✅ Fetched users:", response.data.result.length);
        return response.data.result;
      } else {
        console.warn("⚠️ Failed to fetch users:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      return [];
    }
  }

  // ✅ Get user by ID
  static async getUserById(userId: string): Promise<ApiUser | null> {
    try {
      const response = await apiClient.get<ApiResponse<ApiUser>>(`/user/${userId}`);
      return response.data.code === 200 ? response.data.result : null;
    } catch (error) {
      console.warn(`Failed to fetch user ${userId}:`, error);
      return null;
    }
  }

  // ✅ Get current user profile
  static async getCurrentUserProfile(): Promise<ApiUser | null> {
    try {
      console.log("👤 Fetching current user profile...");
      
      const response = await apiClient.get<ApiResponse<ApiUser>>("/user/profile");
      
      if (response.data.code === 200) {
        console.log("✅ Fetched user profile");
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error fetching user profile:", error);
      return null;
    }
  }

    static async updateUser(userId: string, userData: UserUpdateRequest): Promise<ApiUser | null> {
    try {
      console.log(`👤 Updating user ${userId}...`);
      
      const response = await apiClient.put<ApiResponse<ApiUser>>(`/user/${userId}`, userData);
      
      if (response.data.code === 200) {
        console.log("✅ User updated successfully");
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error updating user:", error);
      return null;
    }
  }
}