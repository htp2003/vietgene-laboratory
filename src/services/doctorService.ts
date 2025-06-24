import axios from "axios";

// Base URL cho API
const API_BASE_URL = "https://dna-service-se1857.onrender.com/dna_service";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface Doctor {
  userId: string | null;
  doctorId: string | null;
  doctorCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class DoctorService {
  // Lấy danh sách tất cả doctor
  static async getAllDoctors(): Promise<Doctor[]> {
    try {
      const response = await apiClient.get<Doctor[]>("/doctors");
      return response.data;
    } catch (error) {
      console.error("Error fetching doctors:", error);
      throw error;
    }
  }

  // Thêm mới doctor
  static async createDoctor(data: Partial<Doctor>): Promise<Doctor> {
    try {
      const response = await apiClient.post<Doctor>("/doctors", data);
      return response.data;
    } catch (error) {
      console.error("Error creating doctor:", error);
      throw error;
    }
  }

  // Cập nhật doctor
  static async updateDoctor(doctorId: string, data: Partial<Doctor>): Promise<Doctor> {
    try {
      const response = await apiClient.put<Doctor>(`/doctors/${doctorId}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating doctor:", error);
      throw error;
    }
  }

  // Xoá doctor
  static async deleteDoctor(doctorId: string): Promise<void> {
    try {
      await apiClient.delete(`/doctors/${doctorId}`);
    } catch (error) {
      console.error("Error deleting doctor:", error);
      throw error;
    }
  }
} 
