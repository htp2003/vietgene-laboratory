import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

const RegisterForm = ({ onSubmit, isLoading = false }) => {
    const [showPassword, setShowPassword] = useState(false);
    
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm();

    const password = watch('password');

    const handleFormSubmit = (data) => {
        console.log('Register data:', data);
        if (onSubmit) {
            onSubmit(data);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h2>
                    <p className="text-gray-600 mt-2">Tạo tài khoản để sử dụng dịch vụ</p>
                </div>
                
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Họ và tên *
                        </label>
                        <input
                            {...register('fullName', {
                                required: 'Vui lòng nhập họ và tên',
                                minLength: { value: 2, message: 'Họ tên phải có ít nhất 2 ký tự' }
                            })}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nhập họ và tên"
                        />
                        {errors.fullName && (
                            <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên đăng nhập *
                        </label>
                        <input
                            {...register('username', {
                                required: 'Vui lòng nhập tên đăng nhập',
                                minLength: { value: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' },
                                pattern: {
                                    value: /^[a-zA-Z0-9_]+$/,
                                    message: 'Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới'
                                }
                            })}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nhập tên đăng nhập"
                        />
                        {errors.username && (
                            <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <input
                            {...register('email', {
                                required: 'Vui lòng nhập email',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Email không hợp lệ'
                                }
                            })}
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nhập email"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số điện thoại *
                        </label>
                        <input
                            {...register('phone', {
                                required: 'Vui lòng nhập số điện thoại',
                                pattern: {
                                    value: /^[0-9]{10,11}$/,
                                    message: 'Số điện thoại phải có 10-11 chữ số'
                                }
                            })}
                            type="tel"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nhập số điện thoại"
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu *
                        </label>
                        <div className="relative">
                            <input
                                {...register('password', {
                                    required: 'Vui lòng nhập mật khẩu',
                                    minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                                })}
                                type={showPassword ? 'text' : 'password'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập mật khẩu"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Xác nhận mật khẩu *
                        </label>
                        <input
                            {...register('confirmPassword', {
                                required: 'Vui lòng xác nhận mật khẩu',
                                validate: value => value === password || 'Mật khẩu xác nhận không khớp'
                            })}
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nhập lại mật khẩu"
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <div className="flex items-start space-x-2">
                        <input
                            {...register('agreeTerms', {
                                required: 'Vui lòng đồng ý với điều khoản'
                            })}
                            type="checkbox"
                            className="mt-1"
                        />
                        <label className="text-sm text-gray-600">
                            Tôi đồng ý với{' '}
                            <Link to="/terms" className="text-blue-600 hover:underline">
                                Điều khoản sử dụng
                            </Link>
                            {' '}và{' '}
                            <Link to="/privacy" className="text-blue-600 hover:underline">
                                Chính sách bảo mật
                            </Link>
                        </label>
                    </div>
                    {errors.agreeTerms && (
                        <p className="text-red-500 text-sm">{errors.agreeTerms.message}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
                    >
                        {isSubmitting || isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
                    </button>

                    <div className="text-center text-sm text-gray-600">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Đăng nhập ngay
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;
