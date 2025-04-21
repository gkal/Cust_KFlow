import './styles/index.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import StepperForm from './pages/stepper-form'
import NotFound from './pages/NotFound'
import { FormWrapper } from './components/FormWrapper'

// Force the background color
const appStyles = {
  backgroundColor: '#2f3e46',
  color: '#cad2c5',
  minHeight: '100vh',
  padding: '1rem'
};

const cardStyles = {
  backgroundColor: '#354f52',
  border: '1px solid #52796f',
  color: '#cad2c5',
  borderRadius: '0.5rem',
  padding: '1.5rem',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
};

function App() {
  return (
    <BrowserRouter>
      <div style={appStyles} className="app-container">
        <div className="max-w-4xl mx-auto">
          <Routes>
            {/* Redirect root path to 404 page */}
            <Route path="/" element={<Navigate to="/404" replace />} />
            
            {/* Form path with token validation */}
            <Route path="/form/:token" element={
              <div style={cardStyles}>
                <FormWrapper>
                  <StepperForm />
                </FormWrapper>
              </div>
            } />
            
            {/* 404 Not Found page */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App 