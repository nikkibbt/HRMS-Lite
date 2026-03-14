import axios from 'axios';
import { Employee, Attendance, ApiResponse, AnalyticsData, AttendanceHistoryData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Employee API
export const employeeApi = {
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get<ApiResponse<Employee[]>>('/employees');
    return response.data.data;
  },

  create: async (employee: Omit<Employee, '_id' | 'createdAt' | 'updatedAt'>): Promise<Employee> => {
    const response = await api.post<ApiResponse<Employee>>('/employees', employee);
    return response.data.data;
  },

  getById: async (id: string): Promise<Employee> => {
    const response = await api.get<ApiResponse<Employee>>(`/employees/${id}`);
    return response.data.data;
  },

  update: async (id: string, employee: Omit<Employee, '_id' | 'createdAt' | 'updatedAt'>): Promise<Employee> => {
    const response = await api.put<ApiResponse<Employee>>(`/employees/${id}`, employee);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  checkEmployeeIdExists: async (employeeId: string): Promise<boolean> => {
    try {
      const normalizedId = employeeId.trim().toUpperCase();
      const response = await api.get<ApiResponse<{ exists: boolean; employeeId: string }>>(
        `/employees/check-id/${encodeURIComponent(normalizedId)}`
      );
      return response.data.data.exists;
    } catch (error) {
      // If check fails, assume it doesn't exist to allow form submission
      return false;
    }
  },
};

// Attendance API
export const attendanceApi = {
  getAll: async (): Promise<Attendance[]> => {
    const response = await api.get<ApiResponse<Attendance[]>>('/attendance');
    return response.data.data;
  },

  getByEmployee: async (employeeId: string): Promise<Attendance[]> => {
    const response = await api.get<ApiResponse<Attendance[]>>(`/attendance/employee/${employeeId}`);
    return response.data.data;
  },

  mark: async (attendance: {
    employeeId: string;
    date: string;
    status: 'Present' | 'Absent';
  }): Promise<Attendance> => {
    const response = await api.post<ApiResponse<Attendance>>('/attendance', attendance);
    return response.data.data;
  },

  getHistory: async (): Promise<AttendanceHistoryData> => {
    const response = await api.get<ApiResponse<AttendanceHistoryData>>('/history');
    return response.data.data;
  },
};

// Analytics API
export const analyticsApi = {
  getSummary: async (): Promise<AnalyticsData> => {
    const response = await api.get<ApiResponse<AnalyticsData>>('/analytics/summary');
    return response.data.data;
  },
};

export default api;
