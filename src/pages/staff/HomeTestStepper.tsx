import React from 'react';
import { Calendar, Truck, Package, TestTube, AlertCircle, CheckCircle} from 'lucide-react';

interface HomeTestStepperProps {
    status: string;
    className?: string;
}

const HomeTestStepper: React.FC<HomeTestStepperProps> = ({ status, className = ''}) => {
    const steps = [
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
    const getCurrentStep = () => {
        const index =  steps.findIndex(step => step.key === status);
        return index >= 0 ? index : 0;
    };

    const currentStep = getCurrentStep();
    return (
        <div className={`w-full py-4 ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 z-0">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            style={{ width: `${(currentStep/ (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

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
              
              {/* Progress indicator dot */}
              {(isCompleted || isCurrent) && (
                <div className={`absolute -bottom-2 w-2 h-2 rounded-full ${
                  isCompleted ? 'bg-green-500' : 'bg-blue-500'
                } animate-pulse`} />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Current step description for mobile */}
      <div className="sm:hidden mt-4 text-center">
        <div className="text-sm font-medium text-gray-700">
          {steps[currentStep]?.description}
        </div>
      </div>
    </div>
    )
}

export default HomeTestStepper;