// types/api.ts
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export interface ApiDoctor {
  userId: string;
  doctorId: string;
  doctorCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorRequest {
  doctorCode: string;
  isActive: boolean;
}

export interface ApiAppointment {
  id: string;
  appointment_date: string;
  appointment_type: string;
  status: boolean;
  notes: string;
  userId: string;
  serviceId: string;
  createdAt: string;
  updatedAt: string;
  doctorId?: string;
}

export interface ApiTask {
  id: string;
  task_title: string;
  task_description: string;
  task_type: string;
  status: string;
  dueDate: string;
  completedDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  dnaServiceId: string;
  orderDetailId: string;
  medicalRecordId: string;
}

export interface ApiOrder {
  userId: string;
  orderId: string;
  order_code: number;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  payment_date: string;
  transaction_id: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiOrderDetail {
  id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  note: string;
  dnaServiceId: string;
  orderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiService {
  userId: string;
  serviceId: string;
  service_name: string;
  service_description: string;
  service_category: string;
  service_type: string;
  imageUrl: string;
  test_price: number;
  duration_days: number;
  collection_method: number;
  required_legal_document: boolean;
  createdAt: string;
  is_active: boolean;
}

export interface ApiUser {
  id: string;
  username: string;
  password?: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  dob: string;
  roles: Array<{
    name: string;
    description: string;
  }>;
}

export interface MedicalRecordData {
  record_code: number;
  medical_history: string;
  allergies: string;
  medications: string;
  health_conditions: string;
  emergency_contact_phone: string;
  emergency_contact_name: string;
}

export interface NotificationData {
  title: string;
  message: string;
  type: string;
  is_read: boolean;
}