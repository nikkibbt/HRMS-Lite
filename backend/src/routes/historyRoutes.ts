import express, { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import Employee from '../models/Employee';

const router = express.Router();

/**
 * @swagger
 * /history:
 *   get:
 *     summary: Get attendance history grouped by month
 *     description: Get all attendance records grouped by month, sorted by date (newest first)
 *     tags: [History]
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
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           monthKey:
 *                             type: string
 *                           monthLabel:
 *                             type: string
 *                           records:
 *                             type: array
 *                     totalRecords:
 *                       type: number
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const attendanceRecords = await Attendance.find()
      .sort({ date: -1, createdAt: -1 });

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

    // Group records by month
    const groupedByMonth: { [key: string]: any } = {};
    
    enrichedRecords.forEach((record) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = {
          monthKey,
          monthLabel,
          records: [],
        };
      }
      groupedByMonth[monthKey].records.push(record);
    });

    // Convert to array and sort by month (newest first)
    const historyData = Object.values(groupedByMonth).sort((a: any, b: any) => {
      return b.monthKey.localeCompare(a.monthKey);
    });

    res.status(200).json({
      success: true,
      data: {
        data: historyData,
        totalRecords: enrichedRecords.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance history',
      error: error.message,
    });
  }
});

/**
 * Get attendance history for a specific month
 * Route: GET /api/history/:year/:month
 * Parameters:
 *   - year: 4-digit year (e.g., 2026)
 *   - month: Month number (1-12)
 * Returns: Attendance records for the specified month
 */
router.get('/:year/:month', async (req: Request, res: Response) => {
  try {
    const { year, month } = req.params;
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    // Validate inputs
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year. Year must be between 2000 and 2100',
      });
    }

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month. Month must be between 1 and 12',
      });
    }

    // Create date range for the month
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

    const attendanceRecords = await Attendance.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ date: -1, createdAt: -1 });

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

    const monthLabel = startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    res.status(200).json({
      success: true,
      data: {
        monthKey: `${yearNum}-${String(monthNum).padStart(2, '0')}`,
        monthLabel,
        records: enrichedRecords,
        totalRecords: enrichedRecords.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching monthly attendance history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly attendance history',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /history/employee/{employeeId}:
 *   get:
 *     summary: Get employee attendance history
 *     description: Get all attendance records for a specific employee, grouped by month
 *     tags: [History]
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *         example: EMP001
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Employee not found
 */
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
      .sort({ date: -1, createdAt: -1 });

    // Group records by month
    const groupedByMonth: { [key: string]: any } = {};
    
    attendanceRecords.forEach((record) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = {
          monthKey,
          monthLabel,
          records: [],
        };
      }
      groupedByMonth[monthKey].records.push({
        ...record.toObject(),
        employee: {
          employeeId: employee.employeeId,
          fullName: employee.fullName,
          email: employee.email,
          department: employee.department,
        },
      });
    });

    // Convert to array and sort by month (newest first)
    const historyData = Object.values(groupedByMonth).sort((a: any, b: any) => {
      return b.monthKey.localeCompare(a.monthKey);
    });

    res.status(200).json({
      success: true,
      data: {
        employee: {
          employeeId: employee.employeeId,
          fullName: employee.fullName,
          email: employee.email,
          department: employee.department,
        },
        data: historyData,
        totalRecords: attendanceRecords.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching employee attendance history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee attendance history',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /history/range:
 *   get:
 *     summary: Get attendance history by date range
 *     description: Get attendance records within a specified date range
 *     tags: [History]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *         example: 2026-01-01
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: 2026-01-31
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid date format or range
 */
router.get('/range', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Both startDate and endDate query parameters are required (format: YYYY-MM-DD)',
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD format',
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before or equal to end date',
      });
    }

    const attendanceRecords = await Attendance.find({
      date: {
        $gte: start,
        $lte: end,
      },
    })
      .sort({ date: -1, createdAt: -1 });

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
      data: {
        startDate: startDate,
        endDate: endDate,
        records: enrichedRecords,
        totalRecords: enrichedRecords.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching attendance history by range:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance history by date range',
      error: error.message,
    });
  }
});

export default router;
