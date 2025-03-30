import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Log des variables d'environnement au démarrage
console.log('Variables d\'environnement chargées:', {
  VITE_OPENAI_API_KEY: !!import.meta.env.VITE_OPENAI_API_KEY,
  NODE_ENV: import.meta.env.MODE
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
