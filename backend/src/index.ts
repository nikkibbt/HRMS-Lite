import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { connectDatabase } from './config/database';
import employeeRoutes from './routes/employeeRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import historyRoutes from './routes/historyRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all incoming requests
app.use((req: Request, res: Response, next: any) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  next();
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/history', historyRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check if the API is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: HRMS Lite API is running
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'HRMS Lite API is running',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  console.log(`   Path: ${req.path}`);
  console.log(`   Base URL: ${req.baseUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedPath: req.originalUrl,
    method: req.method,
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// create setInterval to check if the server is running
setInterval(() => {
  console.log('Server is running');
  fetch('https://hrms-lite-9yp1.onrender.com/api/health').then(async(data: any) =>   {
    console.log('Server is running',await data.json());
  }).catch((error: any) => {
    console.error('Server is not running', error);
  });
}, 40000);
