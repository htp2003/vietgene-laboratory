import React, { useState, useEffect } from 'react';
import { 
  FaUserMd, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaPlus, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaIdCard,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaUserCircle
} from 'react-icons/fa';
import doctorService from '../../services/doctorService';

interface DoctorProfile {
  userId: string;
  doctorId: string;
  doctorCode: string;
  doctorName: string;
  doctorEmail: string;
  doctorPhone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  dob: string;
  roles: Array<{ name: string; description: string }>;
}

export default function DoctorProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Profile data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    doctorCode: '',
    doctorName: '',
    doctorEmail: '',
    doctorPhone: '',
    isActive: true
  });

  // Get user info from localStorage
  const getUserInfo = () => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        return { user, token };
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    return null;
  };

  // Load user profile and doctor profile
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const authInfo = getUserInfo();
      if (!authInfo) {
        setError('Không tìm thấy thông tin đăng nhập');
        return;
      }

      const { user, token } = authInfo;
      
      const mockUserProfile: UserProfile = {
        id: user.userId || user.id,
        username: user.username || 'N/A',
        email: user.email || 'N/A',
        full_name: user.full_name || 'N/A',
        dob: user.dob || 'N/A',
        roles: user.roles || [{ name: 'ROLE_DOCTOR', description: 'Bác sĩ' }]
      };
      
      setUserProfile(mockUserProfile);

      // Try to load doctor profile
      try {
        const doctorResponse = await doctorService.getAllDoctors();
        if (doctorResponse.success && doctorResponse.data) {
          // Find doctor by userId
          const existingDoctor = doctorResponse.data.find(doc => doc.userId === user.userId);
          
          if (existingDoctor) {
            setDoctorProfile(existingDoctor);
            setFormData({
              doctorCode: existingDoctor.doctorCode,
              doctorName: existingDoctor.doctorName,
              doctorEmail: existingDoctor.doctorEmail,
              doctorPhone: existingDoctor.doctorPhone,
              isActive: existingDoctor.isActive
            });
            setHasProfile(true);
          } else {
            setHasProfile(false);
            setDoctorProfile(null);
          }
        }
      } catch (error) {
        console.error('Error loading doctor profile:', error);
        setHasProfile(false);
        setDoctorProfile(null);
      }
      
    } catch (error) {
      console.error('Error loading profiles:', error);
      setError('Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.doctorCode.trim()) {
      setError('Mã bác sĩ không được để trống');
      return false;
    }
    if (!formData.doctorName.trim()) {
      setError('Tên bác sĩ không được để trống');
      return false;
    }
    if (!formData.doctorEmail.trim()) {
      setError('Email không được để trống');
      return false;
    }
    if (!formData.doctorPhone.trim()) {
      setError('Số điện thoại không được để trống');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.doctorEmail)) {
      setError('Email không đúng định dạng');
      return false;
    }

    // Validate phone format
    const phoneRegex = /^(0|\+84)[0-9]{8,10}$/;
    if (!phoneRegex.test(formData.doctorPhone.replace(/\s/g, ''))) {
      setError('Số điện thoại không đúng định dạng');
      return false;
    }

    return true;
  };

  const handleCreateProfile = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);
      
      const response = await doctorService.createDoctor(formData);
      
      if (response.success) {
        setHasProfile(true);
        setDoctorProfile(response.data!);
        setEditing(false);
        
        // Show success message
        alert('Tạo hồ sơ bác sĩ thành công!');
      } else {
        setError(response.message || 'Không thể tạo hồ sơ bác sĩ');
      }
    } catch (error) {
      console.error('Error creating doctor profile:', error);
      setError('Có lỗi xảy ra khi tạo hồ sơ bác sĩ');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);
      
      const response = await doctorService.updateDoctor(doctorProfile!.doctorId, formData);
      
      if (response.success) {
        setDoctorProfile(response.data!);
        setEditing(false);
        
        // Show success message
        alert('Cập nhật hồ sơ thành công!');
      } else {
        setError(response.message || 'Không thể cập nhật hồ sơ');
      }
    } catch (error) {
      console.error('Error updating doctor profile:', error);
      setError('Có lỗi xảy ra khi cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (hasProfile && doctorProfile) {
      handleUpdateProfile();
    } else {
      handleCreateProfile();
    }
  };

  const handleCancel = () => {
    if (doctorProfile) {
      setFormData({
        doctorCode: doctorProfile.doctorCode,
        doctorName: doctorProfile.doctorName,
        doctorEmail: doctorProfile.doctorEmail,
        doctorPhone: doctorProfile.doctorPhone,
        isActive: doctorProfile.isActive
      });
    } else {
      setFormData({
        doctorCode: '',
        doctorName: '',
        doctorEmail: '',
        doctorPhone: '',
        isActive: true
      });
    }
    setEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaUserMd className="text-blue-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Hồ Sơ Bác Sĩ
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý thông tin hồ sơ bác sĩ cá nhân
                </p>
              </div>
            </div>
            
            {hasProfile && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FaEdit size={16} />
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500" size={20} />
            <div>
              <p className="text-red-800 font-medium">Có lỗi xảy ra</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Account Info */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FaUser className="text-gray-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Thông Tin Tài Khoản
                </h3>
                <p className="text-sm text-gray-500">
                  Thông tin từ tài khoản đăng nhập
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {userProfile ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaUserCircle className="text-gray-500" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Tên đăng nhập</p>
                    <p className="font-medium text-gray-800">{userProfile.username}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaUser className="text-gray-500" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Họ và tên</p>
                    <p className="font-medium text-gray-800">{userProfile.full_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaEnvelope className="text-gray-500" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">{userProfile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaIdCard className="text-gray-500" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Vai trò</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {userProfile.roles.map(role => (
                        <span key={role.name} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <FaExclamationTriangle className="text-gray-400 mx-auto mb-3" size={32} />
                <p className="text-gray-500">Không thể tải thông tin tài khoản</p>
              </div>
            )}
          </div>
        </div>

        {/* Doctor Profile */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaUserMd className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Hồ Sơ Bác Sĩ
                </h3>
                <p className="text-sm text-gray-500">
                  {hasProfile ? 'Thông tin hồ sơ chuyên môn' : 'Chưa có hồ sơ bác sĩ'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {!hasProfile && !editing ? (
              /* Create Profile Prompt */
              <div className="text-center py-8">
                <div className="p-4 bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <FaPlus className="text-blue-600" size={32} />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Tạo Hồ Sơ Bác Sĩ
                </h4>
                <p className="text-gray-600 mb-6">
                  Bạn chưa có hồ sơ bác sĩ. Hãy tạo hồ sơ để bắt đầu sử dụng các tính năng dành cho bác sĩ.
                </p>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium mx-auto"
                >
                  <FaPlus size={16} />
                  Tạo Hồ Sơ
                </button>
              </div>
            ) : editing ? (
              /* Edit Form */
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã Bác Sĩ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="doctorCode"
                    value={formData.doctorCode}
                    onChange={handleInputChange}
                    placeholder="Nhập mã bác sĩ (ví dụ: DOC001)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên Bác Sĩ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleInputChange}
                    placeholder="Nhập tên bác sĩ"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="doctorEmail"
                    value={formData.doctorEmail}
                    onChange={handleInputChange}
                    placeholder="Nhập email bác sĩ"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số Điện Thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="doctorPhone"
                    value={formData.doctorPhone}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={saving}
                    />
                    <span className="text-sm text-gray-700">
                      Kích hoạt hồ sơ bác sĩ
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium"
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="animate-spin" size={16} />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <FaSave size={16} />
                        {hasProfile ? 'Cập nhật' : 'Tạo hồ sơ'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* View Profile */
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaIdCard className="text-gray-500" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Mã bác sĩ</p>
                    <p className="font-medium text-gray-800">{doctorProfile?.doctorCode}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaUserMd className="text-gray-500" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Tên bác sĩ</p>
                    <p className="font-medium text-gray-800">{doctorProfile?.doctorName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaEnvelope className="text-gray-500" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">{doctorProfile?.doctorEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaPhone className="text-gray-500" size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-medium text-gray-800">{doctorProfile?.doctorPhone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaCheckCircle className={`${doctorProfile?.isActive ? 'text-green-500' : 'text-red-500'}`} size={16} />
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <p className={`font-medium ${doctorProfile?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {doctorProfile?.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                    </p>
                  </div>
                </div>

                {doctorProfile?.createdAt && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaIdCard className="text-gray-500" size={16} />
                    <div>
                      <p className="text-sm text-gray-500">Ngày tạo</p>
                      <p className="font-medium text-gray-800">
                        {new Date(doctorProfile.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}