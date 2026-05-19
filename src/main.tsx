import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppWithAPI from './AppWithAPI.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithAPI />
  </StrictMode>,
)
