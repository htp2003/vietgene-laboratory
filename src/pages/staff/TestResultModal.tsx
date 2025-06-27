import React, { useState, useEffect } from 'react';
import { XCircle, Upload, FileText, Save, AlertTriangle, CheckCircle } from 'lucide-react';

// ✅ Import shared types
import { Appointment, TestResult, TestResultModalProps } from '../../types/appointment';

const TestResultModal: React.FC<TestResultModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onSaveResult
}) => {
  const [formData, setFormData] = useState({
    resultType: 'Positive' as 'Positive' | 'Negative' | 'Inconclusive',
    resultPercentage: '',
    conclusion: '',
    resultDetails: '',
    resultFile: null as File | null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');

  // ✅ Reset form when modal opens/closes to prevent stale data
  useEffect(() => {
    if (isOpen && appointment) {
      setFormData({
        resultType: 'Positive',
        resultPercentage: '',
        conclusion: '',
        resultDetails: '',
        resultFile: null
      });
      setErrors({});
      setGeneralError('');
      setIsSubmitting(false);
    }
  }, [isOpen, appointment]);

  // ✅ Don't render anything if modal is closed or no appointment
  if (!isOpen || !appointment) return null;

  // ✅ Safe input change handler with error handling
  const handleInputChange = (field: string, value: any) => {
    try {
      setFormData(prev => ({ ...prev, [field]: value }));
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

  // ✅ Enhanced file upload handler with better error handling
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, resultFile: 'Chỉ chấp nhận file PDF, JPG, PNG' }));
        // Reset file input
        event.target.value = '';
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, resultFile: 'File không được vượt quá 5MB' }));
        // Reset file input
        event.target.value = '';
        return;
      }

      setFormData(prev => ({ ...prev, resultFile: file }));
      setErrors(prev => ({ ...prev, resultFile: '' }));
      
    } catch (error) {
      console.error('Error handling file upload:', error);
      setErrors(prev => ({ ...prev, resultFile: 'Có lỗi xảy ra khi xử lý file' }));
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

      // ✅ Safe service type checking
      const serviceType = appointment.serviceName || appointment.serviceType || '';
      const isDNATest = serviceType.toLowerCase().includes('adn') || 
                       serviceType.toLowerCase().includes('dna') ||
                       serviceType.toLowerCase().includes('huyết thống');

      if (formData.resultType === 'Positive' && isDNATest) {
        if (!formData.resultPercentage) {
          newErrors.resultPercentage = 'Vui lòng nhập tỷ lệ phần trăm cho xét nghiệm ADN';
        } else {
          const percentage = parseFloat(formData.resultPercentage);
          if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            newErrors.resultPercentage = 'Tỷ lệ phần trăm phải từ 0 đến 100';
          }
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

  // ✅ Enhanced submit handler with comprehensive error handling
  const handleSubmit = async () => {
    try {
      setGeneralError('');
      
      if (!validateForm()) return;

      setIsSubmitting(true);
      
      // ✅ Create result object with error handling
      const result: TestResult = {
        id: `result-${Date.now()}`,
        appointmentId: appointment.id,
        resultType: formData.resultType,
        resultPercentage: formData.resultPercentage ? parseFloat(formData.resultPercentage) : undefined,
        conclusion: formData.conclusion.trim(),
        resultDetails: formData.resultDetails.trim(),
        resultFile: formData.resultFile || undefined,
        testedDate: new Date().toISOString(),
        verifiedByStaffId: 'staff-001' // In real app, get from auth context
      };

      console.log('Saving test result:', result);
      
      // ✅ Call save function with error handling
      await onSaveResult(result);
      
      console.log('Test result saved successfully');
      
      // ✅ Reset form only after successful save
      setFormData({
        resultType: 'Positive',
        resultPercentage: '',
        conclusion: '',
        resultDetails: '',
        resultFile: null
      });
      
      // Close modal
      onClose();
      
    } catch (error: any) {
      console.error('Error saving test result:', error);
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
      className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8"
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

            {/* Result Percentage (for DNA tests) */}
            {formData.resultType === 'Positive' && isDNATest && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tỷ lệ phần trăm *
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
              </div>
            )}

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
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File kết quả (tùy chọn)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label className="cursor-pointer">
                      <span className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}>
                        Chọn file
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={isSubmitting}
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">PDF, JPG, PNG (tối đa 5MB)</p>
                </div>
                
                {formData.resultFile && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-800">{formData.resultFile.name}</span>
                    <button
                      type="button"
                      onClick={() => handleInputChange('resultFile', null)}
                      disabled={isSubmitting}
                      className="ml-auto text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {errors.resultFile && (
                  <p className="mt-2 text-sm text-red-600">{errors.resultFile}</p>
                )}
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
              disabled={isSubmitting || !formData.conclusion.trim() || !formData.resultDetails.trim()}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu kết quả
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