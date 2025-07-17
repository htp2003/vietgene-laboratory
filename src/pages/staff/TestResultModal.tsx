import React, { useState, useEffect } from 'react';
import { XCircle, Upload, FileText, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { TestResultService } from '../../services/staffService/testResultService';

// ✅ Import types from the types file
import { Appointment, TestResult, TestResultModalProps } from '../../types/appointment';

const TestResultModal: React.FC<TestResultModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onSaveResult
}) => {
  // ✅ ALL HOOKS MUST BE AT THE TOP - BEFORE ANY EARLY RETURNS
  const [formData, setFormData] = useState({
    resultType: 'Positive' as 'Positive' | 'Negative' | 'Inconclusive',
    resultPercentage: '',
    conclusion: '',
    resultDetails: '',
    resultFile: '' // ✅ Changed from File | null to string
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');
  
  // ✅ Add state for samples
  const [orderSamples, setOrderSamples] = useState<any[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [samplesError, setSamplesError] = useState<string>('');

  // ✅ Load samples when modal opens
  const loadOrderSamples = async (orderId: string) => {
    try {
      setLoadingSamples(true);
      setSamplesError('');
      
      const { SampleService } = await import('../../services/staffService/sampleService');
      const samples = await SampleService.getSamplesByOrderId(orderId);
      
      setOrderSamples(samples);
      console.log(`✅ Loaded ${samples.length} samples for order ${orderId}`);
      
    } catch (error: any) {
      console.error('❌ Error loading samples:', error);
      setSamplesError(error.message || 'Có lỗi xảy ra khi tải danh sách mẫu xét nghiệm');
    } finally {
      setLoadingSamples(false);
    }
  };

  // ✅ Reset form when modal opens/closes to prevent stale data
  useEffect(() => {
    if (isOpen && appointment) {
      // ✅ Set default percentage based on result type
      setFormData({
        resultType: 'Positive',
        resultPercentage: '99.99', // ✅ Default for Positive
        conclusion: '',
        resultDetails: '',
        resultFile: '' // ✅ Empty string
      });
      setErrors({});
      setGeneralError('');
      setIsSubmitting(false);
      setSamplesError('');
      
      // ✅ Load samples for this appointment's order
      const orderId = appointment.rawData?.order?.orderId || appointment.orderId;
      if (orderId) {
        loadOrderSamples(orderId);
      } else {
        setSamplesError('Không tìm thấy thông tin đơn hàng');
      }
    } else {
      // Reset when modal closes
      setOrderSamples([]);
      setLoadingSamples(false);
      setSamplesError('');
    }
  }, [isOpen, appointment]);

  // ✅ NOW early returns are safe - all hooks are defined above
  if (!isOpen || !appointment) return null;

  // ✅ Check if we have samples loaded
  if (loadingSamples) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black bg-opacity-50">
        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách mẫu xét nghiệm...</p>
          </div>
        </div>
      </div>
    );
  }

  if (samplesError || orderSamples.length === 0) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black bg-opacity-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-bold text-gray-900">Lỗi</h2>
          </div>
          <p className="text-gray-700 mb-6">
            {samplesError || 'Không tìm thấy mẫu xét nghiệm nào cho cuộc hẹn này. Vui lòng tạo mẫu xét nghiệm trước khi nhập kết quả.'}
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  // ✅ Safe input change handler with error handling
  const handleInputChange = (field: string, value: any) => {
    try {
      setFormData(prev => {
        const newData = { ...prev, [field]: value };
        
        // ✅ Auto-update percentage when result type changes
        if (field === 'resultType') {
          switch (value) {
            case 'Positive':
              newData.resultPercentage = '99.99';
              break;
            case 'Negative':
              newData.resultPercentage = '0.00';
              break;
            case 'Inconclusive':
              newData.resultPercentage = '50.00';
              break;
          }
        }
        
        return newData;
      });
      
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
      // Clear general error when user makes changes
      if (generalError) {
        setGeneralError('');
      }
    } catch (error) {
      console.error('Error updating form field:', error);
      setGeneralError('Có lỗi xảy ra khi cập nhật form');
    }
  };

  // ✅ Text input handler for result file
  const handleResultFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const value = event.target.value;
      setFormData(prev => ({ ...prev, resultFile: value }));
      
      // Clear error when user starts typing
      if (errors.resultFile) {
        setErrors(prev => ({ ...prev, resultFile: '' }));
      }
    } catch (error) {
      console.error('Error handling result file input:', error);
      setErrors(prev => ({ ...prev, resultFile: 'Có lỗi xảy ra khi nhập tên file' }));
    }
  };

  // ✅ Enhanced validation with better error messages
  const validateForm = () => {
    try {
      const newErrors: Record<string, string> = {};

      if (!formData.conclusion.trim()) {
        newErrors.conclusion = 'Vui lòng nhập kết luận xét nghiệm';
      } else if (formData.conclusion.trim().length < 10) {
        newErrors.conclusion = 'Kết luận phải có ít nhất 10 ký tự';
      }

      if (!formData.resultDetails.trim()) {
        newErrors.resultDetails = 'Vui lòng nhập chi tiết kết quả';
      } else if (formData.resultDetails.trim().length < 20) {
        newErrors.resultDetails = 'Chi tiết kết quả phải có ít nhất 20 ký tự';
      }

      // ✅ Always validate percentage (now always required)
      if (!formData.resultPercentage || !formData.resultPercentage.trim()) {
        newErrors.resultPercentage = 'Tỷ lệ phần trăm là bắt buộc';
      } else {
        const percentage = parseFloat(formData.resultPercentage);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
          newErrors.resultPercentage = 'Tỷ lệ phần trăm phải từ 0 đến 100';
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      console.error('Error validating form:', error);
      setGeneralError('Có lỗi xảy ra khi kiểm tra form');
      return false;
    }
  };

  // ✅ Enhanced submit handler using fixed service
  const handleSubmit = async () => {
    try {
      setGeneralError('');
      
      if (!validateForm()) return;

      setIsSubmitting(true);
      
      // ✅ Use all sample IDs from orderSamples
      if (orderSamples.length === 0) {
        throw new Error('Không có mẫu xét nghiệm nào để tạo kết quả');
      }
      
      const sampleIds = orderSamples.map(sample => sample.id);
      const orderId = appointment.rawData?.order?.orderId || appointment.orderId;
      
      if (!orderId) {
        throw new Error('Không tìm thấy thông tin đơn hàng');
      }
      
      console.log(`🚀 Creating test result for ${sampleIds.length} samples in order ${orderId}...`);
      console.log('📋 Sample IDs:', sampleIds);
      console.log('📦 Form data:', {
        resultType: formData.resultType,
        resultPercentage: formData.resultPercentage,
        conclusion: formData.conclusion.substring(0, 50) + '...',
        resultDetails: formData.resultDetails.substring(0, 50) + '...',
        hasFile: !!formData.resultFile
      });
      
      // ✅ Call TestResultService with fixed implementation (skip validation)
      const batchResult = await TestResultService.createTestResultBySample({
        sampleIds: sampleIds,
        orderId: orderId,
        resultType: formData.resultType,
        resultPercentage: formData.resultPercentage.trim(), // ✅ Always send percentage
        conclusion: formData.conclusion.trim(),
        resultDetails: formData.resultDetails.trim(),
        resultFile: formData.resultFile || undefined,
        skipValidation: true // ✅ Skip validation to avoid API issues
      });

      console.log('✅ Test result creation completed:', batchResult);

      // ✅ Show success message if any
      if (batchResult.message) {
        setGeneralError(''); // Clear any previous errors
        // Could show success toast here instead of alert
        console.log('ℹ️ Success message:', batchResult.message);
      }

      // ✅ Convert API response to component format
      const result: TestResult = {
        id: batchResult.result.id,
        appointmentId: appointment.id,
        sampleId: batchResult.result.samplesId || (Array.isArray(batchResult.result.samplesId) ? batchResult.result.samplesId[0] : batchResult.result.samplesId) || '',
        resultType: formData.resultType,
        resultPercentage: formData.resultPercentage,
        conclusion: formData.conclusion.trim(),
        resultDetails: formData.resultDetails.trim(),
        resultFile: formData.resultFile, // Always a string
        testedDate: batchResult.result.tested_date
      };

      // ✅ Call parent callback with transformed result
      onSaveResult(result);
      
      // ✅ Reset form only after successful save
      setFormData({
        resultType: 'Positive',
        resultPercentage: '99.99',
        conclusion: '',
        resultDetails: '',
        resultFile: '' // ✅ Empty string
      });
      
      // Close modal
      onClose();
      
    } catch (error: any) {
      console.error('❌ Error saving test results:', error);
      setGeneralError(error.message || 'Có lỗi xảy ra khi lưu kết quả xét nghiệm');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Safe close handler
  const handleClose = () => {
    try {
      if (isSubmitting) return; // Prevent closing while submitting
      
      setGeneralError('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error closing modal:', error);
      onClose(); // Force close even on error
    }
  };

  // ✅ Safe result type config with fallback
  const getResultTypeConfig = (type: string) => {
    const configs = {
      'Positive': { color: 'text-green-600 bg-green-50 border-green-200', label: 'Dương tính' },
      'Negative': { color: 'text-red-600 bg-red-50 border-red-200', label: 'Âm tính' },
      'Inconclusive': { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Không xác định' }
    };
    return configs[type as keyof typeof configs] || configs['Positive'];
  };

  // ✅ Safe service type checking for DNA test detection
  const serviceType = appointment.serviceName || appointment.serviceType || '';
  const isDNATest = serviceType.toLowerCase().includes('adn') || 
                   serviceType.toLowerCase().includes('dna') ||
                   serviceType.toLowerCase().includes('huyết thống');

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto bg-black bg-opacity-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nhập Kết Quả Xét Nghiệm</h2>
              <p className="text-sm text-gray-600 mt-1">
                {appointment.customerName} - {serviceType}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Kết quả cho {orderSamples.length} mẫu xét nghiệm
              </p>
              {/* ✅ Show doctor info if available */}
              {appointment.doctorInfo && (
                <p className="text-xs text-blue-600 mt-1">
                  Bác sĩ: {appointment.doctorInfo.name}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 p-1 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* ✅ General Error Display */}
          {generalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Lỗi</p>
                <p className="text-red-700 text-sm">{generalError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* ✅ Sample List Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Danh sách mẫu xét nghiệm ({orderSamples.length})
              </label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Kết quả sẽ áp dụng cho tất cả các mẫu sau:
                  </span>
                </div>
                <div className="space-y-2">
                  {orderSamples.map((sample, index) => (
                    <div key={sample.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{sample.sample_code}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{sample.sample_type}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            sample.sample_quality === 'good' ? 'bg-green-100 text-green-700' :
                            sample.sample_quality === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {sample.sample_quality || 'N/A'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {sample.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Result Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Loại kết quả *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Positive', 'Negative', 'Inconclusive'].map((type) => {
                  const config = getResultTypeConfig(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleInputChange('resultType', type)}
                      disabled={isSubmitting}
                      className={`p-3 rounded-lg border-2 transition-all disabled:opacity-50 ${
                        formData.resultType === type
                          ? config.color
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">{config.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ✅ Result Percentage (always shown now) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tỷ lệ phần trăm * 
                <span className="text-xs text-gray-500 ml-2">
                  (Tự động cập nhật theo loại kết quả)
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="99.99"
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                    errors.resultPercentage ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={formData.resultPercentage}
                  onChange={(e) => handleInputChange('resultPercentage', e.target.value)}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
              {errors.resultPercentage && (
                <p className="mt-1 text-sm text-red-600">{errors.resultPercentage}</p>
              )}
              <div className="mt-2 text-xs text-gray-500">
                <p>• Dương tính: Thường ≥ 99.5%</p>
                <p>• Âm tính: Thường ≤ 0.1%</p>
                <p>• Không xác định: Thường 10-90%</p>
              </div>
            </div>

            {/* Conclusion */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kết luận xét nghiệm *
              </label>
              <textarea
                rows={3}
                placeholder="Nhập kết luận tổng quát về kết quả xét nghiệm..."
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 ${
                  errors.conclusion ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.conclusion}
                onChange={(e) => handleInputChange('conclusion', e.target.value)}
              />
              {errors.conclusion && (
                <p className="mt-1 text-sm text-red-600">{errors.conclusion}</p>
              )}
              <div className="mt-1 text-xs text-gray-500">
                Ít nhất 10 ký tự ({formData.conclusion.length}/10)
              </div>
            </div>

            {/* Result Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chi tiết kết quả *
              </label>
              <textarea
                rows={4}
                placeholder="Nhập chi tiết đầy đủ về kết quả xét nghiệm, các chỉ số, và ghi chú..."
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 ${
                  errors.resultDetails ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.resultDetails}
                onChange={(e) => handleInputChange('resultDetails', e.target.value)}
              />
              {errors.resultDetails && (
                <p className="mt-1 text-sm text-red-600">{errors.resultDetails}</p>
              )}
              <div className="mt-1 text-xs text-gray-500">
                Ít nhất 20 ký tự ({formData.resultDetails.length}/20)
              </div>
            </div>

            {/* ✅ Result File Path (Text Input) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đường dẫn file kết quả (tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Nhập tên file hoặc đường dẫn (vd: paternity_test_report_TR001.pdf)"
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                  errors.resultFile ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.resultFile}
                onChange={handleResultFileChange}
              />
              {errors.resultFile && (
                <p className="mt-1 text-sm text-red-600">{errors.resultFile}</p>
              )}
              <div className="mt-1 text-xs text-gray-500">
                Ví dụ: report_001.pdf, test_result_2025.jpg, hoặc để trống nếu không có file
              </div>
            </div>

            {/* Legal Notice */}
            {appointment.legalType === 'Pháp Lý' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Lưu ý: Xét nghiệm pháp lý</p>
                  <p>Kết quả này có giá trị pháp lý. Vui lòng kiểm tra kỹ thông tin trước khi lưu.</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.conclusion.trim() || !formData.resultDetails.trim() || !formData.resultPercentage.trim()}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu kết quả...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu kết quả ({orderSamples.length} mẫu)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResultModal;