// Mock data for Sample Kits
export interface SampleKit {
  id: string;
  kit_code: string;
  order_detail_id: string;
  kit_type: string;
  status: string;
  shipped_data: string;
  delivered_date: string;
  tracking_number: string;
  shipping_address: string;
  expiry_date: string;
  instruction: string;
  created_at: string;
}

export const mockSampleKits: SampleKit[] = [
  {
    id: 'kit1',
    kit_code: 'KIT001',
    order_detail_id: '1',
    kit_type: 'Buccal Swab',
    status: 'shipped',
    shipped_data: '2025-06-02T09:00:00+07:00',
    delivered_date: '',
    tracking_number: 'TRACK001',
    shipping_address: '123 Main St',
    expiry_date: '2026-06-01',
    instruction: '',
    created_at: '2025-06-01T10:00:00+07:00',
  },
  {
    id: 'kit2',
    kit_code: 'KIT100',
    order_detail_id: 'od1',
    kit_type: 'blood',
    status: 'delivered',
    shipped_data: '2025-06-01T13:30:00+07:00',
    delivered_date: '2025-06-01T14:00:00+07:00',
    tracking_number: '',
    shipping_address: '',
    expiry_date: '',
    instruction: '',
    created_at: '2025-06-01T14:00:00+07:00',
  },
  {
    id: 'kit3',
    kit_code: 'KIT200',
    order_detail_id: 'od2',
    kit_type: 'saliva',
    status: 'in_transit',
    shipped_data: '2025-06-02T13:30:00+07:00',
    delivered_date: '2025-06-02T14:00:00+07:00',
    tracking_number: '',
    shipping_address: '',
    expiry_date: '',
    instruction: '',
    created_at: '2025-06-02T14:00:00+07:00',
  },
];

export const sampleKitsApi = {
  getAll: async (): Promise<SampleKit[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockSampleKits];
  },
  getByOrderDetailId: async (orderDetailId: string): Promise<SampleKit[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSampleKits.filter(kit => kit.order_detail_id === orderDetailId);
  },
  create: async (data: Omit<SampleKit, 'id'>): Promise<SampleKit> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newKit = {
      ...data,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockSampleKits.push(newKit);
    return newKit;
  },
  update: async (id: string, data: Partial<SampleKit>): Promise<SampleKit> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockSampleKits.findIndex(k => k.id === id);
    if (index === -1) throw new Error('SampleKit not found');
    const updatedKit = {
      ...mockSampleKits[index],
      ...data
    };
    mockSampleKits[index] = updatedKit;
    return updatedKit;
  },
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockSampleKits.findIndex(k => k.id === id);
    if (index === -1) throw new Error('SampleKit not found');
    mockSampleKits.splice(index, 1);
  }
};
