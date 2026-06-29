import { useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { NotificationContext } from '@contexts/NotificationContext';

const typeConfig = {
  success: {
    bg: 'bg-green-900/40 border-green-700',
    icon: CheckCircle,
    iconColor: 'text-green-400',
  },
  error: {
    bg: 'bg-red-900/40 border-red-700',
    icon: AlertCircle,
    iconColor: 'text-red-400',
  },
  info: {
    bg: 'bg-blue-900/40 border-blue-700',
    icon: Info,
    iconColor: 'text-blue-400',
  },
  warning: {
    bg: 'bg-yellow-900/40 border-yellow-700',
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
  },
};

function Toast() {
  const { toasts, removeToast } = useContext(NotificationContext);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = typeConfig[toast.type] || typeConfig.info;
          const Icon = config.icon;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl border
                shadow-card min-w-[280px] max-w-[400px]
                ${config.bg}
              `}
              role="alert"
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${config.iconColor}`} />
              <p className="text-brand-white text-sm font-body flex-1">
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-brand-muted hover:text-brand-white transition-colors flex-shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default Toast;
