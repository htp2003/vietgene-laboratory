import React from "react";
import { Loader } from "lucide-react";

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

  return (
    <div className="flex justify-between">
      <button
        onClick={onPrevious}
        disabled={isFirstStep}
        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
          isFirstStep
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        ← Quay lại
      </button>

      {isLastStep ? (
        <button
          onClick={onSubmit}
          disabled={submitting || !canProceed}
          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            submitting || !canProceed
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {submitting && <Loader className="w-4 h-4 animate-spin" />}
          {submitting ? "Đang xử lý..." : "Hoàn tất đặt hàng"}
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            !canProceed
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          Tiếp tục →
        </button>
      )}
    </div>
  );
};
