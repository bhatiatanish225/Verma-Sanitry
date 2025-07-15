import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withSpring } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { user, isLoading } = useAuth();
  const logoScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const floatingElements = useSharedValue(0);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Route based on user role
        if (user.role === 'admin') {
          router.replace('/(admin)');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        // Start animations for welcome screen
        logoScale.value = withSequence(
          withTiming(1.2, { duration: 600 }),
          withSpring(1, { damping: 8, stiffness: 100 })
        );
        titleOpacity.value = withTiming(1, { duration: 800 });
        buttonOpacity.value = withTiming(1, { duration: 1000 });
        floatingElements.value = withTiming(1, { duration: 1200 });
      }
    }
  }, [user, isLoading]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }]
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: withTiming(titleOpacity.value === 1 ? 0 : 30) }]
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: withTiming(buttonOpacity.value === 1 ? 0 : 50) }]
  }));

  const floatingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: floatingElements.value,
    transform: [{ scale: floatingElements.value }]
  }));

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <View style={styles.spinner} />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If user is logged in, don't show welcome screen (navigation will happen in useEffect)
  if (user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    );
  }

  // Show welcome screen for non-authenticated users
  return (
    <View style={styles.container}>
      {/* Floating Background Elements */}
      <Animated.View style={[styles.floatingElement1, floatingAnimatedStyle]} />
      <Animated.View style={[styles.floatingElement2, floatingAnimatedStyle]} />
      <Animated.View style={[styles.floatingElement3, floatingAnimatedStyle]} />

      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoBackground}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/6585751/pexels-photo-6585751.jpeg?auto=compress&cs=tinysrgb&w=200' }}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
          <Text style={styles.title}>Verma and Company.</Text>
          <View style={styles.subtitleContainer}>
            <View style={styles.accentLine} />
            <Text style={styles.subtitle}>Premium Sanitary Solutions</Text>
            <View style={styles.accentLine} />
          </View>
          <Text style={styles.description}>
            Your trusted partner for quality bathroom fittings, kitchen accessories, and plumbing supplies
          </Text>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.signupButton}
            onPress={() => router.push('/auth/signup')}
            activeOpacity={0.8}
          >
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.dot} />
          <Text style={styles.footerText}>Quality</Text>
          <View style={styles.dot} />
          <Text style={styles.footerText}>Trust</Text>
          <View style={styles.dot} />
          <Text style={styles.footerText}>Innovation</Text>
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2e3f47',
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2e3f47',
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#c6aa55',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter-Medium',
  },
  floatingElement1: {
    position: 'absolute',
    top: 100,
    right: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(198, 170, 85, 0.1)',
  },
  floatingElement2: {
    position: 'absolute',
    top: 200,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(211, 191, 179, 0.1)',
  },
  floatingElement3: {
    position: 'absolute',
    bottom: 150,
    right: 50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(155, 149, 145, 0.1)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 48,
  },
  logoBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#e7e0d0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    fontSize: 42,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  accentLine: {
    width: 30,
    height: 2,
    backgroundColor: '#c6aa55',
    marginHorizontal: 12,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#c6aa55',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#f3f3f3',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  loginButton: {
    backgroundColor: '#631e25',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  signupButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#c6aa55',
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#c6aa55',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#c6aa55',
    marginHorizontal: 8,
  },
  footerText: {
    color: '#d3bfb3',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});