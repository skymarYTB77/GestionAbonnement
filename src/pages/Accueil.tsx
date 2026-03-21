import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ExternalLink, AlertCircle } from 'lucide-react';
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
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {urgentTrials.length > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h2 className="font-bold text-red-900">Essais à annuler</h2>
            </div>

            <div className="space-y-3">
              {urgentTrials.map((trial) => (
                <div key={trial.id} className="bg-white rounded-lg p-3 border border-red-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{trial.name}</h3>
                      <p className="text-sm text-gray-600">{trial.email}</p>
                    </div>
                    {trial.link && (
                      <a
                        href={trial.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>

                  <div className="text-sm space-y-1 mb-3">
                    <p className="text-red-700 font-medium">
                      Fin : {new Date(trial.end_date).toLocaleDateString('fr-FR')}
                    </p>
                    {trial.cancel_date && (
                      <p className="text-gray-600">
                        Annuler avant : {new Date(trial.cancel_date).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => markTrialAsCanceled(trial.id)}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
                  >
                    Annulé
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-sm text-gray-600 mb-1">Total mensuel</h2>
          <p className="text-4xl font-bold text-gray-900">
            {calculateMonthlyTotal().toFixed(2)} €
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {subscriptions.length} abonnement{subscriptions.length > 1 ? 's' : ''} actif{subscriptions.length > 1 ? 's' : ''}
          </p>
        </div>

        {upcomingBillings.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-900 mb-3">Prochains prélèvements</h2>

            <div className="space-y-2">
              {upcomingBillings.map((sub) => (
                <div key={sub.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{sub.name}</p>
                      {sub.link && (
                        <a
                          href={sub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(sub.nextDate)} • {sub.frequency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{sub.price.toFixed(2)} €</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {subscriptions.length === 0 && urgentTrials.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun abonnement ou essai actif</p>
            <p className="text-sm text-gray-400 mt-2">Ajoutez-en un pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
}
