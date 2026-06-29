import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-brand-saffron text-white hover:bg-orange-600 active:scale-95',
  secondary:
    'bg-brand-navy-light text-brand-white border border-brand-navy-light hover:bg-brand-navy',
  danger: 'bg-brand-error text-white hover:bg-red-700',
  ghost: 'text-brand-muted hover:text-brand-white hover:bg-brand-navy-light',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-display font-semibold
        rounded-lg transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-brand-saffron focus:ring-offset-2 focus:ring-offset-brand-navy
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Button;
