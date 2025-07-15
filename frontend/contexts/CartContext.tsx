import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '@/services/api';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  maxQuantity: number;
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { readonly children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch cart items when user changes
  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setItems([]);
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      const response = await cartService.getCart();
      if (response.success && response.data) {
        // Map API cart items to our CartItem format
        const cartItems = response.data.items.map(item => ({
          id: item.productId ?? item.id,
          name: item.product.name,
          price: item.product.price,
          image_url: item.product.imageUrl ?? '',
          quantity: item.quantity,
          maxQuantity: item.product.availableStock ?? 10
        }));
        setItems(cartItems);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Omit<CartItem, 'quantity'>) => {
    if (!user) {
      console.warn('User must be logged in to add items to cart');
      return;
    }

    try {
      setIsLoading(true);
      const existingItem = items.find(item => item.id === product.id);
      const quantity = existingItem ? existingItem.quantity + 1 : 1;
      
      if (existingItem && existingItem.quantity >= product.maxQuantity) {
        return; // Can't add more than max quantity
      }

      const response = await cartService.addToCart(product.id, quantity);
      if (response.success) {
        // Update local state
        await fetchCartItems(); // Refresh cart from API
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (id: string) => {
    if (!user) {
      console.warn('User must be logged in to remove items from cart');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await cartService.removeFromCart(id);
      if (response.success) {
        // Update local state
        setItems(prevItems => prevItems.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!user) {
      console.warn('User must be logged in to update cart');
      return;
    }
    
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    try {
      setIsLoading(true);
      // Remove the item and add it again with the new quantity
      // (This approach works if the backend doesn't have a specific update endpoint)
      const item = items.find(item => item.id === id);
      if (!item) return;
      
      const newQuantity = Math.min(quantity, item.maxQuantity);
      
      // First remove from cart
      await cartService.removeFromCart(id);
      
      // Then add with new quantity
      const response = await cartService.addToCart(id, newQuantity);
      
      if (response.success) {
        // Update local state
        setItems(prevItems =>
          prevItems.map(item =>
            item.id === id
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) {
      console.warn('User must be logged in to clear cart');
      return;
    }
    
    try {
      setIsLoading(true);
      // Remove all items one by one
      for (const item of items) {
        await cartService.removeFromCart(item.id);
      }
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const contextValue = React.useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isLoading
  }), [items, isLoading]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};