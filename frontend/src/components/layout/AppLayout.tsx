import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalFilterBar } from './GlobalFilterBar';
import { BackendStatusBar } from './BackendStatusBar';
import { BackendStatusModal } from '../common/BackendStatusModal';
import { CountryModal } from '../common/CountryModal';
import { SportModal } from '../common/SportModal';
import { useFilters } from '../../context/FilterContext';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const {
    filters,
    selectedCountryForModal,
    setSelectedCountryForModal,
    selectedSportForModal,
    setSelectedSportForModal,
    isConfigModalOpen,
    setIsConfigModalOpen,
    retryConnection,
  } = useFilters();

  return (
    <div className="min-h-screen bg-[#080c15] text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <Header
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
          collapsed={collapsed}
        />

        {/* Content Container padded below fixed header */}
        <div className="pt-16 flex flex-col flex-1">
          {/* Cold start / connection status banner */}
          <BackendStatusBar />

          {/* Global Filter Bar */}
          <GlobalFilterBar />

          {/* Dynamic Route Pages */}
          <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global Drilldown Modals */}
      <CountryModal
        noc={selectedCountryForModal}
        onClose={() => setSelectedCountryForModal(null)}
        metricMode={filters.metricMode}
      />

      <SportModal
        sport={selectedSportForModal}
        onClose={() => setSelectedSportForModal(null)}
      />

      {/* Backend Connection & Render Diagnostics Modal */}
      <BackendStatusModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onConnectionSuccess={() => retryConnection()}
      />
    </div>
  );
};
