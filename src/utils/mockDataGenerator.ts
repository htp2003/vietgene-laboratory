// Mock data generator để test UI appointment
import { Appointment } from '../services/staffAppointmentService';

// Mock data templates
const mockCustomers = [
  { name: "Nguyễn Văn An", phone: "0912345678", email: "an.nguyen@gmail.com" },
  { name: "Trần Thị Bình", phone: "0987654321", email: "binh.tran@hotmail.com" },
  { name: "Lê Hoàng Cường", phone: "0901234567", email: "cuong.le@yahoo.com" },
  { name: "Phạm Thị Dung", phone: "0923456789", email: "dung.pham@outlook.com" },
  { name: "Võ Minh Đức", phone: "0934567890", email: "duc.vo@email.com" },
  { name: "Hoàng Thị Giang", phone: "0945678901", email: "giang.hoang@gmail.com" },
  { name: "Đặng Văn Hải", phone: "0956789012", email: "hai.dang@yahoo.com" },
  { name: "Bùi Thị Lan", phone: "0967890123", email: "lan.bui@hotmail.com" },
  { name: "Ngô Văn Minh", phone: "0978901234", email: "minh.ngo@gmail.com" },
  { name: "Lý Thị Nga", phone: "0989012345", email: "nga.ly@outlook.com" }
];

const mockServices = [
  { name: "Xét nghiệm ADN huyết thống cha con", type: "Dân Sự", category: "Paternity" },
  { name: "Xét nghiệm ADN định danh pháp y", type: "Pháp Lý", category: "Forensic" },
  { name: "Xét nghiệm ADN anh em ruột", type: "Dân Sự", category: "Sibling" },
  { name: "Xét nghiệm ADN ông bà - cháu", type: "Dân Sự", category: "Grandparent" },
  { name: "Xét nghiệm ADN mẹ con", type: "Dân Sự", category: "Maternity" },
  { name: "Xét nghiệm ADN dòng họ", type: "Dân Sự", category: "Lineage" },
  { name: "Xét nghiệm ADN pháp y hình sự", type: "Pháp Lý", category: "Criminal" },
  { name: "Xét nghiệm ADN xác định giới tính", type: "Dân Sự", category: "Gender" }
];

const mockStatuses: Array<Appointment['status']> = [
  'Pending', 'Confirmed', 'DeliveringKit', 'KitDelivered', 
  'SampleReceived', 'Testing', 'Completed', 'Cancelled'
];

const mockLocations: Array<'Tại nhà' | 'Cơ sở y tế'> = ['Tại nhà', 'Cơ sở y tế'];

const mockAddresses = [
  "123 Nguyễn Huệ, Quận 1, TP.HCM",
  "456 Lê Lợi, Quận 3, TP.HCM", 
  "789 Trần Hưng Đạo, Quận 5, TP.HCM",
  "321 Hai Bà Trưng, Quận 1, TP.HCM",
  "654 Pasteur, Quận 3, TP.HCM",
  "987 Cách Mạng Tháng 8, Quận 10, TP.HCM",
  "147 Võ Văn Tần, Quận 3, TP.HCM",
  "258 Nam Kỳ Khởi Nghĩa, Quận 1, TP.HCM"
];

const mockNotes = [
  "Khách hàng yêu cầu lấy mẫu vào buổi sáng",
  "Cần mang theo giấy tờ tùy thân",
  "Đã xác nhận lịch hẹn qua điện thoại",
  "Khách hàng có thai, cần lưu ý đặc biệt",
  "Lấy mẫu cho 2 người: cha và con",
  "Yêu cầu kết quả nhanh trong 48h",
  "Khách hàng đã thanh toán trước",
  "Cần giấy chứng nhận từ tòa án",
  "Trường hợp khẩn cấp",
  ""
];

// Utility functions
const randomFromArray = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatTime = (date: Date): string => {
  return date.toTimeString().slice(0, 5);
};

const generateId = (): string => {
  return 'mock_' + Math.random().toString(36).substr(2, 9);
};

// Mock tasks generator
const generateMockTasks = (status: Appointment['status']) => {
  const baseTasks = [
    { task_type: 'APPOINTMENT_CONFIRMATION', task_title: 'Xác nhận lịch hẹn' },
    { task_type: 'SAMPLE_COLLECTION', task_title: 'Thu thập mẫu' },
    { task_type: 'TESTING', task_title: 'Xét nghiệm ADN' },
    { task_type: 'RESULT_REVIEW', task_title: 'Xem xét kết quả' },
    { task_type: 'RESULT_DELIVERY', task_title: 'Giao kết quả' }
  ];

  return baseTasks.map((task, index) => ({
    id: generateId(),
    task_title: task.task_title,
    task_description: `${task.task_title} cho lịch hẹn`,
    task_type: task.task_type,
    status: getTaskStatus(status, index),
    dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
    completedDate: index === 0 ? new Date().toISOString() : '',
    notes: `Task ${index + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dnaServiceId: generateId(),
    orderDetailId: generateId(),
    medicalRecordId: generateId()
  }));
};

const getTaskStatus = (appointmentStatus: Appointment['status'], taskIndex: number): string => {
  switch (appointmentStatus) {
    case 'Pending':
      return taskIndex === 0 ? 'PENDING' : 'NOT_STARTED';
    case 'Confirmed':
      return taskIndex === 0 ? 'COMPLETED' : taskIndex === 1 ? 'PENDING' : 'NOT_STARTED';
    case 'SampleReceived':
      return taskIndex <= 1 ? 'COMPLETED' : taskIndex === 2 ? 'PENDING' : 'NOT_STARTED';
    case 'Testing':
      return taskIndex <= 2 ? 'COMPLETED' : taskIndex === 3 ? 'IN_PROGRESS' : 'NOT_STARTED';
    case 'Completed':
      return 'COMPLETED';
    case 'Cancelled':
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
};

// Mock raw data generator
const generateMockRawData = (customer: any, service: any) => ({
  appointment: {
    id: generateId(),
    appointment_date: new Date().toISOString(),
    appointment_type: service.category,
    status: true,
    notes: randomFromArray(mockNotes),
    userId: generateId(),
    serviceId: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  user: {
    id: generateId(),
    username: customer.name.toLowerCase().replace(/\s+/g, '.'),
    email: customer.email,
    full_name: customer.name,
    phone: customer.phone,
    address: randomFromArray(mockAddresses),
    dob: randomDate(new Date(1960, 0, 1), new Date(2000, 11, 31)).toISOString().split('T')[0],
    roles: [{ name: 'ROLE_CUSTOMER', description: 'Customer role' }]
  },
  service: {
    userId: generateId(),
    serviceId: generateId(),
    service_name: service.name,
    service_description: `Dịch vụ ${service.name} chính xác và nhanh chóng`,
    service_category: service.category,
    service_type: service.type,
    imageUrl: '',
    test_price: Math.floor(Math.random() * 2000000) + 500000, // 500k - 2.5M VND
    duration_days: Math.floor(Math.random() * 10) + 3, // 3-12 days
    collection_method: randomFromArray(mockLocations) === 'Tại nhà' ? 1 : 2,
    required_legal_document: service.type === 'Pháp Lý',
    createdAt: new Date().toISOString(),
    is_active: true
  },
  order: {
    userId: generateId(),
    orderId: generateId(),
    order_code: Math.floor(Math.random() * 100000),
    status: 'CONFIRMED',
    total_amount: Math.floor(Math.random() * 2000000) + 500000,
    payment_method: randomFromArray(['CASH', 'CREDIT_CARD', 'BANK_TRANSFER']),
    payment_status: randomFromArray(['PENDING', 'PAID', 'PARTIAL']),
    payment_date: new Date().toISOString(),
    transaction_id: 'TXN_' + generateId(),
    notes: 'Order notes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
});

// Main generator function
export const generateMockAppointments = (count: number = 10): Appointment[] => {
  const appointments: Appointment[] = [];
  
  for (let i = 0; i < count; i++) {
    const customer = randomFromArray(mockCustomers);
    const service = randomFromArray(mockServices);
    const status = randomFromArray(mockStatuses);
    const locationType = randomFromArray(mockLocations);
    const appointmentDate = randomDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  // 30 days ahead
    );

    const appointment: Appointment = {
      id: generateId(),
      customerName: customer.name,
      phone: customer.phone,
      email: customer.email,
      date: formatDate(appointmentDate),
      time: formatTime(appointmentDate),
      serviceType: service.category,
      serviceName: service.name,
      status: status,
      locationType: locationType,
      legalType: service.type as 'Pháp Lý' | 'Dân Sự',
      address: locationType === 'Tại nhà' ? randomFromArray(mockAddresses) : undefined,
      notes: randomFromArray(mockNotes),
      orderId: generateId(),
      orderDetailId: generateId(),
      tasks: generateMockTasks(status),
      rawData: generateMockRawData(customer, service)
    };

    appointments.push(appointment);
  }

  return appointments;
};

// Specific generators for different scenarios
export const generatePendingAppointments = (count: number = 5): Appointment[] => {
  return generateMockAppointments(count).map(apt => ({
    ...apt,
    status: 'Pending' as const
  }));
};

export const generateConfirmedAppointments = (count: number = 5): Appointment[] => {
  return generateMockAppointments(count).map(apt => ({
    ...apt,
    status: 'Confirmed' as const
  }));
};

export const generateCompletedAppointments = (count: number = 5): Appointment[] => {
  return generateMockAppointments(count).map(apt => ({
    ...apt,
    status: 'Completed' as const
  }));
};

export const generateTestingAppointments = (count: number = 3): Appointment[] => {
  return generateMockAppointments(count).map(apt => ({
    ...apt,
    status: 'Testing' as const
  }));
};

// Comprehensive test data
export const generateComprehensiveTestData = (): Appointment[] => {
  return [
    ...generatePendingAppointments(3),
    ...generateConfirmedAppointments(4),
    ...generateTestingAppointments(2),
    ...generateCompletedAppointments(3),
    ...generateMockAppointments(3).map(apt => ({ ...apt, status: 'Cancelled' as const }))
  ];
};

// Test data with edge cases
export const generateEdgeCaseTestData = (): Appointment[] => {
  const baseData = generateMockAppointments(5);
  
  return [
    // Missing data cases
    { ...baseData[0], phone: 'N/A', email: 'N/A' },
    { ...baseData[1], address: undefined, notes: '' },
    { ...baseData[2], tasks: [] }, // No tasks
    { ...baseData[3], rawData: undefined }, // No raw data
    { ...baseData[4], serviceName: 'N/A', serviceType: 'Unknown' }
  ];
};

// Usage examples
export const testDataExamples = {
  // Minimal test
  few: () => generateMockAppointments(5),
  
  // Normal test
  normal: () => generateMockAppointments(15),
  
  // Large dataset test
  large: () => generateMockAppointments(50),
  
  // Comprehensive test with all statuses
  comprehensive: () => generateComprehensiveTestData(),
  
  // Edge cases test
  edgeCases: () => generateEdgeCaseTestData(),
  
  // Mixed realistic data
  realistic: () => [
    ...generatePendingAppointments(8),
    ...generateConfirmedAppointments(12),
    ...generateTestingAppointments(4),
    ...generateCompletedAppointments(10),
    ...generateMockAppointments(6).map(apt => ({ ...apt, status: 'Cancelled' as const }))
  ]
};

export default generateMockAppointments;