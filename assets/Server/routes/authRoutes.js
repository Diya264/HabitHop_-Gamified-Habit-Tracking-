const express = require("express");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authenticateToken = require("../middleware/authMiddleware");
const db = require("../config/db");

const router = express.Router();

// ✅ User Signup Route
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    console.log("📩 Received request body:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;

    try {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      await User.create(name, email, password);
      res.status(201).json({ message: "✅ User registered successfully!" });
    } catch (err) {
      console.error("❌ Registration Error:", err);
      res.status(500).json({ message: "❌ Server error", error: err.message });
    }
  }
);

// ✅ User Login Route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    console.log("🔑 Login attempt:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "❌ Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "❌ Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      console.error("❌ Login Error:", err);
      res.status(500).json({ message: "❌ Server error", error: err.message });
    }
  }
);

// ✅ GET user details using token
router.get("/user", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    console.log("Fetching user data for userId:", userId);
    
    // First, let's check if the name field exists and has data
    const [checkResults] = await db.execute("SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'name'");
    console.log("Name column check:", checkResults[0]);
    
    // Use a more explicit query to ensure we get all fields
    const [results] = await db.execute("SELECT id, email, name, created_at FROM users WHERE id = ?", [userId]);
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log("User data retrieved:", results[0]);
    
    // If name is null or empty, try to update it with the first part of the email
    if (!results[0].name) {
      console.log("Name is empty, using email username as name");
      const emailUsername = results[0].email.split('@')[0];
      const [updateResult] = await db.execute("UPDATE users SET name = ? WHERE id = ?", [emailUsername, userId]);
      console.log("Update result:", updateResult);
      
      // Fetch the updated user data
      const [updatedResults] = await db.execute("SELECT id, email, name, created_at FROM users WHERE id = ?", [userId]);
      console.log("Updated user data:", updatedResults[0]);
      res.json(updatedResults[0]);
    } else {
      res.json(results[0]); // Send user data to frontend
    }
  } catch (err) {
    console.error("Error retrieving user:", err);
    res.status(500).json({ message: "Error retrieving user", error: err.message });
  }
});

module.exports = router;
