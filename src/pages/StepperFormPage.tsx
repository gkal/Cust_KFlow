// @ts-ignore: React is used for JSX
import * as React from 'react';
import StepperFormWrapper from '../components/StepperFormWrapper';

export default function StepperFormPage() {
  return (
    <div 
      style={{
        backgroundColor: '#ffffff',
        color: '#111827',
        minHeight: '100vh',
        width: '100%'
      }}
    >
      <StepperFormWrapper />
    </div>
  );
}