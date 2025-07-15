import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, Filter, Star, Plus, TrendingUp, Heart, Grid2x2 as Grid, List, SlidersHorizontal } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { productService, categoryService } from '@/services/api';
import { Product, Category } from '@/types/api';

const { width } = Dimensions.get('window');
const PRODUCT_WIDTH = (width - 48) / 2;

export default function CategoriesScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchData = async () => {
    try {
      const categoriesResponse = await categoryService.getCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const params: any = {};
      if (selectedCategory !== 'all') {
        params.category_id = selectedCategory;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const productsResponse = await productService.getProducts(params);
      if (productsResponse.success) {
        setProducts(productsResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.categoryChipActive
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={[
        styles.categoryChipText,
        selectedCategory === item.id && styles.categoryChipTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderGridProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.gridProductCard}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View style={styles.gridImageContainer}>
        <Image source={{ uri: item.image_url }} style={styles.gridProductImage} />
        {item.original_price && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round(((item.original_price - item.price) / item.original_price) * 100)}% OFF
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.wishlistButton}>
          <Heart size={14} color="#9b9591" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.addButton, item.stock_quantity === 0 && styles.addButtonDisabled]}
          onPress={(e) => {
            e.stopPropagation();
            if (item.stock_quantity > 0) {
              addToCart({
                id: item.id,
                name: item.name,
                price: item.price,
                image_url: item.image_url,
                maxQuantity: item.stock_quantity
              });
            }
          }}
          disabled={item.stock_quantity === 0}
        >
          <Plus size={14} color="#ffffff" />
        </TouchableOpacity>
      </View>
      <View style={styles.gridProductInfo}>
        <Text style={styles.gridProductName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.gridProductCategory}>{item.category?.name}</Text>
        <View style={styles.gridRatingContainer}>
          <View style={styles.ratingBadge}>
            <Star size={10} color="#ffffff" fill="#ffffff" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.reviewsText}>({item.reviews_count})</Text>
        </View>
        <View style={styles.gridPriceContainer}>
          <Text style={styles.gridPrice}>₹{item.price.toLocaleString()}</Text>
          {item.original_price && (
            <Text style={styles.gridOriginalPrice}>₹{item.original_price.toLocaleString()}</Text>
          )}
        </View>
        <View style={styles.stockContainer}>
          <View style={[
            styles.stockIndicator,
            item.stock_quantity > 0 ? styles.inStockIndicator : styles.outOfStockIndicator
          ]} />
          <Text style={[
            styles.stockText,
            item.stock_quantity > 0 ? styles.inStock : styles.outOfStock
          ]}>
            {item.stock_quantity > 0 ? `${item.stock_quantity} in stock` : 'Out of Stock'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.listProductCard}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <Image source={{ uri: item.image_url }} style={styles.listProductImage} />
      <View style={styles.listProductInfo}>
        <Text style={styles.listProductName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.listProductCategory}>{item.category?.name}</Text>
        <View style={styles.listRatingContainer}>
          <View style={styles.ratingBadge}>
            <Star size={10} color="#ffffff" fill="#ffffff" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.reviewsText}>({item.reviews_count} reviews)</Text>
        </View>
        <View style={styles.listPriceContainer}>
          <Text style={styles.listPrice}>₹{item.price.toLocaleString()}</Text>
          {item.original_price && (
            <Text style={styles.listOriginalPrice}>₹{item.original_price.toLocaleString()}</Text>
          )}
        </View>
      </View>
      <View style={styles.listProductActions}>
        <TouchableOpacity style={styles.listWishlistButton}>
          <Heart size={16} color="#9b9591" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.listAddButton, item.stock_quantity === 0 && styles.addButtonDisabled]}
          onPress={(e) => {
            e.stopPropagation();
            if (item.stock_quantity > 0) {
              addToCart({
                id: item.id,
                name: item.name,
                price: item.price,
                image_url: item.image_url,
                maxQuantity: item.stock_quantity
              });
            }
          }}
          disabled={item.stock_quantity === 0}
        >
          <Plus size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryGrid = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={styles.categoryGridItem}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Image source={{ uri: item.image_url || 'https://images.pexels.com/photos/6585751/pexels-photo-6585751.jpeg?auto=compress&cs=tinysrgb&w=500' }} style={styles.categoryGridImage} />
      <View style={styles.categoryGridOverlay}>
        <Text style={styles.categoryGridName}>{item.name}</Text>
        <View style={styles.categoryGridBadge}>
          <TrendingUp size={12} color="#ffffff" />
          <Text style={styles.categoryGridCount}>Explore</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Premium Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Explore Products</Text>
              <Text style={styles.subtitle}>Discover premium collections</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={[styles.viewToggle, viewMode === 'grid' && styles.viewToggleActive]}
                onPress={() => setViewMode('grid')}
              >
                <Grid size={18} color={viewMode === 'grid' ? '#ffffff' : '#9b9591'} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.viewToggle, viewMode === 'list' && styles.viewToggleActive]}
                onPress={() => setViewMode('list')}
              >
                <List size={18} color={viewMode === 'list' ? '#ffffff' : '#9b9591'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Premium Search & Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#9b9591" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, brands..."
              placeholderTextColor="#9b9591"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.filterButton}>
              <SlidersHorizontal size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Grid */}
        {categories.length > 0 && (
          <View style={styles.categoryGrid}>
            <Text style={styles.categoryGridTitle}>Shop by Category</Text>
            <FlatList
              data={categories}
              renderItem={renderCategoryGrid}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.categoryGridContainer}
            />
          </View>
        )}

        {/* Category Filter Chips */}
        <View style={styles.categoryFilterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === 'all' && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === 'all' && styles.categoryChipTextActive
              ]}>
                All Products
              </Text>
            </TouchableOpacity>
            <FlatList
              data={categories}
              renderItem={renderCategory}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
            />
          </ScrollView>
        </View>

        {/* Products Section */}
        <View style={styles.productsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {products.length} products found
            </Text>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.sortText}>Sort by: Popular</Text>
              <Filter size={14} color="#9b9591" />
            </TouchableOpacity>
          </View>
          
          {products.length > 0 ? (
            viewMode === 'grid' ? (
              <FlatList
                data={products}
                renderItem={renderGridProduct}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.gridProductsList}
                columnWrapperStyle={styles.productRow}
                scrollEnabled={false}
              />
            ) : (
              <FlatList
                data={products}
                renderItem={renderListProduct}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listProductsList}
                scrollEnabled={false}
              />
            )
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  header: {
    backgroundColor: '#e7e0d0',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewToggle: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  viewToggleActive: {
    backgroundColor: '#631e25',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginTop: -12,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2e3f47',
    marginLeft: 12,
  },
  filterButton: {
    backgroundColor: '#631e25',
    padding: 8,
    borderRadius: 12,
  },
  categoryGrid: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  categoryGridTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
    marginBottom: 16,
  },
  categoryGridContainer: {
    gap: 16,
  },
  categoryGridItem: {
    flex: 1,
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  categoryGridImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  categoryGridOverlay: {
    flex: 1,
    backgroundColor: 'rgba(46, 63, 71, 0.6)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  categoryGridName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 6,
  },
  categoryGridBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c6aa55',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryGridCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginLeft: 4,
  },
  categoryFilterContainer: {
    paddingLeft: 24,
    marginBottom: 24,
  },
  categoryChip: {
    backgroundColor: '#e7e0d0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: '#631e25',
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2e3f47',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultsText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2e3f47',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sortText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9b9591',
    marginRight: 6,
  },
  gridProductsList: {
    paddingBottom: 24,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  gridProductCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 20,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  gridImageContainer: {
    position: 'relative',
    height: 160,
  },
  gridProductImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#631e25',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  wishlistButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#c6aa55',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#9b9591',
  },
  gridProductInfo: {
    padding: 16,
  },
  gridProductName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
    marginBottom: 4,
    lineHeight: 18,
  },
  gridProductCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    marginBottom: 8,
  },
  gridRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c6aa55',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginLeft: 2,
  },
  reviewsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    marginLeft: 8,
  },
  gridPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#631e25',
  },
  gridOriginalPrice: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  inStockIndicator: {
    backgroundColor: '#c6aa55',
  },
  outOfStockIndicator: {
    backgroundColor: '#631e25',
  },
  stockText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  inStock: {
    color: '#c6aa55',
  },
  outOfStock: {
    color: '#631e25',
  },
  listProductsList: {
    paddingBottom: 24,
  },
  listProductCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  listProductImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  listProductInfo: {
    flex: 1,
    marginLeft: 16,
  },
  listProductName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
    marginBottom: 4,
  },
  listProductCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    marginBottom: 8,
  },
  listRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listPrice: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#631e25',
  },
  listOriginalPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  listProductActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listWishlistButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f3f3f3',
  },
  listAddButton: {
    backgroundColor: '#c6aa55',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    textAlign: 'center',
  },
});