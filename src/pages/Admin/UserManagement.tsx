import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { useUsers } from '../../hooks/useUsers'
import { User } from '../../api/users.api'
import UserModal from '../../components/admin/user/UserModal'
import UserList from '../../components/admin/user/UserList'
import UserSearchBar from '../../components/admin/user/UserSearchBar'

export default function UserManagement() {
  const {loading, error, users, createUsers, updateUser, deleteUser, searchUsers} = useUsers()


  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredUsers = searchUsers(searchTerm)

  const handleAddUser = () => {
    setSelectedUser(undefined)
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId)
      } catch (err) {
        alert('Failed to delete user')
      }
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-gray-800'>User Management</h1>
        <button
          onClick={handleAddUser}
          className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2'
        >
          <FaPlus />
          Add User
        </button>
      </div>

      {/* Search Bar */}
      <UserSearchBar
        value={searchTerm}
        onChange={setSearchTerm}
      />

      {/* Loading and Error States */}
      {loading && <div className="text-center py-4">Loading...</div>}
      {error && <div className="text-center py-4 text-red-500">Error: {error.message}</div>}

      {/* User List */}
      {!loading && !error && (
      <UserList
        users={filteredUsers}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
      )}
      {/* Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (user) => {
          if (selectedUser) {
            await updateUser(selectedUser.id, user)
          } else {
            await createUsers(user)
          }
          setIsModalOpen(false)
          setSelectedUser(undefined)
        }}
        user={selectedUser} 
      />
    </div>
  )
}
