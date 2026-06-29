import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(function Input(
  {
    label,
    error,
    type = 'text',
    className = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-body-sm text-brand-muted font-medium"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={`
          bg-brand-navy border border-brand-navy-light rounded-lg
          px-4 py-3 text-brand-white font-body text-sm
          placeholder:text-brand-muted/60
          focus:outline-none focus:border-brand-saffron focus:ring-2 focus:ring-brand-saffron/20
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${error ? 'border-brand-error focus:border-brand-error focus:ring-brand-error/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-brand-error text-xs flex items-center gap-1 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  type: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
};

export default Input;
