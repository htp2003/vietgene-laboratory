import React from 'react'
import { FaTimes, FaUser, FaEnvelope, FaUserTag, FaCalendarAlt } from 'react-icons/fa'
import { User } from '../../../services/userService'

interface UserModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (user: Partial<User>) => void // FIXED: Changed to Partial<User>
    user?: User
}

export default function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
    // FIXED: Simplified form data structure
    const [formData, setFormData] = React.useState({
        username: '',
        email: '',
        fullName: '', // Frontend field name
        dob: '',
        role: 'customer' as 'customer' | 'staff' | 'admin'
    })
    
    const [errors, setErrors] = React.useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    React.useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                fullName: user.fullName || user.full_name || '', // Handle both field names
                dob: user.dob || '',
                role: user.role || 'customer'
            })
        } else {
            setFormData({
                username: '',
                email: '',
                fullName: '',
                dob: '',
                role: 'customer'
            })
        }
        setErrors({})
    }, [user, isOpen]) // Added isOpen dependency

    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        
        if (!formData.username.trim()) {
            newErrors.username = 'Tên đăng nhập không được để trống'
        } else if (formData.username.length < 3) {
            newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự'
        } else if (formData.username.length > 16) {
            newErrors.username = 'Tên đăng nhập không được quá 16 ký tự'
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email không được để trống'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ'
        }
        
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Họ tên không được để trống'
        }
        
        if (!formData.dob) {
            newErrors.dob = 'Ngày sinh không được để trống'
        } else {
            // Validate date format and reasonable date
            const dobDate = new Date(formData.dob)
            const now = new Date()
            const minDate = new Date('1900-01-01')
            
            if (dobDate > now) {
                newErrors.dob = 'Ngày sinh không thể trong tương lai'
            } else if (dobDate < minDate) {
                newErrors.dob = 'Ngày sinh không hợp lệ'
            }
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }
        
        setIsSubmitting(true)
        
        try {
            // FIXED: Create proper data structure for API
            const submitData: Partial<User> = {
                username: formData.username.trim(),
                email: formData.email.trim(),
                fullName: formData.fullName.trim(), // This will be mapped to full_name in useUsers
                dob: formData.dob,
                role: formData.role
            }
            
            console.log('🚀 UserModal submitting data:', submitData)
            
            await onSave(submitData)
            
            // Reset form after successful save
            setFormData({
                username: '',
                email: '',
                fullName: '',
                dob: '',
                role: 'customer'
            })
            setErrors({})
            
        } catch (error) {
            console.error('❌ Error saving user in modal:', error)
            // Don't close modal on error, let user try again
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({
                username: '',
                email: '',
                fullName: '',
                dob: '',
                role: 'customer'
            })
            setErrors({})
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg w-full max-w-2xl p-6 m-4 max-h-[90vh] overflow-y-auto'>
                <div className='flex justify-between items-center mb-6'>
                    <h2 className='text-2xl font-semibold text-gray-800 flex items-center gap-2'>
                        <FaUser className="text-blue-500" />
                        {user ? 'Chỉnh sửa thông tin người dùng' : 'Thêm người dùng mới'}
                    </h2>
                    <button 
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isSubmitting}
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='space-y-6'>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Username */}
                        <div>
                            <label className=' text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
                                <FaUser size={14} />
                                Tên đăng nhập <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                value={formData.username} 
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                                    errors.username ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Nhập tên đăng nhập"
                                disabled={isSubmitting}
                                minLength={3}
                                maxLength={16}
                            />
                            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className=' text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
                                <FaEnvelope size={14} />
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="email" 
                                value={formData.email} 
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Nhập email"
                                disabled={isSubmitting}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Họ tên <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            value={formData.fullName} 
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                                errors.fullName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Nhập họ tên"
                            disabled={isSubmitting}
                        />
                        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date of Birth */}
                        <div>
                            <label className=' text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
                                <FaCalendarAlt size={14} />
                                Ngày sinh <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="date" 
                                value={formData.dob} 
                                onChange={(e) => handleInputChange('dob', e.target.value)}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                                    errors.dob ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={isSubmitting}
                                max={new Date().toISOString().split('T')[0]} // Prevent future dates
                                min="1900-01-01"
                            />
                            {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                        </div>

                        {/* Role */}
                        <div>
                            <label className=' text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
                                <FaUserTag size={14} />
                                Vai trò <span className="text-red-500">*</span>
                            </label>
                            <select 
                                value={formData.role} 
                                onChange={(e) => handleInputChange('role', e.target.value)}
                                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors'
                                disabled={isSubmitting}
                            >
                                <option value="customer">Khách hàng</option>
                                <option value="staff">Nhân viên</option>
                                <option value="admin">Quản trị viên</option>
                            </select>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className='flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200'>
                        <button 
                            type='button' 
                            onClick={handleClose} 
                            className='px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium'
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                        <button 
                            type='submit' 
                            className='px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors font-medium flex items-center gap-2'
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                    </svg>
                                    Đang lưu...
                                </>
                            ) : (
                                user ? 'Cập nhật' : 'Thêm người dùng'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}