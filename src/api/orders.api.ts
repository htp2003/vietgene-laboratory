// Mock data for Orders
export interface Order {
  id: string;
  order_code: string;
  customer_id: string;
  status: string;
  total_amount: number;
  payment_status: string;
  payment_method: string;
  payment_date: string;
  transaction_id: string;
  notes: string;
  created_at: string;
  update_at: string;
}

export const mockOrders: Order[] = [
  {
    id: '100',
    order_code: 'ORD100',
    customer_id: 'u1',
    status: 'completed',
    total_amount: 600,
    payment_status: 'paid',
    payment_method: 'credit_card',
    payment_date: '2025-06-01T13:00:00+07:00',
    transaction_id: 'txn100',
    notes: 'Test order for Service 1',
    created_at: '2025-06-01T10:00:00+07:00',
    update_at: '2025-06-01T10:00:00+07:00'
  },
  {
    id: '101',
    order_code: 'ORD101',
    customer_id: 'u2',
    status: 'processing',
    total_amount: 200,
    payment_status: 'pending',
    payment_method: 'cash',
    payment_date: '',
    transaction_id: '',
    notes: 'Test order for Service 2',
    created_at: '2025-06-02T10:00:00+07:00',
    update_at: '2025-06-02T10:00:00+07:00'
  },
  {
    id: '1',
    order_code: 'ORD001',
    customer_id: '1',
    status: 'pending',
    total_amount: 299.99,
    payment_status: 'unpaid',
    payment_method: '',
    payment_date: '',
    transaction_id: '',
    notes: '',
    created_at: '2025-06-01T10:00:00+07:00',
    update_at: '2025-06-01T10:00:00+07:00',
  }
];

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockOrders];
  },
  getByServiceId: async (serviceId: string): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // In real DB, join order_detail to filter by service_id
    return mockOrders.filter(order => order.customer_id === serviceId);
  },
  create: async (data: Omit<Order, 'id'>): Promise<Order> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newOrder = {
      ...data,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockOrders.push(newOrder);
    return newOrder;
  },
  update: async (id: string, data: Partial<Order>): Promise<Order> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockOrders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');
    const updatedOrder = {
      ...mockOrders[index],
      ...data
    };
    mockOrders[index] = updatedOrder;
    return updatedOrder;
  },
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockOrders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');
    mockOrders.splice(index, 1);
  }
};
