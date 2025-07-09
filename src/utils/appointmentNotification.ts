import { NotificationService } from '../services/staffService/notificationService';
import { Appointment } from '../types/appointment';


export class AppointmentNotificationIntegration {
  
  static async notifyNewAppointment(appointment: Appointment): Promise<void> {
    try {
      console.log('🔔 Sending new appointment notification to staff...');
      
      await NotificationService.notifyStaffAboutNewAppointment(
        appointment.customerName,
        appointment.id
      );
      
      console.log('✅ Staff notified about new appointment successfully');
    } catch (error) {
      console.error('❌ Failed to notify staff about new appointment:', error);
    }
  }
  static async notifyStatusChange(
    appointment: Appointment,
    newStatus: string,
    oldStatus?: string
  ): Promise<void> {
    try {
      console.log('🔔 Sending status change notification to staff...');
      
      await NotificationService.notifyStaffAboutStatusChange(
        appointment.customerName,
        appointment.id,
        newStatus
      );
      
      console.log('✅ Staff notified about status change successfully');
    } catch (error) {
      console.error('❌ Failed to notify staff about status change:', error);
    }
  }
  static async notifyUrgentAppointment(appointment: Appointment): Promise<void> {
    try {
      console.log('🚨 Sending urgent appointment notification to staff...');
      
      // Get all staff users
      const staffUsers = await NotificationService.getAllStaffUsers();
      
      if (staffUsers.length === 0) {
        console.warn('⚠️ No staff users found for urgent notification');
        return;
      }
      
      // Create urgent notification for each staff member
      const urgentNotificationData = {
        title: '🚨 Lịch hẹn khẩn cấp',
        message: `Khách hàng ${appointment.customerName} đã đặt lịch xét nghiệm ${appointment.legalType} - CẦN XỬ LÝ NGAY`,
        type: 'UrgentBooking',
        is_read: false
      };
      
      const promises = staffUsers.map(staff => 
        NotificationService.createNotification(staff.id, urgentNotificationData)
      );
      
      await Promise.all(promises);
      
      console.log('✅ Staff notified about urgent appointment successfully');
    } catch (error) {
      console.error('❌ Failed to notify staff about urgent appointment:', error);
    }
  }
  static async notifyUpcomingAppointment(appointment: Appointment): Promise<void> {
    try {
      console.log('⏰ Sending upcoming appointment reminder to staff...');
      
      const appointmentDate = new Date(appointment.date);
      const timeSlot = appointment.time;
      
      await NotificationService.notifyStaffAboutStatusChange(
        appointment.customerName,
        appointment.id,
        'Upcoming'
      );
      
      console.log('✅ Staff reminded about upcoming appointment successfully');
    } catch (error) {
      console.error('❌ Failed to send upcoming appointment reminder:', error);
    }
  }
  static async notifyAttentionRequired(
    appointment: Appointment,
    reason: string
  ): Promise<void> {
    try {
      console.log('⚠️ Sending attention required notification to staff...');
      
      // Get all staff users
      const staffUsers = await NotificationService.getAllStaffUsers();
      
      if (staffUsers.length === 0) {
        console.warn('⚠️ No staff users found for attention notification');
        return;
      }
      const attentionNotificationData = {
        title: '⚠️ Cần chú ý',
        message: `Lịch hẹn của khách hàng ${appointment.customerName} cần chú ý: ${reason}`,
        type: 'AttentionRequired',
        is_read: false
      };
      
      const promises = staffUsers.map(staff => 
        NotificationService.createNotification(staff.id, attentionNotificationData)
      );
      
      await Promise.all(promises);
      
      console.log('✅ Staff notified about attention required successfully');
    } catch (error) {
      console.error('❌ Failed to notify staff about attention required:', error);
    }
  }
  static async notifyBatchAppointments(appointments: Appointment[]): Promise<void> {
    try {
      console.log('📦 Sending batch appointment notifications to staff...');
      
      const promises = appointments.map(appointment => 
        this.notifyNewAppointment(appointment)
      );
      
      await Promise.all(promises);
      
      console.log('✅ Batch notifications sent successfully');
    } catch (error) {
      console.error('❌ Failed to send batch notifications:', error);
    }
  }
  static async sendDailySummary(): Promise<void> {
    try {
      console.log('📊 Sending daily appointment summary to staff...');
      const today = new Date().toISOString().split('T')[0];
      
      // Get all staff users
      const staffUsers = await NotificationService.getAllStaffUsers();
      
      if (staffUsers.length === 0) {
        console.warn('⚠️ No staff users found for daily summary');
        return;
      }
      
      // Create daily summary notification
      const summaryNotificationData = {
        title: '📊 Tổng kết ngày',
        message: `Tổng kết lịch hẹn ngày ${new Date().toLocaleDateString('vi-VN')}`,
        type: 'DailySummary',
        is_read: false
      };
      
      const promises = staffUsers.map(staff => 
        NotificationService.createNotification(staff.id, summaryNotificationData)
      );
      
      await Promise.all(promises);
      
      console.log('✅ Daily summary sent to staff successfully');
    } catch (error) {
      console.error('❌ Failed to send daily summary:', error);
    }
  }
}

// Example usage in customer booking system:
/*
// When customer creates new appointment
const newAppointment = await createAppointment(appointmentData);

// Notify staff about new appointment
await AppointmentNotificationIntegration.notifyNewAppointment(newAppointment);

// If it's a legal DNA test, send urgent notification
if (newAppointment.legalType === 'Pháp Lý') {
  await AppointmentNotificationIntegration.notifyUrgentAppointment(newAppointment);
}
*/