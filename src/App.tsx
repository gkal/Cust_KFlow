// @ts-ignore: React is used for JSX
import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FormPage from './pages/FormPage';
import HomePage from './pages/HomePage';
import StepperFormPage from './pages/StepperFormPage'; // Add this import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/form/:token" element={<FormPage />} />
        <Route path="/stepper-form" element={<StepperFormPage />} /> {/* Add this route */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
              <p className="text-gray-600">
                The page you are looking for does not exist.
              </p>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;