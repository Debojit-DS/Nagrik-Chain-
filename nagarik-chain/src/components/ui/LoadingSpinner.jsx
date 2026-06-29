import PropTypes from 'prop-types';

function LoadingSpinner({ fullPage = false, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const spinner = (
    <div
      className={`
        rounded-full border-brand-navy-light border-t-brand-saffron animate-spin
        ${sizeClasses[size]} ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <p className="text-brand-muted text-sm font-body">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
}

LoadingSpinner.propTypes = {
  fullPage: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default LoadingSpinner;
