

export interface TestResult {
  id: string;
  appointmentId: string;
  resultType: 'Positive' | 'Negative' | 'Inconclusive';
  resultPercentage?: number;
  conclusion: string;
  resultDetails: string;
  resultFile?: File;
  testedDate: string;
  verifiedByStaffId: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// ✅ User interfaces (updated from API schema)
export interface ApiUser {
  id: string;
  username: string;
  password?: string;
  email: string;
  full_name: string;
  dob: string; // date format
  roles: ApiRole[];
}

export interface ApiRole {
  name: string;
  description: string;
}

export interface UserUpdateRequest {
  username?: string;
  password?: string;
  email?: string;
  full_name?: string;
  dob?: string;
  roles?: string[];
}

export interface UserCreationRequest {
  username: string;
  password: string;
  email: string;
  full_name: string;
  dob: string;
}

// ✅ Service interfaces (updated from API schema)
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

export interface ServiceRequest {
  userId?: string;
  serviceId?: string;
  service_name: string;
  service_description: string;
  service_category: string;
  service_type: string;
  imageUrl?: string;
  test_price: number;
  duration_days: number;
  collection_method: number;
  required_legal_document: boolean;
  is_active?: boolean;
}

// ✅ Order interfaces (updated from API schema)
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

export interface OrderRequest {
  order_code?: number;
  status?: string;
  total_amount?: number;
  payment_method?: string;
  payment_status?: string;
  payment_date?: string;
  transaction_id?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ✅ Order Detail interfaces
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

export interface OrderDetailRequest {
  quantity: number;
  unit_price: number;
  subtotal: number;
  note?: string;
}

// ✅ Appointment interfaces (updated from API schema)
export interface ApiAppointment {
  id: string;
  appointment_date: string; // date-time format
  appointment_type: string;
  status: boolean;
  notes: string;
  userId: string;
  doctor_time_slot: string;
  createdAt: string;
  updatedAt: string;
  orderId: string;
}

export interface AppointmentRequest {
  appointment_date: string;
  appointment_type: string;
  status?: boolean;
  notes?: string;
  doctor_time_slot: string;
}

// ✅ Doctor interfaces (updated from API schema)
export interface ApiDoctor {
  userId: string;
  doctorId: string;
  doctorCode: string;
  doctorName: string;
  doctorEmail: string;
  doctorPhone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorRequest {
  doctorCode: string;
  doctorName: string;
  doctorEmail: string;
  doctorPhone: string;
  isActive?: boolean;
}

// ✅ Doctor Time Slot interfaces
export interface ApiDoctorTimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: string;
  doctorId: string;
}

export interface DoctorTimeSlotRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
  doctorId: string;
}

// ✅ Medical Record interfaces (updated from API schema)
export interface ApiMedicalRecord {
  id: string;
  record_code: number;
  medical_history: string;
  allergies: string;
  medications: string;
  health_conditions: string;
  emergency_contact_phone: string;
  emergency_contact_name: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface MedicalRecordRequest {
  record_code: number;
  medical_history: string;
  allergies: string;
  medications: string;
  health_conditions: string;
  emergency_contact_phone: string;
  emergency_contact_name: string;
}

// ✅ Task interfaces (updated from API schema)
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

export interface TaskRequest {
  task_title: string;
  task_description: string;
  task_type: string;
  status?: string;
  dueDate?: string;
  completedDate?: string;
  notes?: string;
  dnaServiceId?: string;
  orderDetailId?: string;
  medicalRecordId?: string;
}

// ✅ Notification interfaces (updated from API schema)
export interface ApiNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  userId: string;
}

export interface NotificationRequest {
  title: string;
  message: string;
  type: string;
  is_read?: boolean;
}

// ✅ Sample interfaces (updated from API schema)
export interface ApiSample {
  id: string;
  sample_code: string;
  sample_type: string;
  collection_method: string;
  collection_date: string;
  received_date: string;
  status: string;
  shipping_tracking: string;
  notes: string;
  sample_quality: string;
  userId: string;
  orderId: string;
  sampleKitsId: string[];
}

export interface SampleRequest {
  sample_code: string;
  sample_type: string;
  collection_method: string;
  collection_date?: string;
  received_date?: string;
  status?: string;
  shipping_tracking?: string;
  notes?: string;
  sample_quality?: string;
  userId: string;
  orderId: string;
  sampleKitsId?: string;
}

// ✅ Sample Kit interfaces
export interface ApiSampleKit {
  id: string;
  kit_code: string;
  kit_type: string;
  status: string;
  shipper_data: string;
  delivered_date: string;
  tracking_number: number;
  shipping_address: string;
  expiry_date: string;
  instruction: string;
  createdAt: string;
  updatedAt: string;
  samplesId: string;
  userId: string;
}

export interface SampleKitRequest {
  kit_code: string;
  kit_type: string;
  status?: string;
  shipper_data?: string;
  delivered_date?: string;
  tracking_number?: number;
  shipping_address?: string;
  expiry_date?: string;
  instruction?: string;
  samplesId?: string;
}

// ✅ Review interfaces
export interface ApiReview {
  rating: number;
  comment: string;
  userId: string;
  ordersId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRequest {
  rating: number;
  comment: string;
}

// ✅ Order Participants interfaces
export interface ApiOrderParticipant {
  id: string;
  participant_name: string;
  relationship: string;
  age: number;
  note: string;
  order_id: string;
}

export interface OrderParticipantRequest {
  participant_name: string;
  relationship: string;
  age: number;
  note?: string;
}

// ✅ Frontend Appointment interface (simplified for UI)
export interface Appointment {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  serviceType: string;
  serviceName: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'DeliveringKit' | 'KitDelivered' | 'SampleReceived' | 'Testing';
  locationType: 'Tại nhà' | 'Cơ sở y tế';
  legalType: 'Pháp Lý' | 'Dân Sự';
  address?: string;
  notes?: string;
  tasks?: ApiTask[];
  // Simplified doctor info
  doctorInfo?: {
    name: string;
    timeSlot: string; // e.g., "14:00-15:00"
    dayOfWeek: string; // e.g., "Thứ Hai"
  };
  currentStep?: number;
  completedSteps?: string[];
  lastStatusUpdate?: string;
  // Raw API data for reference
  rawData?: {
    appointment: ApiAppointment;
    order?: ApiOrder;
    orderDetail?: ApiOrderDetail;
    service?: ApiService;
    user?: ApiUser;
    doctor?: ApiDoctor;
    timeSlot?: ApiDoctorTimeSlot;
  };
}

export interface AppointmentStatusData {
  id: string;
  currentStep: number;
  status: string;
  lastUpdated: string;
  completedSteps: string[];
}

// ✅ Props interfaces for components
export interface AppointmentCardProps {
  appointment: Appointment;
  onViewDetails: (appointment: Appointment) => void;
  onConfirm: (appointment: Appointment) => void;
  onCancel: (appointmentId: string) => void;
  onUpdateStatus: (appointmentId: string, status: Appointment['status']) => void;
}

export interface AppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (appointment: Appointment) => void;
  onCancel: (appointmentId: string) => void;
  onUpdateStatus: (appointmentId: string, status: Appointment['status']) => void;
}

export interface TestResultModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveResult: (result: TestResult) => void;
}

