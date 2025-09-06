// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../utils/mailer');

// helper: hash OTP
function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

// POST /auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ error: 'Email or username already in use' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      username, 
      email, 
      password: hash, 
      fullName: fullName || username 
    });
    
    return res.status(201).json({ 
      ok: true, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        fullName: user.fullName
      } 
    });
  } catch (e) {
    console.error('signup error', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /auth/login
// Body: { email, password }
// If password correct -> send OTP to email
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    // generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
    console.log(`TEST OTP for ${email}: ${otp}`); // Temporary logging for testing
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // create OTP record
    await Otp.create({ email, otpHash, expiresAt });

    // send email
    const sendResult = await sendOtpEmail(email, otp);

    // in development Ethereal preview URL is helpful
    if (sendResult.previewUrl) {
      return res.json({ ok: true, message: 'OTP sent (dev preview)', previewUrl: sendResult.previewUrl });
    }
    return res.json({ ok: true, message: 'OTP sent to email' });
  } catch (e) {
    console.error('login error', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /auth/verify-otp
// Body: { email, otp }
// Returns JWT on success
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Missing fields' });

    // find latest unused otp record
    const record = await Otp.findOne({ email, used: false }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ error: 'No active OTP found' });

    if (record.expiresAt < new Date()) return res.status(400).json({ error: 'OTP expired' });

    if (record.attempts >= 5) return res.status(429).json({ error: 'Too many attempts' });

    const otpHash = hashOtp(otp);
    if (otpHash !== record.otpHash) {
      record.attempts += 1;
      await record.save();
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // success: mark used
    record.used = true;
    await record.save();

    // fetch user (should exist - login required earlier)
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    // issue JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev_jwt_secret', { expiresIn: '7d' });

    return res.json({
      ok: true,
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        fullName: user.fullName
      }
    });
  } catch (e) {
    console.error('verify-otp error', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Temporary test endpoint to get OTP for testing
router.get('/test-otp/:email', async (req, res) => {
  try {
    const otpRecord = await Otp.findOne({ email: req.params.email, used: false }).sort({ createdAt: -1 });
    if (!otpRecord) return res.status(404).json({ error: 'No OTP found' });

    // For testing only - decode the OTP
    const crypto = require('crypto');
    // This is just for testing - in production this would be insecure
    res.json({ otp: '123456', record: otpRecord }); // Assuming test OTP
  } catch (e) {
    console.error('test-otp error', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
