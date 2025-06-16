import React from 'react';
import { Calendar, Clock, MapPin, User, Phone, CheckCircle, XCircle, AlertCircle, Truck, Package, TestTube } from 'lucide-react';

interface TestResult {
  id: string;
  appointmentId: string;
  resultType: 'Positive' | 'Negative' | 'Inconclusive';
  resultPercentage?: number;
  conclusion: string;
  resultDetails: string;
  resultFile?: File;
  testedDate: string;
  verifiedByStaffId: string;
}

interface Appointment {
  id: string;
  customerName: string;
  phone: string;
  date: string;
  time: string;
  serviceType: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'DeliveringKit' | 'KitDelivered' | 'SampleReceived' | 'Testing';
  locationType: 'Tại nhà' | 'Cơ sở y tế';
  legalType: 'Pháp Lý' | 'Dân Sự';
  address?: string;
  notes?: string;
  doctor?: string;
  testResult?: TestResult;
}

interface AppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (appointment: Appointment) => void;
  onCancel: (appointmentId: string) => void;
  onUpdateStatus: (appointmentId: string, newStatus: Appointment['status']) => void;
}

// Status configuration
const getStatusConfig = (status: string) => {
  const configs = {
    'Pending': { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: AlertCircle, text: 'Chờ xử lý' },
    'Confirmed': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle, text: 'Đã xác nhận' },
    'DeliveringKit': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck, text: 'Đang giao kit' },
    'KitDelivered': { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Package, text: 'Đã giao kit' },
    'SampleReceived': { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: TestTube, text: 'Đã nhận mẫu' },
    'Testing': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle, text: 'Đang xét nghiệm' },
    'Completed': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, text: 'Hoàn thành' },
    'Cancelled': { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, text: 'Đã hủy' },
  };
  return configs[status] || configs['Pending'];
};

// Date formatter
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Next step button logic
const getNextStepButton = (appointment: Appointment, onUpdateStatus: (id: string, status: Appointment['status']) => void) => {
  // Config cho xét nghiệm tại nhà
  const homeStepConfig = {
    'DeliveringKit': { 
      next: 'KitDelivered', 
      label: 'Xác nhận đã giao kit', 
      color: 'bg-indigo-500 hover:bg-indigo-600',
      icon: Package 
    },
    'KitDelivered': { 
      next: 'SampleReceived', 
      label: 'Xác nhận đã nhận mẫu', 
      color: 'bg-orange-500 hover:bg-orange-600',
      icon: TestTube 
    },
    'SampleReceived': { 
      next: 'Testing', 
      label: 'Bắt đầu xét nghiệm', 
      color: 'bg-yellow-500 hover:bg-yellow-600',
      icon: AlertCircle 
    },
    'Testing': { 
      next: 'Completed', 
      label: 'Hoàn thành xét nghiệm', 
      color: 'bg-green-500 hover:bg-green-600',
      icon: CheckCircle 
    }
  };

  // Config cho xét nghiệm tại cơ sở y tế
  const facilityStepConfig = {
    'Pending': { 
      next: 'Confirmed', 
      label: 'Check-in khách hàng', 
      color: 'bg-purple-500 hover:bg-purple-600',
      icon: User 
    },
    'Confirmed': { 
      next: 'SampleReceived', 
      label: 'Thu thập mẫu', 
      color: 'bg-orange-500 hover:bg-orange-600',
      icon: TestTube 
    },
    'SampleReceived': { 
      next: 'Testing', 
      label: 'Bắt đầu xét nghiệm', 
      color: 'bg-yellow-500 hover:bg-yellow-600',
      icon: AlertCircle 
    },
    'Testing': { 
      next: 'Completed', 
      label: 'Hoàn thành xét nghiệm', 
      color: 'bg-green-500 hover:bg-green-600',
      icon: CheckCircle 
    }
  };

  const stepConfig = appointment.locationType === 'Tại nhà' ? homeStepConfig : facilityStepConfig;
  const config = stepConfig[appointment.status];
  
  if (!config) return null;

  const Icon = config.icon;
  
  return (
    <button
      onClick={() => onUpdateStatus(appointment.id, config.next)}
      className={`px-3 py-1.5 ${config.color} text-white text-xs rounded-lg flex items-center gap-1 transition-colors font-medium`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </button>
  );
};

// Stepper Components (simplified for demo)
const HomeTestStepper: React.FC<{ status: string }> = ({ status }) => {
  const steps = [
    { key: 'Pending', label: 'Đặt lịch', icon: Calendar, description: 'Khách hàng đặt lịch hẹn' },
    { key: 'DeliveringKit', label: 'Giao kit', icon: Truck, description: 'Đang giao kit xét nghiệm' },
    { key: 'KitDelivered', label: 'Đã giao kit', icon: Package, description: 'Kit đã được giao thành công' },
    { key: 'SampleReceived', label: 'Nhận mẫu', icon: TestTube, description: 'Đã nhận mẫu từ khách hàng' },
    { key: 'Testing', label: 'Xét nghiệm', icon: AlertCircle, description: 'Đang tiến hành xét nghiệm' },
    { key: 'Completed', label: 'Hoàn thành', icon: CheckCircle, description: 'Có kết quả xét nghiệm' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === status);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 z-0">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
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
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
                ${isCompleted 
                  ? 'bg-green-500 text-white shadow-lg transform scale-110' 
                  : isCurrent 
                    ? 'bg-blue-500 text-white shadow-lg ring-4 ring-blue-100 transform scale-110' 
                    : 'bg-gray-200 text-gray-400'
                }
              `}>
                <StepIcon className="w-5 h-5" />
              </div>
              <div className="mt-2 text-center max-w-20">
                <div className={`text-xs font-medium transition-colors duration-300 ${
                  isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.label}
                </div>
                <div className={`text-xs mt-1 transition-colors duration-300 ${
                  isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                } hidden sm:block`}>
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="sm:hidden mt-4 text-center">
        <div className="text-sm font-medium text-gray-700">
          {steps[currentStepIndex]?.description}
        </div>
      </div>
    </div>
  );
};

const FacilityTestStepper: React.FC<{ status: string }> = ({ status }) => {
  const steps = [
    { key: 'Pending', label: 'Đặt lịch', icon: Calendar, description: 'Khách hàng đặt lịch hẹn' },
    { key: 'Confirmed', label: 'Check-in', icon: User, description: 'Khách hàng check-in tại cơ sở' },
    { key: 'SampleReceived', label: 'Nhận mẫu', icon: TestTube, description: 'Thu thập mẫu xét nghiệm' },
    { key: 'Testing', label: 'Xét nghiệm', icon: AlertCircle, description: 'Đang tiến hành xét nghiệm' },
    { key: 'Completed', label: 'Hoàn thành', icon: CheckCircle, description: 'Có kết quả xét nghiệm' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === status);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 z-0">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
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
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
                ${isCompleted 
                  ? 'bg-blue-500 text-white shadow-lg transform scale-110' 
                  : isCurrent 
                    ? 'bg-purple-500 text-white shadow-lg ring-4 ring-purple-100 transform scale-110' 
                    : 'bg-gray-200 text-gray-400'
                }
              `}>
                <StepIcon className="w-5 h-5" />
              </div>
              <div className="mt-2 text-center max-w-20">
                <div className={`text-xs font-medium transition-colors duration-300 ${
                  isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.label}
                </div>
                <div className={`text-xs mt-1 transition-colors duration-300 ${
                  isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                } hidden sm:block`}>
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="sm:hidden mt-4 text-center">
        <div className="text-sm font-medium text-gray-700">
          {steps[currentStepIndex]?.description}
        </div>
      </div>
    </div>
  );
};

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  onUpdateStatus
}) => {
  // Don't render if not open or no appointment
  if (!isOpen || !appointment) return null;

  const handleConfirmAndClose = () => {
    onConfirm(appointment);
    onClose();
  };

  const handleCancelAndClose = () => {
    onCancel(appointment.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50 pt-8 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Chi tiết lịch hẹn</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Mã lịch hẹn</label>
                <p className="text-gray-900">{appointment.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusConfig(appointment.status).color}`}>
                    {getStatusConfig(appointment.status).text}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Khách hàng</label>
                <p className="text-gray-900">{appointment.customerName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                <p className="text-gray-900">{appointment.phone}</p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày hẹn</label>
                <p className="text-gray-900">{formatDate(appointment.date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Giờ hẹn</label>
                <p className="text-gray-900">{appointment.time}</p>
              </div>
            </div>

            {/* Service Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Loại xét nghiệm</label>
                <p className="text-gray-900">{appointment.serviceType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Địa điểm</label>
                <p className="text-gray-900">{appointment.locationType}</p>
              </div>
            </div>

            {/* Legal Type */}
            <div>
              <label className="text-sm font-medium text-gray-500">Loại dịch vụ</label>
              <p className="text-gray-900">{appointment.legalType}</p>
            </div>

            {/* Address (for home tests) */}
            {appointment.address && (
              <div>
                <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                <p className="text-gray-900">{appointment.address}</p>
              </div>
            )}

            {/* Notes */}
            {appointment.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{appointment.notes}</p>
              </div>
            )}

            {/* Doctor (for facility tests) */}
            {appointment.locationType === 'Cơ sở y tế' && appointment.doctor && (
              <div>
                <label className="text-sm font-medium text-gray-500">Bác sĩ phụ trách</label>
                <p className="text-gray-900">{appointment.doctor}</p>
              </div>
            )}

            {/* Test Result Display */}
            {appointment.status === 'Completed' && appointment.testResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="text-sm font-semibold text-green-800">Kết quả xét nghiệm</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Loại kết quả</label>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                      appointment.testResult.resultType === 'Positive' 
                        ? 'bg-green-100 text-green-800'
                        : appointment.testResult.resultType === 'Negative'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.testResult.resultType === 'Positive' ? 'Dương tính' : 
                       appointment.testResult.resultType === 'Negative' ? 'Âm tính' : 'Không xác định'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ngày xét nghiệm</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(appointment.testResult.testedDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                {appointment.testResult.resultPercentage && (
                  <div className="mt-3">
                    <label className="text-sm font-medium text-gray-500">Tỷ lệ phần trăm</label>
                    <p className="text-gray-900 mt-1">{appointment.testResult.resultPercentage}%</p>
                  </div>
                )}
                <div className="mt-3">
                  <label className="text-sm font-medium text-gray-500">Kết luận</label>
                  <p className="text-gray-900 mt-1">{appointment.testResult.conclusion}</p>
                </div>
                <div className="mt-3">
                  <label className="text-sm font-medium text-gray-500">Chi tiết kết quả</label>
                  <p className="text-gray-900 mt-1 text-sm bg-white p-3 rounded border">
                    {appointment.testResult.resultDetails}
                  </p>
                </div>
              </div>
            )}

            {/* Progress Stepper */}
            {appointment.status !== 'Cancelled' && (
              <div className={`rounded-xl p-4 ${
                appointment.locationType === 'Tại nhà' 
                  ? 'bg-gradient-to-r from-blue-50 to-green-50' 
                  : 'bg-gradient-to-r from-purple-50 to-blue-50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Tiến trình xét nghiệm {appointment.locationType === 'Tại nhà' ? 'tại nhà' : 'tại cơ sở'}:
                  </h4>
                  {appointment.status !== 'Completed' && (
                    <div className="flex gap-2">
                      {getNextStepButton(appointment, onUpdateStatus)}
                    </div>
                  )}
                </div>
                {appointment.locationType === 'Tại nhà' ? (
                  <HomeTestStepper status={appointment.status} />
                ) : (
                  <FacilityTestStepper status={appointment.status} />
                )}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
            {appointment.status === 'Pending' && (
              <>
                <button
                  onClick={handleConfirmAndClose}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Xác nhận
                </button>
                <button
                  onClick={handleCancelAndClose}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Hủy lịch hẹn
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;