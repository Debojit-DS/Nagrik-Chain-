import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Hash, QrCode, ShieldCheck, ArrowRight,
  Fingerprint, FileCheck2, Globe,
} from 'lucide-react';
import Button from '@components/ui/Button';
import BlockchainHashRibbon from '@components/blockchain/BlockchainHashRibbon';
import ashokaChakra from '@/assets/ashoka-chakra.svg';

const TABS = [
  { id: 'nagarik', label: 'Verify by Nagarik ID', icon: Fingerprint },
  { id: 'hash', label: 'Verify by Document Hash', icon: Hash },
  { id: 'qr', label: 'Scan QR Code', icon: QrCode },
];

function VerifyLanding() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('nagarik');
  const [nagarikId, setNagarikId] = useState('');
  const [docHash, setDocHash] = useState('');
  const [error, setError] = useState('');

  const handleVerifyId = useCallback(
    (e) => {
      e.preventDefault();
      setError('');
      const trimmed = nagarikId.trim();
      if (!trimmed) {
        setError('Please enter a Nagarik ID.');
        return;
      }
      if (!/^IND-\d{4}-\d{4}-NC$/i.test(trimmed)) {
        setError('Invalid format. Expected: IND-XXXX-XXXX-NC');
        return;
      }
      navigate(`/verify/${trimmed.toUpperCase()}`);
    },
    [nagarikId, navigate],
  );

  const handleVerifyHash = useCallback(
    (e) => {
      e.preventDefault();
      setError('');
      const trimmed = docHash.trim();
      if (!trimmed) {
        setError('Please enter a document hash.');
        return;
      }
      /* For the demo, hash verification redirects to the demo citizen */
      navigate('/verify/IND-9481-0032-NC');
    },
    [docHash, navigate],
  );

  const handleDemoClick = useCallback(() => {
    setActiveTab('nagarik');
    setNagarikId('IND-9481-0032-NC');
    setError('');
  }, []);

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col">
      {/* ─── Header ─── */}
      <header className="border-b border-brand-navy-light">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={ashokaChakra}
              alt="Ashoka Chakra"
              className="h-8 w-8"
            />
            <div>
              <h2 className="font-display font-bold text-brand-white text-lg leading-tight">
                NAGARIK CHAIN
              </h2>
              <span className="text-[11px] text-brand-muted tracking-wide">
                VERIFICATION PORTAL
              </span>
            </div>
          </div>
          <a
            href="/"
            className="text-brand-muted hover:text-brand-white text-body-sm transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </header>

      <BlockchainHashRibbon />

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl"
        >
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-brand-india-green/10 border border-brand-india-green/30 flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="w-8 h-8 text-brand-india-green" />
            </div>
            <h1 className="text-display-md text-brand-white mb-2">
              Document &amp; Identity Verification
            </h1>
            <p className="text-body-md text-brand-muted max-w-lg mx-auto">
              Verify any Nagarik Chain identity or document in seconds. No account required.
            </p>
            <span className="mt-3 inline-flex items-center gap-2 bg-brand-navy-mid border border-brand-navy-light rounded-full px-4 py-1.5 text-[11px] text-brand-muted">
              <Globe className="w-3.5 h-3.5" />
              Read-only, one-way verification. No personal data is stored or shared.
            </span>
          </div>

          {/* Tab Card */}
          <div className="bg-brand-navy-mid border border-brand-navy-light rounded-2xl shadow-card overflow-hidden">
            {/* Tab Row */}
            <div className="flex border-b border-brand-navy-light">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setError('');
                    }}
                    className={`
                      flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-display font-semibold
                      transition-colors border-b-2
                      ${
                        isActive
                          ? 'border-brand-india-green text-brand-white bg-brand-navy/40'
                          : 'border-transparent text-brand-muted hover:text-brand-white hover:bg-brand-navy/20'
                      }
                    `}
                    aria-label={tab.label}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-6 sm:p-8">
              {/* ── Tab 1: Verify by Nagarik ID ── */}
              {activeTab === 'nagarik' && (
                <motion.form
                  key="nagarik"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleVerifyId}
                  className="space-y-5"
                >
                  <label className="block">
                    <span className="text-body-sm text-brand-muted mb-1.5 block">
                      Nagarik ID
                    </span>
                    <input
                      type="text"
                      value={nagarikId}
                      onChange={(e) => setNagarikId(e.target.value)}
                      placeholder="IND-XXXX-XXXX-NC"
                      className="w-full bg-brand-navy border border-brand-navy-light rounded-lg px-4 py-3 text-brand-white font-mono placeholder:text-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-india-green"
                      id="verify-nagarik-id"
                    />
                  </label>
                  {error && (
                    <p className="text-brand-error text-body-sm">{error}</p>
                  )}
                  <Button type="submit" className="w-full">
                    <Search className="w-4 h-4" />
                    Verify Identity
                  </Button>
                </motion.form>
              )}

              {/* ── Tab 2: Verify by Document Hash ── */}
              {activeTab === 'hash' && (
                <motion.form
                  key="hash"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleVerifyHash}
                  className="space-y-5"
                >
                  <label className="block">
                    <span className="text-body-sm text-brand-muted mb-1.5 block">
                      Document SHA-256 Hash
                    </span>
                    <input
                      type="text"
                      value={docHash}
                      onChange={(e) => setDocHash(e.target.value)}
                      placeholder="0x3f8a9c2d4e1b7f6a..."
                      className="w-full bg-brand-navy border border-brand-navy-light rounded-lg px-4 py-3 text-brand-white font-mono placeholder:text-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-india-green"
                      id="verify-doc-hash"
                    />
                  </label>
                  {error && (
                    <p className="text-brand-error text-body-sm">{error}</p>
                  )}
                  <Button type="submit" className="w-full">
                    <FileCheck2 className="w-4 h-4" />
                    Verify Document
                  </Button>
                </motion.form>
              )}

              {/* ── Tab 3: QR Code ── */}
              {activeTab === 'qr' && (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-center py-6"
                >
                  <div className="w-full max-w-xs mx-auto border-2 border-dashed border-brand-navy-light rounded-xl p-10 flex flex-col items-center gap-4">
                    <QrCode className="w-12 h-12 text-brand-muted" />
                    <p className="text-body-sm text-brand-muted">
                      QR scanner is unavailable in this demo.
                      <br />
                      Please use <strong>Tab 1</strong> or <strong>Tab 2</strong>.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Demo helper */}
          <div className="text-center mt-6">
            <p className="text-body-sm text-brand-muted">
              Try a demo verification:{' '}
              <button
                onClick={handleDemoClick}
                className="text-brand-crypto-blue hover:underline font-mono"
              >
                IND-9481-0032-NC
              </button>
            </p>
          </div>

          {/* Trust indicators */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[11px] text-brand-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-india-green" />
              End-to-End Encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-brand-ai-purple" />
              AI-Powered Verification
            </span>
            <span className="flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-brand-crypto-blue" />
              Nagarik Chain Mainnet
            </span>
          </div>
        </motion.div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-brand-navy-light py-4 text-center text-body-sm text-brand-muted">
        NAGARIK CHAIN is a secure national digital identity infrastructure.
        &nbsp;|&nbsp; © 2026 Government of India.
      </footer>
    </div>
  );
}

export default VerifyLanding;
