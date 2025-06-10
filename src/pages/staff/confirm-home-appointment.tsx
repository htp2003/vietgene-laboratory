import React, { useState } from 'react';
import { Box, Button, Step, StepLabel, Stepper, Typography, Paper } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

// Giả lập dữ liệu lịch đặt xét nghiệm tại nhà (có thể thay bằng API thực tế)
const mockAppointment = {
  id: 'APT12345',
  customerName: 'Nguyễn Văn A',
  address: '123 Đường ABC, Quận 1, TP.HCM',
  testType: 'PCR Covid-19',
  phone: '0901234567',
  preferredDate: '2025-06-08',
  preferredTime: '09:00-11:00',
  status: 'DeliveringKit',
};

const steps = ['Xem chi tiết', 'Xác nhận & phân công giao kit', 'Cập nhật trạng thái'];

const ConfirmHomeAppointment: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [deliveryPerson, setDeliveryPerson] = useState('');
  const [status, setStatus] = useState<'DeliveringKit' | 'KitDelivered'>(mockAppointment.status as any);

  // TODO: Lấy thông tin appointment thực tế bằng appointmentId nếu có API
  const appointment = { ...mockAppointment, id: appointmentId || mockAppointment.id };

  const handleNext = () => {
    if (activeStep === 1 && !deliveryPerson) {
      alert('Vui lòng nhập tên nhân viên giao kit!');
      return;
    }
    if (activeStep === 2) {
      setStatus('KitDelivered');
      setTimeout(() => {
        navigate('/staff/appointments');
      }, 1000);
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <Typography variant="h5" mb={2} fontWeight={700} textAlign="center">
        Xác nhận lịch xét nghiệm tại nhà
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        {activeStep === 0 && (
          <>
            <Typography variant="subtitle1" fontWeight={600}>Thông tin khách hàng</Typography>
            <Typography>Họ tên: {appointment.customerName}</Typography>
            <Typography>Địa chỉ: {appointment.address}</Typography>
            <Typography>Điện thoại: {appointment.phone}</Typography>
            <Typography>Loại xét nghiệm: {appointment.testType}</Typography>
            <Typography>Thời gian mong muốn: {appointment.preferredDate} ({appointment.preferredTime})</Typography>
            <Typography>Trạng thái: {status === 'DeliveringKit' ? 'Đang chuyển kit' : 'Đã giao kit'}</Typography>
          </>
        )}
        {activeStep === 1 && (
          <>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Xác nhận & phân công giao kit
            </Typography>
            <label>
              Nhập tên nhân viên giao kit:
              <input
                type="text"
                value={deliveryPerson}
                onChange={(e) => setDeliveryPerson(e.target.value)}
                style={{ marginLeft: 10, padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
              />
            </label>
            <Typography mt={2}>Trạng thái hiện tại: {status}</Typography>
          </>
        )}
        {activeStep === 2 && (
          <>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Cập nhật trạng thái
            </Typography>
            {status === 'KitDelivered' ? (
              <>
                <Typography>Đã giao kit cho khách hàng. Hoàn thành luồng giao kit!</Typography>
                <Typography mt={2}>Trạng thái: <b>Đã giao kit</b></Typography>
              </>
            ) : (
              <>
                <Typography>Nhân viên <b>{deliveryPerson}</b> đang giao kit đến khách hàng.</Typography>
                <Typography mt={2}>Trạng thái: <b>Đang chuyển kit</b></Typography>
              </>
            )}
          </>
        )}
        <Box mt={4} display="flex" justifyContent="space-between">
          <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">
            Quay lại
          </Button>
          {activeStep < steps.length - 1 ? (
            <Button onClick={handleNext} variant="contained">
              Tiếp tục
            </Button>
          ) : (
            <Button variant="contained" color="success" disabled={status !== 'KitDelivered'}>
              Đã hoàn tất
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ConfirmHomeAppointment;
