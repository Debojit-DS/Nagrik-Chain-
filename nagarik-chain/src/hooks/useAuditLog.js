import { useState, useCallback, useMemo } from 'react';
import { mockAuditLogEntries } from '@data/auditLog';

/**
 * Hook to manage audit log data with filtering and CSV export.
 */
export function useAuditLog() {
  const [logEntries] = useState(mockAuditLogEntries);
  const [filters, setFilters] = useState({
    eventType: 'All',
    actorType: 'All',
    citizenId: '',
  });

  const filteredEntries = useMemo(() => {
    return logEntries.filter((entry) => {
      if (filters.eventType !== 'All' && entry.eventType !== filters.eventType) return false;
      if (filters.actorType !== 'All' && entry.actorType !== filters.actorType) return false;
      if (filters.citizenId && !entry.affectedCitizen?.includes(filters.citizenId)) return false;
      return true;
    });
  }, [logEntries, filters]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const exportCSV = useCallback(() => {
    const headers = ['Timestamp', 'Event Type', 'Actor', 'Actor ID', 'Affected Citizen', 'Description', 'Block #', 'Verified'];
    const rows = filteredEntries.map((e) => [
      e.timestamp, e.eventType, e.actor, e.actorId, e.affectedCitizen || '',
      e.description, e.blockNumber, '✓',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nagarik-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredEntries]);

  return {
    logEntries: filteredEntries,
    allEntries: logEntries,
    filters,
    updateFilter,
    exportCSV,
  };
}
