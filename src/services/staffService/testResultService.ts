// services/staffService/testResultService.ts
import apiClient from "../apiClient";
import { SampleService, SampleResponse } from "./sampleService";

export interface TestResultRequest {
  id?: string;
  result_type: string;
  result_percentage: string; // ✅ Always string, never empty
  conclusion: string;
  result_detail: string;
  result_file?: string;
  tested_date: string;
  sample_id: string; // ✅ Single sample ID for API compatibility
}

export interface TestResultResponse {
  id: string;
  result_type: string;
  result_percentage: string;
  conclusion: string;
  result_detail: string;
  result_file: string;
  tested_date: string;
  userId: string;
  samplesId: string;
}

export interface ApiTestResultResponse {
  code: number;
  message: string;
  result: TestResultResponse;
}

export interface CreateTestResultBySampleParams {
  sampleIds: string[];
  orderId: string;
  resultType: 'Positive' | 'Negative' | 'Inconclusive';
  resultPercentage: string;
  conclusion: string;
  resultDetails: string;
  resultFile?: string; // ✅ Changed from File to string
  skipValidation?: boolean;
}

export interface CreateTestResultResponse {
  success: boolean;
  result: TestResultResponse; // ✅ Single result since API returns one result for all samples
  message?: string;
}

export class TestResultService {
  /**
   * ✅ Map frontend result type to API expected format
   */
  // private static mapResultTypeToAPI(resultType: string): string {
  //   const typeMapping = {
  //     'Positive': 'DNA_PATERNITY',        // For DNA paternity tests
  //     'Negative': 'DNA_PATERNITY_NEGATIVE', 
  //     'Inconclusive': 'DNA_INCONCLUSIVE'
  //   };
    
  //   return typeMapping[resultType as keyof typeof typeMapping] || 'DNA_PATERNITY';
  // }

  /**
   * Debug current user role and permissions
   */
  private static debugUserRole(): any {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No token found');
        return null;
      }
      
      // Decode JWT payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      console.log('🔑 Current User Token Details:');
      console.log('📋 Full payload:', payload);
      console.log('👤 User ID:', payload.userId || payload.sub);
      console.log('👥 Roles/Authorities:', payload.scope || payload.authorities || payload.roles);
      console.log('⏰ Expires:', new Date(payload.exp * 1000).toISOString());
      
      // Check if role includes required permissions
      const roles = payload.scope || payload.authorities || payload.roles || [];
      const roleArray = Array.isArray(roles) ? roles : roles.split(' ');
      
      console.log('🔍 Role Analysis:');
      console.log('- STAFF role:', roleArray.includes('STAFF') ? '✅' : '❌');
      console.log('- DOCTOR role:', roleArray.includes('DOCTOR') ? '✅' : '❌');
      console.log('- MANAGER role:', roleArray.includes('MANAGER') ? '✅' : '❌');
      console.log('- ADMIN role:', roleArray.includes('ADMIN') ? '✅' : '❌');
      console.log('- All roles:', roleArray);
      
      // Possible required roles for test-results endpoint
      const possibleRequiredRoles = ['DOCTOR', 'STAFF', 'MANAGER', 'LAB_TECH', 'TECHNICIAN'];
      const hasRequiredRole = possibleRequiredRoles.some(role => roleArray.includes(role));
      
      if (!hasRequiredRole) {
        console.warn('⚠️ Current user may not have required role for test-results endpoint');
        console.warn('🔧 Required roles (guess):', possibleRequiredRoles);
        console.warn('👤 Your roles:', roleArray);
      }
      
      return {
        userId: payload.userId || payload.sub,
        roles: roleArray,
        hasRequiredRole,
        tokenValid: payload.exp * 1000 > Date.now()
      };
      
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if authentication token is valid
   */
  private static checkAuthToken(): boolean {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No authentication token found');
        return false;
      }
      
      // Basic JWT decode (for debugging only)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('❌ Invalid token format');
        return false;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      console.log('🔑 Token info:', {
        exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiry',
        iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'No issued time',
        roles: payload.scope || payload.authorities || payload.roles || 'No roles found',
        userId: payload.userId || payload.sub || 'No user ID'
      });
      
      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.error('❌ Token has expired');
        return false;
      }
      
      return true;
    } catch (e) {
      console.error('❌ Error checking token:', e);
      return false;
    }
  }

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
   * ✅ Create test result for multiple samples (multiple API calls)
   * Since API only accepts single sample_id, we need to call it multiple times
   */
 /**
 * ✅ Create test result for ALL samples in ONE API call (NO LOOP)
 */
static async createTestResultBySample(params: CreateTestResultBySampleParams): Promise<CreateTestResultResponse> {
  try {
    console.log('🧪 Creating test result for ALL samples:', params.sampleIds);

    // ✅ Check authentication first
    console.log('🚀 Starting role debug...');
    const userInfo = this.debugUserRole();
    
    if (!this.checkAuthToken()) {
      throw new Error('Token xác thực không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
    }
    
    if (userInfo && !userInfo.hasRequiredRole) {
      console.error('🚫 LIKELY ISSUE: Current user role does not have permission to create test results');
      console.error('💡 SOLUTION: Login with DOCTOR or STAFF role, or contact admin to update permissions');
      // Don't throw error yet, let's see what the API returns
    }

    if (params.sampleIds.length === 0) {
      throw new Error('Không có mẫu xét nghiệm nào được chọn');
    }

    if (!params.orderId) {
      throw new Error('Không tìm thấy thông tin đơn hàng');
    }


    // ✅ Step 3: Ensure result_percentage is never empty
    const resultPercentage = this.normalizeResultPercentage(params.resultType, params.resultPercentage);

    console.log('📋 Normalized result percentage:', resultPercentage);

    // ✅ Step 4: Prepare request data with CORRECT API format - SINGLE REQUEST FOR ALL SAMPLES
    const requestData: any = {
      result_type: params.resultType,
      result_percentage: resultPercentage,
      conclusion: params.conclusion,
      result_file: params.resultFile,
      result_detail: params.resultDetails,
      tested_date: new Date().toISOString(),
      orders_id: params.orderId,
      sample_id: params.sampleIds // ✅ ENTIRE ARRAY - NO LOOP!
    };


    const response = await apiClient.post<ApiTestResultResponse>('/test-results', requestData);

    if (response.data.code === 200) {
      console.log('✅ Test result created successfully for ALL samples:', response.data.result);
      
      return {
        success: true,
        result: response.data.result,
        message: `Tạo thành công kết quả xét nghiệm cho ${params.sampleIds.length} mẫu`
      };
    } else {
      throw new Error(response.data.message || 'Failed to create test result');
    }

  } catch (error: any) {
    console.error('❌ Error creating test result:', error);
    
    // ✅ Enhanced error logging
    if (error.response) {
      console.error('📄 Response status:', error.response.status);
      console.error('📄 Response data:', error.response.data);
      console.error('📄 Response headers:', error.response.headers);
    }
    
    if (error.request) {
      console.error('📡 Request details:', {
        url: error.request.responseURL,
        method: error.request.method,
        status: error.request.status
      });
    }
    
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
   * ✅ Normalize result percentage to ensure it's never empty
   */
  private static normalizeResultPercentage(resultType: string, inputPercentage: string): string {
    // If user provided a percentage, use it
    if (inputPercentage && inputPercentage.trim()) {
      const num = parseFloat(inputPercentage.trim());
      if (!isNaN(num) && num >= 0 && num <= 100) {
        return inputPercentage.trim();
      }
    }

    // ✅ Provide default values based on result type
    switch (resultType) {
      case 'Positive':
        return '99.99'; // Default high confidence for positive results
      case 'Negative':
        return '0.00';  // Default for negative results
      case 'Inconclusive':
        return '50.00'; // Default for inconclusive results
      default:
        return '0.00';  // Fallback
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
   * Validate that samples exist before creating test result
   */
  private static async validateSamplesExist(sampleIds: string[]): Promise<void> {
    try {
      if (sampleIds.length === 0) {
        throw new Error('Không có mẫu xét nghiệm nào được chọn');
      }

      console.log('🔍 Validating samples:', sampleIds);

      // Validate each sample exists
      for (const sampleId of sampleIds) {
        try {
          const sample = await SampleService.getSampleById(sampleId);
          if (!sample) {
            throw new Error(`Mẫu ${sampleId} không tồn tại`);
          }
          console.log(`✅ Sample ${sampleId} validated: ${sample.sample_code}`);
        } catch (error: any) {
          console.error(`❌ Sample ${sampleId} validation failed:`, error);
          throw new Error(`Mẫu ${sampleId} không hợp lệ: ${error.message}`);
        }
      }

      console.log(`✅ All ${sampleIds.length} samples validated successfully`);

    } catch (error: any) {
      console.error('❌ Sample validation failed:', error);
      throw error; // Re-throw the specific error
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