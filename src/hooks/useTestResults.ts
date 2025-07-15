// useTestResults.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  testResultService,
  TestResultResponse,
  TestResultRequest,
} from "../services/testResultService";
import {
  TestResultSummary,
  TestResultWithSample,
  TestResultFilter,
  TestResultDisplayData,
  TestResultType,
  TestResultStatus,
  TEST_RESULT_TYPE_LABELS,
  TEST_RESULT_STATUS_LABELS,
  TEST_RESULT_STATUS_COLORS,
  TEST_RESULT_TYPE_ICONS,
} from "../types/testResultTypes";

interface UseTestResultsState {
  testResults: TestResultResponse[];
  loading: boolean;
  error: string | null;
  summary: TestResultSummary | null;
}

interface UseTestResultsReturn {
  // State
  testResults: TestResultResponse[];
  loading: boolean;
  error: string | null;
  summary: TestResultSummary | null;

  // Actions
  fetchTestResults: () => Promise<void>;
  fetchTestResultsByUserId: (userId: string) => Promise<void>;
  fetchTestResultsBySampleId: (sampleId: string) => Promise<void>;
  createTestResult: (
    data: TestResultRequest
  ) => Promise<TestResultResponse | null>;
  updateTestResult: (
    id: string,
    data: TestResultRequest
  ) => Promise<TestResultResponse | null>;
  deleteTestResult: (id: string) => Promise<boolean>;
  refreshTestResults: () => Promise<void>;
  clearError: () => void;

  // Utilities
  getTestResultById: (id: string) => TestResultResponse | undefined;
  getTestResultsByType: (type: TestResultType) => TestResultResponse[];
  getLatestTestResult: () => TestResultResponse | undefined;
  hasTestResults: boolean;
  displayData: TestResultDisplayData[];
}

export const useTestResults = (
  initialUserId?: string,
  autoFetch: boolean = true
): UseTestResultsReturn => {
  const [state, setState] = useState<UseTestResultsState>({
    testResults: [],
    loading: false,
    error: null,
    summary: null,
  });

  // ✅ Helper function to update state safely
  const updateState = useCallback((updates: Partial<UseTestResultsState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // ✅ Calculate summary data
  const calculateSummary = useCallback(
    (results: TestResultResponse[]): TestResultSummary => {
      const summary: TestResultSummary = {
        total: results.length,
        completed: 0,
        pending: 0,
        failed: 0,
        byType: {} as Record<TestResultType, number>,
      };

      // Initialize type counts
      Object.values(TestResultType).forEach((type) => {
        summary.byType[type] = 0;
      });

      // Count results by status and type
      results.forEach((result) => {
        // Count by status (assuming we determine status from result data)
        if (result.conclusion && result.result_percentage) {
          summary.completed++;
        } else {
          summary.pending++;
        }

        // Count by type
        const resultType = result.result_type as TestResultType;
        if (summary.byType[resultType] !== undefined) {
          summary.byType[resultType]++;
        }
      });

      return summary;
    },
    []
  );

  // ✅ Convert to display data
  const displayData = useMemo((): TestResultDisplayData[] => {
    return state.testResults.map((result) => {
      const resultType = result.result_type as TestResultType;
      const percentageValue = parseFloat(result.result_percentage) || 0;

      // Determine status based on completion
      let status = TestResultStatus.PENDING;
      if (result.conclusion && result.result_percentage) {
        status = TestResultStatus.COMPLETED;
      }

      return {
        id: result.id,
        type: result.result_type,
        typeLabel: TEST_RESULT_TYPE_LABELS[resultType] || result.result_type,
        percentage: result.result_percentage,
        percentageValue,
        conclusion: result.conclusion,
        detail: result.result_detail,
        testedDate: result.tested_date,
        testedDateFormatted: new Date(result.tested_date).toLocaleDateString(
          "vi-VN",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
        hasFile: !!result.result_file,
        fileName: result.result_file,
        sampleId: result.sample_id,
        userId: result.user_id,
        status: status,
        statusColor: TEST_RESULT_STATUS_COLORS[status],
        icon: TEST_RESULT_TYPE_ICONS[resultType] || "📋",
      };
    });
  }, [state.testResults]);

  // ✅ Fetch all test results
  const fetchTestResults = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });
      const results = await testResultService.getAllTestResults();
      const summary = calculateSummary(results);
      updateState({ testResults: results, summary, loading: false });
    } catch (error) {
      console.error("Error fetching test results:", error);
      updateState({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch test results",
        loading: false,
      });
    }
  }, [updateState, calculateSummary]);

  // ✅ Fetch test results by user ID
  const fetchTestResultsByUserId = useCallback(
    async (userId: string) => {
      try {
        updateState({ loading: true, error: null });
        const results = await testResultService.getTestResultsByUserId(userId);
        const summary = calculateSummary(results);
        updateState({ testResults: results, summary, loading: false });
      } catch (error) {
        console.error("Error fetching test results by user ID:", error);
        updateState({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch test results",
          loading: false,
        });
      }
    },
    [updateState, calculateSummary]
  );

  // ✅ Fetch test results by sample ID
  const fetchTestResultsBySampleId = useCallback(
    async (sampleId: string) => {
      try {
        updateState({ loading: true, error: null });
        const results = await testResultService.getTestResultsBySampleId(
          sampleId
        );
        const summary = calculateSummary(results);
        updateState({ testResults: results, summary, loading: false });
      } catch (error) {
        console.error("Error fetching test results by sample ID:", error);
        updateState({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch test results",
          loading: false,
        });
      }
    },
    [updateState, calculateSummary]
  );

  // ✅ Create test result
  const createTestResult = useCallback(
    async (data: TestResultRequest): Promise<TestResultResponse | null> => {
      try {
        updateState({ loading: true, error: null });
        const newResult = await testResultService.createTestResult(data);

        // Add to existing results
        const updatedResults = [...state.testResults, newResult];
        const summary = calculateSummary(updatedResults);
        updateState({ testResults: updatedResults, summary, loading: false });

        return newResult;
      } catch (error) {
        console.error("Error creating test result:", error);
        updateState({
          error:
            error instanceof Error
              ? error.message
              : "Failed to create test result",
          loading: false,
        });
        return null;
      }
    },
    [state.testResults, updateState, calculateSummary]
  );

  // ✅ Update test result
  const updateTestResult = useCallback(
    async (
      id: string,
      data: TestResultRequest
    ): Promise<TestResultResponse | null> => {
      try {
        updateState({ loading: true, error: null });
        const updatedResult = await testResultService.updateTestResult(
          id,
          data
        );

        // Update in existing results
        const updatedResults = state.testResults.map((result) =>
          result.id === id ? updatedResult : result
        );
        const summary = calculateSummary(updatedResults);
        updateState({ testResults: updatedResults, summary, loading: false });

        return updatedResult;
      } catch (error) {
        console.error("Error updating test result:", error);
        updateState({
          error:
            error instanceof Error
              ? error.message
              : "Failed to update test result",
          loading: false,
        });
        return null;
      }
    },
    [state.testResults, updateState, calculateSummary]
  );

  // ✅ Delete test result
  const deleteTestResult = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        updateState({ loading: true, error: null });
        await testResultService.deleteTestResult(id);

        // Remove from existing results
        const updatedResults = state.testResults.filter(
          (result) => result.id !== id
        );
        const summary = calculateSummary(updatedResults);
        updateState({ testResults: updatedResults, summary, loading: false });

        return true;
      } catch (error) {
        console.error("Error deleting test result:", error);
        updateState({
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete test result",
          loading: false,
        });
        return false;
      }
    },
    [state.testResults, updateState, calculateSummary]
  );

  // ✅ Refresh test results
  const refreshTestResults = useCallback(async () => {
    if (initialUserId) {
      await fetchTestResultsByUserId(initialUserId);
    } else {
      await fetchTestResults();
    }
  }, [initialUserId, fetchTestResults, fetchTestResultsByUserId]);

  // ✅ Clear error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // ✅ Get test result by ID
  const getTestResultById = useCallback(
    (id: string): TestResultResponse | undefined => {
      return state.testResults.find((result) => result.id === id);
    },
    [state.testResults]
  );

  // ✅ Get test results by type
  const getTestResultsByType = useCallback(
    (type: TestResultType): TestResultResponse[] => {
      return state.testResults.filter((result) => result.result_type === type);
    },
    [state.testResults]
  );

  // ✅ Get latest test result
  const getLatestTestResult = useCallback(():
    | TestResultResponse
    | undefined => {
    if (state.testResults.length === 0) return undefined;

    return state.testResults.reduce((latest, current) => {
      const latestDate = new Date(latest.tested_date);
      const currentDate = new Date(current.tested_date);
      return currentDate > latestDate ? current : latest;
    });
  }, [state.testResults]);

  // ✅ Check if has test results
  const hasTestResults = useMemo(() => {
    return state.testResults.length > 0;
  }, [state.testResults]);

  // ✅ Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      if (initialUserId) {
        fetchTestResultsByUserId(initialUserId);
      } else {
        fetchTestResults();
      }
    }
  }, [autoFetch, initialUserId, fetchTestResults, fetchTestResultsByUserId]);

  return {
    // State
    testResults: state.testResults,
    loading: state.loading,
    error: state.error,
    summary: state.summary,

    // Actions
    fetchTestResults,
    fetchTestResultsByUserId,
    fetchTestResultsBySampleId,
    createTestResult,
    updateTestResult,
    deleteTestResult,
    refreshTestResults,
    clearError,

    // Utilities
    getTestResultById,
    getTestResultsByType,
    getLatestTestResult,
    hasTestResults,
    displayData,
  };
};

// ✅ Hook for single test result
export const useTestResult = (testResultId: string) => {
  const [testResult, setTestResult] = useState<TestResultResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTestResult = useCallback(async () => {
    if (!testResultId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await testResultService.getTestResultById(testResultId);
      setTestResult(result);
    } catch (error) {
      console.error("Error fetching test result:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch test result"
      );
    } finally {
      setLoading(false);
    }
  }, [testResultId]);

  useEffect(() => {
    fetchTestResult();
  }, [fetchTestResult]);

  return {
    testResult,
    loading,
    error,
    refetch: fetchTestResult,
    clearError: () => setError(null),
  };
};

// ✅ Hook for current user's test results
export const useCurrentUserTestResults = () => {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserId(user.id || "");
    } catch (error) {
      console.warn("Failed to get current user ID:", error);
    }
  }, []);

  return useTestResults(userId, !!userId);
};

export default useTestResults;
