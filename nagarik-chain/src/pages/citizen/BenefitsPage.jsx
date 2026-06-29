import { useState } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Calendar, TrendingUp, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { mockSchemes, mockDisbursalHistory, mockUpcomingDisbursals } from '@data/benefits';
import PageHeader from '@components/ui/PageHeader';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import HashDisplay from '@components/blockchain/HashDisplay';
import { formatCurrency, formatDate } from '@utils/formatters';

const stagger = {
  container: { transition: { staggerChildren: 0.06 } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } },
};

const schemeHistory = {
  'scheme-001': [
    { date: '2026-04-01', amount: 2000, status: 'Completed', blockNumber: 1847293, txHash: '0x7a3b9c2d1e4f5a6b8c9d0e1f2a3b4c5d6e7f8a9b' },
    { date: '2026-01-01', amount: 2000, status: 'Completed', blockNumber: 1823491, txHash: '0x4c8d1e3f5a7b9c2d4e6f8a1b3c5d7e9f0a2b4c6d' },
    { date: '2025-10-01', amount: 2000, status: 'Completed', blockNumber: 1800123, txHash: '0x9e2a4b6c8d0e1f3a5b7c9d1e2f4a6b8c0d2e4f6a' },
    { date: '2025-07-01', amount: 2000, status: 'Completed', blockNumber: 1776543, txHash: '0x1f5e8a3b7c9d2e4f6a8b0c1d3e5f7a9b2c4d6e8f' },
  ],
  'scheme-002': [
    { date: '2025-09-15', amount: 12500, status: 'Completed', blockNumber: 1765432, txHash: '0x6c3a9b4c7d1e5f8a2b4c6d8e0f1a3b5c7d9e1f3a' },
    { date: '2024-09-15', amount: 12500, status: 'Completed', blockNumber: 1543210, txHash: '0x8d2f1b5c9e3a7d4f6b8c0e2a4d6f8a1b3c5e7f9a' },
    { date: '2023-09-15', amount: 12500, status: 'Completed', blockNumber: 1321987, txHash: '0x2b7c4e9f1a3d5b7c9e1f3a5b7c9d1e3f5a7b9c2d' },
  ],
  'scheme-003': [
    { date: '2026-01-15', amount: 500000, status: 'Completed', blockNumber: 1815672, txHash: '0x5e9d3c8a1b5f7e2d4c6a8b0f2e4d6c8a1b3f5e7d' },
    { date: '2025-01-15', amount: 500000, status: 'Completed', blockNumber: 1598765, txHash: '0x7a1b9e3d5f8c2a4e6b8d0f2a4c6e8b1d3f5a7c9a' },
    { date: '2024-01-15', amount: 500000, status: 'Completed', blockNumber: 1389045, txHash: '0x9c3f7a1b5e9d3c8f2a4b6d8e1f3a5c7b9d2e4f6a' },
  ],
  'scheme-004': [
    { date: '2026-06-01', amount: 300, status: 'Processing', blockNumber: 1876543, txHash: '0x3c8f2a4b7d1e6f9a3c5e8b1d4f7a2c5e8b1d3f6a' },
    { date: '2026-05-01', amount: 300, status: 'Completed', blockNumber: 1865432, txHash: '0x9d2e8b1c4f7a3d6e9b2c5f8a1d4e7b0c3f6a9d2e' },
    { date: '2026-04-01', amount: 300, status: 'Completed', blockNumber: 1854321, txHash: '0x4f7a2d8e1b3c6f9a2d5e8b1c4f7a0d3e6b9c2f5a' },
    { date: '2026-03-01', amount: 300, status: 'Completed', blockNumber: 1843210, txHash: '0x1c5d9f3a7b2e4d6c8f0a2b4e6d8f1a3c5e7b9d2f' },
  ],
  'scheme-005': [
    { date: '2025-11-20', amount: 120000, status: 'Completed', blockNumber: 1789012, txHash: '0x6b3f8c1d4e7a2b5f9c3d6e8a1b4f7c2e5d8a1b3f' },
    { date: '2025-06-10', amount: 60000, status: 'Completed', blockNumber: 1745678, txHash: '0x8e2a5c9f3b7d1e4a6c8f0b2d4e6f8a1b3c5d7e9f' },
    { date: '2025-01-05', amount: 60000, status: 'Completed', blockNumber: 1702345, txHash: '0x2d7c1b9f4e8a3d5c7f9b1d3e5f7a9b2c4d6e8f0a' },
  ],
};

function getStatusBadge(status) {
  switch (status) {
    case 'Completed':
      return <Badge status="verified" size="sm">{status}</Badge>;
    case 'Processing':
      return <Badge status="pending" size="sm">{status}</Badge>;
    default:
      return <Badge status="pending" size="sm">{status}</Badge>;
  }
}

function BenefitsPage() {
  const [historyModal, setHistoryModal] = useState(null);

  const totalReceived = 124500;
  const activeSchemes = mockSchemes.filter((s) => s.status === 'Active').length;
  const nextDisbursal = mockUpcomingDisbursals[0];

  return (
    <motion.div initial="initial" animate="animate" variants={stagger.container}>
      <PageHeader
        title="My Benefits"
        subtitle="Government schemes and smart-contract-triggered disbursals."
      />

      {/* Stat Cards */}
      <motion.div variants={stagger.item} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-900/40 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-brand-muted text-xs">Total Received</p>
              <p className="text-brand-white text-xl font-display font-bold">{formatCurrency(totalReceived)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900/40 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-brand-muted text-xs">Active Schemes</p>
              <p className="text-brand-white text-xl font-display font-bold">{activeSchemes}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-900/40 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-brand-saffron" />
            </div>
            <div>
              <p className="text-brand-muted text-xs">Next Disbursal</p>
              <p className="text-brand-white text-sm font-display font-bold">
                {nextDisbursal ? `${formatCurrency(nextDisbursal.amount)} · ${formatDate(nextDisbursal.date)}` : '—'}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Scheme Cards */}
      <motion.div variants={stagger.item} className="space-y-4 mb-8">
        <h2 className="font-display font-semibold text-lg text-brand-white">Active Schemes</h2>
        {mockSchemes.map((scheme) => (
          <Card key={scheme.id} className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold text-brand-white">{scheme.name}</h3>
                  <Badge status={scheme.status === 'Active' ? 'active' : 'ended'} size="sm">
                    {scheme.status}
                  </Badge>
                </div>
                <p className="text-brand-muted text-xs">{scheme.ministry}</p>
                <p className="text-brand-muted text-xs mt-1">
                  {scheme.frequency} · {scheme.triggerType === 'Automatic' ? '⚡ Smart Contract' : '📋 Conditional'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-brand-saffron text-xl font-display font-bold">{formatCurrency(scheme.amount)}</p>
                <p className="text-brand-muted text-xs">{scheme.frequency}</p>
              </div>
            </div>
            {scheme.daysInCycle > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-brand-muted mb-1">
                  <span>Cycle progress</span>
                  <span>{Math.round((scheme.daysElapsed / scheme.daysInCycle) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-brand-navy rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(scheme.daysElapsed / scheme.daysInCycle) * 100}%`,
                      backgroundColor: scheme.color,
                    }}
                  />
                </div>
              </div>
            )}
            <div className="mt-3">
              <Button variant="ghost" size="sm" onClick={() => setHistoryModal(scheme)}>
                View History
              </Button>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Disbursal Chart + Upcoming Disbursals */}
      <motion.div variants={stagger.item} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-display font-semibold text-lg text-brand-white mb-4">
            Disbursal History (Last 12 Months)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockDisbursalHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2E50" />
                <XAxis dataKey="month" tick={{ fill: '#7A8BB0', fontSize: 11 }} />
                <YAxis tick={{ fill: '#7A8BB0', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#111D35', border: '1px solid #1C2E50', borderRadius: '8px' }}
                  labelStyle={{ color: '#F0F4FF' }}
                  itemStyle={{ color: '#F0F4FF' }}
                />
                <Bar dataKey="PM-KISAN" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Scholarship" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Ujjwala" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Housing" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-semibold text-lg text-brand-white mb-4">
            Upcoming Disbursals
          </h2>
          <div className="space-y-3">
            {mockUpcomingDisbursals.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-brand-navy/50 border border-brand-slate/20">
                <div>
                  <p className="text-brand-white text-sm font-medium">{item.scheme}</p>
                  <p className="text-brand-muted text-xs">{formatDate(item.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-brand-saffron text-sm font-bold">{formatCurrency(item.amount)}</p>
                  {item.auto ? (
                    <Badge status="active" size="sm">Auto-trigger</Badge>
                  ) : (
                    <Badge status="inactive" size="sm">Conditional</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* History Modal */}
      {historyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setHistoryModal(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-navy-mid border border-brand-navy-light rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-brand-slate/30">
              <h3 className="font-display font-semibold text-lg text-brand-white">
                Disbursal History – {historyModal.name}
              </h3>
              <button
                onClick={() => setHistoryModal(null)}
                className="text-brand-muted hover:text-brand-white transition-colors p-1 rounded-lg hover:bg-brand-navy"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-auto p-5 flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-brand-muted border-b border-brand-slate/20">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Block #</th>
                    <th className="pb-3 font-medium">TX Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {schemeHistory[historyModal.id]?.map((entry, i) => (
                    <tr key={i} className="border-b border-brand-slate/10">
                      <td className="py-3 text-brand-white">{formatDate(entry.date)}</td>
                      <td className="py-3 text-brand-white font-medium">{formatCurrency(entry.amount)}</td>
                      <td className="py-3">{getStatusBadge(entry.status)}</td>
                      <td className="py-3 font-mono text-xs text-brand-muted">
                        {entry.blockNumber.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <HashDisplay hash={entry.txHash} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default BenefitsPage;
