import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

const LoginForm = ({ onSubmit, isLoading = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const handleFormSubmit = (data) => {
    console.log('Login data:', data);
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>
          <p className="text-gray-600 mt-2">Truy cập hệ thống xét nghiệm DNA</p>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email hoặc Tên đăng nhập
            </label>
            <input
              {...register('email', {
                required: 'Vui lòng nhập email hoặc tên đăng nhập',
              })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Nhập email hoặc username"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                {...register('password', {
                  required: 'Vui lòng nhập mật khẩu',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự'
                  }
                })}
                type={showPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-500"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                {...register('remember')}
                type="checkbox"
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting || isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <div className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;