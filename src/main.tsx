import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Import styles in the correct order
import './styles/global.css' // First load the global styles with high specificity
import './styles/index.css'  // Then load the modular styles

// Add debug log for the application initialization
console.log('Application starting with environment:', {
  NODE_ENV: import.meta.env.MODE,
  BASE_URL: import.meta.env.BASE_URL,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 