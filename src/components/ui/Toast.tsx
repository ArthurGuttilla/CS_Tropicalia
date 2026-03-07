'use client'

import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, X, Info } from 'lucide-react'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  const remove = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id))

  const value: ToastContextValue = {
    toast: addToast,
    success: (m) => addToast('success', m),
    error: (m) => addToast('error', m),
    info: (m) => addToast('info', m),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg animate-slide-up min-w-[280px] max-w-sm',
              {
                'bg-green-50 border border-green-200 text-green-800':
                  t.type === 'success',
                'bg-red-50 border border-red-200 text-red-800':
                  t.type === 'error',
                'bg-blue-50 border border-blue-200 text-blue-800':
                  t.type === 'info',
              }
            )}
          >
            {t.type === 'success' && (
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
            )}
            {t.type === 'error' && (
              <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            )}
            {t.type === 'info' && (
              <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
            )}
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="flex-shrink-0 rounded p-0.5 opacity-60 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
