# Verma and Company. Frontend - React Native Expo App

A modern e-commerce mobile application built with React Native and Expo Router for selling bathroom fittings, kitchen accessories, and plumbing supplies.

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mitttal-and-co-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the app**
   - **Web**: Open http://localhost:8081 in your browser
   - **Mobile**: 
     - Install Expo Go app on your phone
     - Scan the QR code displayed in terminal
     - Or use iOS Simulator/Android Emulator

### Demo Accounts
- **Admin**: admin@mitttalandco.com / password123
- **User**: john.doe@example.com / password123

## 📱 App Features

### User Features
- Browse products by categories
- Search and filter products
- Add items to cart
- Place orders
- Track order status
- User profile management

### Admin Features
- Dashboard with analytics
- Product management (CRUD)
- Category management (CRUD)
- Order management
- User management

## 🏗️ Project Structure

```
app/
├── _layout.tsx                 # Root layout
├── index.tsx                   # Welcome screen
├── (tabs)/                     # Main app tabs
│   ├── _layout.tsx
│   ├── index.tsx              # Home screen
│   ├── categories.tsx         # Categories & products
│   ├── cart.tsx               # Shopping cart
│   ├── orders.tsx             # User orders
│   └── profile.tsx            # User profile
├── (admin)/                    # Admin panel
│   ├── _layout.tsx
│   ├── index.tsx              # Admin dashboard
│   ├── products.tsx           # Product management
│   ├── categories.tsx         # Category management
│   ├── orders.tsx             # Order management
│   └── settings.tsx           # Admin settings
├── auth/                       # Authentication
│   ├── login.tsx
│   ├── signup.tsx
│   └── forgot-password.tsx
├── product/[id].tsx           # Product details
├── checkout.tsx               # Checkout process
└── order-success.tsx          # Order confirmation

components/                     # Reusable components
contexts/                      # React contexts
services/                      # API services
types/                         # TypeScript types
data/                          # Mock data
docs/                          # Documentation
```

## 🔌 API Integration Guide

The app is currently using mock data. To integrate with a real backend, update the API service files:

### API Service Files to Update

1. **`services/api.ts`** - Main API service file
2. **`contexts/AuthContext.tsx`** - Authentication context
3. **`app/checkout.tsx`** - Order creation
4. **All admin screens** - Product/category/order management

### Required API Endpoints

See `docs/API_SPECIFICATION.md` for complete API documentation including:

- Authentication endpoints
- Product management
- Category management  
- Order management
- User management
- Error handling

### Integration Steps

1. **Update API Base URL**
   ```typescript
   // In services/api.ts
   const API_BASE_URL = 'https://your-api-domain.com/api/v1';
   ```

2. **Replace Mock Functions**
   - Replace mock API calls with actual HTTP requests
   - Update response handling
   - Add proper error handling

3. **Update Authentication**
   - Implement JWT token storage
   - Add token refresh logic
   - Update protected route handling

4. **Test Integration**
   - Test all CRUD operations
   - Verify authentication flows
   - Test error scenarios

## 📋 Complete API Requirements

### Authentication APIs
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Password reset

### Category APIs
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category by ID
- `POST /categories` - Create category (admin)
- `PUT /categories/:id` - Update category (admin)
- `DELETE /categories/:id` - Delete category (admin)

### Product APIs
- `GET /products` - Get products with filters
- `GET /products/featured` - Get featured products
- `GET /products/bestsellers` - Get bestseller products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product (admin)
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)

### Order APIs
- `GET /orders` - Get orders (user's own or all for admin)
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create new order
- `PUT /orders/:id/status` - Update order status (admin)

### Admin APIs
- `GET /admin/users` - Get all users
- `GET /admin/dashboard/stats` - Get dashboard statistics

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api/v1
EXPO_PUBLIC_API_KEY=your_api_key
```

## 🎨 Design System

- **Colors**: Blue primary (#0066CC), clean whites and grays
- **Typography**: Inter font family
- **Icons**: Lucide React Native
- **Images**: Pexels stock photos
- **Layout**: Tab-based navigation with stack navigation

## 📦 Key Dependencies

- **expo**: ~53.0.0
- **expo-router**: ~5.0.2
- **react-native**: 0.79.1
- **lucide-react-native**: Icon library
- **@expo-google-fonts/inter**: Typography
- **react-native-reanimated**: Animations
- **react-native-gesture-handler**: Touch handling

## 🚀 Deployment

### Web Deployment
```bash
npm run build:web
```

### Mobile App Store
1. Build with EAS Build
2. Submit to App Store/Play Store
3. Configure app signing

## 📖 Additional Documentation

- **`EXPO_ROUTER_GUIDE.md`** - Complete Expo Router development guide
- **`docs/API_SPECIFICATION.md`** - Detailed API documentation
- **`data/mockData.ts`** - Mock data structure reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.