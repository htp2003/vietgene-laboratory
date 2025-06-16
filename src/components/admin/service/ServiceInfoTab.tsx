import React from 'react';
import { Service } from '../../../api/services.api';

interface ServiceInfoTabProps {
  service: Service;
}

export default function ServiceInfoTab({ service }: ServiceInfoTabProps) {
  return (
    <div className="space-y-2">
      <div><b>Tên dịch vụ:</b> {service.service_name}</div>
      <div><b>Loại dịch vụ:</b> {service.service_type}</div>
      <div><b>Nhóm xét nghiệm:</b> {service.test_category}</div>
      <div><b>Mô tả:</b> {service.description}</div>
      <div><b>Giá:</b> {service.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
      <div><b>Thời gian (ngày):</b> {service.duration_days}</div>
      <div><b>Phương thức lấy mẫu:</b> {service.collection_methods.join(', ')}</div>
      <div><b>Yêu cầu giấy tờ pháp lý:</b> {service.requires_legal_documents ? 'Có' : 'Không'}</div>
      <div><b>Trạng thái:</b> {service.is_active ? 'Đang hoạt động' : 'Ngừng hoạt động'}</div>
      <div><b>Ngày tạo:</b> {service.created_at}</div>
    </div>
  );
}
