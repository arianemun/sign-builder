import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { loadPeydaFonts } from './lib/loadPeyda'
import App from './App.tsx'

void loadPeydaFonts()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
