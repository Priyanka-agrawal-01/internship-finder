import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthProvider from './auth/AuthProvider.jsx'
import SavedProvider from './saved/SavedProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SavedProvider>
        <App />
      </SavedProvider>
    </AuthProvider>
  </StrictMode>,
)
