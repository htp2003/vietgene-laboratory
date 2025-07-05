import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderService } from "../services/orderService";

export const useOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // States
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("progress");

  // Fetch order detail on mount
  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id) {
        navigate("/dashboard");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("🔍 Fetching order detail for ID:", id);

        const completeOrderData = await orderService.getCompleteOrderData(id);
        console.log("📦 Complete order data received:", completeOrderData);

        setOrder(completeOrderData);
      } catch (err) {
        console.error("❌ Error fetching order detail:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải thông tin đơn hàng. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id, navigate]);

  // Get order data with fallback properties
  const getOrderData = (orderData: any) => {
    if (!orderData)
      return {
        orderCode: "",
        totalAmount: 0,
        paymentMethod: "",
        paymentStatus: "",
        paymentDate: "",
        transactionId: "",
        notes: "",
        createdAt: "",
        updatedAt: "",
        status: "pending",
      };

    return {
      orderCode:
        orderData.orderCode ||
        orderData.order_code ||
        `DNA-${(orderData.orderId || orderData.id || "").slice(-8)}`,
      totalAmount: orderData.totalAmount || orderData.total_amount || 0,
      paymentMethod: orderData.paymentMethod || orderData.payment_method || "",
      paymentStatus: orderData.paymentStatus || orderData.payment_status || "",
      paymentDate: orderData.paymentDate || orderData.payment_date,
      transactionId: orderData.transactionId || orderData.transaction_id,
      notes: orderData.notes || "",
      createdAt: orderData.createdAt || orderData.created_at,
      updatedAt:
        orderData.updatedAt || orderData.updated_at || orderData.update_at,
      status: orderData.status || "pending",
    };
  };

  // ✅ Enhanced tracking steps with sample kit stages
  const getTrackingSteps = (orderData: any) => {
    if (!orderData) return [];

    const sampleKits = orderData.sampleKits || [];
    const samples = orderData.samples || [];
    const appointment = orderData.appointment;

    // Determine collection method
    const collectionMethod =
      orderData.orderDetails?.[0]?.collection_method ||
      (appointment ? "facility" : "home");

    console.log("🔍 Generating tracking steps for:", {
      status: orderData.status,
      collectionMethod,
      sampleKitsCount: sampleKits.length,
      samplesCount: samples.length,
      hasAppointment: !!appointment,
    });

    const steps = [
      {
        step: 1,
        title: "Đơn hàng được xác nhận",
        status: "completed" as const,
        date: orderData.createdAt || orderData.created_at || "",
        description: "Đơn hàng đã được tạo và xác nhận thành công",
      },
    ];

    if (collectionMethod === "home") {
      // Home collection flow
      steps.push(
        {
          step: 2,
          title: "Chuẩn bị kit xét nghiệm",
          status:
            sampleKits.length > 0
              ? ("completed" as const)
              : orderData.status !== "pending"
              ? ("current" as const)
              : ("pending" as const),
          date: sampleKits.length > 0 ? sampleKits[0].createdAt || "" : "",
          description: "Bộ kit xét nghiệm đang được chuẩn bị và đóng gói",
        },
        {
          step: 3,
          title: "Gửi kit đến địa chỉ",
          status: sampleKits.some(
            (kit: any) => kit.status === "shipped" || kit.status === "delivered"
          )
            ? ("completed" as const)
            : sampleKits.length > 0
            ? ("current" as const)
            : ("pending" as const),
          date:
            sampleKits.find((kit: any) => kit.shipper_data)?.shipped_date || "",
          description: "Kit đang được vận chuyển đến địa chỉ của bạn",
        },
        {
          step: 4,
          title: "Thu thập mẫu tại nhà",
          status:
            samples.length > 0
              ? ("completed" as const)
              : sampleKits.some((kit: any) => kit.status === "delivered")
              ? ("current" as const)
              : ("pending" as const),
          date: samples.length > 0 ? samples[0].collection_date || "" : "",
          description: "Bạn tự thu thập mẫu theo hướng dẫn trong kit",
        },
        {
          step: 5,
          title: "Gửi mẫu về lab",
          status: samples.some((s: any) => s.received_date)
            ? ("completed" as const)
            : samples.length > 0
            ? ("current" as const)
            : ("pending" as const),
          date: samples.find((s: any) => s.received_date)?.received_date || "",
          description: "Mẫu đang được vận chuyển về phòng lab",
        }
      );
    } else {
      // Facility collection flow
      steps.push(
        {
          step: 2,
          title: "Xác nhận lịch hẹn",
          status: appointment ? ("completed" as const) : ("current" as const),
          date: appointment?.createdAt || "",
          description: "Lịch hẹn thu mẫu tại cơ sở y tế",
        },
        {
          step: 3,
          title: "Thu thập mẫu tại cơ sở",
          status:
            samples.length > 0
              ? ("completed" as const)
              : appointment
              ? ("current" as const)
              : ("pending" as const),
          date: samples.length > 0 ? samples[0].collection_date || "" : "",
          description: "Nhân viên y tế thu thập mẫu theo quy trình chuẩn",
        }
      );
    }

    // Common final steps
    steps.push(
      {
        step: steps.length + 1,
        title: "Phân tích tại phòng lab",
        status: samples.some(
          (s: any) => s.status === "analyzing" || s.status === "completed"
        )
          ? ("completed" as const)
          : samples.some((s: any) => s.received_date)
          ? ("current" as const)
          : ("pending" as const),
        date:
          samples.find((s: any) => s.status === "analyzing")?.updated_at || "",
        description: "Mẫu đang được phân tích và xét nghiệm",
      },
      {
        step: steps.length + 2,
        title: "Kết quả hoàn thành",
        status:
          orderData.status === "completed"
            ? ("completed" as const)
            : ("pending" as const),
        date:
          orderData.status === "completed"
            ? orderData.updatedAt || orderData.update_at || ""
            : "",
        description: "Kết quả đã hoàn thành và sẵn sàng tải về",
      }
    );

    return steps;
  };

  // ✅ Enhanced: Get both sample kits and samples summary
  const getKitsAndSamplesSummary = (sampleKits: any[], samples: any[]) => {
    const kits = sampleKits || [];
    const samplesList = samples || [];

    return {
      // Sample Kits stats
      totalKits: kits.length,
      kitsPreparing: kits.filter((k: any) => k.status === "preparing").length,
      kitsShipped: kits.filter((k: any) => k.status === "shipped").length,
      kitsDelivered: kits.filter((k: any) => k.status === "delivered").length,
      kitsExpired: kits.filter((k: any) => k.status === "expired").length,

      // Samples stats
      totalSamples: samplesList.length,
      samplesCollected: samplesList.filter((s: any) => s.collection_date)
        .length,
      samplesReceived: samplesList.filter((s: any) => s.received_date).length,
      samplesCompleted: samplesList.filter((s: any) => s.status === "completed")
        .length,
      samplesAnalyzing: samplesList.filter((s: any) => s.status === "analyzing")
        .length,

      // Legacy compatibility
      total: Math.max(kits.length, samplesList.length),
      collected: samplesList.filter((s: any) => s.collection_date).length,
      received: samplesList.filter((s: any) => s.received_date).length,
      completed: samplesList.filter((s: any) => s.status === "completed")
        .length,
    };
  };

  // ✅ Calculate overall progress using orderService method
  const calculateOverallProgress = (orderData: any) => {
    if (!orderData) return 0;

    const sampleKits = orderData.sampleKits || [];
    const samples = orderData.samples || [];
    const appointment = orderData.appointment;

    try {
      const progress = orderService.calculateOrderProgress(
        orderData,
        sampleKits,
        samples,
        appointment
      );
      console.log("📊 Calculated overall progress:", progress);
      return progress;
    } catch (error) {
      console.warn("⚠️ Error calculating progress, using fallback:", error);

      // Fallback: simple status-based progress
      const statusProgress: Record<string, number> = {
        pending: 10,
        confirmed: 25,
        kit_preparing: 35,
        kit_sent: 50,
        sample_collected: 65,
        processing: 80,
        completed: 100,
        cancelled: 0,
      };

      return statusProgress[orderData.status] || 10;
    }
  };

  // Handle tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Handle navigation
  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleContactSupport = () => {
    // TODO: Implement contact support logic
    console.log("Contact support clicked");
    // Could open a modal, redirect to contact page, or open chat
  };

  const handleDownloadResults = () => {
    // TODO: Implement download results logic
    console.log("Download results clicked");
    if (order?.status === "completed") {
      // Generate and download PDF results
      console.log("Generating results PDF for order:", order.id);
    }
  };

  const handleOrderNewService = () => {
    navigate("/services");
  };

  // ✅ Enhanced: Handle kit tracking
  const handleTrackKit = (kitId: string, trackingNumber: string) => {
    console.log("📦 Tracking kit:", { kitId, trackingNumber });
    // TODO: Implement kit tracking logic
    // Could open tracking modal or redirect to tracking page
  };

  // ✅ Enhanced: Handle sample status update
  const handleUpdateSampleStatus = async (
    sampleId: string,
    newStatus: string
  ) => {
    console.log("🧪 Updating sample status:", { sampleId, newStatus });
    // TODO: Implement sample status update
    // This might be for admin/staff interface
  };

  return {
    // State
    order,
    loading,
    error,
    activeTab,

    // Computed data
    orderData: getOrderData(order),
    trackingSteps: order ? getTrackingSteps(order) : [],
    kitsAndSamplesSummary: getKitsAndSamplesSummary(
      order?.sampleKits,
      order?.samples
    ),
    overallProgress: calculateOverallProgress(order),

    // Legacy compatibility
    samplesSummary: getKitsAndSamplesSummary(order?.sampleKits, order?.samples),

    // Actions
    handleTabChange,
    handleBackToDashboard,
    handleContactSupport,
    handleDownloadResults,
    handleOrderNewService,
    handleTrackKit,
    handleUpdateSampleStatus,

    // ✅ Enhanced: Additional computed data
    collectionMethod:
      order?.orderDetails?.[0]?.collection_method ||
      (order?.appointment ? "facility" : "home"),
    hasAppointment: !!order?.appointment,
    totalParticipants: order?.participants?.length || 0,
    expectedKits: order?.participants?.length || 0,
    expectedSamples: order?.participants?.length || 0,
  };
};
