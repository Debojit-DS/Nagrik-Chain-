import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import ashokaChakra from '@/assets/ashoka-chakra.svg';
import indiaMap from '@/assets/india-map-outline.svg';

function CitizenLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [nagarikId, setNagarikId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      const result = await login({ id: nagarikId, pin }, 'citizen');
      if (result.success) {
        navigate('/citizen/dashboard/identity');
      } else {
        setError(result.error);
      }
      setLoading(false);
    },
    [nagarikId, pin, login, navigate]
  );

  const handleDemoFill = useCallback(() => {
    setNagarikId('CHIN-3a8f5bb2e97a387532d92caad5f09623e1986423a8f5bb2e97a387532d92caad');
    setPin('1234');
    setError('');
  }, []);

  return (
    <div className="min-h-screen bg-brand-navy flex">
      {/* Left Decorative Panel */}
      <div className="hidden lg:flex w-[40%] relative overflow-hidden flex-col justify-between p-10"
        style={{
          background: 'linear-gradient(160deg, #0B1426 0%, #1a2d5a 50%, #0B1426 100%)',
        }}
      >
        {/* Background Map */}
        <img
          src={indiaMap}
          alt=""
          className="absolute inset-0 w-full h-full object-contain opacity-[0.04] pointer-events-none"
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img
            src={ashokaChakra}
            alt=""
            className="w-10 h-10"
            style={{ filter: 'invert(45%) sepia(100%) saturate(1000%) hue-rotate(360deg)' }}
          />
          <div>
            <h1 className="font-display font-bold text-xl text-brand-white tracking-wider">
              NAGARIK CHAIN
            </h1>
            <p className="font-body text-xs text-brand-muted">नागरिक चेन</p>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <h2 className="text-display-md text-brand-white mb-3">
            Your Identity.
            <br />
            <span className="text-brand-saffron">On the Blockchain.</span>
          </h2>
          <p className="text-body-md text-brand-muted max-w-md">
            Secure, verifiable, and immutable — every citizen's identity anchored
            on India's sovereign blockchain network.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="relative z-10 flex gap-8">
          {[
            { value: '1.4B+', label: 'Citizens' },
            { value: '22', label: 'Languages' },
            { value: '99.7%', label: 'Uptime' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display font-bold text-2xl text-brand-saffron">{stat.value}</p>
              <p className="text-brand-muted text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img
              src={ashokaChakra}
              alt=""
              className="w-7 h-7"
              style={{ filter: 'invert(45%) sepia(100%) saturate(1000%) hue-rotate(360deg)' }}
            />
            <span className="font-display font-bold text-sm text-brand-white tracking-wider">
              NAGARIK CHAIN
            </span>
          </div>

          <h2 className="text-display-md text-brand-white mb-2">Citizen Sign In</h2>
          <p className="text-body-sm text-brand-muted mb-8">
            Enter your Nagarik ID and secure PIN to access your digital identity.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="nagarik-id"
              label="Nagarik ID"
              placeholder="IND-XXXX-XXXX-NC"
              value={nagarikId}
              onChange={(e) => setNagarikId(e.target.value)}
              autoComplete="username"
            />
            <Input
              id="pin"
              label="4-Digit Secure PIN"
              type="password"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              error={error ? 'Invalid Nagarik ID or PIN' : ''}
              autoComplete="current-password"
            />

            <Button type="submit" loading={loading} disabled={!nagarikId || !pin} className="w-full">
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-brand-navy-light/50 rounded-xl border border-brand-navy-light">
            <p className="text-brand-muted text-xs mb-2 font-medium">Demo Credentials:</p>
            <p className="text-brand-crypto-blue font-mono text-xs">
              ID: IND-9481-0032-NC &nbsp;|&nbsp; PIN: 1234
            </p>
            <button
              onClick={handleDemoFill}
              className="text-brand-saffron text-xs mt-2 hover:underline font-medium"
            >
              Auto-fill demo credentials →
            </button>
          </div>

          {/* Links */}
          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/citizen/register" className="text-brand-saffron hover:underline font-medium">
              Register here →
            </Link>
            <Link to="/" className="text-brand-muted hover:text-brand-white transition-colors">
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default CitizenLogin;
