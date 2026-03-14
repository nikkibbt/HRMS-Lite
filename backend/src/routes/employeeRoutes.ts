import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Employee from '../models/Employee';

const router = express.Router();

/**
 * @swagger
 * /employees/check-id/{employeeId}:
 *   get:
 *     summary: Check if Employee ID exists
 *     description: Check if an Employee ID already exists (for real-time validation)
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID to check
 *         example: EMP001
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 exists:
 *                   type: boolean
 *                   example: false
 *                 employeeId:
 *                   type: string
 *                   example: EMP001
 *       500:
 *         description: Server error
 */
router.get('/check-id/:employeeId', async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const normalizedEmployeeId = employeeId.trim().toUpperCase();
    
    const employee = await Employee.findOne({ employeeId: normalizedEmployeeId });
    
    res.status(200).json({
      success: true,
      exists: !!employee,
      employeeId: normalizedEmployeeId,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to check employee ID',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Get all employees
 *     description: Retrieve all employees sorted by creation date (newest first)
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 *       500:
 *         description: Server error
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /employees:
 *   post:
 *     summary: Create a new employee
 *     description: Create a new employee with validation. Employee ID and Email must be unique.
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - fullName
 *               - email
 *               - department
 *             properties:
 *               employeeId:
 *                 type: string
 *                 example: EMP001
 *                 description: Unique Employee ID (alphanumeric, hyphens, underscores)
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@company.com
 *               department:
 *                 type: string
 *                 example: Engineering
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Employee ID or Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { employeeId, fullName, email, department } = req.body;

    // Validation - Check required fields
    if (!employeeId || !fullName || !email || !department) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: employeeId, fullName, email, department',
      });
    }

    // Trim and normalize inputs
    const normalizedEmployeeId = employeeId.trim().toUpperCase(); // Normalize to uppercase
    const normalizedEmail = email.trim().toLowerCase(); // Normalize to lowercase

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format. Please provide a valid email address (e.g., user@example.com)',
      });
    }

    // Check if employee ID already exists
    const existingEmployeeById = await Employee.findOne({ 
      employeeId: normalizedEmployeeId 
    });
    if (existingEmployeeById) {
      return res.status(409).json({
        success: false,
        message: `Employee ID "${normalizedEmployeeId}" already exists. Please use a unique Employee ID.`,
        field: 'employeeId',
      });
    }

    // Check if email already exists
    const existingEmployeeByEmail = await Employee.findOne({ 
      email: normalizedEmail 
    });
    if (existingEmployeeByEmail) {
      return res.status(409).json({
        success: false,
        message: `Email "${normalizedEmail}" is already registered. Please use a different email address.`,
        field: 'email',
      });
    }

    const employee = new Employee({
      employeeId: normalizedEmployeeId,
      fullName: fullName.trim(),
      email: normalizedEmail,
      department: department.trim(),
    });

    await employee.save();

    res.status(201).json({
      success: true,
      message: 'Employee added successfully',
      data: employee,
    });
  } catch (error: any) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      return res.status(409).json({
        success: false,
        message: `The ${field === 'employeeId' ? 'Employee ID' : 'Email'} "${value}" already exists. Please use a unique value.`,
        field: field,
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors,
        error: errors.join(', '),
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to add employee',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     description: Retrieve a single employee by MongoDB ObjectId
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId (24 hex characters)
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Invalid employee ID format
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log(`[GET /api/employees/:id] Request received for ID: ${id}`);

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`[GET /api/employees/:id] Invalid ObjectId format: ${id}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID format',
      });
    }

    const employee = await Employee.findById(id);

    if (!employee) {
      console.log(`[GET /api/employees/:id] Employee not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    console.log(`[GET /api/employees/:id] Employee found: ${employee.fullName}`);
    res.status(200).json({
      success: true,
      message: 'Employee retrieved successfully',
      data: employee,
    });
  } catch (error: any) {
    console.error(`[GET /api/employees/:id] Error:`, error);
    // Handle invalid ObjectId format error
    if (error.name === 'CastError' || error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID format',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     summary: Update an employee
 *     description: Update an existing employee. Employee ID and Email must be unique (excluding current employee).
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - fullName
 *               - email
 *               - department
 *             properties:
 *               employeeId:
 *                 type: string
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Employee not found
 *       409:
 *         description: Employee ID or Email already exists
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { employeeId, fullName, email, department } = req.body;

    // Find the employee first
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Validation - Check required fields
    if (!employeeId || !fullName || !email || !department) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: employeeId, fullName, email, department',
      });
    }

    // Trim and normalize inputs
    const normalizedEmployeeId = employeeId.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format. Please provide a valid email address (e.g., user@example.com)',
      });
    }

    // Check if employee ID already exists (excluding current employee)
    if (normalizedEmployeeId !== employee.employeeId) {
      const existingEmployeeById = await Employee.findOne({
        employeeId: normalizedEmployeeId,
        _id: { $ne: id },
      });
      if (existingEmployeeById) {
        return res.status(409).json({
          success: false,
          message: `Employee ID "${normalizedEmployeeId}" already exists. Please use a unique Employee ID.`,
          field: 'employeeId',
        });
      }
    }

    // Check if email already exists (excluding current employee)
    if (normalizedEmail !== employee.email) {
      const existingEmployeeByEmail = await Employee.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });
      if (existingEmployeeByEmail) {
        return res.status(409).json({
          success: false,
          message: `Email "${normalizedEmail}" is already registered. Please use a different email address.`,
          field: 'email',
        });
      }
    }

    // Update employee
    employee.employeeId = normalizedEmployeeId;
    employee.fullName = fullName.trim();
    employee.email = normalizedEmail;
    employee.department = department.trim();

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error: any) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      return res.status(409).json({
        success: false,
        message: `The ${field === 'employeeId' ? 'Employee ID' : 'Email'} "${value}" already exists. Please use a unique value.`,
        field: field,
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors,
        error: errors.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     summary: Delete an employee
 *     description: Delete an employee by MongoDB ObjectId
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: employee,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message,
    });
  }
});

export default router;
