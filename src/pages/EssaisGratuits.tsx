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
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {activeTrials.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-3 px-1">
              Actifs ({activeTrials.length})
            </h2>

            <div className="space-y-3">
              {activeTrials.map((trial) => {
                const daysLeft = getDaysUntilEnd(trial.end_date);
                const isUrgent = daysLeft <= 5;

                return (
                  <div
                    key={trial.id}
                    className={`card-float p-5 ${
                      isUrgent
                        ? 'border-red-500/50 bg-red-950/30'
                        : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg mb-1">{trial.name}</h3>
                        <p className="text-xs text-gray-400">{trial.email}</p>
                      </div>
                      <div className="flex gap-2">
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
                        <button
                          onClick={() => {
                            setSelectedTrial(trial);
                            setShowModal(true);
                          }}
                          className="text-gray-400 hover:text-gray-200 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTrial(trial.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className={`text-4xl font-bold mb-2 ${isUrgent ? 'text-red-300' : 'text-blue-400'}`}>
                        {daysLeft} jour{daysLeft > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-gray-400">
                        Se termine le {new Date(trial.end_date).toLocaleDateString('fr-FR')}
                      </p>
                      {trial.cancel_date && (
                        <p className="text-xs text-gray-500 mt-1">
                          Annuler avant le {new Date(trial.cancel_date).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      {trial.identifier && (
                        <div className="card-float bg-slate-700/30 border-slate-600/50 p-3 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 mb-1">Identifiant</p>
                            <p className="text-sm font-mono text-white truncate">{trial.identifier}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(trial.identifier!)}
                            className="ml-3 text-gray-400 hover:text-gray-200 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {trial.password && (
                        <div className="card-float bg-slate-700/30 border-slate-600/50 p-3 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 mb-1">Mot de passe</p>
                            <p className="text-sm font-mono text-white">
                              {visiblePasswords.has(trial.id) ? trial.password : '••••••••'}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-3">
                            <button
                              onClick={() => togglePasswordVisibility(trial.id)}
                              className="text-gray-400 hover:text-gray-200 transition-colors"
                            >
                              {visiblePasswords.has(trial.id) ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => copyToClipboard(trial.password!)}
                              className="text-gray-400 hover:text-gray-200 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {trial.card_used && (
                        <div className="text-sm text-gray-400 px-1">
                          Carte : {trial.card_used}
                        </div>
                      )}
                    </div>

                    {trial.notes && (
                      <div className="mb-4 p-3 card-float bg-slate-700/30 border-slate-600/50">
                        <p className="text-sm text-gray-300">{trial.notes}</p>
                      </div>
                    )}

                    <button
                      onClick={() => toggleStatus(trial.id, trial.status)}
                      className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 py-3 rounded-2xl font-medium transition-all duration-200 active:scale-95 border border-emerald-500/30"
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
            <h2 className="text-sm font-medium text-gray-400 mb-3 px-1">
              Annulés ({canceledTrials.length})
            </h2>

            <div className="space-y-3">
              {canceledTrials.map((trial) => (
                <div key={trial.id} className="card-float bg-slate-800/20 border-slate-700/30 p-4 opacity-60">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-300">{trial.name}</h3>
                      <p className="text-sm text-gray-400">{trial.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Était actif jusqu'au {new Date(trial.end_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteTrial(trial.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => toggleStatus(trial.id, trial.status)}
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Réactiver
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {trials.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400">Aucun essai gratuit</p>
            <p className="text-xs text-gray-500 mt-2">Utilisez le bouton Ajouter pour commencer</p>
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-float bg-slate-800/95 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6">Modifier l'essai gratuit</h2>

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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Identifiant</label>
            <input
              type="text"
              value={formData.identifier || ''}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
            <input
              type="text"
              value={formData.password || ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date début</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date fin</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date d'annulation</label>
            <input
              type="date"
              value={formData.cancel_date || ''}
              onChange={(e) => setFormData({ ...formData, cancel_date: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Carte utilisée</label>
            <input
              type="text"
              value={formData.card_used || ''}
              onChange={(e) => setFormData({ ...formData, card_used: e.target.value })}
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
