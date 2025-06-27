import { apiClient } from '../../config/api';
import { ApiResponse, ApiMedicalRecord, MedicalRecordRequest } from '../../types/appointment';

export class MedicalRecordService {
  
  // ✅ Get all medical records
  static async getAllMedicalRecords(): Promise<ApiMedicalRecord[]> {
    try {
      console.log("🏥 Fetching all medical records...");
      
      const response = await apiClient.get<ApiResponse<ApiMedicalRecord[]>>("/medical-records");
      
      if (response.data.code === 200) {
        console.log("✅ Fetched medical records:", response.data.result.length);
        return response.data.result;
      } else {
        console.warn("⚠️ Failed to fetch medical records:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching medical records:", error);
      return [];
    }
  }

  // ✅ Get medical record by ID
  static async getMedicalRecordById(recordId: string): Promise<ApiMedicalRecord | null> {
    try {
      console.log(`🏥 Fetching medical record: ${recordId}`);
      
      const response = await apiClient.get<ApiResponse<ApiMedicalRecord>>(`/medical-records/${recordId}`);
      
      if (response.data.code === 200) {
        console.log("✅ Fetched medical record:", response.data.result);
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to fetch medical record ${recordId}:`, error);
      return null;
    }
  }

  // ✅ Get current user's medical records
  static async getCurrentUserMedicalRecords(): Promise<ApiMedicalRecord[]> {
    try {
      console.log("🏥 Fetching current user's medical records...");
      
      const response = await apiClient.get<ApiResponse<ApiMedicalRecord[]>>("/medical-records/my");
      
      if (response.data.code === 200) {
        console.log("✅ Fetched user medical records:", response.data.result.length);
        return response.data.result;
      } else {
        console.warn("⚠️ Failed to fetch user medical records:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching user medical records:", error);
      return [];
    }
  }

  // ✅ Create medical record
  static async createMedicalRecord(recordData: MedicalRecordRequest): Promise<ApiMedicalRecord | null> {
    try {
      console.log("🏥 Creating medical record...");

      const response = await apiClient.post<ApiResponse<ApiMedicalRecord>>("/medical-records", recordData);

      if (response.data.code === 200) {
        console.log("✅ Medical record created successfully");
        return response.data.result;
      } else {
        console.error("❌ Failed to create medical record:", response.data.message);
        return null;
      }

    } catch (error) {
      console.error("❌ Error creating medical record:", error);
      return null;
    }
  }

  // ✅ Update medical record
  static async updateMedicalRecord(recordId: string, recordData: Partial<MedicalRecordRequest>): Promise<ApiMedicalRecord | null> {
    try {
      console.log(`🏥 Updating medical record: ${recordId}`);
      
      const response = await apiClient.put<ApiResponse<ApiMedicalRecord>>(`/medical-records/${recordId}`, recordData);
      
      if (response.data.code === 200) {
        console.log("✅ Medical record updated successfully");
        return response.data.result;
      } else {
        console.error("❌ Failed to update medical record:", response.data.message);
        return null;
      }
    } catch (error) {
      console.error("❌ Error updating medical record:", error);
      return null;
    }
  }

  // ✅ Delete medical record
  static async deleteMedicalRecord(recordId: string): Promise<boolean> {
    try {
      console.log(`🏥 Deleting medical record: ${recordId}`);
      
      const response = await apiClient.delete(`/medical-records/${recordId}`);
      
      if (response.data.code === 200) {
        console.log("✅ Medical record deleted successfully");
        return true;
      } else {
        console.error("❌ Failed to delete medical record:", response.data.message);
        return false;
      }
    } catch (error) {
      console.error("❌ Error deleting medical record:", error);
      return false;
    }
  }

  // ✅ Helper: Format medical record for display
  static formatMedicalRecord(record: ApiMedicalRecord): string {
    return `Record #${record.record_code} - ${record.health_conditions || 'No conditions'}`;
  }

  // ✅ Helper: Check if record needs attention
  static needsAttention(record: ApiMedicalRecord): boolean {
    const hasAllergies = record.allergies && record.allergies.trim() !== '';
    const hasCriticalConditions = !!record.health_conditions && 
      record.health_conditions.toLowerCase().includes('critical');
    
    return hasAllergies || hasCriticalConditions;
  }
}