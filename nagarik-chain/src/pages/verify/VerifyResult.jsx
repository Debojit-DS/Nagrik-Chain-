import { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, XCircle, ArrowLeft, Download,
  ShieldCheck, Fingerprint, Globe, Copy, Check,
} from 'lucide-react';
import Button from '@components/ui/Button';
import HashDisplay from '@components/blockchain/HashDisplay';
import BlockchainHashRibbon from '@components/blockchain/BlockchainHashRibbon';
import Badge from '@components/ui/Badge';
import { demoCitizen } from '@data/citizen';
import { generateMockBlock } from '@utils/hashGenerator';
import { formatDate, copyToClipboard } from '@utils/formatters';
import ashokaChakra from '@/assets/ashoka-chakra.svg';
import { NotificationContext } from '@contexts/NotificationContext';

function VerifyResult() {
  const { citizenId } = useParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [copied, setCopied] = useState(false);

  const isValid = citizenId === demoCitizen.nagarikId;

  /* Generate a mock blockchain proof for this verification */
  const verificationBlock = useMemo(() => generateMockBlock(), []);
  const verificationTimestamp = useMemo(() => new Date().toISOString(), []);

  /* Simulate a verification delay */
  useEffect(() => {
    const timer = setTimeout(() => setVerifying(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyAll = useCallback(async () => {
    const text = [
      `Block #${verificationBlock.blockNumber.toLocaleString('en-IN')}`,
      `TX Hash: ${verificationBlock.txHash}`,
      `Timestamp: ${verificationTimestamp}`,
      `Network: Nagarik Chain Mainnet`,
      `Citizen ID: ${citizenId}`,
    ].join('\n');
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [verificationBlock, verificationTimestamp, citizenId]);

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col">
      {/* ─── Header ─── */}
      <header className="border-b border-brand-navy-light">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ashokaChakra} alt="Ashoka Chakra" className="h-8 w-8" />
            <div>
              <h2 className="font-display font-bold text-brand-white text-lg leading-tight">
                NAGARIK CHAIN
              </h2>
              <span className="text-[11px] text-brand-muted tracking-wide">
                VERIFICATION PORTAL
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/verify')}
            className="flex items-center gap-1.5 text-brand-muted hover:text-brand-white text-body-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            New Verification
          </button>
        </div>
      </header>

      <BlockchainHashRibbon />

      {/* ─── Main ─── */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {/* Loading Spinner */}
        {verifying && <VerifyingAnimation />}

        {/* Result */}
        {!verifying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl"
          >
            {isValid ? (
              <VerifiedResult
                citizen={demoCitizen}
                block={verificationBlock}
                timestamp={verificationTimestamp}
                onCopyAll={handleCopyAll}
                copied={copied}
                onBack={() => navigate('/verify')}
              />
            ) : (
              <NotFoundResult
                citizenId={citizenId}
                onBack={() => navigate('/verify')}
              />
            )}
          </motion.div>
        )}
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-brand-navy-light py-4 text-center text-body-sm text-brand-muted">
        NAGARIK CHAIN is a secure national digital identity infrastructure.
        &nbsp;|&nbsp; © 2026 Government of India.
      </footer>
    </div>
  );
}

/* ───────────────────── Sub-Components ───────────────────── */

function VerifyingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center"
    >
      <div className="w-20 h-20 rounded-full border-4 border-brand-navy-light border-t-brand-india-green animate-spin mx-auto mb-6" />
      <p className="text-body-lg text-brand-white font-display">
        Verifying on Nagarik Chain&hellip;
      </p>
      <p className="text-body-sm text-brand-muted mt-2">
        Querying the blockchain ledger. This takes a moment.
      </p>
    </motion.div>
  );
}

function VerifiedResult({ citizen, block, timestamp, onCopyAll, copied, onBack }) {
  const { addToast } = useContext(NotificationContext);
  const yearOnly = new Date(citizen.issuedAt).getFullYear();

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-20 h-20 rounded-full bg-brand-india-green/15 border-2 border-brand-india-green/50 flex items-center justify-center mx-auto mb-5"
        >
          <CheckCircle2 className="w-10 h-10 text-brand-india-green" />
        </motion.div>
        <h1 className="text-display-md text-brand-india-green mb-1">
          IDENTITY VERIFIED
        </h1>
        <p className="text-body-sm text-brand-muted">
          This identity exists on the Nagarik Chain and is currently active.
        </p>
      </div>

      {/* Citizen Public Info */}
      <div className="bg-brand-navy-mid border border-brand-navy-light rounded-2xl p-6 sm:p-8 shadow-card">
        <h3 className="text-body-sm text-brand-muted font-display font-semibold uppercase tracking-wider mb-4">
          Public Verification Data
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
          <InfoRow label="Name" value={`${citizen.name.split(' ')[0]} ${citizen.name.split(' ').pop().charAt(0)}.`} />
          <InfoRow label="Nagarik ID" value={citizen.nagarikId} mono />
          <InfoRow
            label="Status"
            value={<Badge status="active">{citizen.status}</Badge>}
          />
          <InfoRow
            label="Biometric Verified"
            value={
              <span className="flex items-center gap-1.5 text-brand-india-green">
                <Fingerprint className="w-4 h-4" /> YES
              </span>
            }
          />
          <InfoRow label="Account Holder Since" value={yearOnly} />
          <InfoRow
            label="AI Trust Score"
            value={
              <span className="text-brand-india-green font-semibold">
                {citizen.aiTrustScore}%
              </span>
            }
          />
        </div>
      </div>

      {/* Blockchain Proof */}
      <div className="bg-brand-navy-mid border border-brand-navy-light rounded-2xl p-6 sm:p-8 shadow-card">
        <h3 className="text-body-sm text-brand-muted font-display font-semibold uppercase tracking-wider mb-4">
          Blockchain Proof
        </h3>
        <div className="space-y-3">
          <ProofRow
            label="Block #"
            value={`#${block.blockNumber.toLocaleString('en-IN')}`}
          />
          <ProofRow
            label="TX Hash"
            value={<HashDisplay hash={block.txHash} truncate={false} />}
          />
          <ProofRow label="Timestamp" value={formatDate(timestamp)} />
          <ProofRow label="Network" value="Nagarik Chain Mainnet" />
        </div>
        <p className="text-[11px] text-brand-muted mt-4 border-t border-brand-navy-light pt-3">
          This verification was logged on the blockchain at{' '}
          {new Date(timestamp).toLocaleString('en-IN')}.
        </p>
        <button
          onClick={onCopyAll}
          className="mt-3 flex items-center gap-1.5 text-brand-crypto-blue text-body-sm hover:underline"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy All'}
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onBack} variant="secondary" className="flex-1">
          <ShieldCheck className="w-4 h-4" />
          Verify Another
        </Button>
        <Button
          onClick={() => {
            addToast('Verification certificate downloaded.', 'success');
          }}
          className="flex-1"
        >
          <Download className="w-4 h-4" />
          Download Verification Certificate
        </Button>
      </div>
    </div>
  );
}

function NotFoundResult({ citizenId, onBack }) {
  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="w-20 h-20 rounded-full bg-brand-error/15 border-2 border-brand-error/50 flex items-center justify-center mx-auto"
      >
        <XCircle className="w-10 h-10 text-brand-error" />
      </motion.div>

      <div>
        <h1 className="text-display-md text-brand-error mb-2">
          IDENTITY NOT FOUND
        </h1>
        <p className="text-body-md text-brand-muted max-w-lg mx-auto">
          The Nagarik ID <span className="font-mono text-brand-white">{citizenId}</span>{' '}
          does not exist or has been deactivated. Please check the ID and try again.
        </p>
      </div>

      <div className="bg-brand-navy-mid border border-brand-navy-light rounded-xl p-5 max-w-md mx-auto text-left space-y-2">
        <p className="text-body-sm text-brand-muted">
          <span className="text-brand-white font-semibold">Suggestions:</span>
        </p>
        <ul className="text-body-sm text-brand-muted space-y-1 list-disc list-inside">
          <li>Ensure the format is <span className="font-mono text-brand-crypto-blue">IND-XXXX-XXXX-NC</span></li>
          <li>Contact the issuing authority if you believe this is an error.</li>
        </ul>
      </div>

      <Button onClick={onBack}>
        <ArrowLeft className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  );
}

/* ─── Tiny helper rows ─── */

function InfoRow({ label, value, mono = false }) {
  return (
    <div>
      <span className="block text-[11px] text-brand-muted uppercase tracking-wider mb-0.5">
        {label}
      </span>
      <span className={`text-brand-white text-body-md ${mono ? 'font-mono text-brand-crypto-blue' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function ProofRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
      <span className="text-body-sm text-brand-muted min-w-[80px]">{label}</span>
      <span className="text-body-sm text-brand-white font-mono break-all">{value}</span>
    </div>
  );
}

export default VerifyResult;
