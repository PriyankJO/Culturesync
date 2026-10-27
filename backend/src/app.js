const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/competitions', require('./routes/competitionRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/judges', require('./routes/judgeRoutes'));
app.use('/api/scores', require('./routes/scoreRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
// app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
