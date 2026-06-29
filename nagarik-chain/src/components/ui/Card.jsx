import PropTypes from 'prop-types';

function Card({ children, hover = false, className = '', ...props }) {
  return (
    <div
      className={`
        bg-brand-navy-mid border border-brand-navy-light rounded-xl shadow-card
        ${hover ? 'hover:shadow-card-hover transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  hover: PropTypes.bool,
  className: PropTypes.string,
};

export default Card;
