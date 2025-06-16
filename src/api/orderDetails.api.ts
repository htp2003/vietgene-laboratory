// Fake API for Order Details

export interface OrderDetail {
  id: string;
  order_id: string;
  service_id: string;
  quantity: number;
  price: number;
  status: string;
  created_at: string;
}

export const mockOrderDetails: OrderDetail[] = [
  // Liên kết Service 1 với Order 100
  { id: 'od1', order_id: '100', service_id: '1', quantity: 2, price: 600, status: 'completed', created_at: '2025-06-01T10:00:00+07:00' },
  // Liên kết Service 2 với Order 101
  { id: 'od2', order_id: '101', service_id: '2', quantity: 1, price: 200, status: 'completed', created_at: '2025-06-02T10:00:00+07:00' },

  {
    id: 'od1',
    order_id: '1',
    service_id: '1',
    quantity: 1,
    price: 299.99,
    status: 'pending',
    created_at: '2025-06-01T10:00:00+07:00',
  },
  // Add more mock data as needed
];

export const orderDetailsApi = {
  getAll: async (): Promise<OrderDetail[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockOrderDetails];
  },
  getByOrderId: async (orderId: string): Promise<OrderDetail[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOrderDetails.filter(od => od.order_id === orderId);
  },
  getByServiceId: async (serviceId: string): Promise<OrderDetail[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOrderDetails.filter(od => od.service_id === serviceId);
  },
  create: async (data: Omit<OrderDetail, 'id'>): Promise<OrderDetail> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newDetail = { ...data, id: Math.random().toString(36).substr(2, 9) };
    mockOrderDetails.push(newDetail);
    return newDetail;
  },
  update: async (id: string, data: Partial<OrderDetail>): Promise<OrderDetail> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const idx = mockOrderDetails.findIndex(od => od.id === id);
    if (idx === -1) throw new Error('OrderDetail not found');
    mockOrderDetails[idx] = { ...mockOrderDetails[idx], ...data };
    return mockOrderDetails[idx];
  },
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const idx = mockOrderDetails.findIndex(od => od.id === id);
    if (idx === -1) throw new Error('OrderDetail not found');
    mockOrderDetails.splice(idx, 1);
  },
};
