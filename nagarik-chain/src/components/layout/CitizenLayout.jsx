import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BlockchainHashRibbon from '@components/blockchain/BlockchainHashRibbon';
import Toast from '@components/ui/Toast';

function CitizenLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-brand-navy overflow-hidden">
      {/* Top Bar */}
      <Navbar onMenuToggle={handleMenuToggle} />
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <BlockchainHashRibbon />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global Toasts */}
      <Toast />
    </div>
  );
}

export default CitizenLayout;
