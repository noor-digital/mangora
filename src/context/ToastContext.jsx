import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Check } from 'lucide-react';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(0);

  const show = useCallback((message) => {
    window.clearTimeout(timer.current);
    setToast({ message, key: Date.now() });
    timer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div className="toast" key={toast.key}>
            <Check size={16} aria-hidden="true" />
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
