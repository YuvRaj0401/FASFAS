// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8080/api',
  ENDPOINTS: {
    PHONE_OTP_REQUEST: '/brand/otp/phone/request/',
    PHONE_OTP_VERIFY: '/brand/otp/phone/verify/', 
    EMAIL_OTP_REQUEST: '/brand/otp/email/request/',
    EMAIL_OTP_VERIFY: '/brand/otp/email/verify/',
  },
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

// API Response Types
export interface EmailOtpResponse {
  success: boolean;
  message: string;
}

export interface EmailOtpVerifyResponse {
  success: boolean;
  message: string;
  is_new_user: boolean;
  user_id: number;
}

export interface PhoneOtpResponse {
  success: boolean;
  message: string;
}

export interface PhoneOtpVerifyResponse {
  success: boolean;
  message: string;
  is_new_user: boolean;
  user_id: number;
}

// API helper functions
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      ...API_CONFIG.HEADERS,
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Phone OTP API functions
export const phoneOtpAPI = {
  sendOTP: async (phoneNumber: string): Promise<PhoneOtpResponse> => {
    return apiRequest(API_CONFIG.ENDPOINTS.PHONE_OTP_REQUEST, {
      method: 'POST',
      body: JSON.stringify({
        phone_number: phoneNumber
      }),
    });
  },
  
  verifyOTP: async (phoneNumber: string, otpCode: string): Promise<PhoneOtpVerifyResponse> => {
    return apiRequest(API_CONFIG.ENDPOINTS.PHONE_OTP_VERIFY, {
      method: 'POST',
      body: JSON.stringify({
        phone_number: phoneNumber,
        otp_code: otpCode
      }),
    });
  }
};

// Email OTP API functions
export const emailOtpAPI = {
  sendOTP: async (email: string, phoneNumber: string): Promise<EmailOtpResponse> => {
    return apiRequest(API_CONFIG.ENDPOINTS.EMAIL_OTP_REQUEST, {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        phone_number: phoneNumber
      }),
    });
  },

  verifyOTP: async (email: string, phoneNumber: string, otpCode: string): Promise<EmailOtpVerifyResponse> => {
    return apiRequest(API_CONFIG.ENDPOINTS.EMAIL_OTP_VERIFY, {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        phone_number: phoneNumber,
        otp_code: otpCode
      }),
    });
  }
};