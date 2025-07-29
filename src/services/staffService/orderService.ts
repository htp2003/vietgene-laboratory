// src/services/staffService/orderService.ts - FIXED VERSION
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
   * 🚀 FIXED: Update order with full data preservation
   */
  static async updateOrder(orderId: string, orderData: Partial<OrderRequest>): Promise<boolean> {
    try {
      console.log(`🔄 Updating order ${orderId}...`, orderData);

      // 🚀 FIX 1: Get current order data first to preserve all fields
      const currentOrder = await this.getOrderById(orderId);
      
      if (!currentOrder) {
        console.error(`❌ Cannot find order ${orderId} to update`);
        return false;
      }

      console.log("📋 Current order data:", {
        orderId: currentOrder.orderId,
        status: currentOrder.status,
        total_amount: currentOrder.total_amount,
        payment_status: currentOrder.payment_status
      });

      // 🚀 FIX 2: Merge with existing data to preserve all fields
      const fullUpdateData = {
        order_code: currentOrder.order_code,
        status: orderData.status || currentOrder.status,
        total_amount: currentOrder.total_amount, // ✅ PRESERVE total_amount
        payment_method: currentOrder.payment_method,
        payment_status: currentOrder.payment_status,
        payment_date: currentOrder.payment_date,
        transaction_id: currentOrder.transaction_id,
        notes: orderData.notes || currentOrder.notes,
        createdAt: currentOrder.createdAt,
        updatedAt: new Date().toISOString()
      };

      console.log("📤 Sending full update data:", fullUpdateData);

      const response = await apiClient.put(`/orders/${orderId}`, fullUpdateData);

      if (response.data.code === 200) {
        console.log("✅ Order updated successfully");
        console.log("📋 Updated order result:", {
          orderId: response.data.result?.orderId,
          status: response.data.result?.status,
          total_amount: response.data.result?.total_amount
        });
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
   * 🚀 ENHANCED: Update order status with data preservation
   */
  static async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      console.log(`🏷️ Updating order ${orderId} status to: ${status}`);

      // 🚀 Get current order to check total_amount before update
      const currentOrder = await this.getOrderById(orderId);
      if (currentOrder) {
        console.log(`💰 Current total_amount: ${currentOrder.total_amount}`);
      }

      const success = await this.updateOrder(orderId, { 
        status: status,
        updatedAt: new Date().toISOString()
      });

      if (success) {
        console.log(`✅ Order ${orderId} status updated to: ${status}`);
        
        // 🚀 Verify total_amount is preserved
        const updatedOrder = await this.getOrderById(orderId);
        if (updatedOrder) {
          console.log(`💰 After update total_amount: ${updatedOrder.total_amount}`);
          if (updatedOrder.total_amount === 0 && currentOrder && currentOrder.total_amount > 0) {
            console.error("🚨 WARNING: total_amount was reset to 0 after update!");
            console.error("🔍 This indicates an API issue. Original amount:", currentOrder.total_amount);
          }
        }
      }

      return success;

    } catch (error) {
      console.error("❌ Error updating order status:", error);
      return false;
    }
  }

  /**
   * 🚀 ALTERNATIVE: Update using PATCH instead of PUT (if supported)
   */
  static async updateOrderStatusOnly(orderId: string, status: string): Promise<boolean> {
    try {
      console.log(`🏷️ PATCH updating order ${orderId} status to: ${status}`);

      // Try PATCH first (only updates specified fields)
      try {
        const response = await apiClient.patch(`/orders/${orderId}`, { 
          status: status,
          updatedAt: new Date().toISOString()
        });

        if (response.data.code === 200) {
          console.log("✅ Order status updated via PATCH");
          return true;
        }
      } catch (patchError) {
        console.log("ℹ️ PATCH not supported, falling back to PUT with full data");
      }

      // Fallback to PUT with full data preservation
      return await this.updateOrderStatus(orderId, status);

    } catch (error) {
      console.error("❌ Error updating order status:", error);
      return false;
    }
  }

  /**
   * 🚀 DEBUG: Check what happens to total_amount
   */
  static async debugOrderUpdate(orderId: string, newStatus: string): Promise<void> {
    try {
      console.log("🔍 === DEBUG ORDER UPDATE ===");
      
      // 1. Get order before update
      const beforeOrder = await this.getOrderById(orderId);
      console.log("📋 BEFORE:", {
        orderId: beforeOrder?.orderId,
        status: beforeOrder?.status,
        total_amount: beforeOrder?.total_amount,
        payment_status: beforeOrder?.payment_status
      });

      // 2. Try different update approaches
      console.log("🧪 Testing different update approaches...");

      // Approach 1: Minimal update
      console.log("🧪 Approach 1: Minimal status-only update");
      const response1 = await apiClient.put(`/orders/${orderId}`, {
        status: newStatus
      });
      console.log("📤 Response 1:", response1.data);

      const afterOrder1 = await this.getOrderById(orderId);
      console.log("📋 AFTER Approach 1:", {
        status: afterOrder1?.status,
        total_amount: afterOrder1?.total_amount
      });

      // Restore original status for next test
      if (beforeOrder) {
        await apiClient.put(`/orders/${orderId}`, {
          status: beforeOrder.status
        });
      }

      // Approach 2: Full data update
      console.log("🧪 Approach 2: Full data preservation update");
      if (beforeOrder) {
        const fullData = {
          order_code: beforeOrder.order_code,
          status: newStatus,
          total_amount: beforeOrder.total_amount,
          payment_method: beforeOrder.payment_method,
          payment_status: beforeOrder.payment_status,
          payment_date: beforeOrder.payment_date,
          transaction_id: beforeOrder.transaction_id,
          notes: beforeOrder.notes
        };

        const response2 = await apiClient.put(`/orders/${orderId}`, fullData);
        console.log("📤 Response 2:", response2.data);

        const afterOrder2 = await this.getOrderById(orderId);
        console.log("📋 AFTER Approach 2:", {
          status: afterOrder2?.status,
          total_amount: afterOrder2?.total_amount
        });
      }

      console.log("🔍 === END DEBUG ===");

    } catch (error) {
      console.error("❌ Debug error:", error);
    }
  }

  /**
   * 🚀 CORE FUNCTION: Sync appointment status to order status (FIXED)
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

      // 🚀 FIX: Use the enhanced update method with data preservation
      const success = await this.updateOrderStatusOnly(orderId, orderStatus);
      
      if (success) {
        console.log(`✅ Successfully synced: Appointment ${appointmentId} (${appointmentStatus}) -> Order ${orderId} (${orderStatus})`);
      } else {
        console.error(`❌ Failed to sync appointment ${appointmentId} to order ${orderId}`);
        
        // 🚀 DEBUG: Run debug if update fails
        console.log("🔍 Running debug to understand the issue...");
        await this.debugOrderUpdate(orderId, orderStatus);
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
      'DeliveringKit': 'processing',
      'KitDelivered': 'processing',
      'SampleReceived': 'processing',
      'Testing': 'processing',
      'Completed': 'completed',          // 🎯 THIS IS THE KEY MAPPING!
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

  // ... (keep all other existing methods unchanged)

  /**
   * 🎯 MAIN FUNCTION: Update appointment and sync order (ENHANCED)
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
    originalAmount?: number;
    afterAmount?: number;
  }> {
    try {
      console.log(`🔄 Full sync: Appointment ${appointmentId} -> ${newAppointmentStatus}`);

      // 🚀 ENHANCEMENT: Check original amount before any updates
      let originalAmount: number | undefined;
      const orderId = appointment.rawData?.order?.orderId || appointment.orderId;
      if (orderId) {
        const originalOrder = await this.getOrderById(orderId);
        originalAmount = originalOrder?.total_amount;
        console.log(`💰 Original order amount: ${originalAmount}`);
      }

      // 1. Update appointment first
      await appointmentUpdateCallback(appointmentId, newAppointmentStatus);
      
      // 2. Sync to order
      const orderSynced = await this.syncAppointmentStatusToOrder(
        appointmentId, 
        appointment, 
        newAppointmentStatus
      );

      // 🚀 ENHANCEMENT: Check amount after update
      let afterAmount: number | undefined;
      if (orderId) {
        const afterOrder = await this.getOrderById(orderId);
        afterAmount = afterOrder?.total_amount;
        console.log(`💰 After update amount: ${afterAmount}`);
      }

      const result: {
        appointmentUpdated: boolean;
        orderSynced: boolean;
        error?: string;
        originalAmount?: number;
        afterAmount?: number;
      } = {
        appointmentUpdated: true,
        orderSynced: orderSynced,
        originalAmount,
        afterAmount
      };

      if (!orderSynced) {
        result.error = "Appointment updated but order sync failed";
      }

      // 🚨 Check if amount was lost
      if (originalAmount && originalAmount > 0 && afterAmount === 0) {
        result.error = `WARNING: Order amount was reset from ${originalAmount} to 0`;
        console.error("🚨 CRITICAL: Order amount was lost during update!");
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