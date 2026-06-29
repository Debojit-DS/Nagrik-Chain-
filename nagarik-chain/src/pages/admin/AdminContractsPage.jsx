import { useState, useEffect, useCallback, useRef, useContext, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Radio, Pause, Play, Eye, RotateCw, Code2, ShieldAlert,
} from 'lucide-react';
import { mockContractEvents } from '@data/contracts';
import { generateMockContractEvent } from '@utils/hashGenerator';
import { NotificationContext } from '@contexts/NotificationContext';
import PageHeader from '@components/ui/PageHeader';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Modal from '@components/ui/Modal';
import { formatDateTime, truncateHash, formatBlockNumber } from '@utils/formatters';

const EVENT_FILTERS = ['All', 'Identity', 'Documents', 'Benefits', 'Verification', 'Flags'];
const filterMap = {
  Identity: ['IDENTITY_CREATED'],
  Documents: ['DOCUMENT_ANCHORED'],
  Benefits: ['BENEFIT_TRIGGERED', 'BENEFIT_TRANSFERRED'],
  Verification: ['VERIFICATION_COMPLETED'],
  Flags: ['FLAG_RAISED', 'FLAG_RESOLVED'],
};

const typeColors = {
  IDENTITY_CREATED: 'active',
  DOCUMENT_ANCHORED: 'verified',
  BENEFIT_TRIGGERED: 'active',
  BENEFIT_TRANSFERRED: 'verified',
  VERIFICATION_COMPLETED: 'verified',
  FLAG_RAISED: 'flagged',
  FLAG_RESOLVED: 'verified',
};

const SOLIDITY_TEMPLATE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NagrikContract {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function execute(address target, bytes calldata data) 
        external 
        onlyOwner 
        returns (bytes memory) 
    {
        (bool success, bytes memory result) = target.call(data);
        require(success, "Execution failed");
        return result;
    }
}`;

/* ── Page ──────────────────────────────── */
function AdminContractsPage() {
  const { addToast } = useContext(NotificationContext);
  const [events, setEvents] = useState(
    mockContractEvents.map((e) => ({ ...e, isNew: false }))
  );
  const [filter, setFilter] = useState('All');
  const [isPaused, setIsPaused] = useState(false);
  const [codeModal, setCodeModal] = useState(null);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const intervalRef = useRef(null);

  // Live feed: add new event every 6-10s (faster for admin)
  useEffect(() => {
    if (isPaused) {
      clearInterval(intervalRef.current);
      return;
    }

    const scheduleNext = () => {
      const delay = 6000 + Math.random() * 4000;
      intervalRef.current = setTimeout(() => {
        const newEvent = generateMockContractEvent();
        setEvents((prev) => [newEvent, ...prev].slice(0, 50));
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => clearTimeout(intervalRef.current);
  }, [isPaused]);

  const filteredEvents = useMemo(() => {
    if (filter === 'All') return events;
    return events.filter((e) => filterMap[filter]?.includes(e.type));
  }, [events, filter]);

  const togglePause = useCallback(() => setIsPaused((p) => !p), []);

  const handlePauseContract = useCallback(
    (e) => {
      addToast(`Pause initiated for ${e.contractName}`, 'warning');
    },
    [addToast]
  );

  const handleForceTrigger = useCallback(
    (e) => {
      addToast(`Force trigger sent for ${e.contractName}`, 'info');
    },
    [addToast]
  );

  const handleDeploy = useCallback(async () => {
    setIsDeploying(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsDeploying(false);
    setDeployModalOpen(false);
    addToast('Smart contract deployed successfully to Nagarik Chain', 'success');
  }, [addToast]);

  // Stats
  const totalEvents = events.length;
  const liveCount = events.filter((e) => e.isNew).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <PageHeader
          title="Smart Contracts"
          subtitle="Admin view — All citizens' blockchain events. Monitor, pause, and trigger contracts."
        />
        <Button
          variant="primary"
          size="md"
          onClick={() => setDeployModalOpen(true)}
          className="shrink-0"
        >
          Deploy New Contract
        </Button>
      </div>

      {/* Live indicator + controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          {!isPaused && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
          )}
          <Radio className={`w-4 h-4 ${isPaused ? 'text-brand-muted' : 'text-green-400'}`} />
          <span className={`text-sm font-body ${isPaused ? 'text-brand-muted' : 'text-green-400'}`}>
            {isPaused ? 'Feed Paused' : 'Live Feed — All Citizens'}
          </span>
          <span className="text-brand-muted text-xs">({totalEvents} events, {liveCount} new)</span>
          <Button variant="ghost" size="sm" onClick={togglePause}>
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {EVENT_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
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

      {/* Events Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-navy-light">
                {['Type', 'Description', 'Contract', 'Block', 'TX Hash', 'Time', 'Actions'].map((h) => (
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
              {filteredEvents.map((evt) => (
                <motion.tr
                  key={evt.id}
                  initial={evt.isNew ? { opacity: 0, backgroundColor: 'rgba(251, 146, 60, 0.1)' } : false}
                  animate={{ opacity: 1, backgroundColor: 'rgba(0,0,0,0)' }}
                  transition={{ duration: 0.6 }}
                  className="hover:bg-brand-navy-light/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Badge status={typeColors[evt.type] || 'inactive'} size="sm">
                      {evt.type.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-brand-white text-sm max-w-[260px] truncate">
                    {evt.description}
                  </td>
                  <td className="px-4 py-3 font-mono text-brand-muted text-xs">{evt.contractName}</td>
                  <td className="px-4 py-3 font-mono text-brand-white text-xs">
                    {formatBlockNumber(evt.blockNumber)}
                  </td>
                  <td className="px-4 py-3 font-mono text-brand-muted text-xs">{truncateHash(evt.txHash)}</td>
                  <td className="px-4 py-3 text-brand-muted text-xs whitespace-nowrap">
                    {formatDateTime(evt.timestamp)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        title="Pause Contract"
                        onClick={() => handlePauseContract(evt)}
                        className="p-1.5 rounded text-brand-muted hover:text-yellow-400 hover:bg-yellow-900/20 transition-colors"
                        aria-label={`Pause ${evt.contractName}`}
                      >
                        <Pause className="h-3.5 w-3.5" />
                      </button>
                      <button
                        title="Force Trigger"
                        onClick={() => handleForceTrigger(evt)}
                        className="p-1.5 rounded text-brand-muted hover:text-brand-saffron hover:bg-orange-900/20 transition-colors"
                        aria-label={`Force trigger ${evt.contractName}`}
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </button>
                      {evt.solidityCode && (
                        <button
                          title="View Bytecode"
                          onClick={() => setCodeModal(evt)}
                          className="p-1.5 rounded text-brand-muted hover:text-blue-400 hover:bg-blue-900/20 transition-colors"
                          aria-label={`View code for ${evt.contractName}`}
                        >
                          <Code2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Deploy New Contract Modal */}
      <Modal
        isOpen={deployModalOpen}
        onClose={() => !isDeploying && setDeployModalOpen(false)}
        title="Deploy New Smart Contract"
        size="lg"
      >
        <div className="space-y-4">
          <textarea
            placeholder={SOLIDITY_TEMPLATE}
            className="w-full h-48 bg-brand-navy border border-brand-navy-light rounded-lg p-4 font-mono text-sm text-green-400 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-saffron resize-none"
            disabled={isDeploying}
          />
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleDeploy}
              disabled={isDeploying}
              className="min-w-[120px]"
            >
              {isDeploying ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Deploying to Nagarik Chain...
                </span>
              ) : (
                'Deploy'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Code Modal */}
      <Modal
        isOpen={!!codeModal}
        onClose={() => setCodeModal(null)}
        title={codeModal?.contractName || 'Contract Code'}
        size="lg"
      >
        {codeModal?.solidityCode && (
          <pre className="bg-brand-navy rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
            {codeModal.solidityCode}
          </pre>
        )}
      </Modal>
    </motion.div>
  );
}

export default AdminContractsPage;
