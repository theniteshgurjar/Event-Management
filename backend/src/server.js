const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clubRoutes = require('./routes/clubRoutes');
const venueRoutes = require('./routes/venueRoutes');
const eventRoutes = require('./routes/eventRoutes');
const reportRoutes = require('./routes/reportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use(cors());
app.use(express.json());

// Health & Root Route
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'DSW Event Management System Backend API is running',
        port: PORT,
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            clubs: '/api/clubs',
            venues: '/api/venues',
            events: '/api/events',
            reports: '/api/reports',
            analytics: '/api/analytics',
            departments: '/api/departments',
            notifications: '/api/notifications'
        }
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
