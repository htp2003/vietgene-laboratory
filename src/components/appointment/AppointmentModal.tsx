import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Stethoscope,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

// ✅ Updated imports - using new structure
import { Appointment } from '../../types/appointment';

// ✅ Updated interface for modal props
interface AppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (appointment: Appointment) => Promise<void>;
  onCancel: (appointmentId: string) => Promise<void>;
  onUpdateStatus: (appointmentId: string, newStatus: Appointment['status']) => Promise<void>;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  onUpdateStatus
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  if (!isOpen || !appointment) return null;

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

  // Get next possible status
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
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // HH:MM format
  };

  // Handle actions
  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      await onConfirm(appointment);
    } catch (error) {
      console.error('Error confirming appointment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsProcessing(true);
      await onCancel(appointment.id);
      setShowConfirmCancel(false);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusUpdate = async (newStatus: Appointment['status']) => {
    try {
      setIsProcessing(true);
      await onUpdateStatus(appointment.id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Lịch Hẹn</h2>
            <p className="text-sm text-gray-600 mt-1">ID: {appointment.id}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
              <StatusIcon className="w-4 h-4 inline mr-1" />
              {statusConfig.label}
            </span>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông Tin Khách Hàng
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <p className="text-gray-900 font-medium">{appointment.customerName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{appointment.phone}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{appointment.email}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại xét nghiệm</label>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  appointment.legalType === 'Pháp Lý' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {appointment.legalType}
                </span>
              </div>
            </div>

            {/* Address for home service */}
            {appointment.locationType === 'Tại nhà' && appointment.address && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ lấy mẫu</label>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <p className="text-gray-900">{appointment.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Appointment Details */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Chi Tiết Lịch Hẹn
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hẹn</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 font-medium">{formatDate(appointment.date)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 font-medium">{formatTime(appointment.time)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dịch vụ</label>
                <p className="text-gray-900 font-medium">{appointment.serviceName || appointment.serviceType}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{appointment.locationType}</p>
                </div>
              </div>
            </div>

            {/* Creation time */}
            {appointment.lastStatusUpdate && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cập nhật lần cuối</label>
                <p className="text-gray-600 text-sm">
                  {new Date(appointment.lastStatusUpdate).toLocaleString('vi-VN')}
                </p>
              </div>
            )}
          </div>

          {/* ✅ Updated Doctor Information - using doctorInfo instead of doctor */}
          {appointment.locationType === 'Cơ sở y tế' && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Thông Tin Bác Sĩ
              </h3>
              
              {appointment.doctorInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên bác sĩ</label>
                    <p className="text-gray-900 font-medium">{appointment.doctorInfo.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Khung giờ</label>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{appointment.doctorInfo.timeSlot}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày trong tuần</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{appointment.doctorInfo.dayOfWeek}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Đã phân công
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <UserCheck className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-amber-800 font-medium">Chưa phân công bác sĩ</p>
                    <p className="text-amber-700 text-sm">Cần phân công bác sĩ cho lịch hẹn tại cơ sở y tế</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress Timeline */}
          {appointment.currentStep && appointment.currentStep > 1 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tiến Trình Xét Nghiệm</h3>
              
              <div className="space-y-4">
                {[
                  { step: 1, label: 'Đặt lịch hẹn', icon: Calendar, desc: 'Khách hàng đặt lịch hẹn xét nghiệm' },
                  { step: 2, label: 'Xác nhận lịch hẹn', icon: CheckCircle, desc: 'Staff xác nhận lịch hẹn' },
                  { step: 3, label: 'Thu thập mẫu', icon: User, desc: 'Lấy mẫu từ khách hàng' },
                  { step: 4, label: 'Tiến hành xét nghiệm', icon: ArrowRight, desc: 'Mẫu đang được xét nghiệm' },
                  { step: 5, label: 'Hoàn thành', icon: CheckCircle, desc: 'Có kết quả xét nghiệm' }
                ].map(({ step, label, icon: StepIcon, desc }) => (
                  <div key={step} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step <= (appointment.currentStep || 1)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        step <= (appointment.currentStep || 1) ? 'text-blue-900' : 'text-gray-500'
                      }`}>
                        {label}
                      </p>
                      <p className="text-sm text-gray-600">{desc}</p>
                    </div>
                    {step === appointment.currentStep && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        Hiện tại
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Ghi Chú
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">{appointment.notes}</p>
            </div>
          )}

          {/* Legal Notice */}
          {appointment.legalType === 'Pháp Lý' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Lưu ý: Xét nghiệm pháp lý</p>
                <p>Đây là xét nghiệm có giá trị pháp lý. Cần đảm bảo tuân thủ đúng quy trình và thủ tục.</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>

          <div className="flex items-center gap-3">
            {/* Status progression button */}
            {nextStatus && appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
              <button
                onClick={() => handleStatusUpdate(nextStatus as Appointment['status'])}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
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
                onClick={handleConfirm}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Xác nhận lịch hẹn</span>
              </button>
            )}

            {/* Cancel button - for non-completed appointments */}
            {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
              <button
                onClick={() => setShowConfirmCancel(true)}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Hủy lịch hẹn</span>
              </button>
            )}
          </div>
        </div>

        {/* Confirm Cancel Modal */}
        {showConfirmCancel && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Xác nhận hủy lịch hẹn</h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn hủy lịch hẹn này? Hành động này không thể hoàn tác.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmCancel(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Không
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Đang hủy...' : 'Xác nhận hủy'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentModal;