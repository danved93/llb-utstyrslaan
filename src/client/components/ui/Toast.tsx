import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const show = useCallback((message: string, type: ToastType = 'info') => {
    const id = String(Date.now() + Math.random());
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => remove(id), 3000);
  }, [remove]);

  useEffect(() => {
    const handler = (e: CustomEvent<{ message: string; type?: ToastType }>) => show(e.detail.message, e.detail.type);
    // @ts-expect-error custom event
    window.addEventListener('app:toast', handler as any);
    return () => {
      // @ts-expect-error custom event
      window.removeEventListener('app:toast', handler as any);
    };
  }, [show]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div aria-live="polite" aria-atomic="true" style={{ position: 'fixed', right: 16, top: 16, zIndex: 1100, display: 'grid', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} className="card" style={{ minWidth: 280, borderLeft: `4px solid ${typeColor(t.type)}` }}>
            <div className="card-body" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '0.75rem 1rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: 999, background: typeColor(t.type) }} />
              <div style={{ fontSize: 14 }}>{t.message}</div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function typeColor(type: ToastType): string {
  switch (type) {
    case 'success': return '#27ae60';
    case 'error': return '#e74c3c';
    case 'warning': return '#f39c12';
    default: return '#3498db';
  }
}


