import React, { useState } from 'react';
import { User, Mail, Calendar, Shield, Edit3, Save, X, Lock, Eye, EyeOff, Phone, MapPin, IdCard } from 'lucide-react';

const StaffProfileComponent = () => {
  // Mock data - thay thế bằng API call sau này
  const [profile, setProfile] = useState({
    id: "STF001",
    username: "nguyenvana",
    email: "nguyenvana@vietgenelab.com",
    full_name: "Nguyễn Văn A",
    dob: "1990-05-15",
    phone: "0901234567",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    employee_id: "VGL2024001",
    department: "Phòng Lab",
    position: "Kỹ thuật viên xét nghiệm",
    hire_date: "2024-01-15",
    avatar: null,
    roles: [
      { name: "STAFF", description: "Nhân viên" },
      { name: "LAB_TECHNICIAN", description: "Kỹ thuật viên phòng lab" }
    ]
  });

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

  // Form data cho chỉnh sửa profile
  const [formData, setFormData] = useState({
    full_name: profile.full_name,
    email: profile.email,
    phone: profile.phone,
    address: profile.address,
    dob: profile.dob
  });

  // Form data cho đổi mật khẩu
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Helper functions
  const formatDate = (dateString) => {
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

  const getRoleDisplayName = (roleName) => {
    const roleMap = {
      'STAFF': 'Nhân viên',
      'MANAGER': 'Quản lý',
      'ADMIN': 'Quản trị viên',
      'LAB_TECHNICIAN': 'Kỹ thuật viên Lab',
      'DOCTOR': 'Bác sĩ',
      'NURSE': 'Y tá'
    };
    return roleMap[roleName] || roleName;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update profile with new data
      setProfile(prev => ({
        ...prev,
        ...formData
      }));

      setEditMode(false);
      setSuccess('Cập nhật thông tin thành công!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

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

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setPasswordMode(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSuccess('Đổi mật khẩu thành công!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setPasswordMode(false);
    setFormData({
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      dob: profile.dob
    });
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
  };

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
                {profile.full_name?.charAt(0) || 'A'}
              </div>
              {editMode && (
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors">
                  <Edit3 size={16} className="text-gray-600" />
                </button>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-1">{profile.full_name}</h3>
            <p className="text-gray-600 mb-2">{profile.position}</p>
            <p className="text-sm text-gray-500">{profile.department}</p>

            {/* Quick Stats */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Mã nhân viên:</span>
                <span className="font-medium text-gray-900">{profile.employee_id}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Ngày vào làm:</span>
                <span className="font-medium text-gray-900">{formatDate(profile.hire_date)}</span>
              </div>
            </div>

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
                      value={formData.full_name}
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
                      value={formData.email}
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

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <Phone size={16} />
                    Số điện thoại
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nhập số điện thoại"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {profile.phone || 'Chưa cập nhật'}
                    </div>
                  )}
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
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {formatDate(profile.dob)}
                    </div>
                  )}
                </div>

                {/* Employee ID */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <IdCard size={16} />
                    Mã nhân viên
                  </label>
                  <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600">
                    {profile.employee_id}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Được cấp bởi hệ thống</p>
                </div>
              </div>

              {/* Address - Full width */}
              <div className="mt-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <MapPin size={16} />
                  Địa chỉ
                </label>
                {editMode ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Nhập địa chỉ"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {profile.address || 'Chưa cập nhật'}
                  </div>
                )}
              </div>

              {/* Work Information */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield size={18} className="text-green-600" />
                  Thông tin công việc
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Phòng ban</label>
                    <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600">
                      {profile.department}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Chức vụ</label>
                    <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600">
                      {profile.position}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Ngày vào làm</label>
                    <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600">
                      {formatDate(profile.hire_date)}
                    </div>
                  </div>
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
                    <Save size={18} />
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
                  <Save size={18} />
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