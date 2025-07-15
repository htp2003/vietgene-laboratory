// testResultService.ts
import axios, { AxiosResponse } from "axios";

// ✅ Base Configuration
const API_BASE_URL = "https://dna-service-se1857.onrender.com/dna_service";

// ✅ API Response Wrapper Interface
interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// ✅ Test Result Interfaces (Based on API v14 schemas)
export interface TestResultRequest {
  id?: string;
  result_type: string;
  result_percentage: string;
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
  result_file?: string;
  tested_date: string;
  user_id: string;
  sample_id: string;
}

// ✅ Helper function to get auth token
const getAuthToken = (): string => {
  try {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    return token || "";
  } catch (error) {
    console.warn("Failed to get auth token:", error);
    return "";
  }
};

// ✅ Helper function to create axios instance with auth
const createAuthenticatedRequest = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    timeout: 30000, // 30 seconds timeout
  });
};

// ✅ Test Result Service Class
export class TestResultService {
  private static instance: TestResultService;

  private constructor() {}

  public static getInstance(): TestResultService {
    if (!TestResultService.instance) {
      TestResultService.instance = new TestResultService();
    }
    return TestResultService.instance;
  }

  // ✅ Get all test results
  async getAllTestResults(): Promise<TestResultResponse[]> {
    try {
      const api = createAuthenticatedRequest();
      const response: AxiosResponse<ApiResponse<TestResultResponse[]>> =
        await api.get("/test-results");

      if (response.data.code === 200) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch test results"
        );
      }
    } catch (error) {
      console.error("Error fetching all test results:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  // ✅ Get test result by ID
  async getTestResultById(id: string): Promise<TestResultResponse> {
    try {
      if (!id) {
        throw new Error("Test result ID is required");
      }

      const api = createAuthenticatedRequest();
      const response: AxiosResponse<ApiResponse<TestResultResponse>> =
        await api.get(`/test-results/${id}`);

      if (response.data.code === 200) {
        return response.data.result;
      } else {
        throw new Error(response.data.message || "Failed to fetch test result");
      }
    } catch (error) {
      console.error(`Error fetching test result ${id}:`, error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  // ✅ Get test results by user ID
  async getTestResultsByUserId(userId: string): Promise<TestResultResponse[]> {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const api = createAuthenticatedRequest();
      const response: AxiosResponse<ApiResponse<TestResultResponse[]>> =
        await api.get(`/test-results/user/${userId}`);

      if (response.data.code === 200) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch test results for user"
        );
      }
    } catch (error) {
      console.error(`Error fetching test results for user ${userId}:`, error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  // ✅ Get test results by sample ID
  async getTestResultsBySampleId(
    sampleId: string
  ): Promise<TestResultResponse[]> {
    try {
      if (!sampleId) {
        throw new Error("Sample ID is required");
      }

      const api = createAuthenticatedRequest();
      const response: AxiosResponse<ApiResponse<TestResultResponse[]>> =
        await api.get(`/test-results/sample/${sampleId}`);

      if (response.data.code === 200) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch test results for sample"
        );
      }
    } catch (error) {
      console.error(
        `Error fetching test results for sample ${sampleId}:`,
        error
      );
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  // ✅ Create new test result
  async createTestResult(
    testResultData: TestResultRequest
  ): Promise<TestResultResponse> {
    try {
      if (!testResultData.result_type || !testResultData.sample_id) {
        throw new Error("Result type and sample ID are required");
      }

      const api = createAuthenticatedRequest();
      const response: AxiosResponse<ApiResponse<TestResultResponse>> =
        await api.post("/test-results", testResultData);

      if (response.data.code === 200) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.message || "Failed to create test result"
        );
      }
    } catch (error) {
      console.error("Error creating test result:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  // ✅ Update test result
  async updateTestResult(
    id: string,
    testResultData: TestResultRequest
  ): Promise<TestResultResponse> {
    try {
      if (!id) {
        throw new Error("Test result ID is required");
      }

      const api = createAuthenticatedRequest();
      const response: AxiosResponse<ApiResponse<TestResultResponse>> =
        await api.put(`/test-results/${id}`, testResultData);

      if (response.data.code === 200) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.message || "Failed to update test result"
        );
      }
    } catch (error) {
      console.error(`Error updating test result ${id}:`, error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  // ✅ Delete test result
  async deleteTestResult(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error("Test result ID is required");
      }

      const api = createAuthenticatedRequest();
      const response: AxiosResponse<ApiResponse<void>> = await api.delete(
        `/test-results/${id}`
      );

      if (response.data.code !== 200) {
        throw new Error(
          response.data.message || "Failed to delete test result"
        );
      }
    } catch (error) {
      console.error(`Error deleting test result ${id}:`, error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  // ✅ Utility: Get current user's test results
  async getCurrentUserTestResults(): Promise<TestResultResponse[]> {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id;

      if (!userId) {
        throw new Error("User not logged in");
      }

      return await this.getTestResultsByUserId(userId);
    } catch (error) {
      console.error("Error fetching current user test results:", error);
      throw error;
    }
  }

  // ✅ Utility: Get test results for multiple samples
  async getTestResultsForSamples(
    sampleIds: string[]
  ): Promise<Map<string, TestResultResponse[]>> {
    try {
      const resultMap = new Map<string, TestResultResponse[]>();

      // Fetch results for each sample in parallel
      const promises = sampleIds.map(async (sampleId) => {
        try {
          const results = await this.getTestResultsBySampleId(sampleId);
          return { sampleId, results };
        } catch (error) {
          console.warn(
            `Failed to fetch results for sample ${sampleId}:`,
            error
          );
          return { sampleId, results: [] };
        }
      });

      const responses = await Promise.all(promises);

      responses.forEach(({ sampleId, results }) => {
        resultMap.set(sampleId, results);
      });

      return resultMap;
    } catch (error) {
      console.error("Error fetching test results for multiple samples:", error);
      throw error;
    }
  }

  // ✅ Utility: Check if test results exist for sample
  async hasTestResults(sampleId: string): Promise<boolean> {
    try {
      const results = await this.getTestResultsBySampleId(sampleId);
      return results.length > 0;
    } catch (error) {
      console.warn(
        `Error checking test results for sample ${sampleId}:`,
        error
      );
      return false;
    }
  }

  // ✅ Utility: Get latest test result for sample
  async getLatestTestResultForSample(
    sampleId: string
  ): Promise<TestResultResponse | null> {
    try {
      const results = await this.getTestResultsBySampleId(sampleId);

      if (results.length === 0) {
        return null;
      }

      // Sort by tested_date descending and return the latest
      const sortedResults = results.sort(
        (a, b) =>
          new Date(b.tested_date).getTime() - new Date(a.tested_date).getTime()
      );

      return sortedResults[0];
    } catch (error) {
      console.error(
        `Error getting latest test result for sample ${sampleId}:`,
        error
      );
      return null;
    }
  }

  // ✅ Utility: Format test result for display
  formatTestResultForDisplay(testResult: TestResultResponse): {
    id: string;
    type: string;
    percentage: string;
    conclusion: string;
    detail: string;
    testedDate: string;
    hasFile: boolean;
    fileName?: string;
  } {
    return {
      id: testResult.id,
      type: testResult.result_type,
      percentage: testResult.result_percentage,
      conclusion: testResult.conclusion,
      detail: testResult.result_detail,
      testedDate: new Date(testResult.tested_date).toLocaleDateString("vi-VN"),
      hasFile: !!testResult.result_file,
      fileName: testResult.result_file,
    };
  }

  // ✅ Utility: Download test result file
  async downloadTestResultFile(testResult: TestResultResponse): Promise<void> {
    try {
      if (!testResult.result_file) {
        throw new Error("No file available for this test result");
      }

      // Create a download link
      const link = document.createElement("a");
      link.href = testResult.result_file;
      link.download = `test-result-${testResult.id}.pdf`;
      link.target = "_blank";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading test result file:", error);
      throw error;
    }
  }
}

// ✅ Export singleton instance
export const testResultService = TestResultService.getInstance();

// ✅ Export default
export default testResultService;
