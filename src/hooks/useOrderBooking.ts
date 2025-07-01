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
    phone: string;
    email: string;
    address: string;
    identityCard: string;
  };
  serviceInfo: {
    serviceId: string;
    quantity: number;
    collectionMethod: "home" | "facility";
    appointmentDate: string;
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
      phone: "",
      email: "",
      address: "",
      identityCard: "",
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
        { name: "", relationship: "Cha", age: "" },
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
            // Try different field name variations from API
            fullName:
              currentUser.full_name ||
              currentUser.fullName ||
              currentUser.name ||
              "",
            email: currentUser.email || "",
            // Try to extract phone from various fields
            phone:
              currentUser.phone ||
              currentUser.telephone ||
              currentUser.mobile ||
              "",
          },
        }));
        console.log("✅ User info auto-filled");
      } else {
        console.log("ℹ️ No logged in user, form remains empty");
      }
    } catch (error) {
      console.warn("⚠️ Error auto-filling user info:", error);
    }
  }, []);

  // Helper functions
  const calculateTotal = () => {
    const basePrice = service?.price || service?.test_price || 2500000; // Fallback price
    const quantity = formData.serviceInfo.quantity || 1;
    const total = basePrice * quantity;
    console.log(`💰 Calculating total: ${basePrice} x ${quantity} = ${total}`);
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
    setFormData((prev) => ({
      ...prev,
      participantInfo: {
        participants: [
          ...prev.participantInfo.participants,
          { name: "", relationship: "", age: "" },
        ],
      },
    }));
  };

  const removeParticipant = (index: number) => {
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

      // Enhanced time slot filtering
      const validTimeSlots = timeSlots.filter((slot) => {
        const isAvailable = slot.isAvailable !== false;
        const hasValidTime = slot.startTime && slot.endTime;
        const hasValidDay =
          typeof slot.dayOfWeek === "number" &&
          slot.dayOfWeek >= 0 &&
          slot.dayOfWeek <= 6;

        console.log(
          `🕐 Time slot ${slot.id}: available=${isAvailable}, validTime=${hasValidTime}, validDay=${hasValidDay}`
        );

        return isAvailable && hasValidTime && hasValidDay;
      });

      setAvailableTimeSlots(validTimeSlots);

      // Update form data
      updateFormData("serviceInfo", {
        doctorId,
        timeSlotId: "", // Reset time slot selection
        appointmentTime: "", // Reset appointment time
      });

      console.log(
        `✅ Time slots loaded: ${validTimeSlots.length} available slots out of ${timeSlots.length} total`
      );

      if (validTimeSlots.length === 0) {
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
  const validateStep = (step: number): boolean => {
    console.log(`🔍 Validating step ${step}...`);

    switch (step) {
      case 1:
        const step1Valid = !!(
          formData.customerInfo.fullName &&
          formData.customerInfo.phone &&
          formData.customerInfo.email &&
          formData.customerInfo.address &&
          formData.customerInfo.identityCard
        );
        console.log(`Step 1 validation: ${step1Valid}`, {
          fullName: !!formData.customerInfo.fullName,
          phone: !!formData.customerInfo.phone,
          email: !!formData.customerInfo.email,
          address: !!formData.customerInfo.address,
          identityCard: !!formData.customerInfo.identityCard,
        });
        return step1Valid;

      case 2:
        const step2Valid =
          formData.participantInfo.participants.length >= 2 &&
          formData.participantInfo.participants.every(
            (p) => p.name && p.relationship && p.age
          );
        console.log(`Step 2 validation: ${step2Valid}`, {
          participantCount: formData.participantInfo.participants.length,
          allFieldsFilled: formData.participantInfo.participants.map((p) => ({
            name: !!p.name,
            relationship: !!p.relationship,
            age: !!p.age,
          })),
        });
        return step2Valid;

      case 3:
        let step3Valid = true;
        if (formData.serviceInfo.collectionMethod === "facility") {
          step3Valid = !!(
            formData.serviceInfo.doctorId &&
            formData.serviceInfo.timeSlotId &&
            formData.serviceInfo.appointmentDate
          );
          console.log(`Step 3 validation (facility): ${step3Valid}`, {
            doctorId: !!formData.serviceInfo.doctorId,
            timeSlotId: !!formData.serviceInfo.timeSlotId,
            appointmentDate: !!formData.serviceInfo.appointmentDate,
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
          phone: formData.customerInfo.phone.replace(/\s+/g, ""),
          email: formData.customerInfo.email.trim().toLowerCase(),
          address: formData.customerInfo.address.trim(),
          identityCard: formData.customerInfo.identityCard.replace(/\s+/g, ""),
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
          phone: orderData.customerInfo.phone,
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
    handleSubmit,
  };
};
