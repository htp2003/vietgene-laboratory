import { useState, useEffect, useCallback } from 'react';
import doctorTimeSlotService, { DoctorTimeSlot, TimeSlotRequest, DAY_OF_WEEK, formatDate, formatShortDate, getDayOfWeekFromDate } from '../services/doctorTimeSlotService';

export interface TimeSlotStats {
  total: number;
  available: number;
  unavailable: number;
  byDay: { [key: number]: number };
  byDate: { [key: string]: number };
}

export const useDoctorTimeSlots = (doctorId: string) => {
  const [timeSlots, setTimeSlots] = useState<DoctorTimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Check if time slot is expired (past end time)
  const isTimeSlotExpired = useCallback((specificDate: string, endTime: string): boolean => {
    try {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:mm

      // Nếu ngày đã qua
      if (specificDate < currentDate) {
        return true;
      }

      // Nếu là hôm nay và giờ kết thúc đã qua
      if (specificDate === currentDate && endTime <= currentTime) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking if time slot is expired:', error);
      return false;
    }
  }, []);

  // Auto update expired time slots
  const autoUpdateExpiredSlots = useCallback(async (slots: DoctorTimeSlot[]) => {
    const expiredSlots = slots.filter(slot => 
      slot.isAvailable && isTimeSlotExpired(slot.specificDate, slot.endTime)
    );

    if (expiredSlots.length === 0) {
      return slots; // No expired slots, return original
    }

    console.log(`🔄 Found ${expiredSlots.length} expired slots, updating...`);

    // Update expired slots in parallel
    const updatePromises = expiredSlots.map(async (slot) => {
      try {
        console.log(`⏱️ Auto-updating expired slot: ${slot.specificDate} ${slot.startTime}-${slot.endTime}`);
        
        const result = await doctorTimeSlotService.updateTimeSlot(slot.id, {
          isAvailable: false,
          dayOfWeek: slot.dayOfWeek,
          specificDate: slot.specificDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          doctorId: slot.doctorId
        });

        if (result.success && result.data) {
          return result.data;
        } else {
          console.error(`Failed to update expired slot ${slot.id}:`, result.message);
          return { ...slot, isAvailable: false }; // Fallback to local update
        }
      } catch (error) {
        console.error(`Error updating expired slot ${slot.id}:`, error);
        return { ...slot, isAvailable: false }; // Fallback to local update
      }
    });

    try {
      const updatedExpiredSlots = await Promise.all(updatePromises);
      
      // Merge updated slots back into the full list
      const updatedSlots = slots.map(slot => {
        const updatedSlot = updatedExpiredSlots.find(updated => updated.id === slot.id);
        return updatedSlot || slot;
      });

      console.log(`✅ Successfully updated ${expiredSlots.length} expired slots`);
      return updatedSlots;
      
    } catch (error) {
      console.error('Error updating expired slots:', error);
      // Fallback: locally update expired slots
      return slots.map(slot => 
        expiredSlots.some(expired => expired.id === slot.id)
          ? { ...slot, isAvailable: false }
          : slot
      );
    }
  }, [isTimeSlotExpired]);

  // Fetch time slots for a specific doctor
  const fetchTimeSlots = useCallback(async () => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await doctorTimeSlotService.getTimeSlotsByDoctorId(doctorId);
      
      if (response.success && response.data) {
        // Filter out slots with null specificDate and normalize time format
        const validSlots = response.data.filter(slot => slot.specificDate !== null);
        
        const normalizedSlots = validSlots.map(slot => ({
          ...slot,
          startTime: slot.startTime.includes(':') ? slot.startTime.substring(0, 5) : slot.startTime, // Convert "07:00:00" to "07:00"
          endTime: slot.endTime.includes(':') ? slot.endTime.substring(0, 5) : slot.endTime
        }));

        // Auto-update expired slots
        const updatedSlots = await autoUpdateExpiredSlots(normalizedSlots);
        
        const sortedSlots = updatedSlots.sort((a, b) => {
          const dateCompare = new Date(a.specificDate).getTime() - new Date(b.specificDate).getTime();
          if (dateCompare !== 0) return dateCompare;
          return a.startTime.localeCompare(b.startTime);
        });
        
        console.log('Filtered, normalized and auto-updated slots:', sortedSlots);
        setTimeSlots(sortedSlots);
      } else {
        setError(new Error(response.message));
      }
    } catch (err: any) {
      setError(new Error('Có lỗi xảy ra khi tải danh sách khung giờ'));
      console.error('Fetch time slots error:', err);
    } finally {
      setLoading(false);
    }
  }, [doctorId, autoUpdateExpiredSlots]);

  // Create new time slot
  const createTimeSlot = useCallback(async (timeSlotData: TimeSlotRequest) => {
    try {
      setError(null);
      
      // Auto-set dayOfWeek from specificDate if not provided
      if (!timeSlotData.dayOfWeek && timeSlotData.specificDate) {
        timeSlotData.dayOfWeek = getDayOfWeekFromDate(timeSlotData.specificDate);
      }
      
      const response = await doctorTimeSlotService.createTimeSlot(timeSlotData);
      
      if (response.success && response.data) {
        setTimeSlots(prev => {
          const newSlots = [...prev, response.data!];
          // Sort by date and start time
          return newSlots.sort((a, b) => {
            const dateCompare = new Date(a.specificDate).getTime() - new Date(b.specificDate).getTime();
            if (dateCompare !== 0) return dateCompare;
            return a.startTime.localeCompare(b.startTime);
          });
        });
        return { success: true, message: response.message };
      } else {
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi tạo khung giờ';
      setError(new Error(errorMessage));
      console.error('Create time slot error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Update time slot
  const updateTimeSlot = useCallback(async (timeSlotId: string, timeSlotData: Partial<TimeSlotRequest>) => {
    console.log('Updating time slot:', { timeSlotId, timeSlotData });
    try {
      setError(null);

      // Lấy thông tin khung giờ cũ
      const oldTimeSlot = timeSlots.find(slot => slot.id === timeSlotId);
      if (!oldTimeSlot) {
        return { success: false, message: "Không tìm thấy khung giờ" };
      }

      // Auto-set dayOfWeek from specificDate if specificDate is provided
      if (timeSlotData.specificDate && !timeSlotData.dayOfWeek) {
        timeSlotData.dayOfWeek = getDayOfWeekFromDate(timeSlotData.specificDate);
      }

      const updateData = {
        ...timeSlotData,
        startTime: timeSlotData.startTime || oldTimeSlot.startTime,
        endTime: timeSlotData.endTime || oldTimeSlot.endTime,
        dayOfWeek: timeSlotData.dayOfWeek ?? oldTimeSlot.dayOfWeek,
        specificDate: timeSlotData.specificDate || oldTimeSlot.specificDate,
        isAvailable: timeSlotData.isAvailable ?? oldTimeSlot.isAvailable,
        doctorId: timeSlotData.doctorId || oldTimeSlot.doctorId,
      }
      
      const response = await doctorTimeSlotService.updateTimeSlot(timeSlotId, updateData);
      
      if (response.success && response.data) {
        setTimeSlots(prev => {
          const newSlots = prev.map(slot => 
            slot.id === timeSlotId ? response.data! : slot
          );
          // Sort by date and start time
          return newSlots.sort((a, b) => {
            const dateCompare = new Date(a.specificDate).getTime() - new Date(b.specificDate).getTime();
            if (dateCompare !== 0) return dateCompare;
            return a.startTime.localeCompare(b.startTime);
          });
        });
        return { success: true, message: response.message };
      } else {
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi cập nhật khung giờ';
      setError(new Error(errorMessage));
      console.error('Update time slot error:', err);
      return { success: false, message: errorMessage };
    }
  }, [timeSlots]);

  // Delete time slot
  const deleteTimeSlot = useCallback(async (timeSlotId: string) => {
    try {
      setError(null);
      
      const response = await doctorTimeSlotService.deleteTimeSlot(timeSlotId);
      
      if (response.success) {
        setTimeSlots(prev => prev.filter(slot => slot.id !== timeSlotId));
        return { success: true, message: response.message };
      } else {
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi xóa khung giờ';
      setError(new Error(errorMessage));
      console.error('Delete time slot error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Toggle time slot availability
  const toggleAvailability = useCallback(async (timeSlotId: string) => {
    try {
      setError(null);
      
      const timeSlot = timeSlots.find(slot => slot.id === timeSlotId);
      if (!timeSlot) {
        return { success: false, message: "Không tìm thấy khung giờ" };
      }
      
      const response = await updateTimeSlot(timeSlotId, {
        isAvailable: !timeSlot.isAvailable
      });
      
      return response;
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi thay đổi trạng thái khung giờ';
      setError(new Error(errorMessage));
      console.error('Toggle availability error:', err);
      return { success: false, message: errorMessage };
    }
  }, [timeSlots, updateTimeSlot]);

  // Get time slot statistics
  const getTimeSlotStats = useCallback((): TimeSlotStats => {
    const byDay: { [key: number]: number } = {};
    const byDate: { [key: string]: number } = {};
    
    // Initialize all days to 0
    for (let i = 0; i < 7; i++) {
      byDay[i] = 0;
    }
    
    // Count slots by day and date
    timeSlots.forEach(slot => {
      byDay[slot.dayOfWeek] = (byDay[slot.dayOfWeek] || 0) + 1;
      byDate[slot.specificDate] = (byDate[slot.specificDate] || 0) + 1;
    });
    
    const stats = {
      total: timeSlots.length,
      available: timeSlots.filter(slot => slot.isAvailable).length,
      unavailable: timeSlots.filter(slot => !slot.isAvailable).length,
      byDay,
      byDate,
    };
    
    return stats;
  }, [timeSlots]);

  // Filter time slots by day of week
  const getTimeSlotsByDay = useCallback((dayOfWeek: number) => {
    return timeSlots.filter(slot => slot.dayOfWeek === dayOfWeek);
  }, [timeSlots]);

  // Filter time slots by specific date
  const getTimeSlotsByDate = useCallback((specificDate: string) => {
    return timeSlots.filter(slot => slot.specificDate === specificDate);
  }, [timeSlots]);

  // Filter time slots by availability
  const getTimeSlotsByAvailability = useCallback((isAvailable: boolean) => {
    return timeSlots.filter(slot => slot.isAvailable === isAvailable);
  }, [timeSlots]);

  // Get time slots grouped by date
  const getTimeSlotsGroupedByDate = useCallback(() => {
    const grouped: { [key: string]: DoctorTimeSlot[] } = {};
    
    timeSlots.forEach(slot => {
      if (!grouped[slot.specificDate]) {
        grouped[slot.specificDate] = [];
      }
      grouped[slot.specificDate].push(slot);
    });
    
    // Sort each date's slots by start time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    
    return grouped;
  }, [timeSlots]);

  // Get time slots grouped by day of week (for legacy compatibility)
  const getTimeSlotsGroupedByDay = useCallback(() => {
    const grouped: { [key: number]: DoctorTimeSlot[] } = {};
    
    timeSlots.forEach(slot => {
      if (!grouped[slot.dayOfWeek]) {
        grouped[slot.dayOfWeek] = [];
      }
      grouped[slot.dayOfWeek].push(slot);
    });
    
    // Sort each day's slots by date then start time
    Object.keys(grouped).forEach(day => {
      grouped[parseInt(day)].sort((a, b) => {
        const dateCompare = new Date(a.specificDate).getTime() - new Date(b.specificDate).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });
    });
    
    return grouped;
  }, [timeSlots]);

  // Check for time conflicts
  const hasTimeConflict = useCallback((dayOfWeek: number, specificDate: string, startTime: string, endTime: string, excludeId?: string) => {
    const slotsOnSameDate = timeSlots.filter(slot => 
      slot.specificDate === specificDate && slot.id !== excludeId
    );

    // Chuyển đổi thời gian sang phút để so sánh chính xác hơn
    const toMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const newStart = toMinutes(startTime);
    const newEnd = toMinutes(endTime);
    
    // Kiểm tra xung đột với các khung giờ khác
    return slotsOnSameDate.some(slot => {
      const existingStart = toMinutes(slot.startTime);
      const existingEnd = toMinutes(slot.endTime);
      
      // Kiểm tra xem có xung đột không
      return newStart < existingEnd && newEnd > existingStart;
    });
  }, [timeSlots]);

  // Format time for display
  const formatTime = useCallback((time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  }, []);

  // Get day name
  const getDayName = useCallback((dayOfWeek: number) => {
    return DAY_OF_WEEK[dayOfWeek as keyof typeof DAY_OF_WEEK] || 'Không xác định';
  }, []);

  // Get time slot display info
  const getTimeSlotDisplay = useCallback((timeSlot: DoctorTimeSlot) => {
    const isExpired = isTimeSlotExpired(timeSlot.specificDate, timeSlot.endTime);
    const isToday = new Date(timeSlot.specificDate).toDateString() === new Date().toDateString();
    const isPast = new Date(timeSlot.specificDate) < new Date() || isExpired;
    
    return {
      dayName: getDayName(timeSlot.dayOfWeek),
      fullDate: formatDate(timeSlot.specificDate),
      shortDate: formatShortDate(timeSlot.specificDate),
      timeRange: `${formatTime(timeSlot.startTime)} - ${formatTime(timeSlot.endTime)}`,
      status: isPast 
        ? 'Đã kết thúc' 
        : timeSlot.isAvailable 
          ? 'Có sẵn' 
          : 'Không có sẵn',
      statusColor: isPast 
        ? 'text-gray-500' 
        : timeSlot.isAvailable 
          ? 'text-green-600' 
          : 'text-red-600',
      statusBg: isPast 
        ? 'bg-gray-100' 
        : timeSlot.isAvailable 
          ? 'bg-green-100' 
          : 'bg-red-100',
      isToday,
      isPast,
      isExpired
    };
  }, [getDayName, formatTime, isTimeSlotExpired]);

  // Search time slots
  const searchTimeSlots = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) {
      return timeSlots;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return timeSlots.filter(slot => {
      const dayName = getDayName(slot.dayOfWeek).toLowerCase();
      const timeRange = `${slot.startTime} ${slot.endTime}`.toLowerCase();
      const dateStr = formatShortDate(slot.specificDate).toLowerCase();
      
      return dayName.includes(lowerSearchTerm) || 
             timeRange.includes(lowerSearchTerm) ||
             dateStr.includes(lowerSearchTerm);
    });
  }, [timeSlots, getDayName]);

  // Get time slots for a specific week
  const getTimeSlotsForWeek = useCallback((weekStart: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return timeSlots.filter(slot => {
      const slotDate = new Date(slot.specificDate);
      return slotDate >= weekStart && slotDate <= weekEnd;
    });
  }, [timeSlots]);

  // Get upcoming time slots
  const getUpcomingTimeSlots = useCallback((days: number = 7) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return timeSlots.filter(slot => {
      const slotDate = new Date(slot.specificDate);
      return slotDate >= today && slotDate <= futureDate;
    });
  }, [timeSlots]);

  // Get time slots for a specific month
  const getTimeSlotsForMonth = useCallback((year: number, month: number) => {
    return timeSlots.filter(slot => {
      const slotDate = new Date(slot.specificDate);
      return slotDate.getFullYear() === year && slotDate.getMonth() === month;
    });
  }, [timeSlots]);

  // Get time slots for today
  const getTodayTimeSlots = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return timeSlots.filter(slot => slot.specificDate === today);
  }, [timeSlots]);

  // Get time slots for tomorrow
  const getTomorrowTimeSlots = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    return timeSlots.filter(slot => slot.specificDate === tomorrowStr);
  }, [timeSlots]);

  // Get time slots for a date range
  const getTimeSlotsForDateRange = useCallback((startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return timeSlots.filter(slot => {
      const slotDate = new Date(slot.specificDate);
      return slotDate >= start && slotDate <= end;
    });
  }, [timeSlots]);

  // Get available time slots only
  const getAvailableTimeSlots = useCallback(() => {
    return timeSlots.filter(slot => slot.isAvailable);
  }, [timeSlots]);

  // Get unavailable time slots only
  const getUnavailableTimeSlots = useCallback(() => {
    return timeSlots.filter(slot => !slot.isAvailable);
  }, [timeSlots]);

  // Get past time slots
  const getPastTimeSlots = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return timeSlots.filter(slot => {
      const slotDate = new Date(slot.specificDate);
      return slotDate < today;
    });
  }, [timeSlots]);

  // Get future time slots
  const getFutureTimeSlots = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return timeSlots.filter(slot => {
      const slotDate = new Date(slot.specificDate);
      return slotDate >= today;
    });
  }, [timeSlots]);

  // Load time slots on component mount or when doctorId changes
  useEffect(() => {
    if (doctorId) {
      fetchTimeSlots();
    }
  }, [fetchTimeSlots, doctorId]);

  // Auto-update expired slots every 5 minutes
  useEffect(() => {
    if (!doctorId || timeSlots.length === 0) return;

    console.log('🚀 Setting up auto-update interval for expired slots');
    
    const interval = setInterval(async () => {
      console.log('⏰ Running auto-update check for expired slots...');
      
      const expiredSlots = timeSlots.filter(slot => 
        slot.isAvailable && isTimeSlotExpired(slot.specificDate, slot.endTime)
      );

      if (expiredSlots.length > 0) {
        console.log(`🔄 Found ${expiredSlots.length} expired slots during interval check`);
        const updatedSlots = await autoUpdateExpiredSlots(timeSlots);
        
        // Only update state if there were actual changes
        const hasChanges = updatedSlots.some((slot, index) => 
          slot.isAvailable !== timeSlots[index]?.isAvailable
        );
        
        if (hasChanges) {
          setTimeSlots(updatedSlots);
          console.log('✅ Updated expired slots during interval');
        }
      }
    }, 5 * 60 * 1000); 

    return () => {
      console.log('🛑 Clearing auto-update interval');
      clearInterval(interval);
    };
  }, [doctorId, timeSlots, isTimeSlotExpired, autoUpdateExpiredSlots]);

  return {
    // State
    timeSlots,
    loading,
    error,
    
    // Actions
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    toggleAvailability,
    refetch: fetchTimeSlots,
    
    // Utilities
    hasTimeConflict,
    formatTime,
    getDayName,
    getTimeSlotDisplay,
    isTimeSlotExpired,
    
    // Filtering & Search
    getTimeSlotsByDay,
    getTimeSlotsByDate,
    getTimeSlotsByAvailability,
    getTimeSlotsGroupedByDay,
    getTimeSlotsGroupedByDate,
    getTimeSlotsForWeek,
    getTimeSlotsForMonth,
    getUpcomingTimeSlots,
    getTodayTimeSlots,
    getTomorrowTimeSlots,
    getTimeSlotsForDateRange,
    getAvailableTimeSlots,
    getUnavailableTimeSlots,
    getPastTimeSlots,
    getFutureTimeSlots,
    searchTimeSlots,
    
    // Statistics
    getTimeSlotStats,
  };
};

export default useDoctorTimeSlots;