'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCJDropshipping } from '@/hooks/useCJDropshipping';
import { CJConfig } from '@/types/cj.types';
import { useEffect, useState } from 'react';

export default function CJConfigPage() {
  const {
    loading,
    error,
    getConfig,
    updateConfig,
    testConnection,
  } = useCJDropshipping();

  const [config, setConfig] = useState<CJConfig | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    apiKey: '',
    tier: 'free' as 'free' | 'plus' | 'prime' | 'advanced',
    platformToken: '',
    enabled: false,
  });
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await getConfig();
      setConfig(data);
      setFormData({
        email: data.email || '',
        apiKey: data.apiKey || '',
        tier: data.tier as any || 'free',
        platformToken: data.platformToken || '',
        enabled: data.enabled || false,
      });
    } catch (err) {
      console.error('Erreur lors du chargement de la configuration:', err);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const success = await testConnection();
      if (success) {
        alert('✅ Connexion CJ Dropshipping réussie !');
        await loadConfig(); // Recharger la config
      } else {
        alert('❌ Connexion CJ Dropshipping échouée. Vérifiez vos credentials.');
      }
    } catch (err) {
      alert('❌ Erreur lors du test de connexion');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfig(formData);
      alert('✅ Configuration sauvegardée avec succès !');
      await loadConfig();
    } catch (err) {
      alert('❌ Erreur lors de la sauvegarde de la configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configuration CJ Dropshipping
        </h1>
        <p className="text-gray-600">
          Configurez votre intégration avec l'API CJ Dropshipping
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire de configuration */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Paramètres de connexion</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email du compte CJ *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="votre@email.com"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clé API CJ *
              </label>
              <Input
                type="password"
                value={formData.apiKey}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
                placeholder="Votre clé API CJ"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Obtenez votre clé API dans votre compte CJ Dropshipping
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau d'abonnement
              </label>
              <select
                value={formData.tier}
                onChange={(e) => handleInputChange('tier', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="free">Free (1 req/s)</option>
                <option value="plus">Plus (2 req/s)</option>
                <option value="prime">Prime (4 req/s)</option>
                <option value="advanced">Advanced (6 req/s)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token de plateforme (optionnel)
              </label>
              <Input
                type="text"
                value={formData.platformToken}
                onChange={(e) => handleInputChange('platformToken', e.target.value)}
                placeholder="Token de plateforme (optionnel)"
                className="w-full"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => handleInputChange('enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
                Activer l'intégration CJ Dropshipping
              </label>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleTestConnection}
                disabled={testing || !formData.email || !formData.apiKey}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {testing ? 'Test en cours...' : 'Tester la connexion'}
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Informations du compte */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Informations du compte</h2>
          
          {config && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Statut de connexion</p>
                  <p className={`text-sm ${
                    config.connected ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {config.connected ? 'Connecté' : 'Déconnecté'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  config.connected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tier actuel</p>
                  <p className="font-medium capitalize">{config.tier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dernière sync</p>
                  <p className="font-medium">
                    {config.lastSync 
                      ? new Date(config.lastSync).toLocaleDateString('fr-FR')
                      : 'Jamais'
                    }
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Limites de l'API</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Requêtes par seconde:</span>
                    <span className="font-medium">
                      {config.tier === 'free' && '1 req/s'}
                      {config.tier === 'plus' && '2 req/s'}
                      {config.tier === 'prime' && '4 req/s'}
                      {config.tier === 'advanced' && '6 req/s'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Login par 5min:</span>
                    <span className="font-medium">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refresh par min:</span>
                    <span className="font-medium">5</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">💡 Conseils</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Testez toujours la connexion après modification</li>
              <li>• Le tier détermine la vitesse de synchronisation</li>
              <li>• Activez l'intégration seulement si tout fonctionne</li>
              <li>• Gardez vos credentials sécurisés</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

