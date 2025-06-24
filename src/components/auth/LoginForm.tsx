import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { authService } from "../../services/authService";

interface LoginFormData {
  username: string;
  password: string;
  remember: boolean;
}

interface LoginFormProps {
  onSubmit: (loginData: LoginFormData) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const handleFormSubmit = async (data: LoginFormData) => {
    const loadingToast = toast.loading("Đang đăng nhập...");
    setIsLoading(true);

    try {
      console.log("🚀 Login attempt with:", {
        username: data.username,
        password: "***",
      });

      const response = await authService.login(data.username, data.password);

      console.log("📝 API Response:", response);

      if (response.success && response.data) {
        const { result } = response.data;

        console.log("🔍 Login API response:", response.data);

        // ✅ Store basic auth data first
        localStorage.setItem("token", result.token);

        // ✅ Get full profile data from /user/profile API
        const profileResponse = await authService.getUserProfile();
        console.log("👤 Profile API response:", profileResponse);

        if (profileResponse.success && profileResponse.data) {
          // Store complete user data từ profile API
          localStorage.setItem(
            "user",
            JSON.stringify({
              userId: result.userId,
              username: data.username,
              authenticated: result.authenticated,
              // ✅ Full data từ profile API
              id: profileResponse.data.id,
              email: profileResponse.data.email,
              full_name: profileResponse.data.full_name,
              fullName: profileResponse.data.full_name, // Alias cho compatibility
              phone: profileResponse.data.phone,
              address: profileResponse.data.address,
              // ✅ Extract role từ roles array
              role: profileResponse.data.roles?.[0]?.name || "customer",
              roles: profileResponse.data.roles, // Keep full roles array
              created_at: profileResponse.data.created_at,
            })
          );
        } else {
          // Fallback nếu profile API fail
          localStorage.setItem(
            "user",
            JSON.stringify({
              userId: result.userId,
              username: data.username,
              authenticated: result.authenticated,
              email: `${data.username}@example.com`,
              fullName: data.username,
              role: "customer",
            })
          );
        }

        // ✅ Remember me functionality
        if (data.remember) {
          localStorage.setItem("rememberLogin", "true");
        }

        toast.success("Đăng nhập thành công!", { id: loadingToast });

        // ✅ Navigate to dashboard
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const roles = userData.roles || [];
        const role = Array.isArray(roles) && roles.length > 0 ? roles[0].name : "ROLE_CUSTOMER";
        setTimeout(() => {
          if (role === "ROLE_ADMIN") {
            navigate("/admin");
          } else if (role === "ROLE_STAFF") {
            navigate("/staff");
          } else {
            navigate("/dashboard");
          }
        }, 1000);
      } else {
        console.error("❌ Login failed:", response.message);
        toast.error(response.message || "Đăng nhập thất bại", {
          id: loadingToast,
        });
      }
    } catch (error: any) {
      console.error("💥 Login error:", error);
      toast.error("Có lỗi xảy ra khi đăng nhập!", { id: loadingToast });
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h1>
          <p className="text-gray-600">Truy cập hệ thống xét nghiệm DNA</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập hoặc Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("username", {
                    required: "Vui lòng nhập tên đăng nhập hoặc email",
                    minLength: {
                      value: 3,
                      message: "Tên đăng nhập phải có ít nhất 3 ký tự",
                    },
                  })}
                  type="text"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    errors.username ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Nhập tên đăng nhập hoặc email"
                  disabled={isLoading}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("password", {
                    required: "Vui lòng nhập mật khẩu",
                    minLength: {
                      value: 5,
                      message: "Mật khẩu phải có ít nhất 5 ký tự",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Nhập mật khẩu"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
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

            {/* Remember & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  {...register("remember")}
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-600">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Quên mật khẩu?
              </Link>
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
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="text-center">
              <span className="text-gray-600">Chưa có tài khoản? </span>
              <Link
                to="/register"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Đăng ký ngay
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
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            <strong>Demo:</strong> Username: admin, Password: 123456
          </p>
          <p className="text-xs text-blue-600 text-center mt-1">
            Hoặc sử dụng tài khoản thật từ database
          </p>
        </div>
      </div>

      {/* Toast Container */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
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

export default LoginForm;
