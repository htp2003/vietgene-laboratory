import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Loader } from "lucide-react";

// Hooks
import { useOrderDetail } from "../../hooks/useOrderDetail";

// Components
import { OrderHeader } from "../../components/customer/orderDetail/OrderHeader";
import { TabNavigation } from "../../components/customer/orderDetail/TabNavigation";
import { ProgressTab } from "../../components/customer/orderDetail/ProgressTab";
import { DetailsTab } from "../../components/customer/orderDetail/DetailsTab";
import { ParticipantsTab } from "../../components/customer/orderDetail/ParticipantsTab";
import { SamplesTab } from "../../components/customer/orderDetail/SamplesTab";
import { ActionButtons } from "../../components/customer/orderDetail/ActionButtons";

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
    samplesSummary,

    // Actions
    handleTabChange,
    handleBackToDashboard,
    handleContactSupport,
    handleDownloadResults,
    handleOrderNewService,
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
          <SamplesTab
            samples={order.samples || []}
            samplesSummary={samplesSummary}
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
        />

        {/* Tabs Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
            samplesCount={order.samples?.length || 0}
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
      </div>
    </div>
  );
};

export default OrderDetail;
