import axios from "axios";

const API_BASE_URL = "https://dna-service-se1857.onrender.com/dna_service";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`⏰ TimeSlot API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token attached:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ TimeSlot API Response: ${response.status} ${response.statusText}`);
    console.log("📥 Response data:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ TimeSlot API Response error:", error);
    
    // Handle token expiration
    if (error.response?.status === 401) {
      console.warn('🔒 Token expired, redirecting to login');
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Doctor Time Slot interface matching API response
export interface DoctorTimeSlot {
  id: string;
  dayOfWeek: number;
  specificDate: string; // Format: YYYY-MM-DD
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  doctorId: string;
  createdAt: string;
  updatedAt?: string;
}

// Time Slot request interface for create/update
export interface TimeSlotRequest {
  dayOfWeek: number;
  specificDate: string; // Format: YYYY-MM-DD
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  doctorId: string;
}

// API Response interface
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// Day of week mapping
export const DAY_OF_WEEK = {
  0: 'Chủ nhật',
  1: 'Thứ hai',
  2: 'Thứ ba', 
  3: 'Thứ tư',
  4: 'Thứ năm',
  5: 'Thứ sáu',
  6: 'Thứ bảy'
} as const;

export const DAY_OPTIONS = [
  { value: 0, label: 'Chủ nhật' },
  { value: 1, label: 'Thứ hai' },
  { value: 2, label: 'Thứ ba' },
  { value: 3, label: 'Thứ tư' },
  { value: 4, label: 'Thứ năm' },
  { value: 5, label: 'Thứ sáu' },
  { value: 6, label: 'Thứ bảy' }
];

// Utility functions
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const formatShortDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const getDayOfWeekFromDate = (dateString: string): number => {
  try {
    // Sử dụng cách parse an toàn hơn để tránh vấn đề timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month - 1 vì JavaScript month bắt đầu từ 0
    return date.getDay();
  } catch {
    return 0;
  }
};

export const formatDateSafe = (dateString: string): string => {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Check if time slot is expired - THÊM MỚI
export const isTimeSlotExpired = (specificDate: string, endTime: string): boolean => {
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
};

// Doctor Time Slot Service
export const doctorTimeSlotService = {
  // Get all time slots
  getAllTimeSlots: async (): Promise<{ success: boolean; data?: DoctorTimeSlot[]; message: string }> => {
    try {
      console.log("⏰ Fetching all time slots...");
      
      const response = await apiClient.get<ApiResponse<DoctorTimeSlot[]>>("/doctor-time-slots");
      
      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: "Lấy danh sách khung giờ thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy danh sách khung giờ",
        };
      }
    } catch (error: any) {
      console.error("❌ Get all time slots error:", error);
      return handleApiError(error);
    }
  },

  // Get time slots by doctor ID
  getTimeSlotsByDoctorId: async (doctorId: string): Promise<{ success: boolean; data?: DoctorTimeSlot[]; message: string }> => {
    try {
      console.log(`⏰ Fetching time slots for doctor ID: ${doctorId}...`);
      
      const response = await apiClient.get<ApiResponse<DoctorTimeSlot[]>>(`/doctor-time-slots/doctor/${doctorId}`);
      
      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: "Lấy danh sách khung giờ thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy danh sách khung giờ",
        };
      }
    } catch (error: any) {
      console.error("❌ Get time slots by doctor ID error:", error);
      return handleApiError(error);
    }
  },

  // Get time slot by ID
  getTimeSlotById: async (timeSlotId: string): Promise<{ success: boolean; data?: DoctorTimeSlot; message: string }> => {
    try {
      console.log(`⏰ Fetching time slot with ID: ${timeSlotId}...`);
      
      const response = await apiClient.get<ApiResponse<DoctorTimeSlot>>(`/doctor-time-slots/${timeSlotId}`);
      
      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: "Lấy thông tin khung giờ thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy thông tin khung giờ",
        };
      }
    } catch (error: any) {
      console.error("❌ Get time slot by ID error:", error);
      return handleApiError(error);
    }
  },

  // Create new time slot
  createTimeSlot: async (timeSlotData: TimeSlotRequest): Promise<{ success: boolean; data?: DoctorTimeSlot; message: string }> => {
    try {
      console.log("➕ Creating new time slot...");
      console.log("📤 Data being sent:", timeSlotData);

      // Validate required fields
      if (timeSlotData.dayOfWeek < 0 || timeSlotData.dayOfWeek > 6) {
        return { success: false, message: "Ngày trong tuần không hợp lệ (0-6)" };
      }
      if (!timeSlotData.specificDate?.trim()) {
        return { success: false, message: "Ngày cụ thể không được để trống" };
      }
      if (!timeSlotData.startTime?.trim()) {
        return { success: false, message: "Giờ bắt đầu không được để trống" };
      }
      if (!timeSlotData.endTime?.trim()) {
        return { success: false, message: "Giờ kết thúc không được để trống" };
      }
      if (!timeSlotData.doctorId?.trim()) {
        return { success: false, message: "ID bác sĩ không được để trống" };
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(timeSlotData.specificDate)) {
        return { success: false, message: "Ngày không đúng định dạng (YYYY-MM-DD)" };
      }

      // Validate time format (HH:mm)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(timeSlotData.startTime)) {
        return { success: false, message: "Giờ bắt đầu không đúng định dạng (HH:mm)" };
      }
      if (!timeRegex.test(timeSlotData.endTime)) {
        return { success: false, message: "Giờ kết thúc không đúng định dạng (HH:mm)" };
      }

      // Validate start time < end time
      const startTime = new Date(`1970-01-01T${timeSlotData.startTime}:00`);
      const endTime = new Date(`1970-01-01T${timeSlotData.endTime}:00`);
      
      if (endTime <= startTime) {
        return { success: false, message: "Giờ kết thúc phải sau giờ bắt đầu" };
      }

      // Validate date is not in the past
      const specificDate = new Date(timeSlotData.specificDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (specificDate < today) {
        return { success: false, message: "Không thể tạo khung giờ cho ngày đã qua" };
      }

      // Validate dayOfWeek matches specificDate
      const actualDayOfWeek = getDayOfWeekFromDate(timeSlotData.specificDate);
      if (actualDayOfWeek !== timeSlotData.dayOfWeek) {
        return { success: false, message: "Thứ trong tuần không khớp với ngày đã chọn" };
      }
      
      const response = await apiClient.post<ApiResponse<DoctorTimeSlot>>("/doctor-time-slots", timeSlotData);
      
      if (response.data.code === 200 || response.data.code === 201) {
        return {
          success: true,
          data: response.data.result,
          message: "Tạo khung giờ thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể tạo khung giờ",
        };
      }
    } catch (error: any) {
      console.error("❌ Create time slot error:", error);
      return handleApiError(error);
    }
  },

  // Update time slot
  updateTimeSlot: async (timeSlotId: string, timeSlotData: Partial<TimeSlotRequest>): Promise<{ success: boolean; data?: DoctorTimeSlot; message: string }> => {
    try {
      console.log(`📝 Updating time slot with ID: ${timeSlotId}...`);
      console.log("📤 Data being sent:", timeSlotData);
      
      // Validate inputs
      if (!timeSlotId || timeSlotId.trim() === '') {
        return {
          success: false,
          message: "ID khung giờ không hợp lệ"
        };
      }

      // Validate day of week if provided
      if (timeSlotData.dayOfWeek !== undefined && (timeSlotData.dayOfWeek < 0 || timeSlotData.dayOfWeek > 6)) {
        return { success: false, message: "Ngày trong tuần không hợp lệ (0-6)" };
      }

      // Validate date format if provided
      if (timeSlotData.specificDate) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(timeSlotData.specificDate)) {
          return { success: false, message: "Ngày không đúng định dạng (YYYY-MM-DD)" };
        }

        // Validate date is not in the past
        const specificDate = new Date(timeSlotData.specificDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (specificDate < today) {
          return { success: false, message: "Không thể cập nhật khung giờ cho ngày đã qua" };
        }

        // Validate dayOfWeek matches specificDate if both provided
        if (timeSlotData.dayOfWeek !== undefined) {
          const actualDayOfWeek = getDayOfWeekFromDate(timeSlotData.specificDate);
          if (actualDayOfWeek !== timeSlotData.dayOfWeek) {
            return { success: false, message: "Thứ trong tuần không khớp với ngày đã chọn" };
          }
        }
      }

      // Validate time format if provided
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (timeSlotData.startTime && !timeRegex.test(timeSlotData.startTime)) {
        return { success: false, message: "Giờ bắt đầu không đúng định dạng (HH:mm)" };
      }
      if (timeSlotData.endTime && !timeRegex.test(timeSlotData.endTime)) {
        return { success: false, message: "Giờ kết thúc không đúng định dạng (HH:mm)" };
      }
      
      const response = await apiClient.put<ApiResponse<DoctorTimeSlot>>(`/doctor-time-slots/${timeSlotId}`, timeSlotData);
      
      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.result,
          message: "Cập nhật khung giờ thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể cập nhật khung giờ",
        };
      }
    } catch (error: any) {
      console.error("❌ Update time slot error:", error);
      return handleApiError(error);
    }
  },

  // Delete time slot
  deleteTimeSlot: async (timeSlotId: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log(`🗑️ Deleting time slot with ID: ${timeSlotId}...`);
      
      if (!timeSlotId || timeSlotId.trim() === '') {
        return {
          success: false,
          message: "ID khung giờ không hợp lệ"
        };
      }
      
      const response = await apiClient.delete<ApiResponse<any>>(`/doctor-time-slots/${timeSlotId}`);
      
      if (response.data.code === 200) {
        return {
          success: true,
          message: "Xóa khung giờ thành công",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể xóa khung giờ",
        };
      }
    } catch (error: any) {
      console.error("❌ Delete time slot error:", error);
      return handleApiError(error);
    }
  },

  // Bulk update expired time slots - THÊM MỚI
  updateExpiredTimeSlots: async (doctorId?: string): Promise<{ 
    success: boolean; 
    message: string; 
    updatedCount: number;
    expiredSlots: DoctorTimeSlot[];
  }> => {
    try {
      console.log('🔄 Bulk updating expired time slots...');
      
      // Get time slots
      let timeSlots: DoctorTimeSlot[] = [];
      if (doctorId) {
        const response = await doctorTimeSlotService.getTimeSlotsByDoctorId(doctorId);
        if (!response.success || !response.data) {
          return {
            success: false,
            message: response.message || 'Không thể lấy danh sách time slots',
            updatedCount: 0,
            expiredSlots: []
          };
        }
        timeSlots = response.data;
      } else {
        const response = await doctorTimeSlotService.getAllTimeSlots();
        if (!response.success || !response.data) {
          return {
            success: false,
            message: response.message || 'Không thể lấy danh sách time slots',
            updatedCount: 0,
            expiredSlots: []
          };
        }
        timeSlots = response.data;
      }

      // Find expired slots that are still available
      const expiredSlots = timeSlots.filter(slot => 
        slot.isAvailable && isTimeSlotExpired(slot.specificDate, slot.endTime)
      );

      if (expiredSlots.length === 0) {
        return {
          success: true,
          message: 'Không có time slot nào đã hết hạn',
          updatedCount: 0,
          expiredSlots: []
        };
      }

      console.log(`⏰ Found ${expiredSlots.length} expired slots to update`);

      // Update each expired slot
      let updatedCount = 0;
      const errors: string[] = [];
      const updatedSlots: DoctorTimeSlot[] = [];

      for (const slot of expiredSlots) {
        try {
          const result = await doctorTimeSlotService.updateTimeSlot(slot.id, {
            isAvailable: false,
            dayOfWeek: slot.dayOfWeek,
            specificDate: slot.specificDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
            doctorId: slot.doctorId
          });

          if (result.success && result.data) {
            updatedCount++;
            updatedSlots.push(result.data);
            console.log(`✅ Updated expired slot: ${slot.specificDate} ${slot.startTime}-${slot.endTime}`);
          } else {
            errors.push(`Slot ${slot.id}: ${result.message}`);
          }
        } catch (error: any) {
          errors.push(`Slot ${slot.id}: ${error.message}`);
        }
      }

      return {
        success: updatedCount > 0,
        message: `Đã cập nhật ${updatedCount}/${expiredSlots.length} time slots đã hết hạn`,
        updatedCount,
        expiredSlots: updatedSlots
      };

    } catch (error: any) {
      console.error('❌ Bulk update expired time slots error:', error);
      return {
        success: false,
        message: `Lỗi hệ thống: ${error.message}`,
        updatedCount: 0,
        expiredSlots: []
      };
    }
  },
};

// Error handler helper
function handleApiError(error: any): { success: false; message: string } {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.response.statusText;

    switch (status) {
      case 400:
        return { success: false, message: `Dữ liệu không hợp lệ: ${message}` };
      case 401:
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return { success: false, message: "Bạn cần đăng nhập để thực hiện thao tác này" };
      case 403:
        return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
      case 404:
        return { success: false, message: "Không tìm thấy khung giờ" };
      case 409:
        return { success: false, message: "Khung giờ đã tồn tại" };
      case 500:
        return { success: false, message: "Lỗi server, vui lòng thử lại sau" };
      default:
        return { success: false, message: `Lỗi ${status}: ${message}` };
    }
  } else if (error.request) {
    return { success: false, message: "Không thể kết nối đến server" };
  } else {
    return { success: false, message: `Có lỗi xảy ra: ${error.message}` };
  }
}

export default doctorTimeSlotService;