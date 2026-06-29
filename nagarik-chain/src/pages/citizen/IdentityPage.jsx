import { useState, useCallback, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  Download, Share2, Link2, AlertCircle,
  Copy, Check, ExternalLink, Fingerprint, ScanFace, Eye,
} from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { NotificationContext } from '@contexts/NotificationContext';
import NagarikIDCard from '@components/identity/NagarikIDCard';
import PageHeader from '@components/ui/PageHeader';
import Card from '@components/ui/Card';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import HashDisplay from '@components/blockchain/HashDisplay';
import { formatDate, maskEmail, truncateHash } from '@utils/formatters';

function IdentityPage() {
  const { user } = useAuth();
  const { addToast } = useContext(NotificationContext);
  const [activeTab, setActiveTab] = useState('personal');
  const [blockExplorerOpen, setBlockExplorerOpen] = useState(false);
  const [reportIssueOpen, setReportIssueOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  const handleDownload = useCallback(() => {
    addToast('Identity card downloaded as PDF.', 'success');
  }, [addToast]);

  const handleShare = useCallback(async () => {
    addToast('Verification link copied to clipboard.', 'success');
  }, [addToast]);

  const actions = [
    { icon: Download, label: 'Download ID', onClick: handleDownload, color: 'text-brand-saffron' },
    { icon: Share2, label: 'Share', onClick: handleShare, color: 'text-brand-crypto-blue' },
    { icon: Link2, label: 'View on Blockchain', onClick: () => setBlockExplorerOpen(true), color: 'text-brand-ai-purple' },
    { icon: AlertCircle, label: 'Report Issue', onClick: () => setReportIssueOpen(true), color: 'text-brand-warning' },
  ];

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'biometrics', label: 'Biometric Status' },
    { id: 'services', label: 'Linked Services' },
  ];

  const linkedServices = [
    { name: 'Aadhaar', linked: user?.linkedServices?.aadhaar },
    { name: 'PAN', linked: user?.linkedServices?.pan },
    { name: 'Voter ID (EPIC)', linked: user?.linkedServices?.epic },
    { name: 'Passport', linked: user?.linkedServices?.passport },
    { name: 'Driving Licence', linked: user?.linkedServices?.drivingLicence },
  ];

  return (
    <div>
      <PageHeader title="My Digital Identity" subtitle="Your blockchain-anchored Nagarik ID" />

      {/* Hero Card */}
      <div className="flex justify-center mt-8 mb-10 px-4">
        <NagarikIDCard citizen={user} />
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {actions.map(({ icon: Icon, label, onClick, color }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="bg-brand-navy-mid border border-brand-navy-light rounded-xl p-4 text-center hover:border-brand-navy-light/80 transition-all group"
          >
            <Icon className={`w-5 h-5 mx-auto mb-2 ${color} group-hover:scale-110 transition-transform`} />
            <span className="text-brand-white text-sm font-medium">{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Tabbed Details */}
      <Card className="p-4 sm:p-6">
        <div className="flex gap-1 border-b border-brand-navy-light mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-brand-saffron'
                  : 'text-brand-muted hover:text-brand-white'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-saffron rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            {[
              ['Full Name', user?.name],
              ['Date of Birth', formatDate(user?.dob)],
              ['Gender', user?.gender],
              ['Mobile', user?.mobile],
              ['Email', maskEmail(user?.email)],
              ['State', user?.state],
              ['District', user?.district],
              ['Pin Code', user?.pinCode],
              ['Address', user?.address],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-brand-navy-light/50 last:border-0">
                <span className="text-brand-muted text-sm">{label}</span>
                <span className="text-brand-white text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Biometrics Tab */}
        {activeTab === 'biometrics' && (
          <div className="space-y-4">
            {[
              { icon: Fingerprint, name: 'Fingerprint', data: user?.biometrics?.fingerprint },
              { icon: ScanFace, name: 'Face', data: user?.biometrics?.face },
              { icon: Eye, name: 'Iris', data: user?.biometrics?.iris },
            ].map(({ icon: Icon, name, data }) => (
              <div key={name} className="flex items-center justify-between p-4 bg-brand-navy rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    data?.status === 'enrolled' ? 'bg-green-900/40' : 'bg-gray-800'
                  }`}>
                    <Icon className={`w-5 h-5 ${data?.status === 'enrolled' ? 'text-green-400' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="text-brand-white text-sm font-medium">{name}</p>
                    <p className={`text-xs ${data?.status === 'enrolled' ? 'text-green-400' : 'text-gray-500'}`}>
                      {data?.status === 'enrolled' ? `Enrolled — Last verified ${formatDate(data.lastVerified)}` : 'Not Enrolled'}
                    </p>
                  </div>
                </div>
                <Badge status={data?.status === 'enrolled' ? 'verified' : 'inactive'} size="sm">
                  {data?.status === 'enrolled' ? 'Enrolled' : 'Not Enrolled'}
                </Badge>
              </div>
            ))}
            <Button variant="secondary" disabled className="mt-4 w-full" title="Biometric updates require in-person verification">
              Update Biometrics (In-Person Only)
            </Button>
          </div>
        )}

        {/* Linked Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-3">
            {linkedServices.map(({ name, linked }) => (
              <div key={name} className="flex items-center justify-between p-4 bg-brand-navy rounded-xl">
                <span className="text-brand-white text-sm font-medium">{name}</span>
                {linked ? (
                  <Badge status="verified" size="sm">Linked ✓</Badge>
                ) : (
                  <button
                    onClick={() => setLinkModalOpen(true)}
                    className="text-brand-saffron text-sm hover:underline font-medium"
                  >
                    Link Now →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Block Explorer Modal */}
      <Modal isOpen={blockExplorerOpen} onClose={() => setBlockExplorerOpen(false)} title="Block Explorer" size="lg">
        <div className="space-y-4">
          {[
            ['Block Number', `#${Number(user?.blockNumber).toLocaleString('en-IN')}`],
            ['Network', 'Nagarik Chain Mainnet (NRK-1)'],
            ['Confirmations', '2,841,904'],
            ['Status', 'Finalized ✓'],
            ['Contract', 'IdentityRegistry.sol'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-b border-brand-navy-light/50">
              <span className="text-brand-muted text-sm">{label}</span>
              <span className="text-brand-white text-sm font-mono">{value}</span>
            </div>
          ))}
          <div className="flex justify-between py-2 border-b border-brand-navy-light/50">
            <span className="text-brand-muted text-sm">Block Hash</span>
            <HashDisplay hash={user?.blockHash} truncate />
          </div>
          <div className="flex justify-between py-2">
            <span className="text-brand-muted text-sm">TX Hash</span>
            <HashDisplay hash={user?.txHash} truncate />
          </div>
        </div>
      </Modal>

      {/* Report Issue Modal */}
      <Modal isOpen={reportIssueOpen} onClose={() => setReportIssueOpen(false)} title="Report an Issue">
        <div className="space-y-4">
          <p className="text-brand-muted text-sm">Describe the issue with your identity record.</p>
          <textarea
            rows={4}
            placeholder="Describe the issue..."
            className="w-full px-4 py-3 bg-brand-navy border border-brand-navy-light rounded-lg text-brand-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-saffron resize-none"
          />
          <Button onClick={() => { setReportIssueOpen(false); addToast('Issue reported. Reference #NRK-28419.', 'success'); }}>
            Submit Report
          </Button>
        </div>
      </Modal>

      {/* Link Service Modal */}
      <Modal isOpen={linkModalOpen} onClose={() => setLinkModalOpen(false)} title="Link Service">
        <div className="space-y-4">
          <p className="text-brand-muted text-sm">
            Service linking requires government verification and is unavailable in this demo.
          </p>
          <Button variant="secondary" onClick={() => setLinkModalOpen(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  );
}

export default IdentityPage;
