import axios from "axios";

const API_BASE_URL = "https://dna-service-se1857.onrender.com/dna_service";

// ✅ OPTIMIZED: Increased timeout and better config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30s
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ✅ OPTIMIZED: Better request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request logging for debugging
    console.log(
      `🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ✅ OPTIMIZED: Better response interceptor with retry logic
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    const config = error.config;

    // Retry logic for network errors
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }

    if (
      config.__retryCount < 2 &&
      (error.code === "ECONNABORTED" || error.response?.status >= 500)
    ) {
      config.__retryCount += 1;
      console.log(
        `🔄 Retrying request (${config.__retryCount}/2): ${config.url}`
      );
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * config.__retryCount)
      );
      return apiClient(config);
    }

    console.error("❌ API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ✅ UPDATED V9 Interfaces
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

export interface Sample {
  id: string;
  sample_code: string;
  sample_type: string;
  collection_method: string;
  collection_date?: string;
  received_date?: string;
  status: string;
  shipping_tracking?: string;
  notes?: string;
  sample_quality?: string;
  userId: string;
  sampleKitsId: string; // V9: Single kit ID reference
}

export interface SampleKit {
  id: string;
  kit_code: string;
  kit_type: string;
  status: string;
  shipper_data?: string;
  delivered_date?: string;
  tracking_number?: number;
  shipping_address: string;
  expiry_date?: string;
  instruction?: string;
  createdAt: string;
  updatedAt?: string;
  samplesId: string; // V9: Single sample ID reference
  userId: string;
  orderId: string; // V9: Direct order reference
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
  // ===== UTILITY METHODS =====
  private getCurrentUserId(): string {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.id || "unknown-user";
    } catch {
      return "unknown-user";
    }
  }

  private generateUniqueCode(prefix: string, orderId?: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const orderSuffix = orderId ? orderId.slice(-4) : "";
    return `${prefix}_${timestamp}_${random}_${orderSuffix}`;
  }

  // ✅ OPTIMIZED: Parallel API calls for better performance
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      console.log("🔍 Fetching doctors from API...");
      const startTime = Date.now();

      const response = await apiClient.get("/doctors");

      console.log(`✅ Doctors API completed in ${Date.now() - startTime}ms`);

      if (response.data.code === 200) {
        const doctors = response.data.result || [];
        console.log("✅ Doctors loaded:", doctors.length);
        return doctors.filter((doctor: Doctor) => doctor.isActive !== false);
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

  async getDoctorTimeSlots(doctorId: string): Promise<TimeSlot[]> {
    try {
      console.log("🔍 Fetching time slots for doctor:", doctorId);
      const startTime = Date.now();

      const response = await apiClient.get(
        `/doctor-time-slots/doctor/${doctorId}`
      );

      console.log(`✅ Time slots API completed in ${Date.now() - startTime}ms`);

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

  // ✅ OPTIMIZED: Better user handling
  private async handleUserRegistration(userData: {
    fullName: string;
    phone: string;
    email: string;
  }): Promise<string> {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      console.log("🔍 Current user:", currentUser);

      if (currentUser.id && token) {
        console.log("✅ Using current logged in user:", currentUser.id);
        return currentUser.id;
      }

      console.log("⚠️ No user logged in, creating guest order");
      return "guest_user_" + Date.now();
    } catch (error: any) {
      console.error("❌ User handling failed:", error);
      return "guest_user_" + Date.now();
    }
  }

  // ✅ CORE ORDER METHODS - Optimized
  async createOrder(orderData: {
    customerId: string;
    serviceId: string;
    quantity: number;
    collectionMethod: string;
    notes?: string;
  }): Promise<{ orderId: string }> {
    try {
      const startTime = Date.now();
      const now = new Date().toISOString();

      const orderPayload = {
        order_code: Math.floor(Math.random() * 900000) + 100000,
        status: "pending",
        total_amount: 2500000 * orderData.quantity,
        payment_method: "transfer",
        payment_status: "pending",
        payment_date: null,
        transaction_id: null,
        notes: orderData.notes || "",
        createdAt: now,
        updatedAt: now,
      };

      console.log("📤 Creating order:", orderPayload);
      const response = await apiClient.post("/orders", orderPayload);

      console.log(`✅ Order creation completed in ${Date.now() - startTime}ms`);

      if (response.data.code === 200) {
        const orderId = response.data.result.orderId || response.data.result.id;
        console.log("✅ Order created:", orderId);
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
      const startTime = Date.now();

      const payload = {
        quantity: orderDetailData.quantity,
        unit_price: orderDetailData.unitPrice,
        subtotal: orderDetailData.quantity * orderDetailData.unitPrice,
        note: orderDetailData.notes || "",
      };

      console.log("📤 Creating order detail:", payload);
      const response = await apiClient.post(
        `/order-details/${orderId}/${serviceId}`,
        payload
      );

      console.log(
        `✅ Order detail creation completed in ${Date.now() - startTime}ms`
      );

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
      console.error("❌ Order detail error:", error.response?.data);
      throw new Error(
        "Không thể tạo chi tiết đơn hàng: " +
          (error.response?.data?.message || error.message)
      );
    }
  }

  // ✅ OPTIMIZED: Parallel participant creation
  async addOrderParticipants(
    orderId: string,
    participants: Array<{
      participantName: string;
      relationship: string;
      age: number;
      notes?: string;
    }>
  ): Promise<{ participantIds: string[] }> {
    try {
      console.log("👥 Adding participants in parallel:", participants.length);
      const startTime = Date.now();

      // Create all participants in parallel
      const participantPromises = participants.map(
        async (participantData, index) => {
          try {
            const payload = {
              participant_name: participantData.participantName,
              relationship: participantData.relationship,
              age: participantData.age,
              note: participantData.notes || "",
            };

            const response = await apiClient.post(
              `/OrderParticipants/${orderId}`,
              payload
            );

            if (response.data.code === 200) {
              console.log(
                `✅ Participant ${index + 1} added:`,
                response.data.result.id
              );
              return response.data.result.id;
            }

            throw new Error(`Participant ${index + 1} creation failed`);
          } catch (error) {
            console.error(`❌ Participant ${index + 1} error:`, error);
            return null;
          }
        }
      );

      const participantIds = await Promise.allSettled(participantPromises);
      const successfulIds = participantIds
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => (result as PromiseFulfilledResult<string>).value);

      console.log(
        `✅ Participants creation completed in ${Date.now() - startTime}ms`
      );
      console.log(
        `✅ ${successfulIds.length}/${participants.length} participants added successfully`
      );

      return { participantIds: successfulIds };
    } catch (error: any) {
      console.error("❌ Participants batch error:", error);
      throw new Error(
        "Không thể thêm người tham gia: " + (error.message || "Unknown error")
      );
    }
  }

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
      const startTime = Date.now();

      const payload = {
        appointment_date: appointmentData.appointmentDate + "T03:24:55.300Z",
        appointment_type: "Gặp để tư vấn",
        status: true,
        notes: appointmentData.notes || "không có",
        doctor_time_slot: appointmentData.timeSlotId,
      };

      console.log("📤 Creating appointment:", payload);
      const response = await apiClient.post(`/appointment/${orderId}`, payload);

      console.log(
        `✅ Appointment creation completed in ${Date.now() - startTime}ms`
      );

      if (response.data.code === 200) {
        console.log("✅ Appointment created:", response.data.result.id);
        return { appointmentId: response.data.result.id };
      }

      throw new Error(`Appointment creation failed: ${response.data.message}`);
    } catch (error: any) {
      console.error("❌ Appointment creation failed:", error.response?.data);
      throw new Error(
        "Không thể tạo lịch hẹn: " +
          (error.response?.data?.message || error.message)
      );
    }
  }

  // ✅ V9 CORRECTED: Sample Kit creation (FIRST)
  async createSampleKitsForOrder(
    orderId: string,
    participants: Array<{ name: string; relationship: string; age: string }>,
    shippingAddress: string,
    collectionMethod: "home" | "facility" = "home"
  ): Promise<SampleKit[]> {
    try {
      console.log("📦 Creating sample kits for order:", orderId);
      console.log("👥 Participants:", participants.length);
      const startTime = Date.now();

      // ✅ OPTIMIZED: Create all kits in parallel
      const kitPromises = participants.map(async (participant, index) => {
        try {
          const kitCode =
            this.generateUniqueCode("KIT", orderId) + `_P${index + 1}`;

          const payload = {
            kit_code: kitCode,
            kit_type: "DNA_TEST_KIT",
            status: collectionMethod === "home" ? "ordered" : "ready",
            shipping_address: shippingAddress,
            instruction: this.getKitInstructions(
              collectionMethod,
              participant.name
            ),
            orderId: orderId, // V9: Direct order reference

            // V9 Workarounds for required fields
            samplesId: "pending", // Will be updated when sample is created
            delivered_date:
              collectionMethod === "home"
                ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
                : new Date().toISOString(),
            tracking_number: Math.floor(Math.random() * 900000) + 100000,
          };

          console.log(
            `📦 Creating kit ${index + 1}/${participants.length} for ${
              participant.name
            }`
          );
          const response = await apiClient.post("/sample-kits", payload);

          if (response.data.code === 200) {
            console.log(
              `✅ Kit ${index + 1} created:`,
              response.data.result.id
            );
            return response.data.result;
          }

          throw new Error(`Kit creation failed for ${participant.name}`);
        } catch (error) {
          console.error(
            `❌ Kit creation error for participant ${index + 1}:`,
            error
          );
          return null;
        }
      });

      const kitResults = await Promise.allSettled(kitPromises);
      const successfulKits = kitResults
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => (result as PromiseFulfilledResult<SampleKit>).value);

      console.log(
        `✅ Sample kits creation completed in ${Date.now() - startTime}ms`
      );
      console.log(
        `✅ ${successfulKits.length}/${participants.length} kits created successfully`
      );

      return successfulKits;
    } catch (error: any) {
      console.error("❌ Error in createSampleKitsForOrder:", error);
      throw new Error("Không thể tạo sample kits. Vui lòng thử lại.");
    }
  }

  // ✅ V9: Sample creation (AFTER kits)
  async createSamplesForKits(sampleKits: SampleKit[]): Promise<Sample[]> {
    try {
      console.log("🧬 Creating samples for kits:", sampleKits.length);
      const startTime = Date.now();
      const userId = this.getCurrentUserId();

      // ✅ OPTIMIZED: Create all samples in parallel
      const samplePromises = sampleKits.map(async (kit, index) => {
        try {
          const sampleCode = kit.kit_code.replace("KIT_", "SAMPLE_");

          const payload = {
            sample_code: sampleCode,
            sample_type: "DNA",
            collection_method: "pending",
            status: "pending",
            userId: userId,
            sampleKitsId: kit.id, // V9: Single kit reference
            notes: `Sample for kit ${kit.kit_code}`,
          };

          console.log(
            `🧬 Creating sample ${index + 1}/${sampleKits.length} for kit: ${
              kit.kit_code
            }`
          );
          const response = await apiClient.post("/samples", payload);

          if (response.data.code === 200) {
            const sample = response.data.result;
            console.log(`✅ Sample ${index + 1} created:`, sample.id);

            // Update kit with sample ID (fire and forget)
            this.updateSampleKitWithSampleId(kit.id, sample.id).catch((err) =>
              console.warn("⚠️ Could not update kit with sample ID:", err)
            );

            return sample;
          }

          throw new Error(`Sample creation failed for kit ${kit.kit_code}`);
        } catch (error) {
          console.error(
            `❌ Sample creation error for kit ${index + 1}:`,
            error
          );
          return null;
        }
      });

      const sampleResults = await Promise.allSettled(samplePromises);
      const successfulSamples = sampleResults
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => (result as PromiseFulfilledResult<Sample>).value);

      console.log(
        `✅ Samples creation completed in ${Date.now() - startTime}ms`
      );
      console.log(
        `✅ ${successfulSamples.length}/${sampleKits.length} samples created successfully`
      );

      return successfulSamples;
    } catch (error: any) {
      console.error("❌ Error in createSamplesForKits:", error);
      throw new Error("Không thể tạo samples. Vui lòng thử lại.");
    }
  }

  // Helper method to update kit with sample ID
  private async updateSampleKitWithSampleId(
    kitId: string,
    sampleId: string
  ): Promise<void> {
    try {
      await apiClient.put(`/sample-kits/${kitId}`, { samplesId: sampleId });
      console.log("✅ Updated kit with sample ID:", kitId, "->", sampleId);
    } catch (error) {
      console.warn("⚠️ Could not update kit with sample ID:", error);
    }
  }

  // Helper method for kit instructions
  private getKitInstructions(
    collectionMethod: string,
    participantName?: string
  ): string {
    const name = participantName || "người tham gia";

    if (collectionMethod === "home") {
      return `Hướng dẫn thu mẫu tại nhà cho ${name}:
1. Rửa tay sạch sẽ trước khi thu mẫu
2. Không ăn uống, đánh răng trong 30 phút trước khi thu mẫu
3. Lấy tăm bông, chà nhẹ vào má trong 10-15 giây
4. Cho tăm bông vào ống đựng mẫu và đậy chặt
5. Ghi tên ${name} lên nhãn
6. Bảo quản ở nhiệt độ phòng, tránh ánh sáng trực tiếp
7. Gửi về phòng lab trong vòng 7 ngày`;
    } else {
      return `Hướng dẫn thu mẫu tại cơ sở cho ${name}:
1. Đến đúng giờ hẹn đã đặt
2. Mang theo CMND/CCCD và giấy tờ liên quan
3. Nhân viên sẽ hướng dẫn và hỗ trợ thu mẫu
4. Mẫu sẽ được xử lý ngay tại phòng lab`;
    }
  }

  // ✅ OPTIMIZED: Payment processing
  async processPayment(
    orderId: string,
    paymentData: {
      method: "cash" | "card" | "transfer";
      amount: number;
    }
  ): Promise<{ success: boolean; transactionId?: string; message: string }> {
    console.log("💳 Processing payment...");
    const startTime = Date.now();

    const messages = {
      transfer: `Vui lòng chuyển khoản ${new Intl.NumberFormat("vi-VN").format(
        paymentData.amount
      )}đ vào:\n\n🏦 Ngân hàng: Vietcombank\n💳 STK: 1234567890\n👤 Chủ TK: VIET GENE LAB\n📝 Nội dung: ORDER${orderId.slice(
        -6
      )}`,
      cash: "Thanh toán tiền mặt khi nhận dịch vụ. Nhân viên sẽ liên hệ xác nhận thời gian.",
      card: "Thanh toán thẻ tín dụng đang được xử lý. Bạn sẽ nhận được thông báo qua email.",
    };

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update order payment info (fire and forget for speed)
    const updatePayload = {
      payment_method: paymentData.method,
      payment_status: paymentData.method === "cash" ? "pending" : "paid",
      total_amount: paymentData.amount,
    };

    console.log("📤 Updating order payment info:", updatePayload);
    apiClient
      .put(`/orders/${orderId}`, updatePayload)
      .catch((error) =>
        console.warn("⚠️ Could not update order payment info:", error)
      );

    console.log(
      `✅ Payment processing completed in ${Date.now() - startTime}ms`
    );

    return {
      success: true,
      transactionId: "TXN_" + Date.now(),
      message: messages[paymentData.method],
    };
  }

  // ✅ SUPER OPTIMIZED: Complete order creation with parallel processing
  async createCompleteOrder(orderData: CreateOrderRequest): Promise<string> {
    console.log("🚀 Starting OPTIMIZED complete order creation flow...");
    const overallStartTime = Date.now();

    try {
      // Step 1: Handle user registration
      console.log("👤 Step 1: Handling user...");
      const userId = await this.handleUserRegistration(orderData.customerInfo);

      // Step 2: Create main order
      console.log("📦 Step 2: Creating order...");
      const orderResult = await this.createOrder({
        customerId: userId,
        serviceId: orderData.serviceInfo.serviceId,
        quantity: orderData.serviceInfo.quantity,
        collectionMethod: orderData.serviceInfo.collectionMethod,
        notes: orderData.serviceInfo.notes,
      });
      const orderId = orderResult.orderId;

      // ✅ OPTIMIZED: Steps 3-7 run in parallel where possible
      console.log("🚀 Steps 3-7: Parallel processing...");

      const results = await Promise.allSettled([
        // Step 3: Add order details
        this.createOrderDetail(orderId, orderData.serviceInfo.serviceId, {
          quantity: orderData.serviceInfo.quantity,
          unitPrice: 2500000,
          notes: orderData.serviceInfo.notes,
        }),

        // Step 4: Add participants (parallel internally)
        this.addOrderParticipants(
          orderId,
          orderData.participantInfo.participants.map((p) => ({
            participantName: p.name,
            relationship: p.relationship,
            age: parseInt(p.age),
            notes: "",
          }))
        ),

        // Step 5: Create appointment (if needed)
        orderData.serviceInfo.collectionMethod === "facility" &&
        orderData.serviceInfo.appointmentDate &&
        orderData.serviceInfo.doctorId &&
        orderData.serviceInfo.timeSlotId
          ? this.createAppointment(orderId, {
              appointmentDate: orderData.serviceInfo.appointmentDate,
              appointmentTime: orderData.serviceInfo.appointmentTime || "09:00",
              doctorId: orderData.serviceInfo.doctorId,
              timeSlotId: orderData.serviceInfo.timeSlotId,
              notes: orderData.serviceInfo.notes,
            })
          : Promise.resolve(null),

        // Step 6: Process payment
        this.processPayment(orderId, {
          method: orderData.paymentInfo.method,
          amount: 2500000 * orderData.serviceInfo.quantity,
        }),
      ]);

      // Check results
      const [
        orderDetailResult,
        participantsResult,
        appointmentResult,
        paymentResult,
      ] = results;

      if (orderDetailResult.status === "fulfilled") {
        console.log("✅ Order details created");
      } else {
        console.warn("⚠️ Order details failed:", orderDetailResult.reason);
      }

      if (participantsResult.status === "fulfilled") {
        console.log("✅ Participants added");
      } else {
        console.warn("⚠️ Participants failed:", participantsResult.reason);
      }

      if (appointmentResult.status === "fulfilled" && appointmentResult.value) {
        console.log("✅ Appointment created");
      } else if (orderData.serviceInfo.collectionMethod === "facility") {
        console.warn("⚠️ Appointment failed:", appointmentResult);
      }

      if (paymentResult.status === "fulfilled") {
        console.log("✅ Payment processed");
      } else {
        console.warn("⚠️ Payment failed:", paymentResult.reason);
      }

      // ✅ Step 7: Create sample kits (after order is established)
      console.log("📦 Step 7: Creating sample kits...");
      try {
        const sampleKits = await this.createSampleKitsForOrder(
          orderId,
          orderData.participantInfo.participants,
          orderData.customerInfo.address,
          orderData.serviceInfo.collectionMethod
        );
        console.log(`✅ ${sampleKits.length} sample kits created`);
      } catch (error) {
        console.warn("⚠️ Sample kits creation failed:", error);
      }

      const totalTime = Date.now() - overallStartTime;
      console.log(`🎉 Order creation completed in ${totalTime}ms!`);

      return orderId;
    } catch (error: any) {
      const totalTime = Date.now() - overallStartTime;
      console.error(`❌ Order creation failed after ${totalTime}ms:`, error);
      throw new Error(
        "Có lỗi xảy ra khi tạo đơn hàng: " +
          (error.message || "Vui lòng thử lại sau")
      );
    }
  }

  // ✅ OPTIMIZED: Get order data with parallel fetching
  async getCompleteOrderData(orderId: string): Promise<any> {
    try {
      console.log("🔍 Fetching complete order data for:", orderId);
      const startTime = Date.now();

      // ✅ OPTIMIZED: Fetch all data in parallel
      const [
        orderResponse,
        orderDetailsResponse,
        participantsResponse,
        appointmentsResponse,
        sampleKitsResponse,
      ] = await Promise.allSettled([
        apiClient.get(`/orders/${orderId}`),
        apiClient.get(`/order-details/${orderId}/all`),
        apiClient.get(`/OrderParticipants/order/${orderId}`),
        apiClient.get(`/appointment/all`),
        apiClient.get(`/sample-kits/order/${orderId}`), // V9: Direct endpoint
      ]);

      // Process results
      let order = null;
      let orderDetails = [];
      let participants = [];
      let appointment = null;
      let sampleKits = [];
      let samples = [];

      // Process Order
      if (
        orderResponse.status === "fulfilled" &&
        orderResponse.value.data.code === 200
      ) {
        order = orderResponse.value.data.result;
        console.log("✅ Order loaded");
      } else {
        throw new Error("Order not found");
      }

      // Process Order Details
      if (
        orderDetailsResponse.status === "fulfilled" &&
        orderDetailsResponse.value.data.code === 200
      ) {
        orderDetails = orderDetailsResponse.value.data.result || [];
        console.log("✅ Order details loaded:", orderDetails.length);
      }

      // Process Participants
      if (
        participantsResponse.status === "fulfilled" &&
        participantsResponse.value.data.code === 200
      ) {
        participants = participantsResponse.value.data.result || [];
        console.log("✅ Participants loaded:", participants.length);
      }

      // Process Appointments
      if (
        appointmentsResponse.status === "fulfilled" &&
        appointmentsResponse.value.data.code === 200
      ) {
        const allAppointments = appointmentsResponse.value.data.result || [];
        appointment = allAppointments.find(
          (app: any) => app.orderId === orderId
        );
        console.log("✅ Appointment found:", !!appointment);
      }

      // Process Sample Kits (V9)
      if (
        sampleKitsResponse.status === "fulfilled" &&
        sampleKitsResponse.value.data.code === 200
      ) {
        sampleKits = sampleKitsResponse.value.data.result || [];
        console.log("✅ Sample kits loaded:", sampleKits.length);

        // ✅ OPTIMIZED: Fetch samples for kits in parallel
        if (sampleKits.length > 0) {
          const samplePromises = sampleKits.map(async (kit: SampleKit) => {
            if (kit.samplesId && kit.samplesId !== "pending") {
              try {
                const sampleResponse = await apiClient.get(
                  `/samples/${kit.samplesId}`
                );
                if (sampleResponse.data.code === 200) {
                  return sampleResponse.data.result;
                }
              } catch (error) {
                console.warn(
                  `⚠️ Could not fetch sample for kit ${kit.id}:`,
                  error
                );
              }
            }
            return null;
          });

          const sampleResults = await Promise.allSettled(samplePromises);
          samples = sampleResults
            .filter((result) => result.status === "fulfilled" && result.value)
            .map((result) => (result as PromiseFulfilledResult<Sample>).value);

          console.log("✅ Samples loaded:", samples.length);
        }
      }

      const totalTime = Date.now() - startTime;
      console.log(`✅ Complete order data assembled in ${totalTime}ms`);

      return {
        ...order,
        orderDetails,
        participants,
        appointment,
        sampleKits,
        samples,
      };
    } catch (error: any) {
      console.error("❌ Error fetching order data:", error);
      throw new Error(
        "Không thể tải thông tin đơn hàng: " +
          (error.response?.data?.message || error.message)
      );
    }
  }

  // ✅ OPTIMIZED: Get user orders with better performance
  async getUserOrders(userId?: string): Promise<any[]> {
    try {
      const startTime = Date.now();
      console.log("🔍 Fetching user orders...");

      let ordersData = [];

      if (userId) {
        console.log("🔍 Fetching orders for user:", userId);
        const response = await apiClient.get(`/orders/user/${userId}`);
        ordersData = response.data.result || [];
      } else {
        console.log("🔍 Fetching all orders for current user");
        const response = await apiClient.get(`/orders/all`);
        ordersData = response.data.result || [];
      }

      if (ordersData.length > 0) {
        const totalTime = Date.now() - startTime;
        console.log(`✅ Orders loaded in ${totalTime}ms:`, ordersData.length);

        // ✅ OPTIMIZED: Sort by most recent first
        const sortedOrders = ordersData.sort((a: any, b: any) => {
          const dateA = new Date(
            a.createdAt || a.created_at || a.createddate || 0
          );
          const dateB = new Date(
            b.createdAt || b.created_at || b.createddate || 0
          );
          return dateB.getTime() - dateA.getTime();
        });

        return sortedOrders;
      }

      return [];
    } catch (error: any) {
      console.error(
        "❌ Error fetching user orders:",
        error.response?.data || error.message
      );
      return [];
    }
  }

  // ✅ V9 OPTIMIZED: Sample Kit methods
  async getSampleKitsByOrderId(orderId: string): Promise<SampleKit[]> {
    try {
      console.log("🔍 Fetching sample kits for order:", orderId);
      const startTime = Date.now();

      // V9: Direct endpoint for kits by order
      const response = await apiClient.get(`/sample-kits/order/${orderId}`);

      if (response.data.code === 200) {
        const kits = response.data.result || [];
        const totalTime = Date.now() - startTime;
        console.log(`✅ Sample kits loaded in ${totalTime}ms:`, kits.length);
        return kits;
      }

      return [];
    } catch (error: any) {
      console.error(
        "❌ Sample kits API failed:",
        error.response?.data || error.message
      );
      return [];
    }
  }

  async updateSampleKitStatus(
    kitId: string,
    status: string,
    updateData?: Partial<SampleKit>
  ): Promise<SampleKit | null> {
    try {
      console.log("🔄 Updating sample kit status:", kitId, status);
      const startTime = Date.now();

      const response = await apiClient.put(`/sample-kits/${kitId}`, {
        status,
        ...updateData,
      });

      if (response.data.code === 200) {
        const totalTime = Date.now() - startTime;
        console.log(`✅ Sample kit updated in ${totalTime}ms`);
        return response.data.result;
      }

      return null;
    } catch (error: any) {
      console.error(
        "❌ Error updating sample kit:",
        error.response?.data || error.message
      );
      return null;
    }
  }

  // ✅ V9 OPTIMIZED: Sample methods
  async getSamplesByUserId(userId?: string): Promise<Sample[]> {
    try {
      const targetUserId = userId || this.getCurrentUserId();
      console.log("🔍 Fetching samples for user:", targetUserId);
      const startTime = Date.now();

      const response = await apiClient.get(`/samples/user/${targetUserId}`);

      if (response.data.code === 200) {
        const samples = response.data.result || [];
        const totalTime = Date.now() - startTime;
        console.log(`✅ Samples loaded in ${totalTime}ms:`, samples.length);
        return samples;
      }

      return [];
    } catch (error: any) {
      console.error(
        "❌ Samples API failed:",
        error.response?.data || error.message
      );
      return [];
    }
  }

  async updateSampleStatus(
    sampleId: string,
    status: string,
    updateData?: Partial<Sample>
  ): Promise<Sample | null> {
    try {
      console.log("🔄 Updating sample status:", sampleId, status);
      const startTime = Date.now();

      const response = await apiClient.put(`/samples/${sampleId}`, {
        status,
        ...updateData,
      });

      if (response.data.code === 200) {
        const totalTime = Date.now() - startTime;
        console.log(`✅ Sample updated in ${totalTime}ms`);
        return response.data.result;
      }

      return null;
    } catch (error: any) {
      console.error(
        "❌ Error updating sample:",
        error.response?.data || error.message
      );
      return null;
    }
  }

  // ✅ OPTIMIZED: Appointment methods
  async getAllAppointments(): Promise<any[]> {
    try {
      console.log("🔍 Fetching all appointments...");
      const startTime = Date.now();

      const response = await apiClient.get("/appointment/all");

      if (response.data.code === 200) {
        const appointments = response.data.result || [];
        const totalTime = Date.now() - startTime;
        console.log(
          `✅ All appointments loaded in ${totalTime}ms:`,
          appointments.length
        );
        return appointments;
      }

      return [];
    } catch (error: any) {
      console.error(
        "❌ Error fetching all appointments:",
        error.response?.data || error.message
      );
      throw new Error("Không thể tải danh sách lịch hẹn");
    }
  }

  async getUserAppointments(): Promise<any[]> {
    try {
      console.log("🔍 Fetching user appointments...");
      const startTime = Date.now();

      const response = await apiClient.get("/appointment/user/all");

      if (response.data.code === 200) {
        const appointments = response.data.result || [];
        const totalTime = Date.now() - startTime;
        console.log(
          `✅ User appointments loaded in ${totalTime}ms:`,
          appointments.length
        );
        return appointments;
      }

      return [];
    } catch (error: any) {
      console.error(
        "❌ Error fetching user appointments:",
        error.response?.data || error.message
      );
      throw new Error("Không thể tải lịch hẹn của bạn");
    }
  }

  async getAppointmentsByOrderId(orderId: string): Promise<any[]> {
    try {
      console.log("🔍 Fetching appointments for order:", orderId);

      // Try user appointments first (faster)
      const userAppointments = await this.getUserAppointments();
      const orderAppointments = userAppointments.filter(
        (app: any) => app.orderId === orderId
      );

      if (orderAppointments.length > 0) {
        console.log(
          `✅ Found ${orderAppointments.length} appointments for order ${orderId}`
        );
        return orderAppointments;
      }

      // Fallback to all appointments if needed
      const allAppointments = await this.getAllAppointments();
      const fallbackAppointments = allAppointments.filter(
        (app: any) => app.orderId === orderId
      );

      console.log(
        `✅ Found ${fallbackAppointments.length} appointments for order ${orderId} (fallback)`
      );
      return fallbackAppointments;
    } catch (error) {
      console.error("❌ Could not fetch appointments for order:", error);
      return [];
    }
  }

  // ✅ OPTIMIZED: Progress calculation with caching
  private progressCache = new Map<
    string,
    { result: number; timestamp: number }
  >();

  calculateOrderProgress(
    order: any,
    sampleKits: any[] = [],
    samples: any[] = [],
    appointment: any = null
  ): number {
    const cacheKey = `${order.id || order.orderId}_${order.status}_${
      sampleKits.length
    }_${samples.length}_${!!appointment}`;
    const cached = this.progressCache.get(cacheKey);

    // Use cache if less than 30 seconds old
    if (cached && Date.now() - cached.timestamp < 30000) {
      return cached.result;
    }

    console.log(
      "🔢 Calculating order progress for:",
      order.id || order.orderId
    );

    // Base progress from order status
    const statusInfo = this.getOrderStatusInfo(order.status);
    let baseProgress = statusInfo.progress;

    console.log(
      `📊 Base progress from status "${order.status}": ${baseProgress}%`
    );

    // Factor in sample kit progress
    let kitProgress = 0;
    if (sampleKits && sampleKits.length > 0) {
      const kitStatusMap: Record<string, number> = {
        ordered: 25,
        preparing: 30,
        shipped: 45,
        delivered: 55,
        ready: 50,
        expired: 0,
      };

      kitProgress =
        sampleKits.reduce((acc, kit) => {
          const progress = kitStatusMap[kit.status] || 0;
          return acc + progress;
        }, 0) / sampleKits.length;

      console.log(`📦 Average kit progress: ${kitProgress}%`);
    }

    // Factor in actual sample progress
    let sampleProgress = 0;
    if (samples && samples.length > 0) {
      const sampleStatusMap: Record<string, number> = {
        pending: 10,
        collected: 60,
        shipped: 70,
        received: 75,
        analyzing: 85,
        completed: 95,
        failed: 0,
      };

      sampleProgress =
        samples.reduce((acc, sample) => {
          const progress = sampleStatusMap[sample.status] || 0;
          return acc + progress;
        }, 0) / samples.length;

      console.log(`🧪 Average sample progress: ${sampleProgress}%`);
    }

    // Factor in appointment progress (for facility collection)
    let appointmentProgress = 0;
    if (appointment) {
      if (appointment.status === true || appointment.status === "confirmed") {
        appointmentProgress = 40;
      } else if (appointment.status === "completed") {
        appointmentProgress = 70;
      } else {
        appointmentProgress = 20;
      }
      console.log(`📅 Appointment progress: ${appointmentProgress}%`);
    }

    // Return the highest progress value (most advanced stage)
    const finalProgress = Math.max(
      baseProgress,
      kitProgress,
      sampleProgress,
      appointmentProgress
    );
    const result = Math.min(100, Math.max(0, finalProgress));

    // Cache result
    this.progressCache.set(cacheKey, { result, timestamp: Date.now() });

    console.log(`🎯 Final calculated progress: ${result}%`);
    return result;
  }

  // ✅ Helper methods for status info
  getOrderStatusInfo(status: string) {
    const statusMap: Record<string, any> = {
      pending: {
        label: "Chờ xử lý",
        color: "bg-yellow-100 text-yellow-800",
        icon: "Clock",
        description: "Đơn hàng đang được xử lý",
        progress: 10,
      },
      confirmed: {
        label: "Đã xác nhận",
        color: "bg-blue-100 text-blue-800",
        icon: "CheckCircle",
        description: "Đơn hàng đã được xác nhận",
        progress: 25,
      },
      kit_preparing: {
        label: "Chuẩn bị kit",
        color: "bg-purple-100 text-purple-800",
        icon: "Package",
        description: "Đang chuẩn bị bộ kit xét nghiệm",
        progress: 35,
      },
      kit_sent: {
        label: "Đã gửi kit",
        color: "bg-indigo-100 text-indigo-800",
        icon: "Truck",
        description: "Kit đã được gửi đến địa chỉ của bạn",
        progress: 50,
      },
      sample_collected: {
        label: "Đã thu mẫu",
        color: "bg-cyan-100 text-cyan-800",
        icon: "TestTube",
        description: "Mẫu đã được thu thập",
        progress: 65,
      },
      sample_received: {
        label: "Đã nhận mẫu",
        color: "bg-teal-100 text-teal-800",
        icon: "CheckCircle",
        description: "Phòng lab đã nhận được mẫu",
        progress: 75,
      },
      processing: {
        label: "Đang xử lý",
        color: "bg-orange-100 text-orange-800",
        icon: "RefreshCw",
        description: "Đang tiến hành xét nghiệm",
        progress: 85,
      },
      completed: {
        label: "Hoàn thành",
        color: "bg-green-100 text-green-800",
        icon: "CheckCircle",
        description: "Xét nghiệm hoàn thành, kết quả đã sẵn sàng",
        progress: 100,
      },
      cancelled: {
        label: "Đã hủy",
        color: "bg-red-100 text-red-800",
        icon: "AlertCircle",
        description: "Đơn hàng đã bị hủy",
        progress: 0,
      },
    };
    return statusMap[status] || statusMap.pending;
  }

  getKitStatusInfo(status: string) {
    const statusMap: Record<string, any> = {
      ordered: {
        label: "Đã đặt hàng",
        color: "bg-blue-100 text-blue-800",
        icon: "ShoppingCart",
        description: "Kit đã được đặt hàng",
      },
      preparing: {
        label: "Đang chuẩn bị",
        color: "bg-yellow-100 text-yellow-800",
        icon: "Package",
        description: "Kit đang được chuẩn bị",
      },
      shipped: {
        label: "Đã gửi",
        color: "bg-blue-100 text-blue-800",
        icon: "Truck",
        description: "Kit đã được gửi đi",
      },
      delivered: {
        label: "Đã giao",
        color: "bg-green-100 text-green-800",
        icon: "CheckCircle",
        description: "Kit đã được giao thành công",
      },
      expired: {
        label: "Hết hạn",
        color: "bg-red-100 text-red-800",
        icon: "AlertCircle",
        description: "Kit đã hết hạn sử dụng",
      },
      ready: {
        label: "Sẵn sàng",
        color: "bg-green-100 text-green-800",
        icon: "CheckCircle",
        description: "Kit sẵn sàng để sử dụng",
      },
    };
    return statusMap[status] || statusMap.preparing;
  }

  getSampleStatusInfo(status: string) {
    const statusMap: Record<string, any> = {
      pending: {
        label: "Chờ xử lý",
        color: "bg-yellow-100 text-yellow-800",
        icon: "Clock",
        description: "Đang chờ xử lý",
      },
      collected: {
        label: "Đã thu mẫu",
        color: "bg-blue-100 text-blue-800",
        icon: "TestTube",
        description: "Mẫu đã được thu thập",
      },
      shipped: {
        label: "Đang vận chuyển",
        color: "bg-purple-100 text-purple-800",
        icon: "Truck",
        description: "Mẫu đang được vận chuyển về lab",
      },
      received: {
        label: "Đã nhận",
        color: "bg-indigo-100 text-indigo-800",
        icon: "Building",
        description: "Lab đã nhận được mẫu",
      },
      analyzing: {
        label: "Đang phân tích",
        color: "bg-orange-100 text-orange-800",
        icon: "Microscope",
        description: "Mẫu đang được phân tích",
      },
      completed: {
        label: "Hoàn thành",
        color: "bg-green-100 text-green-800",
        icon: "CheckCircle",
        description: "Phân tích hoàn thành",
      },
      failed: {
        label: "Thất bại",
        color: "bg-red-100 text-red-800",
        icon: "AlertCircle",
        description: "Mẫu không đạt chất lượng",
      },
    };
    return statusMap[status] || statusMap.pending;
  }

  // ✅ Clear cache when needed
  clearProgressCache(): void {
    this.progressCache.clear();
    console.log("🗑️ Progress cache cleared");
  }

  // ✅ Get cache stats for debugging
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.progressCache.size,
      keys: Array.from(this.progressCache.keys()),
    };
  }
}

export const orderService = new OrderService();
