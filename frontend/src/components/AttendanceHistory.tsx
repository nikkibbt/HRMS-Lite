import { useState, useEffect, useMemo } from 'react';
import { attendanceApi } from '../services/api';
import { AttendanceHistoryMonth } from '../types';
import LoadingSpinner from './LoadingSpinner';

type SortOption = 'date-desc' | 'date-asc' | 'employee-asc' | 'employee-desc' | 'status-asc' | 'status-desc' | 'department-asc' | 'department-desc';
type GroupByOption = 'month' | 'department' | 'employee' | 'status' | 'none';

const AttendanceHistory = () => {
  const [historyData, setHistoryData] = useState<AttendanceHistoryMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Filter and search states
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [useDateRange, setUseDateRange] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [groupBy, setGroupBy] = useState<GroupByOption>('month');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await attendanceApi.getHistory();
      setHistoryData(data.data);
      setTotalRecords(data.totalRecords);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch attendance history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get unique months for filter dropdown
  const availableMonths = useMemo(() => {
    const months = historyData.map((m) => ({
      value: m.monthKey,
      label: m.monthLabel,
    }));
    return [{ value: 'all', label: 'All Months' }, ...months];
  }, [historyData]);

  // Get unique departments for filter dropdown
  const availableDepartments = useMemo(() => {
    const departments = new Set<string>();
    historyData.forEach((month) => {
      month.records.forEach((record) => {
        if (record.employee?.department) {
          departments.add(record.employee.department);
        }
      });
    });
    return ['all', ...Array.from(departments).sort()];
  }, [historyData]);

  // Flatten all records for processing
  const allRecords = useMemo(() => {
    return historyData.flatMap((month) =>
      month.records.map((record) => ({
        ...record,
        monthKey: month.monthKey,
        monthLabel: month.monthLabel,
      }))
    );
  }, [historyData]);

  // Apply filters and search
  const filteredRecords = useMemo(() => {
    let filtered = [...allRecords];

    // Date range filter (takes priority over month filter)
    if (useDateRange && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter((r) => {
        const recordDate = new Date(r.date);
        return recordDate >= start && recordDate <= end;
      });
    } else if (selectedMonth !== 'all') {
      // Month filter (only if date range is not used)
      filtered = filtered.filter((r) => r.monthKey === selectedMonth);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(
        (r) => r.employee?.department === departmentFilter
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((r) => {
        const employeeName = r.employee?.fullName?.toLowerCase() || '';
        const employeeId = r.employeeId.toLowerCase();
        const department = r.employee?.department?.toLowerCase() || '';
        const email = r.employee?.email?.toLowerCase() || '';
        
        return (
          employeeName.includes(query) ||
          employeeId.includes(query) ||
          department.includes(query) ||
          email.includes(query)
        );
      });
    }

    return filtered;
  }, [allRecords, selectedMonth, startDate, endDate, useDateRange, statusFilter, departmentFilter, searchQuery]);

  // Apply sorting
  const sortedRecords = useMemo(() => {
    const sorted = [...filteredRecords];

    switch (sortBy) {
      case 'date-desc':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateA === dateB) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return dateB - dateA;
        });
      case 'date-asc':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateA === dateB) {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          }
          return dateA - dateB;
        });
      case 'employee-asc':
        return sorted.sort((a, b) => {
          const nameA = a.employee?.fullName || a.employeeId;
          const nameB = b.employee?.fullName || b.employeeId;
          return nameA.localeCompare(nameB);
        });
      case 'employee-desc':
        return sorted.sort((a, b) => {
          const nameA = a.employee?.fullName || a.employeeId;
          const nameB = b.employee?.fullName || b.employeeId;
          return nameB.localeCompare(nameA);
        });
      case 'status-asc':
        return sorted.sort((a, b) => a.status.localeCompare(b.status));
      case 'status-desc':
        return sorted.sort((a, b) => b.status.localeCompare(a.status));
      case 'department-asc':
        return sorted.sort((a, b) => {
          const deptA = a.employee?.department || '';
          const deptB = b.employee?.department || '';
          return deptA.localeCompare(deptB);
        });
      case 'department-desc':
        return sorted.sort((a, b) => {
          const deptA = a.employee?.department || '';
          const deptB = b.employee?.department || '';
          return deptB.localeCompare(deptA);
        });
      default:
        return sorted;
    }
  }, [filteredRecords, sortBy]);

  // Group records based on groupBy option
  const groupedData = useMemo(() => {
    if (groupBy === 'none') {
      return [
        {
          groupKey: 'all',
          groupLabel: 'All Records',
          records: sortedRecords,
        },
      ];
    }

    if (groupBy === 'month') {
      const grouped: { [key: string]: any } = {};
      sortedRecords.forEach((record) => {
        const key = record.monthKey;
        if (!grouped[key]) {
          grouped[key] = {
            groupKey: key,
            groupLabel: record.monthLabel,
            records: [],
          };
        }
        grouped[key].records.push(record);
      });
      return Object.values(grouped).sort((a: any, b: any) =>
        b.groupKey.localeCompare(a.groupKey)
      );
    }

    if (groupBy === 'department') {
      const grouped: { [key: string]: any } = {};
      sortedRecords.forEach((record) => {
        const key = record.employee?.department || 'Unknown';
        if (!grouped[key]) {
          grouped[key] = {
            groupKey: key,
            groupLabel: key,
            records: [],
          };
        }
        grouped[key].records.push(record);
      });
      return Object.values(grouped).sort((a: any, b: any) =>
        a.groupLabel.localeCompare(b.groupLabel)
      );
    }

    if (groupBy === 'employee') {
      const grouped: { [key: string]: any } = {};
      sortedRecords.forEach((record) => {
        const key = record.employeeId;
        const label = record.employee?.fullName || record.employeeId;
        if (!grouped[key]) {
          grouped[key] = {
            groupKey: key,
            groupLabel: label,
            records: [],
          };
        }
        grouped[key].records.push(record);
      });
      return Object.values(grouped).sort((a: any, b: any) =>
        a.groupLabel.localeCompare(b.groupLabel)
      );
    }

    if (groupBy === 'status') {
      const grouped: { [key: string]: any } = {};
      sortedRecords.forEach((record) => {
        const key = record.status;
        if (!grouped[key]) {
          grouped[key] = {
            groupKey: key,
            groupLabel: key,
            records: [],
          };
        }
        grouped[key].records.push(record);
      });
      return Object.values(grouped).sort((a: any, b: any) =>
        b.groupKey.localeCompare(a.groupKey)
      );
    }

    return [];
  }, [sortedRecords, groupBy]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchHistory} className="btn btn-secondary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="attendance-history">
      <div className="history-header">
        <h2>Attendance History</h2>
        <div className="history-stats">
          <span className="stat-badge">
            Total Records: <strong>{totalRecords}</strong>
          </span>
          <span className="stat-badge">
            Showing: <strong>{filteredRecords.length}</strong>
          </span>
          {groupBy !== 'none' && (
            <span className="stat-badge">
              Groups: <strong>{groupedData.length}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="history-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="search">Search</label>
            <div className="search-input-wrapper">
              <input
                type="text"
                id="search"
                placeholder="Search by name, ID, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="search-clear-btn"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                checked={useDateRange}
                onChange={(e) => {
                  setUseDateRange(e.target.checked);
                  if (!e.target.checked) {
                    setStartDate('');
                    setEndDate('');
                    setSelectedMonth('all');
                  }
                }}
                style={{ marginRight: '0.5rem' }}
              />
              Use Date Range Filter
            </label>
            {useDateRange ? (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="filter-select"
                  style={{ flex: 1 }}
                  max={endDate || new Date().toISOString().split('T')[0]}
                />
                <span style={{ alignSelf: 'center' }}>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="filter-select"
                  style={{ flex: 1 }}
                  max={new Date().toISOString().split('T')[0]}
                  min={startDate}
                />
              </div>
            ) : (
              <select
                id="monthFilter"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="filter-select"
              >
                {availableMonths.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="filter-group">
            <label htmlFor="statusFilter">Filter by Status</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="departmentFilter">Filter by Department</label>
            <select
              id="departmentFilter"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Departments</option>
              {availableDepartments
                .filter((d) => d !== 'all')
                .map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="sortBy">Sort By</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="filter-select"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="employee-asc">Employee (A-Z)</option>
              <option value="employee-desc">Employee (Z-A)</option>
              <option value="department-asc">Department (A-Z)</option>
              <option value="department-desc">Department (Z-A)</option>
              <option value="status-asc">Status (Present First)</option>
              <option value="status-desc">Status (Absent First)</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="groupBy">Group By</label>
            <select
              id="groupBy"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
              className="filter-select"
            >
              <option value="month">Month</option>
              <option value="department">Department</option>
              <option value="employee">Employee</option>
              <option value="status">Status</option>
              <option value="none">No Grouping</option>
            </select>
          </div>

          <div className="filter-group filter-actions">
            <button
              type="button"
              onClick={() => {
                setSelectedMonth('all');
                setStartDate('');
                setEndDate('');
                setUseDateRange(false);
                setSearchQuery('');
                setStatusFilter('all');
                setDepartmentFilter('all');
                setSortBy('date-desc');
                setGroupBy('month');
              }}
              className="btn btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {historyData.length === 0 ? (
        <div className="empty-state">
          <p>No attendance records found.</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="empty-state">
          <p>No records match your filters. Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="history-content">
          {groupedData.map((group: any) => (
            <div key={group.groupKey} className="month-section">
              <div className="month-header">
                <h3>{group.groupLabel}</h3>
                <span className="month-count">
                  {group.records.length} record{group.records.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Employee</th>
                      <th>Employee ID</th>
                      <th>Department</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.records.map((record: any) => (
                      <tr key={record._id}>
                        <td>{formatDate(record.date)}</td>
                        <td className="time-cell">{formatTime(record.createdAt)}</td>
                        <td>
                          {record.employee ? (
                            <span className="employee-name">{record.employee.fullName}</span>
                          ) : (
                            <span className="employee-missing">
                              {record.employeeId} (Not Found)
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="employee-id">{record.employeeId}</span>
                        </td>
                        <td>
                          {record.employee ? (
                            <span className="department-badge">{record.employee.department}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              record.status === 'Present' ? 'present' : 'absent'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
