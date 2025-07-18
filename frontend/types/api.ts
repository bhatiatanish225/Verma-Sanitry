export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  city: string;
  role: 'admin' | 'user';
  isBlocked: boolean;
  created_at: string;
  updated_at: string;
  full_name?: string; // Add this for compatibility
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  image_url?: string; // Add for compatibility
  price: number;
  original_price?: number;
  isFeatured: boolean;
  isBestseller: boolean;
  categoryId: string;
  category?: Category;
  availableStock: number;
  stock_quantity?: number; // Add for compatibility
  rating?: number;
  reviews_count?: number;
  taxPercent?: number;
  specifications?: string[];
  tags?: string[];
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  orderItems?: OrderItem[];
  cartItems?: CartItem[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  maxQuantity: number;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_address?: string;
  payment_method?: string;
  estimated_delivery?: string;
  order_items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}