import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, CreditCard, Smartphone, Banknote } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/api';

export default function CheckoutScreen() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState({
    name: user?.full_name || 'John Doe',
    phone: user?.phone || '+91 98765 43210',
    street: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  });

  const subtotal = getTotalPrice();
  const deliveryCharge = 99;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + deliveryCharge + tax;

  const paymentMethods = [
    {
      id: 'upi',
      title: 'UPI Payment',
      subtitle: 'Pay using UPI apps',
      icon: Smartphone,
    },
    {
      id: 'card',
      title: 'Credit/Debit Card',
      subtitle: 'Visa, Mastercard, RuPay',
      icon: CreditCard,
    },
    {
      id: 'cod',
      title: 'Cash on Delivery',
      subtitle: 'Pay when you receive',
      icon: Banknote,
    },
  ];

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to place an order');
      return;
    }

    setIsLoading(true);
    
    try {
      const orderData = {
        user_id: user.id,
        total_amount: total,
        delivery_address: `${address.name}, ${address.phone}, ${address.street}, ${address.city}, ${address.state} - ${address.pincode}`,
        payment_method: selectedPayment,
        order_items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const response = await orderService.createOrder(orderData);
      
      if (response.success) {
        clearCart();
        router.replace('/order-success');
      } else {
        Alert.alert('Error', response.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#2e3f47" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#c6aa55" />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          <View style={styles.addressCard}>
            <Text style={styles.addressName}>{address.name}</Text>
            <Text style={styles.addressPhone}>{address.phone}</Text>
            <Text style={styles.addressText}>
              {address.street}, {address.city}, {address.state} - {address.pincode}
            </Text>
            <TouchableOpacity style={styles.changeButton}>
              <Text style={styles.changeButtonText}>Change Address</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderSummary}>
            {items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Text style={styles.orderItemName} numberOfLines={1}>
                  {item.name} x {item.quantity}
                </Text>
                <Text style={styles.orderItemPrice}>
                  ₹{(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedPayment === method.id && styles.paymentMethodSelected
                ]}
                onPress={() => setSelectedPayment(method.id)}
              >
                <View style={styles.paymentMethodLeft}>
                  <View style={[
                    styles.paymentIcon,
                    selectedPayment === method.id && styles.paymentIconSelected
                  ]}>
                    <method.icon size={20} color={selectedPayment === method.id ? '#ffffff' : '#c6aa55'} />
                  </View>
                  <View style={styles.paymentText}>
                    <Text style={styles.paymentTitle}>{method.title}</Text>
                    <Text style={styles.paymentSubtitle}>{method.subtitle}</Text>
                  </View>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPayment === method.id && styles.radioButtonSelected
                ]}>
                  {selectedPayment === method.id && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Coupon Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coupon Code</Text>
          <View style={styles.couponContainer}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter coupon code"
              placeholderTextColor="#9b9591"
            />
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Price Breakdown & Place Order */}
      <View style={styles.footer}>
        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal:</Text>
            <Text style={styles.priceValue}>₹{subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery:</Text>
            <Text style={styles.priceValue}>₹{deliveryCharge}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax (18%):</Text>
            <Text style={styles.priceValue}>₹{tax.toLocaleString()}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderButton, isLoading && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isLoading}
        >
          <Text style={styles.placeOrderText}>
            {isLoading ? 'Placing Order...' : 'Place Order'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#e7e0d0',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
    paddingHorizontal: 24,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
    marginLeft: 8,
  },
  addressCard: {
    backgroundColor: '#f3f3f3',
    padding: 16,
    borderRadius: 12,
  },
  addressName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9b9591',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    lineHeight: 20,
    marginBottom: 12,
  },
  changeButton: {
    alignSelf: 'flex-start',
  },
  changeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#c6aa55',
  },
  orderSummary: {
    backgroundColor: '#f3f3f3',
    padding: 16,
    borderRadius: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2e3f47',
    marginRight: 16,
  },
  orderItemPrice: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#631e25',
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#d3bfb3',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  paymentMethodSelected: {
    borderColor: '#c6aa55',
    backgroundColor: 'rgba(198, 170, 85, 0.05)',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(198, 170, 85, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentIconSelected: {
    backgroundColor: '#c6aa55',
  },
  paymentText: {
    marginLeft: 12,
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d3bfb3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#c6aa55',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#c6aa55',
  },
  couponContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d3bfb3',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2e3f47',
  },
  applyButton: {
    backgroundColor: '#c6aa55',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  priceBreakdown: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#d3bfb3',
    paddingTop: 8,
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
  },
  priceValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2e3f47',
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#631e25',
  },
  placeOrderButton: {
    backgroundColor: '#631e25',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});