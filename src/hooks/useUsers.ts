// useUsers.ts - Fixed version
import { useState, useEffect, useCallback } from 'react';
import userService, { User, UserCreationRequest, UserUpdateRequest } from '../services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getAllUsers();
      
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(new Error(response.message));
      }
    } catch (err: any) {
      setError(new Error('Có lỗi xảy ra khi tải danh sách người dùng'));
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new user
  const createUsers = useCallback(async (userData: Omit<User, 'id'>) => {
    try {
      setError(null);
      
      // Transform frontend data to API format
      const apiData: UserCreationRequest = {
        username: userData.username,
        password: '123456', // Default password - you might want to make this configurable
        email: userData.email,
        full_name: userData.fullName || userData.full_name || '',
        dob: userData.dob || new Date().toISOString().split('T')[0], // Default to today if not provided
      };
      
      let response;
      if (userData.role === 'staff' || userData.role === 'admin') {
        response = await userService.createStaffUser(apiData);
      } else {
        response = await userService.createUser(apiData);
      }
      
      if (response.success && response.data) {
        // Add the new user to the beginning of the list
        setUsers(prev => [response.data!, ...prev]);
        return { success: true, message: response.message };
      } else {
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi tạo người dùng';
      setError(new Error(errorMessage));
      console.error('Create user error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Update user - FIXED VERSION
  const updateUser = useCallback(async (userId: string, userData: Partial<User>) => {
    try {
      setError(null);
      
      console.log('🔄 Frontend Update Request:', {
        userId,
        userData,
        token: localStorage.getItem('token') ? 'EXISTS' : 'MISSING'
      });

      // Validate inputs
      if (!userId || userId.trim() === '') {
        const errorMessage = 'ID người dùng không hợp lệ';
        setError(new Error(errorMessage));
        return { success: false, message: errorMessage };
      }

      if (!userData || Object.keys(userData).length === 0) {
        const errorMessage = 'Không có dữ liệu để cập nhật';
        setError(new Error(errorMessage));
        return { success: false, message: errorMessage };
      }
      
      // Prepare API data - FIXED mapping
      const apiData: UserUpdateRequest = {};
      
      // Only include fields that have actual values
      if (userData.username?.trim()) {
        apiData.username = userData.username.trim();
      }
      
      if (userData.email?.trim()) {
        apiData.email = userData.email.trim();
      }
      
      // Handle full_name - API always expects full_name
      if (userData.fullName?.trim()) {
        apiData.full_name = userData.fullName.trim();
      } else if (userData.full_name?.trim()) {
        apiData.full_name = userData.full_name.trim();
      }
      
      if (userData.dob?.trim()) {
        // Ensure proper date format
        let dateValue = userData.dob.trim();
        // If it's a full datetime, extract just the date part
        if (dateValue.includes('T')) {
          dateValue = dateValue.split('T')[0];
        }
        // Validate YYYY-MM-DD format
        if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
          apiData.dob = dateValue;
        } else {
          console.warn('⚠️ Invalid date format:', dateValue);
        }
      }
      
      // Handle roles - convert frontend role to API role format
      if (userData.role) {
        const roleMapping: { [key: string]: string } = {
          'admin': 'ROLE_ADMIN',
          'staff': 'ROLE_STAFF', 
          'customer': 'ROLE_USER'
        };
        const apiRole = roleMapping[userData.role];
        if (apiRole) {
          apiData.roles = [apiRole];
        }
      }
      
      console.log('📤 Sending API data:', JSON.stringify(apiData, null, 2));
      
      // Call the API
      const response = await userService.updateUser(userId, apiData);
      
      if (response.success && response.data) {
        // Update the user in the local state
        setUsers(prev => 
          prev.map(user => 
            user.id === userId 
              ? { ...response.data! }
              : user
          )
        );
        
        console.log('✅ User updated successfully in state');
        return { success: true, message: response.message };
      } else {
        console.error('❌ Update failed:', response.message);
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi cập nhật người dùng';
      console.error('💥 Update user error in hook:', err);
      setError(new Error(errorMessage));
      return { success: false, message: errorMessage };
    }
  }, []);

  // Delete user
  const deleteUser = useCallback(async (userId: string) => {
    try {
      setError(null);
      
      const response = await userService.deleteUser(userId);
      
      if (response.success) {
        // Remove the user from the list
        setUsers(prev => prev.filter(user => user.id !== userId));
        return { success: true, message: response.message };
      } else {
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi xóa người dùng';
      setError(new Error(errorMessage));
      console.error('Delete user error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Get user by ID
  const getUserById = useCallback(async (userId: string) => {
    try {
      setError(null);
      
      const response = await userService.getUserById(userId);
      
      if (response.success && response.data) {
        return { success: true, data: response.data, message: response.message };
      } else {
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi tải thông tin người dùng';
      setError(new Error(errorMessage));
      console.error('Get user by ID error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Get current user profile
  const getUserProfile = useCallback(async () => {
    try {
      setError(null);
      
      const response = await userService.getUserProfile();
      
      if (response.success && response.data) {
        return { success: true, data: response.data, message: response.message };
      } else {
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi tải thông tin profile';
      setError(new Error(errorMessage));
      console.error('Get user profile error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Search users (client-side filtering)
  const searchUsers = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) {
      return users;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return users.filter(user => 
      user.username.toLowerCase().includes(lowerSearchTerm) ||
      user.email.toLowerCase().includes(lowerSearchTerm) ||
      (user.fullName || user.full_name || '').toLowerCase().includes(lowerSearchTerm) ||
      (user.phone || '').toLowerCase().includes(lowerSearchTerm) ||
      (user.role || '').toLowerCase().includes(lowerSearchTerm)
    );
  }, [users]);

  // Filter users by role
  const filterUsersByRole = useCallback((role: string) => {
    if (!role) {
      return users;
    }
    
    return users.filter(user => user.role === role);
  }, [users]);

  // Get user statistics
  const getUserStats = useCallback(() => {
    const stats = {
      total: users.length,
      customers: users.filter(user => user.role === 'customer').length,
      staff: users.filter(user => user.role === 'staff').length,
      admins: users.filter(user => user.role === 'admin').length,
    };
    
    return stats;
  }, [users]);

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    createUsers,
    updateUser,
    deleteUser,
    getUserById,
    getUserProfile,
    searchUsers,
    filterUsersByRole,
    getUserStats,
    refetch: fetchUsers,
  };
};

export default useUsers;