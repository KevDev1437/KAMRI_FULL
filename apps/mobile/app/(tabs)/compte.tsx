import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import HomeFooter from '../../components/HomeFooter';
import { ThemedText } from '../../components/themed-text';
import UnifiedHeader from '../../components/UnifiedHeader';
import { useAuth } from '../../contexts/AuthContext';
import { Address, apiClient } from '../../lib/api';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('orders');
  const { logout, user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  // États pour les données réelles
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  // Recharger les données quand l'utilisateur change
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Recharger les données quand on revient sur la page
  useFocusEffect(
    useCallback(() => {
      if (user) {
        console.log('🔄 [COMPTE-MOBILE] Page focusée, rechargement des données...');
        loadData();
      }
    }, [user])
  );

  const loadData = async () => {
    if (!isAuthenticated || !user) {
      console.log('⚠️ [COMPTE-MOBILE] Utilisateur non connecté, arrêt du chargement');
      setLoading(false);
      return;
    }

    try {
      console.log('📱 [COMPTE-MOBILE] Chargement des données pour:', user.email);
      setLoading(true);

      // Charger les commandes
      const ordersResponse = await apiClient.getOrders();
      if (ordersResponse.data) {
        const ordersData = ordersResponse.data.data || ordersResponse.data;
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        console.log('📦 [COMPTE-MOBILE] Commandes chargées:', ordersData);
      }

      // Charger les adresses
      console.log('🏠 [COMPTE-MOBILE] Tentative de chargement des adresses...');
      const addressesResponse = await apiClient.getAddresses();
      console.log('🏠 [COMPTE-MOBILE] Réponse API adresses:', addressesResponse);
      
      if (addressesResponse.data) {
        const addressesData = addressesResponse.data.data || addressesResponse.data;
        setAddresses(Array.isArray(addressesData) ? addressesData : []);
        console.log('🏠 [COMPTE-MOBILE] Adresses chargées:', addressesData);
      } else {
        console.log('❌ [COMPTE-MOBILE] Aucune donnée d\'adresses reçue');
        console.log('❌ [COMPTE-MOBILE] Erreur:', addressesResponse.error);
      }

                  // Charger les paramètres
                  const settingsResponse = await apiClient.getUserSettings();
                  if (settingsResponse.data) {
                    const settingsData = settingsResponse.data.data || settingsResponse.data;
                    
                    // S'assurer que les paramètres ont des valeurs par défaut
                    const defaultSettings = {
                      notifications: {
                        email: true,
                        sms: false,
                        push: true,
                        marketing: false,
                        ...settingsData.notifications
                      },
                      privacy: {
                        profileVisible: true,
                        orderHistory: false,
                        dataSharing: false,
                        ...settingsData.privacy
                      },
                      preferences: {
                        theme: 'light',
                        language: 'fr',
                        currency: 'EUR',
                        ...settingsData.preferences
                      },
                      ...settingsData
                    };
                    
                    setSettings(defaultSettings);
                    console.log('⚙️ [COMPTE-MOBILE] Paramètres chargés avec valeurs par défaut:', defaultSettings);
                  } else {
                    console.log('❌ [COMPTE-MOBILE] Aucune donnée de paramètres reçue');
                    console.log('❌ [COMPTE-MOBILE] Erreur:', settingsResponse.error);
                  }
    } catch (error) {
      console.error('❌ [COMPTE-MOBILE] Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Méthode pour rafraîchir les données
  const refreshData = () => {
    console.log('🔄 [COMPTE-MOBILE] Rafraîchissement des données...');
    loadData();
  };

  // État pour le formulaire d'ajout d'adresse
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  });

  // État pour les moyens de paiement
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    isDefault: false
  });

  // Fonction pour ajouter une adresse
  const handleAddAddress = () => {
    console.log('➕ [COMPTE-MOBILE] Ouverture du formulaire d\'ajout d\'adresse');
    setShowAddressModal(true);
  };

  // Fonctions pour les moyens de paiement
  const handleAddPayment = () => {
    console.log('💳 [COMPTE-MOBILE] Ouverture du formulaire d\'ajout de moyen de paiement');
    setShowPaymentModal(true);
  };

  const handleSavePayment = async () => {
    try {
      console.log('💾 [COMPTE-MOBILE] Sauvegarde du moyen de paiement:', paymentForm);
      
      // Pour l'instant, on simule l'ajout (pas d'API backend pour les moyens de paiement)
      const newPayment = {
        id: Date.now().toString(),
        cardNumber: paymentForm.cardNumber,
        expiryDate: paymentForm.expiryDate,
        cardholderName: paymentForm.cardholderName,
        isDefault: paymentForm.isDefault,
        createdAt: new Date().toISOString()
      };
      
      setPaymentMethods(prev => [...prev, newPayment]);
      setShowPaymentModal(false);
      setPaymentForm({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        isDefault: false
      });
      
      console.log('✅ [COMPTE-MOBILE] Moyen de paiement ajouté');
      Alert.alert('Succès', 'Moyen de paiement ajouté avec succès');
    } catch (error) {
      console.error('❌ [COMPTE-MOBILE] Erreur lors de l\'ajout du moyen de paiement:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le moyen de paiement');
    }
  };

  // Fonction pour sauvegarder l'adresse
  const handleSaveAddress = async () => {
    try {
      console.log('💾 [COMPTE-MOBILE] Sauvegarde de l\'adresse:', addressForm);
      const response = await apiClient.addAddress(addressForm);
      
      if (response.data) {
        console.log('✅ [COMPTE-MOBILE] Adresse ajoutée avec succès');
        setShowAddressModal(false);
        setAddressForm({
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'FR',
          isDefault: false
        });
        // Recharger les adresses
        loadData();
      } else {
        console.log('❌ [COMPTE-MOBILE] Erreur lors de l\'ajout:', response.error);
        Alert.alert('Erreur', 'Impossible d\'ajouter l\'adresse: ' + response.error);
      }
    } catch (error) {
      console.error('❌ [COMPTE-MOBILE] Erreur lors de l\'ajout d\'adresse:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'adresse');
    }
  };

  const tabs = [
    { id: 'orders', label: 'Commandes', icon: 'receipt' },
    { id: 'addresses', label: 'Adresses', icon: 'home' },
    { id: 'settings', label: 'Paramètres', icon: 'settings' }
  ];

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: () => logout() }
      ]
    );
  };


  const renderOrders = () => {
    if (loading) {
      return (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Mes commandes</ThemedText>
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>Chargement des commandes...</ThemedText>
          </View>
        </View>
      );
    }

    const getStatusColor = (status: string) => {
      switch (status?.toLowerCase()) {
        case 'delivered':
        case 'livrée':
          return '#4CAF50';
        case 'pending':
        case 'en cours':
          return '#2196F3';
        case 'shipped':
        case 'expédiée':
          return '#FF9800';
        case 'cancelled':
        case 'annulée':
          return '#EF4444';
        default:
          return '#9CA3AF';
      }
    };

    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } catch {
        return dateString;
      }
    };

    return (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Mes commandes</ThemedText>
        
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
            </View>
            <ThemedText style={styles.emptyText}>Aucune commande trouvée</ThemedText>
            <ThemedText style={styles.emptySubtext}>Vos commandes apparaîtront ici</ThemedText>
            <TouchableOpacity 
              style={styles.discoverButton}
              onPress={() => {
                console.log('🛍️ [COMPTE-MOBILE] Navigation vers les produits');
                router.push('/(tabs)/products');
              }}
            >
              <Ionicons name="storefront" size={20} color="#FFFFFF" />
              <ThemedText style={styles.discoverButtonText}>Découvrir nos produits</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>{orders.length}</ThemedText>
                <ThemedText style={styles.statLabel}>Total</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>
                  {orders.filter(o => o.status?.toLowerCase() === 'delivered' || o.status?.toLowerCase() === 'livrée').length}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Livrées</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>
                  {orders.filter(o => o.status?.toLowerCase() === 'pending' || o.status?.toLowerCase() === 'en cours').length}
                </ThemedText>
                <ThemedText style={styles.statLabel}>En cours</ThemedText>
              </View>
            </View>

            <View style={styles.ordersList}>
              {orders.map((order, index) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <ThemedText style={styles.orderId}>{order.id}</ThemedText>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                      <ThemedText style={styles.statusText}>{order.status}</ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.orderDate}>{formatDate(order.createdAt)}</ThemedText>
                  <ThemedText style={styles.orderTotal}>{order.total?.toFixed(2)}$</ThemedText>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    );
  };

  const renderAddresses = () => {
    if (loading) {
      return (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Mes adresses</ThemedText>
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>Chargement des adresses...</ThemedText>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Mes adresses</ThemedText>
        
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>Aucune adresse enregistrée</ThemedText>
            <ThemedText style={styles.emptySubtext}>Ajoutez votre première adresse</ThemedText>
          </View>
        ) : (
          <View style={styles.addressesList}>
            {addresses.map((address) => (
              <View key={address.id} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <View style={styles.addressIcon}>
                    <Ionicons name="home" size={20} color="#4CAF50" />
                  </View>
                  <View style={styles.addressInfo}>
                    <ThemedText style={styles.addressName}>
                      {address.street ? `${address.street}, ${address.city}` : 'Adresse'}
                    </ThemedText>
                    {address.isDefault && (
                      <View style={styles.defaultBadge}>
                        <ThemedText style={styles.defaultText}>Par défaut</ThemedText>
                      </View>
                    )}
                  </View>
                </View>
                <ThemedText style={styles.addressText}>
                  {address.street}, {address.city}, {address.state} {address.zipCode}, {address.country}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
          <Ionicons name="add" size={20} color="#4CAF50" />
          <ThemedText style={styles.addButtonText}>Ajouter une adresse</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  // Supprimer l'ancien état settings statique - on utilise maintenant l'état dynamique

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleNotificationChange = async (type: string) => {
    if (!settings || !settings.notifications) {
      console.log('❌ [COMPTE-MOBILE] Settings ou notifications non disponibles');
      Alert.alert('Erreur', 'Paramètres non chargés, veuillez réessayer');
      return;
    }
    
    try {
      const currentValue = settings.notifications[type] || false;
      const updatedNotifications = {
        ...settings.notifications,
        [type]: !currentValue
      };
      
      console.log('🔄 [COMPTE-MOBILE] Mise à jour notification:', type, 'de', currentValue, 'vers', !currentValue);
      
      const response = await apiClient.updateUserSettings({
        notifications: updatedNotifications
      });
      
      if (response.data) {
        const updatedSettings = {
          ...settings,
          notifications: updatedNotifications
        };
        setSettings(updatedSettings);
        console.log('✅ [COMPTE-MOBILE] Paramètres de notification mis à jour');
      } else {
        console.log('❌ [COMPTE-MOBILE] Erreur API:', response.error);
        Alert.alert('Erreur', 'Impossible de mettre à jour les notifications: ' + response.error);
      }
    } catch (error) {
      console.error('❌ [COMPTE-MOBILE] Erreur lors de la mise à jour des notifications:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour les notifications');
    }
  };

  const handlePrivacyChange = async (type: string) => {
    if (!settings || !settings.privacy) {
      console.log('❌ [COMPTE-MOBILE] Settings ou privacy non disponibles');
      Alert.alert('Erreur', 'Paramètres non chargés, veuillez réessayer');
      return;
    }
    
    try {
      const currentValue = settings.privacy[type] || false;
      const updatedPrivacy = {
        ...settings.privacy,
        [type]: !currentValue
      };
      
      console.log('🔄 [COMPTE-MOBILE] Mise à jour confidentialité:', type, 'de', currentValue, 'vers', !currentValue);
      
      const response = await apiClient.updateUserSettings({
        privacy: updatedPrivacy
      });
      
      if (response.data) {
        const updatedSettings = {
          ...settings,
          privacy: updatedPrivacy
        };
        setSettings(updatedSettings);
        console.log('✅ [COMPTE-MOBILE] Paramètres de confidentialité mis à jour');
      } else {
        console.log('❌ [COMPTE-MOBILE] Erreur API:', response.error);
        Alert.alert('Erreur', 'Impossible de mettre à jour la confidentialité: ' + response.error);
      }
    } catch (error) {
      console.error('❌ [COMPTE-MOBILE] Erreur lors de la mise à jour de la confidentialité:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la confidentialité');
    }
  };

  const handlePreferenceChange = async (type: string, value: any) => {
    if (!settings || !settings.preferences) {
      console.log('❌ [COMPTE-MOBILE] Settings ou preferences non disponibles');
      Alert.alert('Erreur', 'Paramètres non chargés, veuillez réessayer');
      return;
    }
    
    try {
      const updatedPreferences = {
        ...settings.preferences,
        [type]: value
      };
      
      console.log('🔄 [COMPTE-MOBILE] Mise à jour préférence:', type, 'vers', value);
      
      const response = await apiClient.updateUserSettings({
        preferences: updatedPreferences
      });
      
      if (response.data) {
        const updatedSettings = {
          ...settings,
          preferences: updatedPreferences
        };
        setSettings(updatedSettings);
        console.log('✅ [COMPTE-MOBILE] Préférences mises à jour');
      } else {
        console.log('❌ [COMPTE-MOBILE] Erreur API:', response.error);
        Alert.alert('Erreur', 'Impossible de mettre à jour les préférences: ' + response.error);
      }
    } catch (error) {
      console.error('❌ [COMPTE-MOBILE] Erreur lors de la mise à jour des préférences:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour les préférences');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => console.log('Compte supprimé') }
      ]
    );
    setShowDeleteModal(false);
  };

  const renderSettings = () => {
    if (loading) {
      return (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Paramètres</ThemedText>
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>Chargement des paramètres...</ThemedText>
          </View>
        </View>
      );
    }

    if (!settings) {
      return (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Paramètres</ThemedText>
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>Aucun paramètre trouvé</ThemedText>
            <ThemedText style={styles.emptySubtext}>Les paramètres par défaut sont utilisés</ThemedText>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Paramètres</ThemedText>
        
        {/* Notifications */}
        <View style={styles.settingsCard}>
          <ThemedText style={styles.cardTitle}>Notifications</ThemedText>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Notifications par email</ThemedText>
              <ThemedText style={styles.settingDescription}>Recevez des mises à jour par email</ThemedText>
            </View>
            <TouchableOpacity 
              style={[styles.toggle, settings.notifications?.email && styles.toggleActive]}
              onPress={() => handleNotificationChange('email')}
            >
              <View style={[styles.toggleThumb, settings.notifications?.email && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Notifications par SMS</ThemedText>
              <ThemedText style={styles.settingDescription}>Recevez des alertes par SMS</ThemedText>
            </View>
            <TouchableOpacity 
              style={[styles.toggle, settings.notifications?.sms && styles.toggleActive]}
              onPress={() => handleNotificationChange('sms')}
            >
              <View style={[styles.toggleThumb, settings.notifications?.sms && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Notifications push</ThemedText>
              <ThemedText style={styles.settingDescription}>Recevez des notifications sur votre appareil</ThemedText>
            </View>
            <TouchableOpacity 
              style={[styles.toggle, settings.notifications?.push && styles.toggleActive]}
              onPress={() => handleNotificationChange('push')}
            >
              <View style={[styles.toggleThumb, settings.notifications?.push && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Emails marketing</ThemedText>
              <ThemedText style={styles.settingDescription}>Recevez nos offres et nouveautés</ThemedText>
            </View>
            <TouchableOpacity 
              style={[styles.toggle, settings.notifications?.marketing && styles.toggleActive]}
              onPress={() => handleNotificationChange('marketing')}
            >
              <View style={[styles.toggleThumb, settings.notifications?.marketing && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confidentialité */}
        <View style={styles.settingsCard}>
          <ThemedText style={styles.cardTitle}>Confidentialité</ThemedText>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Profil visible</ThemedText>
              <ThemedText style={styles.settingDescription}>Rendre votre profil visible aux autres utilisateurs</ThemedText>
            </View>
            <TouchableOpacity 
              style={[styles.toggle, settings.privacy?.profileVisible && styles.toggleActive]}
              onPress={() => handlePrivacyChange('profileVisible')}
            >
              <View style={[styles.toggleThumb, settings.privacy?.profileVisible && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Historique des commandes visible</ThemedText>
              <ThemedText style={styles.settingDescription}>Permettre l&apos;affichage de votre historique</ThemedText>
            </View>
            <TouchableOpacity 
              style={[styles.toggle, settings.privacy?.orderHistory && styles.toggleActive]}
              onPress={() => handlePrivacyChange('orderHistory')}
            >
              <View style={[styles.toggleThumb, settings.privacy?.orderHistory && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Partage de données</ThemedText>
              <ThemedText style={styles.settingDescription}>Partager vos données avec nos partenaires de confiance</ThemedText>
            </View>
            <TouchableOpacity 
              style={[styles.toggle, settings.privacy?.dataSharing && styles.toggleActive]}
              onPress={() => handlePrivacyChange('dataSharing')}
            >
              <View style={[styles.toggleThumb, settings.privacy?.dataSharing && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Préférences */}
        <View style={styles.settingsCard}>
          <ThemedText style={styles.cardTitle}>Préférences</ThemedText>
          
          <View style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>Thème</ThemedText>
            <View style={styles.preferenceButtons}>
              {['light', 'dark', 'auto'].map((theme) => (
                <TouchableOpacity
                  key={theme}
                  style={[
                    styles.preferenceButton,
                    settings.preferences?.theme === theme && styles.preferenceButtonActive
                  ]}
                  onPress={() => handlePreferenceChange('theme', theme)}
                >
                  <ThemedText style={[
                    styles.preferenceButtonText,
                    settings.preferences?.theme === theme && styles.preferenceButtonTextActive
                  ]}>
                    {theme === 'light' && 'Clair'}
                    {theme === 'dark' && 'Sombre'}
                    {theme === 'auto' && 'Automatique'}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>Langue</ThemedText>
            <View style={styles.preferenceButtons}>
              {[
                { value: 'fr', label: 'Français' },
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español' }
              ].map((lang) => (
                <TouchableOpacity
                  key={lang.value}
                  style={[
                    styles.preferenceButton,
                    settings.preferences?.language === lang.value && styles.preferenceButtonActive
                  ]}
                  onPress={() => handlePreferenceChange('language', lang.value)}
                >
                  <ThemedText style={[
                    styles.preferenceButtonText,
                    settings.preferences?.language === lang.value && styles.preferenceButtonTextActive
                  ]}>
                    {lang.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>Devise</ThemedText>
            <View style={styles.preferenceButtons}>
              {[
                { value: 'EUR', label: 'Euro ($)' },
                { value: 'USD', label: 'Dollar ($)' },
                { value: 'GBP', label: 'Livre (£)' }
              ].map((currency) => (
                <TouchableOpacity
                  key={currency.value}
                  style={[
                    styles.preferenceButton,
                    settings.preferences?.currency === currency.value && styles.preferenceButtonActive
                  ]}
                  onPress={() => handlePreferenceChange('currency', currency.value)}
                >
                  <ThemedText style={[
                    styles.preferenceButtonText,
                    settings.preferences?.currency === currency.value && styles.preferenceButtonTextActive
                  ]}>
                    {currency.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

      {/* Moyens de paiement */}
      <View style={styles.settingsCard}>
        <ThemedText style={styles.cardTitle}>Moyens de paiement</ThemedText>
        
        {paymentMethods.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>Aucun moyen de paiement</ThemedText>
            <ThemedText style={styles.emptySubtext}>Ajoutez une carte pour faciliter vos achats</ThemedText>
          </View>
        ) : (
          <View style={styles.paymentList}>
            {paymentMethods.map((payment) => (
              <View key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentInfo}>
                  <View style={styles.paymentIcon}>
                    <Ionicons name="card" size={20} color="#4CAF50" />
                  </View>
                  <View style={styles.paymentDetails}>
                    <ThemedText style={styles.paymentNumber}>
                      **** **** **** {payment.cardNumber.slice(-4)}
                    </ThemedText>
                    <ThemedText style={styles.paymentExpiry}>
                      Expire le {payment.expiryDate}
                    </ThemedText>
                    {payment.isDefault && (
                      <ThemedText style={styles.defaultBadge}>Par défaut</ThemedText>
                    )}
                  </View>
                </View>
                <TouchableOpacity style={styles.paymentDelete}>
                  <Ionicons name="trash" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addPaymentButton} onPress={handleAddPayment}>
          <Ionicons name="add" size={20} color="#4CAF50" />
          <ThemedText style={styles.addPaymentText}>Ajouter un moyen de paiement</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Zone de danger */}
      <View style={styles.dangerZone}>
        <ThemedText style={styles.dangerTitle}>Zone de danger</ThemedText>
        <ThemedText style={styles.dangerDescription}>
          Une fois votre compte supprimé, toutes vos données seront définitivement perdues. 
          Cette action est irréversible.
        </ThemedText>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => setShowDeleteModal(true)}
        >
          <Ionicons name="trash" size={20} color="#EF4444" />
          <ThemedText style={styles.deleteButtonText}>Supprimer mon compte</ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#EF4444" />
        <ThemedText style={styles.logoutText}>Déconnexion</ThemedText>
      </TouchableOpacity>
    </View>
  );
  };

  // Si l'utilisateur n'est pas connecté, afficher un message
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <UnifiedHeader />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.heroContainer}>
            <LinearGradient
              colors={['#EAF3EE', '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroBackground}
            />
            <View style={styles.heroContent}>
              <ThemedText style={styles.heroTitle}>Mon Compte</ThemedText>
              <ThemedText style={styles.heroSubtitle}>
                Connectez-vous pour accéder à vos informations
              </ThemedText>
            </View>
          </View>
          <View style={styles.section}>
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>Vous n'êtes pas connecté</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Veuillez vous connecter pour accéder à vos informations personnelles
              </ThemedText>
            </View>
          </View>
          <HomeFooter />
        </ScrollView>
        <CurvedBottomNav />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <UnifiedHeader />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={['#EAF3EE', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBackground}
          />
          <View style={styles.heroContent}>
            <ThemedText style={styles.heroTitle}>Mon Compte</ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Gérez vos informations et suivez vos commandes
            </ThemedText>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={refreshData}
            >
              <Ionicons name="refresh" size={16} color="#4CAF50" />
              <ThemedText style={styles.refreshButtonText}>Actualiser</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation par onglets */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && styles.activeTab
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons 
                  name={tab.icon as any} 
                  size={20} 
                  color={activeTab === tab.id ? '#4CAF50' : '#9CA3AF'} 
                />
                <ThemedText style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText
                ]}>
                  {tab.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Contenu des onglets */}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'addresses' && renderAddresses()}
        {activeTab === 'settings' && renderSettings()}
        
        <HomeFooter />
      </ScrollView>
      
      {/* Modal d'ajout de moyen de paiement */}
      {showPaymentModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Ajouter un moyen de paiement</ThemedText>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Numéro de carte *</ThemedText>
                <TextInput
                  style={styles.formInput}
                  value={paymentForm.cardNumber}
                  onChangeText={(text) => setPaymentForm(prev => ({ ...prev, cardNumber: text }))}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Nom du titulaire *</ThemedText>
                <TextInput
                  style={styles.formInput}
                  value={paymentForm.cardholderName}
                  onChangeText={(text) => setPaymentForm(prev => ({ ...prev, cardholderName: text }))}
                  placeholder="Jean Dupont"
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <ThemedText style={styles.formLabel}>Date d'expiration *</ThemedText>
                  <TextInput
                    style={styles.formInput}
                    value={paymentForm.expiryDate}
                    onChangeText={(text) => setPaymentForm(prev => ({ ...prev, expiryDate: text }))}
                    placeholder="MM/AA"
                  />
                </View>

                <View style={styles.formGroupHalf}>
                  <ThemedText style={styles.formLabel}>CVV *</ThemedText>
                  <TextInput
                    style={styles.formInput}
                    value={paymentForm.cvv}
                    onChangeText={(text) => setPaymentForm(prev => ({ ...prev, cvv: text }))}
                    placeholder="123"
                    keyboardType="numeric"
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setPaymentForm(prev => ({ ...prev, isDefault: !prev.isDefault }))}
                >
                  <View style={[styles.checkbox, paymentForm.isDefault && styles.checkboxChecked]}>
                    {paymentForm.isDefault && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                  <ThemedText style={styles.checkboxLabel}>Définir comme moyen de paiement par défaut</ThemedText>
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => setShowPaymentModal(false)}
                >
                  <ThemedText style={styles.modalCancelText}>Annuler</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalSaveButton}
                  onPress={handleSavePayment}
                >
                  <ThemedText style={styles.modalSaveText}>Ajouter</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Modal d'ajout d'adresse */}
      {showAddressModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Ajouter une adresse</ThemedText>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Rue *</ThemedText>
                <TextInput
                  style={styles.formInput}
                  value={addressForm.street}
                  onChangeText={(text) => setAddressForm(prev => ({ ...prev, street: text }))}
                  placeholder="Entrez votre rue"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Ville *</ThemedText>
                <TextInput
                  style={styles.formInput}
                  value={addressForm.city}
                  onChangeText={(text) => setAddressForm(prev => ({ ...prev, city: text }))}
                  placeholder="Entrez votre ville"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>État/Région</ThemedText>
                <TextInput
                  style={styles.formInput}
                  value={addressForm.state}
                  onChangeText={(text) => setAddressForm(prev => ({ ...prev, state: text }))}
                  placeholder="Entrez votre état/région"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Code postal *</ThemedText>
                <TextInput
                  style={styles.formInput}
                  value={addressForm.zipCode}
                  onChangeText={(text) => setAddressForm(prev => ({ ...prev, zipCode: text }))}
                  placeholder="Entrez votre code postal"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Pays *</ThemedText>
                <TextInput
                  style={styles.formInput}
                  value={addressForm.country}
                  onChangeText={(text) => setAddressForm(prev => ({ ...prev, country: text }))}
                  placeholder="Entrez votre pays"
                />
              </View>

              <View style={styles.formGroup}>
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setAddressForm(prev => ({ ...prev, isDefault: !prev.isDefault }))}
                >
                  <View style={[styles.checkbox, addressForm.isDefault && styles.checkboxChecked]}>
                    {addressForm.isDefault && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                  <ThemedText style={styles.checkboxLabel}>Définir comme adresse par défaut</ThemedText>
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => setShowAddressModal(false)}
                >
                  <ThemedText style={styles.modalCancelText}>Annuler</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalSaveButton}
                  onPress={handleSaveAddress}
                >
                  <ThemedText style={styles.modalSaveText}>Sauvegarder</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Confirmer la suppression</ThemedText>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <ThemedText style={styles.modalDescription}>
                Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
              </ThemedText>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <ThemedText style={styles.modalCancelText}>Annuler</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalDeleteButton}
                  onPress={handleDeleteAccount}
                >
                  <ThemedText style={styles.modalDeleteText}>Supprimer</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
      
      <CurvedBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingBottom: 100, // Espace pour la barre de navigation courbée
  },
  scrollView: {
    flex: 1,
    marginTop: -8, // Réduire l'espace entre header et contenu
    paddingBottom: 140, // Espace suffisant pour la barre de navigation courbée
  },
  // Hero Section
  heroContainer: {
    height: 180,
    position: 'relative',
    marginBottom: 10,
    overflow: 'hidden',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#424242',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Navigation par onglets
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
    paddingTop: -10,
    paddingBottom: 1,
  },
  tabsScroll: {
    flexDirection: 'row',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 13,
    marginRight: 17,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 44,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 40,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 20,
  },
  // Informations personnelles
  avatarCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: '#4CAF50',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#424242',
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Commandes
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  ordersList: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  orderDate: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  // Adresses
  addressesList: {
    gap: 16,
    marginBottom: 24,
  },
  addressCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addressText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  // Paramètres
  settingsList: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#424242',
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  // Paramètres avancés
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  // Toggles
  toggle: {
    width: 48,
    height: 28,
    backgroundColor: '#E5E7EB',
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  // Préférences
  preferenceButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  preferenceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  preferenceButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  preferenceButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  preferenceButtonTextActive: {
    color: '#FFFFFF',
  },
  // Moyens de paiement
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 2,
  },
  paymentExpiry: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  paymentDelete: {
    padding: 8,
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  addPaymentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  // Zone de danger
  dangerZone: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#7F1D1D',
    lineHeight: 20,
    marginBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 16,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  // Modal de suppression
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
  },
  modalBody: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#424242',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // États de chargement et vides
  loadingContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  emptyContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  // Bouton de rafraîchissement
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 6,
  },
  // Styles pour le formulaire d'adresse
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#424242',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Styles pour les moyens de paiement
  paymentList: {
    marginBottom: 16,
  },
  defaultBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 4,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formGroupHalf: {
    flex: 1,
    marginRight: 8,
  },
  // Styles pour le bouton découvrir
  emptyIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  discoverButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
