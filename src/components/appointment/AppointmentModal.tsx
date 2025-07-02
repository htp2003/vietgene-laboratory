import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
  CheckCircle,
  XCircle,
  ArrowRight,
  Stethoscope,
  UserCheck,
  AlertTriangle,
  Truck,
  Package,
  TestTube,
  AlertCircle,
} from "lucide-react";

// ✅ Updated imports - using new structure
import { Appointment } from "../../types/appointment";
import { Users } from "lucide-react";
import {
  OrderParticipantsService,
  OrderParticipant,
} from "../../services/staffService/orderParticipantService";

// ✅ Updated interface for modal props
interface AppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (appointment: Appointment) => Promise<void>;
  onCancel: (appointmentId: string) => Promise<void>;
  onUpdateStatus: (
    appointmentId: string,
    newStatus: Appointment["status"]
  ) => Promise<void>;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  onUpdateStatus,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [participants, setParticipants] = useState<OrderParticipant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  

  useEffect(() => {
    if (appointment?.rawData?.order?.orderId) {
      loadParticipants(appointment.rawData.order.orderId);
    } else {
      setParticipants([]);
    }
  }, [appointment?.id]);

  if (!isOpen || !appointment) return null;

  // ✅ Add this function
  const loadParticipants = async (orderId: string) => {
    try {
      setLoadingParticipants(true);
      const participantsList =
        await OrderParticipantsService.getParticipantsByOrderIdCached(orderId);
      setParticipants(participantsList);
    } catch (error) {
      console.error("Error loading participants:", error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  // ✅ Define steps for different service types
  const getStepsConfig = (locationType: string) => {
    if (locationType === "Tại nhà") {
      // Steps for home service (HomeTestStepper)
      return [
        {
          key: "Pending",
          label: "Đặt lịch",
          icon: Calendar,
          description: "Khách hàng đặt lịch hẹn",
        },
        {
          key: "DeliveringKit",
          label: "Giao kit",
          icon: Truck,
          description: "Đang giao kit xét nghiệm",
        },
        {
          key: "KitDelivered",
          label: "Đã giao kit",
          icon: Package,
          description: "Kit đã được giao thành công",
        },
        {
          key: "SampleReceived",
          label: "Nhận mẫu",
          icon: TestTube,
          description: "Đã nhận mẫu từ khách hàng",
        },
        {
          key: "Testing",
          label: "Xét nghiệm",
          icon: AlertCircle,
          description: "Đang tiến hành xét nghiệm",
        },
        {
          key: "Completed",
          label: "Hoàn thành",
          icon: CheckCircle,
          description: "Có kết quả xét nghiệm",
        },
      ];
    } else {
      // Steps for facility service (FacilityTestStepper)
      return [
        {
          key: "Pending",
          label: "Đặt lịch",
          icon: Calendar,
          description: "Khách hàng đặt lịch hẹn",
        },
        {
          key: "Confirmed",
          label: "Check-in",
          icon: User,
          description: "Khách hàng check-in tại cơ sở",
        },
        {
          key: "SampleReceived",
          label: "Nhận mẫu",
          icon: TestTube,
          description: "Thu thập mẫu xét nghiệm",
        },
        {
          key: "Testing",
          label: "Xét nghiệm",
          icon: AlertCircle,
          description: "Đang tiến hành xét nghiệm",
        },
        {
          key: "Completed",
          label: "Hoàn thành",
          icon: CheckCircle,
          description: "Có kết quả xét nghiệm",
        },
      ];
    }
  };

  // Status configuration
  const getStatusConfig = (status: string) => {
    const configs = {
      Pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Chờ xử lý",
        icon: Clock,
      },
      Confirmed: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Đã xác nhận",
        icon: CheckCircle,
      },
      DeliveringKit: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Đang giao kit",
        icon: Truck,
      },
      KitDelivered: {
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        label: "Đã giao kit",
        icon: Package,
      },
      SampleReceived: {
        color: "bg-cyan-100 text-cyan-800 border-cyan-200",
        label: "Đã nhận mẫu",
        icon: TestTube,
      },
      Testing: {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        label: "Đang xét nghiệm",
        icon: AlertCircle,
      },
      Completed: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Hoàn thành",
        icon: CheckCircle,
      },
      Cancelled: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Đã hủy",
        icon: XCircle,
      },
    };
    return configs[status] || configs["Pending"];
  };

  // Get next possible status based on location type
  const getNextStatus = (
    currentStatus: string,
    locationType: string
  ): string | null => {
    if (locationType === "Tại nhà") {
      const homeStatusFlow = {
        Pending: "DeliveringKit",
        DeliveringKit: "KitDelivered",
        KitDelivered: "SampleReceived",
        SampleReceived: "Testing",
        Testing: "Completed",
      };
      return homeStatusFlow[currentStatus] || null;
    } else {
      const facilityStatusFlow = {
        Pending: "Confirmed",
        Confirmed: "SampleReceived",
        SampleReceived: "Testing",
        Testing: "Completed",
      };
      return facilityStatusFlow[currentStatus] || null;
    }
  };

  // ✅ Get appropriate step configuration based on location type
  const steps = getStepsConfig(appointment.locationType);
  const getCurrentStepIndex = () => {
    const index = steps.findIndex((step) => step.key === appointment.status);
    return index >= 0 ? index : 0;
  };

  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;
  const nextStatus = getNextStatus(
    appointment.status,
    appointment.locationType
  );
  const currentStepIndex = getCurrentStepIndex();
  

  

  // Format date and time
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // HH:MM format
  };

  // Handle actions
  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      await onConfirm(appointment);
    } catch (error) {
      console.error("Error confirming appointment:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsProcessing(true);
      await onCancel(appointment.id);
      setShowConfirmCancel(false);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusUpdate = async (newStatus: Appointment["status"]) => {
    try {
      setIsProcessing(true);
      await onUpdateStatus(appointment.id, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Chi Tiết Lịch Hẹn
            </h2>
            <p className="text-sm text-gray-600 mt-1">ID: {appointment.id}</p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}
            >
              <StatusIcon className="w-4 h-4 inline mr-1" />
              {statusConfig.label}
            </span>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông Tin Khách Hàng
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <p className="text-gray-900 font-medium">
                  {appointment.customerName}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{appointment.phone}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{appointment.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại xét nghiệm
                </label>
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    appointment.legalType === "Pháp Lý"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {appointment.legalType}
                </span>
              </div>
            </div>

            {/* Address for home service */}
            {appointment.locationType === "Tại nhà" && appointment.address && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ lấy mẫu
                </label>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <p className="text-gray-900">{appointment.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Appointment Details */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Chi Tiết Lịch Hẹn
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày hẹn
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 font-medium">
                    {formatDate(appointment.date)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 font-medium">
                    {formatTime(appointment.time)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dịch vụ
                </label>
                <p className="text-gray-900 font-medium">
                  {appointment.serviceName || appointment.serviceType}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa điểm
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{appointment.locationType}</p>
                </div>
              </div>
            </div>

            {/* Creation time */}
            {appointment.lastStatusUpdate && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cập nhật lần cuối
                </label>
                <p className="text-gray-600 text-sm">
                  {new Date(appointment.lastStatusUpdate).toLocaleString(
                    "vi-VN"
                  )}
                </p>
              </div>
            )}
          </div>

          {/* ✅ Doctor Information - only for facility service */}
          {appointment.locationType === "Cơ sở y tế" && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Thông Tin Bác Sĩ
              </h3>

              {appointment.doctorInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên bác sĩ
                    </label>
                    <p className="text-gray-900 font-medium">
                      {appointment.doctorInfo.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Khung giờ
                    </label>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">
                        {appointment.doctorInfo.timeSlot}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày trong tuần
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">
                        {appointment.doctorInfo.dayOfWeek}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Đã phân công
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <UserCheck className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-amber-800 font-medium">
                      Chưa phân công bác sĩ
                    </p>
                    <p className="text-amber-700 text-sm">
                      Cần phân công bác sĩ cho lịch hẹn tại cơ sở y tế
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ✅ Updated Progress Timeline - using dynamic steps */}
          <div
            className={`rounded-lg p-6 ${
              appointment.locationType === "Tại nhà"
                ? "bg-green-50"
                : "bg-purple-50"
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tiến Trình Xét Nghiệm{" "}
              {appointment.locationType === "Tại nhà"
                ? "(Tại nhà)"
                : "(Tại cơ sở)"}
            </h3>

            {/* Progress stepper */}
            <div className="w-full py-4">
              <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 z-0">
                  <div
                    className={`h-full transition-all duration-500 ${
                      appointment.locationType === "Tại nhà"
                        ? "bg-gradient-to-r from-blue-500 to-green-500"
                        : "bg-gradient-to-r from-purple-500 to-blue-500"
                    }`}
                    style={{
                      width: `${
                        (currentStepIndex / (steps.length - 1)) * 100
                      }%`,
                    }}
                  />
                </div>

                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center relative z-10"
                    >
                      <div
                        className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
                        ${
                          isCompleted
                            ? appointment.locationType === "Tại nhà"
                              ? "bg-green-500 text-white shadow-lg transform scale-110"
                              : "bg-blue-500 text-white shadow-lg transform scale-110"
                            : isCurrent
                            ? appointment.locationType === "Tại nhà"
                              ? "bg-blue-500 text-white shadow-lg ring-4 ring-blue-100 transform scale-110"
                              : "bg-purple-500 text-white shadow-lg ring-4 ring-purple-100 transform scale-110"
                            : "bg-gray-200 text-gray-400"
                        }
                      `}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>

                      <div className="mt-2 text-center max-w-20">
                        <div
                          className={`text-xs font-medium transition-colors duration-300 ${
                            isCompleted || isCurrent
                              ? "text-gray-900"
                              : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </div>
                        <div
                          className={`text-xs mt-1 transition-colors duration-300 ${
                            isCompleted || isCurrent
                              ? "text-gray-600"
                              : "text-gray-400"
                          } hidden sm:block`}
                        >
                          {step.description}
                        </div>
                      </div>

                      {/* Progress indicator dot */}
                      {(isCompleted || isCurrent) && (
                        <div
                          className={`absolute -bottom-2 w-2 h-2 rounded-full ${
                            isCompleted
                              ? appointment.locationType === "Tại nhà"
                                ? "bg-green-500"
                                : "bg-blue-500"
                              : appointment.locationType === "Tại nhà"
                              ? "bg-blue-500"
                              : "bg-purple-500"
                          } animate-pulse`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Current step description for mobile */}
              <div className="sm:hidden mt-4 text-center">
                <div className="text-sm font-medium text-gray-700">
                  {steps[currentStepIndex]?.description}
                </div>
              </div>
            </div>
          </div>

          {(participants.length > 0 || loadingParticipants) && (
            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Người Tham Gia Xét Nghiệm
              </h3>

              {loadingParticipants ? (
                <div className="flex items-center gap-2 text-indigo-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  <span className="text-sm">
                    Đang tải danh sách người tham gia...
                  </span>
                </div>
              ) : participants.length > 0 ? (
                <div className="space-y-4">
                  {participants.map((participant, index) => (
                    <div
                      key={participant.id}
                      className="bg-white rounded-lg p-4 border border-indigo-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Họ và tên
                          </label>
                          <p className="text-gray-900 font-medium">
                            {participant.participant_name}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mối quan hệ
                          </label>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {OrderParticipantsService.getRelationshipDisplayText(
                              participant.relationship
                            )}
                          </span>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tuổi
                          </label>
                          <p className="text-gray-900">
                            {participant.age
                              ? `${participant.age} tuổi`
                              : "Không xác định"}
                          </p>
                        </div>
                      </div>

                      {participant.note && (
                        <div className="mt-3 pt-3 border-t border-indigo-100">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ghi chú
                          </label>
                          <p className="text-gray-600 text-sm">
                            {participant.note}
                          </p>
                        </div>
                      )}

                      {/* Participant number badge */}
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-indigo-600 bg-indigo-100 rounded-full">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Summary */}
                  <div className="bg-indigo-100 rounded-lg p-3 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-indigo-900">
                        Tổng số người tham gia: {participants.length}
                      </span>
                      <span className="text-indigo-700">
                        {participants.filter((p) => p.age && p.age < 18).length}{" "}
                        trẻ em,{" "}
                        {
                          participants.filter((p) => !p.age || p.age >= 18)
                            .length
                        }{" "}
                        người lớn
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    Không có thông tin người tham gia
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Ghi Chú
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {appointment.notes}
              </p>
            </div>
          )}

          {/* Legal Notice */}
          {appointment.legalType === "Pháp Lý" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Lưu ý: Xét nghiệm pháp lý</p>
                <p>
                  Đây là xét nghiệm có giá trị pháp lý. Cần đảm bảo tuân thủ
                  đúng quy trình và thủ tục.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>

          <div className="flex items-center gap-3">
            {/* Status progression button */}
            {nextStatus &&
              appointment.status !== "Cancelled" &&
              appointment.status !== "Completed" && (
                <button
                  onClick={() =>
                    handleStatusUpdate(nextStatus as Appointment["status"])
                  }
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>
                    {nextStatus === "DeliveringKit" && "Giao kit"}
                    {nextStatus === "Confirmed" && "Xác nhận"}
                    {nextStatus === "KitDelivered" && "Đã giao kit"}
                    {nextStatus === "SampleReceived" && "Đã nhận mẫu"}
                    {nextStatus === "Testing" && "Bắt đầu XN"}
                    {nextStatus === "Completed" && "Hoàn thành"}
                  </span>
                </button>
              )}

            {/* Confirm button - only for pending appointments */}
            {appointment.status === "Pending" && (
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Xác nhận lịch hẹn</span>
              </button>
            )}

            {/* Cancel button - for non-completed appointments */}
            {appointment.status !== "Cancelled" &&
              appointment.status !== "Completed" && (
                <button
                  onClick={() => setShowConfirmCancel(true)}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Hủy lịch hẹn</span>
                </button>
              )}
          </div>
        </div>

        {/* Confirm Cancel Modal */}
        {showConfirmCancel && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Xác nhận hủy lịch hẹn
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn hủy lịch hẹn này? Hành động này không thể
                hoàn tác.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmCancel(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Không
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? "Đang hủy..." : "Xác nhận hủy"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentModal;
