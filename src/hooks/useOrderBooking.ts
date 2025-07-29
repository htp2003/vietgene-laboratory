import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ServiceService,
  mapApiServiceToFrontend,
} from "../services/serviceService";
import { orderService, Doctor, TimeSlot } from "../services/orderService";

export interface OrderForm {
  customerInfo: {
    fullName: string;
    email: string;
    address: string;
  };
  serviceInfo: {
    serviceId: string;
    quantity: number;
    collectionMethod: "home" | "facility";
    appointmentDate: string; // ✅ UPDATED: Now automatically filled from timeSlot.specificDate
    appointmentTime: string;
    doctorId: string;
    timeSlotId: string;
    notes: string;
  };
  participantInfo: {
    participants: Array<{
      name: string;
      relationship: string;
      age: string;
    }>;
  };
  paymentInfo: {
    method: "cash" | "transfer";
  };
}

export const useOrderBooking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // States
  const [service, setService] = useState<any>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<OrderForm>({
    customerInfo: {
      fullName: "",
      email: "",
      address: "",
    },
    serviceInfo: {
      serviceId: id || "",
      quantity: 1,
      collectionMethod: "home",
      appointmentDate: "",
      appointmentTime: "",
      doctorId: "",
      timeSlotId: "",
      notes: "",
    },
    participantInfo: {
      participants: [
        // ✅ Person 1: Main test person
        { name: "", relationship: "Người xét nghiệm chính", age: "" },
        // ✅ Person 2: First relative
        { name: "", relationship: "Con", age: "" },
      ],
    },
    paymentInfo: {
      method: "transfer",
    },
  });

  // Enhanced data fetching with better error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🚀 Starting data fetch for order booking...");

        // Fetch service by ID with enhanced error handling
        if (id) {
          try {
            console.log("🔍 Fetching service with ID:", id);
            const apiService = await ServiceService.getServiceById(id);
            console.log("📦 Raw API service data:", apiService);

            const mappedService = mapApiServiceToFrontend(apiService);
            setService(mappedService);
            console.log("✅ Service mapped and loaded:", mappedService);
          } catch (serviceError) {
            console.error("❌ Error fetching service:", serviceError);
            setError(
              "Không thể tải thông tin dịch vụ. Vui lòng kiểm tra ID dịch vụ."
            );
            return; // Stop execution if service can't be loaded
          }
        } else {
          setError("ID dịch vụ không hợp lệ");
          return;
        }

        // Fetch doctors for facility collection with enhanced error handling
        try {
          console.log("🔍 Fetching doctors list...");
          const doctorsList = await orderService.getAllDoctors();
          console.log("📋 Raw doctors data:", doctorsList);

          // Enhanced doctor filtering and validation
          const activeDoctors = doctorsList.filter((doctor) => {
            const isActive = doctor.isActive !== false; // Default to true if undefined
            const hasValidId = doctor.doctorId || doctor.id || doctor.userId;
            const hasValidName = doctor.doctorName || doctor.name;

            console.log(
              `👨‍⚕️ Doctor ${
                hasValidName || "Unknown"
              }: active=${isActive}, hasId=${!!hasValidId}`
            );

            return isActive && hasValidId;
          });

          setDoctors(activeDoctors);
          console.log(
            `✅ Doctors loaded: ${activeDoctors.length} active doctors out of ${doctorsList.length} total`
          );

          if (activeDoctors.length === 0) {
            console.warn("⚠️ No active doctors available");
          }
        } catch (doctorError) {
          console.error("❌ Error fetching doctors:", doctorError);
          // Don't fail completely, just warn user
          console.warn(
            "⚠️ Continuing without doctors - facility booking may not work"
          );
          setDoctors([]);
        }

        console.log("✅ Data fetching completed successfully");
      } catch (err) {
        console.error("❌ Critical error in data fetching:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Enhanced auto-fill user info with better data mapping
  useEffect(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      console.log("👤 Auto-filling user info:", currentUser);

      if (currentUser.id) {
        setFormData((prev) => ({
          ...prev,
          customerInfo: {
            ...prev.customerInfo,
            fullName:
              currentUser.full_name ||
              currentUser.fullName ||
              currentUser.name ||
              "",
            email: currentUser.email || "",
          },
          // ✅ Also auto-fill main test person
          participantInfo: {
            participants: prev.participantInfo.participants.map(
              (participant, index) => {
                if (index === 0 && currentUser.full_name) {
                  // Pre-fill main person with user's name
                  return {
                    ...participant,
                    name:
                      currentUser.full_name ||
                      currentUser.fullName ||
                      currentUser.name ||
                      "",
                  };
                }
                return participant;
              }
            ),
          },
        }));
        console.log("✅ User info auto-filled including main test person");
      } else {
        console.log("ℹ️ No logged in user, form remains empty");
      }
    } catch (error) {
      console.warn("⚠️ Error auto-filling user info:", error);
    }
  }, []);

  // Helper functions
  const calculateTotal = () => {
    const basePrice = service?.price || service?.test_price || 2500000;
    const quantity = formData.serviceInfo.quantity || 1;
    // ✅ FIXED: Price should be per participant, not per order
    const participantCount = formData.participantInfo.participants.length;
    const total = basePrice * participantCount; // Not quantity

    console.log(
      `💰 Calculating total: ${basePrice} x ${participantCount} participants = ${total}`
    );
    return total;
  };

  const updateFormData = (section: keyof OrderForm, data: any) => {
    console.log(`📝 Updating form section ${section}:`, data);
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const updateParticipant = (index: number, field: string, value: string) => {
    console.log(`👥 Updating participant ${index} field ${field}:`, value);
    const newParticipants = [...formData.participantInfo.participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      participantInfo: { participants: newParticipants },
    }));
  };

  const addParticipant = () => {
    console.log("➕ Adding new participant");

    // ✅ Smart default relationship based on existing participants
    const existingRelationships = formData.participantInfo.participants
      .slice(1) // Skip main person
      .map((p) => p.relationship);

    let defaultRelationship = "Cha"; // Default to father

    // ✅ Suggest relationships that aren't taken yet
    const suggestedOrder = [
      "Cha",
      "Mẹ",
      "Con",
      "Anh/Chị",
      "Em",
      "Ông",
      "Bà",
      "Cháu",
    ];

    for (const suggestion of suggestedOrder) {
      if (!existingRelationships.includes(suggestion)) {
        defaultRelationship = suggestion;
        break;
      }
    }

    setFormData((prev) => ({
      ...prev,
      participantInfo: {
        participants: [
          ...prev.participantInfo.participants,
          { name: "", relationship: defaultRelationship, age: "" },
        ],
      },
    }));
  };
  const removeParticipant = (index: number) => {
    // ✅ Can't remove main person (index 0) or if only 2 people left
    if (index === 0) {
      console.warn("⚠️ Cannot remove main test person");
      return;
    }

    if (formData.participantInfo.participants.length > 2) {
      console.log(`➖ Removing participant at index ${index}`);
      const newParticipants = formData.participantInfo.participants.filter(
        (_, i) => i !== index
      );
      setFormData((prev) => ({
        ...prev,
        participantInfo: { participants: newParticipants },
      }));
    } else {
      console.warn("⚠️ Cannot remove participant - minimum 2 required");
    }
  };
  // Enhanced doctor selection with better error handling
  const handleDoctorSelect = async (doctorId: string) => {
    try {
      console.log("🔍 Doctor selected, fetching time slots for:", doctorId);

      // Validate doctor ID
      const selectedDoctor = doctors.find(
        (d) =>
          d.doctorId === doctorId || d.id === doctorId || d.userId === doctorId
      );

      if (!selectedDoctor) {
        console.error("❌ Invalid doctor ID:", doctorId);
        setError("Bác sĩ được chọn không hợp lệ");
        return;
      }

      console.log("👨‍⚕️ Selected doctor:", selectedDoctor);

      // Reset time slots while loading
      setAvailableTimeSlots([]);

      const timeSlots = await orderService.getDoctorTimeSlots(doctorId);
      console.log("📅 Raw time slots:", timeSlots);

      // ✅ UPDATED: Don't filter by isAvailable here - let UI handle it
      // Enhanced time slot validation (but keep unavailable slots)
      const validTimeSlots = timeSlots.filter((slot) => {
        const hasValidTime = slot.startTime && slot.endTime;
        const hasValidDay =
          typeof slot.dayOfWeek === "number" &&
          slot.dayOfWeek >= 0 &&
          slot.dayOfWeek <= 6;

        console.log(
          `🕐 Time slot ${slot.id}: available=${slot.isAvailable}, validTime=${hasValidTime}, validDay=${hasValidDay}`
        );

        // ✅ CHANGED: Return slots even if not available (for UI to show disabled)
        return hasValidTime && hasValidDay;

        // ❌ OLD CODE (removed):
        // return slot.isAvailable && hasValidTime && hasValidDay;
      });

      setAvailableTimeSlots(validTimeSlots);

      // Update form data
      updateFormData("serviceInfo", {
        doctorId,
        timeSlotId: "", // Reset time slot selection
        appointmentTime: "", // Reset appointment time
      });

      const availableCount = validTimeSlots.filter(
        (slot) => slot.isAvailable
      ).length;
      console.log(
        `✅ Time slots loaded: ${availableCount} available / ${validTimeSlots.length} total slots`
      );

      if (availableCount === 0) {
        console.warn("⚠️ No available time slots for this doctor");
      }
    } catch (error) {
      console.error("❌ Error fetching time slots:", error);
      setAvailableTimeSlots([]);
      setError(
        "Không thể tải lịch khám của bác sĩ. Vui lòng thử chọn bác sĩ khác."
      );

      // Still update doctor selection even if time slots fail
      updateFormData("serviceInfo", {
        doctorId,
        timeSlotId: "",
        appointmentTime: "",
      });
    }
  };

  // Enhanced time slot selection
  const handleTimeSlotSelect = (timeSlotId: string) => {
    console.log("🕐 Time slot selected:", timeSlotId);

    const timeSlot = availableTimeSlots.find(
      (slot) => slot.id.toString() === timeSlotId
    );

    if (timeSlot) {
      const appointmentTime = `${timeSlot.startTime} - ${timeSlot.endTime}`;
      console.log("✅ Time slot found:", timeSlot);
      console.log("✅ Appointment time:", appointmentTime);

      updateFormData("serviceInfo", {
        timeSlotId,
        appointmentTime,
      });
    } else {
      console.error("❌ Time slot not found:", timeSlotId);
      setError("Khung giờ được chọn không hợp lệ");
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    return days[dayOfWeek] || `Ngày ${dayOfWeek}`;
  };

  // Enhanced step validation with detailed logging
  // Enhanced step validation with detailed logging
  const validateStep = (step: number): boolean => {
    console.log(`🔍 Validating step ${step}...`);

    switch (step) {
      case 1:
        const step1Valid = !!(
          formData.customerInfo.fullName &&
          formData.customerInfo.email &&
          formData.customerInfo.address
        );
        console.log(`Step 1 validation: ${step1Valid}`, {
          fullName: !!formData.customerInfo.fullName,
          email: !!formData.customerInfo.email,
          address: !!formData.customerInfo.address,
        });
        return step1Valid;

      case 2:
        const step2Valid =
          formData.participantInfo.participants.length >= 2 &&
          formData.participantInfo.participants.every((p, index) => {
            // ✅ Main person (index 0) must have relationship set
            if (index === 0) {
              return p.name && p.relationship && p.age;
            }
            // ✅ Other participants must have all fields + relationship with main person
            return p.name && p.relationship && p.age;
          });

        console.log(`Step 2 validation: ${step2Valid}`, {
          participantCount: formData.participantInfo.participants.length,
          mainPersonComplete: formData.participantInfo.participants[0]
            ? !!(
                formData.participantInfo.participants[0].name &&
                formData.participantInfo.participants[0].relationship &&
                formData.participantInfo.participants[0].age
              )
            : false,
          allFieldsFilled: formData.participantInfo.participants.map(
            (p, i) => ({
              index: i,
              isMainPerson: i === 0,
              name: !!p.name,
              relationship: !!p.relationship,
              age: !!p.age,
            })
          ),
        });
        return step2Valid;

      case 3:
        let step3Valid = true;
        if (formData.serviceInfo.collectionMethod === "facility") {
          // ✅ UPDATED: No longer require separate appointmentDate input
          // The appointmentDate is automatically set from timeSlot.specificDate
          step3Valid = !!(
            (
              formData.serviceInfo.doctorId &&
              formData.serviceInfo.timeSlotId &&
              formData.serviceInfo.appointmentDate
            ) // This comes from timeSlot.specificDate
          );
          console.log(`Step 3 validation (facility): ${step3Valid}`, {
            doctorId: !!formData.serviceInfo.doctorId,
            timeSlotId: !!formData.serviceInfo.timeSlotId,
            appointmentDate: !!formData.serviceInfo.appointmentDate,
            appointmentDateValue: formData.serviceInfo.appointmentDate,
          });
        } else {
          console.log(
            `Step 3 validation (home): ${step3Valid} - no additional requirements`
          );
        }
        return step3Valid;

      case 4:
        const step4Valid = !!formData.paymentInfo.method;
        console.log(`Step 4 validation: ${step4Valid}`, {
          paymentMethod: formData.paymentInfo.method,
        });
        return step4Valid;

      default:
        console.warn(`Unknown step: ${step}`);
        return false;
    }
  };

  const getStepSpecificError = (step: number): string => {
    switch (step) {
      case 1:
        const missing1 = [];
        if (!formData.customerInfo.fullName) missing1.push("Họ tên");
        if (!formData.customerInfo.email) missing1.push("Email");
        if (!formData.customerInfo.address) missing1.push("Địa chỉ");

        return missing1.length > 0
          ? `Vui lòng điền: ${missing1.join(", ")}`
          : "Vui lòng điền đầy đủ thông tin khách hàng";

      case 2:
        if (formData.participantInfo.participants.length < 2) {
          return "Cần ít nhất 2 người tham gia xét nghiệm (bao gồm người xét nghiệm chính)";
        }

        // Check main person specifically
        const mainPerson = formData.participantInfo.participants[0];
        if (
          !mainPerson?.name ||
          !mainPerson?.relationship ||
          !mainPerson?.age
        ) {
          const missing = [];
          if (!mainPerson?.name) missing.push("tên");
          if (!mainPerson?.relationship) missing.push("vai trò");
          if (!mainPerson?.age) missing.push("tuổi");
          return `Người xét nghiệm chính thiếu: ${missing.join(", ")}`;
        }

        // Check other participants
        const incompleteParticipants = formData.participantInfo.participants
          .slice(1) // Skip main person
          .map((p, i) => {
            const missing = [];
            if (!p.name) missing.push("tên");
            if (!p.relationship) missing.push("mối quan hệ");
            if (!p.age) missing.push("tuổi");
            return missing.length > 0
              ? `Người ${i + 2}: ${missing.join(", ")}`
              : null;
          })
          .filter(Boolean);

        return incompleteParticipants.length > 0
          ? `Vui lòng điền đầy đủ: ${incompleteParticipants.join("; ")}`
          : "Vui lòng điền đầy đủ thông tin người tham gia";

      case 3:
        if (!formData.serviceInfo.collectionMethod) {
          return "Vui lòng chọn phương thức lấy mẫu";
        }
        if (formData.serviceInfo.collectionMethod === "facility") {
          const missing3 = [];
          if (!formData.serviceInfo.doctorId) missing3.push("bác sĩ");
          if (!formData.serviceInfo.timeSlotId) missing3.push("lịch hẹn");
          // ✅ UPDATED: More specific error message since date comes from time slot
          if (!formData.serviceInfo.appointmentDate) missing3.push("thời gian");

          return missing3.length > 0
            ? `Vui lòng chọn: ${missing3.join(", ")}`
            : "Vui lòng hoàn tất thông tin đặt lịch";
        }
        return "Vui lòng hoàn tất thông tin lấy mẫu";

      case 4:
        return !formData.paymentInfo.method
          ? "Vui lòng chọn phương thức thanh toán"
          : "Vui lòng hoàn tất thông tin thanh toán";

      default:
        return "Vui lòng kiểm tra lại thông tin";
    }
  };

  // Enhanced form submission with comprehensive error handling
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      console.log("🚀 Starting order submission...");
      console.log("📋 Complete form data:", formData);

      // Pre-submission validation
      const allStepsValid = [1, 2, 3, 4].every((step) => validateStep(step));
      if (!allStepsValid) {
        throw new Error(
          "Vui lòng kiểm tra và điền đầy đủ thông tin ở tất cả các bước"
        );
      }

      // Sanitize and prepare order data
      const orderData = {
        customerInfo: {
          fullName: formData.customerInfo.fullName.trim(),
          email: formData.customerInfo.email.trim().toLowerCase(),
          address: formData.customerInfo.address.trim(),
        },
        serviceInfo: {
          serviceId: id!,
          quantity: Math.max(1, formData.serviceInfo.quantity),
          collectionMethod: formData.serviceInfo.collectionMethod,
          appointmentDate: formData.serviceInfo.appointmentDate,
          appointmentTime: formData.serviceInfo.appointmentTime,
          doctorId: formData.serviceInfo.doctorId,
          timeSlotId: formData.serviceInfo.timeSlotId,
          notes: formData.serviceInfo.notes.trim(),
        },
        participantInfo: {
          participants: formData.participantInfo.participants
            .filter((p) => p.name.trim()) // Remove empty participants
            .map((p) => ({
              name: p.name.trim(),
              relationship: p.relationship.trim(),
              age: p.age.trim(),
            })),
        },
        paymentInfo: {
          method: formData.paymentInfo.method,
        },
      };

      console.log("📤 Sanitized order data:", orderData);

      // Validate minimum participants
      if (orderData.participantInfo.participants.length < 2) {
        throw new Error("Cần ít nhất 2 người tham gia xét nghiệm");
      }

      // Call API to create complete order
      console.log("🔗 Calling orderService.createCompleteOrder...");
      const orderId = await orderService.createCompleteOrder(orderData);

      console.log("✅ Order created successfully with ID:", orderId);

      // Prepare success page data
      const successData = {
        orderId,
        orderCode: `DNA-${orderId.slice(-8).toUpperCase()}`,
        service: {
          name:
            service?.service_name || service?.name || "Dịch vụ xét nghiệm DNA",
          price: service?.price || service?.test_price || 2500000,
          duration: service?.duration_days || 7,
        },
        customer: {
          name: orderData.customerInfo.fullName,
          email: orderData.customerInfo.email,
        },
        collectionMethod: orderData.serviceInfo.collectionMethod,
        appointmentDate: orderData.serviceInfo.appointmentDate,
        participants: orderData.participantInfo.participants,
        payment: {
          method: orderData.paymentInfo.method,
          status: "pending",
          amount: calculateTotal(),
        },
        totalAmount: calculateTotal(),
      };

      console.log("🎉 Navigating to success page with data:", successData);

      // Navigate to success page
      navigate("/order/success", {
        state: successData,
      });
    } catch (err) {
      console.error("❌ Order submission failed:", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau.";

      setError(errorMessage);

      // Scroll to error message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    // State
    service,
    doctors,
    availableTimeSlots,
    loading,
    submitting,
    error,
    currentStep,
    formData,

    // Actions
    setCurrentStep,
    setError,
    updateFormData,
    updateParticipant,
    addParticipant,
    removeParticipant,
    handleDoctorSelect,
    handleTimeSlotSelect,
    getDayName,
    validateStep,
    calculateTotal,
    getStepSpecificError,
    handleSubmit,
  };
};
