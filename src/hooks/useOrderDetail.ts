import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderService } from "../services/orderService";
import { testResultService } from "../services/testResultService";

export const useOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // States
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("progress");

  // ✅ FIXED: Test results state
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testResultsLoading, setTestResultsLoading] = useState(false);
  const [testResultsError, setTestResultsError] = useState<string | null>(null);

  // ✅ FIXED: Fetch test results by ORDER ID (not sample IDs)
  const fetchTestResultsByOrderId = async (orderId: string) => {
    if (!orderId) {
      console.warn("❌ Order ID is required to fetch test results");
      setTestResults([]);
      return;
    }

    try {
      setTestResultsLoading(true);
      setTestResultsError(null);

      console.log("🔍 Fetching test results for ORDER ID:", orderId);
      console.log("🌐 API endpoint:", `/test-results/order/${orderId}`);

      // ✅ Use the correct API endpoint: /test-results/order/{orderId}
      const results = await testResultService.getTestResultsByOrderId(orderId);

      console.log("✅ Test results API response:", {
        orderId,
        count: results?.length || 0,
        results: results || [],
        rawResponse: results,
      });

      // ✅ Extra debug: Check if results array is actually populated
      if (results && Array.isArray(results)) {
        console.log("📊 Test results details:");
        results.forEach((result, index) => {
          console.log(`  Result ${index + 1}:`, {
            id: result.id,
            type: result.result_type,
            percentage: result.result_percentage,
            conclusion: result.conclusion ? "Yes" : "No",
            orderId: result.orders_id,
            userId: result.userId,
          });
        });
      } else {
        console.log("⚠️ No test results found or invalid response format");
      }

      setTestResults(results || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải kết quả xét nghiệm";
      console.error("❌ Error fetching test results for order:", {
        orderId,
        error: err,
        message: errorMessage,
        stack: err instanceof Error ? err.stack : "No stack trace",
      });

      setTestResultsError(errorMessage);
      setTestResults([]);
    } finally {
      setTestResultsLoading(false);
    }
  };

  // ✅ Refresh test results function
  const refreshTestResults = async () => {
    if (order?.id) {
      await fetchTestResultsByOrderId(order.id);
    }
  };

  // Fetch order detail on mount
  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id) {
        console.warn("❌ No order ID provided, redirecting to dashboard");
        navigate("/dashboard");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("🔍 Fetching order detail for ID:", id);

        const completeOrderData = await orderService.getCompleteOrderData(id);

        if (!completeOrderData) {
          throw new Error("Không tìm thấy thông tin đơn hàng");
        }

        console.log("📦 Complete order data received:", completeOrderData);
        setOrder(completeOrderData);

        // ✅ FIXED: Fetch test results by ORDER ID (the URL parameter)
        console.log("🔍 Now fetching test results for ORDER ID:", id);
        await fetchTestResultsByOrderId(id);
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

  // ✅ Enhanced tracking steps with test results
  const getTrackingSteps = (orderData: any) => {
    if (!orderData) return [];

    const sampleKits = orderData.sampleKits || [];
    const samples = orderData.samples || [];
    const appointment = orderData.appointment;
    const hasTestResults = testResults.length > 0;

    // Determine collection method
    const collectionMethod =
      orderData.orderDetails?.[0]?.collection_method ||
      (appointment ? "facility" : "home");

    console.log("🔍 Generating tracking steps for:", {
      orderId: orderData.id,
      status: orderData.status,
      collectionMethod,
      sampleKitsCount: sampleKits.length,
      samplesCount: samples.length,
      hasAppointment: !!appointment,
      testResultsCount: testResults.length,
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
        status: hasTestResults ? ("completed" as const) : ("pending" as const),
        date: hasTestResults ? testResults[0]?.tested_date || "" : "",
        description: `Kết quả đã hoàn thành và sẵn sàng tải về${
          hasTestResults ? ` (${testResults.length} kết quả)` : ""
        }`,
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

      // ✅ Test Results stats
      totalTestResults: testResults.length,
      testResultsCompleted: testResults.filter(
        (tr: any) => tr.conclusion && tr.result_percentage
      ).length,

      // Legacy compatibility
      total: Math.max(kits.length, samplesList.length),
      collected: samplesList.filter((s: any) => s.collection_date).length,
      received: samplesList.filter((s: any) => s.received_date).length,
      completed: samplesList.filter((s: any) => s.status === "completed")
        .length,
    };
  };

  // ✅ Enhanced: Calculate overall progress including test results
  const calculateOverallProgress = (orderData: any) => {
    if (!orderData) return 0;

    const sampleKits = orderData.sampleKits || [];
    const samples = orderData.samples || [];
    const hasTestResults = testResults.length > 0;

    let progress = 10; // Base progress

    // Progress based on sample kits and samples
    if (sampleKits.length > 0) progress = 30;
    if (samples.length > 0) progress = 60;
    if (samples.some((s: any) => s.received_date)) progress = 80;
    if (hasTestResults) progress = 100;

    console.log("📊 Calculated overall progress:", {
      orderId: orderData.id,
      progress,
      sampleKits: sampleKits.length,
      samples: samples.length,
      testResults: testResults.length,
    });

    return Math.round(progress);
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
    console.log("Contact support clicked");
  };

  // ✅ Enhanced: Handle download results with test results
  const handleDownloadResults = async () => {
    console.log("Download results clicked for order:", id);

    if (testResults.length > 0) {
      try {
        const resultsWithFiles = testResults.filter(
          (result: any) => result.result_file
        );

        if (resultsWithFiles.length > 0) {
          console.log(
            `Downloading ${resultsWithFiles.length} test result files`
          );
          for (const result of resultsWithFiles) {
            await testResultService.downloadTestResultFile(result);
          }
        } else {
          alert("Chưa có file kết quả để tải xuống");
        }
      } catch (error) {
        console.error("Error downloading test results:", error);
        alert("Có lỗi xảy ra khi tải kết quả. Vui lòng thử lại sau.");
      }
    } else {
      alert("Kết quả chưa sẵn sàng để tải xuống");
    }
  };

  const handleOrderNewService = () => {
    navigate("/services");
  };

  const handleTrackKit = (kitId: string, trackingNumber: string) => {
    console.log("📦 Tracking kit:", { kitId, trackingNumber });
  };

  return {
    // State
    order,
    loading,
    error,
    activeTab,

    // ✅ Test results state
    testResults,
    testResultsLoading,
    testResultsError,

    // Computed data
    orderData: getOrderData(order),
    trackingSteps: order ? getTrackingSteps(order) : [],
    kitsAndSamplesSummary: getKitsAndSamplesSummary(
      order?.sampleKits,
      order?.samples
    ),
    overallProgress: calculateOverallProgress(order),

    // Actions
    handleTabChange,
    handleBackToDashboard,
    handleContactSupport,
    handleDownloadResults,
    handleOrderNewService,
    handleTrackKit,

    // ✅ Test results actions
    refreshTestResults,

    // Additional computed data
    collectionMethod:
      order?.orderDetails?.[0]?.collection_method ||
      (order?.appointment ? "facility" : "home"),
    hasAppointment: !!order?.appointment,
    totalParticipants: order?.participants?.length || 0,

    // ✅ Test results computed data
    hasTestResults: testResults.length > 0,
    testResultsCount: testResults.length,
  };
};
