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
  UserCheck,
  Truck,
  Package,
  TestTube,
  AlertCircle
} from 'lucide-react';

// ✅ Import shared types
import { Appointment, AppointmentCardProps } from '../../types/appointment';
import { Users } from 'lucide-react';
import { OrderParticipantsService, OrderParticipant } from '../../services/staffService/orderParticipantService';
import { useState, useEffect } from 'react';

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onViewDetails,
  onConfirm,
  onCancel,
  onUpdateStatus
}) => {

  const [participants, setParticipants] = useState<OrderParticipant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
  if (appointment.rawData?.order?.orderId) {
    loadParticipants(appointment.rawData.order.orderId);
  }
}, [appointment.id]);

  const loadParticipants = async (orderId: string) => {
  try {
    setLoadingParticipants(true);
    const participantsList = await OrderParticipantsService.getParticipantsByOrderIdCached(orderId);
    setParticipants(participantsList);
  } catch (error) {
    console.error('Error loading participants:', error);
  } finally {
    setLoadingParticipants(false);
  }
};

  
  // ✅ Define steps for different service types (same as modal)
  const getStepsConfig = (locationType: string) => {
    if (locationType === 'Tại nhà') {
      // Steps for home service
      return [
        { 
          key: 'Pending', 
          label: 'Đặt lịch', 
          icon: Calendar, 
          description: 'Khách hàng đặt lịch hẹn' 
        },
        { 
          key: 'DeliveringKit', 
          label: 'Giao kit', 
          icon: Truck, 
          description: 'Đang giao kit xét nghiệm' 
        },
        { 
          key: 'KitDelivered', 
          label: 'Đã giao kit', 
          icon: Package, 
          description: 'Kit đã được giao thành công' 
        },
        { 
          key: 'SampleReceived', 
          label: 'Nhận mẫu', 
          icon: TestTube, 
          description: 'Đã nhận mẫu từ khách hàng' 
        },
        { 
          key: 'Testing', 
          label: 'Xét nghiệm', 
          icon: AlertCircle, 
          description: 'Đang tiến hành xét nghiệm' 
        },
        { 
          key: 'Completed', 
          label: 'Hoàn thành', 
          icon: CheckCircle, 
          description: 'Có kết quả xét nghiệm' 
        }
      ];
    } else {
      // Steps for facility service
      return [
        { 
          key: 'Pending', 
          label: 'Đặt lịch', 
          icon: Calendar, 
          description: 'Khách hàng đặt lịch hẹn' 
        },
        { 
          key: 'Confirmed', 
          label: 'Check-in', 
          icon: User, 
          description: 'Khách hàng check-in tại cơ sở' 
        },
        { 
          key: 'SampleReceived', 
          label: 'Nhận mẫu', 
          icon: TestTube, 
          description: 'Thu thập mẫu xét nghiệm' 
        },
        { 
          key: 'Testing', 
          label: 'Xét nghiệm', 
          icon: AlertCircle, 
          description: 'Đang tiến hành xét nghiệm' 
        },
        { 
          key: 'Completed', 
          label: 'Hoàn thành', 
          icon: CheckCircle, 
          description: 'Có kết quả xét nghiệm' 
        }
      ];
    }
  };

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
        icon: Truck
      },
      'KitDelivered': { 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200', 
        label: 'Đã giao kit',
        icon: Package
      },
      'SampleReceived': { 
        color: 'bg-cyan-100 text-cyan-800 border-cyan-200', 
        label: 'Đã nhận mẫu',
        icon: TestTube
      },
      'Testing': { 
        color: 'bg-orange-100 text-orange-800 border-orange-200', 
        label: 'Đang xét nghiệm',
        icon: AlertCircle
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

  // Get next possible status for progression based on location type
  const getNextStatus = (currentStatus: string, locationType: string): string | null => {
    if (locationType === 'Tại nhà') {
      const homeStatusFlow = {
        'Pending': 'DeliveringKit',
        'DeliveringKit': 'KitDelivered',
        'KitDelivered': 'SampleReceived',
        'SampleReceived': 'Testing',
        'Testing': 'Completed'
      };
      return homeStatusFlow[currentStatus] || null;
    } else {
      const facilityStatusFlow = {
        'Pending': 'Confirmed',
        'Confirmed': 'SampleReceived',
        'SampleReceived': 'Testing',
        'Testing': 'Completed'
      };
      return facilityStatusFlow[currentStatus] || null;
    }
  };

  // ✅ Get appropriate step configuration based on location type
  const steps = getStepsConfig(appointment.locationType);
  const getCurrentStepIndex = () => {
    const index = steps.findIndex(step => step.key === appointment.status);
    return index >= 0 ? index : 0;
  };

  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;
  const nextStatus = getNextStatus(appointment.status, appointment.locationType);
  const currentStepIndex = getCurrentStepIndex();
  

  
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

      {participants.length > 0 && (
  <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      <Users className="w-4 h-4 text-indigo-600" />
      <span className="text-sm font-medium text-indigo-800">
        Người tham gia xét nghiệm ({participants.length})
      </span>
    </div>
    
    <div className="space-y-2">
      {participants.slice(0, 2).map((participant, index) => (
        <div key={participant.id} className="flex items-center justify-between text-sm">
          <div className="text-indigo-900">
            <span className="font-medium">{participant.participant_name}</span>
            {participant.age && (
              <span className="text-indigo-700"> ({participant.age} tuổi)</span>
            )}
          </div>
          <span className="text-indigo-600 text-xs px-2 py-1 bg-indigo-100 rounded">
            {OrderParticipantsService.getRelationshipDisplayText(participant.relationship)}
          </span>
        </div>
      ))}
      
      {participants.length > 2 && (
        <div className="text-xs text-indigo-600 font-medium">
          +{participants.length - 2} người khác
        </div>
      )}
    </div>
    
    {loadingParticipants && (
      <div className="text-xs text-indigo-600 italic">
        Đang tải thông tin người tham gia...
      </div>
    )}
  </div>
)}

      {/* ✅ Updated Progress Steps - using dynamic steps based on location type */}
      {appointment.status !== 'Pending' && appointment.status !== 'Cancelled' && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Tiến trình {appointment.locationType === 'Tại nhà' ? '(Tại nhà)' : '(Tại cơ sở)'}
          </p>
          
          {/* Compact progress stepper */}
          <div className="w-full">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0">
                <div 
                  className={`h-full transition-all duration-500 ${
                    appointment.locationType === 'Tại nhà'
                      ? 'bg-gradient-to-r from-blue-500 to-green-500'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500'
                  }`}
                  style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
                      ${isCompleted 
                        ? appointment.locationType === 'Tại nhà'
                          ? 'bg-green-500 text-white shadow-lg transform scale-110'
                          : 'bg-blue-500 text-white shadow-lg transform scale-110'
                        : isCurrent 
                          ? appointment.locationType === 'Tại nhà'
                            ? 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-100 transform scale-110'
                            : 'bg-purple-500 text-white shadow-lg ring-2 ring-purple-100 transform scale-110'
                          : 'bg-gray-200 text-gray-400'
                      }
                    `}>
                      <StepIcon className="w-3 h-3" />
                    </div>
                    
                    <div className="mt-1 text-center max-w-16">
                      <div className={`text-xs font-medium transition-colors duration-300 ${
                        isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </div>
                    </div>
                    
                    {/* Progress indicator dot */}
                    {(isCompleted || isCurrent) && (
                      <div className={`absolute -bottom-1 w-1 h-1 rounded-full ${
                        isCompleted 
                          ? appointment.locationType === 'Tại nhà' 
                            ? 'bg-green-500' 
                            : 'bg-blue-500'
                          : appointment.locationType === 'Tại nhà'
                            ? 'bg-blue-500'
                            : 'bg-purple-500'
                      } animate-pulse`} />
                    )}
                  </div>
                );
              })}
            </div>
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