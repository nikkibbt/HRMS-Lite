import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import EmployeeList from './components/EmployeeList';
import AddEmployeeForm from './components/AddEmployeeForm';
import AttendanceManagement from './components/AttendanceManagement';
import AttendanceHistory from './components/AttendanceHistory';
import Summary from './components/Summary';
import EmployeeDetail from './components/EmployeeDetail';
import NotFound from './components/NotFound';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>HRMS Lite</h1>
        <p className="subtitle">Human Resource Management System</p>
      </header>

      <nav className="app-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/employees"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Employees
        </NavLink>
        <NavLink
          to="/add-employee"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Add Employee
        </NavLink>
        <NavLink
          to="/attendance"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Attendance
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          History
        </NavLink>
      </nav>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Summary />} />
          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/add-employee" element={<AddEmployeeForm />} />
          <Route path="/attendance" element={<AttendanceManagement />} />
          <Route path="/history" element={<AttendanceHistory />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>&copy; 2026 HRMS Lite. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
