import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ExternalLink, AlertCircle, TrendingDown } from 'lucide-react';
import type { Database } from '../lib/database.types';

type FreeTrial = Database['public']['Tables']['free_trials']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export default function Accueil() {
  const [urgentTrials, setUrgentTrials] = useState<FreeTrial[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    if (!supabase) {
      setLoading(false);
      return;
    }

    const today = new Date();
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(today.getDate() + 5);

    const { data: trials } = await supabase
      .from('free_trials')
      .select('*')
      .eq('status', 'actif')
      .lte('end_date', fiveDaysFromNow.toISOString().split('T')[0])
      .order('end_date', { ascending: true });

    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'actif')
      .order('billing_date', { ascending: true });

    setUrgentTrials(trials || []);
    setSubscriptions(subs || []);
    setLoading(false);
  }

  async function markTrialAsCanceled(id: string) {
    if (!supabase) return;

    await supabase
      .from('free_trials')
      .update({ status: 'annulé' })
      .eq('id', id);

    loadData();
  }

  function calculateMonthlyTotal() {
    return subscriptions.reduce((total, sub) => {
      if (sub.frequency === 'annuel') {
        return total + (sub.price / 12);
      }
      return total + sub.price;
    }, 0);
  }

  function getNextBillingDate(billingDate: number): Date {
    const today = new Date();
    const next = new Date(today.getFullYear(), today.getMonth(), billingDate);

    if (next < today) {
      next.setMonth(next.getMonth() + 1);
    }

    return next;
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  const upcomingBillings = subscriptions
    .map(sub => ({
      ...sub,
      nextDate: getNextBillingDate(sub.billing_date)
    }))
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pb-20">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {urgentTrials.length > 0 && (
          <div className="card-float border-red-500/30 bg-red-950/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="font-semibold text-red-200">Essais à annuler</h2>
            </div>

            <div className="space-y-2">
              {urgentTrials.map((trial) => (
                <div key={trial.id} className="card-float bg-slate-700/30 border-slate-600/50 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{trial.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{trial.email}</p>
                    </div>
                    {trial.link && (
                      <a
                        href={trial.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="text-xs space-y-1 mb-3">
                    <p className="text-red-300 font-medium">
                      Fin : {new Date(trial.end_date).toLocaleDateString('fr-FR')}
                    </p>
                    {trial.cancel_date && (
                      <p className="text-gray-400">
                        Annuler avant : {new Date(trial.cancel_date).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => markTrialAsCanceled(trial.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl font-medium transition-all duration-200 text-sm"
                  >
                    Marqué comme annulé
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card-float bg-gradient-to-br from-blue-600/20 to-cyan-600/10 border-blue-500/30 p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingDown className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm text-gray-300">Dépense mensuelle</h2>
          </div>
          <p className="text-5xl font-bold text-white mb-2">
            {calculateMonthlyTotal().toFixed(2)} €
          </p>
          <p className="text-xs text-gray-400">
            {subscriptions.length} abonnement{subscriptions.length !== 1 ? 's' : ''} actif{subscriptions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {upcomingBillings.length > 0 && (
          <div className="card-float p-5">
            <h2 className="font-semibold text-white mb-4">Prochains prélèvements</h2>

            <div className="space-y-3">
              {upcomingBillings.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-4 card-float bg-slate-700/30 border-slate-600/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white">{sub.name}</p>
                      {sub.link && (
                        <a
                          href={sub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDate(sub.nextDate)} • {sub.frequency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{sub.price.toFixed(2)} €</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {subscriptions.length === 0 && urgentTrials.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400">Aucun abonnement ou essai actif</p>
            <p className="text-xs text-gray-500 mt-2">Utilisez le bouton Ajouter pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
}
