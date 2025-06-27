import React from 'react';
import { 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Eye, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Stethoscope,
  UserCheck
} from 'lucide-react';

// ✅ Import shared types
import { Appointment, AppointmentCardProps } from '../../types/appointment';

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onViewDetails,
  onConfirm,
  onCancel,
  onUpdateStatus
}) => {
  
  // Status configuration
  const getStatusConfig = (status: string) => {
    const configs = {
      'Pending': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        label: 'Chờ xử lý',
        icon: Clock
      },
      'Confirmed': { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        label: 'Đã xác nhận',
        icon: CheckCircle
      },
      'DeliveringKit': { 
        color: 'bg-purple-100 text-purple-800 border-purple-200', 
        label: 'Đang giao kit',
        icon: ArrowRight
      },
      'KitDelivered': { 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200', 
        label: 'Đã giao kit',
        icon: CheckCircle
      },
      'SampleReceived': { 
        color: 'bg-cyan-100 text-cyan-800 border-cyan-200', 
        label: 'Đã nhận mẫu',
        icon: CheckCircle
      },
      'Testing': { 
        color: 'bg-orange-100 text-orange-800 border-orange-200', 
        label: 'Đang xét nghiệm',
        icon: ArrowRight
      },
      'Completed': { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        label: 'Hoàn thành',
        icon: CheckCircle
      },
      'Cancelled': { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        label: 'Đã hủy',
        icon: XCircle
      }
    };
    return configs[status] || configs['Pending'];
  };

  // Get next possible status for progression
  const getNextStatus = (currentStatus: string, locationType: string): string | null => {
    const statusFlow = {
      'Pending': locationType === 'Tại nhà' ? 'DeliveringKit' : 'Confirmed',
      'Confirmed': 'SampleReceived',
      'DeliveringKit': 'KitDelivered',
      'KitDelivered': 'SampleReceived',
      'SampleReceived': 'Testing',
      'Testing': 'Completed'
    };
    return statusFlow[currentStatus] || null;
  };

  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;
  const nextStatus = getNextStatus(appointment.status, appointment.locationType);

  // Format date and time
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // HH:MM format
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {appointment.customerName}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
              <StatusIcon className="w-3 h-3 inline mr-1" />
              {statusConfig.label}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(appointment.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(appointment.time)}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">ID: {appointment.id.substring(0, 8)}...</p>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            appointment.legalType === 'Pháp Lý' 
              ? 'bg-red-100 text-red-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {appointment.legalType}
          </span>
        </div>
      </div>

      {/* Service and Location Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Dịch vụ</p>
          <p className="text-sm text-gray-600">{appointment.serviceName || appointment.serviceType}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Địa điểm</p>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{appointment.locationType}</span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{appointment.phone}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span>{appointment.email}</span>
        </div>
      </div>

      {/* ✅ Doctor Information - only show for facility-based appointments */}
      {appointment.locationType === 'Cơ sở y tế' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Bác sĩ phụ trách</span>
          </div>
          
          {appointment.doctorInfo ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">{appointment.doctorInfo.name}</p>
                <p className="text-sm font-medium text-blue-900">
                  {appointment.doctorInfo.timeSlot} - {appointment.doctorInfo.dayOfWeek}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <UserCheck className="w-4 h-4" />
              <span>Chưa phân công bác sĩ</span>
            </div>
          )}
        </div>
      )}

      {/* Address for home service */}
      {appointment.locationType === 'Tại nhà' && appointment.address && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-1">Địa chỉ lấy mẫu</p>
          <p className="text-sm text-gray-600">{appointment.address}</p>
        </div>
      )}

      {/* Notes */}
      {appointment.notes && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-1">Ghi chú</p>
          <p className="text-sm text-gray-600">{appointment.notes}</p>
        </div>
      )}

      {/* ✅ Progress Steps - only show for confirmed appointments */}
      {appointment.currentStep && appointment.currentStep > 1 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Tiến trình</p>
          <div className="flex items-center gap-2">
            {[
              { step: 1, label: 'Đặt lịch', icon: Calendar },
              { step: 2, label: 'Xác nhận', icon: CheckCircle },
              { step: 3, label: 'Lấy mẫu', icon: User },
              { step: 4, label: 'Xét nghiệm', icon: ArrowRight },
              { step: 5, label: 'Hoàn thành', icon: CheckCircle }
            ].map(({ step, label, icon: StepIcon }) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step <= (appointment.currentStep || 1)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  <StepIcon className="w-4 h-4" />
                </div>
                <span className="text-xs text-gray-600 ml-1 mr-2">{label}</span>
                {step < 5 && <ArrowRight className="w-3 h-3 text-gray-400" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={() => onViewDetails(appointment)}
          className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">Chi tiết</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Status progression button */}
          {nextStatus && appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
            <button
              onClick={() => onUpdateStatus(appointment.id, nextStatus as Appointment['status'])}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
            >
              <ArrowRight className="w-4 h-4" />
              <span>
                {nextStatus === 'DeliveringKit' && 'Giao kit'}
                {nextStatus === 'Confirmed' && 'Xác nhận'}
                {nextStatus === 'KitDelivered' && 'Đã giao kit'}
                {nextStatus === 'SampleReceived' && 'Đã nhận mẫu'}
                {nextStatus === 'Testing' && 'Bắt đầu XN'}
                {nextStatus === 'Completed' && 'Hoàn thành'}
              </span>
            </button>
          )}

          {/* Confirm button - only for pending appointments */}
          {appointment.status === 'Pending' && (
            <button
              onClick={() => onConfirm(appointment)}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Xác nhận</span>
            </button>
          )}

          {/* Cancel button - for non-completed appointments */}
          {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
            >
              <XCircle className="w-4 h-4" />
              <span>Hủy</span>
            </button>
          )}
        </div>
      </div>

      {/* ✅ Last update timestamp */}
      {appointment.lastStatusUpdate && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Cập nhật lần cuối: {new Date(appointment.lastStatusUpdate).toLocaleString('vi-VN')}
          </p>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;