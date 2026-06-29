import { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { Bell, Sun, Moon, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { ThemeContext } from '@contexts/ThemeContext';
import ashokaChakra from '@/assets/ashoka-chakra.svg';

function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2) || 'RK';

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <nav className="h-16 bg-brand-navy-mid border-b border-brand-navy-light px-4 flex items-center justify-between flex-shrink-0 z-30">
      {/* Left: Logo + Hamburger */}
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
          <span className="font-display font-bold text-sm text-brand-white tracking-wider hidden sm:inline">
            NAGARIK CHAIN
          </span>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-brand-muted hover:text-brand-white hover:bg-brand-navy-light rounded-lg transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 text-brand-muted hover:text-brand-white hover:bg-brand-navy-light rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-saffron rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 ml-1">
          <div className="w-8 h-8 rounded-full bg-brand-saffron flex items-center justify-center text-white text-xs font-bold font-display">
            {initials}
          </div>
          <span className="text-brand-white text-sm font-medium hidden sm:inline">
            {user?.name || 'Citizen'}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 text-brand-muted hover:text-brand-error hover:bg-brand-navy-light rounded-lg transition-colors ml-1"
          aria-label="Logout"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  onMenuToggle: PropTypes.func,
};

export default Navbar;
