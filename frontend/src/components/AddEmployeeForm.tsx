import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeApi } from '../services/api';

interface FormErrors {
  employeeId?: string;
  email?: string;
  fullName?: string;
  department?: string;
}

const AddEmployeeForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [checkingEmployeeId, setCheckingEmployeeId] = useState(false);
  const [employeeIdExists, setEmployeeIdExists] = useState(false);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  };

  // Validate Employee ID format (alphanumeric, allow hyphens and underscores)
  const validateEmployeeId = (employeeId: string): boolean => {
    const employeeIdRegex = /^[a-zA-Z0-9_-]+$/;
    return employeeId.trim().length >= 2 && employeeIdRegex.test(employeeId);
  };

  // Check if employee ID exists (debounced)
  const checkEmployeeId = async (employeeId: string) => {
    if (!employeeId.trim() || !validateEmployeeId(employeeId)) {
      setEmployeeIdExists(false);
      setCheckingEmployeeId(false);
      return;
    }

    setCheckingEmployeeId(true);
    try {
      const exists = await employeeApi.checkEmployeeIdExists(employeeId);
      setEmployeeIdExists(exists);
      
      if (exists) {
        setErrors({
          ...errors,
          employeeId: `Employee ID "${employeeId.toUpperCase()}" already exists. Please use a different ID.`,
        });
      } else {
        // Clear error if ID doesn't exist
        setErrors({
          ...errors,
          employeeId: undefined,
        });
      }
    } catch (err) {
      // Silently fail - don't block user input
      setEmployeeIdExists(false);
    } finally {
      setCheckingEmployeeId(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Normalize Employee ID to uppercase as user types
    const normalizedValue = name === 'employeeId' ? value.toUpperCase() : value;
    
    setFormData({
      ...formData,
      [name]: normalizedValue,
    });
    
    // Clear errors for this field
    setErrors({
      ...errors,
      [name]: undefined,
    });
    setError(null);
    setSuccess(false);
    setEmployeeIdExists(false);

    // Real-time validation
    if (name === 'email' && normalizedValue) {
      if (!validateEmail(normalizedValue)) {
        setErrors({
          ...errors,
          email: 'Please enter a valid email address (e.g., user@example.com)',
        });
      }
    }

    if (name === 'employeeId') {
      if (normalizedValue) {
        // Format validation
        if (!validateEmployeeId(normalizedValue)) {
          setErrors({
            ...errors,
            employeeId: 'Employee ID must be at least 2 characters and contain only letters, numbers, hyphens, and underscores',
          });
        } else {
          // Clear format error and check if ID exists (debounced)
          setErrors({
            ...errors,
            employeeId: undefined,
          });
          
          // Clear previous timeout
          if (checkTimeoutRef.current) {
            clearTimeout(checkTimeoutRef.current);
          }
          
          // Debounce the check - wait 500ms after user stops typing
          checkTimeoutRef.current = setTimeout(() => {
            checkEmployeeId(normalizedValue);
          }, 500);
        }
      } else {
        // Clear checking state if field is empty
        setCheckingEmployeeId(false);
        setEmployeeIdExists(false);
        if (checkTimeoutRef.current) {
          clearTimeout(checkTimeoutRef.current);
        }
      }
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const newErrors: FormErrors = {};
    
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    } else if (!validateEmployeeId(formData.employeeId)) {
      newErrors.employeeId = 'Employee ID can only contain letters, numbers, hyphens, and underscores';
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

    // Check if employee ID exists before submitting
    if (formData.employeeId.trim() && validateEmployeeId(formData.employeeId)) {
      const exists = await employeeApi.checkEmployeeIdExists(formData.employeeId);
      if (exists) {
        setErrors({
          ...newErrors,
          employeeId: `Employee ID "${formData.employeeId}" already exists. Please use a different ID.`,
        });
        setEmployeeIdExists(true);
        return;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setError(null);
    setErrors({});
    setSuccess(false);
    setEmployeeIdExists(false);

    try {
      const newEmployee = await employeeApi.create(formData);
      setSuccess(true);
      setFormData({
        employeeId: '',
        fullName: '',
        email: '',
        department: '',
      });
      setErrors({});
      // Navigate to employee detail page after successful creation
      setTimeout(() => {
        navigate(`/employees/${newEmployee._id}`);
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add employee';
      const errorField = err.response?.data?.field;
      
      // Set field-specific error if available
      if (errorField && err.response?.data?.field) {
        setErrors({
          [errorField]: errorMessage,
        });
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-employee-form">
      <h2>Add New Employee</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="employeeId">Employee ID *</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="employeeId"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              required
              placeholder="e.g., EMP001"
              className={
                errors.employeeId || employeeIdExists
                  ? 'input-error'
                  : formData.employeeId &&
                    !checkingEmployeeId &&
                    !employeeIdExists &&
                    validateEmployeeId(formData.employeeId)
                  ? 'input-success'
                  : ''
              }
              disabled={loading}
            />
            {checkingEmployeeId && (
              <span className="checking-indicator" title="Checking availability...">
                <span className="spinner-small"></span>
              </span>
            )}
            {!checkingEmployeeId &&
              formData.employeeId &&
              validateEmployeeId(formData.employeeId) &&
              !employeeIdExists && (
                <span className="check-success-indicator" title="Employee ID is available">
                  ✓
                </span>
              )}
            {employeeIdExists && (
              <span className="check-error-indicator" title="Employee ID already exists">
                ✗
              </span>
            )}
          </div>
          {checkingEmployeeId && (
            <small className="field-info" style={{ color: '#667eea' }}>
              Checking availability...
            </small>
          )}
          {errors.employeeId && (
            <small className="field-error">{errors.employeeId}</small>
          )}
          {!checkingEmployeeId &&
            formData.employeeId &&
            !errors.employeeId &&
            validateEmployeeId(formData.employeeId) &&
            !employeeIdExists && (
              <small className="field-success">✓ Employee ID is available</small>
            )}
        </div>

        <div className="form-group">
          <label htmlFor="fullName">Full Name *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder="e.g., John Doe"
            className={errors.fullName ? 'input-error' : ''}
          />
          {errors.fullName && (
            <small className="field-error">{errors.fullName}</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="e.g., john.doe@company.com"
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && (
            <small className="field-error">{errors.email}</small>
          )}
          {formData.email && !errors.email && validateEmail(formData.email) && (
            <small className="field-success">✓ Valid email format</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="department">Department *</label>
          <select
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            className={errors.department ? 'input-error' : ''}
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
        {success && <div className="success-message">Employee added successfully!</div>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Adding...' : 'Add Employee'}
        </button>
      </form>
    </div>
  );
};

export default AddEmployeeForm;
