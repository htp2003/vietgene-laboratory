import { useState, useEffect, useCallback } from 'react';
import doctorTimeSlotService, { DoctorTimeSlot, TimeSlotRequest, DAY_OF_WEEK } from '../services/doctorTimeSlotService';

export interface TimeSlotStats {
  total: number;
  available: number;
  unavailable: number;
  byDay: { [key: number]: number };
}

export const useDoctorTimeSlots = (doctorId: string) => {
  const [timeSlots, setTimeSlots] = useState<DoctorTimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

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
        // Sort by day of week and start time
        const sortedSlots = response.data.sort((a, b) => {
          if (a.dayOfWeek !== b.dayOfWeek) {
            return a.dayOfWeek - b.dayOfWeek;
          }
          return a.startTime.localeCompare(b.startTime);
        });
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
  }, [doctorId]);

  // Create new time slot
  const createTimeSlot = useCallback(async (timeSlotData: TimeSlotRequest) => {
    try {
      setError(null);
      
      const response = await doctorTimeSlotService.createTimeSlot(timeSlotData);
      
      if (response.success && response.data) {
        setTimeSlots(prev => {
          const newSlots = [...prev, response.data!];
          // Sort by day of week and start time
          return newSlots.sort((a, b) => {
            if (a.dayOfWeek !== b.dayOfWeek) {
              return a.dayOfWeek - b.dayOfWeek;
            }
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
    try {
      setError(null);
      
      const response = await doctorTimeSlotService.updateTimeSlot(timeSlotId, timeSlotData);
      
      if (response.success && response.data) {
        setTimeSlots(prev => {
          const newSlots = prev.map(slot => 
            slot.id === timeSlotId ? response.data! : slot
          );
          // Sort by day of week and start time
          return newSlots.sort((a, b) => {
            if (a.dayOfWeek !== b.dayOfWeek) {
              return a.dayOfWeek - b.dayOfWeek;
            }
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
  }, []);

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
    
    // Initialize all days to 0
    for (let i = 0; i < 7; i++) {
      byDay[i] = 0;
    }
    
    // Count slots by day
    timeSlots.forEach(slot => {
      byDay[slot.dayOfWeek] = (byDay[slot.dayOfWeek] || 0) + 1;
    });
    
    const stats = {
      total: timeSlots.length,
      available: timeSlots.filter(slot => slot.isAvailable).length,
      unavailable: timeSlots.filter(slot => !slot.isAvailable).length,
      byDay,
    };
    
    return stats;
  }, [timeSlots]);

  // Filter time slots by day of week
  const getTimeSlotsByDay = useCallback((dayOfWeek: number) => {
    return timeSlots.filter(slot => slot.dayOfWeek === dayOfWeek);
  }, [timeSlots]);

  // Filter time slots by availability
  const getTimeSlotsByAvailability = useCallback((isAvailable: boolean) => {
    return timeSlots.filter(slot => slot.isAvailable === isAvailable);
  }, [timeSlots]);

  // Get time slots grouped by day
  const getTimeSlotsGroupedByDay = useCallback(() => {
    const grouped: { [key: number]: DoctorTimeSlot[] } = {};
    
    timeSlots.forEach(slot => {
      if (!grouped[slot.dayOfWeek]) {
        grouped[slot.dayOfWeek] = [];
      }
      grouped[slot.dayOfWeek].push(slot);
    });
    
    // Sort each day's slots by start time
    Object.keys(grouped).forEach(day => {
      grouped[parseInt(day)].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    
    return grouped;
  }, [timeSlots]);

  // Check for time conflicts
  const hasTimeConflict = useCallback((dayOfWeek: number, startTime: string, endTime: string, excludeId?: string) => {
    const slotsOnSameDay = timeSlots.filter(slot => 
      slot.dayOfWeek === dayOfWeek && slot.id !== excludeId
    );
    
    const newStart = new Date(`1970-01-01T${startTime}:00`);
    const newEnd = new Date(`1970-01-01T${endTime}:00`);
    
    return slotsOnSameDay.some(slot => {
      const existingStart = new Date(`1970-01-01T${slot.startTime}:00`);
      const existingEnd = new Date(`1970-01-01T${slot.endTime}:00`);
      
      // Check for overlap
      return (newStart < existingEnd && newEnd > existingStart);
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
    return {
      dayName: getDayName(timeSlot.dayOfWeek),
      timeRange: `${formatTime(timeSlot.startTime)} - ${formatTime(timeSlot.endTime)}`,
      status: timeSlot.isAvailable ? 'Có sẵn' : 'Không có sẵn',
      statusColor: timeSlot.isAvailable ? 'text-green-600' : 'text-red-600',
      statusBg: timeSlot.isAvailable ? 'bg-green-100' : 'bg-red-100'
    };
  }, [getDayName, formatTime]);

  // Search time slots
  const searchTimeSlots = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) {
      return timeSlots;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return timeSlots.filter(slot => {
      const dayName = getDayName(slot.dayOfWeek).toLowerCase();
      const timeRange = `${slot.startTime} ${slot.endTime}`.toLowerCase();
      
      return dayName.includes(lowerSearchTerm) || 
             timeRange.includes(lowerSearchTerm);
    });
  }, [timeSlots, getDayName]);

  // Load time slots on component mount or when doctorId changes
  useEffect(() => {
    if (doctorId) {
      fetchTimeSlots();
    }
  }, [fetchTimeSlots, doctorId]);

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
    
    // Filtering & Search
    getTimeSlotsByDay,
    getTimeSlotsByAvailability,
    getTimeSlotsGroupedByDay,
    searchTimeSlots,
    
    // Statistics
    getTimeSlotStats,
  };
};

export default useDoctorTimeSlots;