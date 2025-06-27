import { apiClient } from '../../config/api';
import { ApiResponse, ApiDoctor, DoctorRequest, ApiDoctorTimeSlot, DoctorTimeSlotRequest } from '../../types/appointment'

export class DoctorService {
  
  // ✅ Get all doctors
  static async getAllDoctors(): Promise<ApiDoctor[]> {
    try {
      console.log("👨‍⚕️ Fetching all doctors...");
      
      const response = await apiClient.get<ApiResponse<ApiDoctor[]>>("/doctors");
      
      if (response.data.code === 200) {
        console.log("✅ Fetched doctors:", response.data.result.length);
        return response.data.result;
      } else {
        console.warn("⚠️ Failed to fetch doctors:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching doctors:", error);
      return [];
    }
  }

  // ✅ Get doctor by ID
  static async getDoctorById(doctorId: string): Promise<ApiDoctor | null> {
    try {
      console.log(`👨‍⚕️ Fetching doctor ${doctorId}...`);
      
      const response = await apiClient.get<ApiResponse<ApiDoctor>>(`/doctors/${doctorId}`);
      
      if (response.data.code === 200) {
        console.log("✅ Fetched doctor:", response.data.result);
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to fetch doctor ${doctorId}:`, error);
      return null;
    }
  }

  // ✅ Create doctor
  static async createDoctor(doctorData: DoctorRequest): Promise<ApiDoctor | null> {
    try {
      console.log("👨‍⚕️ Creating new doctor...");
      
      const response = await apiClient.post<ApiResponse<ApiDoctor>>("/doctors", doctorData);
      
      if (response.data.code === 200) {
        console.log("✅ Doctor created successfully");
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error creating doctor:", error);
      return null;
    }
  }

  // ✅ Update doctor
  static async updateDoctor(doctorId: string, doctorData: DoctorRequest): Promise<boolean> {
    try {
      console.log(`👨‍⚕️ Updating doctor ${doctorId}...`);
      
      const response = await apiClient.put(`/doctors/${doctorId}`, doctorData);
      
      if (response.data.code === 200) {
        console.log("✅ Doctor updated successfully");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("❌ Error updating doctor:", error);
      return false;
    }
  }

  // ✅ Delete doctor
  static async deleteDoctor(doctorId: string): Promise<boolean> {
    try {
      console.log(`👨‍⚕️ Deleting doctor ${doctorId}...`);
      
      const response = await apiClient.delete(`/doctors/${doctorId}`);
      
      if (response.data.code === 200) {
        console.log("✅ Doctor deleted successfully");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("❌ Error deleting doctor:", error);
      return false;
    }
  }

  // ✅ Get all doctor time slots
  static async getAllDoctorTimeSlots(): Promise<ApiDoctorTimeSlot[]> {
    try {
      console.log("🕐 Fetching all doctor time slots...");
      
      const response = await apiClient.get<ApiResponse<ApiDoctorTimeSlot[]>>("/doctor-time-slots");
      
      if (response.data.code === 200) {
        console.log("✅ Fetched time slots:", response.data.result.length);
        return response.data.result;
      } else {
        console.warn("⚠️ Failed to fetch time slots:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching time slots:", error);
      return [];
    }
  }

  // ✅ Get doctor time slot by ID
  static async getDoctorTimeSlot(slotId: string): Promise<ApiDoctorTimeSlot | null> {
    try {
      console.log(`🕐 Fetching doctor time slot: ${slotId}`);
      
      const response = await apiClient.get<ApiResponse<ApiDoctorTimeSlot>>(`/doctor-time-slots/${slotId}`);
      
      if (response.data.code === 200) {
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to fetch time slot ${slotId}:`, error);
      return null;
    }
  }

  // ✅ Get time slots by doctor ID
  static async getDoctorTimeSlotsByDoctorId(doctorId: string): Promise<ApiDoctorTimeSlot[]> {
    try {
      console.log(`🕐 Fetching time slots for doctor: ${doctorId}`);
      
      const response = await apiClient.get<ApiResponse<ApiDoctorTimeSlot[]>>(`/doctor-time-slots/doctor/${doctorId}`);
      
      if (response.data.code === 200) {
        console.log("✅ Fetched doctor time slots:", response.data.result.length);
        return response.data.result;
      } else {
        console.warn("⚠️ Failed to fetch doctor time slots:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching doctor time slots:", error);
      return [];
    }
  }

  // ✅ Create doctor time slot
  static async createDoctorTimeSlot(timeSlotData: DoctorTimeSlotRequest): Promise<ApiDoctorTimeSlot | null> {
    try {
      console.log("🕐 Creating doctor time slot...");
      
      const response = await apiClient.post<ApiResponse<ApiDoctorTimeSlot>>("/doctor-time-slots", timeSlotData);
      
      if (response.data.code === 200) {
        console.log("✅ Time slot created successfully");
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error creating time slot:", error);
      return null;
    }
  }

  // ✅ Update doctor time slot
  static async updateDoctorTimeSlot(slotId: string, timeSlotData: DoctorTimeSlotRequest): Promise<boolean> {
    try {
      console.log(`🕐 Updating time slot ${slotId}...`);
      
      const response = await apiClient.put(`/doctor-time-slots/${slotId}`, timeSlotData);
      
      if (response.data.code === 200) {
        console.log("✅ Time slot updated successfully");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("❌ Error updating time slot:", error);
      return false;
    }
  }

  // ✅ Delete doctor time slot
  static async deleteDoctorTimeSlot(slotId: string): Promise<boolean> {
    try {
      console.log(`🕐 Deleting time slot ${slotId}...`);
      
      const response = await apiClient.delete(`/doctor-time-slots/${slotId}`);
      
      if (response.data.code === 200) {
        console.log("✅ Time slot deleted successfully");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("❌ Error deleting time slot:", error);
      return false;
    }
  }

  // ✅ Helper function để format time slot
  static formatTimeSlot(timeSlot: ApiDoctorTimeSlot): string {
    return `${timeSlot.startTime}-${timeSlot.endTime}`;
  }

  // ✅ Helper function để format day of week
  static formatDayOfWeek(dayOfWeek: number): string {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[dayOfWeek] || 'N/A';
  }
}