import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Shield, Edit3, Save, X, Lock, Eye, EyeOff, Phone, MapPin, IdCard, Loader } from 'lucide-react';

// ✅ Import UserService và types từ cấu trúc mới
import { UserService} from '../../services/staffService/userService';
import { ApiUser, UserUpdateRequest } from '../../types/appointment';
import authService from '../../services/authService';
const StaffProfileComponent = () => {
  // ✅ State cho profile data từ API
  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // ✅ Form data cho chỉnh sửa profile (based on UserUpdateRequest)
  const [formData, setFormData] = useState<UserUpdateRequest>({
    full_name: '',
    email: '',
    username: '',
    dob: ''
  });

  // Form data cho đổi mật khẩu
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ✅ Load user profile khi component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  // ✅ Function để load user profile từ API
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log("👤 Loading user profile...");
      
      // Lấy profile của user hiện tại
      const userProfile = await UserService.getCurrentUserProfile();
      
      if (userProfile) {
        setProfile(userProfile);
        
        // Khởi tạo form data với dữ liệu hiện tại
        setFormData({
          username: userProfile.username,
          full_name: userProfile.full_name,
          email: userProfile.email,
          dob: userProfile.dob
        });
        
        console.log("✅ User profile loaded successfully");
      } else {
        setError('Không thể tải thông tin người dùng');
      }
    } catch (err: any) {
      console.error("❌ Error loading user profile:", err);
      setError('Có lỗi xảy ra khi tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  const getRoleDisplayName = (roleName: string) => {
    const roleMap: Record<string, string> = {
      'STAFF': 'Nhân viên',
      'MANAGER': 'Quản lý',
      'ADMIN': 'Quản trị viên',
      'LAB_TECHNICIAN': 'Kỹ thuật viên Lab',
      'DOCTOR': 'Bác sĩ',
      'NURSE': 'Y tá'
    };
    return roleMap[roleName] || roleName;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // ✅ Function để save profile sử dụng UserService.updateUser
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!profile?.id) {
        setError('Không tìm thấy ID người dùng');
        return;
      }

      console.log("💾 Updating user profile...", formData);

      // ✅ Gọi API để cập nhật user
      const updatedUser = await UserService.updateUser(profile.id, formData);

      if (updatedUser) {
        setProfile(updatedUser);
        setEditMode(false);
        setSuccess('Cập nhật thông tin thành công!');
        
        console.log("✅ Profile updated successfully");
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Không thể cập nhật thông tin');
      }
    } catch (err: any) {
      console.error("❌ Error updating profile:", err);
      setError('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  // ✅ Function để change password (có thể cần implement riêng nếu API có endpoint khác)
  const handleChangePassword = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        setSaving(false);
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError('Mật khẩu mới phải có ít nhất 6 ký tự');
        setSaving(false);
        return;
      }

      if (!profile?.id) {
        setError('Không tìm thấy ID người dùng');
        return;
      }

      console.log("🔐 Changing password...");

      // ✅ Gọi API để đổi mật khẩu (sử dụng updateUser với password)
      const updateData: UserUpdateRequest = {
        password: passwordData.newPassword
      };

      const updatedUser = await UserService.updateUser(profile.id, updateData);

      if (updatedUser) {
        setPasswordMode(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setSuccess('Đổi mật khẩu thành công!');
        
        console.log("✅ Password changed successfully");
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Không thể đổi mật khẩu');
      }
    } catch (err: any) {
      console.error("❌ Error changing password:", err);
      setError('Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (!profile) return;
    
    setEditMode(false);
    setPasswordMode(false);
    
    // Reset form data về giá trị ban đầu
    setFormData({
      username: profile.username,
      full_name: profile.full_name,
      email: profile.email,
      dob: profile.dob
    });
    
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
  };

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Đang tải thông tin người dùng...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Show error state if no profile
  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không thể tải thông tin</h3>
          <p className="text-gray-600 mb-4">Vui lòng thử lại sau</p>
          <button
            onClick={loadUserProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
        </div>
        
        {!editMode && !passwordMode && (
          <div className="flex gap-3">
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Edit3 size={18} />
              Chỉnh sửa thông tin
            </button>
            <button
              onClick={() => setPasswordMode(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Lock size={18} />
              Đổi mật khẩu
            </button>
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
          <div className="flex">
            <div className="ml-3">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
          <div className="flex">
            <div className="ml-3">
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Avatar & Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 text-center">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
              </div>
              {editMode && (
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors">
                  <Edit3 size={16} className="text-gray-600" />
                </button>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-1">{profile.full_name || profile.username}</h3>
            <p className="text-gray-600 mb-2">Nhân viên</p>
            <p className="text-sm text-gray-500">DNA Service</p>

            {/* Roles */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Vai trò</p>
              <div className="space-y-2">
                {profile.roles?.map((role, index) => (
                  <div key={index} className="inline-block px-3 py-1 bg-white bg-opacity-70 text-blue-800 rounded-full text-xs font-medium mr-2">
                    {getRoleDisplayName(role.name)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2">
          {/* Personal Information */}
          {!passwordMode && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Thông tin cá nhân
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <User size={16} />
                    Họ và tên
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nhập họ và tên"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {profile.full_name || 'Chưa cập nhật'}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <Mail size={16} />
                    Email
                  </label>
                  {editMode ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nhập email"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {profile.email || 'Chưa cập nhật'}
                    </div>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <IdCard size={16} />
                    Tên đăng nhập
                  </label>
                  <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600">
                    {profile.username}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Không thể thay đổi tên đăng nhập</p>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <Calendar size={16} />
                    Ngày sinh
                  </label>
                  {editMode ? (
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {formatDate(profile.dob)}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Edit Mode */}
              {editMode && (
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <X size={18} />
                    Hủy bỏ
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Change Password Form */}
          {passwordMode && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Lock size={20} className="text-green-600" />
                Đổi mật khẩu
              </h2>
              
              <div className="space-y-6 max-w-md">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nhập mật khẩu mới"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Mật khẩu phải có ít nhất 6 ký tự</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Yêu cầu mật khẩu:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Ít nhất 6 ký tự</li>
                    <li>• Nên chứa chữ hoa và chữ thường</li>
                    <li>• Nên chứa ít nhất 1 số</li>
                    <li>• Nên chứa ký tự đặc biệt</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons for Password Mode */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleChangePassword}
                  disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                  {saving ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <X size={18} />
                  Hủy bỏ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffProfileComponent;