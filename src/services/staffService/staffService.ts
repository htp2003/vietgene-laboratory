import { apiClient } from '../../config/api';
import { ApiResponse, ApiService, ServiceRequest } from '../../types/appointment';

export class StaffService {
  
  // ✅ Get all services
  static async getAllServices(): Promise<ApiService[]> {
    try {
      console.log("🧬 Fetching all services...");
      
      const response = await apiClient.get<ApiResponse<ApiService[]>>("/service/all");
      
      if (response.data.code === 200) {
        console.log("✅ Fetched services:", response.data.result.length);
        return response.data.result;
      } else {
        console.warn("⚠️ Failed to fetch services:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching services:", error);
      return [];
    }
  }

  // ✅ Get service by ID
  static async getServiceById(serviceId: string): Promise<ApiService | null> {
    try {
      const response = await apiClient.get<ApiResponse<ApiService>>(`/service/${serviceId}`);
      return response.data.code === 200 ? response.data.result : null;
    } catch (error) {
      console.warn(`Failed to fetch service ${serviceId}:`, error);
      return null;
    }
  }

  // ✅ Get services by user ID
  static async getServicesByUserId(userId: string): Promise<ApiService[]> {
    try {
      console.log(`🧬 Fetching services for user ${userId}...`);
      
      const response = await apiClient.get<ApiResponse<ApiService[]>>(`/service/${userId}/all`);
      
      if (response.data.code === 200) {
        console.log("✅ Fetched user services:", response.data.result.length);
        return response.data.result;
      } else {
        console.warn("⚠️ Failed to fetch user services:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching user services:", error);
      return [];
    }
  }

  // ✅ Create service
  static async createService(serviceData: ServiceRequest): Promise<ApiService | null> {
    try {
      console.log("🧬 Creating new service...");
      
      const response = await apiClient.post<ApiResponse<ApiService>>("/service", serviceData);
      
      if (response.data.code === 200) {
        console.log("✅ Service created successfully");
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error creating service:", error);
      return null;
    }
  }

  // ✅ Update service
  static async updateService(serviceId: string, serviceData: ServiceRequest): Promise<ApiService | null> {
    try {
      console.log(`🧬 Updating service ${serviceId}...`);
      
      const response = await apiClient.put<ApiResponse<ApiService>>(`/service/${serviceId}`, serviceData);
      
      if (response.data.code === 200) {
        console.log("✅ Service updated successfully");
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error updating service:", error);
      return null;
    }
  }

  // ✅ Delete service
  static async deleteService(serviceId: string): Promise<boolean> {
    try {
      console.log(`🧬 Deleting service ${serviceId}...`);
      
      const response = await apiClient.delete(`/service/${serviceId}`);
      
      if (response.data.code === 200) {
        console.log("✅ Service deleted successfully");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("❌ Error deleting service:", error);
      return false;
    }
  }
}