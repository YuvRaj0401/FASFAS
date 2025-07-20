import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navbar from './Navbar_Tailwind';
import BusinessOnboardingForm from './ContactForm_Tailwind';
import { phoneOtpAPI, emailOtpAPI } from '../config/api';

// Step 1: Mobile verification schema
const mobileSchema = z.object({
  mobile: z
    .string()
    .min(1, 'Mobile number is required')
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number')
});

// Step 2: Mobile OTP verification schema
const mobileOtpSchema = z.object({
  mobileOtp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers')
});

// Step 3: Email verification schema
const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
});

// Step 4: Email OTP verification schema
const emailOtpSchema = z.object({
  emailOtp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers')
});

// Step 5: Password setup schema
const passwordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthStep = 'mobile' | 'mobileOtp' | 'email' | 'emailOtp' | 'password' | 'completed';

interface AuthData {
  mobile: string;
  email: string;
  password: string;
  userId?: number;
  isNewUser?: boolean;
}

const AuthFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('mobile');
  const [authData, setAuthData] = useState<Partial<AuthData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Form hooks for each step
  const mobileForm = useForm({
    resolver: zodResolver(mobileSchema),
    mode: 'onChange'
  });

  const mobileOtpForm = useForm({
    resolver: zodResolver(mobileOtpSchema),
    mode: 'onChange'
  });

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    mode: 'onChange'
  });

  const emailOtpForm = useForm({
    resolver: zodResolver(emailOtpSchema),
    mode: 'onChange'
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange'
  });

  // OTP Timer
  const startOtpTimer = () => {
    const timer = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle mobile number submission
  const handleMobileSubmit = async (data: { mobile: string }) => {

    //TODO
    //CHECK FOR NEW USER TUTORIAL SCREENS
    
    setIsLoading(true);
    
    try {
      const result = await phoneOtpAPI.sendOTP(data.mobile);
      
      if (result.success) {
        // API call successful - OTP sent
        setAuthData(prev => ({ ...prev, mobile: data.mobile }));
        setCurrentStep('mobileOtp');
        setOtpTimer(30);
        startOtpTimer();
      } else {
        // API returned success: false
        alert(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      // Network error or other exceptions
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP. Please check your phone number and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mobile OTP verification
  const handleMobileOtpSubmit = async (data: { mobileOtp: string }) => {
    setIsLoading(true);
    
    try {
      const result = await phoneOtpAPI.verifyOTP(authData.mobile!, data.mobileOtp);
      
      if (result.success) {
        // OTP verification successful
        setAuthData(prev => ({
          ...prev,
          userId: result.user_id,
          isNewUser: result.is_new_user
        }));
        
        setCurrentStep('email');
        
        // Log verification result for debugging
        console.log('Phone verification successful:', {
          isNewUser: result.is_new_user,
          userId: result.user_id,
          message: result.message
        });
      } else {
        // OTP verification failed
        alert(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      // Network error or other exceptions
      console.error('Error verifying OTP:', error);
      alert('Failed to verify OTP. Please check your code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email submission
  const handleEmailSubmit = async (data: { email: string }) => {
    setIsLoading(true);

    try {
      const result = await emailOtpAPI.sendOTP(data.email, authData.mobile!);

      if (result.success) {
        // API call successful - OTP sent
        setAuthData(prev => ({ ...prev, email: data.email }));
        setCurrentStep('emailOtp');
        setOtpTimer(30);
        startOtpTimer();
      } else {
        // API returned success: false
        alert(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      // Network error or other exceptions
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP. Please check your email and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email OTP verification
  const handleEmailOtpSubmit = async (data: { emailOtp: string }) => {
    setIsLoading(true);

    try {
      const result = await emailOtpAPI.verifyOTP(authData.email!, authData.mobile!, data.emailOtp);

      if (result.success) {
        // OTP verification successful
        setAuthData(prev => ({
          ...prev,
          userId: result.user_id,
          isNewUser: result.is_new_user
        }));

        setCurrentStep('password');

        // Log verification result for debugging
        console.log('Email verification successful:', {
          isNewUser: result.is_new_user,
          userId: result.user_id,
          message: result.message
        });
      } else {
        // OTP verification failed
        alert(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      // Network error or other exceptions
      console.error('Error verifying OTP:', error);
      alert('Failed to verify OTP. Please check your code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password setup
  const handlePasswordSubmit = async (data: { password: string; confirmPassword: string }) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAuthData(prev => ({ ...prev, password: data.password }));
      setCurrentStep('completed');
      setIsLoading(false);
    }, 1500);
  };

  // Resend OTP
  const resendOtp = async () => {
    if (currentStep === 'mobileOtp' && authData.mobile) {
      setIsLoading(true);
      
      try {
        const result = await phoneOtpAPI.sendOTP(authData.mobile);
        
        if (result.success) {
          // OTP resent successfully
          setOtpTimer(30);
          startOtpTimer();
        } else {
          alert(result.message || 'Failed to resend OTP. Please try again.');
        }
      } catch (error) {
        console.error('Error resending OTP:', error);
        alert('Failed to resend OTP. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // For email OTP resend or other cases
      setOtpTimer(30);
      startOtpTimer();
    }
  };

  // Get progress percentage
  const getProgress = () => {
    const steps = ['mobile', 'mobileOtp', 'email', 'emailOtp', 'password', 'completed'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  // If auth is completed, show the business onboarding form
  if (currentStep === 'completed') {
    return <BusinessOnboardingForm />;
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'mobile':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Mobile Number</h2>
              <p className="text-gray-600">Enter your mobile number to get started</p>
            </div>

            <form onSubmit={mobileForm.handleSubmit(handleMobileSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">+91</span>
                  </div>
                  <input
                    {...mobileForm.register('mobile')}
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                {mobileForm.formState.errors.mobile && (
                  <p className="text-red-500 text-sm mt-1">{mobileForm.formState.errors.mobile.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !mobileForm.formState.isValid}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          </div>
        );

      case 'mobileOtp':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h2>
              <p className="text-gray-600">Enter the 6-digit code sent to</p>
              <p className="text-primary-600 font-semibold">+91 {authData.mobile}</p>
            </div>

            <form onSubmit={mobileOtpForm.handleSubmit(handleMobileOtpSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OTP Code
                </label>
                <input
                  {...mobileOtpForm.register('mobileOtp')}
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest"
                />
                {mobileOtpForm.formState.errors.mobileOtp && (
                  <p className="text-red-500 text-sm mt-1">{mobileOtpForm.formState.errors.mobileOtp.message}</p>
                )}
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Didn\'t receive OTP?'}
                </span>
                {otpTimer === 0 && (
                  <button
                    type="button"
                    onClick={resendOtp}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !mobileOtpForm.formState.isValid}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Verify OTP'
                )}
              </button>
            </form>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verification</h2>
              <p className="text-gray-600">Enter your email address for verification</p>
            </div>

            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  {...emailForm.register('email')}
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
                {emailForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{emailForm.formState.errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !emailForm.formState.isValid}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Send Verification Email'
                )}
              </button>
            </form>
          </div>
        );

      case 'emailOtp':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Email</h2>
              <p className="text-gray-600">Enter the verification code sent to</p>
              <p className="text-primary-600 font-semibold">{authData.email}</p>
            </div>

            <form onSubmit={emailOtpForm.handleSubmit(handleEmailOtpSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  {...emailOtpForm.register('emailOtp')}
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest"
                />
                {emailOtpForm.formState.errors.emailOtp && (
                  <p className="text-red-500 text-sm mt-1">{emailOtpForm.formState.errors.emailOtp.message}</p>
                )}
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {otpTimer > 0 ? `Resend code in ${otpTimer}s` : 'Didn\'t receive code?'}
                </span>
                {otpTimer === 0 && (
                  <button
                    type="button"
                    onClick={resendOtp}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !emailOtpForm.formState.isValid}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Verify Email'
                )}
              </button>
            </form>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Password</h2>
              <p className="text-gray-600">Set up a secure password for your account</p>
            </div>

            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  {...passwordForm.register('password')}
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
                {passwordForm.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">{passwordForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  {...passwordForm.register('confirmPassword')}
                  type="password"
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Password requirements:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Contains at least one number</li>
                  <li>• Contains at least one special character (@$!%*?&)</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isLoading || !passwordForm.formState.isValid}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="min-h-[calc(100vh-70px)] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${getProgress()}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Step {['mobile', 'mobileOtp', 'email', 'emailOtp', 'password'].indexOf(currentStep) + 1} of 5</span>
                <span>{Math.round(getProgress())}% Complete</span>
              </div>
            </div>

            {/* Step Content */}
            <div className="animate-fade-in">
              {renderStepContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;
