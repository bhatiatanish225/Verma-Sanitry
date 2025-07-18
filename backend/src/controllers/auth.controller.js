const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/generateToken');
const { getRedisClient } = require('../utils/redis');

const prisma = new PrismaClient();

// Temporary in-memory storage for OTP codes (use Redis in production)
const otpStorage = new Map();

// Helper function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to send email (if configured)
const sendEmail = async (to, subject, htmlContent) => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email credentials not configured, skipping email sending');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `Verma and Company. <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// 🚀 Multi-step Signup - Step 1: Store initial data and send OTP
exports.signupStep1 = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required' });
    }

    // Check if user already exists
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    console.log(`Generated OTP ${otp} for ${email}`);

    // Store data in Redis with 1 hour expiry
    const redis = getRedisClient();
    const signupData = {
      name,
      email,
      phone,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000, // 5 minutes for OTP
      verified: false,
      createdAt: Date.now()
    };

    await redis.setEx(`signup:${email}`, 3600, JSON.stringify(signupData)); // 1 hour expiry

    // Always try to send OTP via email if credentials are configured
    try {
      await sendEmail(
        email,
        'Your Verification Code - Verma and Company.',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066CC;">Email Verification</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #0066CC;">
            ${otp}
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
        `
      );
      res.json({ message: 'OTP sent to your email' });
    } catch (error) {
      // If email sending fails, still return success but log the error
      console.error('Failed to send OTP email:', error);
      res.json({ message: 'OTP generated. Please check your email or contact support if not received.' });
    }
  } catch (error) {
    console.error('Signup Step 1 error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🚀 Multi-step Signup - Step 2: Verify OTP
exports.signupStep2 = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Get data from Redis
    const redis = getRedisClient();
    const dataStr = await redis.get(`signup:${email}`);
    
    if (!dataStr) {
      return res.status(400).json({ message: 'No signup process found. Please start again.' });
    }

    const signupData = JSON.parse(dataStr);

    // Check if OTP is expired
    if (Date.now() > signupData.otpExpiry) {
      await redis.del(`signup:${email}`);
      return res.status(400).json({ message: 'OTP has expired. Please start again.' });
    }

    // Verify OTP
    if (signupData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark as verified
    signupData.verified = true;
    signupData.verifiedAt = Date.now();
    
    // Update in Redis
    await redis.setEx(`signup:${email}`, 3600, JSON.stringify(signupData));

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Signup Step 2 error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🚀 Multi-step Signup - Step 3: Complete registration
exports.signupStep3 = async (req, res) => {
  try {
    const { email, password, city } = req.body;

    if (!email || !password || !city) {
      return res.status(400).json({ message: 'Email, password, and city are required' });
    }

    // Only Tricity cities allowed
    const allowedCities = ['Chandigarh', 'Mohali', 'Panchkula'];
    if (!allowedCities.includes(city)) {
      return res.status(400).json({ message: 'Only Tricity users allowed' });
    }

    // Get data from Redis
    const redis = getRedisClient();
    const dataStr = await redis.get(`signup:${email}`);
    
    if (!dataStr) {
      return res.status(400).json({ message: 'No signup process found. Please start again.' });
    }

    const signupData = JSON.parse(dataStr);

    // Check if OTP was verified
    if (!signupData.verified) {
      return res.status(400).json({ message: 'Please verify your OTP first' });
    }

    // Check if user already exists (final check)
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      await redis.del(`signup:${email}`);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: signupData.name,
        email: signupData.email,
        phone: signupData.phone,
        password: hashedPassword,
        city
      }
    });

    // Generate token
    const token = generateToken(user);

    // Clean up Redis data
    await redis.del(`signup:${email}`);

    console.log('User registered successfully:', user.email);
    res.status(201).json({ 
      message: 'Registration completed successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        role: user.role
      },
      token 
    });
  } catch (error) {
    console.error('Signup Step 3 error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 📧 Send email verification code (existing endpoint for backward compatibility)
exports.sendVerificationCode = async (req, res) => {
  try {
    console.log('Received send-code request:', req.body);
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated verification code ${code} for ${email}`);
    
    // Store OTP in memory with 10 minute expiry
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStorage.set(email, { code, expiresAt });

    // Always try to send OTP via email if credentials are configured
    try {
      await sendEmail(
        email,
        'Your Verification Code - Verma and Company.',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066CC;">Email Verification</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #0066CC;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
        `
      );
      res.json({ message: 'Verification code sent to your email' });
    } catch (error) {
      // If email sending fails, still return success but log the error
      console.error('Failed to send verification email:', error);
      res.json({ message: 'Verification code generated. Please check your email or contact support if not received.' });
    }
  } catch (error) {
    console.error('Send verification code error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🧪 Verify OTP endpoint (for frontend verification before registration)
exports.verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    // Verify OTP from memory
    const storedOTP = otpStorage.get(email);
    if (!storedOTP) {
      return res.status(400).json({ message: 'No verification code found. Please request a new one.' });
    }

    if (storedOTP.expiresAt < Date.now()) {
      otpStorage.delete(email); // Clean up expired OTP
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    if (storedOTP.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Mark OTP as verified but don't delete it yet (will be deleted after successful registration)
    otpStorage.set(email, { ...storedOTP, verified: true });
    
    res.json({ message: 'OTP verified successfully!', email: email });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🚀 Register User (existing endpoint for backward compatibility)
exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, city, code, verificationCode } = req.body;

    // Accept either 'code' or 'verificationCode' from frontend
    const otp = code || verificationCode;

    if (!name || !phone || !email || !password || !city || !otp) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Only Tricity cities allowed
    const allowedCities = ['Chandigarh', 'Mohali', 'Panchkula'];
    if (!allowedCities.includes(city)) {
      return res.status(400).json({ message: 'Only Tricity users allowed' });
    }

    // Check if user already exists
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    // Verify OTP from memory
    const storedOTP = otpStorage.get(email);
    if (!storedOTP) {
      return res.status(400).json({ message: 'No verification code found. Please request a new one.' });
    }

    if (storedOTP.expiresAt < Date.now()) {
      otpStorage.delete(email); // Clean up expired OTP
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    if (storedOTP.code !== otp) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // OTP is valid, remove it from storage
    otpStorage.delete(email);

    // Hash password and create user
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, phone, email, password: hashed, city }
    });

    const token = generateToken(user);
    console.log('User registered successfully:', user.email);
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🔐 Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  // const isBlocked = await prisma.blockedUser.findUnique({ where: { email } });
  // if (isBlocked) return res.status(403).json({ message: 'Access blocked' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Wrong password' });

  const token = generateToken(user);
  res.json({ user, token });
};

// 👤 Get current user
exports.getMe = async (req, res) => {
  res.json(req.user);
};

// 🚪 Logout (just returns message)
exports.logout = async (req, res) => {
  res.json({ message: 'Logout success (client deletes token)' });
};

// 🧪 Test OTP verification (for testing purposes)
exports.testVerifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    // Verify OTP from memory
    const storedOTP = otpStorage.get(email);
    if (!storedOTP) {
      return res.status(400).json({ message: 'No verification code found. Please request a new one.' });
    }

    if (storedOTP.expiresAt < Date.now()) {
      otpStorage.delete(email); // Clean up expired OTP
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    if (storedOTP.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // OTP is valid
    otpStorage.delete(email);
    res.json({ message: 'OTP verified successfully!', email: email });
  } catch (error) {
    console.error('Test OTP verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
