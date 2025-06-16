import React, { useState } from 'react';
import { XCircle, Upload, FileText, Save, AlertTriangle, CheckCircle } from 'lucide-react';

interface Appointment {
  id: string;
  customerName: string;
  phone: string;
  serviceType: string;
  locationType: 'Tại nhà' | 'Cơ sở y tế';
  legalType: 'Pháp Lý' | 'Dân Sự';
}

interface TestResult {
  id: string;
  appointmentId: string;
  resultType: 'Positive' | 'Negative' | 'Inconclusive';
  resultPercentage?: number;
  conclusion: string;
  resultDetails: string;
  resultFile?: File;
  testedDate: string;
  verifiedByStaffId: string;
}

interface TestResultModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveResult: (result: TestResult) => void;
}

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

  if (!isOpen || !appointment) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, resultFile: 'Chỉ chấp nhận file PDF, JPG, PNG' }));
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, resultFile: 'File không được vượt quá 5MB' }));
        return;
      }

      setFormData(prev => ({ ...prev, resultFile: file }));
      setErrors(prev => ({ ...prev, resultFile: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.conclusion.trim()) {
      newErrors.conclusion = 'Vui lòng nhập kết luận xét nghiệm';
    }

    if (!formData.resultDetails.trim()) {
      newErrors.resultDetails = 'Vui lòng nhập chi tiết kết quả';
    }

    if (formData.resultType === 'Positive' && appointment.serviceType.includes('ADN')) {
      if (!formData.resultPercentage) {
        newErrors.resultPercentage = 'Vui lòng nhập tỷ lệ phần trăm cho xét nghiệm ADN';
      } else if (parseFloat(formData.resultPercentage) < 0 || parseFloat(formData.resultPercentage) > 100) {
        newErrors.resultPercentage = 'Tỷ lệ phần trăm phải từ 0 đến 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const result: TestResult = {
        id: `result-${Date.now()}`,
        appointmentId: appointment.id,
        resultType: formData.resultType,
        resultPercentage: formData.resultPercentage ? parseFloat(formData.resultPercentage) : undefined,
        conclusion: formData.conclusion,
        resultDetails: formData.resultDetails,
        resultFile: formData.resultFile || undefined,
        testedDate: new Date().toISOString(),
        verifiedByStaffId: 'staff-001' // In real app, get from auth context
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSaveResult(result);
      
      // Reset form
      setFormData({
        resultType: 'Positive',
        resultPercentage: '',
        conclusion: '',
        resultDetails: '',
        resultFile: null
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving test result:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResultTypeConfig = (type: string) => {
    const configs = {
      'Positive': { color: 'text-green-600 bg-green-50 border-green-200', label: 'Dương tính' },
      'Negative': { color: 'text-red-600 bg-red-50 border-red-200', label: 'Âm tính' },
      'Inconclusive': { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Không xác định' }
    };
    return configs[type] || configs['Positive'];
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
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
                {appointment.customerName} - {appointment.serviceType}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

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
                      className={`p-3 rounded-lg border-2 transition-all ${
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
            {formData.resultType === 'Positive' && appointment.serviceType.includes('ADN') && (
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
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
                      <span className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        Chọn file
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
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
                      className="ml-auto text-red-500 hover:text-red-700"
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
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
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