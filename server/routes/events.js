import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { dbConnect } from '../../src/utils/database.js';
import { EventModel } from '../../src/utils/models.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Helper functions for geocoding
const getGeocodedAddress = async (lat, lng) => {
    const apiKey = process.env.GOOGLE_MAPS_API || process.env.VITE_GOOGLE_MAPS_API;
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
        const response = await axios.get(geocodingUrl);
        if (response.data.results.length > 0) {
            return response.data.results[0].formatted_address;
        } else {
            throw new Error("No address found for the given coordinates.");
        }
    } catch (error) {
        console.error("Error fetching address from Google Maps API:", error);
        throw new Error("Failed to get address");
    }
};

const getGeocodedCity = async (lat, lng) => {
    const apiKey = process.env.GOOGLE_MAPS_API || process.env.VITE_GOOGLE_MAPS_API;
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
        const response = await axios.get(geocodingUrl);
        if (response.data.results.length > 0) {
            const addressComponents = response.data.results[0].address_components;

            const cityComponent = addressComponents.find((component) =>
                component.types.includes("locality")
            );

            if (cityComponent) {
                return cityComponent.long_name;
            } else {
                try {
                    return addressComponents[2].long_name;
                } catch (error) {
                    console.error(error);
                    throw new Error("City not found in address components.");
                }
            }
        } else {
            throw new Error("No address found for the given coordinates.");
        }
    } catch (error) {
        console.error("Error fetching city from Google Maps API:", error);
        throw new Error("Failed to get city");
    }
};

// Get all events with filters
router.get('/', async (req, res) => {
    try {
        const { category, location, name, dateFrom, dateTo, page = 1, limit = 9 } = req.query;

        await dbConnect();
        const query = {};

        if (category && category !== "all") {
            query.category = { $regex: category, $options: "i" };
        }
        if (location) {
            query.location = { $regex: location, $options: "i" };
        }
        if (name) {
            query.title = { $regex: name, $options: "i" };
        }
        if (dateFrom || dateTo) {
            query.date = {};

            if (dateFrom) {
                query.date.$gte = new Date(dateFrom);
            }

            if (dateTo) {
                query.date.$lt = new Date(dateTo);
            }

            if (Object.keys(query.date).length === 0) {
                delete query.date;
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const events = await EventModel.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('organizer', 'username')
            .sort({ createdAt: -1 });

        const totalEvents = await EventModel.countDocuments(query);

        res.json({
            events,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalEvents / parseInt(limit)),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve events' });
    }
});

// Get single event
router.get('/:id', async (req, res) => {
    try {
        await dbConnect();
        const event = await EventModel.findById(req.params.id)
            .populate('organizer', 'username email profilePicture')
            .populate('reviews');
        
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve event' });
    }
});

// Create event
router.post('/create', upload.single('file'), async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const jwt = (await import('jsonwebtoken')).default;
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key');
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { title, description, category, date, availableSeats, price, time, location: locationStr } = req.body;

        console.log('Received form data:', { title, description, category, date, availableSeats, price, time, locationStr });

        if (!title || !description || !category || !date || !availableSeats) {
            return res.status(400).json({ error: 'Missing required fields', received: { title: !!title, description: !!description, category: !!category, date: !!date, availableSeats: !!availableSeats } });
        }

        await dbConnect();

        let address = '';
        let city = '';
        let location = null;

        // Parse location if provided
        if (locationStr) {
            try {
                location = JSON.parse(locationStr);
                if (location.lat && location.lng) {
                    try {
                        address = await getGeocodedAddress(location.lat, location.lng);
                        city = await getGeocodedCity(location.lat, location.lng);
                    } catch (error) {
                        console.error("Geocoding error:", error);
                        address = 'Address not available';
                        city = 'City not available';
                    }
                }
            } catch (error) {
                console.error("Error parsing location:", error);
            }
        }

        // Handle image upload
        let imageUrl = '/images/mockhead.jpg'; // Default image
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
            console.log('[INFO] Image uploaded:', {
                filename: req.file.filename,
                path: req.file.path,
                imageUrl: imageUrl
            });
        } else {
            console.log('[INFO] No image file uploaded, using default');
        }

        // Combine date and time - date should be in YYYY-MM-DD format
        let eventDate;
        try {
            if (time) {
                // Combine date (YYYY-MM-DD) with time (HH:MM)
                eventDate = new Date(`${date}T${time}:00`);
            } else {
                eventDate = new Date(date);
            }
            
            // Validate the date
            if (isNaN(eventDate.getTime())) {
                throw new Error('Invalid date');
            }
        } catch (error) {
            console.error('Date parsing error:', error);
            return res.status(400).json({ error: 'Invalid date format', date, time });
        }

        const event = new EventModel({
            title,
            description,
            category,
            address: address || 'Address not specified',
            city: city || 'City not specified',
            date: eventDate,
            availableSeats: parseInt(availableSeats),
            price: parseFloat(price) || 0,
            imageUrl: imageUrl,
            organizer: decoded.id
        });

        await event.save();
        res.json({ success: true, event });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

export default router;
