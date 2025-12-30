import express from 'express';
import paypal from '@paypal/checkout-server-sdk';

const router = express.Router();

// Initialize PayPal client
const getPayPalClient = () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox'; // 'sandbox' or 'live'
    
    if (!clientId || !clientSecret) {
        return null;
    }
    
    const environmentObj = environment === 'live' 
        ? new paypal.core.LiveEnvironment(clientId, clientSecret)
        : new paypal.core.SandboxEnvironment(clientId, clientSecret);
    
    return new paypal.core.PayPalHttpClient(environmentObj);
};

// Check PayPal configuration (with detailed debugging)
const checkPayPalConfig = () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox';
    
    console.log('[DEBUG] PayPal Config Check:');
    console.log('[DEBUG] - CLIENT_ID:', clientId ? `${clientId.substring(0, 10)}...` : 'NOT SET');
    console.log('[DEBUG] - CLIENT_SECRET:', clientSecret ? `${clientSecret.substring(0, 10)}...` : 'NOT SET');
    console.log('[DEBUG] - ENVIRONMENT:', environment);
    
    if (!clientId || !clientSecret) {
        console.error('[ERROR] ❌ PayPal is not configured!');
        console.error('[ERROR] Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your .env file');
        return null;
    }
    
    const client = getPayPalClient();
    if (client) {
        console.log('[INFO] ✅ PayPal client initialized successfully');
        console.log('[DEBUG] PayPal environment:', environment);
    }
    return client;
};

// Initialize at module load (will be checked again at request time if needed)
const paypalClient = checkPayPalConfig();

router.post('/', async (req, res) => {
    try {
        // Try to get client (re-check in case env wasn't loaded at module load time)
        let client = getPayPalClient();
        if (!client) {
            // Re-check configuration
            console.log('[DEBUG] Re-checking PayPal config at request time...');
            client = checkPayPalConfig();
            if (!client) {
                return res.status(500).json({ 
                    error: 'PayPal is not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your .env file and restart the server.' 
                });
            }
        }

        const { amount, quantity, eventName, userId, eventId } = req.body;

        if (!amount || !quantity || !eventName || !userId || !eventId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const totalAmount = (amount * quantity).toFixed(2);

        // Create PayPal order
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                reference_id: eventId,
                description: `Event Ticket - ${eventName}`,
                amount: {
                    currency_code: 'USD',
                    value: totalAmount
                },
                custom_id: JSON.stringify({
                    userId: userId,
                    eventId: eventId,
                    quantity: quantity.toString()
                })
            }],
            application_context: {
                brand_name: 'Event Booking System',
                landing_page: 'BILLING',
                user_action: 'PAY_NOW',
                return_url: `${req.headers.origin || 'http://localhost:3000'}/success`,
                cancel_url: `${req.headers.origin || 'http://localhost:3000'}/cancel`
            }
        });

        const order = await client.execute(request);
        
        // Find approval URL
        const approvalUrl = order.result.links.find(link => link.rel === 'approve')?.href;

        if (!approvalUrl) {
            return res.status(500).json({ error: 'Failed to create PayPal order' });
        }

        res.json({ 
            id: order.result.id,
            approvalUrl: approvalUrl
        });
    } catch (error) {
        console.error('PayPal order creation error:', error);
        res.status(500).json({ error: 'Failed to create PayPal order', details: error.message });
    }
});

// Capture payment after user approves
router.post('/capture', async (req, res) => {
    try {
        const client = getPayPalClient();
        if (!client) {
            return res.status(500).json({ 
                error: 'PayPal is not configured.' 
            });
        }

        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});

        const capture = await client.execute(request);

        if (capture.result.status === 'COMPLETED') {
            // Extract metadata from custom_id
            const customId = capture.result.purchase_units[0]?.custom_id;
            let metadata = {};
            try {
                metadata = JSON.parse(customId || '{}');
            } catch (e) {
                console.error('Error parsing custom_id:', e);
            }

            // Create booking in database
            const { dbConnect } = await import('../../src/utils/database.js');
            const { BookingModel, EventModel } = await import('../../src/utils/models.js');
            
            await dbConnect();
            
            // Check if booking already exists
            const existingBooking = await BookingModel.findOne({
                event: metadata.eventId,
                user: metadata.userId
            }).sort({ bookingDate: -1 });

            if (!existingBooking || existingBooking.paymentStatus !== 'paid') {
                const totalAmount = parseFloat(capture.result.purchase_units[0]?.payments?.captures?.[0]?.amount?.value || '0');
                
                const booking = new BookingModel({
                    event: metadata.eventId,
                    user: metadata.userId,
                    numberOfSeats: parseInt(metadata.quantity || '1'),
                    totalPrice: totalAmount,
                    paymentStatus: 'paid',
                    status: 'confirmed'
                });

                await booking.save();

                // Update event booked seats
                const event = await EventModel.findById(metadata.eventId);
                if (event) {
                    event.bookedSeats += parseInt(metadata.quantity || '1');
                    await event.save();
                }

                res.json({ 
                    success: true, 
                    orderId: capture.result.id,
                    status: capture.result.status,
                    booking: booking,
                    metadata: metadata
                });
            } else {
                res.json({ 
                    success: true, 
                    orderId: capture.result.id,
                    status: capture.result.status,
                    booking: existingBooking,
                    message: 'Booking already confirmed',
                    metadata: metadata
                });
            }
        } else {
            res.status(400).json({ error: 'Payment not completed', status: capture.result.status });
        }
    } catch (error) {
        console.error('PayPal capture error:', error);
        res.status(500).json({ error: 'Failed to capture payment', details: error.message });
    }
});

export default router;
