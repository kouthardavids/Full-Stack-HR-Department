import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import attendanceRoutes from './routes/attendanceRoute.js';
import payrollRoutes from './routes/payrollRoutes.js'
import dashboardRoutes from './routes/dashboardRoute.js';
import employeesRoutes from './routes/employeesRoute.js';
import leaveRequestRoute from './routes/leaveRequestRoute.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:5175',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use('/api', payrollRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', employeesRoutes);
app.use('/api', authRoutes)
app.use('/api', attendanceRoutes);
app.use('/api', leaveRequestRoute);

const port = process.env.PORT || 5004;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});