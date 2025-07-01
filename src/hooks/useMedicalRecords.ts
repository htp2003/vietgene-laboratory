// hooks/useMedicalRecords.ts (View-Only Version)
import { useState, useEffect } from "react";
import {
  medicalRecordService,
  MedicalRecord,
} from "../services/medicalRecordsService";

interface UseMedicalRecordsViewOnlyReturn {
  records: MedicalRecord[];
  loading: boolean;
  error: string | null;

  // Actions
  loadMedicalRecords: () => Promise<void>;
  clearError: () => void;
}

export const useMedicalRecordsViewOnly =
  (): UseMedicalRecordsViewOnlyReturn => {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load medical records from API (View-Only)
    const loadMedicalRecords = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await medicalRecordService.getMyMedicalRecords();

        if (response.success && response.data) {
          setRecords(response.data);
        } else {
          setError(response.message);
          setRecords([]);
        }
      } catch (err: any) {
        console.error("Load medical records error:", err);
        setError("Không thể tải hồ sơ y tế. Vui lòng thử lại sau.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    // Clear error message
    const clearError = () => {
      setError(null);
    };

    // Load data on mount
    useEffect(() => {
      loadMedicalRecords();
    }, []);

    return {
      records,
      loading,
      error,
      loadMedicalRecords,
      clearError,
    };
  };
