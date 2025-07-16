# Email Setup Instructions

## Admin Account Created

A dummy admin account has been created with the following credentials:
- **Email**: `admin@vermaandco.com`
- **Password**: `admin123`
- **Role**: admin

You can use these credentials to test the admin functionality.

## Email Configuration

To enable OTP email sending, you need to configure the following environment variables in your `.env` file:

```env
# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
```

### How to Set Up Gmail App Password:

1. **Enable 2-Factor Authentication** on your Google Account
2. Go to your Google Account settings
3. Navigate to **Security** > **2-Step Verification**
4. Scroll down to **App passwords**
5. Select **Mail** and generate a new app password
6. Use this generated password (not your regular Gmail password) as `EMAIL_PASS`

### Example .env Configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/vermaandco

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd-efgh-ijkl-mnop

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Server Configuration
PORT=5001
NODE_ENV=development
```

## Testing

1. **Admin Login**: Use the admin credentials above to test admin functionality
2. **OTP Emails**: Configure the email settings to receive actual OTP emails during signup
3. **Multi-step Signup**: The signup process now works in 3 steps with Redis-based temporary storage

## Changes Made

1. ✅ **Created dummy admin account** with proper credentials
2. ✅ **Fixed logout functionality** - now properly clears user state and redirects
3. ✅ **Fixed OTP email sending** - emails are now sent regardless of environment
4. ✅ **Removed OTP display** - OTP codes are no longer shown in development mode
5. ✅ **Updated admin credentials** in login screen for easy testing

## Features

- **Multi-step signup flow** with Redis temporary storage
- **OTP expires in 5 minutes**, signup data expires in 1 hour
- **Duplicate email prevention** at both initial step and final registration
- **Proper logout functionality** with automatic navigation
- **Email OTP delivery** (when configured)

## Troubleshooting

- **Not receiving emails?** Check your `EMAIL_USER` and `EMAIL_PASS` environment variables
- **Redis connection issues?** Make sure Redis is running on your system
- **Logout not working?** Clear browser cache and try again

---

**Note**: Make sure to restart your server after updating the `.env` file for changes to take effect. 