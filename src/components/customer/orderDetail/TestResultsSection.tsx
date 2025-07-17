// TestResultsSection.tsx - Simple component for v16
import React, { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  User,
  Package,
} from "lucide-react";
import {
  useOrderTestResults,
  useTestResults,
} from "../../../hooks/useTestResults";
import { testResultService } from "../../../services/testResultService";

interface TestResultsSectionProps {
  orderId?: string;
  userId?: string;
  showSummary?: boolean;
  className?: string;
}

export const TestResultsSection: React.FC<TestResultsSectionProps> = ({
  orderId,
  userId,
  showSummary = true,
  className = "",
}) => {
  const [expandedResults, setExpandedResults] = useState<Set<string>>(
    new Set()
  );

  // ✅ v16: Use order hook if orderId provided, otherwise user hook
  const orderResults = useOrderTestResults(orderId || "");
  const userResults = useTestResults(userId);

  // Choose which results to use
  const { testResults, loading, error, hasTestResults, refetch, clearError } =
    orderId ? orderResults : userResults;

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
  const handleDownloadFile = async (result: any) => {
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

  // ✅ Format percentage
  const formatPercentage = (percentage: string) => {
    const value = parseFloat(percentage) || 0;
    if (value >= 95)
      return { value, color: "text-green-600", label: "Rất cao" };
    if (value >= 80) return { value, color: "text-blue-600", label: "Cao" };
    if (value >= 60)
      return { value, color: "text-yellow-600", label: "Trung bình" };
    return { value, color: "text-red-600", label: "Thấp" };
  };

  // ✅ Loading state
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
          {[...Array(2)].map((_, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
            >
              <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-full h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h5 className="text-lg font-medium text-red-800 mb-2">
            Lỗi tải dữ liệu
          </h5>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              clearError();
              refetch();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // ✅ Empty state
  if (!hasTestResults) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Kết quả xét nghiệm
          </h4>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h5 className="text-lg font-medium text-gray-700 mb-2">
            Chưa có kết quả xét nghiệm
          </h5>
          <p className="text-gray-500 text-sm">
            Kết quả sẽ xuất hiện sau khi quá trình phân tích hoàn tất
          </p>
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
          Kết quả xét nghiệm ({testResults.length})
        </h4>
        <button
          onClick={refetch}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary */}
      {showSummary && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {testResults.length}
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
                  {testResults.filter((r) => r.conclusion).length}
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
                  {testResults.filter((r) => !r.conclusion).length}
                </p>
                <p className="text-sm text-yellow-600">Đang xử lý</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {testResults.map((result) => {
          const isExpanded = expandedResults.has(result.id);
          const percentageInfo = formatPercentage(result.result_percentage);

          return (
            <div
              key={result.id}
              className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              {/* Result Header */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 text-lg">
                        {result.result_type}
                      </h5>
                      <p className="text-sm text-gray-500">
                        {new Date(result.tested_date).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3" />
                      Hoàn thành
                    </span>
                  </div>
                </div>

                {/* Percentage */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Độ tin cậy
                    </span>
                    <span
                      className={`text-lg font-bold ${percentageInfo.color}`}
                    >
                      {percentageInfo.value}% ({percentageInfo.label})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                      style={{ width: `${percentageInfo.value}%` }}
                    ></div>
                  </div>
                </div>

                {/* Conclusion */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h6 className="font-medium text-gray-900 mb-2">Kết luận:</h6>
                  <p className="text-gray-800">{result.conclusion}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleExpanded(result.id)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    {isExpanded ? "Ẩn chi tiết" : "Xem chi tiết"}
                  </button>

                  {result.result_file && (
                    <button
                      onClick={() => handleDownloadFile(result)}
                      className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Tải báo cáo
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-6">
                  <h6 className="font-medium text-gray-900 mb-3">
                    Chi tiết kết quả:
                  </h6>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-line">
                      {result.result_detail}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestResultsSection;
