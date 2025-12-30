import mongoose from 'mongoose';
const { connect } = mongoose;

export async function dbConnect() {
    try {
        const mongoUri = process.env.MONGO_URI || '';
        
        if (!mongoUri) {
            console.error('[ERROR] MONGO_URI is not set in environment variables!');
            return false;
        }

        console.log('[INFO] Attempting to connect to MongoDB...');
        
        await connect(mongoUri);
        
        // Check connection status
        if (mongoose.connection.readyState === 1) {
            console.log('[SUCCESS] ✅ MongoDB connected successfully!');
            console.log(`[INFO] Database: ${mongoose.connection.name}`);
            console.log(`[INFO] Host: ${mongoose.connection.host}`);
            console.log(`[INFO] Port: ${mongoose.connection.port}`);
            return true;
        } else {
            console.error('[ERROR] MongoDB connection failed - readyState:', mongoose.connection.readyState);
            return false;
        }
    } catch (error) {
        console.error('[ERROR] Database connection error:', error.message);
        return false;
    }
}

// Connection event listeners
mongoose.connection.on('connected', () => {
    console.log('[INFO] Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('[ERROR] Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('[WARNING] Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('[INFO] MongoDB connection closed due to app termination');
    process.exit(0);
});

