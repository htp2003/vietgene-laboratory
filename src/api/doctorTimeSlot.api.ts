export type TimeSlot = {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
};

// Fake database lưu khung giờ theo doctorId
let fakeDB: Record<number, TimeSlot[]> = {
  1: [
    {
      id: 101,
      day_of_week: "Thứ 2",
      start_time: "08:00",
      end_time: "11:00",
      is_available: true,
    },
    {
      id: 102,
      day_of_week: "Thứ 4",
      start_time: "13:00",
      end_time: "16:00",
      is_available: false,
    },
  ],
  2: [
    {
      id: 201,
      day_of_week: "Thứ 3",
      start_time: "09:00",
      end_time: "12:00",
      is_available: true,
    },
    {
      id: 202,
      day_of_week: "Thứ 6",
      start_time: "14:00",
      end_time: "17:00",
      is_available: true,
    },
  ],
};

export const doctorTimeSlotApi = {
  getDoctorTimeSlots: async (doctorId: number): Promise<TimeSlot[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(fakeDB[doctorId] || []), 250)
    );
  },

  addDoctorTimeSlot: async (
    doctorId: number,
    slot: Omit<TimeSlot, "id">
  ): Promise<TimeSlot> => {
    const newSlot: TimeSlot = { ...slot, id: Date.now() };
    fakeDB[doctorId] = [...(fakeDB[doctorId] || []), newSlot];
    return new Promise((resolve) => setTimeout(() => resolve(newSlot), 250));
  },

  updateDoctorTimeSlot: async (
    doctorId: number,
    slot: TimeSlot
  ): Promise<TimeSlot> => {
    fakeDB[doctorId] = (fakeDB[doctorId] || []).map((s) =>
      s.id === slot.id ? slot : s
    );
    return new Promise((resolve) => setTimeout(() => resolve(slot), 250));
  },

  deleteDoctorTimeSlot: async (
    doctorId: number,
    slotId: number
  ): Promise<void> => {
    fakeDB[doctorId] = (fakeDB[doctorId] || []).filter((s) => s.id !== slotId);
    return new Promise((resolve) => setTimeout(() => resolve(), 200));
  },

  toggleDoctorTimeSlotAvailable: async (
    doctorId: number,
    slotId: number
  ): Promise<TimeSlot | undefined> => {
    let updatedSlot: TimeSlot | undefined;
    fakeDB[doctorId] = (fakeDB[doctorId] || []).map((s) => {
      if (s.id === slotId) {
        updatedSlot = { ...s, is_available: !s.is_available };
        return updatedSlot;
      }
      return s;
    });
    return new Promise((resolve) =>
      setTimeout(() => resolve(updatedSlot), 200)
    );
  },
};
