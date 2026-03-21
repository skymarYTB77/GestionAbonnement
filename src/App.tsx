import { useState } from 'react';
import Navigation from './components/Navigation';
import Accueil from './pages/Accueil';
import Abonnements from './pages/Abonnements';
import EssaisGratuits from './pages/EssaisGratuits';
import Ajouter from './pages/Ajouter';

function App() {
  const [currentPage, setCurrentPage] = useState('accueil');

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'accueil' && <Accueil />}
      {currentPage === 'abonnements' && <Abonnements />}
      {currentPage === 'essais' && <EssaisGratuits />}
      {currentPage === 'ajouter' && <Ajouter />}

      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
}

export default App;
