import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  Loader,
  RefreshCw,
  Bug,
  X,
} from "lucide-react";

// Hooks
import { useOrderBooking } from "../../hooks/useOrderBooking";

// Components
import { NavigationButtons } from "../../components/customer/order/NavigationButtons";
import { StepIndicator } from "../../components/customer/order/StepIndicator";
import { CustomerInfoStep } from "../../components/customer/order/steps/CustomerInfoStep";
import { ParticipantsStep } from "../../components/customer/order/steps/ParticipantsStep";
import { CollectionMethodStep } from "../../components/customer/order/steps/CollectionMethodStep";
import { PaymentStep } from "../../components/customer/order/steps/PaymentStep";

const OrderBooking: React.FC = () => {
  const navigate = useNavigate();
  const [showDebug, setShowDebug] = React.useState(false);

  const {
    service,
    doctors,
    availableTimeSlots,
    loading,
    submitting,
    error,
    currentStep,
    formData,
    setCurrentStep,
    setError,
    updateFormData,
    updateParticipant,
    addParticipant,
    removeParticipant,
    handleDoctorSelect,
    handleTimeSlotSelect,
    getDayName,
    validateStep,
    calculateTotal,
    getStepSpecificError,
    handleSubmit,
  } = useOrderBooking();

  // Enhanced debug logging
  React.useEffect(() => {
    console.log("🚀 OrderBooking Component Debug Info:");
    console.log("- Service:", service);
    console.log("- Doctors:", doctors);
    console.log("- Time Slots:", availableTimeSlots);
    console.log("- Form Data:", formData);
    console.log("- Current Step:", currentStep);
    console.log("- Error:", error);
  }, [service, doctors, availableTimeSlots, formData, currentStep, error]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin dịch vụ...</p>
          <p className="text-xs text-gray-500 mt-2">
            Checking console for detailed logs...
          </p>
        </div>
      </div>
    );
  }

  // Critical error state (no service loaded)
  if (error && !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không thể tải dịch vụ
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg mx-auto transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Thử lại
            </button>

            <button
              onClick={() => navigate("/services")}
              className="block text-red-600 hover:text-red-700 font-medium mx-auto"
            >
              ← Quay lại danh sách dịch vụ
            </button>
          </div>

          {/* Debug info for critical errors */}
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              🔧 Debug Info
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-left">
              <div>Service ID: {window.location.pathname.split("/").pop()}</div>
              <div>Error: {error}</div>
              <div>Timestamp: {new Date().toISOString()}</div>
              <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
            </div>
          </details>
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CustomerInfoStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 2:
        return (
          <ParticipantsStep
            participants={formData.participantInfo.participants}
            updateParticipant={updateParticipant}
            addParticipant={addParticipant}
            removeParticipant={removeParticipant}
          />
        );
      case 3:
        return (
          <CollectionMethodStep
            formData={formData}
            updateFormData={updateFormData}
            doctors={doctors}
            availableTimeSlots={availableTimeSlots}
            onDoctorSelect={handleDoctorSelect}
            onTimeSlotSelect={handleTimeSlotSelect}
            getDayName={getDayName}
          />
        );
      case 4:
        return (
          <PaymentStep
            formData={formData}
            updateFormData={updateFormData}
            service={service}
            doctors={doctors}
            calculateTotal={calculateTotal}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Đặt dịch vụ</h1>
            <p className="text-gray-600">{service?.service_name}</p>
          </div>

          {/* Debug Toggle Button */}
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Toggle Debug Info"
          >
            <Bug className="w-4 h-4" />
            Debug
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <StepIndicator currentStep={currentStep} />

          {/* Enhanced Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">{error}</p>

                  {/* Helpful suggestions based on error */}
                  {error.includes("bác sĩ") && (
                    <p className="text-red-600 text-sm mt-1">
                      💡 Thử chọn phương thức "Lấy mẫu tại nhà" nếu không có bác
                      sĩ khả dụng
                    </p>
                  )}
                  {error.includes("thông tin") && (
                    <p className="text-red-600 text-sm mt-1">
                      💡 Kiểm tra các trường có dấu (*) bắt buộc
                    </p>
                  )}
                  {error.includes("API") && (
                    <p className="text-red-600 text-sm mt-1">
                      💡 Lỗi kết nối - hãy kiểm tra mạng và thử lại
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Debug Panel */}
          {showDebug && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-blue-900">
                  🐛 Debug Information
                </h3>
                <button
                  onClick={() => setShowDebug(false)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="bg-white p-3 rounded border">
                    <strong className="text-blue-800">Service Info:</strong>
                    <div className="mt-1 text-xs font-mono">
                      <div>
                        ID: {service?.serviceId || service?.id || "N/A"}
                      </div>
                      <div>Name: {service?.service_name || "N/A"}</div>
                      <div>
                        Price: {service?.price || service?.test_price || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <strong className="text-blue-800">Doctors:</strong>{" "}
                    {doctors.length}
                    {doctors.length > 0 && (
                      <div className="mt-1 text-xs max-h-20 overflow-auto">
                        {doctors.slice(0, 3).map((doc, i) => (
                          <div key={i}>
                            • {doc.doctorName || doc.name || `Doctor ${i + 1}`}
                          </div>
                        ))}
                        {doctors.length > 3 && (
                          <div>... and {doctors.length - 3} more</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="bg-white p-3 rounded border">
                    <strong className="text-blue-800">Form State:</strong>
                    <div className="mt-1 text-xs">
                      <div>Step: {currentStep}/4</div>
                      <div>
                        Valid: {validateStep(currentStep) ? "✅" : "❌"}
                      </div>
                      <div>
                        Collection: {formData.serviceInfo.collectionMethod}
                      </div>
                      <div>
                        Participants:{" "}
                        {formData.participantInfo.participants.length}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <strong className="text-blue-800">API Status:</strong>
                    <div className="mt-1 text-xs">
                      <div>Service: {service ? "✅" : "❌"}</div>
                      <div>Doctors: {doctors.length > 0 ? "✅" : "⚠️"}</div>
                      <div>Time Slots: {availableTimeSlots.length}</div>
                      <div>Error: {error ? "❌" : "✅"}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-blue-200">
                <button
                  onClick={() =>
                    console.log("Full Debug Data:", {
                      service,
                      doctors,
                      availableTimeSlots,
                      formData,
                      currentStep,
                      error,
                    })
                  }
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  📋 Log Full Debug to Console
                </button>
              </div>
            </div>
          )}

          <div className="mb-8">{renderCurrentStep()}</div>

          {/* Enhanced Navigation Buttons */}
          <NavigationButtons
            currentStep={currentStep}
            totalSteps={4}
            onPrevious={() => {
              setCurrentStep(currentStep - 1);
              setError(null); // Clear errors when going back
            }}
            onNext={() => {
              if (validateStep(currentStep)) {
                setCurrentStep(currentStep + 1);
                setError(null);
              } else {
                // More specific error messages
                let errorMsg = "Vui lòng điền đầy đủ thông tin bắt buộc.";

                if (currentStep === 1) {
                  errorMsg =
                    "Vui lòng điền đầy đủ thông tin khách hàng (họ tên, điện thoại, email, CMND, địa chỉ).";
                } else if (currentStep === 2) {
                  errorMsg =
                    "Vui lòng thêm ít nhất 2 người tham gia và điền đầy đủ thông tin.";
                } else if (currentStep === 3) {
                  if (formData.serviceInfo.collectionMethod === "facility") {
                    errorMsg = "Vui lòng chọn bác sĩ, khung giờ và ngày hẹn.";
                  }
                } else if (currentStep === 4) {
                  errorMsg = "Vui lòng chọn phương thức thanh toán.";
                }

                setError(errorMsg);

                // Scroll to top to show error
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            onSubmit={handleSubmit}
            canProceed={validateStep(currentStep)}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderBooking;
