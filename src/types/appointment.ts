// types/appointment.ts
// ✅ Shared appointment types to avoid conflicts

import { ApiTask } from '../services/staffAppointmentService';

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

// ✅ Enhanced Doctor interface
export interface AppointmentDoctor {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

// ✅ Unified Appointment interface
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
  // ✅ Enhanced doctor field with full info
  doctor?: AppointmentDoctor;
  testResult?: TestResult;
  orderId?: string;
  orderDetailId?: string;
  tasks?: ApiTask[];
  // Status persistence fields
  currentStep?: number;
  completedSteps?: string[];
  lastStatusUpdate?: string;
  // Raw data from API
  rawData?: any;
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