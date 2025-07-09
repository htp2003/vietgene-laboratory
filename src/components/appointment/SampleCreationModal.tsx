import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';

import { Appointment } from '../../types/appointment';
import { SampleService, SampleRequest, SampleKit, SampleKitsService } from '../../services/staffService/sampleService';
import { OrderParticipantsService, OrderParticipant } from '../../services/staffService/orderParticipantService';

interface SampleCreationModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSamplesCreated: (appointmentId: string) => Promise<void>;
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
  onSamplesCreated
}) => {
  const [participants, setParticipants] = useState<OrderParticipant[]>([]);
  const [sampleKits, setSampleKits] = useState<SampleKit[]>([]);
  const [sampleForms, setSampleForms] = useState<SampleFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('💾 Creating samples for appointment:', appointment?.id);

      // Create all samples
      const samplePromises = sampleForms.map(async (form) => {
        const sampleData: SampleRequest = {
          sample_code: form.sample_code.trim(),
          sample_type: form.sample_type.trim(),
          collection_date: form.collection_date,
          received_date: form.received_date,
          status: form.status,
          shipping_tracking: form.shipping_tracking,
          notes: form.notes.trim(),
          sample_quality: form.sample_quality.trim(),
          sampleKitsId: form.sampleKitId
        };

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

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tạo Mẫu Xét Nghiệm</h2>
            <p className="text-sm text-gray-600 mt-1">
              Lịch hẹn: {appointment.customerName} - {appointment.id.substring(0, 8)}...
            </p>
          </div>

          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 p-1 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
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
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Tổng quan</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Số người tham gia:</span>
                    <span className="text-blue-900 ml-2">{participants.length}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Số kit có sẵn:</span>
                    <span className="text-blue-900 ml-2">{sampleKits.length}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Mẫu sẽ tạo:</span>
                    <span className="text-blue-900 ml-2">{sampleForms.length}</span>
                  </div>
                </div>
              </div>

              {/* Sample Forms */}
              <div className="space-y-6">
                {sampleForms.map((form, index) => (
                  <div key={form.participantId} className="border border-gray-200 rounded-lg p-6">
                    {/* Participant Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{form.participantName}</h4>
                          <p className="text-sm text-gray-500">Kit: {form.kitCode}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>ID Kit: {form.sampleKitId.substring(0, 8)}...</span>
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
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            validationErrors[`${index}_sample_code`] ? 'border-red-300' : 'border-gray-300'
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
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            validationErrors[`${index}_sample_type`] ? 'border-red-300' : 'border-gray-300'
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
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            validationErrors[`${index}_sample_quality`] ? 'border-red-300' : 'border-gray-300'
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>

          <div className="flex items-center gap-3">
            {/* Sample Count Info */}
            <div className="text-sm text-gray-600">
              Sẽ tạo <span className="font-semibold text-blue-600">{sampleForms.length}</span> mẫu xét nghiệm
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || loadingData || sampleForms.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
};

export default SampleCreationModal;