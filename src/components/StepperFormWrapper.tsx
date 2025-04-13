// @ts-ignore: React is used for JSX
import * as React from 'react';
import StepperForm from '@stepper/pages/stepper-form';

// Simple wrapper component with minimal styling to avoid conflicts
export default function StepperFormWrapper() {
  return (
    <div 
      className="stepper-form-wrapper" 
      style={{
        backgroundColor: '#ffffff',
        color: '#111827',
        position: 'relative',
        width: '100%',
        height: '100%',
        padding: '0',
        margin: '0'
      }}
    >
      {/* The stepper form component from the stepper package */}
      <StepperForm />
    </div>
  );
} 