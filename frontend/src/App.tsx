import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTabId } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ForecastPage } from './pages/ForecastPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { ColdStartPage } from './pages/ColdStartPage';
import { ModelIntelligencePage } from './pages/ModelIntelligencePage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { DocumentationPage } from './pages/DocumentationPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveTab} />;
      case 'forecast':
        return <ForecastPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'simulator':
        return <SimulatorPage />;
      case 'coldstart':
        return <ColdStartPage />;
      case 'models':
        return <ModelIntelligencePage />;
      case 'recommendations':
        return (
          <RecommendationsPage
            onNavigateToSimulator={() => setActiveTab('simulator')}
          />
        );
      case 'docs':
        return <DocumentationPage />;
      default:
        return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#17171D] text-[#F6F0E8] flex flex-col font-sans selection:bg-[#D8B46A]/30 selection:text-[#F6F0E8]">
      {/* Top Navigation Bar */}
      <Navbar activeTab={activeTab} />

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Navigation Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-h-[calc(100vh-65px)]">
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>
      </div>
    </div>
  );
};

export default App;
