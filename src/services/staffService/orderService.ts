// src/services/staffService/orderService.ts
import { apiClient } from '../../config/api';
import { 
  ApiResponse, 
  ApiOrder, 
  OrderRequest,
  Appointment 
} from '../../types/appointment';

export class OrderService {
  
  /**
   * Get order by ID
   */
  static async getOrderById(orderId: string): Promise<ApiOrder | null> {
    try {
      console.log(`🔍 Fetching order ${orderId}...`);
      
      const response = await apiClient.get<ApiResponse<ApiOrder>>(`/orders/${orderId}`);
      
      if (response.data.code === 200) {
        console.log("✅ Order fetched successfully");
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error fetching order:", error);
      return null;
    }
  }

  /**
   * Get all orders
   */
  static async getAllOrders(): Promise<ApiOrder[]> {
    try {
      console.log("📋 Fetching all orders...");
      
      const response = await apiClient.get<ApiResponse<ApiOrder[]>>("/orders/all");
      
      if (response.data.code === 200) {
        console.log("✅ Orders fetched successfully:", response.data.result.length);
        return response.data.result;
      }
      
      return [];
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      return [];
    }
  }

  /**
   * Update order
   */
  static async updateOrder(orderId: string, orderData: Partial<OrderRequest>): Promise<boolean> {
    try {
      console.log(`🔄 Updating order ${orderId}...`, orderData);

      const response = await apiClient.put(`/orders/${orderId}`, orderData);

      if (response.data.code === 200) {
        console.log("✅ Order updated successfully");
        return true;
      } else {
        console.error("❌ Failed to update order:", response.data.message);
        return false;
      }

    } catch (error) {
      console.error("❌ Error updating order:", error);
      return false;
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      console.log(`🏷️ Updating order ${orderId} status to: ${status}`);

      const success = await this.updateOrder(orderId, { 
        status: status,
        updatedAt: new Date().toISOString()
      });

      if (success) {
        console.log(`✅ Order ${orderId} status updated to: ${status}`);
      }

      return success;

    } catch (error) {
      console.error("❌ Error updating order status:", error);
      return false;
    }
  }

  /**
   * 🚀 CORE FUNCTION: Sync appointment status to order status
   */
  static async syncAppointmentStatusToOrder(
    appointmentId: string, 
    appointment: Appointment, 
    appointmentStatus: Appointment['status']
  ): Promise<boolean> {
    try {
      const orderId = appointment.rawData?.order?.orderId || appointment.orderId;
      
      if (!orderId) {
        console.warn(`⚠️ No orderId found for appointment ${appointmentId}`);
        return false;
      }

      console.log(`🔄 Syncing appointment ${appointmentId} status "${appointmentStatus}" to order ${orderId}`);

      // Map appointment status to order status
      const orderStatus = this.mapAppointmentStatusToOrderStatus(appointmentStatus);
      
      if (!orderStatus) {
        console.log(`ℹ️ No order status mapping for appointment status: ${appointmentStatus}`);
        return true; // Not an error, just no mapping needed
      }

      // Update order status
      const success = await this.updateOrderStatus(orderId, orderStatus);
      
      if (success) {
        console.log(`✅ Successfully synced: Appointment ${appointmentId} (${appointmentStatus}) -> Order ${orderId} (${orderStatus})`);
      } else {
        console.error(`❌ Failed to sync appointment ${appointmentId} to order ${orderId}`);
      }

      return success;

    } catch (error: any) {
      console.error(`❌ Error syncing appointment ${appointmentId} to order:`, error);
      return false;
    }
  }

  /**
   * Map appointment status to order status
   */
  static mapAppointmentStatusToOrderStatus(appointmentStatus: Appointment['status']): string | null {
    const statusMapping: Record<Appointment['status'], string | null> = {
      'Pending': 'pending',
      'Confirmed': 'confirmed',
      'DeliveringKit': 'processing',    // Order is being processed (kit delivery)
      'KitDelivered': 'processing',     // Still processing
      'SampleReceived': 'processing',   // Still processing (sample received)
      'Testing': 'processing',          // Still processing (lab testing)
      'Completed': 'completed',         // 🎯 THIS IS THE KEY MAPPING!
      'Cancelled': 'cancelled'
    };

    const orderStatus = statusMapping[appointmentStatus];
    
    console.log(`📋 Status mapping: ${appointmentStatus} -> ${orderStatus || 'no mapping'}`);
    
    return orderStatus;
  }

  /**
   * Get order status display text
   */
  static getOrderStatusDisplayText(status: string): string {
    const statusDisplayMap: Record<string, string> = {
      'pending': 'Chờ xử lý',
      'confirmed': 'Đã xác nhận', 
      'processing': 'Đang xử lý',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
      'paid': 'Đã thanh toán',
      'unpaid': 'Chưa thanh toán'
    };

    return statusDisplayMap[status] || status;
  }

  /**
   * Check if order can be updated to specific status
   */
  static canUpdateOrderStatus(currentStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['completed', 'cancelled'],
      'completed': [], // Final state
      'cancelled': [], // Final state
      'paid': ['processing'],
      'unpaid': ['paid', 'cancelled']
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
  }

  /**
   * Get orders by user ID
   */
  static async getOrdersByUserId(userId: string): Promise<ApiOrder[]> {
    try {
      console.log(`👤 Fetching orders for user ${userId}...`);
      
      const response = await apiClient.get<ApiResponse<ApiOrder[]>>(`/orders/user/${userId}`);
      
      if (response.data.code === 200) {
        console.log("✅ User orders fetched successfully:", response.data.result.length);
        return response.data.result;
      }
      
      return [];
    } catch (error) {
      console.error("❌ Error fetching user orders:", error);
      return [];
    }
  }

  /**
   * Create new order
   */
  static async createOrder(orderData: OrderRequest): Promise<ApiOrder | null> {
    try {
      console.log("📝 Creating new order...", orderData);
      
      const response = await apiClient.post<ApiResponse<ApiOrder>>("/orders", orderData);
      
      if (response.data.code === 200) {
        console.log("✅ Order created successfully");
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error creating order:", error);
      return null;
    }
  }

  /**
   * Delete order
   */
  static async deleteOrder(orderId: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting order ${orderId}...`);
      
      const response = await apiClient.delete(`/orders/${orderId}`);
      
      if (response.data.code === 200) {
        console.log("✅ Order deleted successfully");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("❌ Error deleting order:", error);
      return false;
    }
  }

  /**
   * 🎯 MAIN FUNCTION: Update appointment and sync order
   * This should be called whenever appointment status changes
   */
  static async updateAppointmentAndSyncOrder(
    appointmentId: string,
    appointment: Appointment,
    newAppointmentStatus: Appointment['status'],
    appointmentUpdateCallback: (appointmentId: string, status: Appointment['status']) => Promise<void>
  ): Promise<{
    appointmentUpdated: boolean;
    orderSynced: boolean;
    error?: string;
  }> {
    try {
      console.log(`🔄 Full sync: Appointment ${appointmentId} -> ${newAppointmentStatus}`);

      // 1. Update appointment first
      await appointmentUpdateCallback(appointmentId, newAppointmentStatus);
      
      // 2. Sync to order
      const orderSynced = await this.syncAppointmentStatusToOrder(
        appointmentId, 
        appointment, 
        newAppointmentStatus
      );

      const result: {
        appointmentUpdated: boolean;
        orderSynced: boolean;
        error?: string;
      } = {
        appointmentUpdated: true,
        orderSynced: orderSynced
      };

      if (!orderSynced) {
        result.error = "Appointment updated but order sync failed";
      }

      return result;

    } catch (error: any) {
      console.error('❌ Error in full appointment-order sync:', error);
      return {
        appointmentUpdated: false,
        orderSynced: false,
        error: error.message
      };
    }
  }
}