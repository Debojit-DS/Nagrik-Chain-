import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Home } from 'lucide-react';
import Button from '@components/ui/Button';

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-full bg-brand-navy-mid border border-brand-navy-light flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-brand-warning" />
        </div>
        <h1 className="text-display-lg text-brand-white mb-3">404</h1>
        <p className="text-body-lg text-brand-muted mb-2">Page Not Found</p>
        <p className="text-body-sm text-brand-muted mb-8">
          The page you&apos;re looking for doesn&apos;t exist on the Nagarik Chain network.
        </p>
        <Link to="/">
          <Button>
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

export default NotFoundPage;
