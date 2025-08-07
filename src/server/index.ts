import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './utils/dotenv';

// Last inn environment variabler
config();

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import loanRoutes from './routes/loans';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';

const app = express();
const PORT = process.env.PORT || 5000;
const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads');

// Middleware
app.use(logger);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Statiske filer for uploads (bruk samme mappe som upload.ts skriver til)
app.use('/uploads', express.static(UPLOAD_DIR));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/loans', loanRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve frontend i produksjon
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
  });
}

// Error handling middleware (må være sist)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server kjører på port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔗 API tilgjengelig på: http://localhost:${PORT}/api`);
  }
});

export default app;