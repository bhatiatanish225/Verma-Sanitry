export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  phone: string;
  city: string;
  role: 'admin' | 'user';
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  isFeatured: boolean;
  isBestseller: boolean;
  categoryId: number;
  category?: Category;
  availableStock: number;
  rating?: number;
  taxPercent?: number;
  createdAt: string;
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
  delivery_address: string;
  payment_method: string;
  estimated_delivery?: string;
  order_items: OrderItem[];
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
}