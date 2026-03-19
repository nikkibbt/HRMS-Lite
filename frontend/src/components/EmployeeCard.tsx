import { Employee } from "../types";

interface EmployeeCardProps {
  employee: Employee;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}

const EmployeeCard = ({ employee, onDelete, onClick }: EmployeeCardProps) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on delete button
    if ((e.target as HTMLElement).closest(".btn-delete")) {
      return;
    }
    onClick(employee._id);
  };

  return (
    <div
      className="employee-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick(employee._id);
        }
      }}
    >
      <div className="employee-card-header">
        <div className="employee-info">
          <h3>{employee.fullName}</h3>
          <span className="employee-id-badge">{employee.employeeId}</span>
        </div>
        <button
          className="btn-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(employee._id);
          }}
          aria-label="Delete employee"
          title="Delete employee"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="red"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="employee-card-body">
        <div className="detail-item">
          <span className="detail-label">Email : </span>
          <span className="detail-value">{employee.email}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Department : </span>
          <span className="detail-value department-badge">
            {employee.department}
          </span>
        </div>
      </div>

      <div className="employee-card-footer">
        <span className="view-details">
          View Details
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default EmployeeCard;
