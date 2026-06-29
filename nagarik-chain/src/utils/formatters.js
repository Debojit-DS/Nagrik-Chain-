/**
 * Formatting utilities for display across the app.
 */

/**
 * Format currency in Indian Rupee notation (e.g., ₹1,24,500)
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  return '₹' + amount.toLocaleString('en-IN');
};

/**
 * Format a date string to readable format
 * @param {string|Date} date
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export const formatDate = (date, options = {}) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
};

/**
 * Format a date to full datetime string
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  const d = new Date(date);
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

/**
 * Truncate a hash for display (first 6 + ... + last 4)
 * @param {string} hash
 * @returns {string}
 */
export const truncateHash = (hash) => {
  if (!hash || hash.length <= 12) return hash;
  return hash.slice(0, 6) + '...' + hash.slice(-4);
};

/**
 * Mask an email address (e.g., raj****@gmail.com)
 * @param {string} email
 * @returns {string}
 */
export const maskEmail = (email) => {
  if (!email) return '';
  const [user, domain] = email.split('@');
  const visible = user.slice(0, 3);
  return `${visible}****@${domain}`;
};

/**
 * Mask a Nagarik ID (e.g., IND-****-0032-NC)
 * @param {string} id
 * @returns {string}
 */
export const maskNagarikId = (id) => {
  if (!id) return '';
  const parts = id.split('-');
  if (parts.length !== 4) return id;
  return `${parts[0]}-****-${parts[2]}-${parts[3]}`;
};

/**
 * Format a block number with Indian comma notation
 * @param {number|string} num
 * @returns {string}
 */
export const formatBlockNumber = (num) => {
  return '#' + Number(num).toLocaleString('en-IN');
};

/**
 * Get relative time string (e.g., "2 hours ago", "3 months ago")
 * @param {string|Date} date
 * @returns {string}
 */
export const timeAgo = (date) => {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now - d) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
};

/**
 * Generate a random Nagarik ID (IND-XXXX-XXXX-NC)
 * @returns {string}
 */
export const generateNagarikId = () => {
  const rand4 = () =>
    Math.floor(1000 + Math.random() * 9000).toString();
  return `IND-${rand4()}-${rand4()}-NC`;
};

/**
 * Copy text to clipboard
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
