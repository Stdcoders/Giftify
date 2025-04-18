const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const user = require("../models/user");
const {protect} = require("../middleware/authMiddleware")
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

// @route POST /api/users/register

// @desc Register a new user

// @access public

router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Logic for registration 
        let user = await User.findOne({ email });

        if (user) return res.status(400).json({ message: "User already exists!" });
        
        user = new User({ name, email, password });
        await user.save();

        // JSON Web Token
        const payload = { user: { id: user._id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10h" });

        // Send the user and token in response
        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Server error");
    }
});

// @route POST /api/users/login
// @desc Authenticate User
// @access Public

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
      // User by email - explicitly select password field
      let user = await User.findOne({ email }).select('+password');

      if (!user)
        return res.status(400).json({ message: "Invalid Credentials!" });

      const isMatch = await user.matchPassword(password);

      if (!isMatch)
        return res.status(400).json({ message: "Invalid Password!" });

      // JSON Web Token
      const payload = { user: { id: user._id, role: user.role } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10h" });

      // Send the user and token in response
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// @route GET /api/users/profile
// @desc Protected Route 
// @access Private

router.get("/profile", protect ,async (req, res) => {
    res.json(req.user);
});

// Forgot password route
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save user with reset token
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    const message = `
      <h2>Password Reset Request</h2>
      <p>You have requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Error sending reset email" });
  }
});

// Reset password route
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const resetToken = req.params.token;

    // Hash the token to match the stored hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired reset token" 
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
});

module.exports = router;