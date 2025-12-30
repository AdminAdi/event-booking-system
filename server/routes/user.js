import express from 'express';
import { dbConnect } from '../../src/utils/database.js';
import { UserModel, EventModel } from '../../src/utils/models.js';

const router = express.Router();

// Get user balance
router.get('/balance', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const jwt = (await import('jsonwebtoken')).default;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key');
        
        await dbConnect();
        const user = await UserModel.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ balance: user.balance || 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get balance' });
    }
});

// Get user events
router.get('/events', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const jwt = (await import('jsonwebtoken')).default;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key');
        
        await dbConnect();
        const events = await EventModel.find({ organizer: decoded.id });
        
        res.json({ events });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get events' });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        await dbConnect();
        const user = await UserModel.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

export default router;

