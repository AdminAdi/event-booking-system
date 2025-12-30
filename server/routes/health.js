import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    
    const status = {
        server: 'running',
        database: dbStatus === 1 ? 'connected' : 'disconnected',
        databaseState: dbStatus,
        timestamp: new Date().toISOString()
    };

    if (dbStatus === 1) {
        status.databaseInfo = {
            name: mongoose.connection.name,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
        };
    }

    res.json(status);
});

export default router;

