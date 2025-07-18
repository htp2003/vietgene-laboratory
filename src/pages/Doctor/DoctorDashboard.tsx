import React, { useState, useEffect } from 'react';
import { 
  FaUserMd, 
  FaCertificate, 
  FaCalendarAlt, 
  FaClock,
  FaChartLine,
  FaExclamationTriangle,
  FaBell,
  FaEye,
  FaPlus,
  FaSpinner,
  FaIdCard,
  FaStethoscope,
  FaStar,
  FaAward,
  FaCalendarDay,
  FaUserCheck,
  FaHeartbeat,
  FaChevronRight,
  FaCalendarWeek,
  FaCheckCircle,
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

  // Format appointment data for display
  const formatAppointmentData = (appointmentsWithUsers: any[]) => {
    return appointmentsWithUsers.map(appointment => {
      // Convert UTC time to Vietnam timezone
      const appointmentDate = new Date(appointment.appointment_date);
      const vietnamTime = new Date(appointmentDate.getTime() + (7 * 60 * 60 * 1000)); // UTC + 7 hours
      
      return {
        id: appointment.id,
        patientName: appointment.patientInfo 
          ? appointment.patientInfo.full_name || appointment.patientInfo.username
          : `Bệnh nhân ${appointment.userId}`,
        patientEmail: appointment.patientInfo?.email || '',
        time: vietnamTime.toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        date: vietnamTime.toLocaleDateString('vi-VN'),
        type: appointment.appointment_type,
        status: appointment.status ? 'confirmed' : 'pending',
        notes: appointment.notes,
        originalDate: appointment.appointment_date
      };
    });
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
          <div className="bg-white rounded-xl shadow-sm p-8">
            <FaExclamationTriangle className="text-red-500 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Cần tạo hồ sơ bác sĩ
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn cần tạo hồ sơ bác sĩ để sử dụng dashboard
            </p>
            <Link
              to="/doctor/profile"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 rounded-2xl shadow-lg mb-8 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
          <div className="relative px-8 py-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                  <FaUserMd className="text-white" size={40} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {getGreeting()}, Dr. {doctorProfile.doctorName}!
                  </h1>
                  <p className="text-blue-100 text-lg">
                    {formatDate(currentTime)}
                  </p>
                  <p className="text-blue-200 text-sm mt-1">
                    {formatTime(currentTime)}
                  </p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <FaIdCard className="text-blue-200" size={20} />
                  <span className="text-blue-100 font-medium">Mã bác sĩ</span>
                </div>
                <p className="text-2xl font-bold text-white">{doctorProfile.doctorCode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Certificates */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <FaCertificate className="text-white" size={24} />
              </div>
              <Link
                to="/doctor/certificates"
                className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50"
              >
                <FaChevronRight size={16} />
              </Link>
            </div>
            <div className="space-y-3">
              {certificateHook.loading ? (
                <div className="flex items-center gap-2">
                  <FaSpinner className="animate-spin text-blue-600" size={16} />
                  <span className="text-gray-500 text-sm">Đang tải...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-gray-800">{certificateStats.total}</h3>
                    <span className="text-sm text-blue-600 font-medium">chứng chỉ</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Hiệu lực</span>
                      <span className="text-sm font-medium text-green-600">{certificateStats.valid}</span>
                    </div>
                    {certificateStats.expiringSoon > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Sắp hết hạn</span>
                        <span className="text-sm font-medium text-yellow-600">{certificateStats.expiringSoon}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Time Slots */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <FaClock className="text-white" size={24} />
              </div>
              <Link
                to="/doctor/schedule"
                className="text-green-600 hover:text-green-800 transition-colors p-2 rounded-lg hover:bg-green-50"
              >
                <FaChevronRight size={16} />
              </Link>
            </div>
            <div className="space-y-3">
              {timeSlotHook.loading ? (
                <div className="flex items-center gap-2">
                  <FaSpinner className="animate-spin text-green-600" size={16} />
                  <span className="text-gray-500 text-sm">Đang tải...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-gray-800">{timeSlotStats.total}</h3>
                    <span className="text-sm text-green-600 font-medium">khung giờ</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Có sẵn</span>
                      <span className="text-sm font-medium text-green-600">{timeSlotStats.available}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Không có sẵn</span>
                      <span className="text-sm font-medium text-gray-500">{timeSlotStats.unavailable}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Appointments Today */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <FaCalendarDay className="text-white" size={24} />
              </div>
              <div className="p-2 rounded-lg">
                <FaEye className="text-purple-600" size={16} />
              </div>
            </div>
            <div className="space-y-3">
              {appointmentsLoading ? (
                <div className="flex items-center gap-2">
                  <FaSpinner className="animate-spin text-purple-600" size={16} />
                  <span className="text-gray-500 text-sm">Đang tải...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-gray-800">{formattedAppointments.length}</h3>
                    <span className="text-sm text-purple-600 font-medium">hôm nay</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Đã xác nhận</span>
                      <span className="text-sm font-medium text-green-600">{confirmedAppointments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Chờ xác nhận</span>
                      <span className="text-sm font-medium text-yellow-600">{pendingAppointments}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Today's Appointments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-8 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <FaCalendarAlt className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">Lịch hẹn hôm nay</h3>
                      <p className="text-gray-500 text-sm mt-1">Quản lý các cuộc hẹn trong ngày</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                    Xem tất cả
                    <FaChevronRight size={14} />
                  </button>
                </div>
              </div>
              <div className="p-8">
                {appointmentsLoading ? (
                  <div className="text-center py-12">
                    <FaSpinner className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
                    <p className="text-gray-500 text-lg">Đang tải lịch hẹn...</p>
                  </div>
                ) : formattedAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <FaCalendarAlt className="text-gray-400" size={32} />
                    </div>
                    <h4 className="text-lg font-medium text-gray-800 mb-2">Không có lịch hẹn nào</h4>
                    <p className="text-gray-500">Hôm nay bạn chưa có lịch hẹn nào được đặt</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formattedAppointments.map((appointment, index) => (
                      <div key={appointment.id} className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                            <FaStethoscope className="text-white" size={24} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-800">{appointment.patientName}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {appointment.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                            </span>
                          </div>
                          <p className="text-gray-600 font-medium mb-1">{appointment.type}</p>
                          {appointment.patientEmail && (
                            <p className="text-sm text-gray-500 mb-1">
                              <span className="font-medium">Email:</span> {appointment.patientEmail}
                            </p>
                          )}
                          {appointment.notes && (
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">Ghi chú:</span> {appointment.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <FaClock className="text-blue-600" size={16} />
                            <p className="text-xl font-bold text-gray-800">{appointment.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaPlus className="text-blue-600" size={18} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Thao tác nhanh</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <Link
                    to="/doctor/certificates"
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-300 group"
                  >
                    <div className="p-3 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <FaCertificate className="text-white" size={18} />
                    </div>
                    <div>
                      <span className="text-gray-800 font-semibold">Quản lý chứng chỉ</span>
                      <p className="text-sm text-gray-600 mt-1">Thêm & cập nhật chứng chỉ</p>
                    </div>
                  </Link>
                  <Link
                    to="/doctor/schedule"
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-300 group"
                  >
                    <div className="p-3 bg-green-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <FaCalendarWeek className="text-white" size={18} />
                    </div>
                    <div>
                      <span className="text-gray-800 font-semibold">Lịch làm việc</span>
                      <p className="text-sm text-gray-600 mt-1">Cập nhật khung giờ</p>
                    </div>
                  </Link>
                  <Link
                    to="/doctor/profile"
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-300 group"
                  >
                    <div className="p-3 bg-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <FaUserMd className="text-white" size={18} />
                    </div>
                    <div>
                      <span className="text-gray-800 font-semibold">Hồ sơ cá nhân</span>
                      <p className="text-sm text-gray-600 mt-1">Chỉnh sửa thông tin</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Profile Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FaUserCheck className="text-green-600" size={18} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Trạng thái hồ sơ</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FaCheckCircle className="text-green-500" size={16} />
                      <span className="text-sm font-medium text-gray-700">Hồ sơ cơ bản</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      Hoàn thành
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FaCheckCircle className="text-green-500" size={16} />
                      <span className="text-sm font-medium text-gray-700">Chứng chỉ</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      {certificateStats.total} chứng chỉ
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FaCheckCircle className="text-green-500" size={16} />
                      <span className="text-sm font-medium text-gray-700">Lịch làm việc</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      {timeSlotStats.total} khung giờ
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <FaHeartbeat className="text-white" size={16} />
                        </div>
                        <span className="font-semibold">Tình trạng hoạt động</span>
                      </div>
                      <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
                        Đang hoạt động
                      </span>
                    </div>
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