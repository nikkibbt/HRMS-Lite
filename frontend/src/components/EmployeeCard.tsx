import { Employee } from '../types';

interface EmployeeCardProps {
  employee: Employee;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}

const EmployeeCard = ({ employee, onDelete, onClick }: EmployeeCardProps) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on delete button
    if ((e.target as HTMLElement).closest('.btn-delete')) {
      return;
    }
    onClick(employee._id);
  };

  return (
    <div className="employee-card" onClick={handleCardClick}>
      <div className="employee-card-header">
        <h3>{employee.fullName}</h3>
        <button
          className="btn-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(employee._id);
          }}
          aria-label="Delete employee"
        >
          ×
        </button>
      </div>
      <div className="employee-card-body">
        <p><strong>Employee ID:</strong> {employee.employeeId}</p>
        <p><strong>Email:</strong> {employee.email}</p>
        <p><strong>Department:</strong> {employee.department}</p>
      </div>
      <div className="employee-card-footer">
        <span className="view-details">Click to view details →</span>
      </div>
    </div>
  );
};

export default EmployeeCard;
