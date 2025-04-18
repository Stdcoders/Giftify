const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const Product = require("./models/Product");
const User = require("./models/user");
const Cart = require("./models/Cart");
const products = require("./data/products"); // ✅ This should work!

dotenv.config();

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected...");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear previous data
    await Product.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();

    // Hash password before storing
    const hashedPassword = await bcrypt.hash("nidhi@2005", 10);

    // Create default admin user
    const createdUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "Admin",
    });

    const userID = createdUser._id;

    // Corrected map function
    const sampleProducts = products.map((product) => ({
      ...product,
      user: userID,
    }));


    // Insert products into the database
    await Product.insertMany(sampleProducts);

    console.log("Product Data seeded successfully!");
  } catch (error) {
    console.error("Error seeding the data:", error);
  } finally {
    // Properly close the DB connection
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit();
  }
};

seedData();
