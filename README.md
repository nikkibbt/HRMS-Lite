# HRMS Lite - Human Resource Management System

A lightweight, full-stack Human Resource Management System built with modern web technologies. This application allows administrators to manage employee records, track daily attendance, view comprehensive analytics, and generate detailed reports.

## 🔗 Live Application URLs

**Frontend Application:** [https://hrms-lite-fseh.vercel.app](https://hrms-lite-fseh.vercel.app)  
**Backend API:** [https://hrms-lite-9yp1.onrender.com/api](https://hrms-lite-9yp1.onrender.com/api)  
**API Documentation:** [https://hrms-lite-9yp1.onrender.com/api-docs](https://hrms-lite-9yp1.onrender.com/api-docs)

## ✨ Highlights

- 🎯 **Complete CRUD Operations** - Create, Read, Update, Delete employees
- 📊 **Advanced Analytics** - Dashboard with charts and statistics
- 🔍 **Powerful Filtering** - Filter attendance by date, month, status, department
- 📈 **Real-time Validation** - Instant feedback on form inputs
- 🎨 **Modern UI/UX** - Professional design with modals and animations
- 📱 **Fully Responsive** - Works seamlessly on all devices
- 🚀 **Route-based Navigation** - Shareable URLs and browser navigation support

## 📑 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Application Routes](#️-application-routes)
- [API Endpoints](#-api-endpoints)
- [Key Features Walkthrough](#-key-features-walkthrough)
- [UI Features](#-ui-features)
- [Testing the Application](#-testing-the-application)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Assumptions & Limitations](#-assumptions--limitations)

## 🚀 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Recharts** - Chart library for data visualization
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM (Object Data Modeling)

## 📋 Features

### Employee Management
- ✅ Add new employees with unique Employee ID, Full Name, Email, and Department
- ✅ View list of all employees in a responsive grid layout
- ✅ **View employee details** - Click on any employee card to view full details
- ✅ **Edit employee information** - Update employee details with validation
- ✅ Delete employees with confirmation modal
- ✅ **Real-time Employee ID validation** - Instant feedback if ID already exists
- ✅ Form validation (required fields, email format, duplicate checking)
- ✅ Unique constraints on Employee ID and Email

### Attendance Management
- ✅ Mark attendance for employees (Present/Absent)
- ✅ **Search functionality** - Search employees by name, ID, email, or department
- ✅ **Date restriction** - Only allows today and past dates (no future dates)
- ✅ View attendance records per employee
- ✅ Date-based attendance tracking
- ✅ **Prevent duplicate attendance** - Cannot mark attendance twice for the same day
- ✅ Real-time validation and feedback

### Attendance History
- ✅ **View all attendance records** - Complete history with month grouping
- ✅ **Filter by date range** - Select custom date ranges
- ✅ **Filter by month** - Quick month-based filtering
- ✅ **Filter by status** - Present/Absent filtering
- ✅ **Filter by department** - Department-based filtering
- ✅ **Search functionality** - Search by employee name, ID, email, or department
- ✅ **Sorting options** - Sort by date, employee, department, or status
- ✅ **Grouping options** - Group by month, department, employee, status, or none
- ✅ **Responsive design** - Works on all screen sizes

### Dashboard & Analytics
- ✅ **Overview statistics** - Total employees, attendance records, present/absent counts, attendance rate
- ✅ **Summary statistics table** - Detailed counts and metrics
- ✅ **Present vs Absent pie chart** - Visual representation of attendance status
- ✅ **Employees by Department** - Bar chart showing department distribution
- ✅ **Attendance by Department** - Stacked bar chart with present/absent breakdown
- ✅ **Daily Attendance Trend** - Line chart showing last 14 days
- ✅ **Monthly Attendance Overview** - Bar chart with monthly statistics
- ✅ **Top Employees Table** - Ranked list with present days, absent days, and attendance rates
- ✅ **Total present days per employee** - Displayed in employee detail view

### User Experience
- ✅ **Route-based navigation** - Shareable URLs, browser navigation support
- ✅ **Modal dialogs** - Professional confirmation and alert modals
- ✅ **Loading states** - Spinner animations during API calls
- ✅ **Error handling** - User-friendly error messages
- ✅ **Empty states** - Helpful messages when no data is available
- ✅ **Success feedback** - Visual confirmation for successful operations
- ✅ **Responsive design** - Mobile-first, works on all devices

## 🏗️ Project Structure

```
hrms-lite/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts          # MongoDB connection
│   │   ├── models/
│   │   │   ├── Employee.ts          # Employee model with validation
│   │   │   └── Attendance.ts        # Attendance model with unique constraints
│   │   ├── routes/
│   │   │   ├── employeeRoutes.ts    # Employee CRUD endpoints
│   │   │   ├── attendanceRoutes.ts  # Attendance management endpoints
│   │   │   ├── analyticsRoutes.ts   # Analytics and dashboard endpoints
│   │   │   └── historyRoutes.ts     # Attendance history endpoints
│   │   └── index.ts                 # Express server setup
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EmployeeList.tsx     # Employee list with navigation
│   │   │   ├── EmployeeCard.tsx     # Clickable employee card
│   │   │   ├── EmployeeDetail.tsx   # Employee detail view with edit
│   │   │   ├── AddEmployeeForm.tsx  # Add employee with real-time validation
│   │   │   ├── AttendanceManagement.tsx  # Mark attendance with search
│   │   │   ├── AttendanceHistory.tsx     # History with filters & sorting
│   │   │   ├── Summary.tsx          # Dashboard with charts
│   │   │   ├── LoadingSpinner.tsx   # Loading indicator
│   │   │   ├── ConfirmationModal.tsx    # Delete confirmation modal
│   │   │   └── AlertModal.tsx       # Alert/error modal
│   │   ├── services/
│   │   │   └── api.ts               # API service layer
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces
│   │   ├── App.tsx                  # Main app with routing
│   │   ├── App.css                  # Global styles
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Base styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
│
└── README.md
```

## ⚡ Quick Start

### 🚀 Try the Live Application

**Live Application:** [https://hrms-lite-fseh.vercel.app](https://hrms-lite-fseh.vercel.app)

### 💻 Local Development Setup

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env and add your MongoDB connection string

# 3. Start backend server
npm run dev

# 4. In a new terminal, install frontend dependencies
cd ../frontend
npm install

# 5. Start frontend development server
npm run dev

# 6. Open http://localhost:3000 in your browser
```

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

## 📦 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd hrms-lite
```

### Step 2: Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB connection string:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hrms-lite
NODE_ENV=development
```

For MongoDB Atlas (cloud), use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hrms-lite
```

5. Start the backend server:
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The backend will run on `http://localhost:5000`

### Step 3: Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults to localhost):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🚀 Running the Application

1. **Start MongoDB** (if using local MongoDB):
```bash
# On macOS/Linux
mongod

# On Windows
net start MongoDB
```

2. **Start Backend** (Terminal 1):
```bash
cd backend
npm run dev
```

3. **Start Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

4. **Open Browser**:
Navigate to `http://localhost:3000`

## 📡 API Endpoints

### Employee Endpoints

- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get a single employee by ID
- `GET /api/employees/check-id/:employeeId` - Check if Employee ID exists (for real-time validation)
- `POST /api/employees` - Add a new employee
  ```json
  {
    "employeeId": "EMP001",
    "fullName": "John Doe",
    "email": "john.doe@company.com",
    "department": "Engineering"
  }
  ```
- `PUT /api/employees/:id` - Update an employee
- `DELETE /api/employees/:id` - Delete an employee

### Attendance Endpoints

- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/employee/:employeeId` - Get attendance for a specific employee
- `POST /api/attendance` - Mark attendance
  ```json
  {
    "employeeId": "EMP001",
    "date": "2026-02-02",
    "status": "Present"
  }
  ```
  **Note:** Cannot mark attendance twice for the same employee on the same date.

### History Endpoints

- `GET /api/history` - Get all attendance history grouped by month
- `GET /api/history/:year/:month` - Get attendance for a specific month (e.g., `/api/history/2026/2`)
- `GET /api/history/employee/:employeeId` - Get attendance history for a specific employee
- `GET /api/history/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get attendance within date range

### Analytics Endpoints

- `GET /api/analytics/summary` - Get dashboard analytics and statistics
  - Overview statistics (total employees, attendance records, rates)
  - Employees by department
  - Attendance by department
  - Daily attendance trend (last 30 days)
  - Top employees by attendance
  - Monthly attendance overview

### Health Check

- `GET /api/health` - Check API status

### API Documentation

- `GET /api-docs` - Swagger UI documentation (interactive API documentation)

**Access Swagger UI:** 
- Local: Navigate to `http://localhost:5000/api-docs` when the server is running locally
- Live: [https://hrms-lite-9yp1.onrender.com/api-docs](https://hrms-lite-9yp1.onrender.com/api-docs)

## 🎨 UI Features

### Design & Layout
- **Clean, Modern Design** - Professional gradient header and card-based layout
- **Route-based Navigation** - Shareable URLs, browser back/forward support
- **Responsive Design** - Mobile-first approach, works on all screen sizes
- **Modal Dialogs** - Professional confirmation and alert modals (no browser alerts)
- **Loading States** - Spinner animations during API calls
- **Error Handling** - User-friendly error messages with retry options
- **Empty States** - Helpful messages when no data is available
- **Success Feedback** - Visual confirmation for successful operations

### Interactive Features
- **Real-time Validation** - Instant feedback on form inputs
- **Search Functionality** - Search employees in attendance management
- **Advanced Filtering** - Multiple filter options in history page
- **Sorting Options** - Sort data by various criteria
- **Grouping Options** - Group records by different attributes
- **Date Restrictions** - Prevent future date selection
- **Visual Indicators** - Color-coded badges, icons, and status indicators

### Charts & Visualizations
- **Pie Charts** - Present vs Absent overview
- **Bar Charts** - Department distributions, monthly overviews
- **Line Charts** - Daily attendance trends
- **Data Tables** - Sortable and filterable tables
- **Statistics Cards** - Overview metrics with icons

## 🧪 Testing the Application

### Employee Management

1. **Add Employees**:
   - Navigate to `/add-employee` route
   - Fill in the form with test data
   - **Test real-time validation**: Type an existing Employee ID to see instant feedback
   - Submit and verify the employee appears in the list
   - Verify success message and navigation to employee detail

2. **View Employees**:
   - Navigate to `/employees` route
   - Verify all added employees are displayed in a grid
   - **Click on any employee card** to view details

3. **View & Edit Employee Details**:
   - Click on an employee card
   - View full employee information and attendance records
   - Click "Edit Employee" button
   - Modify information and save
   - Verify changes are reflected

4. **Delete Employee**:
   - Click the delete button (×) on any employee card
   - **Confirmation modal appears** (not browser alert)
   - Click "Yes, Delete" or "Cancel"
   - Verify the employee is removed

### Attendance Management

1. **Mark Attendance**:
   - Navigate to `/attendance` route
   - **Use search** to find an employee quickly
   - Select an employee from dropdown
   - **Verify date picker** only allows today and past dates
   - Choose a date and status
   - Submit and verify the record appears
   - **Try marking same date twice** - should show error

2. **View Attendance History**:
   - Navigate to `/history` route
   - **Test filters**:
     - Filter by month
     - Use date range filter
     - Filter by status (Present/Absent)
     - Filter by department
   - **Test search** - Search by employee name, ID, email, or department
   - **Test sorting** - Sort by date, employee, department, status
   - **Test grouping** - Group by month, department, employee, status, or none
   - Verify records are displayed correctly

### Dashboard & Analytics

1. **View Dashboard**:
   - Navigate to `/dashboard` route (default route)
   - Verify overview cards show correct statistics
   - Check all charts are rendering
   - Verify top employees table displays data
   - Check summary statistics table

2. **Test Analytics**:
   - Add multiple employees and attendance records
   - Refresh dashboard to see updated statistics
   - Verify charts update with new data
   - Check attendance rates are calculated correctly

### Route Navigation

1. **Test Routes**:
   - Navigate between pages using navigation bar
   - Use browser back/forward buttons
   - Bookmark specific pages (e.g., `/employees/123`)
   - Share URLs - they should work when accessed directly

## 🌐 Deployment

### Live URLs

**Frontend Application (Live):**
- Application URL: [https://hrms-lite-fseh.vercel.app](https://hrms-lite-fseh.vercel.app)
- Deployed on: Vercel

**Backend API (Live):**
- Base URL: `https://hrms-lite-9yp1.onrender.com/api`
- Swagger Documentation: [https://hrms-lite-9yp1.onrender.com/api-docs](https://hrms-lite-9yp1.onrender.com/api-docs)
- Health Check: [https://hrms-lite-9yp1.onrender.com/api/health](https://hrms-lite-9yp1.onrender.com/api/health)
- Deployed on: Render

**Example API Endpoints:**
- Get all employees: `https://hrms-lite-9yp1.onrender.com/api/employees`
- Get analytics: `https://hrms-lite-9yp1.onrender.com/api/analytics/summary`
- Get attendance history: `https://hrms-lite-9yp1.onrender.com/api/history`

### Backend Deployment (Render/Railway/Heroku)

1. **Prepare for deployment**:
   - Ensure `package.json` has a `start` script
   - Set `NODE_ENV=production` in environment variables
   - Add MongoDB connection string to environment variables

2. **Deploy to Render**:
   - Create a new Web Service
   - Connect your GitHub repository
   - Set build command: `npm install && npm run build`
   - Set start command: `npm start`
   - Add environment variables (PORT, MONGODB_URI, NODE_ENV)

3. **Deploy to Railway**:
   - Create a new project
   - Connect GitHub repository
   - Add MongoDB service
   - Set environment variables
   - Deploy

### Frontend Deployment (Vercel/Netlify)

1. **Build the frontend**:
```bash
cd frontend
npm run build
```

2. **Deploy to Vercel**:
   - Install Vercel CLI: `npm i -g vercel`
   - Run `vercel` in the frontend directory
   - Set environment variable: `VITE_API_URL=https://hrms-lite-9yp1.onrender.com/api`

3. **Deploy to Netlify**:
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variable: `VITE_API_URL=https://hrms-lite-9yp1.onrender.com/api`

### Environment Variables for Production

**Backend (.env)**:
```env
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
NODE_ENV=production
```

**Frontend (.env)**:
```env
# For production (using live backend)
VITE_API_URL=https://hrms-lite-9yp1.onrender.com/api

# For local development
# VITE_API_URL=http://localhost:5000/api
```

## 📝 Assumptions & Limitations

### Assumptions
- Single admin user (no authentication required)
- Employee ID is unique and user-provided (normalized to uppercase)
- Email is unique per employee
- Date format: YYYY-MM-DD
- Only today and past dates can be selected for attendance
- One attendance record per employee per day (cannot mark twice)
- Employee ID format: Alphanumeric, hyphens, and underscores only (minimum 2 characters)

### Limitations
- No user authentication/authorization
- No pagination for large datasets (all records loaded at once)
- No export functionality (CSV/PDF export)
- No email notifications
- No role-based access control
- No bulk operations (bulk delete, bulk attendance marking)
- No attendance editing (only marking new records)
- No time tracking (only date-based attendance)

### Future Enhancements
- User authentication and authorization
- Pagination for large datasets
- Export to CSV/PDF
- Email notifications
- Bulk operations
- Attendance editing capability
- Time tracking (check-in/check-out)
- Leave management
- Payroll integration

## 🔧 Troubleshooting

### Backend Issues

**MongoDB Connection Error**:
- Verify MongoDB is running (local) or connection string is correct (Atlas)
- Check firewall settings if using cloud MongoDB
- Ensure network access is configured in MongoDB Atlas
- Verify connection string format: `mongodb://localhost:27017/hrms-lite` or `mongodb+srv://...`

**Port Already in Use**:
- Change PORT in `.env` file
- Kill the process using the port: `lsof -ti:5000 | xargs kill` (Linux/Mac)
- On Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`

**Route Not Found Errors**:
- Ensure all routes are properly registered in `index.ts`
- Check route order (specific routes before parameterized routes)
- Verify API base URL matches backend port

**Validation Errors**:
- Check that Employee ID and Email are unique
- Verify email format matches RFC 5322 standard
- Ensure all required fields are provided

### Frontend Issues

**API Connection Error**:
- Verify backend is running on correct port
- Check `VITE_API_URL` in `.env` (should be `http://localhost:5000/api`)
- Verify CORS is enabled in backend
- Check browser console for detailed error messages

**Build Errors**:
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript version compatibility
- Verify all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run build`

**Routing Issues**:
- Ensure React Router is properly set up in `main.tsx`
- Check that all routes are defined in `App.tsx`
- Verify route paths match navigation links

**Chart Not Rendering**:
- Ensure Recharts is installed: `npm install recharts`
- Check browser console for errors
- Verify data format matches chart expectations

**Modal Not Closing**:
- Check browser console for JavaScript errors
- Verify event handlers are properly bound
- Ensure modal state is managed correctly

## 📄 License

This project is created for assignment purposes.

## 👨‍💻 Author

Created as part of a full-stack development assignment.

## 🗺️ Application Routes

### Frontend Routes

- `/` or `/dashboard` - Dashboard with analytics and charts
- `/employees` - Employee list view
- `/employees/:id` - Employee detail view with edit capability
- `/add-employee` - Add new employee form
- `/attendance` - Mark attendance page
- `/history` - Attendance history with filters and sorting

### Navigation

The application uses React Router for client-side routing:
- All routes are accessible via navigation bar
- URLs are shareable and bookmarkable
- Browser back/forward buttons work correctly
- Direct URL access is supported

## 📊 Key Features Walkthrough

### 1. Adding an Employee
1. Navigate to "Add Employee" from the navigation bar
2. Enter Employee ID (auto-converts to uppercase)
3. **Real-time validation** checks if ID exists as you type
4. Fill in Full Name, Email, and Department
5. Submit form - redirects to employee detail page on success

### 2. Viewing Employee Details
1. Click on any employee card in the employee list
2. View complete employee information
3. See all attendance records for that employee
4. View attendance statistics (present days, absent days, attendance rate)
5. Click "Edit Employee" to modify information

### 3. Marking Attendance
1. Navigate to "Attendance" page
2. **Search for employee** using the search box
3. Select employee from filtered dropdown
4. **Date picker** only allows today and past dates
5. Select status (Present/Absent)
6. Submit - prevents duplicate entries for same date

### 4. Viewing Attendance History
1. Navigate to "History" page
2. **Apply filters**:
   - Use date range filter for custom periods
   - Filter by month for quick access
   - Filter by status or department
   - Use search to find specific records
3. **Sort records** by date, employee, department, or status
4. **Group records** by month, department, employee, status, or view flat list
5. View comprehensive attendance data

### 5. Dashboard Analytics
1. Navigate to "Dashboard" (default page)
2. View overview statistics cards
3. Analyze charts:
   - Present vs Absent distribution
   - Department-wise breakdowns
   - Daily and monthly trends
4. Review top employees table
5. Check summary statistics

## 🎯 Best Practices

### For Development
- Always run backend before frontend
- Use environment variables for configuration
- Check browser console for debugging
- Use React DevTools for component inspection
- Monitor network tab for API calls

### For Production
- Set `NODE_ENV=production`
- Use MongoDB Atlas or managed database service
- Enable HTTPS for secure connections
- Set up proper CORS configuration
- Implement error logging and monitoring
- Use environment variables for sensitive data

## 📚 Additional Resources

### Dependencies
- **React Router DOM**: `npm install react-router-dom`
- **Recharts**: `npm install recharts`
- **Axios**: `npm install axios`
- **Express**: `npm install express`
- **Mongoose**: `npm install mongoose`

### Development Tools
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and HMR
- **ESLint**: Code linting (if configured)
- **Prettier**: Code formatting (if configured)

---

**Note**: Make sure MongoDB is running before starting the backend server. For production deployment, use a managed MongoDB service like MongoDB Atlas. All features are fully functional and tested. The application is production-ready with proper error handling, validation, and user feedback.
