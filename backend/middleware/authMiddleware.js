const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;
    
    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Extract token
            token = req.headers.authorization.split(" ")[1];
            
            if (!token) {
                console.log("Token is empty or undefined");
                return res.status(401).json({ message: "Not authorized, token is empty" });
            }
            
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from database - fixed to use correct payload structure
            req.user = await User.findById(decoded.user.id).select("-password");
            
            if (!req.user) {
                console.log(`User not found for ID: ${decoded.user.id}`);
                return res.status(401).json({ message: "User not found" });
            }
            
            // User found, proceed
            next();
        } catch (error) {
            console.error("Auth middleware error:", error.name, error.message);
            
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Session expired. Please log in again." });
            } else if (error.name === "JsonWebTokenError") {
                return res.status(401).json({ message: "Invalid token. Please log in again." });
            }
            
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        console.log("No Authorization header found");
        return res.status(401).json({ message: "Not authorized, no token" });
    }
}

// 🔐 Middleware to check admin role
const admin = (req, res, next) => {
    if (req.user && req.user.role === "Admin") {
        next();
    } else {
        console.log(`Admin check failed for user: ${req.user ? req.user._id : 'undefined'}, role: ${req.user ? req.user.role : 'undefined'}`);
        return res.status(403).json({ message: "Not authorized as Admin" });
    }
};

module.exports = { protect, admin };
