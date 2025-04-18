const mongoose = require("mongoose");

const connectWithRetry = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`MongoDB connection attempt ${i + 1} of ${retries}`);
            const conn = await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                family: 4
            });
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            return;
        } catch (error) {
            console.error(`MongoDB connection attempt ${i + 1} failed:`, error);
            if (i < retries - 1) {
                console.log(`Retrying in ${delay/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error('All connection attempts failed');
                process.exit(1);
            }
        }
    }
};

const connectDB = async () => {
    try {
        await connectWithRetry();
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Handle connection errors after initial connection
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
    connectWithRetry();
});

module.exports = connectDB;