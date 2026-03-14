import { useState, useEffect } from 'react';
import { Employee, Attendance } from '../types';
import { employeeApi, attendanceApi } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const AttendanceManagement = () => {
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [formData, setFormData] = useState({
    date: getTodayDate(),
    status: 'Present' as 'Present' | 'Absent',
  });
  const [maxDate] = useState<string>(getTodayDate()); // Maximum allowed date (today)
  const [loading, setLoading] = useState(false);
  const [fetchingRecords, setFetchingRecords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendanceRecords(selectedEmployee);
    } else {
      setAttendanceRecords([]);
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const data = await employeeApi.getAll();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (err: any) {
      setError('Failed to fetch employees');
    }
  };

  // Filter employees based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = employees.filter(
        (emp) =>
          emp.fullName.toLowerCase().includes(query) ||
          emp.employeeId.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query) ||
          emp.department.toLowerCase().includes(query)
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  const fetchAttendanceRecords = async (employeeId: string) => {
    try {
      setFetchingRecords(true);
      setError(null);
      const data = await attendanceApi.getByEmployee(employeeId);
      setAttendanceRecords(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch attendance records');
    } finally {
      setFetchingRecords(false);
    }
  };

  const checkIfAttendanceExists = (employeeId: string, date: string): boolean => {
    const attendanceDate = new Date(date).toISOString().split('T')[0];
    return attendanceRecords.some(
      (record) =>
        record.employeeId === employeeId &&
        new Date(record.date).toISOString().split('T')[0] === attendanceDate
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) {
      setError('Please select an employee');
      return;
    }

    // Validate date is not in the future
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    
    if (selectedDate > today) {
      setError('Cannot mark attendance for future dates. Please select today or a past date.');
      return;
    }

    // Check if attendance already exists for this date (client-side validation)
    if (checkIfAttendanceExists(selectedEmployee, formData.date)) {
      const formattedDate = formatDate(formData.date);
      setError(
        `Attendance for this employee has already been marked for ${formattedDate}. Cannot mark attendance twice for the same day.`
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await attendanceApi.mark({
        employeeId: selectedEmployee,
        date: formData.date,
        status: formData.status,
      });
      setSuccess(true);
      fetchAttendanceRecords(selectedEmployee);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
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
    });
  };

  return (
    <div className="attendance-management">
      <h2>Attendance Management</h2>

      <div className="attendance-form-container">
        <form onSubmit={handleSubmit} className="attendance-form">
          <div className="form-group">
            <label htmlFor="employeeSearch">Search Employee *</label>
            <div className="search-input-wrapper">
              <input
                type="text"
                id="employeeSearch"
                placeholder="Search by name, ID, email, or department..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setError(null);
                }}
                className="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setError(null);
                  }}
                  className="search-clear-btn"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            {searchQuery && filteredEmployees.length === 0 && (
              <small className="field-error" style={{ display: 'block', marginTop: '0.5rem' }}>
                No employees found matching "{searchQuery}"
              </small>
            )}
            {searchQuery && filteredEmployees.length > 0 && (
              <small className="field-success" style={{ display: 'block', marginTop: '0.5rem' }}>
                Found {filteredEmployees.length} employee(s)
              </small>
            )}
            {!searchQuery && employees.length > 0 && (
              <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
                {employees.length} total employee(s) available
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="employeeSelect">Select Employee *</label>
            <select
              id="employeeSelect"
              value={selectedEmployee}
              onChange={(e) => {
                setSelectedEmployee(e.target.value);
                setSearchQuery(''); // Clear search when employee is selected
              }}
              required
              disabled={filteredEmployees.length === 0 && searchQuery.trim() !== ''}
            >
              <option value="">
                {searchQuery && filteredEmployees.length === 0
                  ? 'No employees found'
                  : 'Choose an employee'}
              </option>
              {filteredEmployees.map((emp) => (
                <option key={emp._id} value={emp.employeeId}>
                  {emp.fullName} ({emp.employeeId}) - {emp.department}
                </option>
              ))}
            </select>
            {selectedEmployee && (
              <small className="field-success" style={{ display: 'block', marginTop: '0.5rem' }}>
                ✓ Employee selected
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              value={formData.date}
              max={maxDate}
              onChange={(e) => {
                const selectedDate = e.target.value;
                const today = new Date().toISOString().split('T')[0];
                
                // Ensure selected date is not in the future
                if (selectedDate > today) {
                  setError('Cannot select future dates. Please select today or a past date.');
                  return;
                }
                
                setFormData({ ...formData, date: selectedDate });
                setError(null); // Clear error when date changes
              }}
              required
            />
            <small className="field-info" style={{ display: 'block', marginTop: '0.5rem' }}>
              Only today and past dates are allowed
            </small>
            {selectedEmployee &&
              checkIfAttendanceExists(selectedEmployee, formData.date) && (
                <small className="warning-text" style={{ color: '#dc3545', display: 'block', marginTop: '0.5rem' }}>
                  ⚠️ Attendance already marked for this date
                </small>
              )}
          </div>

          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'Present' | 'Absent',
                })
              }
              required
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Attendance marked successfully!</div>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              loading ||
              !!(selectedEmployee &&
                checkIfAttendanceExists(selectedEmployee, formData.date))
            }
          >
            {loading
              ? 'Marking...'
              : selectedEmployee &&
                checkIfAttendanceExists(selectedEmployee, formData.date)
              ? 'Already Marked'
              : 'Mark Attendance'}
          </button>
        </form>
      </div>

      {selectedEmployee && (
        <div className="attendance-records">
          <h3>Attendance Records</h3>
          {fetchingRecords ? (
            <LoadingSpinner />
          ) : attendanceRecords.length === 0 ? (
            <div className="empty-state">
              <p>No attendance records found for this employee.</p>
            </div>
          ) : (
            <div className="attendance-table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record._id}>
                      <td>{formatDate(record.date)}</td>
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
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
