import { useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function Modal({ isOpen, onClose, title, children, size = 'md', className = '' }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`
              bg-brand-navy-mid rounded-2xl shadow-card w-full
              max-h-[90vh] overflow-y-auto
              sm:rounded-2xl
              max-sm:rounded-none max-sm:max-h-full max-sm:h-full
              ${sizeClasses[size]}
              ${className}
            `}
          >
            {title && (
              <div className="flex items-center justify-between p-6 pb-0">
                <h2
                  id="modal-title"
                  className="font-display font-bold text-xl text-brand-white"
                >
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="text-brand-muted hover:text-brand-white transition-colors p-1 rounded-lg hover:bg-brand-navy-light"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  className: PropTypes.string,
};

export default Modal;
