import { createContext, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

export const NotificationContext = createContext(null);

let toastId = 0;

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'info') => {
      const id = ++toastId;
      const toast = { id, message, type };

      setToasts((prev) => {
        const next = [...prev, toast];
        // Max 3 toasts at once (FIFO overflow)
        return next.length > 3 ? next.slice(-3) : next;
      });

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);

      return id;
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
