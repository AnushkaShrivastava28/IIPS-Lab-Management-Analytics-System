import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errors.js';
const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));
app.use(express.json());
app.get('/api/health', (req, res) => res.json({
  success: true,
  message: 'IIPS LabTrack API is running'
}));
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);
const port = process.env.PORT || 5000;
connectDB().then(() => app.listen(port, () => console.log(`API listening on ${port}`))).catch(err => {
  console.error('Database connection failed:', err.message);
  process.exit(1);
});
