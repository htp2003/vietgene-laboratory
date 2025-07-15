import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  FileDown,
  Info,
  RefreshCw,
} from "lucide-react";
import { useTestResults } from "../../../hooks/useTestResults";
import { testResultService } from "../../../services/testResultService";
import {
  TestResultDisplayData,
  TestResultType,
  TEST_RESULT_TYPE_LABELS,
  TEST_RESULT_TYPE_ICONS,
} from "../../../types/testResultTypes";

interface TestResultsSectionProps {
  sampleIds?: string[];
  userId?: string;
  showSummary?: boolean;
  maxResults?: number;
  className?: string;
}

export const TestResultsSection: React.FC<TestResultsSectionProps> = ({
  sampleIds = [],
  userId,
  showSummary = true,
  maxResults,
  className = "",
}) => {
  const [selectedSampleId, setSelectedSampleId] = useState<string>("");
  const [expandedResults, setExpandedResults] = useState<Set<string>>(
    new Set()
  );

  // Use the hook to manage test results
  const {
    testResults,
    loading,
    error,
    summary,
    displayData,
    hasTestResults,
    refreshTestResults,
    clearError,
  } = useTestResults(userId, !!userId);

  // ✅ Filter results by sample IDs if provided
  const filteredDisplayData = React.useMemo(() => {
    let filtered = displayData;

    if (sampleIds.length > 0) {
      filtered = displayData.filter((result) =>
        sampleIds.includes(result.sampleId)
      );
    }

    if (selectedSampleId) {
      filtered = filtered.filter(
        (result) => result.sampleId === selectedSampleId
      );
    }

    if (maxResults) {
      filtered = filtered.slice(0, maxResults);
    }

    return filtered;
  }, [displayData, sampleIds, selectedSampleId, maxResults]);

  // ✅ Get unique sample IDs for filter
  const uniqueSampleIds = React.useMemo(() => {
    const ids =
      sampleIds.length > 0 ? sampleIds : displayData.map((d) => d.sampleId);
    return [...new Set(ids)];
  }, [sampleIds, displayData]);

  // ✅ Toggle expanded state
  const toggleExpanded = (resultId: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(resultId)) {
      newExpanded.delete(resultId);
    } else {
      newExpanded.add(resultId);
    }
    setExpandedResults(newExpanded);
  };

  // ✅ Download file handler
  const handleDownloadFile = async (result: TestResultDisplayData) => {
    try {
      const testResult = testResults.find((tr) => tr.id === result.id);
      if (testResult) {
        await testResultService.downloadTestResultFile(testResult);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Không thể tải xuống file. Vui lòng thử lại sau.");
    }
  };

  // ✅ Format percentage display
  const formatPercentage = (
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
  };

  // ✅ Show loading state
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Kết quả xét nghiệm
          </h4>
          <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
        </div>

        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-24 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="w-full h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ✅ Show error state
  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Kết quả xét nghiệm
          </h4>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h5 className="text-lg font-medium text-red-800 mb-2">
            Lỗi tải dữ liệu
          </h5>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              clearError();
              refreshTestResults();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // ✅ Show empty state
  if (!hasTestResults && !loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Kết quả xét nghiệm
          </h4>
          <button
            onClick={refreshTestResults}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h5 className="text-lg font-medium text-gray-700 mb-2">
            Chưa có kết quả xét nghiệm
          </h5>
          <p className="text-gray-500 text-sm mb-4">
            Kết quả sẽ xuất hiện sau khi quá trình phân tích hoàn tất
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              💡 <strong>Thời gian dự kiến:</strong> 7-14 ngày làm việc sau khi
              lab nhận mẫu
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Kết quả xét nghiệm
        </h4>
        <div className="flex items-center gap-3">
          {/* Sample Filter */}
          {uniqueSampleIds.length > 1 && (
            <select
              value={selectedSampleId}
              onChange={(e) => setSelectedSampleId(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Tất cả mẫu</option>
              {uniqueSampleIds.map((sampleId) => (
                <option key={sampleId} value={sampleId}>
                  Mẫu {sampleId.slice(-8)}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={refreshTestResults}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {showSummary && summary && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {summary.total}
                </p>
                <p className="text-sm text-blue-600">Tổng kết quả</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {summary.completed}
                </p>
                <p className="text-sm text-green-600">Đã hoàn thành</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-700">
                  {summary.pending}
                </p>
                <p className="text-sm text-yellow-600">Đang xử lý</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-700">
                  {summary.total > 0
                    ? Math.round((summary.completed / summary.total) * 100)
                    : 0}
                  %
                </p>
                <p className="text-sm text-purple-600">Tỷ lệ hoàn thành</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Results List */}
      <div className="space-y-4">
        {filteredDisplayData.map((result) => {
          const isExpanded = expandedResults.has(result.id);
          const percentageInfo = formatPercentage(result.percentage);

          return (
            <div
              key={result.id}
              className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              {/* Result Header */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center text-2xl">
                      {result.icon}
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 text-lg">
                        {result.typeLabel}
                      </h5>
                      <p className="text-sm text-gray-500">
                        Mã mẫu: {result.sampleId.slice(-8)} •{" "}
                        {result.testedDateFormatted}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${result.statusColor}`}
                    >
                      <CheckCircle className="w-3 h-3" />
                      Hoàn thành
                    </span>
                  </div>
                </div>

                {/* Percentage Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Độ tin cậy kết quả
                    </span>
                    <span
                      className={`text-lg font-bold ${percentageInfo.color}`}
                    >
                      {percentageInfo.value}%
                      <span className="text-sm font-normal ml-1">
                        ({percentageInfo.label})
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        percentageInfo.value >= 95
                          ? "bg-gradient-to-r from-green-500 to-green-600"
                          : percentageInfo.value >= 80
                          ? "bg-gradient-to-r from-blue-500 to-blue-600"
                          : percentageInfo.value >= 60
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                          : percentageInfo.value >= 40
                          ? "bg-gradient-to-r from-orange-500 to-orange-600"
                          : "bg-gradient-to-r from-red-500 to-red-600"
                      }`}
                      style={{ width: `${percentageInfo.value}%` }}
                    ></div>
                  </div>
                </div>

                {/* Conclusion */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h6 className="font-medium text-gray-900 mb-2">Kết luận:</h6>
                  <p className="text-gray-800 leading-relaxed">
                    {result.conclusion}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExpanded(result.id)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      {isExpanded ? "Ẩn chi tiết" : "Xem chi tiết"}
                    </button>

                    {result.hasFile && (
                      <button
                        onClick={() => handleDownloadFile(result)}
                        className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
                      >
                        <FileDown className="w-4 h-4" />
                        Tải báo cáo PDF
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    ID: {result.id.slice(-8)}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-6">
                  <h6 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Chi tiết kết quả
                  </h6>

                  <div className="prose prose-sm max-w-none">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                        {result.detail}
                      </p>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">
                        Thông tin kỹ thuật:
                      </p>
                      <ul className="mt-1 space-y-1 text-gray-800">
                        <li>• Loại xét nghiệm: {result.typeLabel}</li>
                        <li>• Mã mẫu: {result.sampleId}</li>
                        <li>• Ngày phân tích: {result.testedDateFormatted}</li>
                        <li>• Độ tin cậy: {result.percentage}%</li>
                      </ul>
                    </div>

                    <div>
                      <p className="text-gray-600 font-medium">Ghi chú:</p>
                      <div className="mt-1 text-gray-800">
                        <p className="text-sm bg-yellow-50 border border-yellow-200 rounded p-2">
                          💡 Kết quả này chỉ mang tính chất tham khảo. Vui lòng
                          tham khảo ý kiến bác sĩ để được tư vấn cụ thể.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Download All Results Button */}
      {filteredDisplayData.length > 1 && (
        <div className="text-center pt-4">
          <button
            onClick={() => {
              // Download all results
              filteredDisplayData.forEach((result) => {
                if (result.hasFile) {
                  handleDownloadFile(result);
                }
              });
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Download className="w-5 h-5" />
            Tải tất cả báo cáo (
            {filteredDisplayData.filter((r) => r.hasFile).length})
          </button>
        </div>
      )}

      {/* Info Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-6">
        <h6 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Thông tin quan trọng
        </h6>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            🔬 <strong>Độ chính xác:</strong> Kết quả được phân tích bằng công
            nghệ tiên tiến với độ chính xác cao
          </p>
          <p>
            🧬 <strong>Bảo mật:</strong> Thông tin gen của bạn được bảo vệ tuyệt
            đối theo tiêu chuẩn quốc tế
          </p>
          <p>
            👨‍⚕️ <strong>Tư vấn:</strong> Liên hệ đội ngũ chuyên gia để được giải
            thích chi tiết kết quả
          </p>
          <p>
            📱 <strong>Cập nhật:</strong> Kết quả sẽ được cập nhật tự động khi
            có thông tin mới
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestResultsSection;
