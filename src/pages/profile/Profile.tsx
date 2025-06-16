import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Edit3,
  Lock,
  Shield,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { authService } from "../../services/authService";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  created_at: string;
  roles: Array<{
    name: string;
    description: string;
  }>;
}

interface ProfileFormData {
  full_name: string;
  email: string;
  phone: string;
  address: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [updateLoading, setUpdateLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
    setValue,
  } = useForm<ProfileFormData>();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm<PasswordFormData>();

  const newPassword = watch("newPassword");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getUserProfile();

      if (response.success && response.data) {
        setProfile(response.data);
        // Set form values
        setValue("full_name", response.data.full_name || "");
        setValue("email", response.data.email || "");
        setValue("phone", response.data.phone || "");
        setValue("address", response.data.address || "");
      } else {
        toast.error("Không thể tải thông tin profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Có lỗi xảy ra khi tải thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (data: ProfileFormData) => {
    setUpdateLoading(true);
    const loadingToast = toast.loading("Đang cập nhật thông tin...");

    try {
      // Mock API call - replace with real API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update local storage
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          full_name: data.full_name,
          fullName: data.full_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      // Update state
      if (profile) {
        setProfile({
          ...profile,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
        });
      }

      toast.success("Cập nhật thông tin thành công!", { id: loadingToast });
      setIsEditing(false);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin!", {
        id: loadingToast,
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePasswordChange = async (data: PasswordFormData) => {
    setUpdateLoading(true);
    const loadingToast = toast.loading("Đang đổi mật khẩu...");

    try {
      // Mock API call - replace with real API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Đổi mật khẩu thành công!", { id: loadingToast });
      resetPassword();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đổi mật khẩu!", { id: loadingToast });
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleName = (roles: UserProfile["roles"]) => {
    if (!roles || roles.length === 0) return "Người dùng";

    const roleMap: { [key: string]: string } = {
      ROLE_ADMIN: "Quản trị viên",
      ROLE_DOCTOR: "Bác sĩ",
      ROLE_STAFF: "Nhân viên",
      ROLE_CUSTOMER: "Khách hàng",
    };

    return roleMap[roles[0].name] || roles[0].name;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Không thể tải thông tin profile</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Quay về Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Dashboard
          </button>
          <span className="text-gray-400">|</span>
          <h1 className="text-2xl font-bold text-gray-900">
            Thông tin cá nhân
          </h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-red-600" />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                <p className="text-red-100">@{profile.username}</p>
                <p className="text-red-200 text-sm">
                  {getRoleName(profile.roles)}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-medium text-gray-900">
                      {profile.phone || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ</p>
                    <p className="font-medium text-gray-900">
                      {profile.address || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Ngày tạo tài khoản</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(profile.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "profile"
                    ? "border-red-500 text-red-600 bg-red-50"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Edit3 className="w-4 h-4" />
                Chỉnh sửa thông tin
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "password"
                    ? "border-red-500 text-red-600 bg-red-50"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Lock className="w-4 h-4" />
                Đổi mật khẩu
              </button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === "profile" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Thông tin cá nhân
                  </h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                  )}
                </div>

                <form
                  onSubmit={handleProfileSubmit(handleProfileUpdate)}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        {...registerProfile("full_name", {
                          required: "Vui lòng nhập họ và tên",
                          minLength: {
                            value: 2,
                            message: "Họ tên phải có ít nhất 2 ký tự",
                          },
                        })}
                        type="text"
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                          !isEditing ? "bg-gray-50 text-gray-500" : ""
                        } ${
                          profileErrors.full_name
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      />
                      {profileErrors.full_name && (
                        <p className="text-red-500 text-sm mt-1">
                          {profileErrors.full_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        {...registerProfile("email", {
                          required: "Vui lòng nhập email",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Email không hợp lệ",
                          },
                        })}
                        type="email"
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                          !isEditing ? "bg-gray-50 text-gray-500" : ""
                        } ${
                          profileErrors.email
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      />
                      {profileErrors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {profileErrors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        {...registerProfile("phone", {
                          pattern: {
                            value: /^(0[3|5|7|8|9])+([0-9]{8})$/,
                            message: "Số điện thoại không hợp lệ",
                          },
                        })}
                        type="tel"
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                          !isEditing ? "bg-gray-50 text-gray-500" : ""
                        } ${
                          profileErrors.phone
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        placeholder="Nhập số điện thoại"
                      />
                      {profileErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {profileErrors.phone.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ
                      </label>
                      <input
                        {...registerProfile("address")}
                        type="text"
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                          !isEditing ? "bg-gray-50 text-gray-500" : ""
                        } border-gray-300`}
                        placeholder="Nhập địa chỉ"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {updateLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Đang lưu...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Lưu thay đổi</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          resetProfile();
                        }}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {activeTab === "password" && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Đổi mật khẩu
                </h3>

                <form
                  onSubmit={handlePasswordSubmit(handlePasswordChange)}
                  className="space-y-6 max-w-md"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu hiện tại *
                    </label>
                    <input
                      {...registerPassword("currentPassword", {
                        required: "Vui lòng nhập mật khẩu hiện tại",
                      })}
                      type="password"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                        passwordErrors.currentPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu mới *
                    </label>
                    <input
                      {...registerPassword("newPassword", {
                        required: "Vui lòng nhập mật khẩu mới",
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
                      type="password"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                        passwordErrors.newPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="Nhập mật khẩu mới"
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xác nhận mật khẩu mới *
                    </label>
                    <input
                      {...registerPassword("confirmPassword", {
                        required: "Vui lòng xác nhận mật khẩu mới",
                        validate: (value) =>
                          value === newPassword ||
                          "Mật khẩu xác nhận không khớp",
                      })}
                      type="password"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                        passwordErrors.confirmPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-blue-900 font-medium text-sm mb-1">
                          Yêu cầu mật khẩu:
                        </h4>
                        <ul className="text-blue-800 text-xs space-y-1">
                          <li>• Ít nhất 8 ký tự</li>
                          <li>• Chứa ít nhất 1 chữ hoa</li>
                          <li>• Chứa ít nhất 1 chữ thường</li>
                          <li>• Chứa ít nhất 1 số</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {updateLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Đang đổi...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Đổi mật khẩu</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
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

export default Profile;
