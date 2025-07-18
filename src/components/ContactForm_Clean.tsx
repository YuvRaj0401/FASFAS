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
        return !!(values.warehouseAddress && values.warehouseArea);
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
    switch (currentStep) {
      case 'gstin':
        return (
          <div className="form-field-container">
            <label className="form-field-label">GSTIN DETAILS</label>
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
            <div className="form-note">
              <div className="note-icon">i</div>
              <div>
                Note - Based on this entry, some of the details in the form will be automatically filled.
              </div>
            </div>
          </div>
        );
      
      case 'fullName':
        return (
          <div className="multi-field-step">
            <div className="form-field-container">
              <label className="form-field-label">Full Name *</label>
              <input
                type="text"
                className="form-field-input"
                {...register('fullName')}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <span className="error-message">{errors.fullName.message}</span>
              )}
            </div>
            
            <div className="form-field-container">
              <label className="form-field-label">Contact Number *</label>
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
            
            <div className="form-field-container">
              <label className="form-field-label">Email Address *</label>
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
            
            <div className="form-field-container">
              <label className="form-field-label">Company Name *</label>
              <input
                type="text"
                className="form-field-input"
                {...register('companyName')}
                placeholder="Enter your company name"
              />
              {errors.companyName && (
                <span className="error-message">{errors.companyName.message}</span>
              )}
            </div>

            <div className="form-field-container">
              <label className="form-field-label">Company Type *</label>
              <select
                className="form-field-input"
                {...register('companyType')}
              >
                <option value="">Select company type</option>
                <option value="private-limited">Private Limited</option>
                <option value="llp">Limited Liability Partnership</option>
                <option value="partnership">Partnership</option>
                <option value="proprietorship">Proprietorship</option>
                <option value="public-limited">Public Limited</option>
              </select>
              {errors.companyType && (
                <span className="error-message">{errors.companyType.message}</span>
              )}
            </div>

            <div className="form-field-container">
              <label className="form-field-label">Company Address *</label>
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
        );

      case 'signature':
        return (
          <div className="multi-field-step">
            <div className="form-field-container">
              <label className="form-field-label">Upload Signature</label>
              <input
                type="file"
                className="form-field-input"
                {...register('signature')}
                accept=".png,.jpg,.jpeg,.pdf"
              />
              {errors.signature && (
                <span className="error-message">{String(errors.signature.message)}</span>
              )}
              <div className="help-text">
                Upload a clear image of your signature (PNG, JPG, PDF only)
              </div>
            </div>
          </div>
        );

      case 'businessType':
        return (
          <div className="multi-field-step">
            <div className="form-field-container">
              <label className="form-field-label">Business Type *</label>
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
              <label className="form-field-label">Business Description *</label>
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
          </div>
        );

      case 'warehouseAddress':
        return (
          <div className="multi-field-step">
            <div className="form-field-container">
              <label className="form-field-label">Warehouse Address *</label>
              <textarea
                className="form-field-input"
                {...register('warehouseAddress')}
                placeholder="Enter complete warehouse address"
                rows={3}
              />
              {errors.warehouseAddress && (
                <span className="error-message">{errors.warehouseAddress.message}</span>
              )}
            </div>

            <div className="form-field-container">
              <label className="form-field-label">Warehouse Area (sq ft) *</label>
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
          </div>
        );

      case 'productCategory':
        return (
          <div className="multi-field-step">
            <div className="form-field-container">
              <label className="form-field-label">Product Category *</label>
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
          </div>
        );

      case 'accountHolderName':
        return (
          <div className="multi-field-step">
            <div className="form-field-container">
              <label className="form-field-label">Account Holder Name *</label>
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
              <label className="form-field-label">Account Number *</label>
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
              <label className="form-field-label">IFSC Code *</label>
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
          </div>
        );

      case 'review':
        return (
          <div className="multi-field-step">
            <div className="review-section">
              <h3>Review Your Application</h3>
              <p>Please review all the information you've provided before submitting your application.</p>
              
              <div className="form-field-container">
                <label className="form-field-label">
                  <input
                    type="checkbox"
                    {...register('review')}
                    style={{ marginRight: '8px' }}
                  />
                  I confirm that all information provided is accurate and complete
                </label>
                {errors.review && (
                  <span className="error-message">{String(errors.review.message)}</span>
                )}
              </div>
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
  };

  if (isSubmitted) {
    return (
      <div className="form-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Thank you!</h2>
          <p>Your application has been submitted successfully. We'll get back to you soon!</p>
        </div>
      </div>
    );
  }

  return (
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
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessOnboardingForm;
