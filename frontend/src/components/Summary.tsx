import { useState, useEffect } from "react";
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
} from "recharts";
import { analyticsApi } from "../services/api";
import { AnalyticsData } from "../types";
import LoadingSpinner from "./LoadingSpinner";

// Custom tooltip component for better styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            className="tooltip-value"
            style={{ color: entry.color }}
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Summary = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "14d" | "30d">("14d");

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
      setError(err.response?.data?.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-state">
       
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
        <div className="empty-icon">📊</div>
        <p>No analytics data available</p>
      </div>
    );
  }

  // Prepare data for charts
  const presentVsAbsentData = [
    { name: "Present", value: data.overview.presentCount, color: "#10b981" },
    { name: "Absent", value: data.overview.absentCount, color: "#ef4444" },
  ];

  const employeesByDeptData = data.employeesByDepartment.map((dept) => ({
    name: dept._id || "Unknown",
    employees: dept.count,
  }));

  const attendanceByDeptData = data.attendanceByDepartment.map((dept) => ({
    name: dept._id || "Unknown",
    Present: dept.present,
    Absent: dept.absent,
  }));

  // Filter daily attendance based on selected time range
  const getFilteredDailyData = () => {
    const daysMap = {
      "7d": 7,
      "14d": 14,
      "30d": 30,
    };
    return data.dailyAttendance.slice(-daysMap[timeRange]).map((day) => ({
      date: new Date(day._id).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      Present: day.present,
      Absent: day.absent,
    }));
  };

  const dailyAttendanceData = getFilteredDailyData();

  const monthlyAttendanceData = data.monthlyAttendance.map((month) => ({
    month: new Date(month._id + "-01").toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    }),
    Present: month.present,
    Absent: month.absent,
  }));

  // Calculate summary metrics
  const totalDays = data.overview.presentCount + data.overview.absentCount;
  const avgDailyAttendance = (
    data.dailyAttendance.reduce((acc, day) => acc + day.present, 0) /
    data.dailyAttendance.length
  ).toFixed(1);
  const bestDay = data.dailyAttendance.reduce(
    (max, day) => (day.present > max.present ? day : max),
    data.dailyAttendance[0],
  );
  const worstDay = data.dailyAttendance.reduce(
    (min, day) => (day.present < min.present ? day : min),
    data.dailyAttendance[0],
  );

  return (
    <div className="dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="dashboard-subtitle">
            Real-time analytics and attendance metrics
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="refresh-button"
          title="Refresh data"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          
          <div className="kpi-content">
            <span className="kpi-label">Total Employees</span>
            <span className="kpi-value">{data.overview.totalEmployees}</span>
            <span className="kpi-trend">Active workforce</span>
          </div>
        </div>

        <div className="kpi-card">
         
          <div className="kpi-content">
            <span className="kpi-label">Present Today</span>
            <span className="kpi-value">{data.overview.presentCount}</span>
            <span className="kpi-trend">+12% from yesterday</span>
          </div>
        </div>

        <div className="kpi-card">
         
          <div className="kpi-content">
            <span className="kpi-label">Attendance Rate</span>
            <span className="kpi-value">{data.overview.attendanceRate}%</span>
            <span className="kpi-trend">{totalDays} total days</span>
          </div>
        </div>

        <div className="kpi-card">
         
          <div className="kpi-content">
            <span className="kpi-label">Absent Today</span>
            <span className="kpi-value">{data.overview.absentCount}</span>
            <span className="kpi-trend">
              {(
                (data.overview.absentCount / data.overview.totalEmployees) *
                100
              ).toFixed(1)}
              % absence rate
            </span>
          </div>
        </div>
      </div>

      <div className="metrics-row">
        <div className="metric-card">
          <span className="metric-label">Average Daily Attendance</span>
          <span className="metric-value">{avgDailyAttendance}</span>
          <span className="metric-sub">employees per day</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Best Attendance Day</span>
          <span className="metric-value">{bestDay.present}</span>
          <span className="metric-sub">
            {new Date(bestDay._id).toLocaleDateString()}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Lowest Attendance Day</span>
          <span className="metric-value">{worstDay.present}</span>
          <span className="metric-sub">
            {new Date(worstDay._id).toLocaleDateString()}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Total Records</span>
          <span className="metric-value">
            {data.overview.totalAttendanceRecords}
          </span>
          <span className="metric-sub">across all employees</span>
        </div>
      </div>

     
      <div className="charts-grid">
        {/* Present vs Absent Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Attendance Distribution</h3>
            <span className="chart-badge">Current Period</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={presentVsAbsentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {presentVsAbsentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span style={{ color: "#374151" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-footer">
            <div className="chart-stat">
              <span className="dot present"></span>
              <span>Present: {data.overview.presentCount}</span>
            </div>
            <div className="chart-stat">
              <span className="dot absent"></span>
              <span>Absent: {data.overview.absentCount}</span>
            </div>
          </div>
        </div>

        {/* Employees by Department */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Department Distribution</h3>
            <span className="chart-badge">By Employee Count</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={employeesByDeptData}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="employees" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance by Department */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Department Performance</h3>
            <span className="chart-badge">Present vs Absent</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceByDeptData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Attendance Trend */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <div>
              <h3>Daily Attendance Trend</h3>
              <p className="chart-subtitle">Last {timeRange} days</p>
            </div>
            <div className="time-range-selector">
              <button
                className={timeRange === "7d" ? "active" : ""}
                onClick={() => setTimeRange("7d")}
              >
                7D
              </button>
              <button
                className={timeRange === "14d" ? "active" : ""}
                onClick={() => setTimeRange("14d")}
              >
                14D
              </button>
              <button
                className={timeRange === "30d" ? "active" : ""}
                onClick={() => setTimeRange("30d")}
              >
                30D
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="Present"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: "#10b981" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Absent"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4, fill: "#ef4444" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Attendance Overview */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Monthly Overview</h3>
            <span className="chart-badge">Year to Date</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Employees Section */}
      <div className="chart-card full-width">
        <div className="chart-header">
          <div>
            <h3>Top Performers</h3>
            <p className="chart-subtitle">
              Employees with highest attendance rate
            </p>
          </div>
          <span className="chart-badge">
            Top {data.topEmployeesByAttendance.length}
          </span>
        </div>
        {data.topEmployeesByAttendance.length === 0 ? (
          <div className="empty-state">
            <p>No attendance records available</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Total</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.topEmployeesByAttendance.map((employee, index) => {
                  const rate = employee.attendanceRate;
                  
                  const statusColor =
                    rate >= 90 ? "#10b981" : rate >= 75 ? "#f59e0b" : "#ef4444";

                  return (
                    <tr key={employee.employeeId}>
                      <td>
                        <span className="rank-badge">{index + 1}</span>
                      </td>
                      <td>
                        <div className="employee-info">
                          <span className="employee-name">
                            {employee.fullName}
                          </span>
                          <span className="employee-id">
                            {employee.employeeId}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="department-tag">
                          {employee.department}
                        </span>
                      </td>
                      <td>
                        <span className="badge present">
                          {employee.presentDays}
                        </span>
                      </td>
                      <td>
                        <span className="badge absent">
                          {employee.absentDays}
                        </span>
                      </td>
                      <td>{employee.totalDays}</td>
                      <td>
                        <span
                          className="rate-indicator"
                          style={{ color: statusColor }}
                        >
                          {employee.attendanceRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;




