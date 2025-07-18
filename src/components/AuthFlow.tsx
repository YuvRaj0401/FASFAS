import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navbar from './Navbar';
import BusinessOnboardingForm from './ContactForm';
import './AuthFlow.css';

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

  // Handle mobile number submission
  const handleMobileSubmit = async (data: { mobile: string }) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAuthData(prev => ({ ...prev, mobile: data.mobile }));
      setCurrentStep('mobileOtp');
      setOtpTimer(30);
      setIsLoading(false);
      startOtpTimer();
    }, 1500);
  };

  // Handle mobile OTP verification
  const handleMobileOtpSubmit = async (data: { mobileOtp: string }) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCurrentStep('email');
      setIsLoading(false);
    }, 1500);
  };

  // Handle email submission
  const handleEmailSubmit = async (data: { email: string }) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAuthData(prev => ({ ...prev, email: data.email }));
      setCurrentStep('emailOtp');
      setOtpTimer(30);
      setIsLoading(false);
      startOtpTimer();
    }, 1500);
  };

  // Handle email OTP verification
  const handleEmailOtpSubmit = async (data: { emailOtp: string }) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCurrentStep('password');
      setIsLoading(false);
    }, 1500);
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

  // Start OTP timer
  const startOtpTimer = () => {
    const timer = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Resend OTP
  const handleResendOtp = () => {
    setOtpTimer(30);
    startOtpTimer();
    // Simulate resend API call
    console.log('Resending OTP...');
  };

  // If authentication is completed, show the main form
  if (currentStep === 'completed') {
    return <BusinessOnboardingForm />;
  }

  const getStepNumber = (): number => {
    const stepMap = {
      mobile: 1,
      mobileOtp: 2,
      email: 3,
      emailOtp: 4,
      password: 5
    };
    return stepMap[currentStep];
  };

  const getStepTitle = (): string => {
    const titleMap = {
      mobile: 'Verify Mobile Number',
      mobileOtp: 'Enter Mobile OTP',
      email: 'Verify Email Address',
      emailOtp: 'Enter Email OTP',
      password: 'Set Your Password'
    };
    return titleMap[currentStep];
  };

  const getStepDescription = (): string => {
    const descMap = {
      mobile: 'Enter your mobile number to receive a verification code',
      mobileOtp: `We've sent a 6-digit code to ${authData.mobile}`,
      email: 'Enter your email address to receive a verification code',
      emailOtp: `We've sent a 6-digit code to ${authData.email}`,
      password: 'Create a secure password for your account'
    };
    return descMap[currentStep];
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="main-content">
        <div className="auth-container">
          <div className="auth-card">
            {/* Progress indicator */}
            <div className="auth-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(getStepNumber() / 5) * 100}%` }}
                />
              </div>
              <div className="progress-text">
                Step {getStepNumber()} of 5
              </div>
            </div>

            {/* Header */}
            <div className="auth-header">
              <h1>{getStepTitle()}</h1>
              <p>{getStepDescription()}</p>
            </div>

            {/* Content */}
            <div className="auth-content">
              {currentStep === 'mobile' && (
                <form onSubmit={mobileForm.handleSubmit(handleMobileSubmit)} className="auth-form">
                  <div className="form-field-container">
                    <label className="auth-label">
                      MOBILE NUMBER
                      <span className="required-indicator">*</span>
                    </label>
                    <div className="mobile-input-container">
                      <span className="country-code">+91</span>
                      <input
                        type="tel"
                        className="auth-input"
                        {...mobileForm.register('mobile')}
                        placeholder="Enter your mobile number"
                        maxLength={10}
                      />
                    </div>
                    {mobileForm.formState.errors.mobile && (
                      <span className="error-message">
                        {mobileForm.formState.errors.mobile.message}
                      </span>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    className="auth-btn primary"
                    disabled={isLoading || !mobileForm.formState.isValid}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner"></span>
                        Sending OTP...
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </form>
              )}

              {currentStep === 'mobileOtp' && (
                <form onSubmit={mobileOtpForm.handleSubmit(handleMobileOtpSubmit)} className="auth-form">
                  <div className="form-field-container">
                    <label className="auth-label">
                      ENTER OTP
                      <span className="required-indicator">*</span>
                    </label>
                    <input
                      type="text"
                      className="auth-input otp-input"
                      {...mobileOtpForm.register('mobileOtp')}
                      placeholder="000000"
                      maxLength={6}
                    />
                    {mobileOtpForm.formState.errors.mobileOtp && (
                      <span className="error-message">
                        {mobileOtpForm.formState.errors.mobileOtp.message}
                      </span>
                    )}
                  </div>

                  <div className="otp-footer">
                    {otpTimer > 0 ? (
                      <p className="timer-text">
                        Resend OTP in {otpTimer}s
                      </p>
                    ) : (
                      <button 
                        type="button" 
                        className="auth-btn secondary"
                        onClick={handleResendOtp}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    className="auth-btn primary"
                    disabled={isLoading || !mobileOtpForm.formState.isValid}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner"></span>
                        Verifying...
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>
                </form>
              )}

              {currentStep === 'email' && (
                <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="auth-form">
                  <div className="form-field-container">
                    <label className="auth-label">
                      EMAIL ADDRESS
                      <span className="required-indicator">*</span>
                    </label>
                    <input
                      type="email"
                      className="auth-input"
                      {...emailForm.register('email')}
                      placeholder="Enter your email address"
                    />
                    {emailForm.formState.errors.email && (
                      <span className="error-message">
                        {emailForm.formState.errors.email.message}
                      </span>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    className="auth-btn primary"
                    disabled={isLoading || !emailForm.formState.isValid}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner"></span>
                        Sending OTP...
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </form>
              )}

              {currentStep === 'emailOtp' && (
                <form onSubmit={emailOtpForm.handleSubmit(handleEmailOtpSubmit)} className="auth-form">
                  <div className="form-field-container">
                    <label className="auth-label">
                      ENTER OTP
                      <span className="required-indicator">*</span>
                    </label>
                    <input
                      type="text"
                      className="auth-input otp-input"
                      {...emailOtpForm.register('emailOtp')}
                      placeholder="000000"
                      maxLength={6}
                    />
                    {emailOtpForm.formState.errors.emailOtp && (
                      <span className="error-message">
                        {emailOtpForm.formState.errors.emailOtp.message}
                      </span>
                    )}
                  </div>

                  <div className="otp-footer">
                    {otpTimer > 0 ? (
                      <p className="timer-text">
                        Resend OTP in {otpTimer}s
                      </p>
                    ) : (
                      <button 
                        type="button" 
                        className="auth-btn secondary"
                        onClick={handleResendOtp}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    className="auth-btn primary"
                    disabled={isLoading || !emailOtpForm.formState.isValid}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner"></span>
                        Verifying...
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>
                </form>
              )}

              {currentStep === 'password' && (
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="auth-form">
                  <div className="form-field-container">
                    <label className="auth-label">
                      PASSWORD
                      <span className="required-indicator">*</span>
                    </label>
                    <input
                      type="password"
                      className="auth-input"
                      {...passwordForm.register('password')}
                      placeholder="Enter your password"
                    />
                    {passwordForm.formState.errors.password && (
                      <span className="error-message">
                        {passwordForm.formState.errors.password.message}
                      </span>
                    )}
                  </div>

                  <div className="form-field-container">
                    <label className="auth-label">
                      CONFIRM PASSWORD
                      <span className="required-indicator">*</span>
                    </label>
                    <input
                      type="password"
                      className="auth-input"
                      {...passwordForm.register('confirmPassword')}
                      placeholder="Confirm your password"
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <span className="error-message">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </span>
                    )}
                  </div>

                  <div className="password-requirements">
                    <h4>Password Requirements:</h4>
                    <ul>
                      <li>At least 8 characters long</li>
                      <li>One uppercase letter (A-Z)</li>
                      <li>One lowercase letter (a-z)</li>
                      <li>One number (0-9)</li>
                      <li>One special character (@$!%*?&)</li>
                    </ul>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="auth-btn primary"
                    disabled={isLoading || !passwordForm.formState.isValid}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner"></span>
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Back button */}
            {getStepNumber() > 1 && (
              <div className="auth-footer">
                <button 
                  type="button" 
                  className="auth-btn secondary"
                  onClick={() => {
                    const prevSteps: AuthStep[] = ['mobile', 'mobileOtp', 'email', 'emailOtp', 'password'];
                    const currentIndex = prevSteps.indexOf(currentStep);
                    if (currentIndex > 0) {
                      setCurrentStep(prevSteps[currentIndex - 1]);
                    }
                  }}
                >
                  ← Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;
