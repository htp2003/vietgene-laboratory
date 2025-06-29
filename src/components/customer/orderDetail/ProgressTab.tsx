import React from "react";
import { CheckCircle, RefreshCw } from "lucide-react";
import { formatDateTime } from "../../../utils/orderDetailUtils";

interface TrackingStep {
  step: number;
  title: string;
  status: "completed" | "current" | "pending";
  date?: string;
  description: string;
}

interface ProgressTabProps {
  trackingSteps: TrackingStep[];
}

export const ProgressTab: React.FC<ProgressTabProps> = ({ trackingSteps }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Tiến trình xử lý đơn hàng
      </h3>

      <div className="space-y-6">
        {trackingSteps.map((step, index) => (
          <div key={index} className="flex gap-4">
            {/* Step Icon */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step.status === "completed"
                  ? "bg-green-500 border-green-500 text-white"
                  : step.status === "current"
                  ? "bg-red-600 border-red-600 text-white animate-pulse"
                  : "border-gray-300 text-gray-400 bg-white"
              }`}
            >
              {step.status === "completed" ? (
                <CheckCircle className="w-5 h-5" />
              ) : step.status === "current" ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <span className="text-sm font-semibold">{step.step}</span>
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4
                  className={`font-semibold ${
                    step.status === "completed" || step.status === "current"
                      ? "text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </h4>
                {step.date && (
                  <span className="text-sm text-gray-500">
                    {formatDateTime(step.date)}
                  </span>
                )}
              </div>

              <p
                className={`text-sm ${
                  step.status === "completed" || step.status === "current"
                    ? "text-gray-600"
                    : "text-gray-400"
                }`}
              >
                {step.description}
              </p>

              {step.status === "current" && (
                <div className="mt-2 flex items-center gap-2 text-red-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Đang xử lý...</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
