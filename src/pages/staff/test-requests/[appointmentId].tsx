import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import { LocalShipping, CheckCircleOutline, PersonPinCircle, PhoneInTalk, EventNote, MedicalServices } from '@mui/icons-material';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

interface Appointment {
  id: string;
  customerName: string;
  phone: string;
  date: string;
  time: string;
  serviceType: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'DeliveringKit' | 'KitDelivered' | 'SampleReceived' | 'Testing';
  locationType: 'Tại nhà' | 'Cơ sở y tế';
  legalType: 'Pháp Lý' | 'Dân Sự';
  address?: string;
  notes?: string;
}

const appointmentsData: Appointment[] = [
  {
    id: 'appt-001',
    customerName: 'Nguyễn Văn A',
    phone: '0901234567',
    date: '2025-06-08',
    time: '10:00',
    serviceType: 'Huyết thống',
    status: 'DeliveringKit', 
    locationType: 'Tại nhà',
    legalType: 'Pháp Lý',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    notes: 'Khách yêu cầu gọi trước 30 phút'
  },
  {
    id: 'appt-003',
    customerName: 'Lê Văn C',
    phone: '0912345678',
    date: '2025-06-10',
    time: '09:00',
    serviceType: 'ADN Cha con',
    status: 'DeliveringKit',
    locationType: 'Tại nhà',
    legalType: 'Dân Sự',
    address: '456 Đường XYZ, Quận 3, TP.HCM'
  },
];

const steps = [
  { label: 'Đang giao kit', status: 'DeliveringKit' },
  { label: 'Đã giao kit', status: 'KitDelivered' },
  { label: 'Đã nhận mẫu', status: 'SampleReceived' },
  { label: 'Đang xét nghiệm', status: 'Testing' },
  { label: 'Hoàn thành', status: 'Completed' },
];

interface MedicalRecord {
  result: string;
  completedAt: string;
}

const TestRequestPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const foundAppointment = appointmentsData.find(a => a.id === appointmentId);
    if (foundAppointment) {
      if (foundAppointment.locationType === 'Tại nhà') {
        setAppointment(foundAppointment);
        // Determine active step based on status
        const stepIdx = steps.findIndex(s => s.status === foundAppointment.status);
        setActiveStep(stepIdx >= 0 ? stepIdx : 0);
        if (foundAppointment.status === 'Completed' && (foundAppointment as any).medicalRecord) {
          setMedicalRecord((foundAppointment as any).medicalRecord);
        }
      } else {
        setError('Lịch hẹn không hợp lệ cho quy trình giao kit tại nhà hoặc đã ở trạng thái không phù hợp.');
      }
    } else {
      setError('Không tìm thấy lịch hẹn.');
    }
    setIsLoading(false);
  }, [appointmentId]);

  const handleNextStep = () => {
    if (!appointment) return;
    // Simulate updating status
    const nextStep = Math.min(activeStep + 1, steps.length - 1);
    const nextStatus = steps[nextStep].status as Appointment['status'];
    setActiveStep(nextStep);
    setAppointment({ ...appointment, status: nextStatus });
    // Simulate saving medical record when completed
    if (nextStatus === 'Completed') {
      const record: MedicalRecord = {
        result: 'Kết quả âm tính (ví dụ)',
        completedAt: new Date().toLocaleString('vi-VN'),
      };
      setMedicalRecord(record);
      // In real app, save to backend here
      alert('Đã lưu kết quả vào hồ sơ bệnh án. Khách hàng có thể xem kết quả!');
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
        <Typography ml={2}>Đang tải chi tiết lịch hẹn...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box maxWidth={600} mx="auto" mt={4} p={3} component={Paper} elevation={3}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={() => navigate('/staff/appointment')} sx={{ mt: 2 }}>
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  if (!appointment) {
    return <Alert severity="warning">Không có thông tin lịch hẹn để hiển thị.</Alert>;
  }

  return (
    <Box maxWidth={800} mx="auto" mt={4} mb={4}>
      <Paper elevation={3} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
        <Box sx={{ p: 3, backgroundColor: 'primary.main', color: 'white' }}>
          <Typography variant="h5" component="h1" fontWeight="bold" display="flex" alignItems="center">
            <LocalShipping sx={{ mr: 1.5, fontSize: '2rem' }} />
            Quản Lý Giao Kit Xét Nghiệm Tại Nhà
          </Typography>
          <Typography variant="subtitle1">
            Mã lịch hẹn: {appointment.id}
          </Typography>
        </Box>

        <Box p={3}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium', color: 'primary.dark', mb: 2 }}>
            Thông Tin Khách Hàng và Lịch Hẹn
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonPinCircle color="action" sx={{ mr: 1 }} />
              <Typography><strong>Khách hàng:</strong> {appointment.customerName}</Typography>
            </Grid>
            <Grid xs={12} sm={6} display="flex" alignItems="center">
              <PhoneInTalk color="action" sx={{ mr: 1 }} />
              <Typography><strong>Điện thoại:</strong> {appointment.phone}</Typography>
            </Grid>
            <Grid xs={12} sm={6} display="flex" alignItems="center">
              <EventNote color="action" sx={{ mr: 1 }} />
              <Typography><strong>Ngày hẹn:</strong> {new Date(appointment.date).toLocaleDateString('vi-VN')} - {appointment.time}</Typography>
            </Grid>
            <Grid xs={12} sm={6} display="flex" alignItems="center">
              <MedicalServices color="action" sx={{ mr: 1 }} />
              <Typography><strong>Dịch vụ:</strong> {appointment.serviceType}</Typography>
            </Grid>
            {appointment.address && (
              <Grid item xs={12} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <PersonPinCircle color="action" sx={{ mr: 1, mt: 0.5 }} />
                <Typography><strong>Địa chỉ giao kit:</strong> {appointment.address}</Typography>
              </Grid>
            )}
            {appointment.notes && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<EventNote fontSize="inherit" />} sx={{ mt: 1}}>
                  <strong>Ghi chú:</strong> {appointment.notes}
                </Alert>
              </Grid>
            )}
          </Grid>
            
          <Divider sx={{ my: 3 }} />

          <Box>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((step, idx) => (
                <Step key={step.status}>
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <Box textAlign="center">
              {activeStep < steps.length - 1 && (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<CheckCircleOutline />}
                  onClick={handleNextStep}
                  sx={{ borderRadius: '8px', fontWeight: 'bold', px: 4, py: 1.5 }}
                >
                  Xác nhận bước: {steps[activeStep].label}
                </Button>
              )}
              {activeStep === steps.length - 1 && medicalRecord && (
                <Alert severity="success" sx={{ mt: 3, fontSize: '1.1rem' }}>
                  <strong>Đã hoàn thành và lưu kết quả vào hồ sơ bệnh án!</strong><br/>
                  Kết quả: {medicalRecord.result}<br/>
                  Thời gian hoàn thành: {medicalRecord.completedAt}
                </Alert>
              )}
            </Box>
          </Box>
        </Box>

        <Box p={2} textAlign="center" sx={{ borderTop: '1px solid #eee' }}>
          <Button variant="outlined" onClick={() => navigate('/staff')}>
            Quay lại Danh sách Lịch hẹn
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default TestRequestPage;
