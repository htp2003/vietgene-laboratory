import React, { useState, useEffect } from 'react';
import { FaSpinner, FaExclamationTriangle, FaUserMd } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import doctorService from '../../services/doctorService';
import DoctorSchedule from '../../pages/Doctor/DoctorSchedule';

export default function DoctorScheduleWrapper() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  // Get user info from localStorage
  const getUserInfo = () => {
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    return null;
  };

  // Load doctor profile
  useEffect(() => {
    loadDoctorProfile();
  }, []);

  const loadDoctorProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = getUserInfo();
      if (!user) {
        setError('Không tìm thấy thông tin đăng nhập');
        return;
      }
      
      // Load all doctors and find by userId
      const doctorResponse = await doctorService.getAllDoctors();
      if (doctorResponse.success && doctorResponse.data) {
        const existingDoctor = doctorResponse.data.find(doc => doc.userId === user.userId);
        
        if (existingDoctor) {
          setDoctorId(existingDoctor.doctorId);
        } else {
          setError('Bạn chưa có hồ sơ bác sĩ. Vui lòng tạo hồ sơ trước khi quản lý lịch làm việc.');
        }
      } else {
        setError('Không thể tải thông tin bác sĩ');
      }
      
    } catch (error) {
      console.error('Error loading doctor profile:', error);
      setError('Có lỗi xảy ra khi tải thông tin bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Đang tải thông tin bác sĩ...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <FaExclamationTriangle className="text-red-500 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Không thể tải lịch làm việc
            </h3>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            {error.includes('chưa có hồ sơ') && (
              <Link
                to="/doctor/profile"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FaUserMd size={16} />
                Tạo hồ sơ bác sĩ
              </Link>
            )}
            <div className="mt-4">
              <button
                onClick={loadDoctorProfile}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (doctorId) {
    return <DoctorSchedule doctorId={doctorId} />;
  }
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Không thể tải lịch làm việc</p>
      </div>
    </div>
  );
}