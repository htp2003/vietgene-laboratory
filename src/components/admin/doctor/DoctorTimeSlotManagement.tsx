import React, { useState } from 'react';
import { FaPlus, FaClock, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaCalendarAlt, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { useDoctorTimeSlots } from '../../../hooks/useDoctorTimeSlots';
import { EnhancedDoctor } from '../../../hooks/useDoctor';
import { TimeSlotRequest, DAY_OPTIONS } from '../../../services/doctorTimeSlotService';

interface DoctorTimeSlotManagementProps {
  doctor: EnhancedDoctor;
}

const DoctorTimeSlotManagement: React.FC<DoctorTimeSlotManagementProps> = ({ doctor }) => {
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
  } = useDoctorTimeSlots(doctor.doctorId);

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
    doctorId: doctor.doctorId,
  });

  // View state
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterDay, setFilterDay] = useState<number | 'all'>('all');
  const [filterAvailability, setFilterAvailability] = useState<boolean | 'all'>('all');

  // Open modal for create/edit
  const handleOpenModal = (timeSlot: any = null) => {
    if (timeSlot) {
      setForm({
        dayOfWeek: timeSlot.dayOfWeek,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        isAvailable: timeSlot.isAvailable,
        doctorId: doctor.doctorId,
      });
      setEditingTimeSlot(timeSlot);
    } else {
      setForm({
        dayOfWeek: 1,
        startTime: '',
        endTime: '',
        isAvailable: true,
        doctorId: doctor.doctorId,
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
      doctorId: doctor.doctorId,
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
    
    console.log('🔍 Form submission data:', form);
    console.log('🔍 Editing time slot:', editingTimeSlot);
    
    // Validate required fields
    if (!form.startTime) {
      alert('Vui lòng chọn giờ bắt đầu');
      return;
    }

    if (!form.endTime) {
      alert('Vui lòng chọn giờ kết thúc');
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
    const conflictExists = hasTimeConflict(
      form.dayOfWeek, 
      form.startTime, 
      form.endTime, 
      editingTimeSlot?.id
    );
    
    console.log('🔍 Conflict check:', {
      dayOfWeek: form.dayOfWeek,
      startTime: form.startTime,
      endTime: form.endTime,
      excludeId: editingTimeSlot?.id,
      conflictExists
    });
    
    if (conflictExists) {
      alert('Khung giờ này bị trùng với khung giờ khác trong cùng ngày');
      return;
    }

    setSubmitting(true);

    try {
      let response;
      
      if (editingTimeSlot) {
        // For updates, always send complete data to ensure proper validation
        const completeUpdateData: TimeSlotRequest = {
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
          isAvailable: form.isAvailable,
          doctorId: form.doctorId,
        };
        
        console.log('🔍 Complete update data being sent:', completeUpdateData);
        response = await updateTimeSlot(editingTimeSlot.id, completeUpdateData);
        console.log('🔍 Update response:', response);
      } else {
        console.log('🔍 Create data being sent:', form);
        response = await createTimeSlot(form);
        console.log('🔍 Create response:', response);
      }

      if (response.success) {
        alert(response.message);
        handleCloseModal();
      } else {
        alert(`Lỗi: ${response.message}`);
      }
    } catch (err: any) {
      console.error('💥 Error submitting time slot:', err);
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

  // Toggle availability
  const handleToggleAvailability = async (timeSlot: any) => {
    try {
      const response = await toggleAvailability(timeSlot.id);
      
      if (response.success) {
        // Don't show alert for toggle - it's too frequent
      } else {
        alert(`Lỗi: ${response.message}`);
      }
    } catch (err: any) {
      console.error('Error toggling availability:', err);
      alert('Có lỗi xảy ra khi thay đổi trạng thái');
    }
  };

  // Filter time slots
  const getFilteredTimeSlots = () => {
    let filtered = timeSlots;
    
    if (filterDay !== 'all') {
      filtered = filtered.filter(slot => slot.dayOfWeek === filterDay);
    }
    
    if (filterAvailability !== 'all') {
      filtered = filtered.filter(slot => slot.isAvailable === filterAvailability);
    }
    
    return filtered;
  };

  const filteredTimeSlots = getFilteredTimeSlots();
  const groupedTimeSlots = getTimeSlotsGroupedByDay();
  const stats = getTimeSlotStats();

  // Form validation
  const isFormValid = () => {
    return form.startTime && 
           form.endTime && 
           new Date(`1970-01-01T${form.endTime}:00`) > new Date(`1970-01-01T${form.startTime}:00`);
  };

  return (
    <div className="bg-white rounded-lg shadow mt-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaClock className="text-blue-600" />
              Lịch làm việc
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Quản lý khung giờ làm việc của bác sĩ {doctor.doctorName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm rounded-l-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Danh sách
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm rounded-r-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Lưới
              </button>
            </div>
            
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus size={14} />
              Thêm khung giờ
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Tổng khung giờ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <div className="text-sm text-gray-600">Có sẵn</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.unavailable}</div>
            <div className="text-sm text-gray-600">Không có sẵn</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả các ngày</option>
              {DAY_OPTIONS.map(day => (
                <option key={day.value} value={day.value}>{day.label}</option>
              ))}
            </select>
          </div>
          <div className="lg:w-48">
            <select
              value={filterAvailability === 'all' ? 'all' : filterAvailability.toString()}
              onChange={(e) => {
                const value = e.target.value;
                setFilterAvailability(value === 'all' ? 'all' : value === 'true');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="true">Có sẵn</option>
              <option value="false">Không có sẵn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="px-6 py-8 text-center">
          <div className="inline-flex items-center gap-2 text-blue-600">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            Đang tải...
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="px-6 py-8 text-center">
          <div className="text-red-600">{error.message}</div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {viewMode === 'list' ? (
            /* List View */
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giờ bắt đầu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giờ kết thúc
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTimeSlots.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        {filterDay !== 'all' || filterAvailability !== 'all' ? 'Không có khung giờ phù hợp' : 'Chưa có khung giờ nào'}
                      </td>
                    </tr>
                  ) : (
                    filteredTimeSlots.map((timeSlot) => {
                      const display = getTimeSlotDisplay(timeSlot);
                      
                      return (
                        <tr key={timeSlot.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-blue-500" size={14} />
                              <span className="font-medium text-gray-900">
                                {display.dayName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-900 font-mono">
                            {formatTime(timeSlot.startTime)}
                          </td>
                          <td className="px-6 py-4 text-gray-900 font-mono">
                            {formatTime(timeSlot.endTime)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                timeSlot.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {display.status}
                              </span>
                              <button
                                onClick={() => handleToggleAvailability(timeSlot)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title={timeSlot.isAvailable ? 'Đặt không có sẵn' : 'Đặt có sẵn'}
                              >
                                {timeSlot.isAvailable ? (
                                  <FaToggleOn className="text-green-500" size={20} />
                                ) : (
                                  <FaToggleOff className="text-gray-400" size={20} />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenModal(timeSlot)}
                                className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                                title="Chỉnh sửa"
                              >
                                <FaEdit size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(timeSlot)}
                                className="text-red-600 hover:text-red-900 transition-colors p-1"
                                title="Xóa"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {DAY_OPTIONS.map(day => {
                  const daySlots = groupedTimeSlots[day.value] || [];
                  const visibleSlots = filterAvailability === 'all' 
                    ? daySlots 
                    : daySlots.filter(slot => slot.isAvailable === filterAvailability);
                  
                  return (
                    <div key={day.value} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-500" size={14} />
                        {day.label}
                        <span className="text-xs text-gray-500">({daySlots.length})</span>
                      </h4>
                      
                      {visibleSlots.length === 0 ? (
                        <p className="text-gray-400 text-sm">Không có khung giờ</p>
                      ) : (
                        <div className="space-y-2">
                          {visibleSlots.map(slot => {
                            const display = getTimeSlotDisplay(slot);
                            return (
                              <div key={slot.id} className={`p-2 rounded border-l-4 ${
                                slot.isAvailable ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                              }`}>
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-mono text-sm">
                                      {display.timeRange}
                                    </div>
                                    <div className={`text-xs ${display.statusColor}`}>
                                      {display.status}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 ml-2">
                                    <button
                                      onClick={() => handleToggleAvailability(slot)}
                                      className="text-gray-400 hover:text-gray-600"
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
                                      className="text-blue-600 hover:text-blue-900"
                                      title="Chỉnh sửa"
                                    >
                                      <FaEdit size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(slot)}
                                      className="text-red-600 hover:text-red-900"
                                      title="Xóa"
                                    >
                                      <FaTrash size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
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
                    {editingTimeSlot ? 'Cập nhật thông tin khung giờ' : 'Tạo khung giờ làm việc mới'}
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
                      <div className="flex items-center gap-2">
                        <FaClock size={14} />
                        Giờ bắt đầu <span className="text-red-500">*</span>
                      </div>
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
                      <div className="flex items-center gap-2">
                        <FaClock size={14} />
                        Giờ kết thúc <span className="text-red-500">*</span>
                      </div>
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

                {/* Time validation message */}
                {form.startTime && form.endTime && new Date(`1970-01-01T${form.endTime}:00`) <= new Date(`1970-01-01T${form.startTime}:00`) && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <FaExclamationTriangle size={14} />
                    Giờ kết thúc phải sau giờ bắt đầu
                  </div>
                )}

                {/* Conflict warning */}
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
                        <FaToggleOn className="text-green-500" size={16} />
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
                        <FaToggleOff className="text-gray-400" size={16} />
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
                        Lưu ý về khung giờ
                      </h4>
                      <p className="text-sm text-blue-700">
                        Khung giờ không được trùng lặp trong cùng một ngày. 
                        Bạn có thể thay đổi trạng thái có sẵn/không có sẵn bất cứ lúc nào.
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

export default DoctorTimeSlotManagement;