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
  FileText, // Added for test results tab
} from "lucide-react";

// Hook - using the fixed version
import { useOrderDetail } from "../../hooks/useOrderDetail";

// Enhanced Components
import { EnhancedSamplesTab } from "../../components/customer/orderDetail/EnhancedSamplesTab";
import TestResultsSection from "../../components/customer/orderDetail/TestResultsSection"; // New import

// Mock other components for now - you can replace with actual imports
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

// ✅ Updated TabNavigation with Test Results tab
const TabNavigation: React.FC<any> = ({
  activeTab,
  onTabChange,
  samplesCount,
  kitsCount,
  testResultsCount, // New prop
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
      id: "results", // New tab
      label: `Kết quả (${testResultsCount})`,
      icon: FileText,
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
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const ProgressTab: React.FC<any> = ({ trackingSteps }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-gray-900">Tiến độ đơn hàng</h3>
    <div className="space-y-4">
      {trackingSteps.map((step: any, index: number) => (
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

const ActionButtons: React.FC<any> = ({
  orderStatus,
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

    {orderStatus === "completed" && (
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

const OrderDetail: React.FC = () => {
  const {
    // State
    order,
    loading,
    error,
    activeTab,

    // Computed data
    orderData,
    trackingSteps,
    kitsAndSamplesSummary,
    overallProgress,
    collectionMethod,
    hasAppointment,
    totalParticipants,

    // Actions
    handleTabChange,
    handleBackToDashboard,
    handleContactSupport,
    handleDownloadResults,
    handleOrderNewService,
    handleTrackKit,
  } = useOrderDetail();

  // ✅ Get current user ID for test results
  const getCurrentUserId = (): string => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.id || "";
    } catch {
      return "";
    }
  };

  // ✅ Get sample IDs from order for test results filtering
  const getSampleIds = (): string[] => {
    if (!order?.samples) return [];
    return order.samples.map((sample: any) => sample.id);
  };

  // ✅ Mock test results count (replace with actual count from service)
  const getTestResultsCount = (): number => {
    // In real implementation, this would come from testResultService
    // For now, return a mock count based on completed samples
    const completedSamples =
      order?.samples?.filter((sample: any) => sample.status === "completed") ||
      [];
    return completedSamples.length;
  };

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

      case "results": // ✅ New tab content
        return (
          <TestResultsSection
            sampleIds={getSampleIds()}
            userId={getCurrentUserId()}
            showSummary={true}
            className="test-results-tab"
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

        {/* Debug Info (remove in production) */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <details>
            <summary className="font-medium text-yellow-800 cursor-pointer">
              🔍 Debug Info (Development Only)
            </summary>
            <div className="mt-2 text-sm space-y-1">
              <p>
                <strong>Collection Method:</strong> {collectionMethod}
              </p>
              <p>
                <strong>Has Appointment:</strong>{" "}
                {hasAppointment ? "Yes" : "No"}
              </p>
              <p>
                <strong>Total Participants:</strong> {totalParticipants}
              </p>
              <p>
                <strong>Sample Kits:</strong> {order.sampleKits?.length || 0}
              </p>
              <p>
                <strong>Samples:</strong> {order.samples?.length || 0}
              </p>
              <p>
                <strong>Test Results Expected:</strong> {getTestResultsCount()}
              </p>
              <p>
                <strong>Overall Progress:</strong> {overallProgress}%
              </p>
              <p>
                <strong>Sample IDs:</strong> {getSampleIds().join(", ")}
              </p>
            </div>
          </details>
        </div>

        {/* Tabs Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
            samplesCount={order.samples?.length || 0}
            kitsCount={order.sampleKits?.length || 0}
            testResultsCount={getTestResultsCount()} // ✅ New prop
          />

          <div className="p-8">{renderTabContent()}</div>
        </div>

        {/* Action Buttons */}
        <ActionButtons
          orderStatus={orderData.status}
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

        {/* ✅ Test Results Quick Access (when results are available) */}
        {getTestResultsCount() > 0 && activeTab !== "results" && (
          <div className="mt-6 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-800">
                    Kết quả xét nghiệm đã sẵn sàng! 🎉
                  </h4>
                  <p className="text-sm text-green-600">
                    {getTestResultsCount()} kết quả đã hoàn thành và sẵn sàng
                    xem
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleTabChange("results")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Xem kết quả
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
