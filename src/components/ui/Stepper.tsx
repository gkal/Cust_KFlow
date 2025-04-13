import React from 'react';

export interface Step {
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = currentStep > index;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={index} className="flex flex-col items-center relative">
              {/* Step connector line */}
              {!isLast && (
                <div className="absolute top-4 w-full flex items-center justify-center">
                  <div 
                    className={`h-0.5 w-full ${
                      isCompleted ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                </div>
              )}
              
              {/* Step circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : isCompleted
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              {/* Step title and description */}
              <div className="text-center mt-2">
                <p 
                  className={`text-sm font-medium ${
                    isActive || isCompleted ? 'text-blue-500' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 mt-1 hidden md:block">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
