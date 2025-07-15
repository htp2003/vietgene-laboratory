import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import userService, { UserCreationRequest } from "../../services/userService";

interface RegisterFormData {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  dob: string;
}

interface RegisterFormProps {
  onSubmit: (registerData: RegisterFormData) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  const password = watch("password");

  const handleFormSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    // Show loading toast
    const loadingToast = toast.loading("Đang tạo tài khoản...");

    try {
      const apiData: UserCreationRequest = {
        username: data.username.trim(),
        password: data.password.trim(),
        email: data.email.trim(),
        full_name: data.fullName.trim(),
        dob: data.dob || new Date().toISOString().split('T')[0],
      }
      
      const result = await userService.createUser(apiData);
      if (result.success && result.data) {
        localStorage.setItem("user", JSON.stringify(result.data));

        if (onSubmit) {
          onSubmit(data);
        }
      }
      toast.success(
        "Tạo tài khoản thành công! Chào mừng bạn đến với VietGene Lab!",
        {
          id: loadingToast,
          duration: 3000,
        }
      );

      setTimeout(() => navigate("/login"), 1500);
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      
      let errorMessage = "Có lỗi xảy ra, vui lòng thử lại!";
      
      if (error.response) {
        // Handle specific API errors
        switch (error.response.status) {
          case 409:
            errorMessage = "Email hoặc tên đăng nhập đã tồn tại!";
            break;
          case 400:
            errorMessage = "Thông tin đăng ký không hợp lệ!";
            break;
          case 500:
            errorMessage = "Lỗi server, vui lòng thử lại sau!";
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến server, vui lòng kiểm tra kết nối mạng!";
      }

      toast.error(errorMessage, {
        id: loadingToast,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };
      

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">VG</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              VietGene Lab
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đăng ký tài khoản
          </h1>
          <p className="text-gray-600">
            Tạo tài khoản để sử dụng dịch vụ xét nghiệm DNA
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("fullName", {
                    required: "Vui lòng nhập họ và tên",
                    minLength: {
                      value: 2,
                      message: "Họ tên phải có ít nhất 2 ký tự",
                    },
                    pattern: {
                      value: /^[a-zA-ZÀ-ỹ\s]+$/,
                      message: "Họ tên chỉ chứa chữ cái và khoảng trắng",
                    },
                  })}
                  type="text"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    errors.fullName ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Nhập họ và tên đầy đủ"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("username", {
                    required: "Vui lòng nhập tên đăng nhập",
                    minLength: {
                      value: 3,
                      message: "Tên đăng nhập phải có ít nhất 3 ký tự",
                    },
                    maxLength: {
                      value: 20,
                      message: "Tên đăng nhập không được quá 20 ký tự",
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message:
                        "Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới",
                    },
                  })}
                  type="text"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    errors.username ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("email", {
                    required: "Vui lòng nhập email",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Email không hợp lệ",
                    },
                  })}
                  type="email"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Nhập địa chỉ email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

                        {/* Date of Birth */}
                        <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày sinh
              </label>
              <div className="relative">
                <input
                  {...register("dob", {
                    validate: (value) => {
                      if (!value) return true; // Optional field
                      
                      const date = new Date(value);
                      const today = new Date();
                      const minDate = new Date();
                      minDate.setFullYear(today.getFullYear() - 100);
                      
                      if (date > today) {
                        return "Ngày sinh không thể trong tương lai";
                      }
                      
                      if (date < minDate) {
                        return "Ngày sinh không hợp lệ";
                      }
                      
                      return true;
                    },
                  })}
                  type="date"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    errors.dob ? "border-red-300" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.dob && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.dob.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("phone", {
                    required: "Vui lòng nhập số điện thoại",
                    pattern: {
                      value: /^(0[3|5|7|8|9])+([0-9]{8})$/,
                      message: "Số điện thoại không hợp lệ (VD: 0987654321)",
                    },
                  })}
                  type="tel"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    errors.phone ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("password", {
                    required: "Vui lòng nhập mật khẩu",
                    minLength: {
                      value: 8,
                      message: "Mật khẩu phải có ít nhất 8 ký tự",
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message:
                        "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("confirmPassword", {
                    required: "Vui lòng xác nhận mật khẩu",
                    validate: (value) =>
                      value === password || "Mật khẩu xác nhận không khớp",
                  })}
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    errors.confirmPassword
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms Agreement */}
            <div>
              <label className="flex items-start space-x-3">
                <input
                  {...register("agreeTerms", {
                    required: "Vui lòng đồng ý với điều khoản sử dụng",
                  })}
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
                />
                <span className="text-sm text-gray-600 leading-5">
                  Tôi đồng ý với{" "}
                  <Link
                    to="/terms"
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Điều khoản sử dụng
                  </Link>{" "}
                  và{" "}
                  <Link
                    to="/privacy"
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Chính sách bảo mật
                  </Link>{" "}
                  của VietGene Lab
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.agreeTerms.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting || isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Đang tạo tài khoản...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Tạo tài khoản</span>
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <span className="text-gray-600">Đã có tài khoản? </span>
              <Link
                to="/login"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </form>
        </div>

        {/* Additional Links */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            ← Quay về trang chủ
          </Link>
        </div>

        {/* Demo Info */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 text-center">
            <strong>Lưu ý:</strong> Email/username: admin@vietgene.vn, admin,
            test@gmail.com, testuser đã tồn tại
          </p>
        </div>
      </div>

      {/* Toast Container */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
            padding: "16px",
            borderRadius: "8px",
            fontSize: "14px",
          },
          success: {
            style: {
              background: "#10b981",
            },
          },
          error: {
            style: {
              background: "#ef4444",
            },
          },
          loading: {
            style: {
              background: "#6b7280",
            },
          },
        }}
      />
    </div>
  );
};

export default RegisterForm;
