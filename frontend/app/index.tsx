import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function WelcomeScreen() {
  const { user, isLoading } = useAuth();
  
  // Handle automatic navigation based on auth state
  useEffect(() => {
    if (user && !isLoading) {
      // Redirect based on user role
      if (user.role === 'admin') {
        router.replace('/(admin)');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [user, isLoading]);

  // Don't render anything while checking auth state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Only show welcome screen if not authenticated
  if (user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Verma & Co.</Text>
          <Text style={styles.tagline}>Premium Sanitary Solutions</Text>
        </View>

                 <View style={styles.heroContainer}>
           <View style={styles.heroPlaceholder}>
             <Text style={styles.heroText}>🏪</Text>
           </View>
         </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to Verma & Co.</Text>
          <Text style={styles.subtitle}>
            Your one-stop shop for premium sanitary solutions in the Tricity area.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/auth/signup')}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2e3f47',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2e3f47',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#c6aa55',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#d3bfb3',
  },
     heroContainer: {
     alignItems: 'center',
     marginBottom: 40,
   },
   heroPlaceholder: {
     width: 280,
     height: 280,
     justifyContent: 'center',
     alignItems: 'center',
     backgroundColor: 'rgba(198, 170, 85, 0.1)',
     borderRadius: 20,
     borderWidth: 2,
     borderColor: '#c6aa55',
   },
   heroText: {
     fontSize: 80,
     textAlign: 'center',
   },
  textContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#d3bfb3',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#c6aa55',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#2e3f47',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(231, 224, 208, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c6aa55',
  },
  secondaryButtonText: {
    color: '#c6aa55',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});