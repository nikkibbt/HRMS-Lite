import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Employee } from '../types';
import { employeeApi } from '../services/api';
import EmployeeCard from './EmployeeCard';
import LoadingSpinner from './LoadingSpinner';
import ConfirmationModal from './ConfirmationModal';
import AlertModal from './AlertModal';

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    employeeId: string | null;
    employeeName: string;
  }>({
    isOpen: false,
    employeeId: null,
    employeeName: '',
  });
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'error' | 'success' | 'info' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeApi.getAll();
      setEmployees(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      employeeId: id,
      employeeName: name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.employeeId) return;

    try {
      await employeeApi.delete(deleteModal.employeeId);
      setEmployees(employees.filter((emp) => emp._id !== deleteModal.employeeId));
      setDeleteModal({
        isOpen: false,
        employeeId: null,
        employeeName: '',
      });
      setAlertModal({
        isOpen: true,
        title: 'Success',
        message: `Employee "${deleteModal.employeeName}" has been deleted successfully.`,
        type: 'success',
      });
    } catch (err: any) {
      setDeleteModal({
        isOpen: false,
        employeeId: null,
        employeeName: '',
      });
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: err.response?.data?.message || 'Failed to delete employee',
        type: 'error',
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      employeeId: null,
      employeeName: '',
    });
  };

  const handleEmployeeClick = (id: string) => {
    navigate(`/employees/${id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchEmployees} className="btn btn-secondary">
          Retry
        </button>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="empty-state">
        <p>No employees found. Add your first employee to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="employee-list">
        <h2>Employee List</h2>
        <div className="employee-grid">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee._id}
              employee={employee}
              onDelete={() => handleDeleteClick(employee._id, employee.fullName)}
              onClick={handleEmployeeClick}
            />
          ))}
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Employee"
        message={`Are you sure you want to delete "${deleteModal.employeeName}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        type="danger"
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() =>
          setAlertModal({
            isOpen: false,
            title: '',
            message: '',
            type: 'info',
          })
        }
      />
    </>
  );
};

export default EmployeeList;
