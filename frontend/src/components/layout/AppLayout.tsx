import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalFilterBar } from './GlobalFilterBar';
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

        {/* Global Filter Bar */}
        <GlobalFilterBar />

        {/* Dynamic Route Pages */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
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
    </div>
  );
};
