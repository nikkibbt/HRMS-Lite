# API Routes Documentation

Complete API documentation for HRMS Lite backend endpoints.

## Base URL
```
http://localhost:5000/api
```

---

## Employee Routes (`/api/employees`)

### 1. Check Employee ID Exists
- **Method:** `GET`
- **Path:** `/api/employees/check-id/:employeeId`
- **Description:** Check if an Employee ID already exists (for real-time validation)
- **Parameters:**
  - `employeeId` (URL parameter): Employee ID string (case-insensitive, auto-uppercased)
- **Response:** 
  ```json
  {
    "success": true,
    "exists": false,
    "employeeId": "EMP001"
  }
  ```
- **Status Codes:**
  - `200`: Success
  - `500`: Server error

### 2. Get All Employees
- **Method:** `GET`
- **Path:** `/api/employees`
- **Description:** Retrieve all employees sorted by creation date (newest first)
- **Response:** 
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "...",
        "employeeId": "EMP001",
        "fullName": "John Doe",
        "email": "john.doe@company.com",
        "department": "Engineering",
        "createdAt": "2026-02-02T...",
        "updatedAt": "2026-02-02T..."
      }
    ]
  }
  ```
- **Status Codes:**
  - `200`: Success
  - `500`: Server error

### 3. Get Employee by ID
- **Method:** `GET`
- **Path:** `/api/employees/:id`
- **Description:** Retrieve a single employee by MongoDB ObjectId
- **Parameters:**
  - `id` (URL parameter): MongoDB ObjectId string (24 hex characters)
- **Response:** Employee object
- **Status Codes:**
  - `200`: Success
  - `400`: Invalid employee ID format
  - `404`: Employee not found
  - `500`: Server error

### 4. Create Employee
- **Method:** `POST`
- **Path:** `/api/employees`
- **Description:** Create a new employee with validation
- **Request Body:**
  ```json
  {
    "employeeId": "EMP001",
    "fullName": "John Doe",
    "email": "john.doe@company.com",
    "department": "Engineering"
  }
  ```
- **Validation:**
  - All fields are required
  - Employee ID must be unique
  - Email must be unique and valid format
  - Employee ID normalized to uppercase
  - Email normalized to lowercase
- **Response:** Created employee object
- **Status Codes:**
  - `201`: Created successfully
  - `400`: Validation error
  - `409`: Employee ID or Email already exists
  - `500`: Server error

### 5. Update Employee
- **Method:** `PUT`
- **Path:** `/api/employees/:id`
- **Description:** Update an existing employee
- **Parameters:**
  - `id` (URL parameter): MongoDB ObjectId string
- **Request Body:**
  ```json
  {
    "employeeId": "EMP001",
    "fullName": "John Doe Updated",
    "email": "john.doe.updated@company.com",
    "department": "Marketing"
  }
  ```
- **Validation:** Same as Create Employee
- **Response:** Updated employee object
- **Status Codes:**
  - `200`: Updated successfully
  - `400`: Validation error
  - `404`: Employee not found
  - `409`: Employee ID or Email already exists (for different employee)
  - `500`: Server error

### 6. Delete Employee
- **Method:** `DELETE`
- **Path:** `/api/employees/:id`
- **Description:** Delete an employee by ID
- **Parameters:**
  - `id` (URL parameter): MongoDB ObjectId string
- **Response:** Deleted employee object
- **Status Codes:**
  - `200`: Deleted successfully
  - `404`: Employee not found
  - `500`: Server error

---

## Attendance Routes (`/api/attendance`)

### 1. Mark Attendance
- **Method:** `POST`
- **Path:** `/api/attendance`
- **Description:** Mark attendance for an employee (Present/Absent)
- **Request Body:**
  ```json
  {
    "employeeId": "EMP001",
    "date": "2026-02-02",
    "status": "Present"
  }
  ```
- **Validation:**
  - All fields are required
  - Status must be "Present" or "Absent"
  - Employee must exist
  - Cannot mark attendance twice for the same employee on the same date
- **Response:** Created attendance record
- **Status Codes:**
  - `201`: Attendance marked successfully
  - `400`: Validation error
  - `404`: Employee not found
  - `409`: Attendance already exists for this date
  - `500`: Server error

### 2. Get Attendance by Employee
- **Method:** `GET`
- **Path:** `/api/attendance/employee/:employeeId`
- **Description:** Get all attendance records for a specific employee
- **Parameters:**
  - `employeeId` (URL parameter): Employee ID string
- **Response:** Array of attendance records
- **Status Codes:**
  - `200`: Success
  - `404`: Employee not found
  - `500`: Server error

### 3. Get All Attendance Records
- **Method:** `GET`
- **Path:** `/api/attendance`
- **Description:** Get all attendance records with employee information
- **Response:** Array of attendance records with enriched employee data
- **Status Codes:**
  - `200`: Success
  - `500`: Server error

---

## History Routes (`/api/history`)

### 1. Get Attendance History (Grouped by Month)
- **Method:** `GET`
- **Path:** `/api/history`
- **Description:** Get all attendance records grouped by month, sorted by date (newest first)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "data": [
        {
          "monthKey": "2026-02",
          "monthLabel": "February 2026",
          "records": [...]
        }
      ],
      "totalRecords": 150
    }
  }
  ```
- **Status Codes:**
  - `200`: Success
  - `500`: Server error

### 2. Get Attendance by Month
- **Method:** `GET`
- **Path:** `/api/history/:year/:month`
- **Description:** Get attendance records for a specific month
- **Parameters:**
  - `year` (URL parameter): 4-digit year (e.g., 2026)
  - `month` (URL parameter): Month number 1-12
- **Example:** `/api/history/2026/2` (February 2026)
- **Response:** Attendance records for the specified month
- **Status Codes:**
  - `200`: Success
  - `400`: Invalid year or month
  - `500`: Server error

### 3. Get Employee Attendance History
- **Method:** `GET`
- **Path:** `/api/history/employee/:employeeId`
- **Description:** Get attendance history for a specific employee, grouped by month
- **Parameters:**
  - `employeeId` (URL parameter): Employee ID string
- **Response:** Attendance history grouped by month with employee information
- **Status Codes:**
  - `200`: Success
  - `404`: Employee not found
  - `500`: Server error

### 4. Get Attendance by Date Range
- **Method:** `GET`
- **Path:** `/api/history/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- **Description:** Get attendance records within a date range
- **Query Parameters:**
  - `startDate` (required): Start date in YYYY-MM-DD format
  - `endDate` (required): End date in YYYY-MM-DD format
- **Example:** `/api/history/range?startDate=2026-01-01&endDate=2026-01-31`
- **Response:** Attendance records within the date range
- **Status Codes:**
  - `200`: Success
  - `400`: Invalid date format or range
  - `500`: Server error

---

## Analytics Routes (`/api/analytics`)

### 1. Get Dashboard Summary
- **Method:** `GET`
- **Path:** `/api/analytics/summary`
- **Description:** Get comprehensive analytics and statistics for the dashboard
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "overview": {
        "totalEmployees": 50,
        "totalAttendanceRecords": 500,
        "presentCount": 450,
        "absentCount": 50,
        "attendanceRate": "90.00"
      },
      "employeesByDepartment": [...],
      "attendanceByDepartment": [...],
      "dailyAttendance": [...],
      "topEmployeesByAttendance": [...],
      "monthlyAttendance": [...]
    }
  }
  ```
- **Status Codes:**
  - `200`: Success
  - `500`: Server error

---

## Health Check

### Check API Status
- **Method:** `GET`
- **Path:** `/api/health`
- **Description:** Check if the API is running
- **Response:**
  ```json
  {
    "success": true,
    "message": "HRMS Lite API is running"
  }
  ```
- **Status Codes:**
  - `200`: API is running

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message description",
  "error": "Detailed error message (optional)",
  "field": "field-name (optional, for validation errors)"
}
```

## Common HTTP Status Codes

- `200` - Success
- `201` - Created successfully
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

## Example Usage

### Check if Employee ID exists
```bash
curl http://localhost:5000/api/employees/check-id/EMP001
```

### Get all employees
```bash
curl http://localhost:5000/api/employees
```

### Create an employee
```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "fullName": "John Doe",
    "email": "john.doe@company.com",
    "department": "Engineering"
  }'
```

### Mark attendance
```bash
curl -X POST http://localhost:5000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "date": "2026-02-02",
    "status": "Present"
  }'
```

### Get attendance history
```bash
curl http://localhost:5000/api/history
```

### Get analytics summary
```bash
curl http://localhost:5000/api/analytics/summary
```

---

## Notes

- All dates should be in `YYYY-MM-DD` format
- Employee IDs are case-insensitive (normalized to uppercase)
- Email addresses are case-insensitive (normalized to lowercase)
- MongoDB ObjectIds are 24-character hexadecimal strings
- All endpoints return JSON responses
- CORS is enabled for cross-origin requests
