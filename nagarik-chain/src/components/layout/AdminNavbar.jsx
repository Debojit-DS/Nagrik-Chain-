import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Bell, LogOut, Shield, Menu } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import Badge from '@components/ui/Badge';
import ashokaChakra from '@/assets/ashoka-chakra.svg';

function AdminNavbar({ onMenuToggle }) {
  const { user, logout } = useAuth();

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <nav className="h-16 bg-brand-navy-mid border-b border-brand-navy-light px-4 flex items-center justify-between flex-shrink-0 z-30">
      {/* Left: Logo + Portal Label */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden text-brand-muted hover:text-brand-white p-1"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <img
            src={ashokaChakra}
            alt=""
            className="w-6 h-6"
            style={{ filter: 'invert(45%) sepia(100%) saturate(1000%) hue-rotate(360deg)' }}
          />
          <span className="font-display font-bold text-sm text-brand-white tracking-wider">
            NAGARIK CHAIN
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 ml-3 pl-3 border-l border-brand-navy-light">
          <Shield className="w-4 h-4 text-brand-saffron" />
          <span className="text-brand-saffron text-xs font-display font-semibold tracking-wider uppercase">
            Officer Portal
          </span>
        </div>
      </div>

      {/* Right: Badge + Controls */}
      <div className="flex items-center gap-3">
        <Badge status="active" size="sm">
          Level {user?.level || 2} Officer
        </Badge>

        {/* Notifications */}
        <button
          className="relative p-2 text-brand-muted hover:text-brand-white hover:bg-brand-navy-light rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-brand-error text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            3
          </span>
        </button>

        {/* Officer Name */}
        <span className="text-brand-white text-sm font-medium hidden sm:inline">
          {user?.name || 'Officer'}
        </span>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 text-brand-muted hover:text-brand-error hover:bg-brand-navy-light rounded-lg transition-colors"
          aria-label="Logout"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>
    </nav>
  );
}

AdminNavbar.propTypes = {
  onMenuToggle: PropTypes.func,
};

export default AdminNavbar;
