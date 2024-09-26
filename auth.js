//! routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const router = express.Router();

//* Utility function for error responses
const handleError = (res, statusCode, message) => {
  return res.status(statusCode).json({ error: message });
};

//! Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return handleError(res, 400, "User already exists");
    }

    user = new User({ name, email, password });
   
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    handleError(res, 500, "Server error");
  }
});

//! Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return handleError(res, 400, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return handleError(res, 400, "Invalid credentials");
    }

    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ msg: "Login successful", token });
      }
    );
  } catch (err) {
    console.error(err.message);
    handleError(res, 500, "Server error");
  }
});

//! Forgot Password
router.post("/forgotpassword", async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return handleError(res, 400, "User not found");
    }

    const token = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    res.status(200).json({ msg: "Reset token sent", token });
  } catch (err) {
    console.error(err.message);
    handleError(res, 500, "Server error");
  }
});

//! Reset Password
router.post("/reset/:token", async (req, res) => {  
  try {
    let user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return handleError(res, 400, "Password reset token is invalid or has expired");
    }
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).json({ msg: "Password reset successful" });
  } catch (err) {
    console.error(err.message);
    handleError(res, 500, "Server error");
  }
});

module.exports = router;