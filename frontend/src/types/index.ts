export interface Employee {
  _id: string;
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  _id: string;
  employeeId: string;
  date: string;
  status: 'Present' | 'Absent';
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

export interface AnalyticsData {
  overview: {
    totalEmployees: number;
    totalAttendanceRecords: number;
    presentCount: number;
    absentCount: number;
    attendanceRate: string;
  };
  employeesByDepartment: Array<{
    _id: string;
    count: number;
  }>;
  attendanceByDepartment: Array<{
    _id: string;
    present: number;
    absent: number;
    total: number;
  }>;
  dailyAttendance: Array<{
    _id: string;
    present: number;
    absent: number;
    total: number;
  }>;
  topEmployeesByAttendance: Array<{
    employeeId: string;
    fullName: string;
    department: string;
    presentDays: number;
    absentDays: number;
    totalDays: number;
    attendanceRate: number;
  }>;
  monthlyAttendance: Array<{
    _id: string;
    present: number;
    absent: number;
    total: number;
  }>;
}

export interface AttendanceHistoryMonth {
  monthKey: string;
  monthLabel: string;
  records: Array<Attendance & {
    employee?: {
      employeeId: string;
      fullName: string;
      email: string;
      department: string;
    } | null;
  }>;
}

export interface AttendanceHistoryData {
  data: AttendanceHistoryMonth[];
  totalRecords: number;
}
