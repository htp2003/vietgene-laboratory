import axios from "axios";

const API_BASE_URL = "https://dna-service-se1857.onrender.com/dna_service";

// ✅ API Client setup
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ✅ Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method?.toLowerCase() === "get") {
      config.headers = {
        ...(token && { Authorization: `Bearer ${token}` }),
        Accept: "application/json",
      };
      delete config.headers["Content-Type"];
    }

    console.log(
      `🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor with retry
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    const config = error.config;
    if (!config.__retryCount) config.__retryCount = 0;

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

// ✅ INTERFACES
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
  collection_date?: string;
  received_date?: string;
  status: string;
  shipping_tracking?: string;
  notes?: string;
  sample_quality?: string;
  userId: string;
  sampleKitsId: string;
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
  order_participants_id: string;
  samplesId: string;
  userId: string;
  orderId: string;
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
      return user.id || "guest_user_" + Date.now();
    } catch {
      return "guest_user_" + Date.now();
    }
  }

  private async handleUserRegistration(userData: {
    fullName: string;
    phone: string;
    email: string;
  }): Promise<string> {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

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

  // ===== DOCTOR METHODS =====
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      console.log("🔍 Fetching doctors...");
      const response = await apiClient.get("/doctors");

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

  // ===== MAIN ORDER FLOW =====
  async createOrder(orderData: {
    customerId: string;
    serviceId: string;
    quantity: number;
    collectionMethod: "home" | "facility";
    notes?: string;
  }): Promise<{ orderId: string }> {
    try {
      console.log("📦 Creating order...");
      const now = new Date().toISOString();

      const orderPayload = {
        order_code: Math.floor(Math.random() * 900000) + 100000,
        status: "pending",
        total_amount: 2500000 * orderData.quantity,
        collection_method: orderData.collectionMethod,
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
      console.log("📋 Creating order detail...");

      const payload = {
        quantity: orderDetailData.quantity,
        unit_price: orderDetailData.unitPrice,
        subtotal: orderDetailData.quantity * orderDetailData.unitPrice,
        note: orderDetailData.notes || "",
      };

      const response = await apiClient.post(
        `/order-details/${orderId}/${serviceId}`,
        payload
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
      console.log("👥 Adding participants:", participants.length);

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

  // ✅ SIMPLIFIED SAMPLE KIT CREATION - SINGLE STRATEGY
  async createSampleKitsForOrder(
    orderId: string,
    participantIds: string[],
    participants: Array<{ name: string; relationship: string; age: string }>,
    shippingAddress: string,
    collectionMethod: "home" | "facility" = "home"
  ): Promise<SampleKit[]> {
    console.log("📦 Creating sample kits (simplified strategy)...");
    const createdKits: SampleKit[] = [];

    for (let i = 0; i < participantIds.length; i++) {
      const participantId = participantIds[i];
      const participant = participants[i];

      try {
        console.log(
          `📦 Creating kit ${i + 1}/${participantIds.length} for: ${
            participant.name
          }`
        );

        // ✅ SIMPLE, RELIABLE PAYLOAD
        const payload = {
          kit_code: `KIT_${participant.name.replace(
            /\s+/g,
            "_"
          )}_${Date.now()}_${i}`,
          kit_type: "Hair",
          status: "ordered",
          shipping_address: shippingAddress,
          instruction: this.getKitInstructions(
            collectionMethod,
            participant.name
          ),
          order_participants_id: participantId,
          orderId: orderId,
          // ✅ NO samplesId - staff will create samples later
        };

        console.log(`📤 Kit ${i + 1} payload:`, payload);

        const response = await apiClient.post("/sample-kits", payload);

        if (response.data.code === 200) {
          console.log(
            `✅ Kit ${i + 1} created successfully:`,
            response.data.result.id
          );
          createdKits.push(response.data.result);
        } else {
          console.warn(`⚠️ Kit ${i + 1} failed: ${response.data.message}`);
        }
      } catch (error: any) {
        console.error(
          `❌ Kit ${i + 1} error:`,
          error.response?.data || error.message
        );
        // ✅ CONTINUE WITH OTHERS - don't fail entire order
      }
    }

    console.log(
      `✅ Created ${createdKits.length}/${participantIds.length} sample kits`
    );
    return createdKits;
  }

  private getKitInstructions(
    collectionMethod: string,
    participantName?: string
  ): string {
    const name = participantName || "người tham gia";

    if (collectionMethod === "home") {
      return `Hướng dẫn thu mẫu tại nhà cho ${name}:
1. Rửa tay sạch sẽ trước khi thu mẫu
2. Không ăn uống, đánh răng trong 30 phút trước
3. Lấy tăm bông, chà nhẹ vào má trong 10-15 giây
4. Cho tăm bông vào ống đựng mẫu và đậy chặt
5. Ghi tên ${name} lên nhãn
6. Bảo quản ở nhiệt độ phòng, tránh ánh sáng
7. Gửi về phòng lab trong vòng 7 ngày`;
    } else {
      return `Hướng dẫn thu mẫu tại cơ sở cho ${name}:
1. Đến đúng giờ hẹn đã đặt
2. Mang theo CMND/CCCD và giấy tờ liên quan
3. Nhân viên sẽ hướng dẫn và hỗ trợ thu mẫu
4. Mẫu sẽ được xử lý ngay tại phòng lab`;
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
      console.log("📅 Creating appointment...");

      const payload = {
        appointment_date: appointmentData.appointmentDate + "T03:24:55.300Z",
        appointment_type: "Gặp để tư vấn",
        status: true,
        notes: appointmentData.notes || "không có",
        doctor_time_slot: appointmentData.timeSlotId,
      };

      const response = await apiClient.post(`/appointment/${orderId}`, payload);

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

  async processPayment(
    orderId: string,
    paymentData: {
      method: "cash" | "card" | "transfer";
      amount: number;
    }
  ): Promise<{ success: boolean; transactionId?: string; message: string }> {
    console.log("💳 Processing payment...");

    const messages = {
      transfer: `Vui lòng chuyển khoản ${new Intl.NumberFormat("vi-VN").format(
        paymentData.amount
      )}đ vào:\n\n🏦 Ngân hàng: Vietcombank\n💳 STK: 1234567890\n👤 Chủ TK: VIET GENE LAB\n📝 Nội dung: ORDER${orderId.slice(
        -6
      )}`,
      cash: "Thanh toán tiền mặt khi nhận dịch vụ. Nhân viên sẽ liên hệ xác nhận thời gian.",
      card: "Thanh toán thẻ tín dụng đang được xử lý. Bạn sẽ nhận được thông báo qua email.",
    };

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update order payment info
    const updatePayload = {
      payment_method: paymentData.method,
      payment_status: paymentData.method === "cash" ? "pending" : "paid",
      total_amount: paymentData.amount,
    };

    apiClient
      .put(`/orders/${orderId}`, updatePayload)
      .catch((error) =>
        console.warn("⚠️ Could not update order payment info:", error)
      );

    return {
      success: true,
      transactionId: "TXN_" + Date.now(),
      message: messages[paymentData.method],
    };
  }

  // ===== 🎯 MAIN COMPLETE ORDER FLOW - FIXED & SIMPLIFIED =====
  async createCompleteOrder(orderData: CreateOrderRequest): Promise<string> {
    console.log("🚀 Starting complete order creation flow...");
    const overallStartTime = Date.now();
    let orderId: string | null = null;

    try {
      // ✅ STEP 1: Handle user (CRITICAL - must succeed)
      console.log("👤 Step 1: Handling user...");
      const userId = await this.handleUserRegistration(orderData.customerInfo);

      // ✅ STEP 2: Create main order (CRITICAL - must succeed)
      console.log("📦 Step 2: Creating order...");
      const orderResult = await this.createOrder({
        customerId: userId,
        serviceId: orderData.serviceInfo.serviceId,
        quantity: orderData.serviceInfo.quantity,
        collectionMethod: orderData.serviceInfo.collectionMethod,
        notes: orderData.serviceInfo.notes,
      });
      orderId = orderResult.orderId;

      // ✅ STEP 3-6: Parallel processing (NON-CRITICAL - can partially fail)
      console.log("🚀 Steps 3-6: Parallel processing...");

      const parallelTasks = [
        // Step 3: Add order details
        this.createOrderDetail(orderId, orderData.serviceInfo.serviceId, {
          quantity: orderData.serviceInfo.quantity,
          unitPrice: 2500000,
          notes: orderData.serviceInfo.notes,
        }),

        // Step 4: Add participants
        this.addOrderParticipants(
          orderId,
          orderData.participantInfo.participants.map((p) => ({
            participantName: p.name,
            relationship: p.relationship,
            age: parseInt(p.age),
            notes: "",
          }))
        ),

        // Step 5: Process payment
        this.processPayment(orderId, {
          method: orderData.paymentInfo.method,
          amount: 2500000 * orderData.serviceInfo.quantity,
        }),
      ];

      // ✅ Only add appointment if collection_method is "facility"
      if (
        orderData.serviceInfo.collectionMethod === "facility" &&
        orderData.serviceInfo.appointmentDate &&
        orderData.serviceInfo.doctorId &&
        orderData.serviceInfo.timeSlotId
      ) {
        console.log("📅 Adding appointment task (facility collection)");
        parallelTasks.push(
          this.createAppointment(orderId, {
            appointmentDate: orderData.serviceInfo.appointmentDate,
            appointmentTime: orderData.serviceInfo.appointmentTime || "09:00",
            doctorId: orderData.serviceInfo.doctorId,
            timeSlotId: orderData.serviceInfo.timeSlotId,
            notes: orderData.serviceInfo.notes,
          })
        );
      } else {
        console.log("🏠 Skipping appointment (home collection)");
      }

      const results = await Promise.allSettled(parallelTasks);

      // ✅ Check results but don't fail order
      const [
        orderDetailResult,
        participantsResult,
        paymentResult,
        appointmentResult,
      ] = results;

      if (orderDetailResult.status === "fulfilled") {
        console.log("✅ Order details created");
      } else {
        console.warn("⚠️ Order details failed:", orderDetailResult.reason);
      }

      let participantIds: string[] = [];
      if (participantsResult.status === "fulfilled") {
        participantIds = participantsResult.value.participantIds;
        console.log("✅ Participants added:", participantIds.length);
      } else {
        console.warn("⚠️ Participants failed:", participantsResult.reason);
        // ✅ Continue anyway - order can exist without participants in system
      }

      if (paymentResult.status === "fulfilled") {
        console.log("✅ Payment processed");
      } else {
        console.warn("⚠️ Payment failed:", paymentResult.reason);
      }

      if (orderData.serviceInfo.collectionMethod === "facility") {
        if (appointmentResult && appointmentResult.status === "fulfilled") {
          console.log("✅ Appointment created");
        } else {
          console.warn("⚠️ Appointment failed:", appointmentResult?.reason);
        }
      }

      // ✅ STEP 7: Create sample kits (NON-CRITICAL)
      console.log(
        "📦 Step 7: Creating sample kits (staff will create samples later)..."
      );
      let sampleKits: SampleKit[] = [];

      if (participantIds.length > 0) {
        try {
          sampleKits = await this.createSampleKitsForOrder(
            orderId,
            participantIds,
            orderData.participantInfo.participants,
            orderData.customerInfo.address,
            orderData.serviceInfo.collectionMethod
          );
          console.log(
            `✅ ${sampleKits.length} sample kits created (samples will be created by staff)`
          );
        } catch (error) {
          console.warn(
            "⚠️ Sample kits creation failed - staff will create manually:",
            error
          );
          // ✅ Order still succeeds
        }
      } else {
        console.warn("⚠️ No participants - staff will create kits manually");
      }

      const totalTime = Date.now() - overallStartTime;
      console.log(`🎉 Order creation completed in ${totalTime}ms!`);
      console.log(
        `📊 Summary: Order ${orderId} created with ${participantIds.length} participants and ${sampleKits.length} sample kits`
      );
      console.log(`👨‍⚕️ Next: Staff will create samples based on sample kit IDs`);

      return orderId;
    } catch (error: any) {
      const totalTime = Date.now() - overallStartTime;
      console.error(`❌ Order creation failed after ${totalTime}ms:`, error);

      if (orderId) {
        console.warn(
          `⚠️ Order ${orderId} created but some steps failed - staff can complete manually`
        );
        return orderId; // ✅ Partial success
      }

      throw new Error(
        "Có lỗi xảy ra khi tạo đơn hàng: " +
          (error.message || "Vui lòng thử lại sau")
      );
    }
  }

  // ===== 🔧 SOLUTION 2: FIXED getSamplesByKitId with multiple strategies =====
  async getSamplesByKitId(kitId: string): Promise<Sample[]> {
    try {
      console.log("🔍 Getting samples for kit:", kitId);

      // ✅ Strategy 1: Try direct kit endpoint (V12)
      try {
        const response = await apiClient.get(`/samples/samplekits/${kitId}`);
        if (response.data.code === 200) {
          const samples = response.data.result || [];
          console.log(
            `✅ Strategy 1 success: Found ${samples.length} samples via direct endpoint`
          );
          return samples;
        }
      } catch (error) {
        console.warn("⚠️ Kit endpoint failed, trying alternatives...");
      }

      // ✅ Strategy 2: Get all samples and filter (if you have permission)
      try {
        const response = await apiClient.get("/samples");
        if (response.data.code === 200) {
          const allSamples = response.data.result || [];
          const filteredSamples = allSamples.filter(
            (sample: any) => sample.sampleKitsId === kitId
          );
          console.log(
            `✅ Strategy 2 success: Found ${filteredSamples.length} samples via filtering`
          );
          return filteredSamples;
        }
      } catch (error) {
        console.warn("⚠️ All samples endpoint failed");
      }

      // ✅ Strategy 3: Use order-based lookup
      try {
        // Get kit details first
        const kitResponse = await apiClient.get(`/sample-kits/${kitId}`);
        if (kitResponse.data.code === 200) {
          const kit = kitResponse.data.result;
          const orderId = kit.orderId;

          // Get all kits for this order
          const orderKitsResponse = await apiClient.get(
            `/sample-kits/order/${orderId}`
          );
          const orderKits = orderKitsResponse.data.result || [];

          // Get samples for each kit
          const samplePromises = orderKits.map(async (orderKit: any) => {
            if (orderKit.samplesId && orderKit.id === kitId) {
              try {
                const sampleResponse = await apiClient.get(
                  `/samples/${orderKit.samplesId}`
                );
                return sampleResponse.data.result;
              } catch {
                return null;
              }
            }
            return null;
          });

          const sampleResults = await Promise.allSettled(samplePromises);
          const foundSamples = sampleResults
            .filter((result) => result.status === "fulfilled" && result.value)
            .map((result) => (result as PromiseFulfilledResult<any>).value);

          console.log(
            `✅ Strategy 3 success: Found ${foundSamples.length} samples via order lookup`
          );
          return foundSamples;
        }
      } catch (error) {
        console.warn("⚠️ Order-based lookup failed");
      }

      console.log(
        `📝 No samples found for kit ${kitId} - this is normal if staff hasn't created them yet`
      );
      return []; // Return empty if all strategies fail
    } catch (error) {
      console.error("❌ Error getting samples for kit:", error);
      return [];
    }
  }

  // ===== ORDER DATA RETRIEVAL =====
  async getCompleteOrderData(orderId: string): Promise<any> {
    try {
      console.log("🔍 Fetching complete order data for:", orderId);
      const startTime = Date.now();

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
        apiClient.get(`/sample-kits/order/${orderId}`),
      ]);

      let order = null;
      let orderDetails = [];
      let participants = [];
      let appointment = null;
      let sampleKits = [];
      let samples = [];

      // Process responses
      if (
        orderResponse.status === "fulfilled" &&
        orderResponse.value.data.code === 200
      ) {
        order = orderResponse.value.data.result;
        console.log(
          "✅ Order loaded (collection_method:",
          order.collection_method || "not set",
          ")"
        );
      } else {
        throw new Error("Order not found");
      }

      if (
        orderDetailsResponse.status === "fulfilled" &&
        orderDetailsResponse.value.data.code === 200
      ) {
        orderDetails = orderDetailsResponse.value.data.result || [];
        console.log("✅ Order details loaded:", orderDetails.length);
      }

      if (
        participantsResponse.status === "fulfilled" &&
        participantsResponse.value.data.code === 200
      ) {
        participants = participantsResponse.value.data.result || [];
        console.log("✅ Participants loaded:", participants.length);
      }

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

      if (
        sampleKitsResponse.status === "fulfilled" &&
        sampleKitsResponse.value.data.code === 200
      ) {
        sampleKits = sampleKitsResponse.value.data.result || [];
        console.log("✅ Sample kits loaded:", sampleKits.length);

        // ✅ Get samples using fixed method
        if (sampleKits.length > 0) {
          console.log(
            "🧬 Fetching samples using fixed multi-strategy approach..."
          );

          const samplePromises = sampleKits.map(async (kit: SampleKit) => {
            try {
              console.log(
                `🔍 Getting samples for kit: ${kit.kit_code} (${kit.id})`
              );
              const kitSamples = await this.getSamplesByKitId(kit.id);
              console.log(
                `✅ Found ${kitSamples.length} samples for kit ${kit.kit_code}`
              );
              return kitSamples;
            } catch (error: any) {
              console.warn(
                `⚠️ Could not fetch samples for kit ${kit.id}:`,
                error.message
              );
              return [];
            }
          });

          const sampleResults = await Promise.allSettled(samplePromises);
          samples = sampleResults
            .filter((result) => result.status === "fulfilled")
            .flatMap(
              (result) => (result as PromiseFulfilledResult<any[]>).value
            );

          console.log(
            `✅ Total samples loaded: ${samples.length} for ${sampleKits.length} kits`
          );
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

  // ===== USER ORDERS & APPOINTMENTS =====
  async getUserOrders(userId?: string): Promise<any[]> {
    try {
      console.log("🔍 Fetching user orders...");
      let ordersData = [];

      if (userId) {
        const response = await apiClient.get(`/orders/user/${userId}`);
        ordersData = response.data.result || [];
      } else {
        const response = await apiClient.get(`/orders/all`);
        ordersData = response.data.result || [];
      }

      if (ordersData.length > 0) {
        console.log(`✅ Orders loaded:`, ordersData.length);
        return ordersData.sort((a: any, b: any) => {
          const dateA = new Date(
            a.createdAt || a.created_at || a.createddate || 0
          );
          const dateB = new Date(
            b.createdAt || b.created_at || b.createddate || 0
          );
          return dateB.getTime() - dateA.getTime();
        });
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

  async getAllAppointments(): Promise<any[]> {
    try {
      console.log("🔍 Fetching all appointments...");
      const response = await apiClient.get("/appointment/all");

      if (response.data.code === 200) {
        const appointments = response.data.result || [];
        console.log(`✅ All appointments loaded:`, appointments.length);
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
      const response = await apiClient.get("/appointment/user/all");

      if (response.data.code === 200) {
        const appointments = response.data.result || [];
        console.log(`✅ User appointments loaded:`, appointments.length);
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

  // ===== SAMPLE KIT & SAMPLE METHODS =====
  async getSampleKitsByOrderId(orderId: string): Promise<SampleKit[]> {
    try {
      console.log("🔍 Fetching sample kits for order:", orderId);
      const response = await apiClient.get(`/sample-kits/order/${orderId}`);

      if (response.data.code === 200) {
        const kits = response.data.result || [];
        console.log(`✅ Sample kits loaded:`, kits.length);
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

  async getSampleKitsByParticipantId(
    participantId: string
  ): Promise<SampleKit[]> {
    try {
      console.log("🔍 Fetching sample kits for participant:", participantId);
      const response = await apiClient.get(
        `/sample-kits/participants/${participantId}`
      );

      if (response.data.code === 200) {
        const kits = response.data.result || [];
        console.log(`✅ Participant kits loaded:`, kits.length);
        return kits;
      }

      return [];
    } catch (error: any) {
      console.error(
        "❌ Participant kits API failed:",
        error.response?.data || error.message
      );
      return [];
    }
  }

  async getSamplesByUserId(userId?: string): Promise<Sample[]> {
    try {
      const targetUserId = userId || this.getCurrentUserId();
      console.log("🔍 Fetching samples for user:", targetUserId);
      const response = await apiClient.get(`/samples/user/${targetUserId}`);

      if (response.data.code === 200) {
        const samples = response.data.result || [];
        console.log(`✅ User samples loaded:`, samples.length);
        return samples;
      }

      return [];
    } catch (error: any) {
      console.error(
        "❌ User samples API failed:",
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
      const response = await apiClient.put(`/sample-kits/${kitId}`, {
        status,
        ...updateData,
      });

      if (response.data.code === 200) {
        console.log(`✅ Sample kit updated`);
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

  async updateSampleStatus(
    sampleId: string,
    status: string,
    updateData?: Partial<Sample>
  ): Promise<Sample | null> {
    try {
      console.log("🔄 Updating sample status:", sampleId, status);
      const cleanSampleId = sampleId.replace(/[\[\]]/g, "");

      const response = await apiClient.put(`/samples/${cleanSampleId}`, {
        status,
        ...updateData,
      });

      if (response.data.code === 200) {
        console.log(`✅ Sample updated`);
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

  // ===== PROGRESS & STATUS HELPERS =====
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
      order.collection_method
    }_${sampleKits.length}_${samples.length}_${!!appointment}`;
    const cached = this.progressCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < 30000) {
      return cached.result;
    }

    const statusInfo = this.getOrderStatusInfo(order.status);
    let baseProgress = statusInfo.progress;

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
    }

    // Factor in sample progress
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
    }

    // Factor in appointment progress (only for facility collection)
    let appointmentProgress = 0;
    if (order.collection_method === "facility" && appointment) {
      if (appointment.status === true || appointment.status === "confirmed") {
        appointmentProgress = 40;
      } else if (appointment.status === "completed") {
        appointmentProgress = 70;
      } else {
        appointmentProgress = 20;
      }
    }

    const finalProgress = Math.max(
      baseProgress,
      kitProgress,
      sampleProgress,
      appointmentProgress
    );
    const result = Math.min(100, Math.max(0, finalProgress));

    this.progressCache.set(cacheKey, { result, timestamp: Date.now() });
    return result;
  }

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

  // ===== UTILITY METHODS =====
  clearProgressCache(): void {
    this.progressCache.clear();
    console.log("🗑️ Progress cache cleared");
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.progressCache.size,
      keys: Array.from(this.progressCache.keys()),
    };
  }

  // ===== STAFF WORKFLOW HELPER =====
  async getKitsForStaffProcessing(orderId: string): Promise<{
    order: any;
    participants: any[];
    sampleKits: SampleKit[];
  }> {
    try {
      console.log("👨‍⚕️ Getting kits for staff processing...");

      const [orderResponse, participantsResponse, kitsResponse] =
        await Promise.allSettled([
          apiClient.get(`/orders/${orderId}`),
          apiClient.get(`/OrderParticipants/order/${orderId}`),
          apiClient.get(`/sample-kits/order/${orderId}`),
        ]);

      let order = null;
      let participants = [];
      let sampleKits = [];

      if (orderResponse.status === "fulfilled") {
        order = orderResponse.value.data.result;
      }

      if (participantsResponse.status === "fulfilled") {
        participants = participantsResponse.value.data.result || [];
      }

      if (kitsResponse.status === "fulfilled") {
        sampleKits = kitsResponse.value.data.result || [];
      }

      // ✅ Log for staff
      console.log("📋 Staff Processing Summary:");
      console.log(`- Order: ${order?.order_code || orderId}`);
      console.log(
        `- Collection Method: ${order?.collection_method || "unknown"}`
      );
      console.log(`- Participants: ${participants.length}`);
      console.log(`- Kits to process: ${sampleKits.length}`);

      sampleKits.forEach((kit, index) => {
        const participant = participants[index];
        console.log(
          `  Kit ${index + 1}: ${kit.kit_code} → ${
            participant?.participant_name || "Unknown"
          } (${kit.status})`
        );
      });

      return { order, participants, sampleKits };
    } catch (error: any) {
      console.error("❌ Error getting staff processing data:", error);
      throw new Error("Không thể tải dữ liệu xử lý cho staff");
    }
  }
}

export const orderService = new OrderService();
