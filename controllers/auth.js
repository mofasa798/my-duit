const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';
const TOKEN_EXPIRY = '24h';

// Helper function for simple validation
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const existingUser = await db.getAsync('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.runAsync(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );

    res.status(201).json({ success: true, message: 'User registered successfully', userId: result.lastID });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    res.json({ success: true, message: 'Logged in successfully', token });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await db.getAsync('SELECT id FROM users WHERE email = ?', [email]);
    if (!user) {
      // Don't leak whether user exists, return success anyway
      return res.json({ success: true, message: 'If an account exists, a reset link was sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); 

    await db.runAsync(
      'UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?',
      [resetToken, expiresAt, user.id]
    );

    // Mock sending email
    console.log(`\n================================`);
    console.log(`MOCK EMAIL SENT TO: ${email}`);
    console.log(`Password Reset Token: ${resetToken}`);
    console.log(`================================\n`);

    res.json({ success: true, message: 'If an account exists, a reset link was sent' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    const user = await db.getAsync(
      'SELECT id, reset_token_expires_at FROM users WHERE reset_token = ?',
      [token]
    );

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Check expiry
    const now = new Date();
    const expiry = new Date(user.reset_token_expires_at);
    if (now > expiry) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.runAsync(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};
