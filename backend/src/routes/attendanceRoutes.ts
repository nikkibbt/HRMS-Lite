import express, { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import Employee from '../models/Employee';

const router = express.Router();

/**
 * @swagger
 * /attendance:
 *   post:
 *     summary: Mark attendance
 *     description: Mark attendance for an employee (Present/Absent). Cannot mark twice for the same date.
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - date
 *               - status
 *             properties:
 *               employeeId:
 *                 type: string
 *                 example: EMP001
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2026-02-02
 *                 description: Attendance date (YYYY-MM-DD format)
 *               status:
 *                 type: string
 *                 enum: [Present, Absent]
 *                 example: Present
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Employee not found
 *       409:
 *         description: Attendance already exists for this date
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { employeeId, date, status } = req.body;

    // Validation
    if (!employeeId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: employeeId, date, status',
      });
    }

    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Present" or "Absent"',
      });
    }

    // Check if employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Parse date and set to start of day to avoid timezone issues
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: attendanceDate,
    });

    if (existingAttendance) {
      // Prevent duplicate attendance - return error instead of updating
      return res.status(409).json({
        success: false,
        message: `Attendance for this employee has already been marked for ${new Date(attendanceDate).toLocaleDateString()}. Cannot mark attendance twice for the same day.`,
      });
    }

    // Create new attendance record
    const attendance = new Attendance({
      employeeId,
      date: attendanceDate,
      status,
    });

    await attendance.save();

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Attendance already exists for this date',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: error.message,
    });
  }
});

// Get attendance records for an employee
router.get('/employee/:employeeId', async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    // Check if employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const attendanceRecords = await Attendance.find({ employeeId })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: attendanceRecords,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: Get all attendance records
 *     description: Retrieve all attendance records with employee information
 *     tags: [Attendance]
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/Attendance'
 *                       - type: object
 *                         properties:
 *                           employee:
 *                             type: object
 *                             nullable: true
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const attendanceRecords = await Attendance.find()
      .sort({ date: -1 });

    // Enrich with employee data
    const enrichedRecords = await Promise.all(
      attendanceRecords.map(async (record) => {
        const employee = await Employee.findOne({ employeeId: record.employeeId });
        return {
          ...record.toObject(),
          employee: employee
            ? {
                employeeId: employee.employeeId,
                fullName: employee.fullName,
                email: employee.email,
                department: employee.department,
              }
            : null,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enrichedRecords,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records',
      error: error.message,
    });
  }
});

export default router;
