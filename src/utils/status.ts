import { AppointmentStatusData, Appointment } from '../types/appointment';

export class StatusUtils {
  static readonly STORAGE_KEY_PREFIX = 'appointment_status_';
  
  static saveAppointmentStatus(appointmentId: string, status: string, step: number): void {
    try {
      const statusData: AppointmentStatusData = {
        id: appointmentId,
        currentStep: step,
        status: status,
        lastUpdated: new Date().toISOString(),
        completedSteps: this.getCompletedSteps(step)
      };
      
      localStorage.setItem(
        `${this.STORAGE_KEY_PREFIX}${appointmentId}`, 
        JSON.stringify(statusData)
      );
      
      console.log(`💾 Saved appointment status: ${appointmentId} -> ${status} (step ${step})`);
    } catch (error) {
      console.warn('Failed to save appointment status to localStorage:', error);
    }
  }
  
  static loadAppointmentStatus(appointmentId: string): AppointmentStatusData | null {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}${appointmentId}`);
      if (stored) {
        const statusData = JSON.parse(stored) as AppointmentStatusData;
        console.log(`📖 Loaded appointment status: ${appointmentId} -> ${statusData.status} (step ${statusData.currentStep})`);
        return statusData;
      }
    } catch (error) {
      console.warn('Failed to load appointment status from localStorage:', error);
    }
    return null;
  }
  
  static clearAppointmentStatus(appointmentId: string): void {
    try {
      localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${appointmentId}`);
      console.log(`🗑️ Cleared stored status for appointment: ${appointmentId}`);
    } catch (error) {
      console.warn('Failed to clear appointment status:', error);
    }
  }
  
  static getCompletedSteps(currentStep: number): string[] {
    const steps = [
      'booking', 'confirmed', 'kit_delivered', 'sample_received', 'testing', 'completed'
    ];
    return steps.slice(0, currentStep);
  }
  
  static getStepFromStatus(status: string): number {
    const statusStepMap: Record<string, number> = {
      'Pending': 1,
      'Confirmed': 2,
      'DeliveringKit': 2,
      'KitDelivered': 3,
      'SampleReceived': 4,
      'Testing': 5,
      'Completed': 6,
      'Cancelled': 0
    };
    return statusStepMap[status] || 1;
  }

  static mapAppointmentStatus(apiStatus: boolean, tasks: any[]): Appointment['status'] {
    if (!apiStatus) return 'Cancelled';
    
    if (!tasks || tasks.length === 0) {
      return apiStatus ? 'Confirmed' : 'Pending';
    }
    
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
    const totalTasks = tasks.length;

    if (completedTasks === 0) return 'Confirmed';
    if (completedTasks === totalTasks) return 'Completed';
    
    const sampleTask = tasks.find(task => task.task_type === 'SAMPLE_COLLECTION');
    const testingTask = tasks.find(task => task.task_type === 'TESTING');

    if (sampleTask?.status === 'COMPLETED' && testingTask?.status !== 'COMPLETED') {
      return 'SampleReceived';
    }

    if (testingTask?.status === 'IN_PROGRESS') {
      return 'Testing';
    }

    return 'Confirmed';
  }

  static mapLocationType(collectionMethod: number): 'Tại nhà' | 'Cơ sở y tế' {
    return collectionMethod === 1 ? 'Tại nhà' : 'Cơ sở y tế';
  }

  static mapLegalType(requiredLegalDocument: boolean): 'Pháp Lý' | 'Dân Sự' {
    return requiredLegalDocument ? 'Pháp Lý' : 'Dân Sự';
  }
}