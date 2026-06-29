import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import {
  UserCheck,
  FileText,
  Gift,
  ScrollText,
  Brain,
  X,
} from 'lucide-react';
import { useAuth } from '@hooks/useAuth';

const navItems = [
  { to: '/citizen/dashboard/identity', icon: UserCheck, label: 'My Identity' },
  { to: '/citizen/dashboard/documents', icon: FileText, label: 'My Documents' },
  { to: '/citizen/dashboard/benefits', icon: Gift, label: 'Benefits' },
  { to: '/citizen/dashboard/contracts', icon: ScrollText, label: 'Smart Contracts' },
  { to: '/citizen/dashboard/ai-status', icon: Brain, label: 'AI Verification' },
];

function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen z-50 md:z-20
          bg-brand-navy-mid border-r border-brand-navy-light
          flex flex-col flex-shrink-0
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-60 md:w-60 lg:w-60
        `}
      >
        {/* Mobile Close */}
        <div className="flex items-center justify-end p-3 md:hidden">
          <button
            onClick={handleClose}
            className="text-brand-muted hover:text-brand-white p-1"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1" role="navigation">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={handleClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-brand-navy-light text-brand-white border-l-2 border-brand-saffron -ml-[2px]'
                    : 'text-brand-muted hover:text-brand-white hover:bg-brand-navy-light/50'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom: Citizen ID + Session */}
        <div className="p-4 border-t border-brand-navy-light">
          <p className="font-mono text-xs text-brand-crypto-blue truncate">
            {user?.nagarikId || 'IND-XXXX-XXXX-NC'}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-[11px] font-medium">Secure Session</span>
          </div>
        </div>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default Sidebar;
