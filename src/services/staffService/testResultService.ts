// services/staffService/testResultService.ts
import apiClient from "../apiClient";
import { SampleService, SampleResponse } from "./sampleService";

export interface TestResultRequest {
  id?: string;
  result_type: string;
  result_percentage?: string;
  conclusion: string;
  result_detail: string;
  result_file?: string;
  tested_date: string;
  sample_id: string;
}

export interface TestResultResponse {
  id: string;
  result_type: string;
  result_percentage: string;
  conclusion: string;
  result_detail: string;
  result_file: string;
  tested_date: string;
  user_id: string;
  sample_id: string;
}

export interface ApiTestResultResponse {
  code: number;
  message: string;
  result: TestResultResponse;
}

export interface CreateTestResultBySampleParams {
  sampleId: string;
  resultType: 'Positive' | 'Negative' | 'Inconclusive';
  resultPercentage?: number;
  conclusion: string;
  resultDetails: string;
  resultFile?: File;
}

export class TestResultService {
  /**
   * Get samples by order ID
   */
  static async getSamplesByOrderId(orderId: string): Promise<SampleResponse[]> {
    try {
      console.log('📦 Getting samples by order ID:', orderId);

      const response = await apiClient.get<{code: number, message: string, result: SampleResponse[]}>(`/samples/order/${orderId}`);

      if (response.data.code === 200) {
        console.log('✅ Order samples fetched successfully:', response.data.result.length);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch order samples');
      }
    } catch (error: any) {
      console.error('❌ Error fetching order samples:', error);
      throw new Error('Có lỗi xảy ra khi tải mẫu xét nghiệm của đơn hàng');
    }
  }

  /**
   * Create test result by sample ID
   */
  static async createTestResultBySample(params: CreateTestResultBySampleParams): Promise<TestResultResponse> {
    try {
      console.log('🧪 Creating test result for sample:', params.sampleId);

      // Step 1: Validate sample exists
      await this.validateSampleExists(params.sampleId);

      // Step 2: Convert file to base64 if provided
      const resultFileString = params.resultFile ? await this.fileToBase64(params.resultFile) : undefined;

      // Step 3: Prepare request data
      const requestData: TestResultRequest = {
        result_type: params.resultType,
        result_percentage: params.resultPercentage?.toString(),
        conclusion: params.conclusion,
        result_detail: params.resultDetails,
        result_file: resultFileString,
        tested_date: new Date().toISOString(),
        sample_id: params.sampleId
      };

      // Step 4: Send API request
      const response = await apiClient.post<ApiTestResultResponse>('/test-results', requestData);

      if (response.data.code === 200) {
        console.log('✅ Test result created successfully:', response.data.result);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to create test result');
      }

    } catch (error: any) {
      console.error('❌ Error creating test result:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      if (error.message) {
        throw new Error(error.message);
      }
      
      throw new Error('Có lỗi xảy ra khi lưu kết quả xét nghiệm');
    }
  }

  /**
   * Get all test results
   */
  static async getAllTestResults(): Promise<TestResultResponse[]> {
    try {
      console.log('📋 Getting all test results...');
      
      const response = await apiClient.get<{code: number, message: string, result: TestResultResponse[]}>('/test-results');
      
      if (response.data.code === 200) {
        console.log('✅ Test results fetched successfully:', response.data.result.length);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch test results');
      }
    } catch (error: any) {
      console.error('❌ Error fetching test results:', error);
      throw new Error('Có lỗi xảy ra khi tải danh sách kết quả xét nghiệm');
    }
  }

  /**
   * Get test result by ID
   */
  static async getTestResultById(resultId: string): Promise<TestResultResponse> {
    try {
      console.log('🔍 Getting test result by ID:', resultId);

      const response = await apiClient.get<ApiTestResultResponse>(`/test-results/${resultId}`);

      if (response.data.code === 200) {
        console.log('✅ Test result fetched successfully:', response.data.result);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch test result');
      }
    } catch (error: any) {
      console.error('❌ Error fetching test result:', error);
      throw new Error('Có lỗi xảy ra khi tải kết quả xét nghiệm');
    }
  }

  /**
   * Get test results by user ID
   */
  static async getTestResultsByUserId(userId: string): Promise<TestResultResponse[]> {
    try {
      console.log('👤 Getting test results by user ID:', userId);

      const response = await apiClient.get<{code: number, message: string, result: TestResultResponse[]}>(`/test-results/user/${userId}`);

      if (response.data.code === 200) {
        console.log('✅ User test results fetched successfully:', response.data.result.length);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch user test results');
      }
    } catch (error: any) {
      console.error('❌ Error fetching user test results:', error);
      throw new Error('Có lỗi xảy ra khi tải kết quả xét nghiệm của người dùng');
    }
  }

  /**
   * Get test results by sample ID
   */
  static async getTestResultsBySampleId(sampleId: string): Promise<TestResultResponse[]> {
    try {
      console.log('🧪 Getting test results by sample ID:', sampleId);

      const response = await apiClient.get<{code: number, message: string, result: TestResultResponse[]}>(`/test-results/sample/${sampleId}`);

      if (response.data.code === 200) {
        console.log('✅ Sample test results fetched successfully:', response.data.result.length);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to fetch sample test results');
      }
    } catch (error: any) {
      console.error('❌ Error fetching sample test results:', error);
      throw new Error('Có lỗi xảy ra khi tải kết quả xét nghiệm của mẫu');
    }
  }

  /**
   * Update test result
   */
  static async updateTestResult(resultId: string, updateData: Partial<TestResultRequest>): Promise<TestResultResponse> {
    try {
      console.log('📝 Updating test result:', resultId, updateData);

      const response = await apiClient.put<ApiTestResultResponse>(`/test-results/${resultId}`, updateData);

      if (response.data.code === 200) {
        console.log('✅ Test result updated successfully:', response.data.result);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'Failed to update test result');
      }
    } catch (error: any) {
      console.error('❌ Error updating test result:', error);
      throw new Error('Có lỗi xảy ra khi cập nhật kết quả xét nghiệm');
    }
  }

  /**
   * Delete test result
   */
  static async deleteTestResult(resultId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting test result:', resultId);

      const response = await apiClient.delete(`/test-results/${resultId}`);

      console.log('✅ Test result deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting test result:', error);
      throw new Error('Có lỗi xảy ra khi xóa kết quả xét nghiệm');
    }
  }

  /**
   * Validate that sample exists before creating test result
   */
  private static async validateSampleExists(sampleId: string): Promise<SampleResponse> {
    try {
      const sample = await SampleService.getSampleById(sampleId);
      
      // Additional validations
      if (sample.status === 'PENDING') {
        throw new Error('Mẫu xét nghiệm chưa sẵn sàng để có kết quả');
      }

      return sample;
    } catch (error: any) {
      if (error.message.includes('Mẫu xét nghiệm chưa sẵn sàng')) {
        throw error;
      }
      throw new Error('Không tìm thấy mẫu xét nghiệm hoặc mẫu không hợp lệ');
    }
  }

  /**
   * Convert file to base64 string
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:image/...;base64, prefix to keep only the base64 string
        const base64Data = base64.split(',')[1] || base64;
        resolve(base64Data);
      };
      
      reader.onerror = () => {
        reject(new Error('Có lỗi xảy ra khi đọc file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Helper function to map result types to Vietnamese
   */
  static getResultTypeLabel(resultType: string): string {
    const labels = {
      'Positive': 'Dương tính',
      'Negative': 'Âm tính', 
      'Inconclusive': 'Không xác định'
    };
    return labels[resultType as keyof typeof labels] || resultType;
  }

  /**
   * Helper function to validate percentage for DNA tests
   */
  static validateDNAPercentage(percentage: number): boolean {
    return percentage >= 0 && percentage <= 100;
  }

  /**
   * Helper function to format test result for display
   */
  static formatTestResultForDisplay(result: TestResultResponse) {
    return {
      ...result,
      result_type_label: this.getResultTypeLabel(result.result_type),
      tested_date_formatted: new Date(result.tested_date).toLocaleDateString('vi-VN'),
      result_percentage_formatted: result.result_percentage ? `${result.result_percentage}%` : null
    };
  }
}