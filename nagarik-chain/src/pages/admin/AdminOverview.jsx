import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, FileCheck, ShieldCheck, Brain, ArrowUpRight,
  ArrowDownRight, Activity, Clock, TrendingUp, AlertTriangle,
} from 'lucide-react';
import { mockCitizens } from '@data/mockCitizens';
import { mockAuditLogEntries } from '@data/auditLog';
import { useCountUp } from '@hooks/useCountUp';
import PageHeader from '@components/ui/PageHeader';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import { formatDateTime, timeAgo } from '@utils/formatters';

const stagger = {
  container: { transition: { staggerChildren: 0.05 } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } },
};

/* ── KPI Stat Card ────────────────────── */
function StatCard({ icon: Icon, label, value, suffix = '', change, changeDir, color }) {
  const animatedValue = useCountUp(value);
  const isUp = changeDir === 'up';

  return (
    <motion.div variants={stagger.item}>
      <Card className="p-5 transition-transform duration-200 hover:-translate-y-0.5">
        <div className="flex items-start justify-between mb-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          {change && (
            <span className={`inline-flex items-center text-xs font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
              {isUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
              {change}
            </span>
          )}
        </div>
        <p className="font-display font-bold text-2xl text-brand-white">
          {animatedValue.toLocaleString('en-IN')}{suffix}
        </p>
        <p className="text-brand-muted text-xs font-body mt-1">{label}</p>
      </Card>
    </motion.div>
  );
}

/* ── Mini Activity Sparkline ────────────── */
function MiniSparkline({ data, color }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 40;
  const w = 120;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}

/* ── System Health Row ────────────────── */
function HealthRow({ label, status, latency }) {
  const color = status === 'Healthy' ? 'text-green-400' : status === 'Degraded' ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="flex items-center justify-between py-2 border-b border-brand-navy-light last:border-0">
      <span className="text-brand-white text-sm font-body">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-brand-muted text-xs font-mono">{latency}</span>
        <span className={`text-xs font-medium ${color}`}>{status}</span>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────── */
function AdminOverview() {
  const totalCitizens = mockCitizens.length;
  const activeCitizens = useMemo(() => mockCitizens.filter((c) => c.status === 'ACTIVE').length, []);
  const pendingDocs = 12;
  const aiJobsToday = 847;

  // Simulated sparkline data
  const registrationTrend = [4, 7, 5, 9, 12, 8, 14, 11, 16, 13, 18, 15];
  const docVerificationTrend = [20, 25, 18, 30, 27, 35, 32, 40, 38, 42, 45, 48];

  const recentAudit = useMemo(() => mockAuditLogEntries.slice(0, 8), []);

  const stats = [
    { icon: Users, label: 'Total Citizens', value: totalCitizens * 1000 + 234, change: '+3.2%', changeDir: 'up', color: '#3b82f6' },
    { icon: ShieldCheck, label: 'Active Citizens', value: activeCitizens * 1000 + 180, change: '+1.8%', changeDir: 'up', color: '#22c55e' },
    { icon: FileCheck, label: 'Pending Documents', value: pendingDocs, change: '-8.4%', changeDir: 'down', color: '#f59e0b' },
    { icon: Brain, label: 'AI Jobs Today', value: aiJobsToday, change: '+12.6%', changeDir: 'up', color: '#8b5cf6' },
  ];

  const systemHealth = [
    { label: 'Nagarik Chain (Mainnet)', status: 'Healthy', latency: '142ms' },
    { label: 'AI Verification Engine', status: 'Healthy', latency: '89ms' },
    { label: 'Document Storage (IPFS)', status: 'Healthy', latency: '210ms' },
    { label: 'Benefit Disbursal Oracle', status: 'Degraded', latency: '520ms' },
    { label: 'Biometric Gateway', status: 'Healthy', latency: '67ms' },
  ];

  const eventTypeColor = (type) => {
    const map = {
      OFFICER_LOGIN: 'active',
      OFFICER_LOGOUT: 'inactive',
      DOCUMENT_APPROVED: 'verified',
      DOCUMENT_REJECTED: 'error',
      DOCUMENT_ESCALATED: 'pending',
      CONTRACT_TRIGGERED: 'active',
      CONTRACT_DEPLOYED: 'active',
      CONTRACT_PAUSED: 'pending',
      CITIZEN_SUSPENDED: 'suspended',
      CITIZEN_REACTIVATED: 'verified',
      AI_OVERRIDE: 'flagged',
      MANUAL_FLAG_RAISED: 'flagged',
      MANUAL_FLAG_RESOLVED: 'verified',
    };
    return map[type] || 'inactive';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Admin Overview"
        subtitle="Real-time system dashboard and activity monitor."
      />

      {/* KPI Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        variants={stagger.container}
        initial="initial"
        animate="animate"
      >
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </motion.div>

      {/* Two-column row: Activity trends + System health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Activity Trends */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="font-display font-bold text-lg text-brand-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-saffron" />
            Activity Trends
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-muted text-xs mb-1">New Registrations (30d)</p>
                <p className="font-display font-bold text-xl text-brand-white">+142</p>
              </div>
              <MiniSparkline data={registrationTrend} color="#3b82f6" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-muted text-xs mb-1">Doc Verifications (30d)</p>
                <p className="font-display font-bold text-xl text-brand-white">384</p>
              </div>
              <MiniSparkline data={docVerificationTrend} color="#22c55e" />
            </div>
          </div>
        </Card>

        {/* System Health */}
        <Card className="p-6">
          <h2 className="font-display font-bold text-lg text-brand-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-400" />
            System Health
          </h2>
          <div className="space-y-0">
            {systemHealth.map((h) => (
              <HealthRow key={h.label} {...h} />
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Audit Activity */}
      <Card className="p-6">
        <h2 className="font-display font-bold text-lg text-brand-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-brand-muted" />
          Recent Activity
        </h2>
        <div className="space-y-3">
          {recentAudit.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-brand-navy-light/50 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                {entry.eventType.includes('FLAG') || entry.eventType.includes('SUSPENDED') ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-green-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge
                    status={eventTypeColor(entry.eventType)}
                    size="sm"
                  >
                    {entry.eventType.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-brand-muted text-[10px]">{timeAgo(entry.timestamp)}</span>
                </div>
                <p className="text-brand-white text-sm font-body truncate">
                  {entry.description}
                </p>
                <p className="text-brand-muted text-xs mt-0.5">
                  {entry.actor} ({entry.actorId}){entry.affectedCitizen ? ` → ${entry.affectedCitizen}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

export default AdminOverview;
