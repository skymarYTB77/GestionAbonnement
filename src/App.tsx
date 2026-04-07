import { useState } from 'react';
import Navigation from './components/Navigation';
import Accueil from './pages/Accueil';
import Abonnements from './pages/Abonnements';
import EssaisGratuits from './pages/EssaisGratuits';
import Ajouter from './pages/Ajouter';

function App() {
  const [currentPage, setCurrentPage] = useState('accueil');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 pb-24">
      {currentPage === 'accueil' && <Accueil key={`accueil-${refreshKey}`} />}
      {currentPage === 'abonnements' && <Abonnements key={`abonnements-${refreshKey}`} />}
      {currentPage === 'essais' && <EssaisGratuits key={`essais-${refreshKey}`} />}
      {currentPage === 'ajouter' && <Ajouter onSuccess={handleNavigate} />}

      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
