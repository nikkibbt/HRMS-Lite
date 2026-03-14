import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Employee } from '../types';
import { employeeApi, attendanceApi } from '../services/api';
import { Attendance } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface FormErrors {
  employeeId?: string;
  email?: string;
  fullName?: string;
  department?: string;
}

const EmployeeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const employeeId = id || '';
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    department: '',
  });

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  useEffect(() => {
    if (employee && !isEditing) {
      fetchAttendanceRecords();
    }
  }, [employee, isEditing]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeApi.getById(employeeId);
      setEmployee(data);
      setFormData({
        employeeId: data.employeeId,
        fullName: data.fullName,
        email: data.email,
        department: data.department,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch employee details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    if (!employee) return;
    try {
      setAttendanceLoading(true);
      const data = await attendanceApi.getByEmployee(employee.employeeId);
      setAttendanceRecords(data);
    } catch (err: any) {
      console.error('Failed to fetch attendance records:', err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  };

  // Validate Employee ID format
  const validateEmployeeId = (employeeId: string): boolean => {
    const employeeIdRegex = /^[a-zA-Z0-9_-]+$/;
    return employeeId.trim().length >= 2 && employeeIdRegex.test(employeeId);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const normalizedValue = name === 'employeeId' ? value.toUpperCase() : value;

    setFormData({
      ...formData,
      [name]: normalizedValue,
    });

    setErrors({
      ...errors,
      [name]: undefined,
    });
    setError(null);
    setSuccess(false);

    // Real-time validation
    if (name === 'email' && normalizedValue) {
      if (!validateEmail(normalizedValue)) {
        setErrors({
          ...errors,
          email: 'Please enter a valid email address (e.g., user@example.com)',
        });
      }
    }

    if (name === 'employeeId' && normalizedValue) {
      if (!validateEmployeeId(normalizedValue)) {
        setErrors({
          ...errors,
          employeeId: 'Employee ID must be at least 2 characters and contain only letters, numbers, hyphens, and underscores',
        });
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(false);
    setErrors({});
  };

  const handleCancel = () => {
    if (employee) {
      setFormData({
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        email: employee.email,
        department: employee.department,
      });
    }
    setIsEditing(false);
    setErrors({});
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    // Client-side validation
    const newErrors: FormErrors = {};

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    } else if (!validateEmployeeId(formData.employeeId)) {
      newErrors.employeeId = 'Employee ID must be at least 2 characters and contain only letters, numbers, hyphens, and underscores';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address (e.g., user@example.com)';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!employee) return;

    setSaving(true);
    setError(null);
    setErrors({});
    setSuccess(false);

    try {
      const updatedEmployee = await employeeApi.update(employee._id, formData);
      setEmployee(updatedEmployee);
      setIsEditing(false);
      setSuccess(true);
      // Update URL if employee ID changed
      if (updatedEmployee.employeeId !== employee.employeeId) {
        navigate(`/employees/${updatedEmployee._id}`, { replace: true });
      }
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update employee';
      const errorField = err.response?.data?.field;

      if (errorField) {
        setErrors({
          [errorField]: errorMessage,
        });
      } else {
        setError(errorMessage);
      }
    } finally {
      setSaving(false);
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

  if (!employeeId) {
    return (
      <div className="error-container">
        <p className="error-message">Employee ID is missing</p>
        <button onClick={() => navigate('/employees')} className="btn btn-secondary">
          Back to List
        </button>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !employee) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/employees')} className="btn btn-secondary">
          Back to List
        </button>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  return (
    <div className="employee-detail">
      <div className="detail-header">
        <button 
          onClick={() => navigate('/employees')} 
          className="btn-back"
          title="Go back to employee list"
        >
          ← Back to Employees
        </button>
        <div className="header-actions">
          {!isEditing && (
            <button onClick={handleEdit} className="btn btn-primary">
              Edit Employee
            </button>
          )}
        </div>
      </div>

      <div className="detail-content">
        {isEditing ? (
          <div className="edit-form">
            <h2>Edit Employee</h2>
            <div className="form-group">
              <label htmlFor="edit-employeeId">Employee ID *</label>
              <input
                type="text"
                id="edit-employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className={errors.employeeId ? 'input-error' : ''}
                disabled={saving}
              />
              {errors.employeeId && (
                <small className="field-error">{errors.employeeId}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="edit-fullName">Full Name *</label>
              <input
                type="text"
                id="edit-fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={errors.fullName ? 'input-error' : ''}
                disabled={saving}
              />
              {errors.fullName && (
                <small className="field-error">{errors.fullName}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="edit-email">Email Address *</label>
              <input
                type="email"
                id="edit-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'input-error' : ''}
                disabled={saving}
              />
              {errors.email && (
                <small className="field-error">{errors.email}</small>
              )}
              {formData.email && !errors.email && validateEmail(formData.email) && (
                <small className="field-success">✓ Valid email format</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="edit-department">Department *</label>
              <select
                id="edit-department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={errors.department ? 'input-error' : ''}
                disabled={saving}
              >
                <option value="">Select Department</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="IT">IT</option>
                <option value="Other">Other</option>
              </select>
              {errors.department && (
                <small className="field-error">{errors.department}</small>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Employee updated successfully!</div>}

            <div className="form-actions">
              <button
                type="button"
                onClick={handleSave}
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="detail-card">
              <div className="detail-card-header">
                <h2>{employee.fullName}</h2>
              </div>
              <div className="detail-card-body">
                <div className="detail-row">
                  <span className="detail-label">Employee ID:</span>
                  <span className="detail-value">{employee.employeeId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{employee.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Department:</span>
                  <span className="detail-value">{employee.department}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created At:</span>
                  <span className="detail-value">
                    {formatDate(employee.createdAt)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Updated:</span>
                  <span className="detail-value">
                    {formatDate(employee.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="attendance-section">
              <h3>Attendance Records</h3>
              {attendanceLoading ? (
                <LoadingSpinner />
              ) : attendanceRecords.length === 0 ? (
                <div className="empty-state">
                  <p>No attendance records found for this employee.</p>
                </div>
              ) : (
                <>
                  {/* Attendance Summary */}
                  <div className="attendance-summary">
                    <div className="summary-card">
                      <div className="summary-icon present">
                        ✅
                      </div>
                      <div className="summary-content">
                        <h4>
                          {attendanceRecords.filter((r) => r.status === 'Present').length}
                        </h4>
                        <p>Present Days</p>
                      </div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-icon absent">
                        ❌
                      </div>
                      <div className="summary-content">
                        <h4>
                          {attendanceRecords.filter((r) => r.status === 'Absent').length}
                        </h4>
                        <p>Absent Days</p>
                      </div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-icon total">
                        📊
                      </div>
                      <div className="summary-content">
                        <h4>{attendanceRecords.length}</h4>
                        <p>Total Days</p>
                      </div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-icon rate">
                        📈
                      </div>
                      <div className="summary-content">
                        <h4>
                          {attendanceRecords.length > 0
                            ? (
                                (attendanceRecords.filter((r) => r.status === 'Present').length /
                                  attendanceRecords.length) *
                                100
                              ).toFixed(1)
                            : '0.0'}
                          %
                        </h4>
                        <p>Attendance Rate</p>
                      </div>
                    </div>
                  </div>

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
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetail;
