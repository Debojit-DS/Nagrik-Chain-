import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import HashDisplay from './HashDisplay';
import Badge from '@components/ui/Badge';
import { formatDateTime } from '@utils/formatters';

const eventTypeColors = {
  IDENTITY_CREATED: 'text-brand-saffron',
  DOCUMENT_ANCHORED: 'text-brand-crypto-blue',
  BENEFIT_TRIGGERED: 'text-brand-india-green',
  BENEFIT_TRANSFERRED: 'text-green-400',
  VERIFICATION_COMPLETED: 'text-blue-400',
  FLAG_RAISED: 'text-brand-error',
  FLAG_RESOLVED: 'text-yellow-400',
};

const eventTypeBadge = {
  IDENTITY_CREATED: 'active',
  DOCUMENT_ANCHORED: 'active',
  BENEFIT_TRIGGERED: 'verified',
  BENEFIT_TRANSFERRED: 'verified',
  VERIFICATION_COMPLETED: 'active',
  FLAG_RAISED: 'flagged',
  FLAG_RESOLVED: 'pending',
};

const TransactionFeedItem = memo(function TransactionFeedItem({ event }) {
  const typeLabel = event.type.replace(/_/g, ' ');

  return (
    <motion.div
      initial={event.isNew ? { opacity: 0, height: 0, y: -10 } : false}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        bg-brand-navy border border-brand-navy-light rounded-lg p-4
        ${event.isNew ? 'border-brand-crypto-blue/50' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <Badge status={eventTypeBadge[event.type] || 'active'} size="sm">
          {typeLabel}
        </Badge>
        <span className="text-brand-muted text-xs font-mono flex-shrink-0">
          {formatDateTime(event.timestamp)}
        </span>
      </div>

      <p className="text-brand-white text-sm mb-2">{event.description}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span className={`font-mono ${eventTypeColors[event.type] || 'text-brand-muted'}`}>
          {event.contractName}
        </span>
        <span className="text-brand-muted">
          Block #{event.blockNumber?.toLocaleString('en-IN')}
        </span>
        <HashDisplay hash={event.txHash} truncate className="text-xs" />
      </div>

      {event.solidityCode && (
        <details className="mt-3">
          <summary className="text-brand-muted text-xs cursor-pointer hover:text-brand-white transition-colors">
            View Contract Code ▸
          </summary>
          <pre className="mt-2 bg-brand-navy-deep border border-brand-navy-light rounded-lg p-3 text-xs font-mono text-green-400 overflow-x-auto whitespace-pre">
            {event.solidityCode}
          </pre>
        </details>
      )}
    </motion.div>
  );
});

TransactionFeedItem.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    contractName: PropTypes.string.isRequired,
    txHash: PropTypes.string.isRequired,
    blockNumber: PropTypes.number,
    timestamp: PropTypes.string.isRequired,
    isNew: PropTypes.bool,
    solidityCode: PropTypes.string,
  }).isRequired,
};

function TransactionFeed({ events, className = '' }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <AnimatePresence>
        {events.map((event) => (
          <TransactionFeedItem key={event.id || event.txHash} event={event} />
        ))}
      </AnimatePresence>
    </div>
  );
}

TransactionFeed.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  className: PropTypes.string,
};

export default TransactionFeed;
