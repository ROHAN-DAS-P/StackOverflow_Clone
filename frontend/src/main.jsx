import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'
import { queryClient } from './lib/queryClient.js'

// Honor saved theme or system preference for Tailwind `dark:` (sidebar, layout).
;(function initTheme() {
  try {
    const stored = localStorage.getItem('theme')
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark')
    } else if (stored === 'light') {
      document.documentElement.classList.remove('dark')
    }
  } catch {
    /* ignore */
  }
})()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
