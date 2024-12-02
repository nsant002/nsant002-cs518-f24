import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Check if the app is being loaded inside an iframe
if (window.self !== window.top) {
  document.body.innerHTML = `
  <div style="display: flex; justify-content: center; align-items: center; height:
  100vh; background-color: white;">
  <h1 style="color: red; font-family: Arial, sans-serif;">This content cannot be
  displayed in an iframe.</h1>
  </div>
  `;
  throw new Error("This content cannot be displayed in an iframe.");
  }
  
createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <App />
  // </StrictMode>,
)
