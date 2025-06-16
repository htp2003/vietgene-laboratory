import React from 'react';
import { Calendar, User, TestTube, AlertCircle, CheckCircle } from 'lucide-react';

interface FacilityTestStepperProps {
  status: string;
  className?: string;
}

const FacilityTestStepper: React.FC<FacilityTestStepperProps> = ({ status, className = '' }) => {
  const steps = [
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

  const getCurrentStepIndex = () => {
    const index = steps.findIndex(step => step.key === status);
    return index >= 0 ? index : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className={`w-full py-4 ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
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
              
              {/* Progress indicator dot */}
              {(isCompleted || isCurrent) && (
                <div className={`absolute -bottom-2 w-2 h-2 rounded-full ${
                  isCompleted ? 'bg-blue-500' : 'bg-purple-500'
                } animate-pulse`} />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Current step description for mobile */}
      <div className="sm:hidden mt-4 text-center">
        <div className="text-sm font-medium text-gray-700">
          {steps[currentStepIndex]?.description}
        </div>
      </div>
    </div>
  );
};

export default FacilityTestStepper;