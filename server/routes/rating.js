import express from 'express';
import { dbConnect } from '../../src/utils/database.js';
import { ReviewModel } from '../../src/utils/models.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        await dbConnect();
        const reviews = await ReviewModel.find({ event: req.params.id })
            .populate('user', 'username profilePicture');
        
        res.json({ reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get reviews' });
    }
});

router.post('/:id', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const jwt = (await import('jsonwebtoken')).default;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key');
        
        const { rating, reviewText } = req.body;
        
        await dbConnect();
        const review = new ReviewModel({
            user: decoded.id,
            event: req.params.id,
            rating,
            reviewText
        });

        await review.save();
        res.json({ success: true, review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create review' });
    }
});

export default router;

