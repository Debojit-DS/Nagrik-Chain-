import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileSearch,
  ScrollText,
  Brain,
  ClipboardList,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard/overview', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/dashboard/citizens', icon: Users, label: 'Citizen Registry' },
  { to: '/admin/dashboard/documents', icon: FileSearch, label: 'Document Queue' },
  { to: '/admin/dashboard/contracts', icon: ScrollText, label: 'Smart Contracts' },
  { to: '/admin/dashboard/ai-engine', icon: Brain, label: 'AI Engine' },
  { to: '/admin/dashboard/audit-log', icon: ClipboardList, label: 'Audit Log' },
];

function AdminSidebar({ isOpen, onClose }) {
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
          w-[260px]
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

        {/* Bottom: Security notice */}
        <div className="p-4 border-t border-brand-navy-light">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-[11px] font-medium">Encrypted Session</span>
          </div>
          <p className="text-brand-muted text-[10px] mt-1">
            All actions are immutably logged.
          </p>
        </div>
      </aside>
    </>
  );
}

AdminSidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default AdminSidebar;
