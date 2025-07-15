import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  TestTube,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Package,
  FileText,
  Users,
  Save,
  Loader2,
  ChevronUp
} from 'lucide-react';

import { Appointment } from '../../types/appointment';
import { SampleService, SampleRequest, SampleKit, SampleKitsService } from '../../services/staffService/sampleService';
import { OrderParticipantsService, OrderParticipant } from '../../services/staffService/orderParticipantService';

interface SampleCreationModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSamplesCreated: (appointmentId: string) => Promise<void>;
  triggerElement?: HTMLElement | null; // Element that triggered the modal
}

interface SampleFormData {
  participantId: string;
  participantName: string;
  sampleKitId: string;
  kitCode: string;
  sample_code: string;
  sample_type: string;
  collection_date: string;
  received_date: string;
  status: string;
  shipping_tracking: string;
  notes: string;
  sample_quality: string;
}

const SampleCreationModal: React.FC<SampleCreationModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onSamplesCreated,
  triggerElement
}) => {
  const [participants, setParticipants] = useState<OrderParticipant[]>([]);
  const [sampleKits, setSampleKits] = useState<SampleKit[]>([]);
  const [sampleForms, setSampleForms] = useState<SampleFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [modalPosition, setModalPosition] = useState({ 
    top: 0, 
    left: 0, 
    width: 0,
    positioning: 'center' as 'center' | 'below-card' 
  });
  
  const modalRef = useRef<HTMLDivElement>(null);

  // ✅ Tính toán vị trí modal dựa trên trigger element
  useEffect(() => {
    if (isOpen) {
      if (triggerElement) {
        // ✅ Position below the card
        const rect = triggerElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        // ✅ Calculate available space
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const modalHeight = 600; // Estimated modal height
        
        let top = rect.bottom + scrollTop + 8; // 8px gap
        let positioning: 'center' | 'below-card' = 'below-card';
        
        // ✅ If not enough space below, check if we should center instead
        if (spaceBelow < modalHeight && spaceAbove < modalHeight) {
          // ✅ Center the modal if no good position near card
          top = scrollTop + (window.innerHeight - modalHeight) / 2;
          positioning = 'center';
        } else if (spaceBelow < modalHeight) {
          // ✅ Position above the card
          top = rect.top + scrollTop - modalHeight - 8;
        }
        
        setModalPosition({
          top: Math.max(top, scrollTop + 20), // Ensure minimum top margin
          left: Math.max(rect.left + scrollLeft, 20), // Ensure minimum left margin
          width: Math.max(rect.width, 800), // Minimum width
          positioning
        });
      } else {
        // ✅ Fallback to center if no trigger element
        setModalPosition({
          top: window.pageYOffset + 100,
          left: (window.innerWidth - 800) / 2,
          width: 800,
          positioning: 'center'
        });
      }
    }
  }, [isOpen, triggerElement]);

  // ✅ Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (isOpen && triggerElement) {
        // Recalculate position on resize
        const rect = triggerElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        setModalPosition(prev => ({
          ...prev,
          top: rect.bottom + scrollTop + 8,
          left: Math.max(rect.left + scrollLeft, 20),
        }));
      }
    };

    if (isOpen) {
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize);
      };
    }
  }, [isOpen, triggerElement]);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && appointment?.rawData?.order?.orderId) {
      loadModalData(appointment.rawData.order.orderId);
    } else {
      resetModal();
    }
  }, [isOpen, appointment]);

  const resetModal = () => {
    setParticipants([]);
    setSampleKits([]);
    setSampleForms([]);
    setError('');
    setValidationErrors({});
  };

  const loadModalData = async (orderId: string) => {
    try {
      setLoadingData(true);
      setError('');

      console.log('📊 Loading modal data for order:', orderId);

      // Load participants and sample kits in parallel
      const [participantsData, sampleKitsData] = await Promise.all([
        OrderParticipantsService.getParticipantsByOrderIdCached(orderId),
        SampleKitsService.getSampleKitsByOrderId(orderId)
      ]);

      setParticipants(participantsData);
      setSampleKits(sampleKitsData);

      // Validate data consistency
      if (participantsData.length === 0) {
        throw new Error('Không tìm thấy người tham gia xét nghiệm');
      }

      if (sampleKitsData.length === 0) {
        throw new Error('Không tìm thấy kit xét nghiệm cho đơn hàng này');
      }

      // Create sample forms for each participant
      const currentDateTime = new Date().toISOString();
      const forms: SampleFormData[] = participantsData.map((participant, index) => {
        const sampleKit = sampleKitsData[index] || sampleKitsData[0]; // Fallback to first kit if not enough kits
        
        return {
          participantId: participant.id,
          participantName: participant.participant_name,
          sampleKitId: sampleKit.id,
          kitCode: sampleKit.kit_code,
          sample_code: '', // User input required
          sample_type: '', // User input required
          collection_date: currentDateTime,
          received_date: currentDateTime,
          status: 'received',
          shipping_tracking: sampleKit.tracking_number?.toString() || '',
          notes: '',
          sample_quality: '', // User input required
        };
      });

      setSampleForms(forms);

      console.log('✅ Modal data loaded successfully');
      console.log('👥 Participants:', participantsData.length);
      console.log('📦 Sample kits:', sampleKitsData.length);

    } catch (error: any) {
      console.error('❌ Error loading modal data:', error);
      setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoadingData(false);
    }
  };

  const updateSampleForm = (index: number, field: keyof SampleFormData, value: string) => {
    setSampleForms(prev => prev.map((form, i) => 
      i === index ? { ...form, [field]: value } : form
    ));

    // Clear validation error for this field
    const errorKey = `${index}_${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const validateForms = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    sampleForms.forEach((form, index) => {
      // Required fields validation
      if (!form.sample_code.trim()) {
        errors[`${index}_sample_code`] = 'Mã mẫu là bắt buộc';
        isValid = false;
      }

      if (!form.sample_type.trim()) {
        errors[`${index}_sample_type`] = 'Loại mẫu là bắt buộc';
        isValid = false;
      }

      if (!form.sample_quality.trim()) {
        errors[`${index}_sample_quality`] = 'Chất lượng mẫu là bắt buộc';
        isValid = false;
      }

      // Check for duplicate sample codes
      const duplicateIndex = sampleForms.findIndex((otherForm, otherIndex) => 
        otherIndex !== index && otherForm.sample_code.trim() === form.sample_code.trim() && form.sample_code.trim()
      );
      
      if (duplicateIndex !== -1) {
        errors[`${index}_sample_code`] = 'Mã mẫu đã bị trùng';
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
  if (!validateForms()) {
    setError('Vui lòng kiểm tra và điền đầy đủ thông tin bắt buộc');
   console.log('💾 Creating samples for appointment:', appointment?.id);
  console.log('📋 Appointment data:', {
    orderId: appointment?.orderId,
    userId: appointment?.userId,
    rawData: appointment?.rawData
  });
    return;
  }

  try {
    setLoading(true);
    setError('');

    console.log('💾 Creating samples for appointment:', appointment?.id);

    // Create all samples
    const samplePromises = sampleForms.map(async (form, index) => {
      const sampleData: SampleRequest = {
        sample_code: form.sample_code.trim(),
        sample_type: form.sample_type.trim(),
        collection_date: form.collection_date,
        received_date: form.received_date,
        status: form.status,
        shipping_tracking: form.shipping_tracking,
        notes: form.notes.trim(),
        sample_quality: form.sample_quality.trim(),
        sampleKitsId: form.sampleKitId,
        ordersId: appointment?.orderId || '',
      };
      console.log(`📦 Sample ${index + 1} data:`, sampleData);
      return SampleService.createSample(sampleData);
      
    });

    await Promise.all(samplePromises);

    console.log('✅ All samples created successfully');

    // Notify parent component
    await onSamplesCreated(appointment!.id);

    // Close modal
    onClose();

  } catch (error: any) {
    console.error('❌ Error creating samples:', error);
    setError(error.message || 'Có lỗi xảy ra khi tạo mẫu xét nghiệm');
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <>
      {/* ✅ Fixed Backdrop với blur effect */}
      <div 
        className="absolute z-40 transition-all duration-200"
        onClick={handleBackdropClick}
      />
      
      {/* ✅ Positioned Modal with better positioning logic */}
      <div
        ref={modalRef}
        className="absolute z-50 transition-all duration-200 ease-out"
        style={{
          top: `${modalPosition.top}px`,
          left: `${modalPosition.left}px`,
          width: `${Math.min(modalPosition.width, window.innerWidth - 40)}px`, // Respect screen width
          maxWidth: 'calc(100vw - 40px)',
          maxHeight: 'calc(100vh - 40px)',
          // ✅ Ensure modal doesn't go off screen
          transform: modalPosition.left + modalPosition.width > window.innerWidth 
            ? `translateX(-${(modalPosition.left + modalPosition.width) - window.innerWidth + 20}px)` 
            : 'none'
        }}
      >
        {/* ✅ Arrow pointing to the trigger card - only show if positioned below card */}
        {modalPosition.positioning === 'below-card' && (
          <div 
            className="absolute -top-2 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45 z-10"
            style={{
              left: triggerElement ? Math.min(32, triggerElement.getBoundingClientRect().width / 2) : 32
            }}
          />
        )}
        
        <div 
          className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e5e7eb'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TestTube className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tạo Mẫu Xét Nghiệm</h2>
                <p className="text-sm text-gray-600">
                  {appointment.customerName} - {appointment.id.substring(0, 8)}...
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white/50 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content with custom scrollbar */}
          <div className="max-h-[60vh] overflow-y-auto" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <div className="p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loadingData ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Đang tải thông tin người tham gia và kit xét nghiệm...</p>
                </div>
              ) : (
                <>
                  {/* Summary Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">Tổng quan</h3>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="bg-white/70 rounded-lg p-3">
                        <span className="text-blue-700 font-medium block">Người tham gia</span>
                        <span className="text-blue-900 text-lg font-bold">{participants.length}</span>
                      </div>
                      <div className="bg-white/70 rounded-lg p-3">
                        <span className="text-blue-700 font-medium block">Kit có sẵn</span>
                        <span className="text-blue-900 text-lg font-bold">{sampleKits.length}</span>
                      </div>
                      <div className="bg-white/70 rounded-lg p-3">
                        <span className="text-blue-700 font-medium block">Mẫu sẽ tạo</span>
                        <span className="text-blue-900 text-lg font-bold">{sampleForms.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Forms */}
                  <div className="space-y-4">
                    {sampleForms.map((form, index) => (
                      <div key={form.participantId} className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                        {/* Participant Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-white font-semibold text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{form.participantName}</h4>
                              <p className="text-sm text-gray-500">Kit: {form.kitCode}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-lg px-3 py-1 border">
                            <Package className="w-4 h-4" />
                            <span>ID: {form.sampleKitId.substring(0, 8)}...</span>
                          </div>
                        </div>

                        {/* Form Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Sample Code - Required */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Mã mẫu <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={form.sample_code}
                              onChange={(e) => updateSampleForm(index, 'sample_code', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                validationErrors[`${index}_sample_code`] ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                              }`}
                              placeholder="Nhập mã mẫu"
                              disabled={loading}
                            />
                            {validationErrors[`${index}_sample_code`] && (
                              <p className="text-red-500 text-xs mt-1">{validationErrors[`${index}_sample_code`]}</p>
                            )}
                          </div>

                          {/* Sample Type - Required */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Loại mẫu <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={form.sample_type}
                              onChange={(e) => updateSampleForm(index, 'sample_type', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                validationErrors[`${index}_sample_type`] ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                              }`}
                              placeholder="VD: blood, saliva, hair, tissue"
                              disabled={loading}
                            />
                            {validationErrors[`${index}_sample_type`] && (
                              <p className="text-red-500 text-xs mt-1">{validationErrors[`${index}_sample_type`]}</p>
                            )}
                          </div>

                          {/* Sample Quality - Required */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Chất lượng mẫu <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={form.sample_quality}
                              onChange={(e) => updateSampleForm(index, 'sample_quality', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                validationErrors[`${index}_sample_quality`] ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                              }`}
                              placeholder="VD: good, fair, poor"
                              disabled={loading}
                            />
                            {validationErrors[`${index}_sample_quality`] && (
                              <p className="text-red-500 text-xs mt-1">{validationErrors[`${index}_sample_quality`]}</p>
                            )}
                          </div>

                          {/* Collection Date */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thu thập</label>
                            <input
                              type="datetime-local"
                              value={form.collection_date.substring(0, 16)}
                              onChange={(e) => updateSampleForm(index, 'collection_date', new Date(e.target.value).toISOString())}
                              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              disabled={loading}
                            />
                          </div>

                          {/* Received Date */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày nhận</label>
                            <input
                              type="datetime-local"
                              value={form.received_date.substring(0, 16)}
                              onChange={(e) => updateSampleForm(index, 'received_date', new Date(e.target.value).toISOString())}
                              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              disabled={loading}
                            />
                          </div>

                          {/* Shipping Tracking */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tracking</label>
                            <input
                              type="text"
                              value={form.shipping_tracking}
                              onChange={(e) => updateSampleForm(index, 'shipping_tracking', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              placeholder="Mã tracking"
                              disabled={loading}
                            />
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                          <textarea
                            value={form.notes}
                            onChange={(e) => updateSampleForm(index, 'notes', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                            placeholder="Ghi chú về mẫu xét nghiệm..."
                            disabled={loading}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50/50">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
            >
              Hủy
            </button>

            <div className="flex items-center gap-4">
              {/* Sample Count Info */}
              <div className="text-sm text-gray-600 bg-white rounded-lg px-3 py-2 border">
                Sẽ tạo <span className="font-semibold text-blue-600">{sampleForms.length}</span> mẫu xét nghiệm
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading || loadingData || sampleForms.length === 0}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tạo mẫu...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Tạo mẫu xét nghiệm</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SampleCreationModal;