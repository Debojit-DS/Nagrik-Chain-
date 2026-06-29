import PropTypes from 'prop-types';

const statusVariants = {
  verified: 'bg-green-900/40 text-green-400 border border-green-700/50',
  pending: 'bg-yellow-900/40 text-yellow-400 border border-yellow-700/50',
  flagged: 'bg-red-900/40 text-red-400 border border-red-700/50',
  active: 'bg-blue-900/40 text-blue-400 border border-blue-700/50',
  inactive: 'bg-gray-800 text-gray-400 border border-gray-700',
  suspended: 'bg-red-900/40 text-red-400 border border-red-700/50',
  error: 'bg-red-900/40 text-red-400 border border-red-700/50',
  ended: 'bg-gray-800 text-gray-400 border border-gray-700',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

function Badge({ status, size = 'md', children, className = '' }) {
  const label = children || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      role="status"
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${statusVariants[status] || statusVariants.inactive}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {label}
    </span>
  );
}

Badge.propTypes = {
  status: PropTypes.oneOf([
    'verified', 'pending', 'flagged', 'active',
    'inactive', 'suspended', 'error', 'ended',
  ]).isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Badge;
