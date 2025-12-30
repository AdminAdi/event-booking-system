import express from 'express';
import { dbConnect } from '../../src/utils/database.js';
import { BookingModel, EventModel } from '../../src/utils/models.js';

const router = express.Router();

// PayPal webhook handler (for future use if needed)
// Currently, payments are captured directly in the checkout route
router.post('/', express.json(), async (req, res) => {
    try {
        // PayPal webhook events can be handled here if needed
        // For now, payments are handled via the /api/checkout/capture endpoint
        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ error: 'Webhook processing failed' });
    }
});

export default router;
