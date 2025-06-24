import React from 'react';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaUserMd, FaEnvelope, FaPhone, FaStethoscope, FaCalendarAlt } from 'react-icons/fa';
import { EnhancedDoctor } from '../../../hooks/useDoctor';

interface DoctorListProps {
  doctors: EnhancedDoctor[];
  onEdit: (doctor: EnhancedDoctor) => void;
  onDelete: (doctor: EnhancedDoctor) => void;
  onToggleStatus: (doctor: EnhancedDoctor) => void;
  onSelect?: (doctor: EnhancedDoctor) => void;
  selectedDoctor?: EnhancedDoctor | null;
}

const DoctorList: React.FC<DoctorListProps> = ({ 
  doctors, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onSelect,
  selectedDoctor
}) => {
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Đang hoạt động' : 'Ngưng hoạt động';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  const getExperienceText = (years?: number) => {
    if (!years) return 'Mới';
    if (years === 1) return '1 năm';
    return `${years} năm`;
  };

  if (doctors.length === 0) {
    return (
      <div className="text-center py-12">
        <FaUserMd className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Không có bác sĩ nào</h3>
        <p className="text-gray-500">Danh sách bác sĩ trống hoặc không có bác sĩ phù hợp với bộ lọc.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full bg-white">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 bg-gray-50 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
          <div className="col-span-4">Thông tin bác sĩ</div>
          <div className="col-span-2">Liên hệ</div>
          <div className="col-span-2">Chuyên khoa</div>
          <div className="col-span-1 text-center">Trạng thái</div>
          <div className="col-span-2">Ngày tạo</div>
          <div className="col-span-1 text-center">Hành động</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-200">
          {doctors.map(doctor => (
            <div 
              key={doctor.doctorId} 
              className={`grid grid-cols-12 gap-4 px-6 py-4 transition-colors items-center min-h-[100px] cursor-pointer ${
                selectedDoctor?.doctorId === doctor.doctorId 
                  ? 'bg-blue-50 border-l-4 border-blue-500' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelect && onSelect(doctor)}
            >
              {/* Doctor Info - 4 columns */}
              <div className="col-span-4 flex items-center space-x-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src={doctor.avatar}
                    alt={doctor.doctorName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.doctorName)}&background=3b82f6&color=fff`;
                    }}
                  />
                </div>
                
                {/* Name and Code */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {doctor.doctorName}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">
                    {doctor.doctorCode}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center mt-1">
                    <FaCalendarAlt className="mr-1" size={10} />
                    {getExperienceText(doctor.experience)} kinh nghiệm
                  </div>
                </div>
              </div>

              {/* Contact Info - 2 columns */}
              <div className="col-span-2">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaEnvelope className="mr-2 text-gray-400" size={12} />
                    <span className="truncate">{doctor.doctorEmail}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaPhone className="mr-2 text-gray-400" size={12} />
                    <span>{doctor.doctorPhone}</span>
                  </div>
                </div>
              </div>

              {/* Specialization - 2 columns */}
              <div className="col-span-2">
                <div className="flex items-center">
                  <FaStethoscope className="mr-2 text-blue-500" size={14} />
                  <span className="text-sm font-medium text-gray-900">
                    {doctor.specialization}
                  </span>
                </div>
              </div>

              {/* Status - 1 column */}
              <div className="col-span-1 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(doctor.isActive)}`}>
                    {getStatusText(doctor.isActive)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(doctor);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title={doctor.isActive ? 'Ngưng hoạt động' : 'Kích hoạt'}
                  >
                    {doctor.isActive ? (
                      <FaToggleOn className="text-green-500" size={20} />
                    ) : (
                      <FaToggleOff className="text-gray-400" size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Created Date - 2 columns */}
              <div className="col-span-2">
                <div className="text-sm text-gray-900">
                  {formatDate(doctor.createdAt)}
                </div>
                {doctor.updatedAt && doctor.updatedAt !== doctor.createdAt && (
                  <div className="text-xs text-gray-500">
                    Cập nhật: {formatDate(doctor.updatedAt)}
                  </div>
                )}
              </div>

              {/* Actions - 1 column */}
              <div className="col-span-1 text-center">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(doctor);
                    }}
                    className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-full hover:bg-blue-50"
                    title="Chỉnh sửa"
                  >
                    <FaEdit size={16} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(doctor);
                    }}
                    className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-50"
                    title="Xóa"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorList;