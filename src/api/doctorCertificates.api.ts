export interface DoctorCertificate {
    id: number;
    doctor_id: number;
    certificate_name: string;
    certificate_number: string;
    issue_date: string;
    expiry_date: string;
    is_active: boolean;
    created_at: string;
    issued_by: string;
}

let mockDoctorCertificates: DoctorCertificate[] = [
    {
        id: 1,
        doctor_id: 1,
        certificate_name: "ABC123",
        certificate_number: "ABC123",
        issue_date: "2023-01-01",
        expiry_date: "2024-01-01",
        is_active: true,
        created_at: "2023-01-01",
        issued_by: "ABC123",
    },
    {
        id: 2,
        doctor_id: 2,
        certificate_name: "ABC1234",
        certificate_number: "ABC1234",
        issue_date: "2023-01-01",
        expiry_date: "2024-01-01",
        is_active: true,
        created_at: "2023-01-01",
        issued_by: "ABC1234",
    }
]

export const doctorCertificatesApi = {
    getAll: async (): Promise<DoctorCertificate[]> => {
      await new Promise(r => setTimeout(r, 200));
      return [...mockDoctorCertificates];
    },
    getByDoctor: async (doctor_id: number): Promise<DoctorCertificate[]> => {
      await new Promise(r => setTimeout(r, 200));
      return mockDoctorCertificates.filter(c => c.doctor_id === doctor_id);
    },
    add: async (cert: Omit<DoctorCertificate, 'id' | 'created_at'>): Promise<DoctorCertificate> => {
      const newCert: DoctorCertificate = {
        ...cert,
        id: Math.max(0, ...mockDoctorCertificates.map(c => c.id)) + 1,
        created_at: new Date().toISOString(),
      };
      mockDoctorCertificates.push(newCert);
      return newCert;
    },
    update: async (cert: DoctorCertificate): Promise<DoctorCertificate | undefined> => {
      const idx = mockDoctorCertificates.findIndex(c => c.id === cert.id);
      if (idx !== -1) {
        mockDoctorCertificates[idx] = { ...mockDoctorCertificates[idx], ...cert };
        return mockDoctorCertificates[idx];
      }
      return undefined;
    },
    delete: async (id: number): Promise<void> => {
      mockDoctorCertificates = mockDoctorCertificates.filter(c => c.id !== id);
    },
  };