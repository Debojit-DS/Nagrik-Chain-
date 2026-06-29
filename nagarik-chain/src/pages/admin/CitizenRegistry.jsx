import { useState, useMemo, useCallback, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Users, X, Fingerprint, Eye, ScanFace,
  ShieldCheck, AlertTriangle, Clock, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { mockCitizens } from '@data/mockCitizens';
import { NotificationContext } from '@contexts/NotificationContext';
import PageHeader from '@components/ui/PageHeader';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import EmptyState from '@components/ui/EmptyState';
import { formatDate, truncateHash } from '@utils/formatters';

const STATUS_FILTERS = ['All', 'ACTIVE', 'PENDING', 'SUSPENDED'];

/* ── Biometric Indicator ───────────────── */
function BiometricDot({ type, enrolled }) {
  const icons = { fingerprint: Fingerprint, face: ScanFace, iris: Eye };
  const Icon = icons[type];
  return (
    <span
      title={`${type}: ${enrolled ? 'Enrolled' : 'Not enrolled'}`}
      className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs ${
        enrolled ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-500'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

/* ── Detail Panel ──────────────────────── */
function DetailPanel({ citizen, onClose }) {
  const { addToast } = useContext(NotificationContext);
  if (!citizen) return null;

  const trustColor =
    citizen.aiTrustScore >= 90 ? 'text-green-400' :
    citizen.aiTrustScore >= 70 ? 'text-yellow-400' : 'text-red-400';

  const handleAction = useCallback(
    (action) => {
      addToast(`${action} action initiated for ${citizen.nagarikId}`, 'info');
    },
    [citizen.nagarikId, addToast]
  );

  return (
    <AnimatePresence>
      <motion.div
        key="panel-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <motion.aside
        key="panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-brand-navy-mid border-l border-brand-navy-light z-50 overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-brand-navy-mid/95 backdrop-blur-sm border-b border-brand-navy-light p-5 flex items-center justify-between z-10">
          <h2 className="font-display font-bold text-lg text-brand-white">Citizen Detail</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-white hover:bg-brand-navy-light transition-colors"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Identity */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-brand-saffron to-brand-crypto-blue flex items-center justify-center text-white font-display font-bold text-xl mb-3">
              {citizen.name.charAt(0)}
            </div>
            <h3 className="font-display font-bold text-xl text-brand-white">{citizen.name}</h3>
            <p className="font-mono text-brand-muted text-sm mt-1">{citizen.nagarikId}</p>
            <Badge status={citizen.status.toLowerCase()} className="mt-2" />
          </div>

          {/* AI Trust Score */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-brand-muted text-sm">AI Trust Score</span>
              <span className={`font-display font-bold text-xl ${trustColor}`}>
                {citizen.aiTrustScore}%
              </span>
            </div>
            <div className="w-full h-2 bg-brand-navy rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${citizen.aiTrustScore}%`,
                  backgroundColor: citizen.aiTrustScore >= 90 ? '#22c55e' : citizen.aiTrustScore >= 70 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
          </Card>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Gender', value: citizen.gender },
              { label: 'Date of Birth', value: citizen.dob },
              { label: 'State', value: citizen.state },
              { label: 'District', value: citizen.district },
              { label: 'Registered', value: formatDate(citizen.registeredAt) },
              { label: 'Documents', value: citizen.documentsCount },
              { label: 'Schemes', value: citizen.schemesCount },
              { label: 'Last Verified', value: formatDate(citizen.lastVerified) },
            ].map((item) => (
              <div key={item.label} className="bg-brand-navy rounded-lg p-3">
                <p className="text-brand-muted text-[10px] uppercase tracking-wider">{item.label}</p>
                <p className="text-brand-white text-sm font-medium mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Biometrics */}
          <Card className="p-4">
            <p className="text-brand-muted text-xs uppercase tracking-wider mb-3">Biometrics</p>
            <div className="flex items-center gap-3">
              <BiometricDot type="fingerprint" enrolled={citizen.biometrics.fingerprint === 'enrolled'} />
              <BiometricDot type="face" enrolled={citizen.biometrics.face === 'enrolled'} />
              <BiometricDot type="iris" enrolled={citizen.biometrics.iris === 'enrolled'} />
            </div>
          </Card>

          {/* Block Hash */}
          <div className="bg-brand-navy rounded-lg p-3">
            <p className="text-brand-muted text-[10px] uppercase tracking-wider mb-1">Block Hash</p>
            <p className="font-mono text-brand-white text-xs break-all">{citizen.blockHash}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button variant="primary" onClick={() => handleAction('View Full Profile')}>
              View Full Profile
            </Button>
            {citizen.status === 'ACTIVE' && (
              <Button variant="danger" onClick={() => handleAction('Suspend')}>
                Suspend Citizen
              </Button>
            )}
            {citizen.status === 'SUSPENDED' && (
              <Button variant="secondary" onClick={() => handleAction('Reactivate')}>
                Reactivate Citizen
              </Button>
            )}
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

/* ── Page ──────────────────────────────── */
function CitizenRegistry() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return mockCitizens.filter((c) => {
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const term = search.toLowerCase();
      const matchesSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.nagarikId.toLowerCase().includes(term) ||
        c.state.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const rowsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, filtered.length);

  const statusBadge = (status) => {
    const map = { ACTIVE: 'active', PENDING: 'pending', SUSPENDED: 'suspended' };
    return map[status] || 'inactive';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Citizen Registry"
        subtitle={`${mockCitizens.length} citizens on-chain. Search, filter, and inspect records.`}
      />

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Search by name, Nagarik ID, or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-navy border border-brand-navy-light rounded-lg pl-10 pr-4 py-2.5 text-brand-white text-sm font-body placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-saffron focus:ring-2 focus:ring-brand-saffron/20 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-brand-muted" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === f
                  ? 'bg-brand-saffron text-white'
                  : 'bg-brand-navy-light text-brand-muted hover:text-brand-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-brand-muted text-xs mb-3">
        Showing {filtered.length} of {mockCitizens.length} citizens
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No citizens found"
          message="Try adjusting your search or filter criteria."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-navy-light">
                  {['Citizen', 'Nagarik ID', 'State', 'Status', 'Trust', 'Biometrics', 'Registered', ''].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-3 text-brand-muted text-xs font-medium uppercase tracking-wider font-body"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-navy-light">
                {paginated.map((c) => (
                  <tr
                    key={c.nagarikId}
                    className="hover:bg-brand-navy-light/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedCitizen(c)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-saffron/80 to-brand-crypto-blue/80 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-brand-white text-sm font-medium">{c.name}</p>
                          <p className="text-brand-muted text-[10px]">{c.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-brand-white text-xs">{c.nagarikId}</td>
                    <td className="px-4 py-3 text-brand-white text-sm">{c.state}</td>
                    <td className="px-4 py-3">
                      <Badge status={statusBadge(c.status)} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-sm font-medium ${
                          c.aiTrustScore >= 90 ? 'text-green-400' : c.aiTrustScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                        }`}
                      >
                        {c.aiTrustScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <BiometricDot type="fingerprint" enrolled={c.biometrics.fingerprint === 'enrolled'} />
                        <BiometricDot type="face" enrolled={c.biometrics.face === 'enrolled'} />
                        <BiometricDot type="iris" enrolled={c.biometrics.iris === 'enrolled'} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-muted text-xs">{formatDate(c.registeredAt)}</td>
                    <td className="px-4 py-3">
                      <ChevronRight className="h-4 w-4 text-brand-muted" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-brand-navy-light">
              <p className="text-brand-muted text-xs">
                Showing {startIndex}-{endIndex} of {filtered.length} citizens
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="hidden sm:flex"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="ml-1 text-xs">Prev</span>
                </Button>
                <span className="px-3 py-1 text-xs text-brand-muted font-mono">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <span className="mr-1 text-xs">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="hidden sm:flex"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Detail panel */}
      {selectedCitizen && (
        <DetailPanel
          citizen={selectedCitizen}
          onClose={() => setSelectedCitizen(null)}
        />
      )}
    </motion.div>
  );
}

export default CitizenRegistry;
