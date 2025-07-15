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
  { id: 'chandigarh', name: 'Chandigarh' },
  { id: 'mohali', name: 'Mohali' },
  { id: 'panchkula', name: 'Panchkula' },
];

export default function SignupScreen() {
  const { signUp, sendOTP, verifyOTP } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    code: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.city) {
      newErrors.city = 'Please select your city';
    }

    if (!otpVerified) {
      newErrors.code = 'Please verify your email with OTP';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!formData.email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email is required to send OTP' }));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
      return;
    }

    setOtpLoading(true);
    
    try {
      const { error, code } = await sendOTP(formData.email);
      if (error) {
        Alert.alert('Error', error.message || 'Failed to send OTP');
      } else {
        setOtpSent(true);
        setGeneratedOTP(code || null);
        Alert.alert('OTP Sent', 'Please check your email for the 6-digit verification code.' + (code ? ` (Dev: ${code})` : ''));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.code.trim()) {
      setErrors(prev => ({ ...prev, code: 'Please enter the OTP' }));
      return;
    }

    if (!/^\d{6}$/.test(formData.code)) {
      setErrors(prev => ({ ...prev, code: 'Please enter a valid 6-digit OTP' }));
      return;
    }

    try {
      const { error } = await verifyOTP(formData.email, formData.code);
      if (error) {
        Alert.alert('Error', error.message || 'Invalid OTP');
        setErrors(prev => ({ ...prev, code: 'Invalid OTP' }));
      } else {
        setOtpVerified(true);
        setErrors(prev => ({ ...prev, code: '' }));
        Alert.alert('Success', 'Email verified successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    }
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    const { error } = await signUp(
      formData.email, 
      formData.password, 
      formData.name, 
      formData.phone,
      formData.city,
      formData.code
    );
    
    if (error) {
      console.error('Signup failed:', error);
      
      if (error.message?.includes('User already registered')) {
        Alert.alert('Account Exists', 'An account with this email already exists. Please sign in instead.');
      } else if (error.message?.includes('Invalid email')) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else if (error.message?.includes('Password')) {
        Alert.alert('Password Error', 'Password must be at least 6 characters long.');
      } else if (error.message?.includes('verification')) {
        Alert.alert('Verification Error', 'Invalid or expired OTP. Please try again.');
        setOtpVerified(false);
      } else {
        Alert.alert('Signup Failed', error.message || 'Something went wrong. Please try again.');
      }
    } else {
      Alert.alert(
        'Success', 
        'Account created successfully! You can now sign in.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login')
          }
        ]
      );
    }

    setIsLoading(false);
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

  const selectedCity = CITIES.find(city => city.id === formData.city);

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
                onPress={() => router.back()}
              >
                <ArrowLeft size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join Verma and Company. family today</Text>
              </View>

              <View style={styles.formContainer}>
                {/* Name Input */}
                <View style={styles.inputContainer}>
                  <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                    <User size={20} color="#9b9591" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="#9b9591"
                      value={formData.name}
                      onChangeText={(text) => {
                        setFormData(prev => ({ ...prev, name: text }));
                        clearError('name');
                      }}
                      autoCapitalize="words"
                      autoComplete="name"
                    />
                  </View>
                  {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                {/* Phone Input */}
                <View style={styles.inputContainer}>
                  <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
                    <Phone size={20} color="#9b9591" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Phone Number"
                      placeholderTextColor="#9b9591"
                      value={formData.phone}
                      onChangeText={(text) => {
                        const formatted = formatPhoneNumber(text);
                        if (formatted.replace(/\s/g, '').length <= 10) {
                          setFormData(prev => ({ ...prev, phone: formatted }));
                          clearError('phone');
                        }
                      }}
                      keyboardType="phone-pad"
                      autoComplete="tel"
                    />
                  </View>
                  {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                </View>

                {/* Email Input with OTP */}
                <View style={styles.inputContainer}>
                  <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                    <Mail size={20} color="#9b9591" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email Address"
                      placeholderTextColor="#9b9591"
                      value={formData.email}
                      onChangeText={(text) => {
                        setFormData(prev => ({ ...prev, email: text }));
                        clearError('email');
                        setOtpSent(false);
                        setOtpVerified(false);
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                    {otpVerified && (
                      <CheckCircle size={20} color="#c6aa55" style={styles.verifiedIcon} />
                    )}
                  </View>
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                  
                  {/* OTP Button */}
                  <TouchableOpacity
                    style={[
                      styles.otpButton,
                      otpSent && styles.otpButtonSent,
                      otpVerified && styles.otpButtonVerified
                    ]}
                    onPress={handleSendOTP}
                    disabled={otpLoading || otpVerified}
                  >
                    <Shield size={16} color="#ffffff" />
                    <Text style={styles.otpButtonText}>
                      {otpLoading ? 'Sending...' : otpVerified ? 'Verified' : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* OTP Input */}
                {otpSent && !otpVerified && (
                  <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, errors.code && styles.inputError]}>
                      <Shield size={20} color="#9b9591" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter 6-digit OTP"
                        placeholderTextColor="#9b9591"
                        value={formData.code}
                        onChangeText={(text) => {
                          if (/^\d{0,6}$/.test(text)) {
                            setFormData(prev => ({ ...prev, code: text }));
                            clearError('code');
                          }
                        }}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                      <TouchableOpacity
                        style={styles.verifyButton}
                        onPress={handleVerifyOTP}
                      >
                        <Text style={styles.verifyButtonText}>Verify</Text>
                      </TouchableOpacity>
                    </View>
                    {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
                    <Text style={styles.otpHint}>
                      {generatedOTP ? `Demo: Use code ${generatedOTP}` : 'Demo: Use any 6-digit code'}
                    </Text>
                  </View>
                )}

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

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                    <Lock size={20} color="#9b9591" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#9b9591"
                      value={formData.password}
                      onChangeText={(text) => {
                        setFormData(prev => ({ ...prev, password: text }));
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
                      value={formData.confirmPassword}
                      onChangeText={(text) => {
                        setFormData(prev => ({ ...prev, confirmPassword: text }));
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

                {/* Terms and Conditions */}
                <View style={styles.termsContainer}>
                  <Text style={styles.termsText}>
                    By creating an account, you agree to our{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text>
                    {' '}and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </View>

                {/* Signup Button */}
                <TouchableOpacity
                  style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
                  onPress={handleSignup}
                  disabled={isLoading}
                >
                  <Text style={styles.signupButtonText}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => router.push('/auth/login')}>
                    <Text style={styles.loginLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
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
                  formData.city === city.id && styles.cityOptionSelected
                ]}
                onPress={() => {
                  setFormData(prev => ({ ...prev, city: city.id }));
                  clearError('city');
                  setShowCityModal(false);
                }}
              >
                <MapPin size={20} color={formData.city === city.id ? '#c6aa55' : '#9b9591'} />
                <Text style={[
                  styles.cityOptionText,
                  formData.city === city.id && styles.cityOptionTextSelected
                ]}>
                  {city.name}
                </Text>
                {formData.city === city.id && (
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
  verifiedIcon: {
    marginLeft: 8,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#631e25',
  },
  otpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#631e25',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  otpButtonSent: {
    backgroundColor: '#c6aa55',
  },
  otpButtonVerified: {
    backgroundColor: '#10B981',
  },
  otpButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 6,
  },
  verifyButton: {
    backgroundColor: '#c6aa55',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  verifyButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
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
  signupButton: {
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
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
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