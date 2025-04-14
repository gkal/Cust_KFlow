import './styles/index.css'
import StepperForm from './pages/stepper-form'

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
    <div style={appStyles} className="app-container">
      <div className="max-w-4xl mx-auto">
        <div style={cardStyles}>
          <StepperForm />
        </div>
      </div>
    </div>
  )
}

export default App 