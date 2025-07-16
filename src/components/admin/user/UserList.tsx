import React from 'react'
import { User } from '../../../services/userService'
import { FaEdit, FaTrash, FaUser, FaUserShield, FaUserTie } from 'react-icons/fa'

interface UserListProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (id: string) => void
}

export default function UserList({ users, onEdit, onDelete }: UserListProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <FaUserShield className="text-red-500" size={16} />;
      case 'staff':
        return <FaUserTie className="text-yellow-500" size={16} />;
      case 'doctor':
        return <FaUserTie className="text-blue-500" size={16} />;
      default:
        return <FaUser className="text-green-500" size={16} />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Quản trị viên</span>;
      case 'staff':
        return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Nhân viên</span>;
      case 'doctor':
        return <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Bác sĩ</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Khách hàng</span>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <FaUser className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Không tìm thấy người dùng</h3>
        <p className="text-gray-500">Không có người dùng nào phù hợp với tiêu chí tìm kiếm.</p>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full bg-white'>
        <thead className="bg-gray-50">
          <tr>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Tên đăng nhập
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Email
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Họ tên
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Ngày sinh
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Vai trò
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200'>
          {users.map(user => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='flex items-center'>
                  {getRoleIcon(user.role || 'customer')}
                  <div className='ml-3'>
                    <div className='text-sm font-medium text-gray-900'>
                      {user.username}
                    </div>
                  </div>
                </div>
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='text-sm text-gray-900'>
                  {user.email}
                </div>
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='text-sm font-medium text-gray-900'>
                  {user.fullName || user.full_name || 'N/A'}
                </div>
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='text-sm text-gray-900'>
                  {formatDate(user.dob)}
                </div>
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                {getRoleBadge(user.role || 'customer')}
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onEdit(user)}
                    className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-full hover:bg-blue-50"
                    title="Chỉnh sửa"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(user.id)}
                    className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-50"
                    title="Xóa"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}