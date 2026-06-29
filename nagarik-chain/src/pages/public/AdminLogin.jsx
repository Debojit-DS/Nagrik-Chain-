import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import ashokaChakra from '@/assets/ashoka-chakra.svg';

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Documents');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const departments = ['Identity', 'Documents', 'Benefits', 'Fraud', 'Audit'];

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      const result = await login({ id: officerId, password }, 'admin');
      if (result.success) {
        navigate('/admin/dashboard/overview');
      } else {
        setError(result.error);
      }
      setLoading(false);
    },
    [officerId, password, login, navigate]
  );

  const handleDemoFill = useCallback(() => {
    setOfficerId('CHIN-OFF-0000001');
    setPassword('admin123');
    setDepartment('Documents');
    setError('');
  }, []);

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-brand-navy-mid rounded-2xl border border-brand-navy-light p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src={ashokaChakra}
              alt=""
              className="w-8 h-8"
              style={{ filter: 'invert(45%) sepia(100%) saturate(1000%) hue-rotate(360deg)' }}
            />
          </div>
          <h1 className="font-display font-bold text-xl text-brand-white">
            Officer Portal — Secure Access
          </h1>
          <p className="text-body-sm text-brand-muted mt-2">
            Authorized government officers only. All sessions are logged.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="officer-id"
            label="Officer ID"
            placeholder="GOV-XXXX"
            value={officerId}
            onChange={(e) => setOfficerId(e.target.value)}
            autoComplete="username"
          />
          <Input
            id="officer-password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error || ''}
            autoComplete="current-password"
          />

          {/* Department Dropdown */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-brand-white mb-1.5">
              Department
            </label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2.5 bg-brand-navy border border-brand-navy-light rounded-lg text-brand-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-saffron focus:border-transparent"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" loading={loading} disabled={!officerId || !password} className="w-full">
            {loading ? 'Authenticating...' : 'Secure Sign In'}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-brand-navy/50 rounded-xl border border-brand-navy-light">
          <p className="text-brand-muted text-xs mb-2 font-medium">Demo Credentials:</p>
          <p className="text-brand-crypto-blue font-mono text-xs">
            ID: GOV-4421 &nbsp;|&nbsp; Password: admin123
          </p>
          <button
            onClick={handleDemoFill}
            className="text-brand-saffron text-xs mt-2 hover:underline font-medium"
          >
            Auto-fill demo credentials →
          </button>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-brand-muted hover:text-brand-white text-sm transition-colors">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminLogin;
