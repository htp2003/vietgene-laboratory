import React from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Loader,
  ArrowLeft,
  Package,
  Users,
  TestTube,
  TrendingUp,
  Phone,
  Mail,
  Download,
  RefreshCw,
  FileText,
  AlertTriangle,
} from "lucide-react";

// Hook - using the fixed version
import { useOrderDetail } from "../../hooks/useOrderDetail";

// Enhanced Components
import { EnhancedSamplesTab } from "../../components/customer/orderDetail/EnhancedSamplesTab";
import TestResultsSection from "../../components/customer/orderDetail/TestResultsSection"; // bắt api qua OrderDetail luôn

// Order Header Component
const OrderHeader: React.FC<any> = ({
  orderData,
  onBackClick,
  overallProgress,
}) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onBackClick}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Dashboard
      </button>
      <div className="text-right">
        <p className="text-sm text-gray-500">Mã đơn hàng</p>
        <p className="font-mono font-bold text-gray-900">
          {orderData.orderCode}
        </p>
      </div>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Chi tiết đơn hàng
        </h1>
        <p className="text-gray-600">
          Theo dõi tiến độ và quản lý đơn hàng của bạn
        </p>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
        <p className="text-2xl font-bold text-red-600">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(orderData.totalAmount)}
        </p>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">Tiến độ tổng thể</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {overallProgress}%
          </span>
        </div>
      </div>
    </div>
  </div>
);

// ✅ FIXED: Tab Navigation with proper test results count
const TabNavigation: React.FC<any> = ({
  activeTab,
  onTabChange,
  samplesCount,
  kitsCount,
  testResultsCount,
  testResultsLoading,
}) => {
  const tabs = [
    { id: "progress", label: "Tiến độ", icon: TrendingUp },
    { id: "details", label: "Chi tiết", icon: Package },
    { id: "participants", label: "Người tham gia", icon: Users },
    {
      id: "samples",
      label: `Kit & Mẫu (${kitsCount + samplesCount})`,
      icon: TestTube,
    },
    {
      id: "results",
      label: `Kết quả (${testResultsCount})`,
      icon: FileText,
      isLoading: testResultsLoading,
    },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.isLoading && (
                <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// Simple tab components
const ProgressTab: React.FC<any> = ({ trackingSteps }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-gray-900">Tiến độ đơn hàng</h3>
    <div className="space-y-4">
      {trackingSteps.map((step: any) => (
        <div key={step.step} className="flex items-start gap-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step.status === "completed"
                ? "bg-green-500 text-white"
                : step.status === "current"
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {step.step}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{step.title}</h4>
            <p className="text-sm text-gray-600">{step.description}</p>
            {step.date && (
              <p className="text-xs text-gray-500 mt-1">
                {new Date(step.date).toLocaleString("vi-VN")}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DetailsTab: React.FC<any> = ({ orderData }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-gray-900">Thông tin chi tiết</h3>
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-600">
            Trạng thái đơn hàng
          </p>
          <p className="text-gray-900">{orderData.status}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">
            Phương thức thanh toán
          </p>
          <p className="text-gray-900">{orderData.paymentMethod}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">
            Trạng thái thanh toán
          </p>
          <p className="text-gray-900">{orderData.paymentStatus}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-600">Ngày tạo</p>
          <p className="text-gray-900">
            {orderData.createdAt
              ? new Date(orderData.createdAt).toLocaleString("vi-VN")
              : "N/A"}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Cập nhật lần cuối</p>
          <p className="text-gray-900">
            {orderData.updatedAt
              ? new Date(orderData.updatedAt).toLocaleString("vi-VN")
              : "N/A"}
          </p>
        </div>
        {orderData.notes && (
          <div>
            <p className="text-sm font-medium text-gray-600">Ghi chú</p>
            <p className="text-gray-900">{orderData.notes}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

const ParticipantsTab: React.FC<any> = ({ participants }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-gray-900">
      Người tham gia xét nghiệm
    </h3>
    {participants.length === 0 ? (
      <p className="text-gray-500">Chưa có thông tin người tham gia</p>
    ) : (
      <div className="grid md:grid-cols-2 gap-4">
        {participants.map((participant: any, index: number) => (
          <div
            key={participant.id || index}
            className="bg-gray-50 rounded-lg p-4"
          >
            <h4 className="font-medium text-gray-900">
              {participant.participantName || participant.participant_name}
            </h4>
            <p className="text-sm text-gray-600">
              {participant.relationship} • {participant.age} tuổi
            </p>
            {participant.note && (
              <p className="text-xs text-gray-500 mt-1">{participant.note}</p>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

// ✅ FIXED: Test Results Tab - Render directly without TestResultsSection
const TestResultsTab: React.FC<any> = ({
  orderId,
  testResults,
  testResultsLoading,
  testResultsError,
  refreshTestResults,
}) => {
  // Show loading state
  if (testResultsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            Kết quả xét nghiệm
          </h3>
          <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
        </div>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Loader className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải kết quả xét nghiệm...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (testResultsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            Kết quả xét nghiệm
          </h3>
          <button
            onClick={refreshTestResults}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h5 className="text-lg font-medium text-red-800 mb-2">
            Lỗi tải kết quả
          </h5>
          <p className="text-red-600 mb-4">{testResultsError}</p>
          <button
            onClick={refreshTestResults}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // ✅ Show empty state if no test results
  if (!testResults || testResults.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            Kết quả xét nghiệm
          </h3>
          <button
            onClick={refreshTestResults}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h5 className="text-lg font-medium text-gray-700 mb-2">
            Chưa có kết quả xét nghiệm
          </h5>
          <p className="text-gray-500 text-sm mb-4">
            Kết quả sẽ xuất hiện sau khi quá trình phân tích hoàn tất
          </p>
          <p className="text-xs text-gray-400">Order ID: {orderId}</p>
        </div>
      </div>
    );
  }

  // ✅ Render test results directly
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          Kết quả xét nghiệm ({testResults.length})
        </h3>
        <button
          onClick={refreshTestResults}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-700 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Summary Cards */}
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
            <FileText className="w-8 h-8 text-green-600" />
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
            <FileText className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-700">
                {testResults.filter((r) => !r.conclusion).length}
              </p>
              <p className="text-sm text-yellow-600">Đang xử lý</p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Results List */}
      <div className="space-y-4">
        {testResults.map((result: any) => {
          const percentageValue = parseFloat(result.result_percentage) || 0;
          const percentageColor =
            percentageValue >= 95
              ? "text-green-600"
              : percentageValue >= 80
              ? "text-blue-600"
              : percentageValue >= 60
              ? "text-yellow-600"
              : "text-red-600";

          return (
            <div
              key={result.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {/* Result Header */}
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
                      {new Date(result.tested_date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
                  <span className={`text-lg font-bold ${percentageColor}`}>
                    {percentageValue}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                    style={{ width: `${percentageValue}%` }}
                  ></div>
                </div>
              </div>

              {/* Conclusion */}
              {result.conclusion && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h6 className="font-medium text-gray-900 mb-2">Kết luận:</h6>
                  <p className="text-gray-800">{result.conclusion}</p>
                </div>
              )}

              {/* Details */}
              {result.result_detail && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h6 className="font-medium text-gray-900 mb-2">Chi tiết:</h6>
                  <p className="text-gray-800 text-sm whitespace-pre-line">
                    {result.result_detail}
                  </p>
                </div>
              )}

              {/* Download Button - Fixed for Google Drive links */}
              {result.result_file && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      // ✅ Handle Google Drive links properly
                      const fileUrl = result.result_file;
                      console.log("📁 Opening file:", fileUrl);

                      // Open in new tab
                      window.open(fileUrl, "_blank", "noopener,noreferrer");
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Xem báo cáo
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Debug Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-700">
          <strong>Debug:</strong> Đang hiển thị {testResults.length} kết quả cho
          Order ID: {orderId}
        </p>
      </div>
    </div>
  );
};

// Action Buttons Component
const ActionButtons: React.FC<any> = ({
  hasTestResults,
  onContactSupport,
  onDownloadResults,
  onOrderNewService,
}) => (
  <div className="grid md:grid-cols-3 gap-6">
    <button
      onClick={onContactSupport}
      className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-50 transition-colors"
    >
      <Phone className="w-4 h-4" />
      Liên hệ hỗ trợ
    </button>

    {hasTestResults && (
      <button
        onClick={onDownloadResults}
        className="flex items-center justify-center gap-2 bg-red-600 text-white rounded-lg px-6 py-3 hover:bg-red-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Tải kết quả
      </button>
    )}

    <button
      onClick={onOrderNewService}
      className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 transition-colors"
    >
      <Package className="w-4 h-4" />
      Đặt dịch vụ mới
    </button>
  </div>
);

// ✅ MAIN: OrderDetail Component
const OrderDetail: React.FC = () => {
  const {
    // State
    order,
    loading,
    error,
    activeTab,

    // ✅ Test results state
    testResults,
    testResultsLoading,
    testResultsError,
    testResultsCount,

    // Computed data
    orderData,
    trackingSteps,
    kitsAndSamplesSummary,
    overallProgress,
    collectionMethod,
    hasTestResults,

    // Actions
    handleTabChange,
    handleBackToDashboard,
    handleContactSupport,
    handleDownloadResults,
    handleOrderNewService,
    handleTrackKit,
    refreshTestResults,
  } = useOrderDetail();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Không tìm thấy đơn hàng"}
          </h2>
          <Link
            to="/dashboard"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Quay lại Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ✅ FIXED: Render tab content with proper orderId
  const renderTabContent = () => {
    switch (activeTab) {
      case "progress":
        return <ProgressTab trackingSteps={trackingSteps} />;

      case "details":
        return <DetailsTab orderData={orderData} />;

      case "participants":
        return <ParticipantsTab participants={order.participants || []} />;

      case "samples":
        return (
          <EnhancedSamplesTab
            sampleKits={order.sampleKits || []}
            samples={order.samples || []}
            kitsAndSamplesSummary={kitsAndSamplesSummary}
            collectionMethod={collectionMethod}
            onTrackKit={handleTrackKit}
          />
        );

      case "results":
        return (
          <TestResultsTab
            orderId={order.id} // ✅ Pass the actual order ID
            testResults={testResults}
            testResultsLoading={testResultsLoading}
            testResultsError={testResultsError}
            refreshTestResults={refreshTestResults}
          />
        );

      default:
        return <ProgressTab trackingSteps={trackingSteps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Order Header */}
        <OrderHeader
          orderData={orderData}
          onBackClick={handleBackToDashboard}
          overallProgress={overallProgress}
        />

        {/* ✅ Debug Info - Shows what order ID we're working with */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <details>
            <summary className="font-medium text-blue-800 cursor-pointer">
              🔍 Debug Info - Order & Test Results
            </summary>
            <div className="mt-2 text-sm space-y-1">
              <p>
                <strong>Current Order ID:</strong> {order.id}
              </p>
              <p>
                <strong>URL Order ID:</strong>{" "}
                {window.location.pathname.split("/").pop()}
              </p>
              <p>
                <strong>Test Results Count:</strong> {testResultsCount}
              </p>
              <p>
                <strong>Test Results Loading:</strong>{" "}
                {testResultsLoading ? "Yes" : "No"}
              </p>
              <p>
                <strong>Test Results Error:</strong>{" "}
                {testResultsError || "None"}
              </p>
              <p>
                <strong>Sample Kits:</strong> {order.sampleKits?.length || 0}
              </p>
              <p>
                <strong>Samples:</strong> {order.samples?.length || 0}
              </p>
              <p>
                <strong>Overall Progress:</strong> {overallProgress}%
              </p>
            </div>
          </details>
        </div>

        {/* ✅ Test Results Notification */}
        {hasTestResults && activeTab !== "results" && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-800">
                    Kết quả xét nghiệm đã sẵn sàng! 🎉
                  </h4>
                  <p className="text-sm text-green-600">
                    {testResultsCount} kết quả đã hoàn thành
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleTabChange("results")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Xem kết quả
              </button>
            </div>
          </div>
        )}

        {/* Tabs Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
            samplesCount={order.samples?.length || 0}
            kitsCount={order.sampleKits?.length || 0}
            testResultsCount={testResultsCount}
            testResultsLoading={testResultsLoading}
          />
          <div className="p-8">{renderTabContent()}</div>
        </div>

        {/* Action Buttons */}
        <ActionButtons
          hasTestResults={hasTestResults}
          onContactSupport={handleContactSupport}
          onDownloadResults={handleDownloadResults}
          onOrderNewService={handleOrderNewService}
        />

        {/* Contact Support Card */}
        <div className="mt-8 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
          <h3 className="font-bold mb-4">Cần hỗ trợ thêm?</h3>
          <p className="text-red-100 text-sm mb-4">
            Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn 24/7
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="tel:19001234"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">1900 1234</span>
            </a>
            <a
              href="mailto:support@vietgene.vn"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm">support@vietgene.vn</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
