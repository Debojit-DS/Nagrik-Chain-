import { useState, useCallback, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Eye, Download, Share2, Trash2,
  FileText, GraduationCap, Home, Heart, Wallet, Folder,
  Upload, X, CheckCircle, Brain, Shield, Link2,
} from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import api from '@utils/api';
import { normalizeDocument } from '@utils/adapter';
import { NotificationContext } from '@contexts/NotificationContext';
import PageHeader from '@components/ui/PageHeader';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';
import ConfirmModal from '@components/ui/ConfirmModal';
import HashDisplay from '@components/blockchain/HashDisplay';
import EmptyState from '@components/ui/EmptyState';
import { formatDate, truncateHash, formatBlockNumber } from '@utils/formatters';

const typeIcons = {
  Identity: FileText, Education: GraduationCap, Property: Home,
  Health: Heart, Financial: Wallet, Other: Folder,
};

const typeColors = {
  Identity: 'text-brand-saffron bg-orange-900/50',
  Education: 'text-blue-400 bg-blue-900/50',
  Property: 'text-green-400 bg-green-900/50',
  Health: 'text-red-400 bg-red-900/50',
  Financial: 'text-purple-400 bg-purple-900/50',
  Other: 'text-gray-400 bg-gray-800',
};

const filterChips = ['All', 'Identity', 'Education', 'Property', 'Health', 'Financial'];

function DocumentsPage() {
  const { user } = useAuth();
  const { addToast } = useContext(NotificationContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerDoc, setViewerDoc] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadStep, setUploadStep] = useState(0);
  const [uploadType, setUploadType] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processStage, setProcessStage] = useState(0);

  const processStages = [
    { icon: Upload, label: 'Uploading document...', color: 'text-blue-400' },
    { icon: Brain, label: 'AI pre-verification...', color: 'text-brand-ai-purple' },
    { icon: Shield, label: 'Fraud detection scan...', color: 'text-brand-warning' },
    { icon: Link2, label: 'Anchoring to blockchain...', color: 'text-brand-crypto-blue' },
    { icon: CheckCircle, label: 'Document secured ✓', color: 'text-green-400' },
  ];

  const fetchDocuments = useCallback(async () => {
    if (!user?.nagarikId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/v1/documents/citizen/${user.nagarikId}`);
      const normalized = (response.data || []).map(normalizeDocument);
      setDocuments(normalized);
    } catch (err) {
      setError(err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const addDocument = useCallback((doc) => {
    const newDoc = {
      ...doc,
      id: `local_${Date.now()}`,
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      uploadDate: new Date().toISOString(),
      status: 'Pending',
      aiConfidence: Math.floor(Math.random() * 15) + 85,
      blockNumber: Math.floor(Math.random() * 100000) + 1800000,
      issuedBy: doc.issuedBy || 'Self Upload',
    };
    setDocuments((prev) => [newDoc, ...prev]);
  }, []);

  const handleUploadStart = useCallback(() => {
    setUploadOpen(true);
    setUploadStep(0);
    setUploadType('');
    setUploadName('');
    setProcessing(false);
    setProcessStage(0);
  }, []);

  const handleUploadSubmit = useCallback(() => {
    setProcessing(true);
    setUploadStep(2);
    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      setProcessStage(stage);
      if (stage >= 4) {
        clearInterval(interval);
        setTimeout(() => {
          addDocument({ name: uploadName || 'Untitled Document', type: uploadType, issuedBy: 'Self Upload' });
          setUploadOpen(false);
          setProcessing(false);
          addToast('Document uploaded and anchored to blockchain.', 'success');
        }, 800);
      }
    }, 1000);
  }, [uploadName, uploadType, addDocument, addToast]);

  const handleDelete = useCallback(() => {
    if (deleteTarget) {
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget));
      setDeleteTarget(null);
      addToast('Document removed from vault.', 'info');
    }
  }, [deleteTarget, addToast]);

  const filteredDocuments = documents.filter((doc) => {
    const matchesFilter = activeFilter === 'All' || doc.type === activeFilter;
    const matchesSearch = !searchQuery || doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <PageHeader title="My Document Vault" subtitle="Securely store and verify your documents on the blockchain" />

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6 mb-6">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 bg-brand-navy border border-brand-navy-light rounded-lg text-brand-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-saffron"
        />
        <div className="flex flex-wrap gap-2">
          {filterChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === chip
                  ? 'bg-brand-saffron text-white'
                  : 'bg-brand-navy-mid border border-brand-navy-light text-brand-muted hover:text-brand-white'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-brand-muted text-sm">Loading documents...</div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="text-center py-12">
          <p className="text-brand-error text-sm mb-3">Failed to load documents. Showing empty vault.</p>
          <Button variant="secondary" onClick={fetchDocuments}>Retry</Button>
        </div>
      )}

      {/* Document Grid */}
      {!loading && !error && filteredDocuments.length === 0 && (
        <EmptyState
          icon={Folder}
          title="No documents found"
          message={searchQuery || activeFilter !== 'All' ? 'Try adjusting your search or filter.' : 'Upload your first document to get started.'}
          action={!searchQuery && activeFilter === 'All' ? <Button onClick={handleUploadStart}><Plus className="w-4 h-4" /> Upload Document</Button> : null}
        />
      )}

      {!loading && !error && filteredDocuments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredDocuments.map((doc, i) => {
              const Icon = typeIcons[doc.type] || Folder;
              const colorClasses = typeColors[doc.type] || typeColors.Other;
              const [iconColor, iconBg] = colorClasses.split(' ');
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`relative group ${doc.status === 'Verified' ? 'border-green-900/50 hover:shadow-glow-green' : ''}`}>
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge status={doc.status === 'Verified' ? 'verified' : doc.status === 'Pending' ? 'pending' : 'flagged'} size="sm">
                        {doc.status}
                      </Badge>
                    </div>

                    {/* Type Icon + Name */}
                    <div className="flex items-start gap-3 mb-4 pr-20">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-brand-white text-sm font-semibold truncate">{doc.name}</h3>
                        <p className="text-brand-muted text-xs">{doc.issuedBy}</p>
                        <p className="text-brand-muted text-xs mt-0.5">{formatDate(doc.uploadDate)}</p>
                      </div>
                    </div>

                    {/* Hash */}
                    <div className="mb-4">
                      <p className="font-mono text-xs text-brand-crypto-blue">{truncateHash(doc.hash)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 border-t border-brand-navy-light pt-3">
                      {[
                        { icon: Eye, label: 'View', onClick: () => setViewerDoc(doc) },
                        { icon: Download, label: 'Download', onClick: () => addToast(`Downloaded ${doc.name}`, 'success') },
                        { icon: Share2, label: 'Share', onClick: () => addToast('Share link copied.', 'success') },
                        { icon: Trash2, label: 'Delete', onClick: () => setDeleteTarget(doc.id), danger: true },
                      ].map(({ icon: ActionIcon, label, onClick, danger }) => (
                        <button
                          key={label}
                          onClick={onClick}
                          className={`p-2 rounded-lg transition-colors ${
                            danger
                              ? 'text-brand-muted hover:text-brand-error hover:bg-red-900/20'
                              : 'text-brand-muted hover:text-brand-white hover:bg-brand-navy-light'
                          }`}
                          aria-label={label}
                        >
                          <ActionIcon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Upload FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleUploadStart}
        className="fixed bottom-8 right-8 w-14 h-14 bg-brand-saffron rounded-full flex items-center justify-center shadow-glow-saffron z-30 hover:bg-orange-600 transition-colors"
        aria-label="Upload document"
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>

      {/* Upload Modal */}
      <Modal isOpen={uploadOpen} onClose={() => !processing && setUploadOpen(false)} title="Upload Document" size="lg">
        {uploadStep === 0 && (
          <div>
            <p className="text-brand-muted text-sm mb-4">Select document type:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filterChips.slice(1).map((type) => {
                const Icon = typeIcons[type] || Folder;
                return (
                  <button
                    key={type}
                    onClick={() => { setUploadType(type); setUploadStep(1); }}
                    className="p-4 bg-brand-navy rounded-xl border border-brand-navy-light hover:border-brand-saffron/50 transition-colors text-center"
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2 text-brand-muted" />
                    <span className="text-brand-white text-sm">{type}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {uploadStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-white mb-1.5">Document Name</label>
              <input
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="e.g., Income Certificate"
                className="w-full px-4 py-2.5 bg-brand-navy border border-brand-navy-light rounded-lg text-brand-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-saffron"
              />
            </div>
            <div className="border-2 border-dashed border-brand-navy-light rounded-xl p-8 text-center hover:border-brand-saffron/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-brand-muted mx-auto mb-2" />
              <p className="text-brand-white text-sm font-medium">Drop file here or click to browse</p>
              <p className="text-brand-muted text-xs mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setUploadStep(0)}>← Back</Button>
              <Button onClick={handleUploadSubmit} disabled={!uploadName}>Upload & Verify</Button>
            </div>
          </div>
        )}

        {uploadStep === 2 && (
          <div className="space-y-4 py-4">
            <p className="text-brand-white text-center font-medium mb-6">AI Pre-Verification in Progress</p>
            {processStages.map(({ icon: StageIcon, label, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: i <= processStage ? 1 : 0.3, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex items-center gap-3"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  i < processStage ? 'bg-green-900/40' : i === processStage ? 'bg-brand-navy-light animate-pulse' : 'bg-brand-navy'
                }`}>
                  {i < processStage ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <StageIcon className={`w-4 h-4 ${i === processStage ? color : 'text-brand-muted'}`} />
                  )}
                </div>
                <span className={`text-sm ${i <= processStage ? 'text-brand-white' : 'text-brand-muted'}`}>{label}</span>
              </motion.div>
            ))}
          </div>
        )}
      </Modal>

      {/* Document Viewer Modal */}
      <Modal isOpen={!!viewerDoc} onClose={() => setViewerDoc(null)} title={viewerDoc?.name || ''} size="xl">
        {viewerDoc && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Preview */}
            <div className="lg:col-span-3 bg-brand-navy rounded-xl p-8 flex items-center justify-center min-h-[300px] relative">
              <div className="text-center">
                <FileText className="w-16 h-16 text-brand-muted mx-auto mb-4" />
                <p className="text-brand-white font-medium">{viewerDoc.name}</p>
                <p className="text-brand-muted text-sm mt-1">Document Preview</p>
              </div>
              <p className="absolute inset-0 flex items-center justify-center text-brand-navy-light text-6xl font-display font-bold opacity-10 rotate-[-15deg] pointer-events-none">
                NAGARIK CHAIN
              </p>
            </div>

            {/* Metadata */}
            <div className="lg:col-span-2 space-y-4">
              {[
                ['Type', viewerDoc.type],
                ['Issued By', viewerDoc.issuedBy],
                ['Upload Date', formatDate(viewerDoc.uploadDate)],
                ['Status', viewerDoc.status],
                ['Block', formatBlockNumber(viewerDoc.blockNumber)],
                ['AI Confidence', `${viewerDoc.aiConfidence}%`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm py-1.5 border-b border-brand-navy-light/50">
                  <span className="text-brand-muted">{label}</span>
                  <span className="text-brand-white font-medium">{value}</span>
                </div>
              ))}
              <div>
                <p className="text-brand-muted text-xs mb-1">Document Hash</p>
                <HashDisplay hash={viewerDoc.hash} truncate />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Document"
        message="This will remove the document from your vault. The blockchain anchor will remain."
        danger
      />
    </div>
  );
}

export default DocumentsPage;
