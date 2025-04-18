const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");  
const subscriberRoutes = require("./routes/subscriberRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productAdminRoutes = require("./routes/productAdminRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
// Import recommendation routes
const recommendationRoutes = require('./routes/recommendationRoutes');
const app = express();

app.use(express.json());

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));

// Cookie parser middleware
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

dotenv.config();

const PORT = process.env.PORT || 3000;

// Database connection 
connectDB();

app.get("/", (req, res) => {
    res.send("Welcome!");
});

// API Routes

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/reminders", reminderRoutes);
// Register recommendation routes
app.use("/api/recommendations", recommendationRoutes);

// Admin routes 
app.use("/api/admin", adminRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.listen(PORT, () => {
    console.log(`Serve is running on http://localhost:${PORT}`);
    
});

