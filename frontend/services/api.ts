import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Category, Product, Order, AuthResponse, ApiResponse, PaginatedResponse } from '@/types/api';

// Create axios instance with base URL and default headers
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';

// Determine if we're running in a web browser
const isWeb = typeof window !== 'undefined' && window.location;

// If running in web browser, ensure we use the correct localhost URL
const baseURL = isWeb 
  ? `${window.location.protocol}//${window.location.hostname}:5001`
  : API_BASE_URL;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptors for token handling
api.interceptors.request.use(
  async (config) => {
    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(new Error(error));
  }
);

// Store token in AsyncStorage
const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

// Remove token from AsyncStorage
const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Handle response and format according to ApiResponse type
function formatResponse<T>(promise: Promise<any>): Promise<ApiResponse<T>> {
  return promise
    .then(response => ({
      success: true,
      data: response.data,
      message: response.data.message ?? ''
    }))
    .catch(error => ({
      success: false,
      error: error.response?.data?.message ?? error.message ?? 'An error occurred'
    }));
}

// Current user state will be managed by auth context, not here

export const authService = {
  // Multi-step signup endpoints
  async signupStep1(userData: {
    name: string;
    email: string;
    phone: string;
  }): Promise<ApiResponse<{ message: string; code?: string }>> {
    return formatResponse<{ message: string; code?: string }>(api.post('/api/auth/signup/step1', userData));
  },

  async signupStep2(email: string, otp: string): Promise<ApiResponse<{ message: string }>> {
    return formatResponse<{ message: string }>(api.post('/api/auth/signup/step2', { email, otp }));
  },

  async signupStep3(userData: {
    email: string;
    password: string;
    city: string;
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await formatResponse<AuthResponse>(api.post('/api/auth/signup/step3', userData));
    
    // Store token if registration is successful
    if (response.success && response.data?.token) {
      await storeToken(response.data.token);
    }
    
    return response;
  },

  // Existing endpoints for backward compatibility
  async sendOTP(email: string): Promise<ApiResponse<{ message: string; code?: string }>> {
    return formatResponse<{ message: string; code?: string }>(api.post('/api/auth/send-code', { email }));
  },

  async verifyOTP(email: string, code: string): Promise<ApiResponse<{ message: string }>> {
    return formatResponse<{ message: string }>(api.post('/api/auth/verify-otp', { email, code }));
  },

  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await formatResponse<AuthResponse>(api.post('/api/auth/login', { email, password }));
    
    // Store token if login is successful
    if (response.success && response.data?.token) {
      await storeToken(response.data.token);
    }
    
    return response;
  },

  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    city?: string;
    code: string; // OTP code
  }): Promise<ApiResponse<AuthResponse>> {
    // Format the data as expected by the backend
    // Map city ids to proper city names to match backend validation
    let cityName = userData.city || '';
    if (userData.city === 'chandigarh') cityName = 'Chandigarh';
    if (userData.city === 'mohali') cityName = 'Mohali';
    if (userData.city === 'panchkula') cityName = 'Panchkula';

    const registerData = {
      name: userData.full_name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || '',
      city: cityName, // Send proper city name with correct case
      code: userData.code // Use 'code' instead of 'verificationCode'
    };

    const response = await formatResponse<AuthResponse>(api.post('/api/auth/register', registerData));
    
    // Store token if registration is successful
    if (response.success && response.data?.token) {
      await storeToken(response.data.token);
    }
    
    return response;
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return formatResponse<User>(api.get('/api/auth/me'));
  },

  async logout(): Promise<ApiResponse<null>> {
    try {
      // Clear token from storage when logging out
      await removeToken();
      // Try to notify the server about logout (optional)
      return formatResponse<null>(api.post('/api/auth/logout'));
    } catch (error) {
      // Even if server call fails, token is already removed
      console.log('Logout API call failed, but token was cleared locally');
      return { success: true, data: null };
    }
  },

  async resetPassword(email: string): Promise<ApiResponse<null>> {
    // This might need to be adjusted based on the actual backend implementation
    return formatResponse<null>(api.post('/api/auth/send-code', { email, purpose: 'reset' }));
  }
};

export const categoryService = {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return formatResponse<Category[]>(api.get('/api/categories'));
  },

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    return formatResponse<Category>(api.get(`/api/categories/${id}`));
  },

  async createCategory(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Category>> {
    return formatResponse<Category>(api.post('/api/categories', categoryData));
  },

  async updateCategory(id: string, categoryData: Partial<Category>): Promise<ApiResponse<Category>> {
    return formatResponse<Category>(api.put(`/api/categories/${id}`, categoryData));
  },

  async deleteCategory(id: string): Promise<ApiResponse<null>> {
    return formatResponse<null>(api.delete(`/api/categories/${id}`));
  }
};

export const productService = {
  async getProducts(params?: {
    category_id?: string;
    search?: string;
    tags?: string[];
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Product>> {
    // Convert to query parameters
    const queryParams = new URLSearchParams();
    if (params?.category_id) queryParams.append('categoryId', params.category_id);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    let url = '/api/products';
    if (queryString) {
      url += `?${queryString}`;
    }

    return api.get(url)
      .then(response => ({
        success: true,
        data: response.data.products,
        pagination: {
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages
        }
      }))
      .catch(error => ({
        success: false,
        error: error.response?.data?.message || error.message,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      }));
  },

  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    return formatResponse<Product[]>(api.get('/api/products?isFeatured=true'));
  },

  async getBestSellerProducts(): Promise<ApiResponse<Product[]>> {
    return formatResponse<Product[]>(api.get('/api/products?isBestseller=true'));
  },

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return formatResponse<Product>(api.get(`/api/products/${id}`));
  },

  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Product>> {
    return formatResponse<Product>(api.post('/api/products', productData));
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<ApiResponse<Product>> {
    return formatResponse<Product>(api.put(`/api/products/${id}`, productData));
  },

  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    return formatResponse<null>(api.delete(`/api/products/${id}`));
  }
};

export const orderService = {
  async getOrders(): Promise<ApiResponse<Order[]>> {
    // For regular users, this endpoint will return their own orders
    return formatResponse<Order[]>(api.get('/api/orders'));
  },

  async getAllOrders(): Promise<ApiResponse<Order[]>> {
    // For admin users only
    return formatResponse<Order[]>(api.get('/api/admin/orders'));
  },

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    // This endpoint might need to be adjusted based on backend implementation
    return formatResponse<Order>(api.get(`/api/orders/${id}`));
  },

  async createOrder(orderData: {
    total_amount: number;
    delivery_address: string;
    payment_method: string;
    order_items: Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>;
  }): Promise<ApiResponse<Order>> {
    return formatResponse<Order>(api.post('/api/orders', orderData));
  },

  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<Order>> {
    // This endpoint might need to be adjusted based on backend implementation
    return formatResponse<Order>(api.put(`/api/orders/${id}/status`, { status }));
  }
};

// Cart service for managing cart items
export const cartService = {
  async getCart(): Promise<ApiResponse<{ items: any[] }>> {
    return formatResponse<{ items: any[] }>(api.get('/api/cart'));
  },

  async addToCart(productId: string, quantity: number): Promise<ApiResponse<any>> {
    return formatResponse<any>(api.post('/api/cart', { productId, quantity }));
  },

  async removeFromCart(itemId: string): Promise<ApiResponse<null>> {
    return formatResponse<null>(api.delete(`/api/cart/${itemId}`));
  }
};

// Payment service for Razorpay integration
export const paymentService = {
  async createOrder(orderId: string): Promise<ApiResponse<any>> {
    return formatResponse<any>(api.post('/api/payment/order', { orderId }));
  },

  async verifyPayment(paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    order_id: string;
  }): Promise<ApiResponse<any>> {
    return formatResponse<any>(api.post('/api/payment/verify', paymentData));
  }
};

// Admin service for dashboard statistics and user management
export const adminService = {
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return formatResponse<User[]>(api.get('/api/admin/users'));
  },

  async getDashboardStats(): Promise<ApiResponse<any>> {
    return formatResponse<any>(api.get('/api/admin/dashboard/stats'));
  }
};