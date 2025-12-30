import express from 'express';
import { dbConnect } from '../../src/utils/database.js';
import { BookingModel } from '../../src/utils/models.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        await dbConnect();
        const booking = await BookingModel.findById(req.params.id)
            .populate('event')
            .populate('user', 'username email');
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get booking' });
    }
});

export default router;

