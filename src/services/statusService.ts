// services/statusService.ts

// ✅ Simple development check
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export interface AppointmentStatusData {
  id: string;
  currentStep: number;
  status: string;
  lastUpdated: string;
  completedSteps: string[];
}

export class StatusService {
  private static STORAGE_KEY_PREFIX = 'appointment_status_';
  
  // ✅ Save appointment status to localStorage
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
      
      if (isDevelopment) {
        console.log(`💾 Saved appointment status: ${appointmentId} -> ${status} (step ${step})`);
      }
    } catch (error) {
      console.warn('Failed to save appointment status to localStorage:', error);
    }
  }
  
  // ✅ Load appointment status from localStorage
  static loadAppointmentStatus(appointmentId: string): AppointmentStatusData | null {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}${appointmentId}`);
      if (stored) {
        const statusData = JSON.parse(stored) as AppointmentStatusData;
        if (isDevelopment) {
          console.log(`📖 Loaded appointment status: ${appointmentId} -> ${statusData.status} (step ${statusData.currentStep})`);
        }
        return statusData;
      }
    } catch (error) {
      console.warn('Failed to load appointment status from localStorage:', error);
    }
    return null;
  }
  
  // ✅ Clear appointment status
  static clearAppointmentStatus(appointmentId: string): void {
    try {
      localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${appointmentId}`);
      if (isDevelopment) {
        console.log(`🗑️ Cleared stored status for appointment: ${appointmentId}`);
      }
    } catch (error) {
      console.warn('Failed to clear appointment status:', error);
    }
  }
  
  // ✅ Get completed steps array
  static getCompletedSteps(currentStep: number): string[] {
    const steps = [
      'booking', 'confirmed', 'kit_delivered', 'sample_received', 'testing', 'completed'
    ];
    return steps.slice(0, currentStep);
  }
  
  // ✅ Map status to step number
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

  // ✅ Map appointment status from API
  static mapAppointmentStatus(apiStatus: boolean, tasks: any[]): string {
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

  // ✅ Map location type
  static mapLocationType(collectionMethod: number): 'Tại nhà' | 'Cơ sở y tế' {
    return collectionMethod === 1 ? 'Tại nhà' : 'Cơ sở y tế';
  }

  // ✅ Map legal type
  static mapLegalType(requiredLegalDocument: boolean): 'Pháp Lý' | 'Dân Sự' {
    return requiredLegalDocument ? 'Pháp Lý' : 'Dân Sự';
  }

  // ✅ Cleanup old status data (call periodically)
  static cleanupOldStatusData(maxAge = 7 * 24 * 60 * 60 * 1000): void {
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.STORAGE_KEY_PREFIX)) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            const lastUpdated = new Date(data.lastUpdated).getTime();
            
            if (now - lastUpdated > maxAge) {
              keysToRemove.push(key);
            }
          } catch (error) {
            // Invalid data, mark for removal
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      if (keysToRemove.length > 0) {
        console.log(`🧹 Cleaned up ${keysToRemove.length} old status entries`);
      }
    } catch (error) {
      console.warn('Failed to cleanup old status data:', error);
    }
  }
}

export default StatusService;