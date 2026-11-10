import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTabId } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ShowtimesPage } from './pages/ShowtimesPage';
import { ForecastPage } from './pages/ForecastPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { ColdStartPage } from './pages/ColdStartPage';
import { ModelIntelligencePage } from './pages/ModelIntelligencePage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { DocumentationPage } from './pages/DocumentationPage';
import { MovieCatalogItem } from './utils/movieCatalog';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');
  const [selectedMovieForForecast, setSelectedMovieForForecast] = useState<MovieCatalogItem | null>(null);

  const handleSelectMovie = (movie: MovieCatalogItem) => {
    setSelectedMovieForForecast(movie);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={setActiveTab}
            onSelectMovieForForecast={handleSelectMovie}
          />
        );
      case 'showtimes':
        return (
          <ShowtimesPage
            onNavigateToSimulator={() => setActiveTab('simulator')}
            initialMovieTitle={selectedMovieForForecast?.title}
          />
        );
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
        return (
          <DashboardPage
            onNavigate={setActiveTab}
            onSelectMovieForForecast={handleSelectMovie}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#14151C] text-white flex flex-col font-sans selection:bg-[#F84464]/30 selection:text-white">
      {/* BookMyShow Style Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSelectMovie={handleSelectMovie}
      />

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Navigation Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-h-[calc(100vh-105px)]">
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>
      </div>
    </div>
  );
};

export default App;
