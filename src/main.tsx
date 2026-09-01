import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { AuthProvider } from '@/auth/AuthProvider'
import App from './App.tsx'

const isKitchenPlayground =
  import.meta.env.DEV && new URLSearchParams(window.location.search).get('dev') === 'kitchen'

if (isKitchenPlayground) {
  const { KitchenScreen } = await import('@/dev/KitchenScreen')
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <KitchenScreen />
    </StrictMode>,
  )
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>,
  )
}
