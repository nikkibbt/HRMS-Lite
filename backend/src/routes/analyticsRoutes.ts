import express, { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import Employee from '../models/Employee';

const router = express.Router();

/**
 * @swagger
 * /analytics/summary:
 *   get:
 *     summary: Get dashboard analytics summary
 *     description: Get comprehensive analytics and statistics for the dashboard including charts data
 *     tags: [Analytics]
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
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalEmployees:
 *                           type: number
 *                         totalAttendanceRecords:
 *                           type: number
 *                         presentCount:
 *                           type: number
 *                         absentCount:
 *                           type: number
 *                         attendanceRate:
 *                           type: string
 *                     employeesByDepartment:
 *                       type: array
 *                     attendanceByDepartment:
 *                       type: array
 *                     dailyAttendance:
 *                       type: array
 *                     topEmployeesByAttendance:
 *                       type: array
 *                     monthlyAttendance:
 *                       type: array
 *       500:
 *         description: Server error
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalAttendanceRecords = await Attendance.countDocuments();
    
    // Present vs Absent counts
    const presentCount = await Attendance.countDocuments({ status: 'Present' });
    const absentCount = await Attendance.countDocuments({ status: 'Absent' });

    // Employees by department
    const employeesByDepartment = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Attendance by department
    const attendanceByDepartment = await Attendance.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: 'employeeId',
          as: 'employee',
        },
      },
      {
        $unwind: {
          path: '$employee',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: '$employee.department',
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    // Daily attendance trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyAttendance = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Top employees by attendance (most present days)
    const topEmployeesByAttendance = await Attendance.aggregate([
      {
        $group: {
          _id: '$employeeId',
          presentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] },
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] },
          },
          totalDays: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'employeeId',
          as: 'employee',
        },
      },
      {
        $unwind: {
          path: '$employee',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          employeeId: '$_id',
          fullName: '$employee.fullName',
          department: '$employee.department',
          presentDays: 1,
          absentDays: 1,
          totalDays: 1,
          attendanceRate: {
            $multiply: [
              { $divide: ['$presentDays', '$totalDays'] },
              100,
            ],
          },
        },
      },
      {
        $sort: { presentDays: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Monthly attendance overview
    const monthlyAttendance = await Attendance.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$date' },
          },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalEmployees,
          totalAttendanceRecords,
          presentCount,
          absentCount,
          attendanceRate: totalAttendanceRecords > 0
            ? ((presentCount / totalAttendanceRecords) * 100).toFixed(2)
            : '0.00',
        },
        employeesByDepartment,
        attendanceByDepartment,
        dailyAttendance,
        topEmployeesByAttendance,
        monthlyAttendance,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
});

export default router;
