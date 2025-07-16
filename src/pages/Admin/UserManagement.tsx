import React, { useState, useEffect } from 'react'
import { FaPlus, FaUserMd, FaUsers, FaUserShield, FaUserTie } from 'react-icons/fa'
import { useUsers } from '../../hooks/useUsers'
import { User } from '../../services/userService'
import UserModal from '../../components/admin/user/UserModal'
import UserList from '../../components/admin/user/UserList'
import UserSearchBar from '../../components/admin/user/UserSearchBar'

export default function UserManagement() {
  const { loading, error, users, updateUser, deleteUser, searchUsers, getUserStats } = useUsers()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [roleFilter, setRoleFilter] = useState<string>('')

  // 🔍 Debug authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('🔍 UserManagement Debug Info:', {
      hasToken: !!token,
      hasUser: !!user,
      tokenPreview: token ? token.substring(0, 20) + '...' : null,
      userData: user ? JSON.parse(user) : null,
      timestamp: new Date().toISOString()
    });
    
    if (!token || !user) {
      console.error('❌ Missing authentication data in UserManagement');
    } else {
      console.log('✅ Authentication data found in UserManagement');
    }
  }, []);

  const filteredUsers = searchUsers(searchTerm).filter(user => 
    !roleFilter || user.role === roleFilter
  )

  const stats = getUserStats()

  const handleAddUser = () => {
    setSelectedUser(undefined)
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        const result = await deleteUser(userId)
        if (result.success) {
          alert(result.message)
        } else {
          alert(result.message)
        }
      } catch (err) {
        alert('Không thể xóa người dùng')
      }
    }
  }

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      // Only allow updating existing users, not creating new ones
      if (!selectedUser) {
        alert('Lỗi: Không thể tạo người dùng mới từ trang quản lý này');
        return;
      }
      
      console.log('🔄 Attempting to update user:', {
        userId: selectedUser.id,
        originalData: selectedUser,
        newData: userData,
        hasToken: !!localStorage.getItem('token')
      });
      
      const result = await updateUser(selectedUser.id, userData);
      
      console.log('📥 Update result:', result);
      
      if (result.success) {
        setIsModalOpen(false);
        setSelectedUser(undefined);
        alert(result.message);
      } else {
        alert(`Lỗi cập nhật: ${result.message}`);
      }
    } catch (err) {
      console.error('💥 Update error in handleSaveUser:', err);
      alert('Có lỗi xảy ra khi lưu thông tin người dùng');
    }
  }

  return (
    <div className='space-y-6 p-6 min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>Quản lý người dùng</h1>
          <p className='text-gray-600 mt-1'>Quản lý và chỉnh sửa thông tin người dùng hệ thống</p>
        </div>
        {/* Remove Add User button since admin shouldn't create users directly */}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaUsers size={24} />
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
              <FaUsers size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Khách hàng</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.customers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FaUserTie size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nhân viên</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.staff}</p>
            </div>
          </div>
        </div>

           <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaUserMd  size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bác sĩ</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.staff}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <FaUserShield size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Quản trị viên</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.admins}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <UserSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="lg:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả vai trò</option>
              <option value="customer">Khách hàng</option>
              <option value="staff">Nhân viên</option>
               <option value="doctor">Bác sĩ</option>
              <option value="admin">Quản trị viên</option>
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
            <p className="text-gray-600">Đang tải danh sách người dùng...</p>
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
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-red-600 underline">Chi tiết lỗi</summary>
                <div className="mt-2 text-xs bg-red-50 p-2 rounded">
                  <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Có' : 'Không có'}</p>
                  <p><strong>User data:</strong> {localStorage.getItem('user') ? 'Có' : 'Không có'}</p>
                  <p><strong>Error:</strong> {error.message}</p>
                </div>
              </details>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mr-2"
              >
                Thử lại
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }} 
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Đăng nhập lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User List */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Danh sách người dùng ({filteredUsers.length})
            </h2>
          </div>
          
          <UserList
            users={filteredUsers}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
          
          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FaUsers size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {roleFilter || searchTerm ? 'Không có người dùng phù hợp' : 'Danh sách trống'}
              </h3>
              <p className="text-gray-500 mb-4">
                {roleFilter || searchTerm ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.' : 'Người dùng sẽ tự đăng ký qua trang đăng ký.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser} 
      />
    </div>
  )
}