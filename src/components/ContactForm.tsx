import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navbar from './Navbar';
import './ContactForm.css';

// Business onboarding form schema
const formSchema = z.object({
  // Step 1: GSTIN Verification
  gstin: z
    .string()
    .min(1, 'GSTIN is required'),
  
  // Step 2: Personal & Company Details
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  contactNumber: z
    .string()
    .min(1, 'Contact number is required'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  companyName: z
    .string()
    .min(1, 'Company name is required'),
  companyType: z
    .string()
    .min(1, 'Please select company type'),
  companyAddress: z
    .string()
    .min(1, 'Company address is required'),
  
  // Step 3: Document Upload
  signature: z
    .any()
    .optional(),
  
  // Step 4: Business Preferences
  businessType: z
    .string()
    .min(1, 'Please select business type'),
  businessDescription: z
    .string()
    .min(1, 'Business description is required'),
  
  // Step 5: Warehouse Details
  warehouseAddress: z
    .string()
    .min(1, 'Warehouse address is required'),
  warehouseCity: z
    .string()
    .min(1, 'City is required'),
  warehouseState: z
    .string()
    .min(1, 'State is required'),
  warehousePincode: z
    .string()
    .min(1, 'Pincode is required')
    .regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  warehouseArea: z
    .string()
    .min(1, 'Warehouse area is required'),
  
  // Step 6: Brand & Product Details
  productCategory: z
    .string()
    .min(1, 'Please select product category'),
  
  // Step 7: Bank Details
  accountHolderName: z
    .string()
    .min(1, 'Account holder name is required'),
  accountNumber: z
    .string()
    .min(1, 'Account number is required'),
  ifsc: z
    .string()
    .min(1, 'IFSC code is required'),
  
  // Step 8: Review
  review: z
    .boolean()
    .optional()
});

type FormData = z.infer<typeof formSchema>;
type StepKey = keyof FormData;

const BusinessOnboardingForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<StepKey>('gstin');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange'
  });

  // Define the order of steps with step names for easier navigation
  const stepOrder: { key: StepKey; name: string }[] = [
    { key: 'gstin', name: 'Gstin Check' },
    { key: 'fullName', name: 'Basic Information' },
    { key: 'signature', name: 'Document Upload' },
    { key: 'businessType', name: 'Business Details' },
    { key: 'warehouseAddress', name: 'Warehouse Details' },
    { key: 'productCategory', name: 'Brand Details' },
    { key: 'accountHolderName', name: 'Bank Details' },
    { key: 'review', name: 'Declaration' }
  ];

  const currentStepIndex = stepOrder.findIndex(step => step.key === currentStep);
  const isLastStep = currentStepIndex === stepOrder.length - 1;

  const handleStepClick = (stepKey: StepKey) => {
    const targetStepIndex = stepOrder.findIndex(step => step.key === stepKey);
    const currentIndex = stepOrder.findIndex(step => step.key === currentStep);
    
    // Allow navigation to current step, previous steps, or next step if current is valid
    if (targetStepIndex <= currentIndex || (targetStepIndex === currentIndex + 1 && isStepValid(currentStep))) {
      // Mark current step as completed if moving forward
      if (targetStepIndex > currentIndex) {
        setCompletedSteps(prev => new Set(prev).add(currentStep));
      }
      
      setCurrentStep(stepKey);
      
      // Add selection animation
      setTimeout(() => {
        const stepElement = document.querySelector(`[data-step-id="${stepKey}"]`);
        if (stepElement) {
          stepElement.classList.add('selecting');
          setTimeout(() => {
            stepElement.classList.remove('selecting');
          }, 300);
        }
      }, 50);
    }
  };
  const isStepValid = (stepKey: StepKey): boolean => {
    const values = watch();
    
    switch (stepKey) {
      case 'gstin':
        return !!values.gstin;
      case 'fullName':
        return !!(values.fullName && values.email && values.companyName && values.contactNumber);
      case 'signature':
        return true; // Optional step
      case 'businessType':
        return !!(values.businessType && values.businessDescription);
      case 'warehouseAddress':
        return !!(values.warehouseAddress && values.warehouseCity && values.warehouseState && values.warehousePincode && values.warehouseArea);
      case 'productCategory':
        return !!values.productCategory;
      case 'accountHolderName':
        return !!(values.accountHolderName && values.accountNumber && values.ifsc);
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const getStepStatus = (stepKey: StepKey): 'pending' | 'active' | 'completed' | 'disabled' => {
    const stepIndex = stepOrder.findIndex(step => step.key === stepKey);
    const currentIndex = stepOrder.findIndex(step => step.key === currentStep);
    
    if (stepKey === currentStep) {
      return 'active';
    }
    
    if (completedSteps.has(stepKey)) {
      return 'completed';
    }
    
    // Disable steps that are too far ahead
    if (stepIndex > currentIndex + 1) {
      return 'disabled';
    }
    
    return 'pending';
  };

  const getCompletionPercentage = (): number => {
    return Math.round((completedSteps.size / stepOrder.length) * 100);
  };

  const getStepTitle = (step: StepKey) => {
    const stepInfo = stepOrder.find(s => s.key === step);
    return stepInfo?.name || 'Business Onboarding';
  };

  const getStepDescription = (step: StepKey) => {
    const descriptions: Record<string, string> = {
      'gstin': 'Please enter your GST Identification Number.',
      'fullName': 'Provide your personal details and company information',
      'signature': 'Upload required documents for verification',
      'businessType': 'Tell us about your business model and preferences',
      'warehouseAddress': 'Provide details about your warehouse and storage',
      'productCategory': 'Share information about your brand and products',
      'accountHolderName': 'Enter your bank details for payments and verification',
      'review': 'Review all your information before submitting'
    };
    return descriptions[step as string] || 'Complete your business onboarding';
  };
  // Function to render step content
  const renderStepContent = () => {
    switch (currentStep) {      case 'gstin':
        return (
          <div className="multi-field-step">
            <div className="form-field-container">
              <label className="form-field-label">
                GSTIN DETAILS
                <span className="required-indicator">*</span>
              </label>
              <input
                type="text"
                className="form-field-input"
                {...register('gstin')}
                placeholder="Enter your GST Number"
                maxLength={15}
              />
              {errors.gstin && (
                <span className="error-message">{errors.gstin.message}</span>
              )}
            </div>
            <div className="form-note">
              <div className="note-icon">ℹ</div>
              <div>
                Note - Based on this entry, some of the details in the form will be automatically filled.
              </div>
            </div>
          </div>
        );        case 'fullName':
        return (
          <div className="multi-field-step">
            <h3 className="section-title">Contact Information</h3>
            
            <div className="form-grid-2">
              <div className="form-field-container">
                <label className="form-field-label">
                  PRIMARY CONTACT'S FULL NAME
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="text"
                  className="form-field-input"
                  {...register('fullName')}
                  placeholder="Enter full name"
                />
                {errors.fullName && (
                  <span className="error-message">{errors.fullName.message}</span>
                )}
              </div>
              
              <div className="form-field-container">
                <label className="form-field-label">
                  PRIMARY CONTACT PHONE NUMBER
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="tel"
                  className="form-field-input"
                  {...register('contactNumber')}
                  placeholder="Enter your contact number"
                />
                {errors.contactNumber && (
                  <span className="error-message">{errors.contactNumber.message}</span>
                )}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field-container">
                <label className="form-field-label">
                  PRIMARY CONTACT'S EMAIL ID
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="email"
                  className="form-field-input"
                  {...register('email')}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <span className="error-message">{errors.email.message}</span>
                )}
              </div>
            </div>

            <h3 className="section-title">Company Information</h3>
            
            <div className="form-grid-3">
              <div className="form-field-container">
                <label className="form-field-label">
                  BUSINESS OWNER'S NAME
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="text"
                  className="form-field-input"
                  {...register('companyName')}
                  placeholder="Enter business owner's name"
                />
                {errors.companyName && (
                  <span className="error-message">{errors.companyName.message}</span>
                )}
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  OWNER'S CONTACT NUMBER
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="tel"
                  className="form-field-input"
                  placeholder="Enter owner's contact number"
                />
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  OWNER'S EMAIL ID
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="email"
                  className="form-field-input"
                  placeholder="Enter owner's email ID"
                />
              </div>
            </div>

            <div className="form-grid-4">
              <div className="form-field-container">
                <label className="form-field-label">
                  ARE YOU AN EXISTING MYNTRA PARTNER?
                  <span className="info-icon">ℹ</span>
                </label>
                <select
                  className="form-field-input"
                  {...register('companyType')}
                >
                  <option value="">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  ENTITY TYPE
                </label>
                <select
                  className="form-field-input"
                >
                  <option value="">PROPRIETORSHIP</option>
                  <option value="private-limited">Private Limited</option>
                  <option value="llp">Limited Liability Partnership</option>
                  <option value="partnership">Partnership</option>
                  <option value="public-limited">Public Limited</option>
                </select>
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  MYNTRA GENERATED INVOICE
                  <span className="info-icon">ℹ</span>
                </label>
                <select
                  className="form-field-input"
                >
                  <option value="">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  SIGNATURE
                  <span className="info-icon">ℹ</span>
                </label>
                <div className="file-upload-container">
                  <button type="button" className="file-upload-btn">
                    BROWSE
                  </button>
                  <span className="file-upload-text">Choose a file...</span>
                </div>
              </div>
            </div>

            <div className="form-field-container full-width">
              <label className="form-field-label">
                COMPANY ADDRESS
                <span className="required-indicator">*</span>
              </label>
              <textarea
                className="form-field-input"
                {...register('companyAddress')}
                placeholder="Enter your company address"
                rows={3}
              />
              {errors.companyAddress && (
                <span className="error-message">{errors.companyAddress.message}</span>
              )}
            </div>
          </div>
        );case 'signature':
        return (
          <div className="multi-field-step">
            <h3 className="section-title">Document Upload</h3>
            <div className="form-field-container">
              <label className="form-field-label">
                SIGNATURE
                <span className="info-icon">ℹ</span>
              </label>
              <div className="file-upload-container">
                <input
                  type="file"
                  className="hidden-file-input"
                  {...register('signature')}
                  accept=".png,.jpg,.jpeg,.pdf"
                  id="signature-upload"
                />
                <label htmlFor="signature-upload" className="file-upload-btn">
                  BROWSE
                </label>
                <span className="file-upload-text">Choose a file...</span>
              </div>
              {errors.signature && (
                <span className="error-message">{String(errors.signature.message)}</span>
              )}
              <div className="help-text">
                Upload a clear image of your signature (PNG, JPG, PDF only)
              </div>
            </div>
          </div>
        );      case 'businessType':
        return (
          <div className="multi-field-step">
            <h3 className="section-title">Business Details</h3>
            
            <div className="form-grid-2">
              <div className="form-field-container">
                <label className="form-field-label">
                  BUSINESS TYPE
                  <span className="required-indicator">*</span>
                </label>
                <select
                  className="form-field-input"
                  {...register('businessType')}
                >
                  <option value="">Select business type</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="distributor">Distributor</option>
                  <option value="retailer">Retailer</option>
                  <option value="wholesaler">Wholesaler</option>
                  <option value="service-provider">Service Provider</option>
                </select>
                {errors.businessType && (
                  <span className="error-message">{errors.businessType.message}</span>
                )}
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  YEARS IN BUSINESS
                  <span className="info-icon">ℹ</span>
                </label>
                <select
                  className="form-field-input"
                >
                  <option value="">Select years</option>
                  <option value="0-1">0-1 years</option>
                  <option value="2-5">2-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
            </div>

            <div className="form-field-container full-width">
              <label className="form-field-label">
                BUSINESS DESCRIPTION
                <span className="required-indicator">*</span>
              </label>
              <textarea
                className="form-field-input"
                {...register('businessDescription')}
                placeholder="Describe your business, products, and services"
                rows={4}
              />
              {errors.businessDescription && (
                <span className="error-message">{errors.businessDescription.message}</span>
              )}
            </div>

            <h3 className="section-title">Products & Categories</h3>

            <div className="form-grid-2">
              <div className="form-field-container">
                <label className="form-field-label">
                  PRIMARY PRODUCT CATEGORY
                  <span className="required-indicator">*</span>
                </label>
                <select
                  className="form-field-input"
                >
                  <option value="">Select category</option>
                  <option value="fashion">Fashion & Apparel</option>
                  <option value="electronics">Electronics</option>
                  <option value="home">Home & Kitchen</option>
                  <option value="beauty">Beauty & Personal Care</option>
                  <option value="health">Health & Wellness</option>
                  <option value="sports">Sports & Fitness</option>
                </select>
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  ESTIMATED MONTHLY ORDERS
                  <span className="info-icon">ℹ</span>
                </label>
                <select
                  className="form-field-input"
                >
                  <option value="">Select range</option>
                  <option value="0-100">0-100</option>
                  <option value="100-500">100-500</option>
                  <option value="500-1000">500-1000</option>
                  <option value="1000+">1000+</option>
                </select>
              </div>
            </div>
          </div>
        );      
        case 'warehouseAddress':
        return (
          <div className="multi-field-step">
            <h3 className="section-title">Warehouse Information</h3>
            
            <div className="form-grid-2">
              <div className="form-field-container">
                <label className="form-field-label">
                  WAREHOUSE AREA (SQ FT)
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="number"
                  className="form-field-input"
                  {...register('warehouseArea')}
                  placeholder="Enter warehouse area in sq ft"
                  min="1"
                />
                {errors.warehouseArea && (
                  <span className="error-message">{errors.warehouseArea.message}</span>
                )}
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  STORAGE TYPE
                  <span className="info-icon">ℹ</span>
                </label>
                <select
                  className="form-field-input"
                >
                  <option value="">Select storage type</option>
                  <option value="ambient">Ambient Storage</option>
                  <option value="cold">Cold Storage</option>
                  <option value="frozen">Frozen Storage</option>
                  <option value="mixed">Mixed Storage</option>
                </select>
              </div>
            </div>

            <h3 className="section-title">Warehouse Address</h3>

            <div className="form-field-container full-width">
              <label className="form-field-label">
                STREET ADDRESS
                <span className="required-indicator">*</span>
              </label>
              <textarea
                className="form-field-input"
                {...register('warehouseAddress')}
                placeholder="Enter building number, street name, area/locality"
                rows={2}
              />
              {errors.warehouseAddress && (
                <span className="error-message">{errors.warehouseAddress.message}</span>
              )}
            </div>

            <div className="form-grid-3">
              <div className="form-field-container">
                <label className="form-field-label">
                  CITY
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="text"
                  className="form-field-input"
                  {...register('warehouseCity')}
                  placeholder="Enter city"
                />
                {errors.warehouseCity && (
                  <span className="error-message">{errors.warehouseCity.message}</span>
                )}
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  STATE
                  <span className="required-indicator">*</span>
                </label>
                <select
                  className="form-field-input"
                  {...register('warehouseState')}
                >
                  <option value="">Select state</option>
                  <option value="andhra-pradesh">Andhra Pradesh</option>
                  <option value="arunachal-pradesh">Arunachal Pradesh</option>
                  <option value="assam">Assam</option>
                  <option value="bihar">Bihar</option>
                  <option value="chhattisgarh">Chhattisgarh</option>
                  <option value="goa">Goa</option>
                  <option value="gujarat">Gujarat</option>
                  <option value="haryana">Haryana</option>
                  <option value="himachal-pradesh">Himachal Pradesh</option>
                  <option value="jharkhand">Jharkhand</option>
                  <option value="karnataka">Karnataka</option>
                  <option value="kerala">Kerala</option>
                  <option value="madhya-pradesh">Madhya Pradesh</option>
                  <option value="maharashtra">Maharashtra</option>
                  <option value="manipur">Manipur</option>
                  <option value="meghalaya">Meghalaya</option>
                  <option value="mizoram">Mizoram</option>
                  <option value="nagaland">Nagaland</option>
                  <option value="odisha">Odisha</option>
                  <option value="punjab">Punjab</option>
                  <option value="rajasthan">Rajasthan</option>
                  <option value="sikkim">Sikkim</option>
                  <option value="tamil-nadu">Tamil Nadu</option>
                  <option value="telangana">Telangana</option>
                  <option value="tripura">Tripura</option>
                  <option value="uttar-pradesh">Uttar Pradesh</option>
                  <option value="uttarakhand">Uttarakhand</option>
                  <option value="west-bengal">West Bengal</option>
                  <option value="delhi">Delhi</option>
                  <option value="chandigarh">Chandigarh</option>
                  <option value="puducherry">Puducherry</option>
                </select>
                {errors.warehouseState && (
                  <span className="error-message">{errors.warehouseState.message}</span>
                )}
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  PINCODE
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="text"
                  className="form-field-input"
                  {...register('warehousePincode')}
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                />
                {errors.warehousePincode && (
                  <span className="error-message">{errors.warehousePincode.message}</span>
                )}
              </div>
            </div>

            <h3 className="section-title">Logistics & Operations</h3>

            <div className="form-grid-3">
              <div className="form-field-container">
                <label className="form-field-label">
                  OPERATIONAL HOURS
                  <span className="info-icon">ℹ</span>
                </label>
                <select
                  className="form-field-input"
                >
                  <option value="">Select hours</option>
                  <option value="8-hours">8 Hours/Day</option>
                  <option value="12-hours">12 Hours/Day</option>
                  <option value="24-hours">24 Hours/Day</option>
                  <option value="custom">Custom Hours</option>
                </select>
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  STAFF COUNT
                  <span className="info-icon">ℹ</span>
                </label>
                <input
                  type="number"
                  className="form-field-input"
                  placeholder="Number of staff"
                  min="1"
                />
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  LOGISTICS PARTNER
                  <span className="info-icon">ℹ</span>
                </label>
                <select
                  className="form-field-input"
                >
                  <option value="">Select partner</option>
                  <option value="self">Self Managed</option>
                  <option value="third-party">Third Party</option>
                  <option value="myntra">Myntra Logistics</option>
                </select>
              </div>
            </div>
          </div>
        );      case 'productCategory':
        return (
          <div className="multi-field-step">
            <h3 className="section-title">Product & Brand Information</h3>
            
            <div className="form-grid-2">
              <div className="form-field-container">
                <label className="form-field-label">
                  PRIMARY PRODUCT CATEGORY
                  <span className="required-indicator">*</span>
                </label>
                <select
                  className="form-field-input"
                  {...register('productCategory')}
                >
                  <option value="">Select product category</option>
                  <option value="fashion">Fashion & Apparel</option>
                  <option value="electronics">Electronics</option>
                  <option value="home">Home & Kitchen</option>
                  <option value="beauty">Beauty & Personal Care</option>
                  <option value="health">Health & Wellness</option>
                  <option value="sports">Sports & Fitness</option>
                  <option value="food">Food & Beverages</option>
                </select>
                {errors.productCategory && (
                  <span className="error-message">{errors.productCategory.message}</span>
                )}
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  BRAND TYPE
                  <span className="info-icon">ℹ</span>
                </label>
                <select
                  className="form-field-input"
                >
                  <option value="">Select brand type</option>
                  <option value="own-brand">Own Brand</option>
                  <option value="private-label">Private Label</option>
                  <option value="authorized-retailer">Authorized Retailer</option>
                  <option value="distributor">Distributor</option>
                </select>
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-field-container">
                <label className="form-field-label">
                  BRAND NAME
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="text"
                  className="form-field-input"
                  placeholder="Enter brand name"
                />
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  NUMBER OF PRODUCTS
                  <span className="info-icon">ℹ</span>
                </label>
                <select
                  className="form-field-input"
                >
                  <option value="">Select range</option>
                  <option value="1-50">1-50 Products</option>
                  <option value="51-200">51-200 Products</option>
                  <option value="201-500">201-500 Products</option>
                  <option value="500+">500+ Products</option>
                </select>
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  AVERAGE PRODUCT PRICE
                  <span className="info-icon">ℹ</span>
                </label>
                <select
                  className="form-field-input"
                >
                  <option value="">Select range</option>
                  <option value="0-500">₹0-500</option>
                  <option value="500-2000">₹500-2000</option>
                  <option value="2000-5000">₹2000-5000</option>
                  <option value="5000+">₹5000+</option>
                </select>
              </div>
            </div>

            <h3 className="section-title">Compliance & Certifications</h3>

            <div className="form-grid-2">
              <div className="form-field-container">
                <label className="form-field-label">
                  BIS CERTIFICATION
                  <span className="info-icon">ℹ</span>
                </label>
                <select
                  className="form-field-input"
                >
                  <option value="">Not Required</option>
                  <option value="yes">Yes, Have BIS</option>
                  <option value="no">No, but Required</option>
                </select>
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  FSSAI LICENSE
                  <span className="info-icon">ℹ</span>
                </label>
                <select
                  className="form-field-input"
                >
                  <option value="">Not Required</option>
                  <option value="yes">Yes, Have FSSAI</option>
                  <option value="no">No, but Required</option>
                </select>
              </div>
            </div>
          </div>
        );      case 'accountHolderName':
        return (
          <div className="multi-field-step">
            <h3 className="section-title">Bank Account Details</h3>
            
            <div className="form-grid-2">
              <div className="form-field-container">
                <label className="form-field-label">
                  ACCOUNT HOLDER NAME
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="text"
                  className="form-field-input"
                  {...register('accountHolderName')}
                  placeholder="Enter account holder name"
                />
                {errors.accountHolderName && (
                  <span className="error-message">{errors.accountHolderName.message}</span>
                )}
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  BANK NAME
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="text"
                  className="form-field-input"
                  placeholder="Enter bank name"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field-container">
                <label className="form-field-label">
                  ACCOUNT NUMBER
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="text"
                  className="form-field-input"
                  {...register('accountNumber')}
                  placeholder="Enter bank account number"
                />
                {errors.accountNumber && (
                  <span className="error-message">{errors.accountNumber.message}</span>
                )}
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  CONFIRM ACCOUNT NUMBER
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="text"
                  className="form-field-input"
                  placeholder="Re-enter account number"
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-field-container">
                <label className="form-field-label">
                  IFSC CODE
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="text"
                  className="form-field-input"
                  {...register('ifsc')}
                  placeholder="Enter IFSC code"
                  maxLength={11}
                />
                {errors.ifsc && (
                  <span className="error-message">{errors.ifsc.message}</span>
                )}
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  ACCOUNT TYPE
                  <span className="info-icon">ℹ</span>
                </label>
                <select
                  className="form-field-input"
                >
                  <option value="">Select account type</option>
                  <option value="savings">Savings Account</option>
                  <option value="current">Current Account</option>
                  <option value="business">Business Account</option>
                </select>
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  BRANCH NAME
                  <span className="info-icon">ℹ</span>
                </label>
                <input
                  type="text"
                  className="form-field-input"
                  placeholder="Enter branch name"
                />
              </div>
            </div>

            <h3 className="section-title">Supporting Documents</h3>

            <div className="form-grid-2">
              <div className="form-field-container">
                <label className="form-field-label">
                  CANCELLED CHEQUE
                  <span className="required-indicator">*</span>
                </label>
                <div className="file-upload-container">
                  <button type="button" className="file-upload-btn">
                    BROWSE
                  </button>
                  <span className="file-upload-text">Upload cancelled cheque</span>
                </div>
              </div>

              <div className="form-field-container">
                <label className="form-field-label">
                  BANK STATEMENT
                  <span className="info-icon">ℹ</span>
                </label>
                <div className="file-upload-container">
                  <button type="button" className="file-upload-btn">
                    BROWSE
                  </button>
                  <span className="file-upload-text">Upload bank statement (optional)</span>
                </div>
              </div>
            </div>
          </div>
        );      case 'review':
        return (
          <div className="multi-field-step">
            <h3 className="section-title">Declaration & Terms</h3>
            
            <div className="declaration-content">
              <div className="declaration-section">
                <h4>Review Your Application</h4>
                <p>Please review all the information you've provided before submitting your application. Ensure all details are accurate and complete.</p>
              </div>

              <div className="declaration-section">
                <h4>Terms & Conditions</h4>
                <div className="terms-list">
                  <div className="form-field-container">
                    <label className="form-field-label checkbox-label">
                      <input
                        type="checkbox"
                        {...register('review')}
                        className="checkbox-input"
                      />
                      I confirm that all information provided is accurate and complete
                      <span className="required-indicator">*</span>
                    </label>
                  </div>
                  
                  <div className="form-field-container">
                    <label className="form-field-label checkbox-label">
                      <input
                        type="checkbox"
                        className="checkbox-input"
                      />
                      I agree to Myntra's Terms & Conditions and Privacy Policy
                      <span className="required-indicator">*</span>
                    </label>
                  </div>

                  <div className="form-field-container">
                    <label className="form-field-label checkbox-label">
                      <input
                        type="checkbox"
                        className="checkbox-input"
                      />
                      I understand that providing false information may result in application rejection
                      <span className="required-indicator">*</span>
                    </label>
                  </div>

                  <div className="form-field-container">
                    <label className="form-field-label checkbox-label">
                      <input
                        type="checkbox"
                        className="checkbox-input"
                      />
                      I authorize Myntra to verify the provided information with relevant authorities
                    </label>
                  </div>
                </div>
              </div>

              <div className="declaration-section">
                <h4>Next Steps</h4>
                <ul className="next-steps-list">
                  <li>Application will be reviewed within 3-5 business days</li>
                  <li>You will receive email updates on application status</li>
                  <li>Additional documents may be requested if needed</li>
                  <li>Account activation upon successful verification</li>
                </ul>
              </div>

              {errors.review && (
                <span className="error-message">{String(errors.review.message)}</span>
              )}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="form-field-container">
            <div className="form-step-description">
              This step is under construction. Please use the navigation to move between steps.
            </div>
          </div>
        );
    }
  };

  // Submit handler
  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    setIsSubmitted(true);
  };  if (isSubmitted) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="main-content">
          <div className="form-container">
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Thank you!</h2>
              <p>Your application has been submitted successfully. We'll get back to you soon!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="main-content">
        <div className="form-container">
      <div className="form-sidebar">
        <div className="form-header">
          <h1>📋 Partner Portal</h1>
          <div className="completion-text">
            {getCompletionPercentage()}% Complete
          </div>
        </div>
        
        <div className="navigation-steps">
          {stepOrder.map((step, index) => {
            const status = getStepStatus(step.key);
            const isRequired = ['gstin', 'fullName', 'businessType', 'accountHolderName'].includes(step.key);
            
            return (
              <div
                key={step.key}
                className={`step-item ${status} ${isRequired ? 'required' : ''}`}
                data-step-id={step.key}
                onClick={() => handleStepClick(step.key)}
                tabIndex={status !== 'disabled' ? 0 : -1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleStepClick(step.key);
                  }
                }}
              >                <div className="step-icon" data-step={index + 1}>
                  {status === 'completed' && '✓'}
                  {(status === 'active' || status === 'pending') && (index + 1)}
                </div>
                <div className="step-content">
                  <div className="step-title">{step.name}</div>
                  <div className="step-description">{getStepDescription(step.key)}</div>
                  {isRequired && status === 'pending' && (
                    <div className="step-requirements">Required</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="form-main">
        <div className="form-wrapper">
          <div className="form-content">
            <div className="form-step-header">
              <h2>{getStepTitle(currentStep)}</h2>
              <div className="form-step-description">
                {getStepDescription(currentStep)}
              </div>
            </div>
            
            <form className="contact-form" onSubmit={handleSubmit(onSubmit)}>
              {renderStepContent()}
              
              <div className="form-bottom-actions">
                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    className="form-verify-btn"
                    onClick={() => handleStepClick(stepOrder[currentStepIndex - 1].key)}
                  >
                    PREVIOUS
                  </button>
                )}
                
                {!isLastStep ? (
                  <button
                    type="button"
                    className={`form-next-btn ${isStepValid(currentStep) ? 'active' : ''}`}
                    onClick={() => {
                      if (isStepValid(currentStep)) {
                        handleStepClick(stepOrder[currentStepIndex + 1].key);
                      }
                    }}
                    disabled={!isStepValid(currentStep)}
                  >
                    CONFIRM & NEXT
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="form-next-btn active"
                  >
                    SUBMIT
                  </button>                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
  );
};

export default BusinessOnboardingForm;
