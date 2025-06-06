import React from 'react'
import { FaTimes } from 'react-icons/fa'

interface User {
    id: string
    username: string
    email: string
    fullName: string
    phone?: string
    address?: string
    role: 'customer' | 'staff' | 'admin'
    createdAt: Date
    doctor_id: number | null
}

interface UserModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (user: Omit<User, 'id'>) => void
    user?: User
}

export default function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
    const [formData, setFormData] = React.useState<Omit<User, 'id'>>({
        username: user?.username || '',
        email: user?.email || '',
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        address: user?.address || '',
        role: user?.role || 'customer',
        createdAt: user?.createdAt || new Date(),
        doctor_id: user?.doctor_id || null
    })

    React.useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                address: user.address,
                role: user.role,
                createdAt: user.createdAt,
                doctor_id: user.doctor_id
            })
        } else {
            setFormData({
                username: '',
                email: '',
                fullName: '',
                phone: '',
                address: '',
                role: 'customer',
                createdAt: new Date(),
                doctor_id: null
            })
        }
    }, [user])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg w-full max-w-md p-6'>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-semibold text-gray-800'>{user ? 'Edit User' : 'Add New User'}</h2>
                    <button onClick={onClose}>
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Username</label>
                        <input type="text" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none' />
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
                        <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none' />
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Full Name</label>
                        <input type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none' />
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Phone</label>
                        <input type="text" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none' />
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Address</label>
                        <input type="text" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none' />
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Role</label>
                        <select required value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as 'customer' | 'staff' | 'admin' })} className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none'>
                            <option value="customer">Customer</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Doctor ID</label>
                        <input type="number" required value={formData.doctor_id || ''} onChange={(e) => setFormData({ ...formData, doctor_id: Number(e.target.value) })} className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none' />
                    </div>

                    <div className='flex justify-end gap-3 mt-6'>
                        <button type='button' onClick={onClose} className='px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200'>Cancel</button>
                        <button type='submit' className='px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600'>{user ? 'Save Changes' : 'Add User'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
