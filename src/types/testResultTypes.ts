// testResultTypes.ts - Simple types for API v16
import type {
  TestResultRequest,
  TestResultResponse,
} from "../services/testResultService";

// ✅ Re-export main interfaces
export type { TestResultRequest, TestResultResponse };

// ✅ Basic enums
export enum TestResultType {
  DNA_ANALYSIS = "DNA_ANALYSIS",
  PATERNITY = "PATERNITY",
  ANCESTRY = "ANCESTRY",
  HEALTH_SCREENING = "HEALTH_SCREENING",
}

export enum TestResultStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

// ✅ Display data interface
export interface TestResultDisplayData {
  id: string;
  type: string;
  typeLabel: string;
  percentage: string;
  percentageValue: number;
  conclusion: string;
  detail: string;
  testedDate: string;
  testedDateFormatted: string;
  hasFile: boolean;
  fileName?: string;
  samplesId: string;
  userId: string;
  orderId: string;
  status: string;
  statusColor: string;
}

// ✅ Summary interface
export interface TestResultSummary {
  total: number;
  completed: number;
  pending: number;
  failed: number;
}

// ✅ Simple constants
export const TEST_RESULT_TYPE_LABELS: Record<TestResultType, string> = {
  [TestResultType.DNA_ANALYSIS]: "Phân tích DNA",
  [TestResultType.PATERNITY]: "Xét nghiệm huyết thống",
  [TestResultType.ANCESTRY]: "Dòng tộc",
  [TestResultType.HEALTH_SCREENING]: "Sàng lọc sức khỏe",
};

export const TEST_RESULT_STATUS_COLORS: Record<TestResultStatus, string> = {
  [TestResultStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [TestResultStatus.COMPLETED]: "bg-green-100 text-green-800",
  [TestResultStatus.FAILED]: "bg-red-100 text-red-800",
};
