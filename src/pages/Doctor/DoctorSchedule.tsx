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
  FaCalendarCheck,
  FaCalendarPlus,
  FaHistory,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaFilter,
  FaEye,
  FaCalendarWeek,
  FaCalendarDay
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
    getTimeSlotsGroupedByDate,
    getTimeSlotsForWeek,
    getTodayTimeSlots,
    getTomorrowTimeSlots,
    getUpcomingTimeSlots,
    getAvailableTimeSlots,
    hasTimeConflict,
    getTimeSlotDisplay,
    formatTime,
    getDayName,
    searchTimeSlots,
  } = useDoctorTimeSlots(doctorId);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState<TimeSlotRequest>({
    dayOfWeek: 1,
    specificDate: '',
    startTime: '',
    endTime: '',
    isAvailable: true,
    doctorId: doctorId,
  });

  // View preferences
  const [selectedWeek, setSelectedWeek] = useState<Date>(() => {
    const today = new Date();
    console.log('Initial selectedWeek:', today.toISOString().split('T')[0], 'dayOfWeek:', today.getDay());
    return today;
  });
  const [viewMode, setViewMode] = useState<'week' | 'upcoming' | 'all'>('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailable, setFilterAvailable] = useState<'all' | 'available' | 'unavailable'>('all');

  // Get current week dates (Sunday to Saturday)
  const getCurrentWeekDates = (): Date[] => {
    const currentDate = new Date(selectedWeek);
    const day = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Tính ngày Chủ nhật của tuần này
    const sunday = new Date(currentDate);
    sunday.setDate(currentDate.getDate() - day);
    
    const weekDates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      weekDates.push(date);
    }
    
    // Debug: So sánh với dữ liệu từ API
    console.log('=== WEEK CALCULATION DEBUG ===');
    console.log('Current selected week:', selectedWeek.toISOString().split('T')[0]);
    console.log('Week dates calculated:', weekDates.map(d => ({
      date: formatDateForInput(d),
      dayOfWeek: d.getDay(),
      dayName: DAY_OPTIONS[d.getDay()].label
    })));
    
    // Kiểm tra xem ngày 19/7/2025 có trong tuần này không
    const testDate = '2025-07-19';
    const testDayOfWeek = getDayOfWeekFromDate(testDate);
    console.log(`Test date ${testDate}:`, {
      calculatedDayOfWeek: testDayOfWeek,
      expectedDayName: DAY_OPTIONS[testDayOfWeek].label,
      isInCurrentWeek: weekDates.some(d => formatDateForInput(d) === testDate)
    });
    
    return weekDates;
  };

  // Format date for input
  const formatDateForInput = (date: Date): string => {
    // Sử dụng UTC để tránh vấn đề timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get day of week from date
  const getDayOfWeekFromDate = (dateStr: string): number => {
    return new Date(dateStr).getDay();
  };

  // Get filtered time slots based on current filters
  const getFilteredTimeSlots = () => {
    let filtered = timeSlots;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = searchTimeSlots(searchTerm);
    }

    // Apply availability filter
    if (filterAvailable === 'available') {
      filtered = filtered.filter(slot => slot.isAvailable);
    } else if (filterAvailable === 'unavailable') {
      filtered = filtered.filter(slot => !slot.isAvailable);
    }

    // Apply view mode filter
    if (viewMode === 'week') {
      const weekDates = getCurrentWeekDates();
      const weekStart = weekDates[0];
      const weekEnd = weekDates[6];
      
      // Set to start of day for proper comparison
      weekStart.setHours(0, 0, 0, 0);
      weekEnd.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(slot => {
        const slotDate = new Date(slot.specificDate);
        slotDate.setHours(0, 0, 0, 0);
        return slotDate >= weekStart && slotDate <= weekEnd;
      });
    } else if (viewMode === 'upcoming') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(slot => {
        const slotDate = new Date(slot.specificDate);
        slotDate.setHours(0, 0, 0, 0);
        return slotDate >= today;
      });
    }

    return filtered;
  };

  // Open modal for create/edit
  const handleOpenModal = (timeSlot: any = null, presetDate?: string) => {
    if (timeSlot) {
      setForm({
        dayOfWeek: timeSlot.dayOfWeek,
        specificDate: timeSlot.specificDate,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        isAvailable: timeSlot.isAvailable,
        doctorId: doctorId,
      });
      setEditingTimeSlot(timeSlot);
    } else {
      const today = new Date();
      const defaultDate = presetDate || formatDateForInput(today);
      const dayOfWeek = getDayOfWeekFromDate(defaultDate);
      
      setForm({
        dayOfWeek: dayOfWeek,
        specificDate: defaultDate,
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
    const today = new Date();
    setForm({
      dayOfWeek: today.getDay(),
      specificDate: formatDateForInput(today),
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
    } else if (name === 'specificDate') {
      const dayOfWeek = getDayOfWeekFromDate(value);
      setForm(prev => ({ ...prev, specificDate: value, dayOfWeek }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.startTime || !form.endTime || !form.specificDate) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Validate time order
    const startTime = new Date(`1970-01-01T${form.startTime}:00`);
    const endTime = new Date(`1970-01-01T${form.endTime}:00`);
    
    if (endTime <= startTime) {
      alert('Giờ kết thúc phải sau giờ bắt đầu');
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(form.specificDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      alert('Không thể tạo khung giờ cho ngày đã qua');
      return;
    }

    // Check for time conflicts
    if (hasTimeConflict(form.dayOfWeek, form.specificDate, form.startTime, form.endTime, editingTimeSlot?.id)) {
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
    if (window.confirm(`Bạn có chắc muốn xóa khung giờ "${display.shortDate} ${display.timeRange}"?`)) {
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
      // Format time for API
      const formatTimeForAPI = (time: string) => {
        if (time.includes(':')) {
          const parts = time.split(':');
          return `${parts[0]}:${parts[1]}`; 
        }
        return time;
      };
      
      // Call updateTimeSlot with correct format
      const result = await updateTimeSlot(timeSlot.id, {
        isAvailable: !timeSlot.isAvailable,
        startTime: formatTimeForAPI(timeSlot.startTime),
        endTime: formatTimeForAPI(timeSlot.endTime),
        dayOfWeek: timeSlot.dayOfWeek,
        specificDate: timeSlot.specificDate,
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

  // Quick actions
  const goToToday = () => {
    setSelectedWeek(new Date());
  };

  const goToTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedWeek(tomorrow);
  };

  const groupedTimeSlots = getTimeSlotsGroupedByDate();
  const stats = getTimeSlotStats();
  const weekDates: Date[] = getCurrentWeekDates();
  const filteredTimeSlots = getFilteredTimeSlots();
  const todaySlots = getTodayTimeSlots();
  const tomorrowSlots = getTomorrowTimeSlots();
  const upcomingSlots = getUpcomingTimeSlots(7);
  const availableSlots = getAvailableTimeSlots();
  
  // Debug logs - more detailed
  console.log('=== DEBUG INFO ===');
  
  // Verify date calculation
  const testDate = new Date('2025-07-19');
  console.log('2025-07-19 actual dayOfWeek:', testDate.getDay()); // Should be 6 (Saturday)
  
  // Check what day today is
  const today = new Date();
  console.log('Today:', today.toISOString().split('T')[0], 'dayOfWeek:', today.getDay());
  
  console.log('Current week dates:', weekDates.map(d => ({
    date: d.toISOString().split('T')[0],
    dayOfWeek: d.getDay(),
    dayName: DAY_OPTIONS.find(day => day.value === d.getDay())?.label
  })));
  
  console.log('All time slots:', timeSlots.map(slot => ({
    id: slot.id,
    specificDate: slot.specificDate,
    dayOfWeek: slot.dayOfWeek,
    startTime: slot.startTime,
    endTime: slot.endTime,
    isAvailable: slot.isAvailable
  })));
  
  // Check each day of the week
  weekDates.forEach((date, index) => {
    const dateStr = formatDateForInput(date);
    const slotsForDate = timeSlots.filter(slot => slot.specificDate === dateStr);
    console.log(`${dateStr} (${DAY_OPTIONS[date.getDay()].label}):`, slotsForDate.length, 'slots');
  });
  
  // Check specific dates
  const targetDate1 = '2025-07-19';
  const targetSlots1 = timeSlots.filter(slot => slot.specificDate === targetDate1);
  console.log(`Slots for ${targetDate1}:`, targetSlots1);
  
  const targetDate2 = '2025-07-20';
  const targetSlots2 = timeSlots.filter(slot => slot.specificDate === targetDate2);
  console.log(`Slots for ${targetDate2}:`, targetSlots2);
  
  console.log('==================');
  
  const isFormValid = (): boolean => {
    return !!(form.startTime && 
           form.endTime && 
           form.specificDate &&
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
                  Quản lý lịch làm việc theo ngày cụ thể
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Tổng khung giờ</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                </div>
                <FaClock className="text-blue-400" size={20} />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Đang có sẵn</p>
                  <p className="text-2xl font-bold text-green-800">{stats.available}</p>
                </div>
                <FaCheckCircle className="text-green-400" size={20} />
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Không có sẵn</p>
                  <p className="text-2xl font-bold text-red-800">{stats.unavailable}</p>
                </div>
                <FaExclamationTriangle className="text-red-400" size={20} />
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Hôm nay</p>
                  <p className="text-2xl font-bold text-purple-800">{todaySlots.length}</p>
                </div>
                <FaCalendarDay className="text-purple-400" size={20} />
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Ngày mai</p>
                  <p className="text-2xl font-bold text-orange-800">{tomorrowSlots.length}</p>
                </div>
                <FaCalendarPlus className="text-orange-400" size={20} />
              </div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-600 text-sm font-medium">7 ngày tới</p>
                  <p className="text-2xl font-bold text-indigo-800">{upcomingSlots.length}</p>
                </div>
                <FaCalendarWeek className="text-indigo-400" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="px-6 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* View Mode Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Chế độ xem:</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'week' | 'upcoming' | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Tuần này</option>
                <option value="upcoming">Sắp tới</option>
                <option value="all">Tất cả</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Tìm kiếm khung giờ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" size={16} />
              <select
                value={filterAvailable}
                onChange={(e) => setFilterAvailable(e.target.value as 'all' | 'available' | 'unavailable')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="available">Có sẵn</option>
                <option value="unavailable">Không có sẵn</option>
              </select>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Hôm nay
              </button>
              <button
                onClick={goToTomorrow}
                className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                Ngày mai
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigator (only show in week view) */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateWeek('prev')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaChevronLeft size={16} />
                Tuần trước
              </button>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Tuần từ {weekDates[0].toLocaleDateString('vi-VN')} đến {weekDates[6].toLocaleDateString('vi-VN')}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredTimeSlots.length} khung giờ
                </p>
              </div>
              <button
                onClick={() => navigateWeek('next')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Tuần sau
                <FaChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Schedule Display */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-600" />
                {viewMode === 'week' ? 'Lịch tuần này' : 
                 viewMode === 'upcoming' ? 'Lịch sắp tới' : 'Tất cả lịch làm việc'}
              </h2>
              <p className="text-sm text-gray-500">
                {filteredTimeSlots.length} khung giờ
              </p>
            </div>
          </div>

          <div className="p-6">
            {filteredTimeSlots.length === 0 ? (
              <div className="text-center py-12">
                <FaCalendarAlt size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg mb-2">Không có khung giờ nào</p>
                <p className="text-gray-400 text-sm mb-4">
                  {searchTerm ? 'Không tìm thấy khung giờ phù hợp với từ khóa tìm kiếm' : 'Bạn chưa có khung giờ làm việc nào'}
                </p>
                <button
                  onClick={() => handleOpenModal()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thêm khung giờ đầu tiên
                </button>
              </div>
            ) : viewMode === 'week' ? (
              // Week View
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {weekDates.map((date, index) => {
                  const dateStr = formatDateForInput(date);
                  // Get slots for this specific date
                  const daySlots = timeSlots.filter(slot => {
                    const slotDate = slot.specificDate;
                    console.log(`Checking date ${dateStr} vs slot date ${slotDate}, slot dayOfWeek: ${slot.dayOfWeek}, date dayOfWeek: ${date.getDay()}`);
                    return slotDate === dateStr;
                  });
                  
                  console.log(`Date ${dateStr} (${date.getDay()}) has ${daySlots.length} slots:`, daySlots);
                  
                  const isToday = new Date().toDateString() === date.toDateString();
                  const isPast = date < new Date();
                  
                  return (
                    <div 
                      key={dateStr} 
                      className={`border rounded-lg p-4 ${
                        isToday ? 'border-blue-500 bg-blue-50' : 
                        isPast ? 'border-gray-200 bg-gray-50' : 'border-gray-200'
                      }`}
                    >
                      {/* Day Header */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-semibold ${
                            isToday ? 'text-blue-800' : 
                            isPast ? 'text-gray-500' : 'text-gray-800'
                          }`}>
                            {DAY_OPTIONS[date.getDay()].label}
                          </h3>
                          {!isPast && (
                            <button
                              onClick={() => handleOpenModal(null, dateStr)}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                              title="Thêm khung giờ"
                            >
                              <FaPlus size={14} />
                            </button>
                          )}
                        </div>
                        <p className={`text-sm ${
                          isToday ? 'text-blue-600' : 
                          isPast ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                        </p>
                        {isToday && (
                          <p className="text-xs text-blue-600 font-medium">Hôm nay</p>
                        )}
                        {isPast && (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <FaHistory size={10} />
                            Đã qua
                          </p>
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
                                } ${display.isPast ? 'opacity-60' : ''}`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-mono text-sm font-medium text-gray-800">
                                      {display.timeRange}
                                    </div>
                                    <div className={`text-xs mt-1 ${display.statusColor}`}>
                                      {display.status}
                                    </div>
                                    {display.isPast && (
                                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <FaHistory size={10} />
                                        Đã qua
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-1 ml-2">
                                    {!display.isPast && (
                                      <>
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
                                      </>
                                    )}
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
            ) : (
              // List View for upcoming and all
              <div className="space-y-4">
                {Object.entries(groupedTimeSlots)
                  .filter(([dateStr]) => {
                    if (viewMode === 'upcoming') {
                      const date = new Date(dateStr);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date >= today;
                    }
                    return true;
                  })
                  .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                  .map(([dateStr, slots]) => {
                    const date = new Date(dateStr);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isPast = date < new Date();
                    const dayName = DAY_OPTIONS[date.getDay()].label;
                    
                    // Filter slots based on search and availability filter
                    const filteredSlots = slots.filter(slot => {
                      let matchesSearch = true;
                      let matchesAvailability = true;
                      
                      if (searchTerm.trim()) {
                        const searchLower = searchTerm.toLowerCase();
                        matchesSearch = 
                          slot.startTime.toLowerCase().includes(searchLower) ||
                          slot.endTime.toLowerCase().includes(searchLower) ||
                          dayName.toLowerCase().includes(searchLower) ||
                          dateStr.includes(searchLower);
                      }
                      
                      if (filterAvailable === 'available') {
                        matchesAvailability = slot.isAvailable;
                      } else if (filterAvailable === 'unavailable') {
                        matchesAvailability = !slot.isAvailable;
                      }
                      
                      return matchesSearch && matchesAvailability;
                    });
                    
                    if (filteredSlots.length === 0) return null;
                    
                    return (
                      <div key={dateStr} className="border rounded-lg overflow-hidden">
                        {/* Date Header */}
                        <div className={`px-6 py-4 border-b ${
                          isToday ? 'bg-blue-50 border-blue-200' : 
                          isPast ? 'bg-gray-50 border-gray-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className={`text-lg font-semibold ${
                                isToday ? 'text-blue-800' : 
                                isPast ? 'text-gray-600' : 'text-gray-800'
                              }`}>
                                {dayName}, {date.toLocaleDateString('vi-VN', { 
                                  day: 'numeric', 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </h3>
                              <div className="flex items-center gap-4 mt-1">
                                {isToday && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                    Hôm nay
                                  </span>
                                )}
                                {isPast && (
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                    <FaHistory size={10} />
                                    Đã qua
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {filteredSlots.length} khung giờ
                                </span>
                              </div>
                            </div>
                            {!isPast && (
                              <button
                                onClick={() => handleOpenModal(null, dateStr)}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              >
                                <FaPlus size={14} />
                                Thêm khung giờ
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Time Slots */}
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredSlots.map(slot => {
                              const display = getTimeSlotDisplay(slot);
                              return (
                                <div 
                                  key={slot.id} 
                                  className={`p-4 rounded-lg border-l-4 transition-all duration-200 ${
                                    slot.isAvailable 
                                      ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                                      : 'border-red-500 bg-red-50 hover:bg-red-100'
                                  } ${display.isPast ? 'opacity-60' : ''}`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="font-mono text-lg font-bold text-gray-800">
                                        {display.timeRange}
                                      </div>
                                      <div className={`text-sm mt-1 font-medium ${display.statusColor}`}>
                                        {display.status}
                                      </div>
                                      {display.isPast && (
                                        <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                          <FaHistory size={10} />
                                          Đã qua
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex flex-col items-center gap-2 ml-4">
                                      {!display.isPast && (
                                        <>
                                          <button
                                            onClick={() => handleQuickToggle(slot)}
                                            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                                            title={slot.isAvailable ? 'Đặt không có sẵn' : 'Đặt có sẵn'}
                                          >
                                            {slot.isAvailable ? (
                                              <FaToggleOn className="text-green-500" size={20} />
                                            ) : (
                                              <FaToggleOff className="text-gray-400" size={20} />
                                            )}
                                          </button>
                                          <button
                                            onClick={() => handleOpenModal(slot)}
                                            className="text-blue-600 hover:text-blue-800 transition-colors p-2"
                                            title="Chỉnh sửa"
                                          >
                                            <FaEdit size={16} />
                                          </button>
                                        </>
                                      )}
                                      <button
                                        onClick={() => handleDelete(slot)}
                                        className="text-red-600 hover:text-red-800 transition-colors p-2"
                                        title="Xóa"
                                      >
                                        <FaTrash size={16} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
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
                  <FaCalendarPlus className="text-blue-600" size={20} />
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
                {/* Specific Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt size={14} />
                      Ngày cụ thể <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="date"
                    name="specificDate"
                    value={form.specificDate}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                    disabled={submitting}
                    min={formatDateForInput(new Date())}
                  />
                  {form.specificDate && (
                    <p className="text-sm text-gray-500 mt-1">
                      {getDayName(getDayOfWeekFromDate(form.specificDate))}
                    </p>
                  )}
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

                {form.startTime && form.endTime && form.specificDate && isFormValid() && hasTimeConflict(form.dayOfWeek, form.specificDate, form.startTime, form.endTime, editingTimeSlot?.id) && (
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
                disabled={submitting || !isFormValid() || Boolean(form.startTime && form.endTime && form.specificDate && hasTimeConflict(form.dayOfWeek, form.specificDate, form.startTime, form.endTime, editingTimeSlot?.id))}
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