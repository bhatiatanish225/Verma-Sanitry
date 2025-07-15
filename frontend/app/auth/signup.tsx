import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Shield, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

const CITIES = [
  { id: 'Chandigarh', name: 'Chandigarh' },
  { id: 'Mohali', name: 'Mohali' },
  { id: 'Panchkula', name: 'Panchkula' },
];

type SignupStep = 1 | 2 | 3;

export default function SignupScreen() {
  const { signupStep1, signupStep2, signupStep3 } = useAuth();
  const [currentStep, setCurrentStep] = useState<SignupStep>(1);
  
  // Step 1 data
  const [step1Data, setStep1Data] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  // Step 2 data
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null);
  
  // Step 3 data
  const [step3Data, setStep3Data] = useState({
    password: '',
    confirmPassword: '',
    city: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!step1Data.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!step1Data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(step1Data.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!step1Data.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(step1Data.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!otp.trim()) {
      newErrors.otp = 'Please enter the OTP';
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = 'Please enter a valid 6-digit OTP';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    if (!step3Data.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (step3Data.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!step3Data.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (step3Data.password !== step3Data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!step3Data.city) {
      newErrors.city = 'Please select your city';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = async () => {
    if (!validateStep1()) return;

    setIsLoading(true);
    try {
      const { error, code } = await signupStep1(step1Data);
      if (error) {
        Alert.alert('Error', error.message || 'Failed to send OTP');
      } else {
        setGeneratedOTP(code || null);
        setCurrentStep(2);
        Alert.alert('OTP Sent', 'Please check your email for the 6-digit verification code.' + (code ? ` (Dev: ${code})` : ''));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      const { error } = await signupStep2(step1Data.email, otp);
      if (error) {
        Alert.alert('Error', error.message || 'Invalid OTP');
      } else {
        setCurrentStep(3);
        Alert.alert('Success', 'Email verified successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async () => {
    if (!validateStep3()) return;

    setIsLoading(true);
    try {
      const { error } = await signupStep3({
        email: step1Data.email,
        password: step3Data.password,
        city: step3Data.city,
      });
      
      if (error) {
        console.error('Signup failed:', error);
        Alert.alert('Signup Failed', error.message || 'Something went wrong. Please try again.');
      } else {
        Alert.alert(
          'Success', 
          'Account created successfully! Welcome to Verma and Company.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigation will be handled by the auth context
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,5})(\d{0,5})$/);
    if (match) {
      return !match[2] ? match[1] : `${match[1]} ${match[2]}`;
    }
    return text;
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1 as SignupStep);
      setErrors({});
    } else {
      router.back();
    }
  };

  const selectedCity = CITIES.find(city => city.id === step3Data.city);

  const renderStep1 = () => (
    <View style={styles.formContainer}>
      <View style={styles.stepIndicator}>
        <Text style={styles.stepText}>Step 1 of 3</Text>
        <Text style={styles.stepTitle}>Basic Information</Text>
      </View>

      {/* Name Input */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
          <User size={20} color="#9b9591" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#9b9591"
            value={step1Data.name}
            onChangeText={(text) => {
              setStep1Data(prev => ({ ...prev, name: text }));
              clearError('name');
            }}
            autoCapitalize="words"
            autoComplete="name"
          />
        </View>
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
          <Mail size={20} color="#9b9591" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#9b9591"
            value={step1Data.email}
            onChangeText={(text) => {
              setStep1Data(prev => ({ ...prev, email: text }));
              clearError('email');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
          <Phone size={20} color="#9b9591" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#9b9591"
            value={step1Data.phone}
            onChangeText={(text) => {
              const formatted = formatPhoneNumber(text);
              if (formatted.replace(/\s/g, '').length <= 10) {
                setStep1Data(prev => ({ ...prev, phone: formatted }));
                clearError('phone');
              }
            }}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
        </View>
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleStep1Submit}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Sending OTP...' : 'Send OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.formContainer}>
      <View style={styles.stepIndicator}>
        <Text style={styles.stepText}>Step 2 of 3</Text>
        <Text style={styles.stepTitle}>Verify Email</Text>
      </View>

      <View style={styles.otpDescription}>
        <Text style={styles.otpDescriptionText}>
          We've sent a 6-digit verification code to:
        </Text>
        <Text style={styles.emailText}>{step1Data.email}</Text>
      </View>

      {/* OTP Input */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, errors.otp && styles.inputError]}>
          <Shield size={20} color="#9b9591" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit OTP"
            placeholderTextColor="#9b9591"
            value={otp}
            onChangeText={(text) => {
              if (/^\d{0,6}$/.test(text)) {
                setOtp(text);
                clearError('otp');
              }
            }}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>
        {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
        {generatedOTP && (
          <Text style={styles.otpHint}>
            Demo: Use code {generatedOTP}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleStep2Submit}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={() => {
          setCurrentStep(1);
          setOtp('');
          setGeneratedOTP(null);
        }}
      >
        <Text style={styles.resendButtonText}>Resend OTP</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.formContainer}>
      <View style={styles.stepIndicator}>
        <Text style={styles.stepText}>Step 3 of 3</Text>
        <Text style={styles.stepTitle}>Complete Registration</Text>
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
          <Lock size={20} color="#9b9591" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9b9591"
            value={step3Data.password}
            onChangeText={(text) => {
              setStep3Data(prev => ({ ...prev, password: text }));
              clearError('password');
            }}
            secureTextEntry={!showPassword}
            autoComplete="new-password"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color="#9b9591" />
            ) : (
              <Eye size={20} color="#9b9591" />
            )}
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
          <Lock size={20} color="#9b9591" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#9b9591"
            value={step3Data.confirmPassword}
            onChangeText={(text) => {
              setStep3Data(prev => ({ ...prev, confirmPassword: text }));
              clearError('confirmPassword');
            }}
            secureTextEntry={!showConfirmPassword}
            autoComplete="new-password"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color="#9b9591" />
            ) : (
              <Eye size={20} color="#9b9591" />
            )}
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      {/* City Selection */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.inputWrapper, errors.city && styles.inputError]}
          onPress={() => setShowCityModal(true)}
        >
          <MapPin size={20} color="#9b9591" style={styles.inputIcon} />
          <Text style={[
            styles.cityText,
            !selectedCity && styles.placeholderText
          ]}>
            {selectedCity ? selectedCity.name : 'Select Your City'}
          </Text>
          <ArrowLeft size={16} color="#9b9591" style={styles.dropdownIcon} />
        </TouchableOpacity>
        {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
      </View>

      {/* Terms and Conditions */}
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By creating an account, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleStep3Submit}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={goBack}
              >
                <ArrowLeft size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join Verma and Company. family today</Text>
              </View>

              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* City Selection Modal */}
      <Modal
        visible={showCityModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCityModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Your City</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCityModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cityList}>
            {CITIES.map((city) => (
              <TouchableOpacity
                key={city.id}
                style={[
                  styles.cityOption,
                  step3Data.city === city.id && styles.cityOptionSelected
                ]}
                onPress={() => {
                  setStep3Data(prev => ({ ...prev, city: city.id }));
                  clearError('city');
                  setShowCityModal(false);
                }}
              >
                <MapPin size={20} color={step3Data.city === city.id ? '#c6aa55' : '#9b9591'} />
                <Text style={[
                  styles.cityOptionText,
                  step3Data.city === city.id && styles.cityOptionTextSelected
                ]}>
                  {city.name}
                </Text>
                {step3Data.city === city.id && (
                  <CheckCircle size={20} color="#c6aa55" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2e3f47',
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(231, 224, 208, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#d3bfb3',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  stepIndicator: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#c6aa55',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  otpDescription: {
    alignItems: 'center',
    marginBottom: 24,
  },
  otpDescriptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#d3bfb3',
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#c6aa55',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7e0d0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d3bfb3',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2e3f47',
  },
  inputError: {
    borderColor: '#631e25',
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#631e25',
  },
  otpHint: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#c6aa55',
    marginTop: 4,
    textAlign: 'center',
  },
  cityText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#2e3f47',
  },
  placeholderText: {
    color: '#9b9591',
  },
  dropdownIcon: {
    transform: [{ rotate: '-90deg' }],
  },
  termsContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  termsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#d3bfb3',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#c6aa55',
    fontFamily: 'Inter-SemiBold',
  },
  submitButton: {
    backgroundColor: '#631e25',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  resendButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#c6aa55',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  loginText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#d3bfb3',
  },
  loginLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#c6aa55',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#2e3f47',
  },
  modalCloseButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCloseText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#631e25',
  },
  cityList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  cityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f3f3f3',
  },
  cityOptionSelected: {
    backgroundColor: 'rgba(198, 170, 85, 0.1)',
    borderWidth: 1,
    borderColor: '#c6aa55',
  },
  cityOptionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2e3f47',
    marginLeft: 12,
  },
  cityOptionTextSelected: {
    color: '#c6aa55',
    fontFamily: 'Inter-SemiBold',
  },
});