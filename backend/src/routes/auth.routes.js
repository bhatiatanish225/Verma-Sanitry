const router = require('express').Router();
const { register, login, getMe, logout } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

// Multi-step signup endpoints
router.post('/signup/step1', authController.signupStep1);
router.post('/signup/step2', authController.signupStep2);
router.post('/signup/step3', authController.signupStep3);

// Existing endpoints for backward compatibility
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/send-code', authController.sendVerificationCode);
router.post('/verify-otp', authController.verifyOTP);
router.post('/test-verify-otp', authController.testVerifyOTP);

module.exports = router;
