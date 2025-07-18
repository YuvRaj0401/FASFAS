import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navbar from './Navbar_Tailwind';

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

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    setIsSubmitted(true);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'gstin':
        return (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">GSTIN Verification</h2>
              <p className="text-gray-600 text-sm">Please enter your GSTIN to verify your business registration</p>
            </div>
            
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-start gap-3">
              <div className="w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                i
              </div>
              <div className="text-primary-800 text-sm">
                GSTIN should be 15 characters long and in the format: 22AAAAA0000A1Z5
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GSTIN Number <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('gstin')}
                  type="text"
                  placeholder="Enter your GSTIN"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {errors.gstin && (
                  <p className="text-red-500 text-sm mt-1">{errors.gstin.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'fullName':
        return (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Basic Information</h2>
              <p className="text-gray-600 text-sm">Please provide your personal and company details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('fullName')}
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('contactNumber')}
                  type="tel"
                  placeholder="Enter contact number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {errors.contactNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.contactNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('companyName')}
                  type="text"
                  placeholder="Enter company name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('companyType')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="">Select company type</option>
                  <option value="private_limited">Private Limited</option>
                  <option value="public_limited">Public Limited</option>
                  <option value="partnership">Partnership</option>
                  <option value="proprietorship">Proprietorship</option>
                  <option value="llp">LLP</option>
                </select>
                {errors.companyType && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyType.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('companyAddress')}
                  rows={3}
                  placeholder="Enter complete company address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
                />
                {errors.companyAddress && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyAddress.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'signature':
        return (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Document Upload</h2>
              <p className="text-gray-600 text-sm">Upload required documents for verification</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signature Document
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                  <input
                    {...register('signature')}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    id="signature-upload"
                  />
                  <label
                    htmlFor="signature-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Click to upload signature</span>
                    <span className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'businessType':
        return (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Business Details</h2>
              <p className="text-gray-600 text-sm">Tell us about your business and what you sell</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('businessType')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="">Select business type</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="wholesaler">Wholesaler</option>
                  <option value="retailer">Retailer</option>
                  <option value="distributor">Distributor</option>
                  <option value="service_provider">Service Provider</option>
                </select>
                {errors.businessType && (
                  <p className="text-red-500 text-sm mt-1">{errors.businessType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('businessDescription')}
                  rows={4}
                  placeholder="Describe your business activities, products, and services"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
                />
                {errors.businessDescription && (
                  <p className="text-red-500 text-sm mt-1">{errors.businessDescription.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'warehouseAddress':
        return (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Warehouse Details</h2>
              <p className="text-gray-600 text-sm">Provide information about your storage facility</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('warehouseAddress')}
                  rows={3}
                  placeholder="Enter complete warehouse address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
                />
                {errors.warehouseAddress && (
                  <p className="text-red-500 text-sm mt-1">{errors.warehouseAddress.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse Area (sq ft) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('warehouseArea')}
                  type="text"
                  placeholder="Enter warehouse area in square feet"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {errors.warehouseArea && (
                  <p className="text-red-500 text-sm mt-1">{errors.warehouseArea.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'productCategory':
        return (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Brand Details</h2>
              <p className="text-gray-600 text-sm">Select the main category of products you deal with</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('productCategory')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="">Select product category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing & Fashion</option>
                  <option value="home_garden">Home & Garden</option>
                  <option value="health_beauty">Health & Beauty</option>
                  <option value="sports">Sports & Outdoors</option>
                  <option value="books">Books & Media</option>
                  <option value="automotive">Automotive</option>
                  <option value="food_beverage">Food & Beverage</option>
                  <option value="other">Other</option>
                </select>
                {errors.productCategory && (
                  <p className="text-red-500 text-sm mt-1">{errors.productCategory.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'accountHolderName':
        return (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Bank Details</h2>
              <p className="text-gray-600 text-sm">Provide your bank account information for payments</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('accountHolderName')}
                  type="text"
                  placeholder="Enter account holder name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {errors.accountHolderName && (
                  <p className="text-red-500 text-sm mt-1">{errors.accountHolderName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('accountNumber')}
                  type="text"
                  placeholder="Enter bank account number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {errors.accountNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.accountNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('ifsc')}
                  type="text"
                  placeholder="Enter IFSC code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {errors.ifsc && (
                  <p className="text-red-500 text-sm mt-1">{errors.ifsc.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Declaration</h2>
              <p className="text-gray-600 text-sm">Please review and confirm the information provided</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                  Terms and Conditions
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  By proceeding with this application, I hereby confirm that all the information provided above is true, 
                  complete, and accurate to the best of my knowledge. I understand that any false or misleading information 
                  may result in the rejection of my application or termination of services.
                </p>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>I agree to the terms and conditions and privacy policy</span>
                  </label>
                  <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>I confirm that all provided information is accurate and complete</span>
                  </label>
                  <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>I would like to receive updates and promotional communications</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                  Next Steps
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-semibold">✓</span>
                    Your application will be reviewed within 2-3 business days
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-semibold">✓</span>
                    You will receive an email confirmation upon approval
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-semibold">✓</span>
                    Account setup instructions will be provided via email
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-semibold">✓</span>
                    Our team will contact you for any additional requirements
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const nextStep = () => {
    if (!isLastStep && isStepValid(currentStep)) {
      setCompletedSteps(prev => new Set(prev).add(currentStep));
      const nextStepIndex = currentStepIndex + 1;
      setCurrentStep(stepOrder[nextStepIndex].key);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      const prevStepIndex = currentStepIndex - 1;
      setCurrentStep(stepOrder[prevStepIndex].key);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-70px)] p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-600">Thank you for your submission. We'll review your application and get back to you soon.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex min-h-[calc(100vh-70px)]">
        {/* Sidebar Navigation */}
        <div className="w-80 bg-white shadow-lg border-r border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Business Onboarding
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStepIndex + 1} of {stepOrder.length}
            </p>
          </div>

          <div className="p-0">
            {stepOrder.map((step, index) => {
              const isActive = step.key === currentStep;
              const isCompleted = completedSteps.has(step.key);
              const isDisabled = index > currentStepIndex + 1;

              return (
                <div
                  key={step.key}
                  data-step-id={step.key}
                  onClick={() => !isDisabled && handleStepClick(step.key)}
                  className={`
                    flex items-center p-4 border-b border-gray-100 cursor-pointer transition-all duration-200
                    ${isActive ? 'bg-blue-50 border-r-4 border-r-blue-600' : ''}
                    ${isCompleted ? 'bg-green-50' : ''}
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mr-3 transition-all duration-200
                    ${isActive ? 'bg-blue-600 text-white' : ''}
                    ${isCompleted ? 'bg-green-600 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-600' : ''}
                  `}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className={`
                      text-sm font-medium
                      ${isActive ? 'text-blue-900' : ''}
                      ${isCompleted ? 'text-green-900' : ''}
                      ${!isActive && !isCompleted ? 'text-gray-700' : ''}
                    `}>
                      {step.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
              <div className="flex-1">
                {renderStepContent()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Previous
                </button>

                {isLastStep ? (
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                  >
                    Submit Application
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid(currentStep)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    Next Step
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
