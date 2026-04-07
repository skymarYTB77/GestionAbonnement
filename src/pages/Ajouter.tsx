import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Copy } from 'lucide-react';

type FormType = 'abonnement' | 'essai' | null;

export default function Ajouter() {
  const [formType, setFormType] = useState<FormType>(null);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Ajouter</h1>

        {!formType && (
          <div className="space-y-3">
            <button
              onClick={() => setFormType('abonnement')}
              className="w-full bg-white border-2 border-gray-200 rounded-lg p-6 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-2">Abonnement</h2>
              <p className="text-gray-600">Ajouter un abonnement payant (mensuel ou annuel)</p>
            </button>

            <button
              onClick={() => setFormType('essai')}
              className="w-full bg-white border-2 border-gray-200 rounded-lg p-6 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-2">Essai gratuit</h2>
              <p className="text-gray-600">Ajouter un essai gratuit à suivre</p>
            </button>
          </div>
        )}

        {formType === 'abonnement' && (
          <SubscriptionForm onBack={() => setFormType(null)} />
        )}

        {formType === 'essai' && (
          <FreeTrialForm onBack={() => setFormType(null)} />
        )}
      </div>
    </div>
  );
}

function SubscriptionForm({ onBack }: { onBack: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    frequency: 'mensuel',
    billing_date: '',
    email: '',
    link: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (supabase) {
      await supabase.from('subscriptions').insert({
        name: formData.name,
        price: parseFloat(formData.price),
        frequency: formData.frequency,
        billing_date: parseInt(formData.billing_date),
        email: formData.email || null,
        link: formData.link || null,
        notes: formData.notes || null,
        status: 'actif',
      });
    }

    setLoading(false);
    onBack();
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="text-blue-600 hover:text-blue-800 mb-4 font-medium"
      >
        ← Retour
      </button>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Nouvel abonnement</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Netflix, Spotify..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix (€) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="9.99"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fréquence <span className="text-red-600">*</span>
              </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jour du prélèvement <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={formData.billing_date}
              onChange={(e) => setFormData({ ...formData, billing_date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="15"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Jour du mois (1-31)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="mon.email@exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lien</label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              placeholder="Notes personnelles..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Ajout en cours...' : 'Ajouter l\'abonnement'}
          </button>
        </form>
      </div>
    </div>
  );
}

function FreeTrialForm({ onBack }: { onBack: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    identifier: '',
    link: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    cancel_date: '',
    card_used: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  function generatePassword() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const length = 16;
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
    navigator.clipboard.writeText(password);
  }

  function handleEndDateChange(endDate: string) {
    const end = new Date(endDate);
    end.setDate(end.getDate() - 1);
    const cancelDate = end.toISOString().split('T')[0];

    setFormData({
      ...formData,
      end_date: endDate,
      cancel_date: cancelDate,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (supabase) {
      await supabase.from('free_trials').insert({
        name: formData.name,
        email: formData.email,
        password: formData.password || null,
        identifier: formData.identifier || null,
        link: formData.link || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        cancel_date: formData.cancel_date || null,
        card_used: formData.card_used || null,
        notes: formData.notes || null,
        status: 'actif',
      });
    }

    setLoading(false);
    onBack();
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="text-blue-600 hover:text-blue-800 mb-4 font-medium"
      >
        ← Retour
      </button>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Nouvel essai gratuit</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Nom du service"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="mon.email@exemple.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant</label>
            <input
              type="text"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Nom d'utilisateur"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Mot de passe"
              />
              <button
                type="button"
                onClick={generatePassword}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Générer
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Le bouton génère et copie automatiquement</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lien</label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date début <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date fin <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'annulation
            </label>
            <input
              type="date"
              value={formData.cancel_date}
              onChange={(e) => setFormData({ ...formData, cancel_date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">Par défaut : 1 jour avant la fin</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carte utilisée</label>
            <input
              type="text"
              value={formData.card_used}
              onChange={(e) => setFormData({ ...formData, card_used: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Visa ****1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              placeholder="Notes personnelles..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Ajout en cours...' : 'Ajouter l\'essai gratuit'}
          </button>
        </form>
      </div>
    </div>
  );
}
