import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCheck, Shield, Search, ArrowRight, ExternalLink } from 'lucide-react';
import BlockchainHashRibbon from '@components/blockchain/BlockchainHashRibbon';
import ashokaChakra from '@/assets/ashoka-chakra.svg';

const portals = [
  {
    id: 'citizen',
    title: 'Citizen Portal',
    subtitle: 'Access your digital identity, documents, and government benefits.',
    icon: UserCheck,
    accent: 'from-brand-saffron to-orange-600',
    border: 'hover:border-brand-saffron/60',
    glow: 'hover:shadow-glow-saffron',
    cta: 'Sign In as Citizen',
    path: '/citizen/login',
  },
  {
    id: 'admin',
    title: 'Officer Portal',
    subtitle: 'Manage citizen records, review documents, and monitor AI systems.',
    icon: Shield,
    accent: 'from-brand-crypto-blue to-blue-600',
    border: 'hover:border-brand-crypto-blue/60',
    glow: 'hover:shadow-glow-blue',
    cta: 'Officer Login',
    path: '/admin/login',
  },
  {
    id: 'verify',
    title: 'Verification Portal',
    subtitle: 'Verify identities and documents against the blockchain ledger.',
    icon: Search,
    accent: 'from-brand-india-green to-emerald-600',
    border: 'hover:border-brand-india-green/60',
    glow: 'hover:shadow-glow-green',
    cta: 'Start Verification',
    path: '/verify',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function HomePage() {
  const navigate = useNavigate();

  const handleNavigate = useCallback(
    (path) => () => navigate(path),
    [navigate]
  );

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col bg-grain">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <img
            src={ashokaChakra}
            alt=""
            className="w-8 h-8"
            style={{ filter: 'invert(45%) sepia(100%) saturate(1000%) hue-rotate(360deg)' }}
          />
          <div>
            <h1 className="font-display font-bold text-lg text-brand-white tracking-wider">
              NAGARIK CHAIN
            </h1>
            <p className="font-body text-[11px] text-brand-muted -mt-0.5">नागरिक चेन</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-brand-muted">
          <button className="px-2 py-1 rounded text-brand-white font-medium">EN</button>
          <span className="text-brand-navy-light">|</span>
          <button className="px-2 py-1 rounded hover:text-brand-white transition-colors">हिंदी</button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 max-w-2xl"
        >
          <h2 className="text-display-xl text-brand-white mb-4 leading-tight">
            One Identity.{' '}
            <span className="bg-gradient-to-r from-brand-saffron via-brand-white to-brand-india-green bg-clip-text text-transparent">
              Cryptographic Trust.
            </span>
            <br />
            For 1.4 Billion.
          </h2>
          <p className="text-body-lg text-brand-muted max-w-lg mx-auto">
            India's blockchain-anchored identity system. Secure, transparent, and citizen-first.
          </p>
        </motion.div>

        {/* Portal Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl w-full"
        >
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <motion.div
                key={portal.id}
                variants={item}
                className={`
                  relative group bg-brand-navy-mid border border-brand-navy-light rounded-2xl p-6
                  transition-all duration-300 ease-out cursor-pointer hover:-translate-y-0.5
                  ${portal.border} ${portal.glow}
                `}
                onClick={handleNavigate(portal.path)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(portal.path)}
                aria-label={`Go to ${portal.title}`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${portal.accent} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="font-display font-bold text-lg text-brand-white mb-2">
                  {portal.title}
                </h3>
                <p className="text-body-sm text-brand-muted mb-6 leading-relaxed">
                  {portal.subtitle}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-2 text-sm font-display font-semibold text-brand-saffron group-hover:gap-3 transition-all">
                  <span>{portal.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 border-t border-brand-navy-light">
        <p className="text-brand-muted text-xs flex items-center justify-center gap-1">
          © 2026 Government of India
          <ExternalLink className="w-3 h-3 inline" />
        </p>
      </footer>

      {/* Hash Ribbon */}
      <BlockchainHashRibbon />
    </div>
  );
}

export default HomePage;
