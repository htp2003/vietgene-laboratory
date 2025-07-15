import React, { useState, useEffect } from 'react';
import { 
  FaUserMd, 
  FaCertificate, 
  FaCalendarAlt, 
  FaClock,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUsers,
  FaBell,
  FaEye,
  FaPlus,
  FaArrowRight,
  FaSpinner,
  FaCalendarCheck,
  FaIdCard,
  FaClipboardList,
  FaStethoscope,
  FaStar,
  FaAward
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import doctorService from '../../services/doctorService';
import DoctorAppointmentService from '../../services/doctorAppointmentService';
import userService from '../../services/userService';
import useDoctorCertificate from '../../hooks/useDoctorCertificates';
import useDoctorTimeSlots from '../../hooks/useDoctorTimeSlots';

const API_BASE_URL = "https://dna-service-se1857.onrender.com/dna_service";

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

export default function DoctorDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsWithUserInfo, setAppointmentsWithUserInfo] = useState<any[]>([]);

  // Get user info from token (secure way)
  const getUserInfoFromToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        return userData.result;
      } else {
        // Token invalid, clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
    } catch (error) {
      console.error('Error getting user info from token:', error);
      return null;
    }
  };

  // Load doctor profile
  useEffect(() => {
    loadDoctorProfile();
  }, []);

  // Load today's appointments when doctor profile is loaded
  useEffect(() => {
    if (doctorProfile) {
      loadTodaysAppointments();
    }
  }, [doctorProfile]);

  // Load user info for appointments when appointments change
  useEffect(() => {
    if (appointments.length > 0) {
      loadUserInfoForAppointments();
    } else {
      setAppointmentsWithUserInfo([]);
    }
  }, [appointments]);

  const loadUserInfoForAppointments = async () => {
    try {
      const userIds = [...new Set(appointments.map(apt => apt.userId))];
      // Use Promise.all to fetch all users in parallel
      const userPromises = userIds.map(id => userService.getUserById(id));
      const userResponses = await Promise.all(userPromises);
      
      // Create a map of user IDs to user data
      const usersMap = userResponses.reduce((acc, response) => {
        if (response.success && response.data) {
          acc[response.data.id] = response.data;
        }
        return acc;
      }, {} as Record<string, any>);
      
      // Map appointments with user info
      const appointmentsWithUsers = appointments.map(appointment => ({
        ...appointment,
        patientInfo: usersMap[appointment.userId] || null
      }));
      
      setAppointmentsWithUserInfo(appointmentsWithUsers);
    } catch (error) {
      console.error('Error loading user info:', error);
      setAppointmentsWithUserInfo(appointments);
    }
  };

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const loadDoctorProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user info from token (secure)
      const user = await getUserInfoFromToken();
      if (!user) {
        setError('Không thể xác thực người dùng. Vui lòng đăng nhập lại.');
        return;
      }
      
      const doctorResponse = await doctorService.getAllDoctors();
      if (doctorResponse.success && doctorResponse.data) {
        const existingDoctor = doctorResponse.data.find(doc => doc.userId === user.id);
        setDoctorProfile(existingDoctor || null);
      }
    } catch (error) {
      console.error('Error loading doctor profile:', error);
      setError('Có lỗi xảy ra khi tải thông tin bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const loadTodaysAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      
      if (!doctorProfile?.doctorId) {
        setAppointments([]);
        return;
      }
      
      // Use doctorId to get appointments through their time slots
      const response = await DoctorAppointmentService.getDoctorTodaysAppointments(doctorProfile.doctorId);
      
      if (response.success && response.data) {
        setAppointments(response.data);
      } else {
        console.error('Error loading appointments:', response.message);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Use hooks for certificates and time slots only if doctor profile exists
  const certificateHook = useDoctorCertificate(doctorProfile?.doctorId || '');
  const timeSlotHook = useDoctorTimeSlots(doctorProfile?.doctorId || '');

  // Get real stats only when doctor profile exists
  const certificateStats = doctorProfile && !certificateHook.loading ? certificateHook.getCertificateStats() : { total: 0, valid: 0, expired: 0, expiringSoon: 0 };
  const timeSlotStats = doctorProfile && !timeSlotHook.loading ? timeSlotHook.getTimeSlotStats() : { total: 0, available: 0, unavailable: 0, byDay: {} };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // Mock data for additional widgets (keeping for notifications and recent activity)
  const mockNotifications = [
    { id: 1, message: 'Có 2 chứng chỉ sắp hết hạn trong 30 ngày', type: 'warning', time: '2 giờ trước' },
    { id: 2, message: 'Lịch hẹn mới từ bệnh nhân Nguyễn Văn D', type: 'info', time: '1 giờ trước' },
    { id: 3, message: 'Cập nhật thông tin hồ sơ thành công', type: 'success', time: '30 phút trước' },
  ];

  const mockRecentActivity = [
    { id: 1, action: 'Thêm chứng chỉ mới', detail: 'Chứng chỉ Tim mạch 2024', time: '2 giờ trước' },
    { id: 2, action: 'Cập nhật lịch làm việc', detail: 'Thêm khung giờ thứ 7', time: '1 ngày trước' },
    { id: 3, action: 'Hoàn thành khám bệnh', detail: 'Bệnh nhân Nguyễn Văn A', time: '2 ngày trước' },
  ];

  // Format appointment data for display
  const formatAppointmentData = (appointmentsWithUsers: any[]) => {
    return appointmentsWithUsers.map(appointment => ({
      id: appointment.id,
      patientName: appointment.patientInfo 
        ? appointment.patientInfo.full_name || appointment.patientInfo.username
        : `Bệnh nhân ${appointment.userId}`,
      patientEmail: appointment.patientInfo?.email || '',
      time: new Date(appointment.appointment_date).toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      type: appointment.appointment_type,
      status: appointment.status ? 'confirmed' : 'pending',
      notes: appointment.notes
    }));
  };

  const formattedAppointments = formatAppointmentData(appointmentsWithUserInfo);
  const confirmedAppointments = formattedAppointments.filter(apt => apt.status === 'confirmed').length;
  const pendingAppointments = formattedAppointments.filter(apt => apt.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Đang tải thông tin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !doctorProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <FaExclamationTriangle className="text-red-500 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Cần tạo hồ sơ bác sĩ
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn cần tạo hồ sơ bác sĩ để sử dụng dashboard
            </p>
            <Link
              to="/doctor/profile"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FaUserMd size={16} />
              Tạo hồ sơ bác sĩ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-sm mb-6 text-white">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FaUserMd className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {getGreeting()}, Dr. {doctorProfile.doctorName}!
                </h1>
                <p className="text-blue-100 mt-1">
                  {formatDate(currentTime)} - {formatTime(currentTime)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <FaIdCard className="text-blue-200" size={16} />
                <span className="text-blue-100 text-sm">Mã bác sĩ:</span>
              </div>
              <p className="text-xl font-semibold">{doctorProfile.doctorCode}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Certificates */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaCertificate className="text-blue-600" size={24} />
            </div>
            <Link
              to="/doctor/certificates"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FaArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-2">
            {certificateHook.loading ? (
              <div className="flex items-center gap-2">
                <FaSpinner className="animate-spin text-blue-600" size={16} />
                <span className="text-gray-500 text-sm">Đang tải...</span>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-800">{certificateStats.total}</h3>
                <p className="text-gray-600 text-sm">Chứng chỉ</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-green-600">✓ {certificateStats.valid} hiệu lực</span>
                  {certificateStats.expiringSoon > 0 && (
                    <span className="text-yellow-600">⚠ {certificateStats.expiringSoon} sắp hết hạn</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaClock className="text-green-600" size={24} />
            </div>
            <Link
              to="/doctor/schedule"
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <FaArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-2">
            {timeSlotHook.loading ? (
              <div className="flex items-center gap-2">
                <FaSpinner className="animate-spin text-green-600" size={16} />
                <span className="text-gray-500 text-sm">Đang tải...</span>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-800">{timeSlotStats.total}</h3>
                <p className="text-gray-600 text-sm">Khung giờ làm việc</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-green-600">✓ {timeSlotStats.available} có sẵn</span>
                  <span className="text-gray-500">◯ {timeSlotStats.unavailable} không có sẵn</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Appointments Today */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaCalendarCheck className="text-purple-600" size={24} />
            </div>
            <FaEye className="text-purple-600" size={16} />
          </div>
          <div className="space-y-2">
            {appointmentsLoading ? (
              <div className="flex items-center gap-2">
                <FaSpinner className="animate-spin text-purple-600" size={16} />
                <span className="text-gray-500 text-sm">Đang tải...</span>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-800">{formattedAppointments.length}</h3>
                <p className="text-gray-600 text-sm">Lịch hẹn hôm nay</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-green-600">✓ {confirmedAppointments} đã xác nhận</span>
                  <span className="text-yellow-600">⏳ {pendingAppointments} chờ xác nhận</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Appointments */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">Lịch hẹn hôm nay</h3>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Xem tất cả
                </button>
              </div>
            </div>
            <div className="p-6">
              {appointmentsLoading ? (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin text-blue-600 mx-auto mb-3" size={24} />
                  <p className="text-gray-500">Đang tải lịch hẹn...</p>
                </div>
              ) : formattedAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <FaCalendarAlt className="text-gray-300 mx-auto mb-3" size={48} />
                  <p className="text-gray-500">Không có lịch hẹn nào hôm nay</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formattedAppointments.map(appointment => (
                    <div key={appointment.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FaStethoscope className="text-blue-600" size={20} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-800">{appointment.patientName}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{appointment.type}</p>
                        {appointment.patientEmail && (
                          <p className="text-xs text-gray-500">Email: {appointment.patientEmail}</p>
                        )}
                        {appointment.notes && (
                          <p className="text-xs text-gray-500 mt-1">Ghi chú: {appointment.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">{appointment.time}</p>
                        <p className="text-sm text-gray-500">Hôm nay</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FaPlus className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Thao tác nhanh</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <Link
                  to="/doctor/certificates"
                  className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <FaCertificate className="text-blue-600" size={20} />
                  <span className="text-gray-800 font-medium">Thêm chứng chỉ</span>
                </Link>
                <Link
                  to="/doctor/schedule"
                  className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <FaClock className="text-green-600" size={20} />
                  <span className="text-gray-800 font-medium">Cập nhật lịch làm việc</span>
                </Link>
                <Link
                  to="/doctor/profile"
                  className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <FaUserMd className="text-purple-600" size={20} />
                  <span className="text-gray-800 font-medium">Chỉnh sửa hồ sơ</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Profile Status */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FaUserMd className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Trạng thái hồ sơ</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hồ sơ cơ bản</span>
                  <FaCheckCircle className="text-green-500" size={16} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Chứng chỉ</span>
                  <FaCheckCircle className="text-green-500" size={16} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lịch làm việc</span>
                  <FaCheckCircle className="text-green-500" size={16} />
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">Tình trạng</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Hoạt động
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}