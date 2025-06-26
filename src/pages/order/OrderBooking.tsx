import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, Loader } from "lucide-react";

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
    handleSubmit,
  } = useOrderBooking();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin dịch vụ...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không thể tải dịch vụ
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/services")}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            ← Quay lại danh sách dịch vụ
          </button>
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đặt dịch vụ</h1>
            <p className="text-gray-600">{service?.service_name}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <StepIndicator currentStep={currentStep} />

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="mb-8">{renderCurrentStep()}</div>

          {/* Navigation Buttons */}
          <NavigationButtons
            currentStep={currentStep}
            totalSteps={4}
            onPrevious={() => setCurrentStep(currentStep - 1)}
            onNext={() => {
              if (validateStep(currentStep)) {
                setCurrentStep(currentStep + 1);
                setError(null);
              } else {
                setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
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
