import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import { Radio, Pause, Play } from 'lucide-react';
import { mockContractEvents } from '@data/contracts';
import { generateMockContractEvent } from '@utils/hashGenerator';
import { useAuth } from '@hooks/useAuth';
import api from '@utils/api';
import { normalizeContract } from '@utils/adapter';
import { NotificationContext } from '@contexts/NotificationContext';
import PageHeader from '@components/ui/PageHeader';
import TransactionFeed from '@components/blockchain/TransactionFeed';
import Button from '@components/ui/Button';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';

const EVENT_FILTERS = ['All', 'Identity', 'Documents', 'Benefits', 'Flags'];
const filterMap = {
  Identity: ['IDENTITY_CREATED'],
  Documents: ['DOCUMENT_ANCHORED'],
  Benefits: ['BENEFIT_TRIGGERED', 'BENEFIT_TRANSFERRED'],
  Flags: ['FLAG_RAISED', 'FLAG_RESOLVED'],
};

function ContractsPage() {
  const { user } = useAuth();
  const { addToast } = useContext(NotificationContext);

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [events, setEvents] = useState(
    mockContractEvents.map((e) => ({ ...e, isNew: false }))
  );
  const [filter, setFilter] = useState('All');
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/api/v1/contracts/citizen/${user.nagarikId}`);
        const normalized = (data || []).map(normalizeContract);
        setContracts(normalized);
      } catch (err) {
        setError(err);
        setContracts([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.nagarikId) {
      fetchContracts();
    }
  }, [user?.nagarikId]);

  const triggerContract = async (contract) => {
    try {
      await api.post(`/api/v1/contracts/${contract.contractId}/trigger`);
      addToast(`Contract ${contract.contractId} triggered successfully`, 'success');
    } catch (err) {
      addToast('Failed to trigger contract', 'error');
    }
  };

  useEffect(() => {
    if (isPaused) {
      clearTimeout(intervalRef.current);
      return;
    }

    const scheduleNext = () => {
      const delay = 8000 + Math.random() * 4000;
      intervalRef.current = setTimeout(() => {
        const newEvent = generateMockContractEvent();
        setEvents((prev) => [newEvent, ...prev].slice(0, 50));
        addToast(`New event: ${newEvent.type.replace(/_/g, ' ')}`, 'info');
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => clearTimeout(intervalRef.current);
  }, [isPaused, addToast]);

  const filteredEvents = filter === 'All'
    ? events
    : events.filter((e) => filterMap[filter]?.includes(e.type));

  const togglePause = useCallback(() => setIsPaused((p) => !p), []);

  const activeContracts = contracts.filter(
    (c) => c.status === 'ACTIVE' || c.status === 'active'
  );
  const pausedContracts = contracts.filter(
    (c) => c.status === 'PAUSED' || c.status === 'paused'
  );

  const getNormalizedStatus = (status) => {
    if (!status) return 'inactive';
    const s = status.toLowerCase();
    if (s === 'active') return 'active';
    if (s === 'paused') return 'paused';
    return status;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Smart Contracts"
        subtitle="Read-only view of blockchain events affecting your identity."
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <p className="text-brand-muted text-xs">Total Contracts</p>
          <p className="text-brand-white text-2xl font-display font-bold">{contracts.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-brand-muted text-xs">Active</p>
          <p className="text-green-400 text-2xl font-display font-bold">{activeContracts.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-brand-muted text-xs">Paused</p>
          <p className="text-amber-400 text-2xl font-display font-bold">{pausedContracts.length}</p>
        </Card>
      </div>

      {/* Active/Paused Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-brand-saffron text-white'
              : 'bg-brand-navy-light text-brand-muted hover:text-brand-white'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-brand-saffron text-white'
              : 'bg-brand-navy-light text-brand-muted hover:text-brand-white'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab('paused')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'paused'
              ? 'bg-brand-saffron text-white'
              : 'bg-brand-navy-light text-brand-muted hover:text-brand-white'
          }`}
        >
          Paused
        </button>
      </div>

      {/* Contract Cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <p className="text-brand-muted">Loading contracts...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center py-12">
          <p className="text-red-400">Failed to load contracts. Showing empty state.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {(activeTab === 'all'
            ? contracts
            : activeTab === 'active'
            ? activeContracts
            : pausedContracts
          ).map((contract) => (
            <Card key={contract.contractId || contract.id} className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-brand-white">
                  {contract.contractType || 'Smart Contract'}
                </h3>
                <Badge status={getNormalizedStatus(contract.status)} size="sm">
                  {contract.status || 'UNKNOWN'}
                </Badge>
              </div>
              <p className="text-brand-muted text-xs mb-3">
                ID: {contract.contractId || contract.id}
              </p>
              <div className="flex justify-between items-center text-xs text-brand-muted mb-4">
                <span>
                  Deployed:{' '}
                  {contract.deployedAt
                    ? new Date(contract.deployedAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => triggerContract(contract)}
              >
                Trigger Contract
              </Button>
            </Card>
          ))}
          {(activeTab === 'all'
            ? contracts
            : activeTab === 'active'
            ? activeContracts
            : pausedContracts
          ).length === 0 && (
            <div className="col-span-full text-center py-8 text-brand-muted">
              No contracts found.
            </div>
          )}
        </div>
      )}

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
            {isPaused ? 'Feed Paused' : 'Live Feed'}
          </span>
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

      <TransactionFeed events={filteredEvents} />
    </motion.div>
  );
}

export default ContractsPage;
