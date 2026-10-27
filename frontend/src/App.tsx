import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FilterProvider } from './context/FilterContext';
import { AppLayout } from './components/layout/AppLayout';

import { OverviewPage } from './pages/OverviewPage';
import { MedalAnalysisPage } from './pages/MedalAnalysisPage';
import { SportsAnalysisPage } from './pages/SportsAnalysisPage';
import { AthletesPage } from './pages/AthletesPage';
import { RegionalAnalysisPage } from './pages/RegionalAnalysisPage';
import { InvestmentPage } from './pages/InvestmentPage';
import { HostAnalysisPage } from './pages/HostAnalysisPage';
import { TimelinePage } from './pages/TimelinePage';
import { DataExplorerPage } from './pages/DataExplorerPage';
import { DataManagementPage } from './pages/DataManagementPage';
import { MethodologyPage } from './pages/MethodologyPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <FilterProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/medal-analysis" element={<MedalAnalysisPage />} />
            <Route path="/sports-analysis" element={<SportsAnalysisPage />} />
            <Route path="/athletes" element={<AthletesPage />} />
            <Route path="/regional-analysis" element={<RegionalAnalysisPage />} />
            <Route path="/investment-analysis" element={<InvestmentPage />} />
            <Route path="/host-analysis" element={<HostAnalysisPage />} />
            <Route path="/olympic-timeline" element={<TimelinePage />} />
            <Route path="/data-explorer" element={<DataExplorerPage />} />
            <Route path="/data-management" element={<DataManagementPage />} />
            <Route path="/methodology" element={<MethodologyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </FilterProvider>
    </BrowserRouter>
  );
};

export default App;
