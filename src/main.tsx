import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Import styles in the correct order
import './styles/global.css' // First load the global styles with high specificity
import './styles/index.css'  // Then load the modular styles

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 