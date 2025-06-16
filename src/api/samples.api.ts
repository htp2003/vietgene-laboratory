// Mock data for Samples
export interface Sample {
  id: string;
  kit_id: string;
  customer_id: string;
  sample_code: string;
  sample_type: string;
  collection_method: string;
  collection_date: string;
  received_date: string;
  collected_by_staff_id: string;
  status: string;
  shipping_tracking: string;
  sample_quality: string;
  notes: string;
  created_at: string;
}

export const mockSamples: Sample[] = [
  {
    id: 'samp1',
    kit_id: 'kit1',
    sample_code: 'SAMP100',
    customer_id: 'u1',
    sample_type: 'blood',
    collection_method: 'clinic',
    collection_date: '2025-06-01T15:00:00+07:00',
    received_date: '2025-06-01T15:30:00+07:00',
    collected_by_staff_id: '',
    status: 'collected',
    shipping_tracking: '',
    sample_quality: '',
    notes: '',
    created_at: '2025-06-01T15:00:00+07:00',
  },
  {
    id: 'samp2',
    kit_id: 'kit2',
    sample_code: 'SAMP200',
    customer_id: 'u2',
    sample_type: 'saliva',
    collection_method: 'home',
    collection_date: '2025-06-02T15:00:00+07:00',
    received_date: '2025-06-02T15:30:00+07:00',
    collected_by_staff_id: '',
    status: 'tested',
    shipping_tracking: '',
    sample_quality: '',
    notes: '',
    created_at: '2025-06-02T15:00:00+07:00',
  }
];

export const samplesApi = {
  getAll: async (): Promise<Sample[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockSamples];
  },
  getByKitId: async (kitId: string): Promise<Sample[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSamples.filter(sample => sample.kit_id === kitId);
  },
  create: async (data: Omit<Sample, 'id'>): Promise<Sample> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newSample = {
      ...data,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockSamples.push(newSample);
    return newSample;
  },
  update: async (id: string, data: Partial<Sample>): Promise<Sample> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockSamples.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Sample not found');
    const updatedSample = {
      ...mockSamples[index],
      ...data
    };
    mockSamples[index] = updatedSample;
    return updatedSample;
  },
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockSamples.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Sample not found');
    mockSamples.splice(index, 1);
  }
};
