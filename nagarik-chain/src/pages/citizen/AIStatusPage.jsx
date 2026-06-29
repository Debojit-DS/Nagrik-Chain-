import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Shield, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { mockOverallAIStatus, mockAIVerificationLog } from '@data/aiVerifications';
import PageHeader from '@components/ui/PageHeader';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import Modal from '@components/ui/Modal';
import Table from '@components/ui/Table';
import { formatDate, formatDateTime } from '@utils/formatters';

const stagger = {
  container: { transition: { staggerChildren: 0.05 } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } },
};

function TrustGauge({ score }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#1C2E50" strokeWidth="6" />
        <circle
          cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-2xl text-brand-white">{score}%</span>
        <span className="text-brand-muted text-[10px]">Trust Score</span>
      </div>
    </div>
  );
}

function AIStatusPage() {
  const [detailEntry, setDetailEntry] = useState(null);
  const aiStatus = mockOverallAIStatus;

  const columns = [
    { key: 'date', label: 'Date', render: (v) => formatDate(v) },
    { key: 'type', label: 'Type' },
    { key: 'input', label: 'Input' },
    { key: 'model', label: 'Model', render: (v) => <span className="font-mono text-xs">{v}</span> },
    {
      key: 'confidence',
      label: 'Confidence',
      render: (v) => (
        <span className={`font-mono text-xs ${v >= 90 ? 'text-green-400' : v >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
          {v}%
        </span>
      ),
    },
    {
      key: 'outcome',
      label: 'Outcome',
      render: (v) => (
        <Badge status={v === 'Approved' ? 'verified' : v === 'Flagged' ? 'flagged' : 'pending'} size="sm">
          {v}
        </Badge>
      ),
    },
  ];

  return (
    <motion.div initial="initial" animate="animate" variants={stagger.container}>
      <PageHeader
        title="AI Verification Engine"
        subtitle="Powered by Nagarik Intelligence Layer v2.1"
      />

      {/* Model badges */}
      <motion.div variants={stagger.item} className="flex flex-wrap gap-2 mb-6">
        {['BiometricNet-v3', 'DocVerify-v2', 'FraudNet-v1', 'EligibilityEngine-v1', 'LanguageParser'].map((m) => (
          <span key={m} className="px-2.5 py-1 bg-brand-ai-purple/20 border border-purple-700/40 rounded-full text-purple-300 text-[11px] font-mono">
            {m}
          </span>
        ))}
      </motion.div>

      {/* Trust Score + Sub-scores */}
      <motion.div variants={stagger.item} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 flex flex-col sm:flex-row items-center gap-6">
          <TrustGauge score={aiStatus.overallTrustScore} />
          <div className="flex-1 space-y-3">
            {[
              { label: 'Biometric Match', score: aiStatus.subScores.biometricMatch },
              { label: 'Document Integrity', score: aiStatus.subScores.documentIntegrity },
              { label: 'Behavioral Consistency', score: aiStatus.subScores.behavioralConsistency },
            ].map((sub) => (
              <div key={sub.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-brand-muted">{sub.label}</span>
                  <span className="text-brand-white">{sub.score}%</span>
                </div>
                <div className="h-1.5 bg-brand-navy rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-700"
                    style={{ width: `${sub.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-green-400" />
            <h3 className="font-display font-semibold text-brand-white">Status</h3>
          </div>
          <p className="text-green-400 text-sm mb-3">{aiStatus.status}</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-brand-muted">
              <span>Last Verified</span>
              <span className="text-brand-white">{formatDateTime(aiStatus.lastVerified)}</span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>Model</span>
              <span className="text-brand-white font-mono">{aiStatus.modelInfo.version}</span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>Last Trained</span>
              <span className="text-brand-white">{aiStatus.modelInfo.lastTrained}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Verification Log */}
      <motion.div variants={stagger.item}>
        <Card className="p-5">
          <h2 className="font-display font-semibold text-lg text-brand-white mb-4">
            Verification Log
          </h2>
          <Table
            columns={columns}
            data={mockAIVerificationLog}
            caption="AI Verification history"
            onRowClick={(row) => setDetailEntry(row)}
          />
        </Card>
      </motion.div>

      {/* Detail Modal */}
      <Modal isOpen={!!detailEntry} onClose={() => setDetailEntry(null)} title="Verification Details" size="lg">
        {detailEntry && (
          <div className="space-y-4">
            <div className="bg-brand-navy rounded-lg p-4">
              <p className="text-brand-muted text-xs mb-1">Input Received</p>
              <p className="text-brand-white text-sm">{detailEntry.details?.inputReceived}</p>
            </div>
            <div className="bg-brand-navy rounded-lg p-4">
              <p className="text-brand-muted text-xs mb-1">Features Extracted</p>
              <p className="text-brand-white text-sm">{detailEntry.details?.featuresExtracted}</p>
            </div>
            <div className="bg-brand-navy rounded-lg p-4">
              <p className="text-brand-muted text-xs mb-3">Pipeline Steps</p>
              <div className="space-y-2">
                {detailEntry.details?.pipeline?.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {step.passed ? (
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                    <span className="text-brand-white text-sm flex-1">{step.step}</span>
                    <span className="text-brand-muted text-xs font-mono">{step.duration}</span>
                  </div>
                ))}
              </div>
            </div>
            {detailEntry.details?.flagReason && (
              <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
                <p className="text-red-400 text-sm">{detailEntry.details.flagReason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
}

export default AIStatusPage;
