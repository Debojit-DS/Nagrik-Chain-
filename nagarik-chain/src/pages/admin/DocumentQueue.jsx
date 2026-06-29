import { useState, useMemo, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck, FileX, AlertTriangle, Search, Filter,
  X, CheckCircle, XCircle, ArrowUpRight, Clock, Eye,
  ChevronRight, Shield, Brain,
} from 'lucide-react';
import { mockDocuments } from '@data/documents';
import { NotificationContext } from '@contexts/NotificationContext';
import PageHeader from '@components/ui/PageHeader';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import EmptyState from '@components/ui/EmptyState';
import { formatDate, truncateHash, formatBlockNumber } from '@utils/formatters';
import { generateHash } from '@utils/hashGenerator';

/* ── Expanded document queue with multiple citizens' docs ──── */
const allQueueDocs = [
  // Demo citizen docs
  ...mockDocuments.map((d) => ({
    ...d,
    citizenId: 'IND-9481-0032-NC',
    citizenName: 'Rajesh Kumar',
    submittedAt: `${d.uploadDate}T09:00:00Z`,
    queueStatus: d.status === 'Pending' ? 'pending' : 'approved',
    reviewedBy: d.status === 'Pending' ? null : 'GOV-4421',
  })),
  // More citizens' documents in queue
  {
    id: 'doc-q-001', name: 'Income Certificate', type: 'Financial',
    issuedBy: 'SDM Office, Lucknow', status: 'Pending',
    uploadDate: '2026-06-24', hash: generateHash(64), blockNumber: 28419035,
    aiConfidence: 72.1, citizenId: 'IND-9900-1234-NC', citizenName: 'Suresh Nair',
    submittedAt: '2026-06-24T14:30:00Z', queueStatus: 'pending', reviewedBy: null,
  },
  {
    id: 'doc-q-002', name: 'Voter ID Card', type: 'Identity',
    issuedBy: 'Election Commission', status: 'Pending',
    uploadDate: '2026-06-25', hash: generateHash(64), blockNumber: 28419038,
    aiConfidence: 95.4, citizenId: 'IND-7283-1094-NC', citizenName: 'Anita Devi',
    submittedAt: '2026-06-25T10:15:00Z', queueStatus: 'pending', reviewedBy: null,
  },
  {
    id: 'doc-q-003', name: 'Caste Certificate', type: 'Identity',
    issuedBy: 'District Collector, Patna', status: 'Pending',
    uploadDate: '2026-06-25', hash: generateHash(64), blockNumber: 28419040,
    aiConfidence: 88.9, citizenId: 'IND-5561-8823-NC', citizenName: 'Mohammed Iqbal',
    submittedAt: '2026-06-25T11:45:00Z', queueStatus: 'pending', reviewedBy: null,
  },
  {
    id: 'doc-q-004', name: 'Driving License', type: 'Identity',
    issuedBy: 'RTO Bangalore', status: 'Pending',
    uploadDate: '2026-06-26', hash: generateHash(64), blockNumber: 28419042,
    aiConfidence: 96.7, citizenId: 'IND-2245-6789-NC', citizenName: 'Kavita Patel',
    submittedAt: '2026-06-26T08:30:00Z', queueStatus: 'pending', reviewedBy: null,
  },
  {
    id: 'doc-q-005', name: 'Property Tax Receipt', type: 'Property',
    issuedBy: 'Municipal Corporation, Jaipur', status: 'Rejected',
    uploadDate: '2026-06-22', hash: generateHash(64), blockNumber: 28419028,
    aiConfidence: 64.3, citizenId: 'IND-8845-4421-NC', citizenName: 'Vijay Reddy',
    submittedAt: '2026-06-22T15:00:00Z', queueStatus: 'rejected',
    reviewedBy: 'GOV-3312', rejectionReason: 'Document appears tampered. Watermark mismatch detected.',
  },
];

const QUEUE_FILTERS = ['All', 'pending', 'approved', 'rejected'];

/* ── Review Panel ──────────────────────── */
function ReviewPanel({ doc, onClose, onApprove, onReject, onEscalate }) {
  if (!doc) return null;

  const confidenceColor =
    doc.aiConfidence >= 90 ? 'text-green-400' :
    doc.aiConfidence >= 70 ? 'text-yellow-400' : 'text-red-400';

  return (
    <AnimatePresence>
      <motion.div
        key="review-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <motion.aside
        key="review-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-brand-navy-mid border-l border-brand-navy-light z-50 overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-brand-navy-mid/95 backdrop-blur-sm border-b border-brand-navy-light p-5 flex items-center justify-between z-10">
          <h2 className="font-display font-bold text-lg text-brand-white">Document Review</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-white hover:bg-brand-navy-light transition-colors"
            aria-label="Close review panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Document preview placeholder */}
          <div className="bg-brand-navy rounded-xl border border-brand-navy-light p-8 flex flex-col items-center justify-center min-h-[200px]">
            <FileCheck className="h-12 w-12 text-brand-muted mb-3" />
            <p className="text-brand-muted text-sm">Document Preview</p>
            <p className="text-brand-muted text-xs mt-1">{doc.name}</p>
          </div>

          {/* AI Pre-verification */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-purple-400" />
              <p className="text-brand-white text-sm font-medium">AI Pre-Verification</p>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-brand-muted text-xs">Confidence Score</span>
              <span className={`font-mono font-bold ${confidenceColor}`}>{doc.aiConfidence}%</span>
            </div>
            <div className="w-full h-2 bg-brand-navy rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${doc.aiConfidence}%`,
                  backgroundColor: doc.aiConfidence >= 90 ? '#22c55e' : doc.aiConfidence >= 70 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
            {doc.aiConfidence < 80 && (
              <p className="text-yellow-400 text-xs mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Low confidence — Manual review recommended
              </p>
            )}
          </Card>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Citizen', value: doc.citizenName },
              { label: 'Nagarik ID', value: doc.citizenId },
              { label: 'Document Type', value: doc.type },
              { label: 'Issued By', value: doc.issuedBy },
              { label: 'Submitted', value: formatDate(doc.submittedAt) },
              { label: 'Block #', value: formatBlockNumber(doc.blockNumber) },
            ].map((item) => (
              <div key={item.label} className="bg-brand-navy rounded-lg p-3">
                <p className="text-brand-muted text-[10px] uppercase tracking-wider">{item.label}</p>
                <p className="text-brand-white text-sm font-medium mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Hash */}
          <div className="bg-brand-navy rounded-lg p-3">
            <p className="text-brand-muted text-[10px] uppercase tracking-wider mb-1">Document Hash</p>
            <p className="font-mono text-brand-white text-xs break-all">{doc.hash}</p>
          </div>

          {/* Actions */}
          {doc.queueStatus === 'pending' && (
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="primary" onClick={() => onApprove(doc)}>
                <CheckCircle className="h-4 w-4" /> Approve Document
              </Button>
              <Button variant="danger" onClick={() => onReject(doc)}>
                <XCircle className="h-4 w-4" /> Reject Document
              </Button>
              <Button variant="secondary" onClick={() => onEscalate(doc)}>
                <ArrowUpRight className="h-4 w-4" /> Escalate to Senior Officer
              </Button>
            </div>
          )}

          {doc.queueStatus === 'approved' && (
            <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-green-400 text-sm font-medium">Approved</p>
                <p className="text-brand-muted text-xs">Reviewed by {doc.reviewedBy}</p>
              </div>
            </div>
          )}

          {doc.queueStatus === 'rejected' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
                <XCircle className="h-5 w-5 text-red-400" />
                <div>
                  <p className="text-red-400 text-sm font-medium">Rejected</p>
                  <p className="text-brand-muted text-xs">Reviewed by {doc.reviewedBy}</p>
                </div>
              </div>
              {doc.rejectionReason && (
                <p className="text-brand-muted text-xs bg-brand-navy rounded-lg p-3">{doc.rejectionReason}</p>
              )}
            </div>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

/* ── Page ──────────────────────────────── */
function DocumentQueue() {
  const { addToast } = useContext(NotificationContext);
  const [docs, setDocs] = useState(allQueueDocs);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      const matchesFilter = filter === 'All' || d.queueStatus === filter;
      const term = search.toLowerCase();
      const matchesSearch =
        !term ||
        d.name.toLowerCase().includes(term) ||
        d.citizenId.toLowerCase().includes(term) ||
        d.citizenName.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [docs, filter, search]);

  const pendingCount = useMemo(() => docs.filter((d) => d.queueStatus === 'pending').length, [docs]);

  const handleApprove = useCallback((doc) => {
    setDocs((prev) =>
      prev.map((d) => d.id === doc.id ? { ...d, queueStatus: 'approved', reviewedBy: 'GOV-4421' } : d)
    );
    setSelectedDoc(null);
    addToast(`${doc.name} approved successfully`, 'success');
  }, [addToast]);

  const handleReject = useCallback((doc) => {
    setDocs((prev) =>
      prev.map((d) => d.id === doc.id ? { ...d, queueStatus: 'rejected', reviewedBy: 'GOV-4421', rejectionReason: 'Document rejected by officer.' } : d)
    );
    setSelectedDoc(null);
    addToast(`${doc.name} rejected`, 'warning');
  }, [addToast]);

  const handleEscalate = useCallback((doc) => {
    setSelectedDoc(null);
    addToast(`${doc.name} escalated to senior officer`, 'info');
  }, [addToast]);

  const statusBadge = (s) => {
    const map = { pending: 'pending', approved: 'verified', rejected: 'error' };
    return map[s] || 'inactive';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Document Queue"
        subtitle={`${pendingCount} documents pending review.`}
      />

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Search documents, citizens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-navy border border-brand-navy-light rounded-lg pl-10 pr-4 py-2.5 text-brand-white text-sm font-body placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-saffron focus:ring-2 focus:ring-brand-saffron/20 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-brand-muted" />
          {QUEUE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-brand-saffron text-white'
                  : 'bg-brand-navy-light text-brand-muted hover:text-brand-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No documents found"
          message="No documents match the current filter."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-navy-light">
                  {['Document', 'Citizen', 'Type', 'AI Score', 'Status', 'Submitted', ''].map((h) => (
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
                {filtered.map((d) => (
                  <tr
                    key={d.id}
                    className={`hover:bg-brand-navy-light/50 transition-colors cursor-pointer ${
                      d.queueStatus === 'pending' && d.aiConfidence < 80 ? 'bg-yellow-900/5' : ''
                    }`}
                    onClick={() => setSelectedDoc(d)}
                  >
                    <td className="px-4 py-3">
                      <p className="text-brand-white text-sm font-medium">{d.name}</p>
                      <p className="text-brand-muted text-[10px] font-mono">{truncateHash(d.hash)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-brand-white text-sm">{d.citizenName}</p>
                      <p className="text-brand-muted text-[10px] font-mono">{d.citizenId}</p>
                    </td>
                    <td className="px-4 py-3 text-brand-white text-sm">{d.type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-sm font-medium ${
                          d.aiConfidence >= 90 ? 'text-green-400' : d.aiConfidence >= 70 ? 'text-yellow-400' : 'text-red-400'
                        }`}
                      >
                        {d.aiConfidence}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={statusBadge(d.queueStatus)} size="sm">
                        {d.queueStatus.charAt(0).toUpperCase() + d.queueStatus.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-brand-muted text-xs">{formatDate(d.submittedAt)}</td>
                    <td className="px-4 py-3">
                      <ChevronRight className="h-4 w-4 text-brand-muted" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Review Panel */}
      {selectedDoc && (
        <ReviewPanel
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onEscalate={handleEscalate}
        />
      )}
    </motion.div>
  );
}

export default DocumentQueue;
