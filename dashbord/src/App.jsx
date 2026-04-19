import React, { useState } from 'react';
import { ConfigProvider } from './context/ConfigContext';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import IncidentsView from './pages/IncidentsView';
import AffectationsView from './pages/AffectationsView';
import EquipementsView from './pages/EquipementsView';
import UtilisateursView from './pages/UtilisateursView';
import LogsTracking from './pages/LogsTracking';
import Settings from './pages/Settings';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'incidents':
        return <IncidentsView /> ;
      case 'affectations':
        return <AffectationsView />;
      case 'equipements':
        return <EquipementsView />;
      case 'utilisateurs':
        return <UtilisateursView />;
      case 'logs':
        return <LogsTracking />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  return (
    <ConfigProvider>
      <div className="flex min-h-screen bg-gray-900">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-x-hidden">
          <div className="min-h-screen">
            {renderContent()}
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
}

export default App;
