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

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch service by ID
        if (id) {
          console.log("🔍 Fetching service with ID:", id);
          const apiService = await ServiceService.getServiceById(id);
          const mappedService = mapApiServiceToFrontend(apiService);
          setService(mappedService);
          console.log("✅ Service loaded:", mappedService);
        }

        // Fetch doctors for facility collection
        console.log("🔍 Fetching doctors...");
        const doctorsList = await orderService.getAllDoctors();
        setDoctors(doctorsList.filter((doctor) => doctor.isActive));
        console.log("✅ Doctors loaded:", doctorsList.length);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Auto-fill user info if logged in
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (currentUser.id) {
      setFormData((prev) => ({
        ...prev,
        customerInfo: {
          ...prev.customerInfo,
          fullName: currentUser.full_name || currentUser.fullName || "",
          email: currentUser.email || "",
          phone: currentUser.username || "",
        },
      }));
    }
  }, []);

  // Helper functions
  const calculateTotal = () => {
    return service?.price * formData.serviceInfo.quantity || 0;
  };

  const updateFormData = (section: keyof OrderForm, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const updateParticipant = (index: number, field: string, value: string) => {
    const newParticipants = [...formData.participantInfo.participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      participantInfo: { participants: newParticipants },
    }));
  };

  const addParticipant = () => {
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
      const newParticipants = formData.participantInfo.participants.filter(
        (_, i) => i !== index
      );
      setFormData((prev) => ({
        ...prev,
        participantInfo: { participants: newParticipants },
      }));
    }
  };

  const handleDoctorSelect = async (doctorId: string) => {
    try {
      console.log("🔍 Fetching time slots for doctor:", doctorId);
      const timeSlots = await orderService.getDoctorTimeSlots(doctorId);
      setAvailableTimeSlots(timeSlots);

      updateFormData("serviceInfo", {
        doctorId,
        timeSlotId: "",
        appointmentTime: "",
      });

      console.log("✅ Time slots loaded:", timeSlots.length);
    } catch (error) {
      console.error("❌ Error fetching time slots:", error);
      setAvailableTimeSlots([]);
      updateFormData("serviceInfo", {
        doctorId,
        timeSlotId: "",
        appointmentTime: "",
      });
    }
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    const timeSlot = availableTimeSlots.find(
      (slot) => slot.id.toString() === timeSlotId
    );
    if (timeSlot) {
      updateFormData("serviceInfo", {
        timeSlotId,
        appointmentTime: `${timeSlot.startTime} - ${timeSlot.endTime}`,
      });
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
    return days[dayOfWeek];
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.customerInfo.fullName &&
          formData.customerInfo.phone &&
          formData.customerInfo.email &&
          formData.customerInfo.address &&
          formData.customerInfo.identityCard
        );
      case 2:
        return formData.participantInfo.participants.every(
          (p) => p.name && p.relationship && p.age
        );
      case 3:
        if (formData.serviceInfo.collectionMethod === "facility") {
          return !!(
            formData.serviceInfo.doctorId &&
            formData.serviceInfo.timeSlotId &&
            formData.serviceInfo.appointmentDate
          );
        }
        return true;
      case 4:
        return !!formData.paymentInfo.method;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      console.log("🚀 Submitting order...");
      console.log("📋 Form Data:", formData);

      // Prepare order data for API
      const orderData = {
        customerInfo: formData.customerInfo,
        serviceInfo: {
          ...formData.serviceInfo,
          serviceId: id!,
        },
        participantInfo: formData.participantInfo,
        paymentInfo: formData.paymentInfo,
      };

      // Call API to create complete order
      const orderId = await orderService.createCompleteOrder(orderData);

      console.log("✅ Order created successfully with ID:", orderId);

      // Navigate to success page with order data
      navigate("/order/success", {
        state: {
          orderId,
          orderCode: "DNA-" + orderId.slice(-8).toUpperCase(),
          service: {
            name: service?.service_name || "Dịch vụ xét nghiệm DNA",
            price: service?.price || 0,
            duration: service?.duration_days || 7,
          },
          customer: {
            name: formData.customerInfo.fullName,
            email: formData.customerInfo.email,
            phone: formData.customerInfo.phone,
          },
          collectionMethod: formData.serviceInfo.collectionMethod,
          appointmentDate: formData.serviceInfo.appointmentDate,
          participants: formData.participantInfo.participants,
          payment: {
            method: formData.paymentInfo.method,
            status: "pending",
            amount: calculateTotal(),
          },
          totalAmount: calculateTotal(),
        },
      });
    } catch (err) {
      console.error("❌ Error submitting order:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau."
      );
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
