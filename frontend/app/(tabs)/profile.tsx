import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, MapPin, CreditCard, Bell, CircleHelp as HelpCircle, Shield, LogOut, ChevronRight, CreditCard as Edit, AlertCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, signOut, isLoading } = useAuth();
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setIsSigningOut(true);
              setMessage(null);
              // Force token removal and state reset
              await AsyncStorage.removeItem('token');
              // Clear any other stored data if needed
              await AsyncStorage.clear();
              await signOut();
              // Navigation is handled automatically by AuthContext
            } catch (error) {
              console.error('Error during sign out:', error);
              setMessage({ 
                type: 'error', 
                text: 'Failed to sign out. Please try again.' 
              });
              // Even if there's an error, clear local storage
              await AsyncStorage.removeItem('token');
            } finally {
              setIsSigningOut(false);
            }
          }
        }
      ]
    );
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          title: 'Personal Information',
          subtitle: 'Update your details',
          onPress: () => {},
        },
        {
          icon: MapPin,
          title: 'Address Book',
          subtitle: 'Manage delivery addresses',
          onPress: () => {},
        },
        {
          icon: CreditCard,
          title: 'Payment Methods',
          subtitle: 'Cards and payment options',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          title: 'Notifications',
          subtitle: 'Push notifications, emails',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          title: 'Help & Support',
          subtitle: 'FAQs, contact support',
          onPress: () => {},
        },
        {
          icon: Shield,
          title: 'Privacy Policy',
          subtitle: 'Data usage and privacy',
          onPress: () => {},
        },
      ],
    },
  ];

  const renderMenuItem = (item: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.menuItem}
      onPress={item.onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>
          <item.icon size={20} color="#c6aa55" />
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <ChevronRight size={20} color="#9b9591" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity style={styles.editButton}>
              <Edit size={20} color="#2e3f47" />
            </TouchableOpacity>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <User size={32} color="#ffffff" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {user?.phone && (
              <Text style={styles.userPhone}>{user.phone}</Text>
            )}
            {user?.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Administrator</Text>
              </View>
            )}
          </View>
        </View>

        {/* Menu Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => renderMenuItem(item, itemIndex))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            {/* Message Display */}
            {message && (
              <View style={[styles.messageBox, message.type === 'error' ? styles.errorBox : styles.successBox]}>
                <AlertCircle size={20} color={message.type === 'error' ? '#631e25' : '#0f5132'} />
                <Text style={[styles.messageText, message.type === 'error' ? styles.errorTextMsg : styles.successTextMsg]}>
                  {message.text}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem, isSigningOut && { opacity: 0.6 }]}
              onPress={handleLogout}
              disabled={isSigningOut}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, styles.logoutIcon]}>
                  <LogOut size={20} color="#631e25" />
                </View>
                <View style={styles.menuText}>
                  <Text style={[styles.menuTitle, styles.logoutText]}>Sign Out</Text>
                  {isSigningOut && <ActivityIndicator size="small" color="#631e25" style={{ marginLeft: 8 }} />}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Verma and Company. v1.0.0</Text>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
  },
  editButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#c6aa55',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
    marginBottom: 8,
  },
  adminBadge: {
    backgroundColor: '#631e25',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  adminBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2e3f47',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(198, 170, 85, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    marginLeft: 16,
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2e3f47',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutIcon: {
    backgroundColor: 'rgba(99, 30, 37, 0.1)',
  },
  logoutText: {
    color: '#631e25',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: 'rgba(99, 30, 37, 0.1)',
    borderColor: 'rgba(99, 30, 37, 0.3)',
  },
  successBox: {
    backgroundColor: 'rgba(15, 81, 50, 0.1)',
    borderColor: 'rgba(15, 81, 50, 0.3)',
  },
  messageText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  errorTextMsg: {
    color: '#631e25',
  },
  successTextMsg: {
    color: '#0f5132',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9b9591',
  },
});