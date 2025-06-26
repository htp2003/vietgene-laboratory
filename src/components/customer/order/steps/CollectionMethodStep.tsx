import React from "react";
import { Home, Truck, User, Clock, AlertCircle } from "lucide-react";
import { OrderForm } from "../../../../hooks/useOrderBooking";
import { Doctor, TimeSlot } from "../../../../services/orderService";

interface CollectionMethodStepProps {
  formData: OrderForm;
  updateFormData: (section: keyof OrderForm, data: any) => void;
  doctors: Doctor[];
  availableTimeSlots: TimeSlot[];
  onDoctorSelect: (doctorId: string) => void;
  onTimeSlotSelect: (timeSlotId: string) => void;
  getDayName: (dayOfWeek: number) => string;
}

export const CollectionMethodStep: React.FC<CollectionMethodStepProps> = ({
  formData,
  updateFormData,
  doctors,
  availableTimeSlots,
  onDoctorSelect,
  onTimeSlotSelect,
  getDayName,
}) => {
  const handleDoctorSelect = (doctorId: string) => {
    onDoctorSelect(doctorId);
    updateFormData("serviceInfo", {
      doctorId,
      timeSlotId: "",
      appointmentTime: "",
    });
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    const timeSlot = availableTimeSlots.find(
      (slot) => slot.id.toString() === timeSlotId
    );
    if (timeSlot) {
      onTimeSlotSelect(timeSlotId);
      updateFormData("serviceInfo", {
        timeSlotId,
        appointmentTime: `${timeSlot.startTime} - ${timeSlot.endTime}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Phương thức lấy mẫu</h2>

      {/* Collection Method Selection */}
      <div className="grid md:grid-cols-2 gap-6">
        <div
          className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
            formData.serviceInfo.collectionMethod === "home"
              ? "border-red-500 bg-red-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() =>
            updateFormData("serviceInfo", { collectionMethod: "home" })
          }
        >
          <div className="flex items-center gap-3 mb-4">
            <Home className="w-8 h-8 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Lấy mẫu tại nhà
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Chúng tôi sẽ gửi kit lấy mẫu đến địa chỉ của bạn. Bạn có thể tự lấy
            mẫu và gửi lại.
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Thuận tiện, riêng tư</li>
            <li>• Hướng dẫn chi tiết đi kèm</li>
            <li>• Miễn phí vận chuyển</li>
            <li>• Kit được gửi trong 2-3 ngày</li>
          </ul>
        </div>

        <div
          className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
            formData.serviceInfo.collectionMethod === "facility"
              ? "border-red-500 bg-red-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() =>
            updateFormData("serviceInfo", {
              collectionMethod: "facility",
            })
          }
        >
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-8 h-8 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Lấy mẫu tại cơ sở
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Đến trực tiếp cơ sở của chúng tôi để lấy mẫu với sự hỗ trợ của
            chuyên viên.
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Chuyên nghiệp, chính xác</li>
            <li>• Tư vấn trực tiếp từ bác sĩ</li>
            <li>• Nhanh chóng, tiết kiệm thời gian</li>
            <li>• Đảm bảo chất lượng mẫu</li>
          </ul>
        </div>
      </div>

      {/* Facility Collection - Doctor and Time Selection */}
      {formData.serviceInfo.collectionMethod === "facility" && (
        <>
          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn bác sĩ tư vấn *
            </label>

            <div className="grid md:grid-cols-2 gap-4">
              {doctors.map((doctor, index) => {
                const doctorId =
                  doctor.doctorId ||
                  doctor.id ||
                  doctor.userId ||
                  index.toString();

                return (
                  <div
                    key={doctorId}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.serviceInfo.doctorId === doctorId
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleDoctorSelect(doctorId)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {doctor.doctorName ||
                            doctor.name ||
                            `Bác sĩ ${
                              doctor.doctorCode || doctor.code || index + 1
                            }`}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Chuyên gia xét nghiệm DNA
                        </p>
                        <div className="space-y-1 text-xs text-gray-500">
                          <p>
                            Mã BS: {doctor.doctorCode || doctor.code || "N/A"}
                          </p>
                          {doctor.doctorEmail && <p>{doctor.doctorEmail}</p>}
                          {doctor.doctorPhone && <p>{doctor.doctorPhone}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {doctors.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Hiện không có bác sĩ nào khả dụng
                </p>
              </div>
            )}
          </div>

          {/* Time Slot Selection */}
          {formData.serviceInfo.doctorId && availableTimeSlots.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Chọn khung giờ *
              </label>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableTimeSlots
                  .filter((slot) => slot.isAvailable)
                  .map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                        formData.serviceInfo.timeSlotId === slot.id.toString()
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleTimeSlotSelect(slot.id.toString())}
                    >
                      <div className="font-medium text-sm">
                        {getDayName(slot.dayOfWeek)}
                      </div>
                      <div className="text-lg font-semibold">
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </div>
                  ))}
              </div>
              {availableTimeSlots.filter((slot) => slot.isAvailable).length ===
                0 && (
                <div className="text-center py-4">
                  <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">
                    Bác sĩ này hiện không có lịch trống
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Appointment Date */}
          {formData.serviceInfo.timeSlotId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày hẹn *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={formData.serviceInfo.appointmentDate}
                onChange={(e) =>
                  updateFormData("serviceInfo", {
                    appointmentDate: e.target.value,
                  })
                }
              />
              {formData.serviceInfo.appointmentTime && (
                <p className="text-sm text-gray-600 mt-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Thời gian: {formData.serviceInfo.appointmentTime}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ghi chú thêm
        </label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          placeholder="Bất kỳ yêu cầu đặc biệt nào..."
          value={formData.serviceInfo.notes}
          onChange={(e) =>
            updateFormData("serviceInfo", { notes: e.target.value })
          }
        />
      </div>
    </div>
  );
};
