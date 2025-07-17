// useTestResults.ts - Simple React hooks for v16
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  testResultService,
  TestResultResponse,
} from "../services/testResultService";
import {
  TestResultDisplayData,
  TestResultSummary,
  TestResultType,
  TestResultStatus,
  TEST_RESULT_TYPE_LABELS,
  TEST_RESULT_STATUS_COLORS,
} from "../types/testResultTypes";

// ✅ Main hook for test results
export const useTestResults = (userId?: string) => {
  const [testResults, setTestResults] = useState<TestResultResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch by user ID
  const fetchByUserId = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      setError(null);
      const results = await testResultService.getTestResultsByUserId(uid);
      setTestResults(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch test results"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ v16: Fetch by order ID
  const fetchByOrderId = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      const results = await testResultService.getTestResultsByOrderId(orderId);
      setTestResults(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch test results"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Auto-fetch if userId provided
  useEffect(() => {
    if (userId) {
      fetchByUserId(userId);
    }
  }, [userId, fetchByUserId]);

  // ✅ Convert to display data
  const displayData = useMemo((): TestResultDisplayData[] => {
    return testResults.map((result) => {
      const resultType = result.result_type as TestResultType;
      const percentageValue = parseFloat(result.result_percentage) || 0;
      const status = result.conclusion
        ? TestResultStatus.COMPLETED
        : TestResultStatus.PENDING;

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
          "vi-VN"
        ),
        hasFile: !!result.result_file,
        fileName: result.result_file,
        samplesId: result.samplesId,
        userId: result.userId,
        orderId: result.orders_id,
        status: status,
        statusColor: TEST_RESULT_STATUS_COLORS[status],
      };
    });
  }, [testResults]);

  // ✅ Summary
  const summary = useMemo((): TestResultSummary => {
    return {
      total: testResults.length,
      completed: testResults.filter((r) => r.conclusion).length,
      pending: testResults.filter((r) => !r.conclusion).length,
      failed: 0,
    };
  }, [testResults]);

  return {
    testResults,
    loading,
    error,
    displayData,
    summary,
    hasTestResults: testResults.length > 0,
    fetchByUserId,
    fetchByOrderId,
    refresh: () => (userId ? fetchByUserId(userId) : null),
    clearError: () => setError(null),
  };
};

// ✅ v16: Simple hook for order-based results
export const useOrderTestResults = (orderId: string) => {
  const [testResults, setTestResults] = useState<TestResultResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTestResults = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);
      const results = await testResultService.getTestResultsByOrderId(orderId);
      setTestResults(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch test results"
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchTestResults();
  }, [fetchTestResults]);

  return {
    testResults,
    loading,
    error,
    hasTestResults: testResults.length > 0,
    refetch: fetchTestResults,
    clearError: () => setError(null),
  };
};

// ✅ Hook for current user
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

  return useTestResults(userId);
};

export default useTestResults;
