// Export existing services
export { orderService } from "./orderService";
export { ServiceService } from "./serviceService";

// Export new payment service
export { paymentService } from "./paymentService";
export type {
  VietQRRequest,
  VietQRResponse,
  PaymentInfo,
  PaymentStatus,
} from "./paymentService";
// index.ts - Test Results Module Exports

// ✅ Main Service
export {
  TestResultService,
  testResultService as default,
  type TestResultRequest,
  type TestResultResponse,
} from "./testResultService";

// ✅ Types and Constants
export {
  TestResultType,
  TestResultStatus,
  TEST_RESULT_TYPE_LABELS,
  TEST_RESULT_STATUS_LABELS,
  TEST_RESULT_STATUS_COLORS,
  TEST_RESULT_TYPE_ICONS,
  type TestResultSummary,
  type TestResultWithSample,
  type TestResultFilter,
  type TestResultDisplayData,
} from "../types/testResultTypes";

// ✅ React Hooks
export {
  useTestResults,
  useTestResult,
  useCurrentUserTestResults,
} from "../hooks/useTestResults";

// ✅ React Component
export { default as TestResultsSection } from "../components/customer/orderDetail/TestResultsSection";

// ✅ Utility functions
export const testResultUtils = {
  /**
   * Format test result percentage for display
   */
  formatPercentage: (
    percentage: string
  ): { value: number; color: string; label: string } => {
    const value = parseFloat(percentage) || 0;

    if (value >= 95) {
      return { value, color: "text-green-600", label: "Rất cao" };
    } else if (value >= 80) {
      return { value, color: "text-blue-600", label: "Cao" };
    } else if (value >= 60) {
      return { value, color: "text-yellow-600", label: "Trung bình" };
    } else if (value >= 40) {
      return { value, color: "text-orange-600", label: "Thấp" };
    } else {
      return { value, color: "text-red-600", label: "Rất thấp" };
    }
  },

  /**
   * Format date for Vietnamese locale
   */
  formatDate: (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  },

  /**
   * Get test result status color classes
   */
  getStatusColor: (percentage: string): string => {
    const value = parseFloat(percentage) || 0;

    if (value >= 95) return "bg-green-100 text-green-800 border-green-200";
    if (value >= 80) return "bg-blue-100 text-blue-800 border-blue-200";
    if (value >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (value >= 40) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  },

  /**
   * Check if test result has file available
   */
  hasDownloadableFile: (result: TestResultResponse): boolean => {
    return !!(result.result_file && result.result_file.trim());
  },

  /**
   * Generate download filename
   */
  generateFileName: (result: TestResultResponse): string => {
    const dateStr = new Date(result.tested_date).toISOString().split("T")[0];
    const type = result.result_type.toLowerCase().replace(/[^a-z0-9]/g, "_");
    return `test_result_${type}_${dateStr}_${result.id.slice(-8)}.pdf`;
  },
};
