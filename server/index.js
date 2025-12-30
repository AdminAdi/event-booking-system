import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { dbConnect } from '../src/utils/database.js';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in project root
dotenv.config({ path: join(__dirname, '../.env') });

// Debug: Check if PayPal env vars are loaded
console.log('[DEBUG] Environment check after dotenv.config():');
console.log('[DEBUG] PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID ? `${process.env.PAYPAL_CLIENT_ID.substring(0, 10)}...` : 'NOT SET');
console.log('[DEBUG] PAYPAL_CLIENT_SECRET:', process.env.PAYPAL_CLIENT_SECRET ? `${process.env.PAYPAL_CLIENT_SECRET.substring(0, 10)}...` : 'NOT SET');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
// (__filename and __dirname already defined above)
app.use('/uploads', express.static(join(__dirname, '../public/uploads')));
app.use('/images', express.static(join(__dirname, '../public/images')));

// Import routes
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import bookingRoutes from './routes/bookings.js';
import userRoutes from './routes/user.js';
import checkoutRoutes from './routes/checkout.js';
import webhookRoutes from './routes/webhook.js';
import ratingRoutes from './routes/rating.js';
import healthRoutes from './routes/health.js';

// Connect to database
dbConnect().then((connected) => {
    if (!connected) {
        console.error('[ERROR] Failed to connect to database. Server will continue but database operations will fail.');
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/rating', ratingRoutes);
app.use('/api/health', healthRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

