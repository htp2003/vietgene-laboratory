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

// ✅ Updated interface to include sample creation handler
interface UpdatedAppointmentCardProps extends AppointmentCardProps {
  onCreateSamples: (appointment: Appointment) => void;
  onUpdateStatus: (
    appointmentId: string, 
    newStatus: Appointment['status'], 
    triggerElement?: HTMLElement
  ) => void;
}

const AppointmentCard: React.FC<UpdatedAppointmentCardProps> = ({
  appointment,
  onViewDetails,
  onConfirm,
  onCancel,
  onUpdateStatus,
  onCreateSamples
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

  // ✅ FIXED: Comprehensive status mapping function
  const mapApiStatusToCode = (apiStatus: string): string => {
    // Map từ status hiển thị (tiếng Việt) sang status code (tiếng Anh)
    const statusMapping = {
      "Chờ xử lý": "Pending",
      "Đã xác nhận": "Confirmed", 
      "Đang giao kit": "DeliveringKit",
      "Đã giao kit": "KitDelivered",
      "Đã nhận mẫu": "SampleReceived",
      "Đang xét nghiệm": "Testing",
      "Đang thực hiện": "Testing", // ✅ FIXED: Both map to Testing
      "Hoàn thành": "Completed",   // ✅ FIXED: Properly mapped
      "Đã hủy": "Cancelled"
    };
    
    // If direct mapping exists, use it
    if (statusMapping[apiStatus]) {
      return statusMapping[apiStatus];
    }
    
    // If no mapping found, assume it's already in English format
    return apiStatus;
  };
  
  // ✅ FIXED: Define steps for different service types with proper flow
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
      // ✅ FIXED: Steps for facility service - MUST include Pending -> Confirmed flow
      return [
        { 
          key: 'Pending', 
          label: 'Đặt lịch', 
          icon: Calendar, 
          description: 'Khách hàng đặt lịch hẹn - CẦN XÁC NHẬN' 
        },
        { 
          key: 'Confirmed', 
          label: 'Đã xác nhận', 
          icon: UserCheck, 
          description: 'Lịch hẹn đã được xác nhận - Chờ check-in' 
        },
        { 
          key: 'SampleReceived', 
          label: 'Nhận mẫu', 
          icon: TestTube, 
          description: 'Thu thập mẫu xét nghiệm tại cơ sở' 
        },
        { 
          key: 'Testing', 
          label: 'Đang xét nghiệm', 
          icon: AlertCircle, 
          description: 'Đang tiến hành xét nghiệm' 
        },
        { 
          key: 'Completed', 
          label: 'Hoàn thành', 
          icon: CheckCircle, 
          description: 'Đã có kết quả xét nghiệm' 
        }
      ];
    }
  };

  // ✅ FIXED: Status configuration with proper mapping
  const getStatusConfig = (status: string) => {
    const mappedStatus = mapApiStatusToCode(status);
    
    const configs = {
      'Pending': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        label: 'Chờ xử lý',
        icon: Clock
      },
      'Confirmed': { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        label: 'Đã xác nhận',
        icon: UserCheck
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
        label: 'Đang xét nghiệm', // ✅ FIXED: Consistent label
        icon: AlertCircle
      },
      'Completed': { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        label: 'Hoàn thành', // ✅ FIXED: Properly shows completed
        icon: CheckCircle
      },
      'Cancelled': { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        label: 'Đã hủy',
        icon: XCircle
      }
    };
    return configs[mappedStatus] || configs['Pending'];
  };

  // ✅ FIXED: Proper next status flow for both service types
  const getNextStatus = (currentStatus: string, locationType: string): string | null => {
    const mappedStatus = mapApiStatusToCode(currentStatus);
    
    if (locationType === 'Tại nhà') {
      const homeStatusFlow = {
        'Pending': 'DeliveringKit',
        'DeliveringKit': 'KitDelivered', 
        'KitDelivered': 'SampleReceived',
        'SampleReceived': 'Testing',
        'Testing': 'Completed',
        // ✅ FIXED: Remove auto-progression from Confirmed to DeliveringKit for home service
      };
      return homeStatusFlow[mappedStatus] || null;
    } else {
      // ✅ FIXED: Proper facility flow - MUST go through Confirmed step
      const facilityStatusFlow = {
        'Pending': 'Confirmed',        // ✅ MUST be confirmed first
        'Confirmed': 'SampleReceived', // ✅ After confirmation, can proceed to sample collection
        'SampleReceived': 'Testing',
        'Testing': 'Completed',
        // ✅ FIXED: Remove invalid transitions
      };
      return facilityStatusFlow[mappedStatus] || null;
    }
  };

  // ✅ FIXED: Remove problematic normalization function that was causing auto-acceptance
  // const normalizeStatusForLocationType = (status: string, locationType: string): string => {
  //   // This function was causing the auto-acceptance issue - removed
  //   return mapApiStatusToCode(status);
  // };

  // ✅ Updated handler for step progression
  const handleStepProgression = (
    appointment: Appointment, 
    nextStatus: string, 
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    // ✅ Special handling for SampleReceived step - trigger sample creation
    if (nextStatus === 'SampleReceived') {
      console.log('🧪 Triggering sample creation for appointment:', appointment.id);
      onCreateSamples(appointment);
      return;
    }
    
    // ✅ For other statuses, pass the trigger element
    onUpdateStatus(
      appointment.id, 
      nextStatus as Appointment['status'], 
      event.currentTarget
    );
  };

  // ✅ Get appropriate step configuration based on location type
  const steps = getStepsConfig(appointment.locationType);
  
  // ✅ FIXED: Proper current step calculation
  const getCurrentStepIndex = () => {
    const mappedStatus = mapApiStatusToCode(appointment.status);
    
    console.log("🔍 Debug status:", {
      originalStatus: appointment.status,
      mappedStatus: mappedStatus,
      locationType: appointment.locationType,
      availableSteps: steps.map(s => s.key)
    });
    
    const index = steps.findIndex(step => step.key === mappedStatus);
    return index >= 0 ? index : 0;
  };

  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;
  
  // ✅ FIXED: Use mapped status directly instead of normalization
  const mappedStatus = mapApiStatusToCode(appointment.status);
  const nextStatus = getNextStatus(mappedStatus, appointment.locationType);
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

      {/* ✅ FIXED: Emphasize confirmation requirement for facility appointments */}
      {appointment.locationType === 'Cơ sở y tế' && mappedStatus === 'Pending' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Yêu cầu xác nhận</span>
          </div>
          <p className="text-sm text-yellow-700">
            Lịch hẹn tại cơ sở y tế cần được xác nhận trước khi khách hàng đến. 
            Vui lòng nhấn "Xác nhận" để xử lý lịch hẹn này.
          </p>
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

      {/* ✅ FIXED: Updated Progress Steps with proper status handling */}
      {(appointment.locationType === 'Tại nhà' || appointment.locationType === 'Cơ sở y tế') && 
       mappedStatus !== 'Pending' && mappedStatus !== 'Cancelled' && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Tiến trình {appointment.locationType === 'Tại nhà' ? '(Tại nhà)' : '(Tại cơ sở)'}
          </p>
          
          <div className="w-full">
            <div className="space-y-3">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isPending = index > currentStepIndex;

                return (
                  <div key={step.key} className="flex items-center gap-3">
                    {/* Step Circle */}
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm flex-shrink-0
                      ${isCompleted 
                        ? appointment.locationType === 'Tại nhà'
                          ? 'bg-green-500 text-white shadow-lg' 
                          : 'bg-blue-500 text-white shadow-lg'
                        : isCurrent 
                          ? appointment.locationType === 'Tại nhà'
                            ? 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-100' 
                            : 'bg-purple-500 text-white shadow-lg ring-2 ring-purple-100'
                          : 'bg-gray-200 text-gray-400'
                      }
                    `}>
                      <StepIcon className="w-4 h-4" />
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`text-sm font-medium transition-colors duration-300 ${
                            isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </h4>
                          <p className={`text-xs mt-1 transition-colors duration-300 ${
                            isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {step.description}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.locationType === 'Tại nhà'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Hoàn thành
                            </span>
                          )}
                          {isCurrent && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.locationType === 'Tại nhà'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              <Clock className="w-3 h-3 mr-1" />
                              {/* ✅ FIXED: Show correct status for current step */}
                              {step.key === 'Completed' ? 'Hoàn thành' : 'Đang thực hiện'}
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              Chờ thực hiện
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Estimated time/info for current step */}
                      {isCurrent && (
                        <div className={`mt-2 p-2 rounded text-xs ${
                          appointment.locationType === 'Tại nhà'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}>
                          {/* Home service timing */}
                          {appointment.locationType === 'Tại nhà' && (
                            <>
                              {step.key === 'DeliveringKit' && '⏱️ Thời gian dự kiến: 1-2 ngày'}
                              {step.key === 'KitDelivered' && '📦 Vui lòng kiểm tra kit và làm theo hướng dẫn'}
                              {step.key === 'SampleReceived' && '🧪 Mẫu sẽ được xử lý trong 1-2 ngày làm việc'}
                              {step.key === 'Testing' && '🔬 Thời gian xét nghiệm: 3-5 ngày làm việc'}
                              {step.key === 'Completed' && '✅ Kết quả đã sẵn sàng'}
                            </>
                          )}
                          
                          {/* Facility service timing */}
                          {appointment.locationType === 'Cơ sở y tế' && (
                            <>
                              {step.key === 'Confirmed' && '🏥 Vui lòng đến cơ sở y tế đúng giờ hẹn'}
                              {step.key === 'SampleReceived' && '🧪 Mẫu sẽ được xử lý ngay sau khi thu thập'}
                              {step.key === 'Testing' && '🔬 Thời gian xét nghiệm: 3-5 ngày làm việc'}
                              {step.key === 'Completed' && '✅ Kết quả đã sẵn sàng'}
                            </>
                          )}
                        </div>
                      )}
                    </div>
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
          {/* ✅ FIXED: Proper status progression logic */}
          {(() => {
            // ✅ For Pending status - ALWAYS show Confirm button for ALL appointment types
            if (mappedStatus === 'Pending') {
              return (
                <button
                  onClick={() => onConfirm(appointment)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors text-sm font-medium shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Xác nhận</span>
                </button>
              );
            }
            
            // For other statuses with next step - show progression button
            if (nextStatus && mappedStatus !== 'Cancelled' && mappedStatus !== 'Completed') {
              const getNextStepLabel = (status: string) => {
                const labels = {
                  'DeliveringKit': 'Giao kit',
                  'Confirmed': 'Xác nhận', // ✅ FIXED: Proper label for facility confirmation
                  'KitDelivered': 'Đã giao kit', 
                  'SampleReceived': 'Nhận mẫu',
                  'Testing': 'Bắt đầu XN',
                  'Completed': 'Hoàn thành'
                };
                return labels[status] || 'Tiếp theo';
              };

              return (
                <button
                  onClick={(event) => handleStepProgression(appointment, nextStatus, event)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium shadow-sm"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>{getNextStepLabel(nextStatus)}</span>
                </button>
              );
            }

            // ✅ FIXED: For completed status - show proper completion indicator
            if (mappedStatus === 'Completed') {
              return (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Đã hoàn thành</span>
                </div>
              );
            }

            // For cancelled status - show cancellation indicator  
            if (mappedStatus === 'Cancelled') {
              return (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                  <XCircle className="w-4 h-4" />
                  <span>Đã hủy</span>
                </div>
              );
            }

            return null;
          })()}

          {/* Cancel button - for non-completed appointments */}
          {mappedStatus !== 'Cancelled' && mappedStatus !== 'Completed' && (
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