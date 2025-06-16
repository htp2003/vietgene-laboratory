import React, { useEffect, useState } from 'react';
import { Service } from '../../../api/services.api';
import { samplesApi, Sample } from '../../../api/samples.api';
import { testResultsApi, TestResult } from '../../../api/testResults.api';
import { orderDetailsApi, OrderDetail } from '../../../api/orderDetails.api';
import { sampleKitsApi, SampleKit } from '../../../api/sampleKits.api';

interface ServiceSamplesTabProps {
  service: Service;
}

export default function ServiceSamplesTab({ service }: ServiceSamplesTabProps) {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      orderDetailsApi.getAll(),
      sampleKitsApi.getAll(),
      samplesApi.getAll(),
      testResultsApi.getAll()
    ])
      .then(([orderDetails, sampleKits, samples, testResults]) => {
        // 1. Lấy order_detail_id của service này
        const orderDetailIds = orderDetails
          .filter(od => od.service_id === service.id)
          .map(od => od.id);
        // 2. Lấy kit_id của các sample kit thuộc các order_detail đó
        const kitIds = sampleKits
          .filter(kit => orderDetailIds.includes(kit.order_detail_id))
          .map(kit => kit.id);
        // 3. Lọc samples theo kit_id
        const filteredSamples = samples.filter(s => kitIds.includes(s.kit_id));
        setSamples(filteredSamples);
        // 4. Lọc testResults theo sample_id của các sample thuộc service này
        const sampleIds = filteredSamples.map(s => s.id);
        setTestResults(testResults.filter(r => sampleIds.includes(r.sample_id)));
      })
      .finally(() => setLoading(false));
  }, [service.id]);

  if (loading) return <div>Đang tải mẫu & kết quả...</div>;
  if (!samples.length) return <div>Chưa có mẫu nào cho dịch vụ này.</div>;

  return (
    <div>
      <h4 className="font-semibold mb-2">Danh sách mẫu</h4>
      <table className="w-full border text-sm mb-4">
        <thead>
          <tr>
            <th className="border p-1">Mã mẫu</th>
            <th className="border p-1">Loại mẫu</th>
            <th className="border p-1">Ngày nhận</th>
          </tr>
        </thead>
        <tbody>
          {samples.map(sample => (
            <tr key={sample.id}>
              <td className="border p-1">{sample.id}</td>
              <td className="border p-1">{sample.sample_type}</td>
              <td className="border p-1">{sample.collection_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4 className="font-semibold mb-2">Kết quả xét nghiệm</h4>
      <table className="w-full border text-sm">
        <thead>
          <tr>
            <th className="border p-1">Mã kết quả</th>
            <th className="border p-1">Mã mẫu</th>
            <th className="border p-1">Kết luận</th>
            <th className="border p-1">Ngày trả</th>
          </tr>
        </thead>
        <tbody>
          {testResults.map(result => (
            <tr key={result.id}>
              <td className="border p-1">{result.id}</td>
              <td className="border p-1">{result.sample_id}</td>
              <td className="border p-1">{result.conclusion}</td>
              <td className="border p-1">{result.tested_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
