import { useState, useEffect, useCallback } from 'react';
import { doctorTimeSlotApi, TimeSlot } from '../api/doctorTimeSlot.api';

export function useDoctorTimeSlots(doctorId: number) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSlots = useCallback(() => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);
    doctorTimeSlotApi.getDoctorTimeSlots(doctorId)
      .then(setSlots)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [doctorId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const addSlot = async (slot: Omit<TimeSlot, 'id'>) => {
    setLoading(true);
    try {
      await doctorTimeSlotApi.addDoctorTimeSlot(doctorId, slot);
      fetchSlots();
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateSlot = async (slot: TimeSlot) => {
    setLoading(true);
    try {
      await doctorTimeSlotApi.updateDoctorTimeSlot(doctorId, slot);
      fetchSlots();
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSlot = async (slotId: number) => {
    setLoading(true);
    try {
      await doctorTimeSlotApi.deleteDoctorTimeSlot(doctorId, slotId);
      fetchSlots();
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailable = async (slotId: number) => {
    setLoading(true);
    try {
      await doctorTimeSlotApi.toggleDoctorTimeSlotAvailable(doctorId, slotId);
      fetchSlots();
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    slots,
    loading,
    error,
    refetch: fetchSlots,
    addSlot,
    updateSlot,
    deleteSlot,
    toggleAvailable
  };
}
