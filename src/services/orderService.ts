import axios from "axios";

const API_BASE_URL = "https://dna-service-se1857.onrender.com/dna_service";

// API Client setup
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface Doctor {
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

export interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: string;
  doctorId: string;
}

export interface CreateOrderRequest {
  customerInfo: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    identityCard: string;
  };
  serviceInfo: {
    serviceId: string;
    quantity: number;
    collectionMethod: "home" | "facility";
    appointmentDate?: string;
    appointmentTime?: string;
    doctorId?: string;
    timeSlotId?: string;
    notes?: string;
  };
  participantInfo: {
    participants: Array<{
      name: string;
      relationship: string;
      age: string;
    }>;
  };
  paymentInfo: {
    method: "cash" | "card" | "transfer";
  };
}
class OrderService {
  // ===== DOCTORS =====

  async getAllDoctors(): Promise<Doctor[]> {
    try {
      console.log("🔍 Fetching doctors from API...");
      const response = await apiClient.get("/doctors");

      if (response.data.code === 200) {
        const doctors = response.data.result || [];
        console.log("✅ Doctors loaded:", doctors.length);
        console.log("✅ Raw doctors data:", doctors);

        // Temporarily return all doctors without filtering
        // Later you can add filter if needed: .filter((doctor: Doctor) => doctor.isActive !== false)
        return doctors;
      }

      throw new Error("Failed to fetch doctors");
    } catch (error: any) {
      console.error(
        "❌ Doctors API failed:",
        error.response?.data || error.message
      );
      throw new Error("Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.");
    }
  }
  // ===== TIME SLOTS =====
  async getDoctorTimeSlots(doctorId: string): Promise<TimeSlot[]> {
    try {
      console.log("🔍 Fetching time slots for doctor:", doctorId);
      const response = await apiClient.get(
        `/doctor-time-slots/doctor/${doctorId}`
      );

      if (response.data.code === 200) {
        const timeSlots = response.data.result || [];
        console.log("✅ Time slots loaded:", timeSlots.length);
        return timeSlots.filter((slot: TimeSlot) => slot.isAvailable);
      }

      throw new Error("Failed to fetch time slots");
    } catch (error: any) {
      console.error(
        "❌ Time slots API failed:",
        error.response?.data || error.message
      );
      throw new Error(
        "Không thể tải lịch khám của bác sĩ. Vui lòng thử lại sau."
      );
    }
  }

  // ===== USER REGISTRATION =====
  private async handleUserRegistration(userData: {
    fullName: string;
    phone: string;
    email: string;
  }): Promise<string> {
    try {
      // Check if user is already logged in
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      console.log("🔍 Current user:", currentUser);
      console.log("🔍 Token exists:", !!token);

      if (currentUser.id && token) {
        console.log("✅ Using current logged in user:", currentUser.id);
        return currentUser.id;
      }

      // If no user logged in, try to register or use guest mode
      console.log("⚠️ No user logged in, creating guest order");

      // For now, return a guest user ID - you may want to implement proper registration
      return "guest_user_" + Date.now();
    } catch (error: any) {
      console.error("❌ User handling failed:", error);
      return "guest_user_" + Date.now();
    }
  }
  // ===== ORDER CREATION =====

  async createOrder(orderData: {
    customerId: string;
    serviceId: string;
    quantity: number;
    collectionMethod: string;
    notes?: string;
  }): Promise<{ orderId: string }> {
    try {
      const now = new Date().toISOString();

      // Use exact field names from database schema
      const orderPayload = {
        order_code: Math.floor(Math.random() * 900000) + 100000, // Try number first
        status: "pending",
        total_amount: 2500000 * orderData.quantity,
        payment_method: "transfer",
        payment_status: "pending",
        payment_date: null,
        transaction_id: null,
        notes: orderData.notes || "",
        created_at: now, // Use snake_case
        update_at: now, // Use snake_case
      };

      console.log("📤 Creating order with correct field names:", orderPayload);
      const response = await apiClient.post("/orders", orderPayload);

      if (response.data.code === 200) {
        const orderId = response.data.result.orderId || response.data.result.id;
        console.log(
          "✅ Order created with correct fields:",
          response.data.result
        );
        return { orderId };
      }

      throw new Error(
        `Order creation failed: ${response.data.message || "Unknown error"}`
      );
    } catch (error: any) {
      console.error("❌ Order creation error:", error.response?.data);
      throw new Error(
        "Không thể tạo đơn hàng: " +
          (error.response?.data?.message || error.message)
      );
    }
  }
  // ===== ORDER DETAILS =====

  async createOrderDetail(
    orderId: string,
    serviceId: string,
    orderDetailData: {
      quantity: number;
      unitPrice: number;
      notes?: string;
    }
  ): Promise<{ orderDetailId: string }> {
    try {
      // Fix payload structure
      const payload = {
        quantity: orderDetailData.quantity,
        unit_price: orderDetailData.unitPrice,
        subtotal: orderDetailData.quantity * orderDetailData.unitPrice,
        note: orderDetailData.notes || "", // Empty string instead of null
        // Don't send createdAt - let backend handle
      };

      console.log("📤 Creating order detail with fixed payload:", payload);
      console.log("📤 Order ID:", orderId, "Service ID:", serviceId);

      const response = await apiClient.post(
        `/order-details/${orderId}/${serviceId}`,
        payload
      );

      console.log("📤 Order detail response:", response.data);

      if (response.data.code === 200) {
        console.log("✅ Order detail created:", response.data.result.id);
        return { orderDetailId: response.data.result.id };
      }

      throw new Error(
        `Order detail creation failed: ${
          response.data.message || "Unknown error"
        }`
      );
    } catch (error: any) {
      console.error("❌ Order detail error:");
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);

      throw new Error(
        "Không thể tạo chi tiết đơn hàng: " +
          (error.response?.data?.message || error.message)
      );
    }
  }

  // ===== PARTICIPANTS =====
  async addOrderParticipant(
    orderId: string,
    participantData: {
      participantName: string;
      relationship: string;
      age: number;
      notes?: string;
    }
  ): Promise<{ participantId: string }> {
    try {
      // Fix payload structure
      const payload = {
        participant_name: participantData.participantName,
        relationship: participantData.relationship,
        age: participantData.age,
        note: participantData.notes || "", // Empty string instead of null
        // Don't send createdAt - let backend handle
      };

      console.log("📤 Adding participant with fixed payload:", payload);
      console.log("📤 Order ID:", orderId);

      const response = await apiClient.post(
        `/OrderParticipants/${orderId}`,
        payload
      );

      console.log("📤 Participant response:", response.data);

      if (response.data.code === 200) {
        console.log("✅ Participant added:", response.data.result.id);
        return { participantId: response.data.result.id };
      }

      throw new Error(
        `Participant creation failed: ${
          response.data.message || "Unknown error"
        }`
      );
    } catch (error: any) {
      console.error("❌ Participant error:");
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);

      throw new Error(
        "Không thể thêm người tham gia: " +
          (error.response?.data?.message || error.message)
      );
    }
  }
  // ===== APPOINTMENTS =====

  async createAppointment(
    orderId: string,
    appointmentData: {
      appointmentDate: string;
      appointmentTime: string;
      doctorId: string;
      timeSlotId: string;
      notes?: string;
    }
  ): Promise<{ appointmentId: string }> {
    try {
      // Match exactly with Swagger payload that worked
      const payload = {
        appointment_date: appointmentData.appointmentDate + "T03:24:55.300Z", // Use same format as Swagger
        appointment_type: "Gặp để tư vấn", // Use Vietnamese like in Swagger
        status: true,
        notes: appointmentData.notes || "không có",
        doctor_time_slot: appointmentData.timeSlotId,
      };

      console.log(
        "📤 Creating appointment with Swagger-matched payload:",
        payload
      );
      console.log("📤 Order ID:", orderId);
      console.log(
        "📤 Full URL:",
        `${apiClient.defaults.baseURL}/appointment/${orderId}`
      );

      const response = await apiClient.post(`/appointment/${orderId}`, payload);

      console.log("📤 Appointment response:", response.data);

      if (response.data.code === 200) {
        console.log(
          "✅ Appointment created successfully:",
          response.data.result.id
        );
        return { appointmentId: response.data.result.id };
      }

      throw new Error(`Appointment creation failed: ${response.data.message}`);
    } catch (error: any) {
      console.error("❌ Appointment creation failed:");
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error message:", error.message);

      // Still throw error so we can see what's happening
      throw new Error(
        "Không thể tạo lịch hẹn: " +
          (error.response?.data?.message || error.message)
      );
    }
  }
  // ===== PAYMENT (Mock for now - no API available) =====
  async processPayment(
    orderId: string,
    paymentData: {
      method: "cash" | "card" | "transfer";
      amount: number;
    }
  ): Promise<{
    success: boolean;
    transactionId?: string;
    message: string;
  }> {
    console.log("💳 Processing mock payment...");

    const messages = {
      transfer: `Vui lòng chuyển khoản ${new Intl.NumberFormat("vi-VN").format(
        paymentData.amount
      )}đ vào:\n\n🏦 Ngân hàng: Vietcombank\n💳 STK: 1234567890\n👤 Chủ TK: VIET GENE LAB\n📝 Nội dung: ORDER${orderId.slice(
        -6
      )}`,
      cash: "Thanh toán tiền mặt khi nhận dịch vụ. Nhân viên sẽ liên hệ xác nhận thời gian.",
      card: "Thanh toán thẻ tín dụng đang được xử lý. Bạn sẽ nhận được thông báo qua email.",
    };

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      // Try to update order payment status via API
      const updatePayload = {
        payment_method: paymentData.method,
        payment_status: paymentData.method === "cash" ? "pending" : "paid",
        total_amount: paymentData.amount,
      };

      console.log("📤 Updating order payment info:", updatePayload);
      await apiClient.put(`/orders/${orderId}`, updatePayload);
      console.log("✅ Order payment info updated");
    } catch (error) {
      console.warn("⚠️ Could not update order payment info, continuing...");
    }

    return {
      success: true,
      transactionId: "TXN_" + Date.now(),
      message: messages[paymentData.method],
    };
  }
  // ===== COMPLETE ORDER FLOW =====

  async createCompleteOrder(orderData: CreateOrderRequest): Promise<string> {
    console.log("🚀 Starting simplified order creation flow...");

    try {
      // Step 1: Handle user registration
      console.log("👤 Step 1: Handling user...");
      const userId = await this.handleUserRegistration(orderData.customerInfo);

      // Step 2: Create main order (simplified)
      console.log("📦 Step 2: Creating order...");
      const orderResult = await this.createOrder({
        customerId: userId,
        serviceId: orderData.serviceInfo.serviceId,
        quantity: orderData.serviceInfo.quantity,
        collectionMethod: orderData.serviceInfo.collectionMethod,
        notes: orderData.serviceInfo.notes,
      });
      const orderId = orderResult.orderId;
      console.log("✅ Order created with ID:", orderId);

      // Step 3: Add order details (simplified)
      console.log("📋 Step 3: Adding order details...");
      try {
        await this.createOrderDetail(orderId, orderData.serviceInfo.serviceId, {
          quantity: orderData.serviceInfo.quantity,
          unitPrice: 2500000, // Fixed price for now
          notes: orderData.serviceInfo.notes,
        });
        console.log("✅ Order details added");
      } catch (error) {
        console.warn("⚠️ Could not add order details, continuing...");
      }

      // Step 4: Add participants (simplified)
      console.log("👨‍👩‍👧‍👦 Step 4: Adding participants...");
      for (const participant of orderData.participantInfo.participants) {
        try {
          await this.addOrderParticipant(orderId, {
            participantName: participant.name,
            relationship: participant.relationship,
            age: parseInt(participant.age),
            notes: "",
          });
          console.log(`✅ Participant ${participant.name} added`);
        } catch (error) {
          console.warn(
            `⚠️ Could not add participant ${participant.name}, continuing...`
          );
        }
      }

      // Step 5: Create appointment ONLY if facility collection AND user selected doctor
      if (
        orderData.serviceInfo.collectionMethod === "facility" &&
        orderData.serviceInfo.appointmentDate &&
        orderData.serviceInfo.doctorId &&
        orderData.serviceInfo.timeSlotId
      ) {
        console.log("📅 Step 5: Creating appointment...");
        try {
          await this.createAppointment(orderId, {
            appointmentDate: orderData.serviceInfo.appointmentDate,
            appointmentTime: orderData.serviceInfo.appointmentTime || "09:00",
            doctorId: orderData.serviceInfo.doctorId,
            timeSlotId: orderData.serviceInfo.timeSlotId,
            notes: orderData.serviceInfo.notes,
          });
          console.log("✅ Appointment created");
        } catch (error) {
          console.warn(
            "⚠️ Could not create appointment, but order is still valid"
          );
        }
      }

      // Step 6: Process payment (mock)
      console.log("💳 Step 6: Processing payment...");
      const totalAmount = 2500000 * orderData.serviceInfo.quantity;
      await this.processPayment(orderId, {
        method: orderData.paymentInfo.method,
        amount: totalAmount,
      });

      console.log("🎉 Order creation completed successfully!");
      return orderId;
    } catch (error: any) {
      console.error("❌ Order creation failed:", error);
      throw new Error(
        "Có lỗi xảy ra khi tạo đơn hàng: " +
          (error.message || "Vui lòng thử lại sau")
      );
    }
  }

  // ===== GET ORDER DATA =====
  async getCompleteOrderData(orderId: string): Promise<any> {
    try {
      console.log("🔍 Fetching complete order data for:", orderId);

      // Get main order
      const orderResponse = await apiClient.get(`/orders/${orderId}`);
      if (orderResponse.data.code !== 200) {
        throw new Error("Order not found");
      }
      const order = orderResponse.data.result;

      // Get participants
      let participants = [];
      try {
        const participantsResponse = await apiClient.get(
          `/OrderParticipants/order/${orderId}`
        );
        participants = participantsResponse.data.result || [];
      } catch (error) {
        console.warn("⚠️ Could not fetch participants");
      }

      // Get order details
      let orderDetails = [];
      try {
        const detailsResponse = await apiClient.get(
          `/order-details/${orderId}/all`
        );
        orderDetails = detailsResponse.data.result || [];
      } catch (error) {
        console.warn("⚠️ Could not fetch order details");
      }

      // Get appointment if exists
      let appointment = null;
      try {
        const appointmentResponse = await apiClient.get(`/appointment`);
        const appointments = appointmentResponse.data.result || [];
        appointment = appointments.find((app: any) => app.orderId === orderId);
      } catch (error) {
        console.warn("⚠️ Could not fetch appointment");
      }

      console.log("✅ Complete order data retrieved");
      return {
        ...order,
        participants,
        orderDetails,
        appointment,
      };
    } catch (error: any) {
      console.error("❌ Error fetching order data:", error);
      throw new Error("Không thể tải thông tin đơn hàng");
    }
  }

  // ===== GET USER ORDERS =====
  async getUserOrders(userId: string): Promise<any[]> {
    try {
      console.log("🔍 Fetching orders for user:", userId);
      const response = await apiClient.get(`/orders/user/${userId}`);

      if (response.data.code === 200) {
        const orders = response.data.result || [];
        console.log("✅ User orders loaded:", orders.length);
        return orders.sort(
          (a: any, b: any) =>
            new Date(b.createdAt || b.created_at).getTime() -
            new Date(a.createdAt || a.created_at).getTime()
        );
      }

      return [];
    } catch (error: any) {
      console.error("❌ Error fetching user orders:", error);
      return [];
    }
  }
}

export const orderService = new OrderService();
