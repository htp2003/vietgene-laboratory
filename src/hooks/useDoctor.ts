import { useCallback, useEffect, useState } from "react";
import { Doctor, doctorsApi } from "../api/doctors.api";

export function useDoctor() {
  const [doctor, setDoctor] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await doctorsApi.getAll();
      setDoctor(data);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Create doctor
  const createDoctor = useCallback(
    async (data: Omit<Doctor, "id" | "created_at"> & { user_id: string }) => {
      try {
        setLoading(true);
        const newDoctor = await doctorsApi.createDoctor(data);
        setDoctor((prev) => [...prev, newDoctor]);
        return newDoctor;
      } catch (error) {
        setError(error as Error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update doctor
  const updateDoctor = useCallback(
    async (id: number, data: Partial<Doctor>) => {
      try {
        setLoading(true);
        const updatedDoctor = await doctorsApi.updateDoctor(id, data);
        setDoctor((prev) =>
          prev.map((doctor) => (doctor.id === id ? updatedDoctor : doctor))
        );
        return updatedDoctor;
      } catch (error) {
        setError(error as Error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [doctor]
  );

  // Delete doctor
  const deleteDoctor = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        await doctorsApi.deleteDoctor(id);
        setDoctor((prev) => prev.filter((doctor) => doctor.id !== id));
      } catch (error) {
        setError(error as Error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [doctor]
  );

  // Search doctors
  const searchDoctors = useCallback(
    (searchTerm: string) => {
      return doctor.filter(
        (doctor) =>
          (doctor.fullName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (doctor.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
    [doctor]
  );

  return {
    doctor,
    loading,
    error,
    fetchDoctors,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    searchDoctors,
  };
}
