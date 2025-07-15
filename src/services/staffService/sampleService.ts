// services/staffService/sampleService.ts
import { apiClient } from "../../config/api";

export interface SampleRequest {
  sample_code: string;
  sample_type: string;
  collection_date: string; // ISO datetime
  received_date: string; // ISO datetime
  status: string;
  shipping_tracking?: string;
  notes?: string;
  sample_quality: string;
  ordersId: string;
  sampleKitsId: string;
}

export interface SampleResponse {
  id: string;
  sample_code: string;
  sample_type: string;
  collection_date: string;
  received_date: string;
  status: string;
  shipping_tracking: string;
  notes: string;
  sample_quality: string;
  userId: string;
  sampleKitsId: string;
}

export interface ApiSampleResponse {
  code: number;
  message: string;
  result: SampleResponse;
}

export interface SampleKit {
  id: string;
  kit_code: string;
  kit_type: string;
  status: string;
  shipper_data: string | null;
  delivered_date: string;
  tracking_number: number;
  shipping_address: string;
  expiry_date: string | null;
  instruction: string;
  createdAt: string;
  updatedAt: string;
  order_participants_id: string | null;
  samplesId: string;
  userId: string;
  orderId: string;
}

export interface ApiSampleKitsResponse {
  code: number;
  message: string;
  result: SampleKit[];
}

export class SampleService {
  /**
   * Create a new sample
   */
  static async createSample(sampleData: SampleRequest): Promise<SampleResponse> {
    try {
      console.log('🧪 Creating sample:', sampleData);
      
      const response = await apiClient.post<ApiSampleResponse>('/samples', sampleData);
      
      if (response.data.code === 200) {
        console.log('✅ Sample created successfully:', response.data.result);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to create sample');
      }
    } catch (error: any) {
      console.error('❌ Error creating sample:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Có lỗi xảy ra khi tạo mẫu xét nghiệm');
    }
  }

  /**
   * Get all samples
   */
  static async getAllSamples(): Promise<SampleResponse[]> {
    try {
      console.log('📋 Getting all samples...');
      
      const response = await apiClient.get<{code: number, message: string, result: SampleResponse[]}>('/samples');
      
      if (response.data.code === 200) {
        console.log('✅ Samples fetched successfully:', response.data.result.length);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch samples');
      }
    } catch (error: any) {
      console.error('❌ Error fetching samples:', error);
      throw new Error('Có lỗi xảy ra khi tải danh sách mẫu xét nghiệm');
    }
  }

  /**
   * Get sample by ID
   */
  static async getSampleById(sampleId: string): Promise<SampleResponse> {
    try {
      console.log('🔍 Getting sample by ID:', sampleId);

      const response = await apiClient.get<ApiSampleResponse>(`/samples/${sampleId}`);

      if (response.data.code === 200) {
        console.log('✅ Sample fetched successfully:', response.data.result);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch sample');
      }
    } catch (error: any) {
      console.error('❌ Error fetching sample:', error);
      throw new Error('Có lỗi xảy ra khi tải thông tin mẫu xét nghiệm');
    }
  }

  /**
   * Update sample
   */
  static async updateSample(sampleId: string, sampleData: Partial<SampleRequest>): Promise<SampleResponse> {
    try {
      console.log('📝 Updating sample:', sampleId, sampleData);

      const response = await apiClient.put<ApiSampleResponse>(`/samples/${sampleId}`, sampleData);

      if (response.data.code === 200) {
        console.log('✅ Sample updated successfully:', response.data.result);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to update sample');
      }
    } catch (error: any) {
      console.error('❌ Error updating sample:', error);
      throw new Error('Có lỗi xảy ra khi cập nhật mẫu xét nghiệm');
    }
  }

  /**
   * Delete sample
   */
  static async deleteSample(sampleId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting sample:', sampleId);

      const response = await apiClient.delete(`/samples/${sampleId}`);

      console.log('✅ Sample deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting sample:', error);
      throw new Error('Có lỗi xảy ra khi xóa mẫu xét nghiệm');
    }
  }

  /**
   * Get samples by user ID
   */
  static async getSamplesByOrderId(orderId: string): Promise<SampleResponse[]> {
    try {
      console.log('👤 Getting samples by user ID:', orderId);

      const response = await apiClient.get<{code: number, message: string, result: SampleResponse[]}>(`/samples/order/${orderId}`);

      if (response.data.code === 200) {
        console.log('✅ User samples fetched successfully:', response.data.result.length);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch user samples');
      }
    } catch (error: any) {
      console.error('❌ Error fetching user samples:', error);
      throw new Error('Có lỗi xảy ra khi tải mẫu xét nghiệm của người dùng');
    }
  }

  /**
   * Get samples by sample kit ID
   */
  static async getSamplesBySampleKitsId(sampleKitsId: string): Promise<SampleResponse[]> {
    try {
      console.log('📦 Getting samples by sample kit ID:', sampleKitsId);

      const response = await apiClient.get<{code: number, message: string, result: SampleResponse[]}>(`/samples/samplekits/${sampleKitsId}`);

      if (response.data.code === 200) {
        console.log('✅ Sample kit samples fetched successfully:', response.data.result.length);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch sample kit samples');
      }
    } catch (error: any) {
      console.error('❌ Error fetching sample kit samples:', error);
      throw new Error('Có lỗi xảy ra khi tải mẫu xét nghiệm của kit');
    }
  }
}

export class SampleKitsService {
  /**
   * Get sample kits by order ID
   */
  static async getSampleKitsByOrderId(orderId: string): Promise<SampleKit[]> {
    try {
      console.log('📦 Getting sample kits by order ID:', orderId);

      const response = await apiClient.get<ApiSampleKitsResponse>(`/sample-kits/order/${orderId}`);

      if (response.data.code === 200) {
        console.log('✅ Sample kits fetched successfully:', response.data.result.length);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch sample kits');
      }
    } catch (error: any) {
      console.error('❌ Error fetching sample kits:', error);
      throw new Error('Có lỗi xảy ra khi tải kit xét nghiệm');
    }
  }

  /**
   * Get all sample kits
   */
  static async getAllSampleKits(): Promise<SampleKit[]> {
    try {
      console.log('📋 Getting all sample kits...');

      const response = await apiClient.get<ApiSampleKitsResponse>('/sample-kits');

      if (response.data.code === 200) {
        console.log('✅ Sample kits fetched successfully:', response.data.result.length);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch sample kits');
      }
    } catch (error: any) {
      console.error('❌ Error fetching sample kits:', error);
      throw new Error('Có lỗi xảy ra khi tải danh sách kit xét nghiệm');
    }
  }

  /**
   * Get sample kit by ID
   */
  static async getSampleKitById(kitId: string): Promise<SampleKit> {
    try {
      console.log('🔍 Getting sample kit by ID:', kitId);

      const response = await apiClient.get<{code: number, message: string, result: SampleKit}>(`/sample-kits/${kitId}`);

      if (response.data.code === 200) {
        console.log('✅ Sample kit fetched successfully:', response.data.result);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch sample kit');
      }
    } catch (error: any) {
      console.error('❌ Error fetching sample kit:', error);
      throw new Error('Có lỗi xảy ra khi tải thông tin kit xét nghiệm');
    }
  }
}