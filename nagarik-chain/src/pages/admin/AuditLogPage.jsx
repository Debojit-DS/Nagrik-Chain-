import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Shield, Download } from 'lucide-react';
import { mockAuditLogEntries } from '@data/auditLog';
import PageHeader from '@components/ui/PageHeader';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import HashDisplay from '@components/blockchain/HashDisplay';
import { formatDateTime } from '@utils/formatters';
import { generateHash } from '@utils/hashGenerator';

const EVENT_TYPES = [
  'All',
  'OFFICER_LOGIN', 'OFFICER_LOGOUT',
  'DOCUMENT_APPROVED', 'DOCUMENT_REJECTED', 'DOCUMENT_ESCALATED',
  'CONTRACT_TRIGGERED', 'CONTRACT_DEPLOYED', 'CONTRACT_PAUSED',
  'CITIZEN_SUSPENDED', 'CITIZEN_REACTIVATED',
  'AI_OVERRIDE',
  'MANUAL_FLAG_RAISED', 'MANUAL_FLAG_RESOLVED',
];

const eventBadgeMap = {
  OFFICER_LOGIN: 'active', OFFICER_LOGOUT: 'inactive',
  DOCUMENT_APPROVED: 'verified', DOCUMENT_REJECTED: 'flagged', DOCUMENT_ESCALATED: 'pending',
  CONTRACT_TRIGGERED: 'active', CONTRACT_DEPLOYED: 'verified', CONTRACT_PAUSED: 'pending',
  CITIZEN_SUSPENDED: 'suspended', CITIZEN_REACTIVATED: 'verified',
  AI_OVERRIDE: 'pending',
  MANUAL_FLAG_RAISED: 'flagged', MANUAL_FLAG_RESOLVED: 'verified',
};

function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = useMemo(() => {
    let result = mockAuditLogEntries;
    if (typeFilter !== 'All') {
      result = result.filter((e) => e.eventType === typeFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) =>
        e.description.toLowerCase().includes(q) ||
        e.actorId.toLowerCase().includes(q) ||
        (e.affectedCitizen && e.affectedCitizen.toLowerCase().includes(q))
      );
    }
    return result;
  }, [search, typeFilter]);

  const csvContent = useMemo(() => {
    const headers = ['Timestamp', 'Event Type', 'Actor', 'Actor ID', 'Affected Citizen', 'Action Description', 'Block #', 'Verified'];
    const rows = filtered.map((entry) => [
      formatDateTime(entry.timestamp),
      entry.eventType.replace(/_/g, ' '),
      entry.actor === 'System' ? 'SYSTEM' : entry.actor,
      entry.actorId,
      entry.affectedCitizen || '',
      entry.description,
      entry.blockNumber || '',
      entry.verified ? 'Yes' : 'No',
    ]);
    const csvRows = rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','));
    return [headers.join(','), ...csvRows].join('\n');
  }, [filtered]);

  const handleExportCSV = () => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'audit-log-export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Immutable Audit Log"
        subtitle="All actions are recorded on-chain. This log cannot be edited or deleted."
        actions={[
          <button
            key="export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-brand-saffron hover:bg-orange-600 text-brand-navy font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </button>,
        ]}
      />

      {/* Blockchain Notice */}
      <div className="flex items-center gap-2 bg-brand-ai-purple/10 border border-purple-700/30 rounded-lg px-4 py-2.5 mb-6">
        <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
        <p className="text-purple-300 text-xs">
          Every entry is anchored to a blockchain block. Tampering is cryptographically impossible.
        </p>
      </div>

      {/* Search & Filter */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="text" placeholder="Search logs..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-brand-navy border border-brand-navy-light rounded-lg pl-10 pr-4 py-2.5 text-brand-white text-sm focus:outline-none focus:border-brand-saffron"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-muted flex-shrink-0" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-brand-navy border border-brand-navy-light rounded-lg px-3 py-2.5 text-brand-white text-sm focus:outline-none focus:border-brand-saffron"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t === 'All' ? 'All Event Types' : t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-brand-muted text-xs">{filtered.length} entries found</p>
        </div>
      </Card>

      {/* Log Entries */}
      <div className="space-y-3">
        {filtered.map((entry) => (
          <Card key={entry.id} className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Badge status={eventBadgeMap[entry.eventType] || 'active'} size="sm">
                  {entry.eventType.replace(/_/g, ' ')}
                </Badge>
                <span className="text-brand-muted text-xs">
                  by <span className="text-brand-white">{entry.actor === 'System' ? 'SYSTEM' : entry.actorId}</span>
                </span>
              </div>
              <span className="text-brand-muted text-xs font-mono">{formatDateTime(entry.timestamp)}</span>
            </div>
            <p className="text-brand-white text-sm mb-2">{entry.description}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {entry.affectedCitizen && (
                <span className="text-brand-crypto-blue font-mono">{entry.affectedCitizen}</span>
              )}
              <span className="text-brand-muted">Block #{entry.blockNumber?.toLocaleString('en-IN')}</span>
              <div className="flex items-center gap-1">
                {entry.verified && (
                  <span className="text-green-400 text-[10px] font-medium">✓ On-Chain Verified</span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

export default AuditLogPage;
