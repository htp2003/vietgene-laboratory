import React from "react";
import {
  Loader,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CreditCard,
} from "lucide-react";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  canProceed: boolean;
  submitting: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  canProceed,
  submitting,
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  // ✅ Dynamic button text based on step
  const getNextButtonText = () => {
    switch (currentStep) {
      case 1:
        return "Tiếp tục: Thông tin người tham gia";
      case 2:
        return "Tiếp tục: Phương thức lấy mẫu";
      case 3:
        return "Tiếp tục: Thanh toán";
      default:
        return "Tiếp tục";
    }
  };

  const getSubmitButtonText = () => {
    if (submitting) return "Đang tạo đơn hàng...";
    return "Hoàn tất đặt hàng";
  };

  return (
    <div className="flex justify-between items-center">
      {/* ✅ Previous Button - Enhanced */}
      <button
        onClick={onPrevious}
        disabled={isFirstStep || submitting}
        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
          isFirstStep || submitting
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md transform hover:-translate-x-1"
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </button>

      {/* ✅ Step Progress Indicator */}
      <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
        <span className="font-medium text-red-600">{currentStep}</span>
        <span>/</span>
        <span>{totalSteps}</span>
        <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
          <div
            className="bg-red-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* ✅ Next/Submit Button - Enhanced */}
      {isLastStep ? (
        <button
          onClick={onSubmit}
          disabled={submitting || !canProceed}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 min-w-[200px] justify-center ${
            submitting || !canProceed
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
          }`}
        >
          {submitting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              {getSubmitButtonText()}
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              {getSubmitButtonText()}
            </>
          )}
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={!canProceed || submitting}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
            !canProceed || submitting
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg transform hover:translate-x-1"
          }`}
        >
          <span className="hidden sm:block">{getNextButtonText()}</span>
          <span className="sm:hidden">Tiếp tục</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
