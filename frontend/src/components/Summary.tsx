import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { analyticsApi } from '../services/api';
import { AnalyticsData } from '../types';
import LoadingSpinner from './LoadingSpinner';

const Summary = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const analyticsData = await analyticsApi.getSummary();
      setData(analyticsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchAnalytics} className="btn btn-secondary">
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state">
        <p>No analytics data available</p>
      </div>
    );
  }

  // Prepare data for charts
  const presentVsAbsentData = [
    { name: 'Present', value: data.overview.presentCount, color: '#43e97b' },
    { name: 'Absent', value: data.overview.absentCount, color: '#fa709a' },
  ];

  const employeesByDeptData = data.employeesByDepartment.map((dept) => ({
    name: dept._id || 'Unknown',
    employees: dept.count,
  }));

  const attendanceByDeptData = data.attendanceByDepartment.map((dept) => ({
    name: dept._id || 'Unknown',
    Present: dept.present,
    Absent: dept.absent,
  }));

  const dailyAttendanceData = data.dailyAttendance.slice(-14).map((day) => ({
    date: new Date(day._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Present: day.present,
    Absent: day.absent,
  }));

  const monthlyAttendanceData = data.monthlyAttendance.map((month) => ({
    month: new Date(month._id + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    Present: month.present,
    Absent: month.absent,
  }));

  return (
    <div className="summary-page">
      <h2>Dashboard & Analytics</h2>

      {/* Overview Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#667eea' }}>
            👥
          </div>
          <div className="stat-content">
            <h3>{data.overview.totalEmployees}</h3>
            <p>Total Employees</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#43e97b' }}>
            ✅
          </div>
          <div className="stat-content">
            <h3>{data.overview.presentCount}</h3>
            <p>Present Days</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fa709a' }}>
            ❌
          </div>
          <div className="stat-content">
            <h3>{data.overview.absentCount}</h3>
            <p>Absent Days</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#764ba2' }}>
            📊
          </div>
          <div className="stat-content">
            <h3>{data.overview.attendanceRate}%</h3>
            <p>Attendance Rate</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Present vs Absent Pie Chart */}
        <div className="chart-card">
          <h3>Present vs Absent Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={presentVsAbsentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {presentVsAbsentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Employees by Department */}
        <div className="chart-card">
          <h3>Employees by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employeesByDeptData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="employees" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance by Department */}
        <div className="chart-card">
          <h3>Attendance by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceByDeptData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Present" fill="#43e97b" />
              <Bar dataKey="Absent" fill="#fa709a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Attendance Trend */}
        <div className="chart-card">
          <h3>Daily Attendance Trend (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Present"
                stroke="#43e97b"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Absent"
                stroke="#fa709a"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Attendance Overview */}
        <div className="chart-card">
          <h3>Monthly Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Present" fill="#43e97b" />
              <Bar dataKey="Absent" fill="#fa709a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Statistics Table */}
      <div className="chart-card">
        <h3>Summary Statistics</h3>
        <div className="summary-stats-table">
          <div className="stat-row">
            <span className="stat-label">Total Employees:</span>
            <span className="stat-value">{data.overview.totalEmployees}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Total Attendance Records:</span>
            <span className="stat-value">{data.overview.totalAttendanceRecords}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Total Present Days:</span>
            <span className="stat-value present">{data.overview.presentCount}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Total Absent Days:</span>
            <span className="stat-value absent">{data.overview.absentCount}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Overall Attendance Rate:</span>
            <span className="stat-value rate">{data.overview.attendanceRate}%</span>
          </div>
        </div>
      </div>

      {/* Top Employees Table */}
      <div className="chart-card">
        <h3>Top Employees by Attendance (Present Days)</h3>
        {data.topEmployeesByAttendance.length === 0 ? (
          <div className="empty-state">
            <p>No attendance records available</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Present Days</th>
                  <th>Absent Days</th>
                  <th>Total Days</th>
                  <th>Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.topEmployeesByAttendance.map((employee, index) => (
                  <tr key={employee.employeeId}>
                    <td>{index + 1}</td>
                    <td>{employee.fullName}</td>
                    <td>{employee.department}</td>
                    <td>
                      <span className="badge present">{employee.presentDays}</span>
                    </td>
                    <td>
                      <span className="badge absent">{employee.absentDays}</span>
                    </td>
                    <td>{employee.totalDays}</td>
                    <td>
                      <span className="attendance-rate">
                        {employee.attendanceRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;
