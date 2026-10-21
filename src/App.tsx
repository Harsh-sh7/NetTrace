import React from 'react';
import { TopologyProvider, useTopology } from './context/TopologyContext';
import { NetTraceHeader } from './components/layout/NetTraceHeader';
import { NetTraceFooter } from './components/layout/NetTraceFooter';

import { TopologyMap } from './components/topology/TopologyMap';
import { OverviewDashboard } from './components/screens/OverviewDashboard';
import { DeviceInventoryView } from './components/screens/DeviceInventoryView';
import { AlertsView } from './components/screens/AlertsView';
import { HistoryDiffView } from './components/screens/HistoryDiffView';
import { ReportsView } from './components/screens/ReportsView';
import { DiscoveryConfigView } from './components/screens/DiscoveryConfigView';

const MainLayout: React.FC = () => {
  const { activeScreen, theme } = useTopology();
  const isLight = theme === 'light';

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden select-none font-sans transition-colors duration-200 ${
      isLight ? 'bg-[#f8fafc] text-slate-900 light light-mode' : 'bg-[#0a101d] text-slate-100 dark dark-mode'
    }`}>
      {/* 1. NetTrace Top Navigation & Menu Bar */}
      <NetTraceHeader />

      {/* 2. Main Full-Bleed Viewport */}
      <main className={`flex-1 overflow-hidden relative ${isLight ? 'bg-[#f8fafc]' : 'bg-[#0a101d]'}`}>
        {activeScreen === 'overview' && <OverviewDashboard />}
        {activeScreen === 'topology' && <TopologyMap />}
        {activeScreen === 'inventory' && <DeviceInventoryView />}
        {activeScreen === 'alerts' && <AlertsView />}
        {activeScreen === 'configuration' && <DiscoveryConfigView />}
        {activeScreen === 'history' && <HistoryDiffView />}
        {activeScreen === 'reports' && <ReportsView />}
      </main>

      {/* 3. NetTrace Bottom Status Bar */}
      <NetTraceFooter />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <TopologyProvider>
      <MainLayout />
    </TopologyProvider>
  );
};

export default App;
