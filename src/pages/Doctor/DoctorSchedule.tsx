import React, { useState, useEffect } from 'react';
import {
  FaClock,
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
  FaUserMd,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarCheck
} from 'react-icons/fa';
import useDoctorTimeSlots from '../../hooks/useDoctorTimeSlots';
import { TimeSlotRequest, DAY_OPTIONS } from '../../services/doctorTimeSlotService';

interface DoctorScheduleProps {
  doctorId: string;
}
export default function DoctorSchedule({ doctorId }: DoctorScheduleProps) {
  const {
    timeSlots,
    loading,
    error,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    toggleAvailability,
    getTimeSlotStats,
    getTimeSlotsGroupedByDay,
    hasTimeConflict,
    getTimeSlotDisplay,
    formatTime,
    getDayName,
  } = useDoctorTimeSlots(doctorId);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState<TimeSlotRequest>({
    dayOfWeek: 1,
    startTime: '',
    endTime: '',
    isAvailable: true,
    doctorId: doctorId,
  });

  // View preferences
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());

  // Get current week dates
  const getCurrentWeekDates = (): Date[] => {
    const startOfWeek = new Date(selectedWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    const weekDates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  // Open modal for create/edit
  const handleOpenModal = (timeSlot: any = null, presetDay?: number) => {
    if (timeSlot) {
      setForm({
        dayOfWeek: timeSlot.dayOfWeek,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        isAvailable: timeSlot.isAvailable,
        doctorId: doctorId,
      });
      setEditingTimeSlot(timeSlot);
    } else {
      setForm({
        dayOfWeek: presetDay ?? 1,
        startTime: '',
        endTime: '',
        isAvailable: true,
        doctorId: doctorId,
      });
      setEditingTimeSlot(null);
    }
    setModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTimeSlot(null);
    setForm({
      dayOfWeek: 1,
      startTime: '',
      endTime: '',
      isAvailable: true,
      doctorId: doctorId,
    });
  };

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'isAvailable') {
      setForm(prev => ({ ...prev, isAvailable: value === 'true' }));
    } else if (name === 'dayOfWeek') {
      setForm(prev => ({ ...prev, dayOfWeek: parseInt(value) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.startTime || !form.endTime) {
      alert('Vui lòng chọn giờ bắt đầu và kết thúc');
      return;
    }

    // Validate time order
    const startTime = new Date(`1970-01-01T${form.startTime}:00`);
    const endTime = new Date(`1970-01-01T${form.endTime}:00`);
    
    if (endTime <= startTime) {
      alert('Giờ kết thúc phải sau giờ bắt đầu');
      return;
    }

    // Check for time conflicts
    if (hasTimeConflict(form.dayOfWeek, form.startTime, form.endTime, editingTimeSlot?.id)) {
      alert('Khung giờ này bị trùng với khung giờ khác trong cùng ngày');
      return;
    }

    setSubmitting(true);

    try {
      let response;
      
      if (editingTimeSlot) {
        response = await updateTimeSlot(editingTimeSlot.id, form);
      } else {
        response = await createTimeSlot(form);
      }

      if (response.success) {
        alert(response.message);
        handleCloseModal();
      } else {
        alert(`Lỗi: ${response.message}`);
      }
    } catch (err: any) {
      console.error('Error submitting time slot:', err);
      alert('Có lỗi xảy ra khi lưu khung giờ');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete time slot
  const handleDelete = async (timeSlot: any) => {
    const display = getTimeSlotDisplay(timeSlot);
    if (window.confirm(`Bạn có chắc muốn xóa khung giờ "${display.dayName} ${display.timeRange}"?`)) {
      try {
        const response = await deleteTimeSlot(timeSlot.id);
        if (response.success) {
          alert(response.message);
        } else {
          alert(`Lỗi: ${response.message}`);
        }
      } catch (err: any) {
        console.error('Error deleting time slot:', err);
        alert('Có lỗi xảy ra khi xóa khung giờ');
      }
    }
  };

  // Quick toggle availability  
  const handleQuickToggle = async (timeSlot: any) => {
    console.log('Before toggle - timeSlot:', timeSlot);
    
    try {
      // Chuyển đổi format thời gian từ HH:mm:ss về HH:mm
      const formatTimeForAPI = (time: string) => {
        if (time.includes(':')) {
          const parts = time.split(':');
          return `${parts[0]}:${parts[1]}`; 
        }
        return time;
      };
      
      // Gọi trực tiếp updateTimeSlot với format thời gian đúng
      const result = await updateTimeSlot(timeSlot.id, {
        isAvailable: !timeSlot.isAvailable,
        startTime: formatTimeForAPI(timeSlot.startTime),
        endTime: formatTimeForAPI(timeSlot.endTime),
        dayOfWeek: timeSlot.dayOfWeek,
        doctorId: timeSlot.doctorId
      });
        
      if (result.success) {
        console.log('Toggle successful!');
      } else {
        console.error('Toggle failed:', result.message);
        alert(`Lỗi: ${result.message}`);
      }
    } catch (err: any) {
      console.error('Error toggling availability:', err);
      alert('Có lỗi xảy ra khi thay đổi trạng thái');
    }
  };

  // Navigate week
  const navigateWeek = (direction: 'prev' | 'next'): void => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(newDate);
  };

  const groupedTimeSlots = getTimeSlotsGroupedByDay();
  const stats = getTimeSlotStats();
  const weekDates: Date[] = getCurrentWeekDates();
  
  const isFormValid = (): boolean => {
    return !!(form.startTime && 
           form.endTime && 
           new Date(`1970-01-01T${form.endTime}:00`) > new Date(`1970-01-01T${form.startTime}:00`));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaUserMd className="text-blue-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Lịch làm việc của tôi
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý lịch làm việc cá nhân của bạn
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FaPlus size={16} />
                Thêm khung giờ
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Tổng khung giờ</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                </div>
                <FaClock className="text-blue-400" size={24} />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Đang có sẵn</p>
                  <p className="text-2xl font-bold text-green-800">{stats.available}</p>
                </div>
                <FaCheckCircle className="text-green-400" size={24} />
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Không có sẵn</p>
                  <p className="text-2xl font-bold text-red-800">{stats.unavailable}</p>
                </div>
                <FaExclamationTriangle className="text-red-400" size={24} />
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Ngày làm việc</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {Object.keys(groupedTimeSlots).length}
                  </p>
                </div>
                <FaCalendarCheck className="text-purple-400" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigator */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateWeek('prev')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Tuần trước
            </button>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Tuần từ {weekDates[0].toLocaleDateString('vi-VN')} đến {weekDates[6].toLocaleDateString('vi-VN')}
              </h3>
            </div>
            <button
              onClick={() => navigateWeek('next')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Tuần sau →
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="inline-flex items-center gap-3 text-blue-600">
            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="font-medium">Đang tải lịch làm việc...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-red-600 mb-4">
            <FaExclamationTriangle size={48} className="mx-auto mb-4" />
            <p className="font-medium">{error.message}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Schedule Grid */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-600" />
                Lịch tuần này
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {DAY_OPTIONS.map((day, index) => {
                const daySlots = groupedTimeSlots[day.value] || [];
                const currentDate = weekDates[index];
                const isToday = new Date().toDateString() === currentDate.toDateString();
                
                return (
                  <div 
                    key={day.value} 
                    className={`border rounded-lg p-4 ${
                      isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    {/* Day Header */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${
                          isToday ? 'text-blue-800' : 'text-gray-800'
                        }`}>
                          {day.label}
                        </h3>
                        <button
                          onClick={() => handleOpenModal(null, day.value)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                          title="Thêm khung giờ"
                        >
                          <FaPlus size={14} />
                        </button>
                      </div>
                      <p className={`text-sm ${
                        isToday ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {currentDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </p>
                      {isToday && (
                        <p className="text-xs text-blue-600 font-medium">Hôm nay</p>
                      )}
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-2 min-h-[200px]">
                      {daySlots.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                          <FaClock size={24} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Chưa có lịch</p>
                        </div>
                      ) : (
                        daySlots.map(slot => {
                          const display = getTimeSlotDisplay(slot);
                          return (
                            <div 
                              key={slot.id} 
                              className={`p-3 rounded-lg border-l-4 transition-all duration-200 ${
                                slot.isAvailable 
                                  ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                                  : 'border-red-500 bg-red-50 hover:bg-red-100'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-mono text-sm font-medium text-gray-800">
                                    {display.timeRange}
                                  </div>
                                  <div className={`text-xs mt-1 ${display.statusColor}`}>
                                    {display.status}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1 ml-2">
                                  <button
                                    onClick={() => handleQuickToggle(slot)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                    title={slot.isAvailable ? 'Đặt không có sẵn' : 'Đặt có sẵn'}
                                  >
                                    {slot.isAvailable ? (
                                      <FaToggleOn className="text-green-500" size={16} />
                                    ) : (
                                      <FaToggleOff className="text-gray-400" size={16} />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleOpenModal(slot)}
                                    className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                                    title="Chỉnh sửa"
                                  >
                                    <FaEdit size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(slot)}
                                    className="text-red-600 hover:text-red-800 transition-colors p-1"
                                    title="Xóa"
                                  >
                                    <FaTrash size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaClock className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingTimeSlot ? 'Chỉnh sửa khung giờ' : 'Thêm khung giờ mới'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Lịch làm việc cá nhân
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Day of Week */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt size={14} />
                      Ngày trong tuần <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <select
                    name="dayOfWeek"
                    value={form.dayOfWeek}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                    disabled={submitting}
                  >
                    {DAY_OPTIONS.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>

                {/* Time Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giờ bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={form.startTime}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giờ kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={form.endTime}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                      disabled={submitting}
                      min={form.startTime}
                    />
                  </div>
                </div>

                {/* Validation Messages */}
                {form.startTime && form.endTime && new Date(`1970-01-01T${form.endTime}:00`) <= new Date(`1970-01-01T${form.startTime}:00`) && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <FaExclamationTriangle size={14} />
                    Giờ kết thúc phải sau giờ bắt đầu
                  </div>
                )}

                {form.startTime && form.endTime && isFormValid() && hasTimeConflict(form.dayOfWeek, form.startTime, form.endTime, editingTimeSlot?.id) && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                    <FaExclamationTriangle size={14} />
                    Khung giờ này bị trùng với khung giờ khác trong cùng ngày
                  </div>
                )}

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isAvailable"
                        value="true"
                        checked={form.isAvailable === true}
                        onChange={handleFormChange}
                        disabled={submitting}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="flex items-center gap-2 text-sm">
                        <FaCheckCircle className="text-green-500" size={16} />
                        Có sẵn
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isAvailable"
                        value="false"
                        checked={form.isAvailable === false}
                        onChange={handleFormChange}
                        disabled={submitting}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="flex items-center gap-2 text-sm">
                        <FaExclamationTriangle className="text-red-500" size={16} />
                        Không có sẵn
                      </span>
                    </label>
                  </div>
                </div>

                {/* Information Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded">
                      <FaClock className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-1">
                        Mẹo sử dụng
                      </h4>
                      <p className="text-sm text-blue-700">
                        Bạn có thể nhanh chóng bật/tắt khung giờ bằng nút toggle. 
                        Khung giờ "Không có sẵn" vẫn hiển thị nhưng bệnh nhân không thể đặt lịch.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={submitting}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting || !isFormValid() || hasTimeConflict(form.dayOfWeek, form.startTime, form.endTime, editingTimeSlot?.id)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium flex items-center gap-2 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    {editingTimeSlot ? (
                      <>
                        <FaClock size={16} />
                        Cập nhật
                      </>
                    ) : (
                      <>
                        <FaClock size={16} />
                        Thêm khung giờ
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};