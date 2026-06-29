import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Copy, Check } from 'lucide-react';
import { truncateHash, copyToClipboard } from '@utils/formatters';

function HashDisplay({ hash, truncate = true, className = '' }) {
  const [copied, setCopied] = useState(false);

  const displayHash = truncate ? truncateHash(hash) : hash;

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(hash);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [hash]);

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-brand-crypto-blue ${className}`}>
      <span className="select-all">{displayHash}</span>
      <button
        onClick={handleCopy}
        className="text-brand-muted hover:text-brand-crypto-blue transition-colors p-0.5"
        aria-label={copied ? 'Copied' : 'Copy hash'}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-400" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </span>
  );
}

HashDisplay.propTypes = {
  hash: PropTypes.string.isRequired,
  truncate: PropTypes.bool,
  className: PropTypes.string,
};

export default HashDisplay;
