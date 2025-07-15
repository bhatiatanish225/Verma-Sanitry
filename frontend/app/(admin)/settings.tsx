import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User, Shield, Bell, CircleHelp as HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminSettingsScreen() {
  const { user, signOut } = useAuth();

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
            await signOut();
            // Navigation is handled automatically by AuthContext
          }
        }
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          title: 'Profile Information',
          subtitle: 'Update your admin details',
          onPress: () => {},
        },
        {
          icon: Shield,
          title: 'Security',
          subtitle: 'Password and security settings',
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
          subtitle: 'Manage notification preferences',
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
          subtitle: 'Get help and contact support',
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
          <item.icon size={20} color="#6B7280" />
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Admin Info */}
        <View style={styles.adminSection}>
          <View style={styles.avatar}>
            <User size={32} color="#FFFFFF" />
          </View>
          <View style={styles.adminInfo}>
            <Text style={styles.adminName}>{user?.name}</Text>
            <Text style={styles.adminEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Administrator</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {settingsSections.map((section, sectionIndex) => (
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
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, styles.logoutIcon]}>
                  <LogOut size={20} color="#EF4444" />
                </View>
                <View style={styles.menuText}>
                  <Text style={[styles.menuTitle, styles.logoutText]}>Sign Out</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Verma and Company. Admin v1.0.0</Text>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  adminSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminInfo: {
    marginLeft: 16,
    flex: 1,
  },
  adminName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  adminEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#E6F2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#0066CC',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    backgroundColor: '#F3F4F6',
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
    color: '#1F2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutIcon: {
    backgroundColor: '#FEF2F2',
  },
  logoutText: {
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
});