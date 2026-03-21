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
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    setSubscriptions(data || []);
    setLoading(false);
  }

  async function deleteSubscription(id: string) {
    if (confirm('Supprimer cet abonnement ?')) {
      await supabase.from('subscriptions').delete().eq('id', id);
      loadSubscriptions();
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
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
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Abonnements</h1>

        {activeSubs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase">
              Actifs ({activeSubs.length})
            </h2>

            <div className="space-y-3">
              {activeSubs.map((sub) => (
                <div key={sub.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{sub.name}</h3>
                      {sub.email && (
                        <p className="text-sm text-gray-600">{sub.email}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {sub.link && (
                        <a
                          href={sub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setSelectedSub(sub);
                          setShowModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteSubscription(sub.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Prix</p>
                      <p className="font-bold text-gray-900">{sub.price.toFixed(2)} €</p>
                      <p className="text-xs text-gray-500">{sub.frequency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Mensuel</p>
                      <p className="font-bold text-gray-900">{getMonthlyPrice(sub).toFixed(2)} €</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Prélèvement le {sub.billing_date} du mois</p>
                  </div>

                  {sub.notes && (
                    <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                      {sub.notes}
                    </div>
                  )}

                  <button
                    onClick={() => toggleStatus(sub.id, sub.status)}
                    className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700"
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
            <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase">
              Annulés ({canceledSubs.length})
            </h2>

            <div className="space-y-3">
              {canceledSubs.map((sub) => (
                <div key={sub.id} className="bg-gray-100 rounded-lg p-4 border border-gray-300 opacity-75">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-700">{sub.name}</h3>
                      <p className="text-sm text-gray-600">{sub.price.toFixed(2)} € • {sub.frequency}</p>
                    </div>
                    <button
                      onClick={() => deleteSubscription(sub.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={() => toggleStatus(sub.id, sub.status)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Réactiver
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {subscriptions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun abonnement</p>
            <p className="text-sm text-gray-400 mt-2">Utilisez l'onglet Ajouter pour en créer un</p>
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

    await supabase
      .from('subscriptions')
      .update(formData)
      .eq('id', subscription.id);

    onSave();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Modifier l'abonnement</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="mensuel">Mensuel</option>
                <option value="annuel">Annuel</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jour du prélèvement</label>
            <input
              type="number"
              min="1"
              max="31"
              value={formData.billing_date}
              onChange={(e) => setFormData({ ...formData, billing_date: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lien</label>
            <input
              type="url"
              value={formData.link || ''}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
