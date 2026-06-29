import PropTypes from 'prop-types';
import Button from './Button';

function EmptyState({ icon: Icon, title, message, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      {Icon && <Icon className="h-12 w-12 text-brand-muted mb-4" />}
      <h3 className="font-display font-semibold text-lg text-brand-white mb-1">
        {title}
      </h3>
      {message && (
        <p className="text-brand-muted text-sm text-center max-w-sm mb-4">
          {message}
        </p>
      )}
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
  className: PropTypes.string,
};

export default EmptyState;
