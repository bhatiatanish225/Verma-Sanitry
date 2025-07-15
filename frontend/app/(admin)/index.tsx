import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, ShoppingBag, Users, TrendingUp, DollarSign, Eye } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { orderService, productService, adminService } from '@/services/api';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: any[];
  lowStockProducts: any[];
}

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      const [ordersResponse, productsResponse, dashboardResponse] = await Promise.all([
        orderService.getOrders(),
        productService.getProducts(),
        adminService.getDashboardStats(),
      ]);

      let totalRevenue = 0;
      let recentOrders: any[] = [];
      let lowStockProducts: any[] = [];
      let totalUsers = 0;

      if (ordersResponse.success) {
        const orders = ordersResponse.data || [];
        totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
        recentOrders = orders.slice(0, 5);
      }

      if (productsResponse.success) {
        const products = productsResponse.data || [];
        lowStockProducts = products.filter(product => product.availableStock < 10).slice(0, 5);
      }

      if (dashboardResponse.success) {
        const dashboardData = dashboardResponse.data;
        totalUsers = dashboardData?.totalUsers || 0;
        // Use additional dashboard stats if available
        if (dashboardData?.totalRevenue) totalRevenue = dashboardData.totalRevenue;
        if (dashboardData?.recentOrders) recentOrders = dashboardData.recentOrders;
      }

      setStats({
        totalProducts: productsResponse.data?.length || 0,
        totalOrders: ordersResponse.data?.length || 0,
        totalUsers,
        totalRevenue,
        recentOrders,
        lowStockProducts,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardStats();
  };

  const StatCard = ({ icon: Icon, title, value, color }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'processing': return '#3B82F6';
      case 'shipped': return '#8B5CF6';
      case 'delivered': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back, {user?.name?.split(' ')[0]}!</Text>
            <Text style={styles.subtitle}>Here's what's happening with your store</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={Package}
            title="Total Products"
            value={stats.totalProducts}
            color="#0066CC"
          />
          <StatCard
            icon={ShoppingBag}
            title="Total Orders"
            value={stats.totalOrders}
            color="#10B981"
          />
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.totalUsers}
            color="#8B5CF6"
          />
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            color="#F59E0B"
          />
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order, index) => (
                <View key={order.id} style={[styles.orderItem, index < stats.recentOrders.length - 1 && styles.orderItemBorder]}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderNumber}>#{order.id.slice(-6)}</Text>
                    <Text style={styles.customerName}>{order.user?.name || 'Unknown User'}</Text>
                    <Text style={styles.customerName}>Customer Order</Text>
                  </View>
                  <View style={styles.orderDetails}>
                    <Text style={styles.orderAmount}>₹{order.total_amount.toLocaleString()}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                        {order.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No recent orders</Text>
            )}
          </View>
        </View>

        {/* Low Stock Alert */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Low Stock Alert</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            {stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map((product, index) => (
                <View key={product.id} style={[styles.productItem, index < stats.lowStockProducts.length - 1 && styles.orderItemBorder]}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                    <Text style={styles.productPrice}>₹{product.price.toLocaleString()}</Text>
                  </View>
                  <View style={styles.stockInfo}>
                    <Text style={[styles.stockText, { color: product.stock_quantity < 5 ? '#EF4444' : '#F59E0B' }]}>
                      {product.stock_quantity} left
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>All products are well stocked</Text>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Package size={20} color="#0066CC" />
              <Text style={styles.actionText}>Add Product</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Eye size={20} color="#0066CC" />
              <Text style={styles.actionText}>View Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <TrendingUp size={20} color="#0066CC" />
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  statTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0066CC',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  orderItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  customerName: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  orderDetails: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  productPrice: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  stockInfo: {
    alignItems: 'flex-end',
  },
  stockText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
});