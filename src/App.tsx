import { useState } from 'react';
import Navigation from './components/Navigation';
import Accueil from './pages/Accueil';
import Abonnements from './pages/Abonnements';
import EssaisGratuits from './pages/EssaisGratuits';
import Ajouter from './pages/Ajouter';

function App() {
  const [currentPage, setCurrentPage] = useState('accueil');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 pb-24">
      {currentPage === 'accueil' && <Accueil />}
      {currentPage === 'abonnements' && <Abonnements />}
      {currentPage === 'essais' && <EssaisGratuits />}
      {currentPage === 'ajouter' && <Ajouter />}

      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
}

export default App;
