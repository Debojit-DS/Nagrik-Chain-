import { useState, useEffect, useCallback, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import PageHeader from '@components/ui/PageHeader';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import { NotificationContext } from '@contexts/NotificationContext';
import { mockCitizens } from '@data/mockCitizens';

const stagger = {
  container: { transition: { staggerChildren: 0.05 } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } },
};

const modelPerformance = [
  { model: 'BiometricNet', accuracy: 99.1, requests: 142000, avgLatency: '0.42s' },
  { model: 'DocVerify', accuracy: 96.8, requests: 89000, avgLatency: '0.88s' },
  { model: 'FraudNet', accuracy: 94.2, requests: 31000, avgLatency: '0.15s' },
  { model: 'EligibilityEngine', accuracy: 97.5, requests: 56000, avgLatency: '0.12s' },
  { model: 'LanguageParser', accuracy: 98.3, requests: 118000, avgLatency: '0.04s' },
];

const outcomeData = [
  { name: 'Approved', value: 14200, color: '#22c55e' },
  { name: 'Flagged', value: 890, color: '#f59e0b' },
  { name: 'Referred', value: 420, color: '#3b82f6' },
  { name: 'Rejected', value: 180, color: '#ef4444' },
];

const weeklyVolume = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  jobs: Math.floor(1800 + Math.random() * 800),
}));

const taskTypes = [
  'Biometric Re-verification',
  'Document Re-scan',
  'Fraud Check',
  'Eligibility Check',
];

const generateMockJob = (id, citizens) => {
  const citizen = citizens[Math.floor(Math.random() * citizens.length)];
  const randomId = () => Math.floor(100000 + Math.random() * 900000).toString();
  const priorities = ['High', 'Medium', 'Low'];
  const statuses = ['Queued', 'Processing', 'Done', 'Error'];
  const durations = ['0.1s', '0.3s', '0.5s', '1.2s', '0.8s'];
  
  return {
    id: id || `JOB-${randomId()}`,
    citizenId: citizen.nagarikId,
    task: taskTypes[Math.floor(Math.random() * taskTypes.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    duration: durations[Math.floor(Math.random() * durations.length)],
    startedAt: Date.now() - Math.floor(Math.random() * 60000),
  };
};

function AIEnginePage() {
  const { addToast } = useContext(NotificationContext);
  const [jobs, setJobs] = useState([
    generateMockJob('JOB-123456', mockCitizens),
    generateMockJob('JOB-789012', mockCitizens),
    generateMockJob('JOB-345678', mockCitizens),
  ]);
  const [manualCitizenId, setManualCitizenId] = useState('');
  const [manualTask, setManualTask] = useState(taskTypes[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  const maskCitizenId = useCallback((id) => {
    if (!id) return '';
    const parts = id.split('-');
    if (parts.length >= 4) {
      return `IND-${parts[1].slice(0, 2)}**-${parts[2]}-NC`;
    }
    return id;
  }, []);

  const simulateQueue = useCallback(() => {
    setJobs((prevJobs) => {
      const updatedJobs = prevJobs.map((job) => {
        if (job.status === 'Queued' && Math.random() > 0.4) {
          return { ...job, status: 'Processing' };
        }
        if (job.status === 'Processing' && Math.random() > 0.5) {
          return { ...job, status: Math.random() > 0.2 ? 'Done' : 'Error' };
        }
        return job;
      });
      
      if (Math.random() > 0.3) {
        const randomId = () => Math.floor(100000 + Math.random() * 900000).toString();
        updatedJobs.unshift({
          id: `JOB-${randomId()}`,
          citizenId: mockCitizens[Math.floor(Math.random() * mockCitizens.length)].nagarikId,
          task: taskTypes[Math.floor(Math.random() * taskTypes.length)],
          priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
          status: 'Queued',
          duration: '0.0s',
          startedAt: Date.now(),
        });
      }
      
      return updatedJobs.slice(0, 10);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(simulateQueue, 3000);
    return () => clearInterval(interval);
  }, [simulateQueue]);

  const handleManualOverride = useCallback(() => {
    if (!manualCitizenId.trim()) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      addToast(`Manual override completed: ${manualTask} for ${manualCitizenId}`, 'success');
      setManualCitizenId('');
    }, 1500);
  }, [manualCitizenId, manualTask, addToast]);

  const handleRetry = useCallback((jobId) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, status: 'Queued' } : job
      )
    );
    addToast(`Retry initiated for job ${jobId}`, 'info');
  }, [addToast]);

  return (
    <motion.div initial="initial" animate="animate" variants={stagger.container}>
      <PageHeader title="AI Verification Engine" subtitle="Model performance, processing metrics, and configuration." />

      {/* Model Performance Cards */}
      <motion.div variants={stagger.item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {modelPerformance.map((m) => (
          <Card key={m.model} className="p-4">
            <p className="font-mono text-xs text-brand-ai-purple mb-1">{m.model}</p>
            <p className="text-brand-white text-xl font-display font-bold">{m.accuracy}%</p>
            <p className="text-brand-muted text-[10px]">{m.requests.toLocaleString('en-IN')} requests</p>
            <p className="text-brand-muted text-[10px]">Avg: {m.avgLatency}</p>
          </Card>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={stagger.item} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Outcome Pie */}
        <Card className="p-5">
          <h3 className="font-display font-semibold text-brand-white mb-4">Verification Outcomes</h3>
          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={outcomeData} dataKey="value" cx="50%" cy="50%" outerRadius={80} strokeWidth={2} stroke="#0B1426">
                  {outcomeData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111D35', border: '1px solid #1C2E50', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-3">
            {outcomeData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-brand-muted text-xs">{d.name}: {d.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Volume */}
        <Card className="p-5">
          <h3 className="font-display font-semibold text-brand-white mb-4">Weekly Processing Volume</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2E50" />
                <XAxis dataKey="day" tick={{ fill: '#7A8BB0', fontSize: 11 }} />
                <YAxis tick={{ fill: '#7A8BB0', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#111D35', border: '1px solid #1C2E50', borderRadius: '8px' }} />
                <Bar dataKey="jobs" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Config Panel */}
      <motion.div variants={stagger.item}>
        <Card className="p-5">
          <h3 className="font-display font-semibold text-brand-white mb-4">Engine Configuration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['Auto-approve Threshold', '≥ 95.0%'],
              ['Auto-flag Threshold', '≤ 70.0%'],
              ['Max Batch Size', '500 documents'],
              ['Processing Mode', 'Real-time'],
              ['Model Version', 'NGC-V2.1-PROD'],
              ['Last Retrained', 'March 2026'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-2 border-b border-brand-navy-light/50">
                <span className="text-brand-muted text-sm">{k}</span>
                <Badge status="active" size="sm">{v}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Live Job Queue */}
      <motion.div variants={stagger.item} className="mt-8">
        <Card className="p-5">
          <h3 className="font-display font-semibold text-brand-white mb-4">Live Job Queue</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-navy-light">
                  <th className="text-left py-2 px-3 text-brand-muted font-medium">Job ID</th>
                  <th className="text-left py-2 px-3 text-brand-muted font-medium">Citizen ID</th>
                  <th className="text-left py-2 px-3 text-brand-muted font-medium">Task</th>
                  <th className="text-left py-2 px-3 text-brand-muted font-medium">Priority</th>
                  <th className="text-left py-2 px-3 text-brand-muted font-medium">Status</th>
                  <th className="text-left py-2 px-3 text-brand-muted font-medium">Duration</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className={`
                      border-b border-brand-navy-light/30 last:border-0
                      ${job.status === 'Processing' ? 'animate-pulse bg-brand-navy-light/20' : ''}
                      ${job.status === 'Done' ? 'bg-green-500/5' : ''}
                      ${job.status === 'Error' ? 'bg-red-500/10' : ''}
                    `}
                  >
                    <td className="py-2 px-3 font-mono text-brand-ai-purple">{job.id}</td>
                    <td className="py-2 px-3 font-mono text-brand-white">{maskCitizenId(job.citizenId)}</td>
                    <td className="py-2 px-3 text-brand-white">{job.task}</td>
                    <td className="py-2 px-3">
                      <Badge
                        status={job.priority === 'High' ? 'active' : job.priority === 'Medium' ? 'warning' : 'inactive'}
                        size="sm"
                      >
                        {job.priority}
                      </Badge>
                    </td>
                    <td className="py-2 px-3">
                      {job.status === 'Done' ? (
                        <span className="flex items-center gap-1 text-green-400">
                          <span className="text-lg">✓</span>
                          <span>Done</span>
                        </span>
                      ) : job.status === 'Error' ? (
                        <div className="flex items-center gap-2">
                          <span className="text-red-400">Error</span>
                          <Button size="sm" variant="ghost" onClick={() => handleRetry(job.id)}>
                            Retry
                          </Button>
                        </div>
                      ) : (
                        <Badge
                          status={job.status === 'Processing' ? 'active' : 'inactive'}
                          size="sm"
                        >
                          {job.status}
                        </Badge>
                      )}
                    </td>
                    <td className="py-2 px-3 text-brand-muted">{job.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Manual Override Panel */}
      <motion.div variants={stagger.item} className="mt-8">
        <Card className="p-5">
          <h3 className="font-display font-semibold text-brand-white mb-4">Manual AI Override</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Citizen ID"
                placeholder="IND-XXXX-XXXX-NC"
                value={manualCitizenId}
                onChange={(e) => setManualCitizenId(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div>
              <label className="text-body-sm text-brand-muted font-medium mb-1.5 block">Task Type</label>
              <select
                value={manualTask}
                onChange={(e) => setManualTask(e.target.value)}
                disabled={isProcessing}
                className="
                  w-full bg-brand-navy border border-brand-navy-light rounded-lg
                  px-4 py-3 text-brand-white font-body text-sm
                  focus:outline-none focus:border-brand-saffron focus:ring-2 focus:ring-brand-saffron/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-200
                "
              >
                {taskTypes.map((task) => (
                  <option key={task} value={task} className="bg-brand-navy">
                    {task}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            {isProcessing && <LoadingSpinner size="sm" />}
            <Button
              variant="primary"
              onClick={handleManualOverride}
              disabled={isProcessing || !manualCitizenId.trim()}
            >
              Force Re-verification
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default AIEnginePage;