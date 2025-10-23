'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCJDropshipping } from '@/hooks/useCJDropshipping';
import { ArrowLeft, Save, TestTube } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CJConfigPage() {
  const { loading, error, getConfig, updateConfig, testConnection } = useCJDropshipping();
  
  const [config, setConfig] = useState({
    email: '',
    apiKey: '',
    tier: 'free',
    platformToken: '',
    enabled: true
  });
  
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const configData = await getConfig();
      if (configData.data) {
        setConfig({
          email: configData.data.email || '',
          apiKey: configData.data.apiKey || '',
          tier: configData.data.tier || 'free',
          platformToken: configData.data.platformToken || '',
          enabled: configData.data.enabled !== false
        });
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la configuration:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateConfig(config);
      if (result.success) {
        alert('✅ Configuration sauvegardée avec succès !');
        await loadConfig(); // Recharger la configuration
      } else {
        alert('❌ Erreur lors de la sauvegarde: ' + result.error);
      }
    } catch (err) {
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const success = await testConnection();
      if (success) {
        alert('✅ Connexion CJ Dropshipping réussie !');
      } else {
        alert('❌ Connexion CJ Dropshipping échouée');
      }
    } catch (err) {
      alert('❌ Erreur lors du test de connexion');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin/cj-dropshipping">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Configuration CJ Dropshipping
            </h1>
            <p className="text-gray-600">
              Configurez votre intégration avec l'API CJ Dropshipping
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de connexion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email du compte CJ *</Label>
              <Input
                id="email"
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                placeholder="votre@email.com"
              />
              <p className="text-sm text-gray-500 mt-1">
                Email associé à votre compte CJ Dropshipping
              </p>
            </div>

            <div>
              <Label htmlFor="apiKey">Clé API CJ *</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey && config.apiKey.startsWith('***') ? '' : config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder={config.apiKey && config.apiKey.startsWith('***') ? 'Clé API configurée (***' + config.apiKey.slice(-4) + ')' : 'Votre clé API CJ'}
              />
              <p className="text-sm text-gray-500 mt-1">
                {config.apiKey && config.apiKey.startsWith('***') 
                  ? 'Clé API déjà configurée. Entrez une nouvelle clé pour la remplacer.'
                  : 'Obtenez votre clé API dans votre compte CJ Dropshipping'
                }
              </p>
            </div>

            <div>
              <Label htmlFor="tier">Niveau d'abonnement</Label>
              <Select value={config.tier} onValueChange={(value) => setConfig({ ...config, tier: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free (1 req/s)</SelectItem>
                  <SelectItem value="plus">Plus (5 req/s)</SelectItem>
                  <SelectItem value="prime">Prime (10 req/s)</SelectItem>
                  <SelectItem value="advanced">Advanced (20 req/s)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="platformToken">Token de plateforme (optionnel)</Label>
              <Input
                id="platformToken"
                value={config.platformToken}
                onChange={(e) => setConfig({ ...config, platformToken: e.target.value })}
                placeholder="Token de plateforme"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enabled"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="enabled">Activer l'intégration CJ Dropshipping</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-3">
              <Button
                onClick={handleTest}
                disabled={testing || !config.email || !config.apiKey}
                className="w-full"
                variant="outline"
              >
                <TestTube className="w-4 h-4 mr-2" />
                {testing ? 'Test en cours...' : 'Tester la connexion'}
              </Button>

              <Button
                onClick={handleSave}
                disabled={saving || loading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              <h4 className="font-medium mb-2">Instructions :</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Connectez-vous à votre compte CJ Dropshipping</li>
                <li>Allez dans "API Settings" ou "Paramètres API"</li>
                <li>Générez une nouvelle clé API</li>
                <li>Copiez la clé et collez-la dans le champ ci-dessus</li>
                <li>Testez la connexion avant de sauvegarder</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}