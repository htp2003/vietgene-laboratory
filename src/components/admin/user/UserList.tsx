import React from 'react'
import { User } from '../../../api/users.api'
import { FaEdit, FaTrash } from 'react-icons/fa'

interface UserListProps {
    users: User[]
    onEdit: (user: User) => void
    onDelete: (id: string) => void
}

export default function UserList({ users, onEdit, onDelete }: UserListProps) {
  return (
    <div className='overflow-x-auto'>
        <table className='min-w-full bg-white'>
            <thead>
                <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Username
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Email
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Full Name
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Phone
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Address
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Role
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
                {users.map(user => (
                    <tr key={user.id}>
                        <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm font-medium text-gray-900'>
                                {user.username}
                            </div>
                        </td>    
                        <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm font-medium text-gray-900'>
                                {user.email}
                            </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm font-medium text-gray-900'>
                                {user.fullName}
                            </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm font-medium text-gray-900'>
                                {user.phone}
                            </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm font-medium text-gray-900'>
                                {user.address}
                            </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm font-medium text-gray-900'>
                                {user.role}
                            </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onEdit(user)}
                                    className="text-blue-600 hover:text-blue-900"
                                >
                                    <FaEdit size={18} />
                                </button>
                                <button
                                    onClick={() => onDelete(user.id)}
                                    className="text-red-600 hover:text-red-900"
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
