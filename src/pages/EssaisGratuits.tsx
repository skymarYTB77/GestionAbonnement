import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ExternalLink, CreditCard as Edit2, Trash2, Eye, EyeOff, Copy } from 'lucide-react';
import type { Database } from '../lib/database.types';

type FreeTrial = Database['public']['Tables']['free_trials']['Row'];

export default function EssaisGratuits() {
  const [trials, setTrials] = useState<FreeTrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrial, setSelectedTrial] = useState<FreeTrial | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTrials();
  }, []);

  async function loadTrials() {
    setLoading(true);
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('free_trials')
      .select('*')
      .order('end_date', { ascending: true });

    setTrials(data || []);
    setLoading(false);
  }

  async function deleteTrial(id: string) {
    if (!supabase) return;
    if (confirm('Supprimer cet essai gratuit ?')) {
      await supabase.from('free_trials').delete().eq('id', id);
      loadTrials();
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    if (!supabase) return;
    const newStatus = currentStatus === 'actif' ? 'annulé' : 'actif';
    await supabase
      .from('free_trials')
      .update({ status: newStatus })
      .eq('id', id);

    loadTrials();
  }

  function togglePasswordVisibility(id: string) {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
  }

  function getDaysUntilEnd(endDate: string): number {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const activeTrials = trials.filter(t => t.status === 'actif');
  const canceledTrials = trials.filter(t => t.status === 'annulé');

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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Essais gratuits</h1>

        {activeTrials.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase">
              Actifs ({activeTrials.length})
            </h2>

            <div className="space-y-3">
              {activeTrials.map((trial) => {
                const daysLeft = getDaysUntilEnd(trial.end_date);
                const isUrgent = daysLeft <= 5;

                return (
                  <div
                    key={trial.id}
                    className={`rounded-lg p-4 shadow-sm border-2 ${
                      isUrgent
                        ? 'bg-red-50 border-red-300'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{trial.name}</h3>
                        <p className="text-sm text-gray-600">{trial.email}</p>
                      </div>
                      <div className="flex gap-2">
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
                        <button
                          onClick={() => {
                            setSelectedTrial(trial);
                            setShowModal(true);
                          }}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteTrial(trial.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className={`text-sm font-medium ${isUrgent ? 'text-red-700' : 'text-gray-700'}`}>
                        <span>Se termine dans {daysLeft} jour{daysLeft > 1 ? 's' : ''}</span>
                        <span className="ml-2 text-gray-600">
                          ({new Date(trial.end_date).toLocaleDateString('fr-FR')})
                        </span>
                      </div>

                      {trial.cancel_date && (
                        <div className="text-sm text-gray-600">
                          À annuler avant : {new Date(trial.cancel_date).toLocaleDateString('fr-FR')}
                        </div>
                      )}

                      {trial.identifier && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Identifiant :</span>
                          <span className="text-sm font-mono text-gray-900">{trial.identifier}</span>
                          <button
                            onClick={() => copyToClipboard(trial.identifier!)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {trial.password && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Mot de passe :</span>
                          <span className="text-sm font-mono text-gray-900">
                            {visiblePasswords.has(trial.id) ? trial.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(trial.id)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            {visiblePasswords.has(trial.id) ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(trial.password!)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {trial.card_used && (
                        <div className="text-sm text-gray-600">
                          Carte : {trial.card_used}
                        </div>
                      )}
                    </div>

                    {trial.notes && (
                      <div className="mb-3 p-2 bg-white rounded text-sm text-gray-700 border border-gray-200">
                        {trial.notes}
                      </div>
                    )}

                    <button
                      onClick={() => toggleStatus(trial.id, trial.status)}
                      className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
                    >
                      Marquer comme annulé
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {canceledTrials.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase">
              Annulés ({canceledTrials.length})
            </h2>

            <div className="space-y-3">
              {canceledTrials.map((trial) => (
                <div key={trial.id} className="bg-gray-100 rounded-lg p-4 border border-gray-300 opacity-75">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-700">{trial.name}</h3>
                      <p className="text-sm text-gray-600">{trial.email}</p>
                      <p className="text-xs text-gray-500">
                        Était actif jusqu'au {new Date(trial.end_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteTrial(trial.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={() => toggleStatus(trial.id, trial.status)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Réactiver
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {trials.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun essai gratuit</p>
            <p className="text-sm text-gray-400 mt-2">Utilisez l'onglet Ajouter pour en créer un</p>
          </div>
        )}
      </div>

      {showModal && selectedTrial && (
        <FreeTrialEditModal
          trial={selectedTrial}
          onClose={() => {
            setShowModal(false);
            setSelectedTrial(null);
          }}
          onSave={() => {
            setShowModal(false);
            setSelectedTrial(null);
            loadTrials();
          }}
        />
      )}
    </div>
  );
}

type ModalProps = {
  trial: FreeTrial;
  onClose: () => void;
  onSave: () => void;
};

function FreeTrialEditModal({ trial, onClose, onSave }: ModalProps) {
  const [formData, setFormData] = useState(trial);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!supabase) return;

    await supabase
      .from('free_trials')
      .update(formData)
      .eq('id', trial.id);

    onSave();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Modifier l'essai gratuit</h2>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant</label>
            <input
              type="text"
              value={formData.identifier || ''}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="text"
              value={formData.password || ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date d'annulation</label>
            <input
              type="date"
              value={formData.cancel_date || ''}
              onChange={(e) => setFormData({ ...formData, cancel_date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carte utilisée</label>
            <input
              type="text"
              value={formData.card_used || ''}
              onChange={(e) => setFormData({ ...formData, card_used: e.target.value })}
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
