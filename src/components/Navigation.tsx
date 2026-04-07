import { Home, CreditCard, Clock, Plus } from 'lucide-react';

type NavigationProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
};

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const tabs = [
    { id: 'accueil', label: 'Accueil', icon: Home },
    { id: 'abonnements', label: 'Abonnements', icon: CreditCard },
    { id: 'essais', label: 'Essais', icon: Clock },
    { id: 'ajouter', label: 'Ajouter', icon: Plus },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-900 border-t border-slate-700/50 z-50 backdrop-blur-xl">
      <div className="grid grid-cols-4 gap-1 p-3 max-w-2xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPage === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`nav-item py-2 ${isActive ? 'active' : ''}`}
            >
              <div className={`p-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'bg-slate-700/20 text-gray-400 hover:text-gray-300'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium transition-colors ${
                isActive ? 'text-blue-400' : 'text-gray-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
