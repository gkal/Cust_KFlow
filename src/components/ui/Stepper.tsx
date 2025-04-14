// @ts-ignore: React is used for JSX
import * as React from 'react';

/**
 * Utility function to conditionally join classNames together
 */
export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface StepperProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className = '' }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-col">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start mb-12 last:mb-0 relative">
            {/* Vertical line */}
            {index < steps.length - 1 && (
              <div className="absolute top-7 left-[10px] w-0.5 h-[calc(100%+14px)] bg-[#e5e7eb]">
                <div 
                  className={cn(
                    "absolute top-0 left-0 w-full bg-app-success",
                    index < currentStep ? "h-full" : "h-0"
                  )}
                />
              </div>
            )}
            
            {/* Circle dot with label */}
            <div className="flex items-center z-10">
              <div 
                className={cn(
                  "w-6 h-6 rounded-full flex-shrink-0 border-2 flex items-center justify-center",
                  index < currentStep
                    ? "bg-app-success border-app-success" // Completed
                    : index === currentStep
                      ? "bg-app-success border-app-success" // Current
                      : "bg-app-bg-secondary border-app-border-primary" // Future
                )}
              >
                {index < currentStep && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-app-bg-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              <div className={cn(
                "ml-4 text-sm",
                index === currentStep 
                  ? "text-[#84a98c] font-bold"
                  : index < currentStep 
                    ? "text-[#84a98c] font-normal" 
                    : "text-[#6b7280] font-normal"
              )}>
                {step}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 