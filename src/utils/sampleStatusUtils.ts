// utils/sampleStatusUtils.ts
import { SampleStatus } from "../services/staffService/sampleStatusManager";

export class SampleStatusUtils {
  /**
   * Lấy màu badge cho sample status
   */
  static getStatusColor(status: string): {
    bg: string;
    text: string;
    border: string;
  } {
    switch (status) {
      case SampleStatus.RECEIVED:
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200'
        };
      case SampleStatus.PROCESSING:
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200'
        };
      case SampleStatus.COMPLETED:
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200'
        };
      case SampleStatus.FAILED:
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200'
        };
      case SampleStatus.REJECTED:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          border: 'border-gray-200'
        };
    }
  }

  /**
   * Lấy text hiển thị cho sample status
   */
  static getStatusText(status: string): string {
    switch (status) {
      case SampleStatus.RECEIVED:
        return 'Đã nhận';
      case SampleStatus.PROCESSING:
        return 'Đang xét nghiệm';
      case SampleStatus.COMPLETED:
        return 'Hoàn thành';
      case SampleStatus.FAILED:
        return 'Thất bại';
      case SampleStatus.REJECTED:
        return 'Từ chối';
      default:
        return status || 'Không xác định';
    }
  }

  /**
   * Lấy icon cho sample status
   */
  static getStatusIcon(status: string): string {
    switch (status) {
      case SampleStatus.RECEIVED:
        return '📥';
      case SampleStatus.PROCESSING:
        return '⚗️';
      case SampleStatus.COMPLETED:
        return '✅';
      case SampleStatus.FAILED:
        return '❌';
      case SampleStatus.REJECTED:
        return '🚫';
      default:
        return '❓';
    }
  }

  /**
   * Kiểm tra status có đang active không (đang xử lý)
   */
  static isActiveStatus(status: string): boolean {
    return status === SampleStatus.PROCESSING;
  }

  /**
   * Kiểm tra status có hoàn thành không
   */
  static isCompletedStatus(status: string): boolean {
    return status === SampleStatus.COMPLETED;
  }

  /**
   * Kiểm tra status có thất bại không
   */
  static isFailedStatus(status: string): boolean {
    return status === SampleStatus.FAILED || status === SampleStatus.REJECTED;
  }

  /**
   * Lấy progress percentage cho sample status
   */
  static getStatusProgress(status: string): number {
    switch (status) {
      case SampleStatus.RECEIVED:
        return 25;
      case SampleStatus.PROCESSING:
        return 75;
      case SampleStatus.COMPLETED:
        return 100;
      case SampleStatus.FAILED:
      case SampleStatus.REJECTED:
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Format thời gian cho sample logs
   */
  static formatSampleTimestamp(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Tạo sample status badge component props
   */
  static getStatusBadgeProps(status: string) {
    const colors = this.getStatusColor(status);
    const text = this.getStatusText(status);
    const icon = this.getStatusIcon(status);

    return {
      className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`,
      text,
      icon,
      status
    };
  }

  /**
   * Validate sample code format
   */
  static validateSampleCode(code: string): { isValid: boolean; error?: string } {
    if (!code || code.trim().length === 0) {
      return { isValid: false, error: 'Mã mẫu không được để trống' };
    }

    if (code.length < 3) {
      return { isValid: false, error: 'Mã mẫu phải có ít nhất 3 ký tự' };
    }

    if (code.length > 50) {
      return { isValid: false, error: 'Mã mẫu không được quá 50 ký tự' };
    }

    // Check for special characters that might cause issues
    const validPattern = /^[A-Za-z0-9\-_]+$/;
    if (!validPattern.test(code)) {
      return { isValid: false, error: 'Mã mẫu chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới' };
    }

    return { isValid: true };
  }

  /**
   * Generate sample code suggestion
   */
  static generateSampleCodeSuggestion(participantName: string, index: number): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const nameInitials = participantName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 3);
    
    return `${nameInitials}${dateStr}${String(index + 1).padStart(2, '0')}`;
  }

  /**
   * Get next possible status transitions
   */
  static getNextPossibleStatuses(currentStatus: string): SampleStatus[] {
    switch (currentStatus) {
      case SampleStatus.RECEIVED:
        return [SampleStatus.PROCESSING, SampleStatus.REJECTED];
      case SampleStatus.PROCESSING:
        return [SampleStatus.COMPLETED, SampleStatus.FAILED];
      case SampleStatus.FAILED:
        return [SampleStatus.PROCESSING]; // Can retry
      case SampleStatus.COMPLETED:
      case SampleStatus.REJECTED:
      default:
        return [];
    }
  }

  /**
   * Check if status transition is allowed
   */
  static canTransitionTo(currentStatus: string, newStatus: string): boolean {
    const possibleStatuses = this.getNextPossibleStatuses(currentStatus);
    return possibleStatuses.includes(newStatus as SampleStatus);
  }

  /**
   * Get sample quality validation
   */
  static validateSampleQuality(quality: string): { isValid: boolean; error?: string } {
    const validQualities = ['excellent', 'good', 'fair', 'poor', 'tốt', 'khá', 'trung bình', 'kém'];
    
    if (!quality || quality.trim().length === 0) {
      return { isValid: false, error: 'Chất lượng mẫu không được để trống' };
    }

    return { isValid: true };
  }

  /**
   * Format sample notes for display
   */
  static formatSampleNotes(notes: string): string {
    if (!notes) return '';
    
    // Replace timestamps with formatted dates
    return notes.replace(
      /\[([\d\/\s:,-]+)\]/g, 
      (match, dateStr) => {
        try {
          const date = new Date(dateStr);
          return `[${this.formatSampleTimestamp(date.toISOString())}]`;
        } catch {
          return match;
        }
      }
    );
  }
}