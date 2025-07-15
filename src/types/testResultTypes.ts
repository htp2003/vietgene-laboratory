// testResultTypes.ts
// ✅ Additional types and enums for better type safety

export enum TestResultType {
  DNA_ANALYSIS = "DNA_ANALYSIS",
  GENETIC_SCREENING = "GENETIC_SCREENING",
  PATERNITY = "PATERNITY",
  ANCESTRY = "ANCESTRY",
  HEALTH_SCREENING = "HEALTH_SCREENING",
  PHARMACOGENOMICS = "PHARMACOGENOMICS",
  CARRIER_SCREENING = "CARRIER_SCREENING",
  CANCER_RISK = "CANCER_RISK",
  TRAIT_ANALYSIS = "TRAIT_ANALYSIS",
  NUTRITION = "NUTRITION",
  FITNESS = "FITNESS",
  WELLNESS = "WELLNESS",
}

export enum TestResultStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REVIEWED = "REVIEWED",
}

export interface TestResultSummary {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  byType: Record<TestResultType, number>;
}

export interface TestResultWithSample {
  testResult: TestResultResponse;
  sampleCode: string;
  sampleType: string;
  collectionDate: string;
  participantName?: string;
  participantRelationship?: string;
}

export interface TestResultFilter {
  userId?: string;
  sampleId?: string;
  resultType?: TestResultType;
  status?: TestResultStatus;
  dateFrom?: string;
  dateTo?: string;
  hasFile?: boolean;
}

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
  sampleId: string;
  userId: string;
  status: string;
  statusColor: string;
  icon: string;
}

// ✅ Re-export interfaces from service
export type {
  TestResultRequest,
  TestResultResponse,
} from "../services/testResultService";

// ✅ Constants for UI display
export const TEST_RESULT_TYPE_LABELS: Record<TestResultType, string> = {
  [TestResultType.DNA_ANALYSIS]: "Phân tích DNA",
  [TestResultType.GENETIC_SCREENING]: "Sàng lọc gen",
  [TestResultType.PATERNITY]: "Xét nghiệm huyết thống",
  [TestResultType.ANCESTRY]: "Dòng tộc",
  [TestResultType.HEALTH_SCREENING]: "Sàng lọc sức khỏe",
  [TestResultType.PHARMACOGENOMICS]: "Dược lý gen",
  [TestResultType.CARRIER_SCREENING]: "Sàng lọc mang gen",
  [TestResultType.CANCER_RISK]: "Nguy cơ ung thư",
  [TestResultType.TRAIT_ANALYSIS]: "Phân tích đặc điểm",
  [TestResultType.NUTRITION]: "Dinh dưỡng",
  [TestResultType.FITNESS]: "Thể lực",
  [TestResultType.WELLNESS]: "Sức khỏe tổng quát",
};

export const TEST_RESULT_STATUS_LABELS: Record<TestResultStatus, string> = {
  [TestResultStatus.PENDING]: "Chờ xử lý",
  [TestResultStatus.IN_PROGRESS]: "Đang xử lý",
  [TestResultStatus.COMPLETED]: "Hoàn thành",
  [TestResultStatus.FAILED]: "Thất bại",
  [TestResultStatus.CANCELLED]: "Đã hủy",
  [TestResultStatus.REVIEWED]: "Đã xem xét",
};

export const TEST_RESULT_STATUS_COLORS: Record<TestResultStatus, string> = {
  [TestResultStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [TestResultStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [TestResultStatus.COMPLETED]: "bg-green-100 text-green-800",
  [TestResultStatus.FAILED]: "bg-red-100 text-red-800",
  [TestResultStatus.CANCELLED]: "bg-gray-100 text-gray-800",
  [TestResultStatus.REVIEWED]: "bg-purple-100 text-purple-800",
};

export const TEST_RESULT_TYPE_ICONS: Record<TestResultType, string> = {
  [TestResultType.DNA_ANALYSIS]: "🧬",
  [TestResultType.GENETIC_SCREENING]: "🔬",
  [TestResultType.PATERNITY]: "👨‍👩‍👧‍👦",
  [TestResultType.ANCESTRY]: "🌳",
  [TestResultType.HEALTH_SCREENING]: "🏥",
  [TestResultType.PHARMACOGENOMICS]: "💊",
  [TestResultType.CARRIER_SCREENING]: "🔍",
  [TestResultType.CANCER_RISK]: "⚠️",
  [TestResultType.TRAIT_ANALYSIS]: "📊",
  [TestResultType.NUTRITION]: "🥗",
  [TestResultType.FITNESS]: "💪",
  [TestResultType.WELLNESS]: "✨",
};
