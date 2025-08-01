import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import attendanceRoutes from './routes/attendanceRoute.js';
import payrollRoutes from './routes/payrollRoutes.js'
import dashboardRoutes from './routes/dashboardRoute.js';
import employeesRoutes from './routes/employeesRoute.js';
import employeeDashRoute from './routes/employeeDashRoute.js';
import performanceReviewRoute from './routes/performanceReviewRoute.js';
import leaveRequestRoute from './routes/leaveRequestRoute.js';


dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use('/api', payrollRoutes);
app.use('/api', performanceReviewRoute);
app.use('/api', dashboardRoutes);
app.use('/api', employeesRoutes);
app.use('/api', employeeDashRoute);
app.use('/api', authRoutes)
app.use('/api', attendanceRoutes);
app.use('/api', leaveRequestRoute);

const port = process.env.PORT || 5004;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});