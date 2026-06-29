import PropTypes from 'prop-types';

function PageHeader({ title, subtitle, actions = [], className = '' }) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-6 border-b border-brand-navy-light ${className}`}
    >
      <div>
        <h1 className="font-display font-bold text-2xl text-brand-white">
          {title}
        </h1>
        {subtitle && (
          <p className="font-body text-sm text-brand-muted mt-1">{subtitle}</p>
        )}
      </div>
      {actions.length > 0 && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions.map((action, i) => (
            <span key={i}>{action}</span>
          ))}
        </div>
      )}
    </div>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actions: PropTypes.arrayOf(PropTypes.node),
  className: PropTypes.string,
};

export default PageHeader;
