// services/doctorService.ts
import apiClient from './apiClient';
import { ApiResponse, ApiDoctor, DoctorRequest } from '../types/api';

// ✅ In-memory cache for doctors
let doctorsCache: { data: ApiDoctor[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class DoctorService {
  
  // ✅ Get all doctors with caching
  static async getAllDoctors(forceRefresh = false): Promise<ApiDoctor[]> {
    try {
      // Check cache first
      if (!forceRefresh && doctorsCache && (Date.now() - doctorsCache.timestamp) < CACHE_DURATION) {
        console.log("👨‍⚕️ Using cached doctors data");
        return doctorsCache.data;
      }

      console.log("👨‍⚕️ Fetching doctors from API...");
      
      const response = await apiClient.get<ApiResponse<ApiDoctor[]>>("/doctors");
      
      if (response.data.code === 200) {
        // Update cache
        doctorsCache = {
          data: response.data.result,
          timestamp: Date.now()
        };
        
        console.log("✅ Fetched and cached doctors:", response.data.result.length);
        return response.data.result;
      } else {
        console.warn("⚠️ Failed to fetch doctors:", response.data.message);
        return doctorsCache?.data || [];
      }
    } catch (error) {
      console.error("❌ Error fetching doctors:", error);
      // Return cached data if available
      return doctorsCache?.data || [];
    }
  }

  // ✅ Get doctor by ID with cache lookup
  static async getDoctorById(doctorId: string): Promise<ApiDoctor | null> {
    try {
      // Try cache first
      if (doctorsCache) {
        const cachedDoctor = doctorsCache.data.find(d => d.doctorId === doctorId);
        if (cachedDoctor) {
          console.log(`👨‍⚕️ Found doctor ${doctorId} in cache`);
          return cachedDoctor;
        }
      }

      console.log(`👨‍⚕️ Fetching doctor ${doctorId} from API...`);
      
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

  // ✅ Create doctor and invalidate cache
  static async createDoctor(doctorData: DoctorRequest): Promise<ApiDoctor | null> {
    try {
      console.log("👨‍⚕️ Creating new doctor...");
      
      const response = await apiClient.post<ApiResponse<ApiDoctor>>("/doctors", doctorData);
      
      if (response.data.code === 200) {
        console.log("✅ Doctor created successfully");
        // Invalidate cache
        doctorsCache = null;
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error creating doctor:", error);
      return null;
    }
  }

  // ✅ Update doctor and invalidate cache
  static async updateDoctor(doctorId: string, doctorData: DoctorRequest): Promise<boolean> {
    try {
      console.log(`👨‍⚕️ Updating doctor ${doctorId}...`);
      
      const response = await apiClient.put(`/doctors/${doctorId}`, doctorData);
      
      if (response.data.code === 200) {
        console.log("✅ Doctor updated successfully");
        // Invalidate cache
        doctorsCache = null;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("❌ Error updating doctor:", error);
      return false;
    }
  }

  // ✅ Create doctor map for efficient lookup
  static createDoctorMap(doctors: ApiDoctor[]): Map<string, ApiDoctor> {
    return new Map(doctors.map(doctor => [doctor.doctorId, doctor]));
  }

  // ✅ Clear cache manually
  static clearCache(): void {
    doctorsCache = null;
    console.log("🗑️ Doctors cache cleared");
  }
}

export default DoctorService;