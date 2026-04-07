import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ExternalLink, CreditCard as Edit2, Trash2 } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export default function Abonnements() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  async function loadSubscriptions() {
    setLoading(true);
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    setSubscriptions(data || []);
    setLoading(false);
  }

  async function deleteSubscription(id: string) {
    if (!supabase) return;
    if (confirm('Supprimer cet abonnement ?')) {
      await supabase.from('subscriptions').delete().eq('id', id);
      loadSubscriptions();
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    if (!supabase) return;
    const newStatus = currentStatus === 'actif' ? 'annulé' : 'actif';
    await supabase
      .from('subscriptions')
      .update({ status: newStatus })
      .eq('id', id);

    loadSubscriptions();
  }

  function getMonthlyPrice(sub: Subscription): number {
    return sub.frequency === 'annuel' ? sub.price / 12 : sub.price;
  }

  const activeSubs = subscriptions.filter(s => s.status === 'actif');
  const canceledSubs = subscriptions.filter(s => s.status === 'annulé');

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
        {activeSubs.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-3 px-1">
              Actifs ({activeSubs.length})
            </h2>

            <div className="space-y-3">
              {activeSubs.map((sub) => (
                <div key={sub.id} className="card-float p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg mb-1">{sub.name}</h3>
                      {sub.email && (
                        <p className="text-xs text-gray-400">{sub.email}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {sub.link && (
                        <a
                          href={sub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setSelectedSub(sub);
                          setShowModal(true);
                        }}
                        className="text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSubscription(sub.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Prix {sub.frequency}</p>
                      <p className="text-3xl font-bold text-white">{sub.price.toFixed(2)} €</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Par mois</p>
                      <p className="text-3xl font-bold text-blue-400">{getMonthlyPrice(sub).toFixed(2)} €</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-400">Prélèvement le {sub.billing_date} du mois</p>
                  </div>

                  {sub.notes && (
                    <div className="mb-4 p-3 card-float bg-slate-700/30 border-slate-600/50">
                      <p className="text-sm text-gray-300">{sub.notes}</p>
                    </div>
                  )}

                  <button
                    onClick={() => toggleStatus(sub.id, sub.status)}
                    className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-300 py-3 rounded-2xl font-medium transition-all duration-200 active:scale-95 border border-red-500/30"
                  >
                    Marquer comme annulé
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {canceledSubs.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-3 px-1">
              Annulés ({canceledSubs.length})
            </h2>

            <div className="space-y-3">
              {canceledSubs.map((sub) => (
                <div key={sub.id} className="card-float bg-slate-800/20 border-slate-700/30 p-4 opacity-60">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-300">{sub.name}</h3>
                      <p className="text-sm text-gray-500">{sub.price.toFixed(2)} € • {sub.frequency}</p>
                    </div>
                    <button
                      onClick={() => deleteSubscription(sub.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => toggleStatus(sub.id, sub.status)}
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Réactiver
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {subscriptions.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400">Aucun abonnement</p>
            <p className="text-xs text-gray-500 mt-2">Utilisez le bouton Ajouter pour commencer</p>
          </div>
        )}
      </div>

      {showModal && selectedSub && (
        <SubscriptionEditModal
          subscription={selectedSub}
          onClose={() => {
            setShowModal(false);
            setSelectedSub(null);
          }}
          onSave={() => {
            setShowModal(false);
            setSelectedSub(null);
            loadSubscriptions();
          }}
        />
      )}
    </div>
  );
}

type ModalProps = {
  subscription: Subscription;
  onClose: () => void;
  onSave: () => void;
};

function SubscriptionEditModal({ subscription, onClose, onSave }: ModalProps) {
  const [formData, setFormData] = useState(subscription);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!supabase) return;

    await supabase
      .from('subscriptions')
      .update(formData)
      .eq('id', subscription.id);

    onSave();
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-float bg-slate-800/95 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6">Modifier l'abonnement</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prix (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fréquence</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              >
                <option value="mensuel">Mensuel</option>
                <option value="annuel">Annuel</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Jour du prélèvement</label>
            <input
              type="number"
              min="1"
              max="31"
              value={formData.billing_date}
              onChange={(e) => setFormData({ ...formData, billing_date: parseInt(e.target.value) })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Lien</label>
            <input
              type="url"
              value={formData.link || ''}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 text-gray-200 py-3 rounded-xl font-medium hover:bg-slate-600 transition-all duration-200 active:scale-95"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 active:scale-95"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
