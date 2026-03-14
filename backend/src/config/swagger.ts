import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'HRMS Lite API',
    version: '1.0.0',
    description: 'API documentation for HRMS Lite - Human Resource Management System',
    contact: {
      name: 'API Support',
      email: 'support@hrmslite.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Development server',
    },
    {
      url: 'https://hrms-lite-9yp1.onrender.com/api',
      description: 'Production server (Live)',
    },
  ],
  tags: [
    {
      name: 'Employees',
      description: 'Employee management endpoints',
    },
    {
      name: 'Attendance',
      description: 'Attendance management endpoints',
    },
    {
      name: 'History',
      description: 'Attendance history endpoints',
    },
    {
      name: 'Analytics',
      description: 'Analytics and dashboard endpoints',
    },
    {
      name: 'Health',
      description: 'Health check endpoint',
    },
  ],
  components: {
    schemas: {
      Employee: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'MongoDB ObjectId',
            example: '507f1f77bcf86cd799439011',
          },
          employeeId: {
            type: 'string',
            description: 'Unique Employee ID',
            example: 'EMP001',
          },
          fullName: {
            type: 'string',
            description: 'Full name of the employee',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email address (unique)',
            example: 'john.doe@company.com',
          },
          department: {
            type: 'string',
            description: 'Department name',
            example: 'Engineering',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
        required: ['employeeId', 'fullName', 'email', 'department'],
      },
      Attendance: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'MongoDB ObjectId',
          },
          employeeId: {
            type: 'string',
            description: 'Employee ID',
            example: 'EMP001',
          },
          date: {
            type: 'string',
            format: 'date',
            description: 'Attendance date (YYYY-MM-DD)',
            example: '2026-02-02',
          },
          status: {
            type: 'string',
            enum: ['Present', 'Absent'],
            description: 'Attendance status',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
        required: ['employeeId', 'date', 'status'],
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the request was successful',
          },
          message: {
            type: 'string',
            description: 'Response message',
          },
          data: {
            type: 'object',
            description: 'Response data',
          },
          error: {
            type: 'string',
            description: 'Error message (if any)',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error message description',
          },
          error: {
            type: 'string',
            example: 'Detailed error message',
          },
          field: {
            type: 'string',
            example: 'employeeId',
            description: 'Field name for validation errors',
          },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/index.ts'], // Path to the API routes with Swagger annotations
};

export const swaggerSpec = swaggerJsdoc(options);
