import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import HomeFooter from '../../components/HomeFooter';
import HomeHeader from '../../components/HomeHeader';
import { ThemedText } from '../../components/themed-text';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('personal');
  const [userInfo] = useState({
    name: 'Ulrich Kevin',
    email: 'ulrich.kevin@email.com',
    phone: '+33 6 12 34 56 78',
    memberSince: '15 Janvier 2024'
  });

  const [orders] = useState([
    {
      id: 'CMD-2024-001',
      date: '15 Jan 2024',
      total: 89.99,
      status: 'Livrée',
      statusColor: '#4CAF50'
    },
    {
      id: 'CMD-2024-002',
      date: '10 Jan 2024',
      total: 156.50,
      status: 'En cours',
      statusColor: '#2196F3'
    },
    {
      id: 'CMD-2024-003',
      date: '5 Jan 2024',
      total: 45.00,
      status: 'Expédiée',
      statusColor: '#FF9800'
    }
  ]);

  const [addresses] = useState([
    {
      id: 1,
      name: 'Domicile',
      address: '123 Rue de la Paix, 75001 Paris',
      isDefault: true
    },
    {
      id: 2,
      name: 'Bureau',
      address: '456 Avenue des Champs-Élysées, 75008 Paris',
      isDefault: false
    }
  ]);

  const tabs = [
    { id: 'personal', label: 'Infos', icon: 'person' },
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
        { text: 'Déconnexion', style: 'destructive', onPress: () => console.log('Déconnexion') }
      ]
    );
  };

  const renderPersonalInfo = () => (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Informations personnelles</ThemedText>
      
      {/* Avatar et infos principales */}
      <View style={styles.avatarCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {userInfo.name.split(' ').map(n => n[0]).join('')}
            </ThemedText>
          </View>
        </View>
        <View style={styles.userInfo}>
          <ThemedText style={styles.userName}>{userInfo.name}</ThemedText>
          <ThemedText style={styles.userEmail}>{userInfo.email}</ThemedText>
          <ThemedText style={styles.memberSince}>Membre depuis le {userInfo.memberSince}</ThemedText>
        </View>
      </View>

      {/* Détails des informations */}
      <View style={styles.infoCard}>
        <View style={styles.infoItem}>
          <Ionicons name="person" size={20} color="#4CAF50" />
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoLabel}>Nom complet</ThemedText>
            <ThemedText style={styles.infoValue}>{userInfo.name}</ThemedText>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="mail" size={20} color="#4CAF50" />
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoLabel}>Email</ThemedText>
            <ThemedText style={styles.infoValue}>{userInfo.email}</ThemedText>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="call" size={20} color="#4CAF50" />
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoLabel}>Téléphone</ThemedText>
            <ThemedText style={styles.infoValue}>{userInfo.phone}</ThemedText>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.editButton}>
        <ThemedText style={styles.editButtonText}>Modifier mes informations</ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderOrders = () => (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Mes commandes</ThemedText>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statNumber}>{orders.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Total</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statNumber}>
            {orders.filter(o => o.status === 'Livrée').length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Livrées</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statNumber}>
            {orders.filter(o => o.status === 'En cours').length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>En cours</ThemedText>
        </View>
      </View>

      <View style={styles.ordersList}>
        {orders.map((order, index) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <ThemedText style={styles.orderId}>{order.id}</ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: order.statusColor }]}>
                <ThemedText style={styles.statusText}>{order.status}</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.orderDate}>{order.date}</ThemedText>
            <ThemedText style={styles.orderTotal}>{order.total.toFixed(2)}€</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );

  const renderAddresses = () => (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Mes adresses</ThemedText>
      
      <View style={styles.addressesList}>
        {addresses.map((address) => (
          <View key={address.id} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <View style={styles.addressIcon}>
                <Ionicons name="home" size={20} color="#4CAF50" />
              </View>
              <View style={styles.addressInfo}>
                <ThemedText style={styles.addressName}>{address.name}</ThemedText>
                {address.isDefault && (
                  <View style={styles.defaultBadge}>
                    <ThemedText style={styles.defaultText}>Par défaut</ThemedText>
                  </View>
                )}
              </View>
            </View>
            <ThemedText style={styles.addressText}>{address.address}</ThemedText>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={20} color="#4CAF50" />
        <ThemedText style={styles.addButtonText}>Ajouter une adresse</ThemedText>
      </TouchableOpacity>
    </View>
  );

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false
    },
    privacy: {
      profileVisible: true,
      orderHistory: false,
      dataSharing: false
    },
    preferences: {
      theme: 'light',
      language: 'fr',
      currency: 'EUR'
    }
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleNotificationChange = (type: keyof typeof settings.notifications) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handlePrivacyChange = (type: keyof typeof settings.privacy) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: !prev.privacy[type]
      }
    }));
  };

  const handlePreferenceChange = (type: keyof typeof settings.preferences, value: any) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [type]: value
      }
    }));
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

  const renderSettings = () => (
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
            style={[styles.toggle, settings.notifications.email && styles.toggleActive]}
            onPress={() => handleNotificationChange('email')}
          >
            <View style={[styles.toggleThumb, settings.notifications.email && styles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <ThemedText style={styles.settingLabel}>Notifications par SMS</ThemedText>
            <ThemedText style={styles.settingDescription}>Recevez des alertes par SMS</ThemedText>
          </View>
          <TouchableOpacity 
            style={[styles.toggle, settings.notifications.sms && styles.toggleActive]}
            onPress={() => handleNotificationChange('sms')}
          >
            <View style={[styles.toggleThumb, settings.notifications.sms && styles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <ThemedText style={styles.settingLabel}>Notifications push</ThemedText>
            <ThemedText style={styles.settingDescription}>Recevez des notifications sur votre appareil</ThemedText>
          </View>
          <TouchableOpacity 
            style={[styles.toggle, settings.notifications.push && styles.toggleActive]}
            onPress={() => handleNotificationChange('push')}
          >
            <View style={[styles.toggleThumb, settings.notifications.push && styles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <ThemedText style={styles.settingLabel}>Emails marketing</ThemedText>
            <ThemedText style={styles.settingDescription}>Recevez nos offres et nouveautés</ThemedText>
          </View>
          <TouchableOpacity 
            style={[styles.toggle, settings.notifications.marketing && styles.toggleActive]}
            onPress={() => handleNotificationChange('marketing')}
          >
            <View style={[styles.toggleThumb, settings.notifications.marketing && styles.toggleThumbActive]} />
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
            style={[styles.toggle, settings.privacy.profileVisible && styles.toggleActive]}
            onPress={() => handlePrivacyChange('profileVisible')}
          >
            <View style={[styles.toggleThumb, settings.privacy.profileVisible && styles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <ThemedText style={styles.settingLabel}>Historique des commandes visible</ThemedText>
            <ThemedText style={styles.settingDescription}>Permettre l&apos;affichage de votre historique</ThemedText>
          </View>
          <TouchableOpacity 
            style={[styles.toggle, settings.privacy.orderHistory && styles.toggleActive]}
            onPress={() => handlePrivacyChange('orderHistory')}
          >
            <View style={[styles.toggleThumb, settings.privacy.orderHistory && styles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <ThemedText style={styles.settingLabel}>Partage de données</ThemedText>
            <ThemedText style={styles.settingDescription}>Partager vos données avec nos partenaires de confiance</ThemedText>
          </View>
          <TouchableOpacity 
            style={[styles.toggle, settings.privacy.dataSharing && styles.toggleActive]}
            onPress={() => handlePrivacyChange('dataSharing')}
          >
            <View style={[styles.toggleThumb, settings.privacy.dataSharing && styles.toggleThumbActive]} />
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
                  settings.preferences.theme === theme && styles.preferenceButtonActive
                ]}
                onPress={() => handlePreferenceChange('theme', theme)}
              >
                <ThemedText style={[
                  styles.preferenceButtonText,
                  settings.preferences.theme === theme && styles.preferenceButtonTextActive
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
                  settings.preferences.language === lang.value && styles.preferenceButtonActive
                ]}
                onPress={() => handlePreferenceChange('language', lang.value)}
              >
                <ThemedText style={[
                  styles.preferenceButtonText,
                  settings.preferences.language === lang.value && styles.preferenceButtonTextActive
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
              { value: 'EUR', label: 'Euro (€)' },
              { value: 'USD', label: 'Dollar ($)' },
              { value: 'GBP', label: 'Livre (£)' }
            ].map((currency) => (
              <TouchableOpacity
                key={currency.value}
                style={[
                  styles.preferenceButton,
                  settings.preferences.currency === currency.value && styles.preferenceButtonActive
                ]}
                onPress={() => handlePreferenceChange('currency', currency.value)}
              >
                <ThemedText style={[
                  styles.preferenceButtonText,
                  settings.preferences.currency === currency.value && styles.preferenceButtonTextActive
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
        
        <View style={styles.paymentCard}>
          <View style={styles.paymentInfo}>
            <View style={styles.paymentIcon}>
              <Ionicons name="card" size={20} color="#4CAF50" />
            </View>
            <View style={styles.paymentDetails}>
              <ThemedText style={styles.paymentNumber}>**** **** **** 1234</ThemedText>
              <ThemedText style={styles.paymentExpiry}>Expire le 12/25</ThemedText>
            </View>
          </View>
          <TouchableOpacity style={styles.paymentDelete}>
            <Ionicons name="trash" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addPaymentButton}>
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

  return (
    <View style={styles.container}>
      <HomeHeader />
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
            <ThemedText style={styles.heroTitle}>Mon profil</ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Gérez vos informations et suivez vos commandes
            </ThemedText>
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
        {activeTab === 'personal' && renderPersonalInfo()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'addresses' && renderAddresses()}
        {activeTab === 'settings' && renderSettings()}
        
        <HomeFooter />
      </ScrollView>
      
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
    marginTop: 90, // Espace pour le header
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
});
