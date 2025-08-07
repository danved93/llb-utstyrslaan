import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './utils/dotenv';

// Last inn environment variabler
config();

// Import test routes (uten database)
import authTestRoutes from './routes/auth-test';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';

const app = express();
const PORT = process.env.PORT || 5001;

console.log('🧪 STARTER I TEST MODUS (uten database)');
console.log('📋 Tilgjengelige test brukere:');
console.log('  👤 Admin: trygve@admin.no / Passord123');
console.log('  👤 Bruker: test@example.com / TestPass123');

// Middleware
app.use(logger);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Statiske filer for uploads
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// TEST API routes (uten database)
app.use('/api/auth', authTestRoutes);

// Mock endpoints for brukere og lån
app.use('/api/users', (req, res) => {
  if (req.path === '/stats') {
    // Mock statistikk for admin dashboard
    return res.json({
      success: true,
      data: {
        loans: {
          total: 5,
          active: 2,
          returned: 2,
          overdue: 1
        },
        users: {
          total: 3,
          pending: 1,
          approved: 2
        }
      },
      message: 'Test statistikk'
    });
  }
  
  res.json({
    success: true,
    data: [],
    message: 'Test modus - ingen database tilkoblet'
  });
});

// Spesifikk stats endpoint
app.get('/api/loans/stats', (req, res) => {
  console.log('📊 Stats endpoint kalt');
  res.json({
    success: true,
    data: {
      loans: {
        total: 5,
        active: 2,
        returned: 2,
        overdue: 1
      },
      users: {
        total: 3,
        pending: 1,
        approved: 2
      }
    },
    message: 'Test statistikk'
  });
});

app.use('/api/loans', (req, res) => {
  
  // Mock lån liste
  const mockLoans = [
    {
      id: 'loan1',
      itemName: 'Test Utstyr 1',
      description: 'Test beskrivelse',
      status: 'ACTIVE',
      loanedAt: new Date().toISOString(),
      user: { id: 'test-admin-id', name: 'Trygve Admin', email: 'trygve@admin.no' }
    },
    {
      id: 'loan2', 
      itemName: 'Test Utstyr 2',
      description: 'Annen test beskrivelse',
      status: 'RETURNED',
      loanedAt: new Date(Date.now() - 86400000).toISOString(),
      returnedAt: new Date().toISOString(),
      user: { id: 'test-user-id', name: 'Test Bruker', email: 'test@example.com' }
    }
  ];
  
  res.json({
    success: true,
    data: {
      loans: mockLoans,
      total: mockLoans.length,
      page: 1,
      totalPages: 1
    },
    message: 'Test lån data'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK - TEST MODE', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'DISABLED (test mode)',
    testUsers: [
      'trygve@admin.no (ADMIN)',
      'test@example.com (BORROWER)'
    ]
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
  console.log(`🚀 TEST SERVER kjører på port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API tilgjengelig på: http://localhost:${PORT}/api`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('🧪 TEST INNLOGGINGSDETALJER:');
  console.log('  Email: trygve@admin.no');
  console.log('  Passord: Passord123');
  console.log('  Rolle: ADMIN');
  console.log('');
  console.log('  Email: test@example.com');  
  console.log('  Passord: TestPass123');
  console.log('  Rolle: BORROWER');
});

export default app;