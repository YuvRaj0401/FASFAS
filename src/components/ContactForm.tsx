import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import './ContactForm.css';

// Business onboarding form schema
const formSchema = z.object({
  // Step 1: GSTIN Verification
  gstin: z
    .string()
    .min(1, 'GSTIN is required'),
    // .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GSTIN'),
  
  // Step 2: Personal & Company Details
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  contactNumber: z
    .string()
    .min(1, 'Contact number is required'),
    // .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .min(2, 'Company name must be at least 2 characters'),
  companyType: z
    .string()
    .min(1, 'Please select company type'),
  companyAddress: z
    .string()
    .min(1, 'Company address is required')
    .min(10, 'Please enter a complete address'),
  
  // Step 3: Document Upload
  signature: z
    .any()
    .optional(),
  tanNumber: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/.test(val);
    }, 'Please enter a valid TAN number'),
  
  // Step 4: Business Preferences
  businessType: z
    .string()
    .min(1, 'Please select business type'),
  annualTurnover: z
    .string()
    .min(1, 'Please select annual turnover'),
  businessModel: z
    .string()
    .min(1, 'Please select business model'),
  businessDescription: z
    .string()
    .min(1, 'Business description is required')
    .min(10, 'Please provide a detailed description (at least 10 characters)'),
  
  // Step 5: Warehouse Details
  warehouseAddress: z
    .string()
    .min(1, 'Warehouse address is required'),
  warehouseArea: z
    .string()
    .min(1, 'Warehouse area is required'),
  storageCapacity: z
    .string()
    .min(1, 'Please select storage capacity'),
  warehouseCities: z
    .string()
    .min(1, 'Warehouse city(s) is required'),
  numberOfWarehouses: z
    .string()
    .min(1, 'Number of warehouses is required'),
  dailyOrderVolume: z
    .string()
    .min(1, 'Daily order volume is required'),
  
  // Step 6: Brand & Product Details
  brandLogo: z
    .any()
    .optional(),
  productCategory: z
    .string()
    .min(1, 'Please select product category'),
  gender: z
    .string()
    .min(1, 'Please select target gender'),
  targetAgeGroup: z
    .string()
    .min(1, 'Please select target age group'),
  priceRange: z
    .string()
    .min(1, 'Please select price range'),
  brandDeck: z
    .any()
    .optional(),
  
  // Step 7: Bank Details
  accountHolderName: z
    .string()
    .min(1, 'Account holder name is required'),
  accountNumber: z
    .string()
    .min(1, 'Account number is required')
    .regex(/^[0-9]{9,18}$/, 'Please enter a valid account number'),
  ifsc: z
    .string()
    .min(1, 'IFSC code is required')
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code'),
  cancelledCheque: z
    .any()
    .optional(),
  microDepositAmount: z
    .string()
    .optional(),
  
  // Step 8: Review
  review: z
    .boolean()
    .optional()
});

type FormData = z.infer<typeof formSchema>;
type StepKey = keyof FormData;

const BusinessOnboardingForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<StepKey>('gstin');
  const [formData, setFormData] = useState<FormData>({
    // Step 1: GSTIN Verification
    gstin: '',
    
    // Step 2: Personal & Company Details
    fullName: '',
    contactNumber: '',
    email: '',
    companyName: '',
    companyType: '',
    companyAddress: '',
    
    // Step 3: Document Upload
    signature: undefined,
    tanNumber: '',
    
    // Step 4: Business Preferences
    businessType: '',
    annualTurnover: '',
    businessModel: '',
    businessDescription: '',
    
    // Step 5: Warehouse Details
    warehouseAddress: '',
    warehouseArea: '',
    storageCapacity: '',
    warehouseCities: '',
    numberOfWarehouses: '',
    dailyOrderVolume: '',
    
    // Step 6: Brand & Product Details
    brandLogo: undefined,
    productCategory: '',
    gender: '',
    targetAgeGroup: '',
    priceRange: '',
    brandDeck: undefined,
    
    // Step 7: Bank Details
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    cancelledCheque: undefined,
    microDepositAmount: '',
    
    // Step 8: Review
    review: false
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Define the order of steps with step names for easier navigation
  const stepOrder: { key: StepKey; name: string }[] = [
    { key: 'gstin', name: 'GSTIN Verification' },
    { key: 'fullName', name: 'Personal & Company Details' },
    { key: 'signature', name: 'Document Upload' },
    { key: 'businessType', name: 'Business Preferences' },
    { key: 'warehouseAddress', name: 'Warehouse Details' },
    { key: 'brandLogo', name: 'Brand & Product Details' },
    { key: 'accountHolderName', name: 'Bank Details & Verification' },
    { key: 'review', name: 'Final Review' }
  ];
  
  const currentStepIndex = stepOrder.findIndex(step => step.key === currentStep);
  const isLastStep = currentStepIndex === stepOrder.length - 1;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    trigger
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: formData
  });

  // Watch current field value
  const currentValue = watch(currentStep);

  // Contact number formatting function
  const formatContactNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`;
    } else if (phoneNumber.length <= 10) {
      return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6)}`;
    }
    return phoneNumber.slice(0, 10);
  };

  const handleContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatContactNumber(value);
    setValue('contactNumber', formatted);
  };

  const validateCurrentStep = async () => {
    // For multi-field steps, we'll handle validation differently
    const stepFields = getStepFields(currentStep);
    
    try {
      for (const field of stepFields) {
        const isValid = await trigger(field);
        if (!isValid) return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  // Get the fields that belong to each step
  const getStepFields = (step: StepKey): StepKey[] => {
    switch (step) {
      case 'gstin':
        return ['gstin'];
      case 'fullName':
        return ['fullName', 'contactNumber', 'email', 'companyName', 'companyType', 'companyAddress'];
      case 'signature':
        return ['signature', 'tanNumber'];
      case 'businessType':
        return ['businessType', 'annualTurnover', 'businessModel', 'businessDescription'];
      case 'warehouseAddress':
        return ['warehouseAddress', 'warehouseArea', 'storageCapacity', 'warehouseCities', 'numberOfWarehouses', 'dailyOrderVolume'];
      case 'brandLogo':
        return ['brandLogo', 'productCategory', 'gender', 'targetAgeGroup', 'priceRange', 'brandDeck'];
      case 'accountHolderName':
        return ['accountHolderName', 'accountNumber', 'ifsc', 'cancelledCheque', 'microDepositAmount'];
      case 'review':
        return ['review'];
      default:
        return [step];
    }
  };

  const onStepSubmit = async (data: FormData) => {
    // Update form data with current step data
    const updatedFormData = { ...formData, ...data };
    setFormData(updatedFormData);

    if (isLastStep) {
      // Final submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Business onboarding submitted:', updatedFormData);
      setIsSubmitted(true);
      
      // Reset after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          gstin: '',
          fullName: '',
          contactNumber: '',
          email: '',
          companyName: '',
          companyType: '',
          companyAddress: '',
          signature: undefined,
          tanNumber: '',
          businessType: '',
          annualTurnover: '',
          businessModel: '',
          businessDescription: '',
          warehouseAddress: '',
          warehouseArea: '',
          storageCapacity: '',
          warehouseCities: '',
          numberOfWarehouses: '',
          dailyOrderVolume: '',
          brandLogo: undefined,
          productCategory: '',
          gender: '',
          targetAgeGroup: '',
          priceRange: '',
          brandDeck: undefined,
          accountHolderName: '',
          accountNumber: '',
          ifsc: '',
          cancelledCheque: undefined,
          microDepositAmount: '',
          review: false
        });
        setCurrentStep('gstin');
        reset();
      }, 5000);
    } else {
      // Move to next step
      const nextStepIndex = currentStepIndex + 1;
      const nextStep = stepOrder[nextStepIndex];
      setCurrentStep(nextStep.key);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      const prevStep = stepOrder[currentStepIndex - 1];
      setCurrentStep(prevStep.key);
    }
  };

  const skipStep = () => {
    if (currentStep === 'tanNumber' || currentStep === 'microDepositAmount') {
      const nextStepIndex = currentStepIndex + 1;
      const nextStep = stepOrder[nextStepIndex];
      setCurrentStep(nextStep.key);
    }
  };

  const getStepTitle = (step: StepKey) => {
    const titles: Record<string, string> = {
      'gstin': 'GSTIN Verification',
      'fullName': 'Personal & Company Details',
      'signature': 'Document Upload',
      'businessType': 'Business Preferences',
      'warehouseAddress': 'Warehouse Details',
      'brandLogo': 'Brand & Product Details',
      'accountHolderName': 'Bank Details & Verification',
      'review': 'Final Review & Submit'
    };
    return titles[step as string] || 'Business Onboarding';
  };

  const getStepDescription = (step: StepKey) => {
    const descriptions: Record<string, string> = {
      'gstin': 'Enter your company\'s GSTIN number to verify your business',
      'fullName': 'Provide your personal details and company information',
      'signature': 'Upload required documents for verification',
      'businessType': 'Tell us about your business model and preferences',
      'warehouseAddress': 'Provide details about your warehouse and storage',
      'brandLogo': 'Share information about your brand and products',
      'accountHolderName': 'Enter your bank details for payments and verification',
      'review': 'Review all your information before submitting'
    };
    return descriptions[step as string] || 'Complete your business onboarding';
  };

  if (isSubmitted) {
    return (
      <div className="form-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Thank you!</h2>
          <p>Your message has been sent successfully. We'll get back to you soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <div className="step-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStepIndex + 1) / stepOrder.length) * 100}%` }}
            />
          </div>
          <span className="step-counter">
            Step {currentStepIndex + 1} of {stepOrder.length}
          </span>
        </div>

        <h2>{getStepTitle(currentStep)}</h2>
        <p className="form-description">{getStepDescription(currentStep)}</p>
        
        <form className="contact-form step-form">
          <div className="step-field">
            {/* Step 1: GSTIN Verification */}
            {currentStep === 'gstin' && (
              <div className="form-group">
                <input
                  type="text"
                  id="gstin"
                  {...register('gstin')}
                  placeholder="Enter your GSTIN (e.g., 07AABCS1234C1Z5)"
                  className={errors.gstin ? 'error' : ''}
                  autoFocus
                  maxLength={15}
                />
                {errors.gstin && (
                  <span className="error-message">{errors.gstin.message}</span>
                )}
                <small className="help-text">
                  15-character GSTIN number as per your GST certificate
                </small>
              </div>
            )}

            {/* Step 2: Personal & Company Details */}
            {currentStep === 'fullName' && (
              <div className="multi-field-step">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    {...register('fullName')}
                    placeholder="Enter your full name"
                    className={errors.fullName ? 'error' : ''}
                    autoFocus
                  />
                  {errors.fullName && (
                    <span className="error-message">{errors.fullName.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="contactNumber">Contact Number *</label>
                  <input
                    type="tel"
                    id="contactNumber"
                    {...register('contactNumber')}
                    onChange={handleContactNumberChange}
                    placeholder="Enter 10-digit mobile number"
                    className={errors.contactNumber ? 'error' : ''}
                    maxLength={12}
                  />
                  {errors.contactNumber && (
                    <span className="error-message">{errors.contactNumber.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    {...register('email')}
                    placeholder="Enter your business email"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && (
                    <span className="error-message">{errors.email.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="companyName">Company Name *</label>
                  <input
                    type="text"
                    id="companyName"
                    {...register('companyName')}
                    placeholder="Enter your company name"
                    className={errors.companyName ? 'error' : ''}
                  />
                  {errors.companyName && (
                    <span className="error-message">{errors.companyName.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="companyType">Company Type *</label>
                  <select
                    id="companyType"
                    {...register('companyType')}
                    className={errors.companyType ? 'error' : ''}
                  >
                    <option value="">Select company type</option>
                    <option value="private_limited">Private Limited</option>
                    <option value="public_limited">Public Limited</option>
                    <option value="partnership">Partnership</option>
                    <option value="llp">Limited Liability Partnership (LLP)</option>
                    <option value="sole_proprietorship">Sole Proprietorship</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.companyType && (
                    <span className="error-message">{errors.companyType.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="companyAddress">Company Address *</label>
                  <textarea
                    id="companyAddress"
                    {...register('companyAddress')}
                    rows={3}
                    placeholder="Enter your complete company address"
                    className={errors.companyAddress ? 'error' : ''}
                  />
                  {errors.companyAddress && (
                    <span className="error-message">{errors.companyAddress.message}</span>
                  )}
                </div>
              </div>
            )}

            {/* Continue with other steps - this is just a sample to show the structure */}
            {currentStep === 'signature' && (
              <div className="form-group">
                <label htmlFor="signature">Digital Signature</label>
                <input
                  type="file"
                  id="signature"
                  {...register('signature')}
                  accept="image/*,.pdf"
                  className={errors.signature ? 'error' : ''}
                />
                {errors.signature && (
                  <span className="error-message">{errors.signature.message as string}</span>
                )}
                <small className="help-text">
                  Upload your digital signature (PNG, JPG, PDF)
                </small>
              </div>
            )}

            {/* Step 4: Business Preferences */}
            {currentStep === 'businessType' && (
              <div className="multi-field-step">
                <div className="form-group">
                  <label htmlFor="businessType">Business Type *</label>
                  <select
                    id="businessType"
                    {...register('businessType')}
                    className={errors.businessType ? 'error' : ''}
                    autoFocus
                  >
                    <option value="">Select business type</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="services">Services</option>
                    <option value="distribution">Distribution</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.businessType && (
                    <span className="error-message">{errors.businessType.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="annualTurnover">Annual Turnover *</label>
                  <select
                    id="annualTurnover"
                    {...register('annualTurnover')}
                    className={errors.annualTurnover ? 'error' : ''}
                  >
                    <option value="">Select annual turnover</option>
                    <option value="below_1cr">Below ₹1 Crore</option>
                    <option value="1_5cr">₹1 - ₹5 Crores</option>
                    <option value="5_10cr">₹5 - ₹10 Crores</option>
                    <option value="10_25cr">₹10 - ₹25 Crores</option>
                    <option value="25_50cr">₹25 - ₹50 Crores</option>
                    <option value="above_50cr">Above ₹50 Crores</option>
                  </select>
                  {errors.annualTurnover && (
                    <span className="error-message">{errors.annualTurnover.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="businessModel">Business Model *</label>
                  <select
                    id="businessModel"
                    {...register('businessModel')}
                    className={errors.businessModel ? 'error' : ''}
                  >
                    <option value="">Select business model</option>
                    <option value="b2b">B2B (Business to Business)</option>
                    <option value="b2c">B2C (Business to Consumer)</option>
                    <option value="b2b2c">B2B2C (Business to Business to Consumer)</option>
                    <option value="marketplace">Marketplace</option>
                    <option value="subscription">Subscription</option>
                    <option value="franchise">Franchise</option>
                  </select>
                  {errors.businessModel && (
                    <span className="error-message">{errors.businessModel.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="businessDescription">Business Description *</label>
                  <textarea
                    id="businessDescription"
                    {...register('businessDescription')}
                    rows={4}
                    placeholder="Describe your business, products, and services in detail..."
                    className={errors.businessDescription ? 'error' : ''}
                  />
                  {errors.businessDescription && (
                    <span className="error-message">{errors.businessDescription.message}</span>
                  )}
                  <small className="help-text">
                    Provide a detailed description of your business, target market, and key products/services
                  </small>
                </div>
              </div>
            )}

            {/* Step 5: Warehouse Details */}
            {currentStep === 'warehouseAddress' && (
              <div className="multi-field-step">
                <div className="form-group">
                  <label htmlFor="warehouseAddress">Warehouse Address *</label>
                  <textarea
                    id="warehouseAddress"
                    {...register('warehouseAddress')}
                    rows={3}
                    placeholder="Enter your warehouse address"
                    className={errors.warehouseAddress ? 'error' : ''}
                    autoFocus
                  />
                  {errors.warehouseAddress && (
                    <span className="error-message">{errors.warehouseAddress.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="warehouseArea">Warehouse Area *</label>
                  <input
                    type="text"
                    id="warehouseArea"
                    {...register('warehouseArea')}
                    placeholder="e.g., 5000 sq ft"
                    className={errors.warehouseArea ? 'error' : ''}
                  />
                  {errors.warehouseArea && (
                    <span className="error-message">{errors.warehouseArea.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="storageCapacity">Storage Capacity *</label>
                  <select
                    id="storageCapacity"
                    {...register('storageCapacity')}
                    className={errors.storageCapacity ? 'error' : ''}
                  >
                    <option value="">Select storage capacity</option>
                    <option value="below_1000">Below 1,000 units</option>
                    <option value="1000_5000">1,000 - 5,000 units</option>
                    <option value="5000_10000">5,000 - 10,000 units</option>
                    <option value="10000_25000">10,000 - 25,000 units</option>
                    <option value="25000_50000">25,000 - 50,000 units</option>
                    <option value="above_50000">Above 50,000 units</option>
                  </select>
                  {errors.storageCapacity && (
                    <span className="error-message">{errors.storageCapacity.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="warehouseCities">Warehouse City(s) *</label>
                  <input
                    type="text"
                    id="warehouseCities"
                    {...register('warehouseCities')}
                    placeholder="e.g., Mumbai, Delhi, Bangalore"
                    className={errors.warehouseCities ? 'error' : ''}
                  />
                  {errors.warehouseCities && (
                    <span className="error-message">{errors.warehouseCities.message}</span>
                  )}
                  <small className="help-text">
                    List all cities where you have warehouses (separate multiple cities with commas)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="numberOfWarehouses">Number of Warehouses *</label>
                  <select
                    id="numberOfWarehouses"
                    {...register('numberOfWarehouses')}
                    className={errors.numberOfWarehouses ? 'error' : ''}
                  >
                    <option value="">Select number of warehouses</option>
                    <option value="1">1 Warehouse</option>
                    <option value="2-3">2-3 Warehouses</option>
                    <option value="4-5">4-5 Warehouses</option>
                    <option value="6-10">6-10 Warehouses</option>
                    <option value="11-20">11-20 Warehouses</option>
                    <option value="above_20">Above 20 Warehouses</option>
                  </select>
                  {errors.numberOfWarehouses && (
                    <span className="error-message">{errors.numberOfWarehouses.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="dailyOrderVolume">Daily Order Volume *</label>
                  <select
                    id="dailyOrderVolume"
                    {...register('dailyOrderVolume')}
                    className={errors.dailyOrderVolume ? 'error' : ''}
                  >
                    <option value="">Select daily order volume</option>
                    <option value="below_10">Below 10 orders</option>
                    <option value="10_50">10 - 50 orders</option>
                    <option value="50_100">50 - 100 orders</option>
                    <option value="100_500">100 - 500 orders</option>
                    <option value="500_1000">500 - 1,000 orders</option>
                    <option value="1000_5000">1,000 - 5,000 orders</option>
                    <option value="above_5000">Above 5,000 orders</option>
                  </select>
                  {errors.dailyOrderVolume && (
                    <span className="error-message">{errors.dailyOrderVolume.message}</span>
                  )}
                  <small className="help-text">
                    Average number of orders processed per day
                  </small>
                </div>
              </div>
            )}

            {/* Step 6: Brand & Product Details */}
            {currentStep === 'brandLogo' && (
              <div className="multi-field-step">
                <div className="form-group">
                  <label htmlFor="brandLogo">Brand Logo</label>
                  <input
                    type="file"
                    id="brandLogo"
                    {...register('brandLogo')}
                    accept="image/*"
                    className={errors.brandLogo ? 'error' : ''}
                    autoFocus
                  />
                  {errors.brandLogo && (
                    <span className="error-message">{errors.brandLogo.message as string}</span>
                  )}
                  <small className="help-text">
                    Upload your brand logo (PNG, JPG, JPEG - max 5MB)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="productCategory">Product Category *</label>
                  <select
                    id="productCategory"
                    {...register('productCategory')}
                    className={errors.productCategory ? 'error' : ''}
                  >
                    <option value="">Select product category</option>
                    <option value="apparel_fashion">Apparel & Fashion</option>
                    <option value="electronics_tech">Electronics & Technology</option>
                    <option value="home_living">Home & Living</option>
                    <option value="beauty_personal_care">Beauty & Personal Care</option>
                    <option value="sports_fitness">Sports & Fitness</option>
                    <option value="books_media">Books & Media</option>
                    <option value="toys_games">Toys & Games</option>
                    <option value="automotive">Automotive</option>
                    <option value="health_wellness">Health & Wellness</option>
                    <option value="food_beverages">Food & Beverages</option>
                    <option value="jewelry_accessories">Jewelry & Accessories</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.productCategory && (
                    <span className="error-message">{errors.productCategory.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Target Gender *</label>
                  <select
                    id="gender"
                    {...register('gender')}
                    className={errors.gender ? 'error' : ''}
                  >
                    <option value="">Select target gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unisex">Unisex</option>
                    <option value="kids">Kids</option>
                    <option value="all">All Genders</option>
                  </select>
                  {errors.gender && (
                    <span className="error-message">{errors.gender.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="targetAgeGroup">Target Age Group *</label>
                  <select
                    id="targetAgeGroup"
                    {...register('targetAgeGroup')}
                    className={errors.targetAgeGroup ? 'error' : ''}
                  >
                    <option value="">Select target age group</option>
                    <option value="0_12">Kids (0-12 years)</option>
                    <option value="13_17">Teens (13-17 years)</option>
                    <option value="18_25">Young Adults (18-25 years)</option>
                    <option value="26_35">Adults (26-35 years)</option>
                    <option value="36_45">Middle-aged (36-45 years)</option>
                    <option value="46_60">Mature (46-60 years)</option>
                    <option value="60_plus">Seniors (60+ years)</option>
                    <option value="all_ages">All Ages</option>
                  </select>
                  {errors.targetAgeGroup && (
                    <span className="error-message">{errors.targetAgeGroup.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="priceRange">Price Range *</label>
                  <select
                    id="priceRange"
                    {...register('priceRange')}
                    className={errors.priceRange ? 'error' : ''}
                  >
                    <option value="">Select price range</option>
                    <option value="budget">Budget (₹0 - ₹500)</option>
                    <option value="affordable">Affordable (₹500 - ₹1,500)</option>
                    <option value="mid_range">Mid-range (₹1,500 - ₹5,000)</option>
                    <option value="premium">Premium (₹5,000 - ₹15,000)</option>
                    <option value="luxury">Luxury (₹15,000 - ₹50,000)</option>
                    <option value="ultra_luxury">Ultra Luxury (₹50,000+)</option>
                  </select>
                  {errors.priceRange && (
                    <span className="error-message">{errors.priceRange.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="brandDeck">Brand Deck / Catalog</label>
                  <input
                    type="file"
                    id="brandDeck"
                    {...register('brandDeck')}
                    accept=".pdf,.ppt,.pptx,.doc,.docx"
                    className={errors.brandDeck ? 'error' : ''}
                  />
                  {errors.brandDeck && (
                    <span className="error-message">{errors.brandDeck.message as string}</span>
                  )}
                  <small className="help-text">
                    Upload your brand deck or product catalog (PDF, PPT, DOC - max 10MB)
                  </small>
                </div>
              </div>
            )}

            {/* Step 7: Bank Details & Verification */}
            {currentStep === 'accountHolderName' && (
              <div className="multi-field-step">
                <div className="form-group">
                  <label htmlFor="accountHolderName">Account Holder Name *</label>
                  <input
                    type="text"
                    id="accountHolderName"
                    {...register('accountHolderName')}
                    placeholder="Enter account holder name as per bank records"
                    className={errors.accountHolderName ? 'error' : ''}
                    autoFocus
                  />
                  {errors.accountHolderName && (
                    <span className="error-message">{errors.accountHolderName.message}</span>
                  )}
                  <small className="help-text">
                    Name should match exactly with your bank account records
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="accountNumber">Account Number *</label>
                  <input
                    type="text"
                    id="accountNumber"
                    {...register('accountNumber')}
                    placeholder="Enter your bank account number"
                    className={errors.accountNumber ? 'error' : ''}
                    maxLength={18}
                  />
                  {errors.accountNumber && (
                    <span className="error-message">{errors.accountNumber.message}</span>
                  )}
                  <small className="help-text">
                    Enter 9-18 digit bank account number
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="ifsc">IFSC Code *</label>
                  <input
                    type="text"
                    id="ifsc"
                    {...register('ifsc')}
                    placeholder="e.g., HDFC0000123"
                    className={errors.ifsc ? 'error' : ''}
                    maxLength={11}
                    style={{ textTransform: 'uppercase' }}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                    }}
                  />
                  {errors.ifsc && (
                    <span className="error-message">{errors.ifsc.message}</span>
                  )}
                  <small className="help-text">
                    11-character IFSC code of your bank branch
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="cancelledCheque">Cancelled Cheque</label>
                  <input
                    type="file"
                    id="cancelledCheque"
                    {...register('cancelledCheque')}
                    accept="image/*,.pdf"
                    className={errors.cancelledCheque ? 'error' : ''}
                  />
                  {errors.cancelledCheque && (
                    <span className="error-message">{errors.cancelledCheque.message as string}</span>
                  )}
                  <small className="help-text">
                    Upload a clear image or PDF of your cancelled cheque for verification
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="microDepositAmount">Micro Deposit Amount (for verification)</label>
                  <input
                    type="text"
                    id="microDepositAmount"
                    {...register('microDepositAmount')}
                    placeholder="Enter amount if you received a micro deposit"
                    className={errors.microDepositAmount ? 'error' : ''}
                  />
                  {errors.microDepositAmount && (
                    <span className="error-message">{errors.microDepositAmount.message}</span>
                  )}
                  <small className="help-text">
                    If we sent a small verification amount to your account, enter it here (optional)
                  </small>
                </div>

                <div className="verification-info">
                  <div className="info-box">
                    <h4>🔒 Bank Verification Process</h4>
                    <ul>
                      <li>Your bank details will be verified for secure transactions</li>
                      <li>We may send a small amount (₹1-2) for verification</li>
                      <li>This amount will be refunded within 24-48 hours</li>
                      <li>Ensure account details are accurate to avoid delays</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Step 8: Final Review & Submit */}
            {currentStep === 'review' && (
              <div className="review-step">
                <div className="review-summary">
                  <h3>📋 Application Summary</h3>
                  <p className="review-intro">Please review all the information below before submitting your application.</p>

                  {/* Personal & Company Details Section */}
                  <div className="review-section">
                    <h4>👤 Personal & Company Details</h4>
                    <div className="review-grid">
                      <div className="review-item">
                        <label>Full Name:</label>
                        <span>{watch('fullName') || 'Not provided'}</span>
                      </div>
                      <div className="review-item">
                        <label>Contact Number:</label>
                        <span>{watch('contactNumber') || 'Not provided'}</span>
                      </div>
                      <div className="review-item">
                        <label>Email Address:</label>
                        <span>{watch('email') || 'Not provided'}</span>
                      </div>
                      <div className="review-item">
                        <label>Company Name:</label>
                        <span>{watch('companyName') || 'Not provided'}</span>
                      </div>
                      <div className="review-item">
                        <label>Company Type:</label>
                        <span>{watch('companyType') || 'Not provided'}</span>
                      </div>
                      <div className="review-item full-width">
                        <label>Company Address:</label>
                        <span>{watch('companyAddress') || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Business Preferences Section */}
                  <div className="review-section">
                    <h4>🏢 Business Preferences</h4>
                    <div className="review-grid">
                      <div className="review-item">
                        <label>Business Type:</label>
                        <span>{watch('businessType') || 'Not provided'}</span>
                      </div>
                      <div className="review-item">
                        <label>Annual Turnover:</label>
                        <span>{watch('annualTurnover') || 'Not provided'}</span>
                      </div>
                      <div className="review-item">
                        <label>Business Model:</label>
                        <span>{watch('businessModel') || 'Not provided'}</span>
                      </div>
                      <div className="review-item full-width">
                        <label>Business Description:</label>
                        <span>{watch('businessDescription') || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Warehouse Details Section */}
                  <div className="review-section">
                    <h4>🏭 Warehouse Details</h4>
                    <div className="review-grid">
                      <div className="review-item full-width">
                        <label>Warehouse Address:</label>
                        <span>{watch('warehouseAddress') || 'Not provided'}</span>
                      </div>
                      <div className="review-item">
                        <label>Warehouse Area:</label>
                        <span>{watch('warehouseArea') || 'Not provided'}</span>
                      </div>
                      <div className="review-item">
                        <label>Storage Capacity:</label>
                        <span>{watch('storageCapacity') || 'Not provided'}</span>
                      </div>
                      <div className="review-item">
                        <label>Warehouse Cities:</label>
                        <span>{watch('warehouseCities') || 'Not provided'}</span>
                      </div>
                      <div className="review-item">
                        <label>Number of Warehouses:</label>
                        <span>{watch('numberOfWarehouses') || 'Not provided'}</span>
                      </div>
                      <div className="review-item">
                        <label>Daily Order Volume:</label>
                        <span>{watch('dailyOrderVolume') || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Brand & Product Details Section */}
                  <div className="review-section">
                    <h4>🎨 Brand & Product Details</h4>
                    <div className="review-grid">
                      <div className="review-item">
                        <label>Product Category:</label>
                        <span>{watch('productCategory') || 'Not provided'}</span>
                      </div>
                      <div className="review-item">
                        <label>Target Gender:</label>
                        <span>{watch('gender') || 'Not provided'}</span>
                      </div>
                      <div className="review-item">
                        <label>Target Age Group:</label>
                        <span>{watch('targetAgeGroup') || 'Not provided'}</span>
                      </div>
                      <div className="review-item">
                        <label>Price Range:</label>
                        <span>{watch('priceRange') || 'Not provided'}</span>
                      </div>
                      <div className="review-item">
                        <label>Brand Logo:</label>
                        <span>{watch('brandLogo')?.[0]?.name ? `📎 ${watch('brandLogo')[0].name}` : 'Not uploaded'}</span>
                      </div>
                      <div className="review-item">
                        <label>Brand Deck:</label>
                        <span>{watch('brandDeck')?.[0]?.name ? `📎 ${watch('brandDeck')[0].name}` : 'Not uploaded'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details Section */}
                  <div className="review-section">
                    <h4>🏦 Bank Details</h4>
                    <div className="review-grid">
                      <div className="review-item">
                        <label>Account Holder Name:</label>
                        <span>{watch('accountHolderName') || 'Not provided'}</span>
                      </div>
                      <div className="review-item">
                        <label>Account Number:</label>
                        <span>{watch('accountNumber') ? `****${watch('accountNumber').slice(-4)}` : 'Not provided'}</span>
                      </div>
                      <div className="review-item">
                        <label>IFSC Code:</label>
                        <span>{watch('ifsc') || 'Not provided'}</span>
                      </div>
                      <div className="review-item">
                        <label>Cancelled Cheque:</label>
                        <span>{watch('cancelledCheque')?.[0]?.name ? `📎 ${watch('cancelledCheque')[0].name}` : 'Not uploaded'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Checkbox */}
                  <div className="confirmation-section">
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          {...register('review')}
                          className="review-checkbox"
                        />
                        <span className="checkmark"></span>
                        I confirm that all the information provided above is accurate and complete. I understand that any false information may result in the rejection of my application.
                      </label>
                      {errors.review && (
                        <span className="error-message">Please confirm the accuracy of your information</span>
                      )}
                    </div>
                  </div>

                  {/* Final Notes */}
                  <div className="final-notes">
                    <div className="notes-box">
                      <h4>📝 Next Steps</h4>
                      <ul>
                        <li>After submission, you'll receive a confirmation email</li>
                        <li>Our team will review your application within 2-3 business days</li>
                        <li>You may be contacted for additional verification if needed</li>
                        <li>Once approved, you'll receive onboarding instructions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={`form-actions ${currentStepIndex > 0 ? 'has-previous' : ''}`}>
            {currentStepIndex > 0 && (
              <button 
                type="button" 
                onClick={goToPreviousStep}
                className="prev-btn"
              >
                ← Previous
              </button>
            )}
            
            {(currentStep === 'tanNumber' || currentStep === 'microDepositAmount') && (
              <button 
                type="button" 
                onClick={skipStep}
                className="skip-btn"
              >
                Skip →
              </button>
            )}
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
              onClick={async (e) => {
                e.preventDefault();
                
                // Trigger validation for current step fields
                const stepFields = getStepFields(currentStep);
                let isValid = true;
                
                for (const field of stepFields) {
                  const fieldValid = await trigger(field);
                  if (!fieldValid) isValid = false;
                }
                
                if (isValid) {
                  // If valid, proceed
                  const formData = watch();
                  onStepSubmit(formData);
                } else {
                  // Show validation errors
                  console.log(`Please fix the errors in ${getStepTitle(currentStep)}`);
                }
              }}
            >
              {isSubmitting ? 'Processing...' : isLastStep ? 'Submit Application' : 'Continue →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessOnboardingForm;
