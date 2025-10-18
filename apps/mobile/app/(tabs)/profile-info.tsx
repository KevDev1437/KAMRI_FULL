import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import HomeFooter from '../../components/HomeFooter';
import UnifiedHeader from '../../components/UnifiedHeader';
import { ThemedText } from '../../components/themed-text';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient, User } from '../../lib/api';

export default function ProfileInfoScreen() {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(true);

  // Charger les données du profil
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        console.log('👤 [PROFILE-INFO] Chargement du profil utilisateur depuis API');
        setLoading(true);
        
        // TOUJOURS charger depuis l'API pour avoir les données les plus récentes
        const response = await apiClient.getUserProfile();
        if (response.data) {
          // Extraire les vraies données utilisateur (elles sont dans response.data.data)
          const userData = response.data.data || response.data;
          console.log('👤 [PROFILE-INFO] Données utilisateur extraites depuis API:', userData);
          
          setUserInfo(userData);
          setEditedInfo({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email,
            phone: userData.phone || '',
            address: userData.address || '',
          });
          console.log('👤 [PROFILE-INFO] Profil chargé depuis API:', userData);
        }
      } catch (error) {
        console.error('❌ [PROFILE-INFO] Erreur lors du chargement du profil:', error);
        Alert.alert('Erreur', 'Impossible de charger vos informations');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user]); // Se déclenche quand l'utilisateur change (connexion/déconnexion)

  const handleSave = async () => {
    try {
      console.log('💾 [PROFILE-INFO] === DÉBUT DE LA SAUVEGARDE ===');
      console.log('💾 [PROFILE-INFO] Données à sauvegarder:', editedInfo);
      console.log('💾 [PROFILE-INFO] Type de editedInfo:', typeof editedInfo);
      console.log('💾 [PROFILE-INFO] Clés disponibles:', Object.keys(editedInfo));
      console.log('💾 [PROFILE-INFO] Valeurs:', {
        firstName: editedInfo.firstName,
        lastName: editedInfo.lastName,
        email: editedInfo.email,
        phone: editedInfo.phone
      });
      
      console.log('💾 [PROFILE-INFO] Appel de l\'API updateUserProfile...');
      const response = await apiClient.updateUserProfile(editedInfo);
      
      console.log('💾 [PROFILE-INFO] Réponse reçue:', response);
      console.log('💾 [PROFILE-INFO] response.data:', response.data);
      console.log('💾 [PROFILE-INFO] response.error:', response.error);
      
      if (response.data) {
        console.log('✅ [PROFILE-INFO] Profil mis à jour avec succès:', response.data);
        
        // Extraire les vraies données utilisateur (elles sont dans response.data.data)
        const userData = response.data.data || response.data;
        console.log('✅ [PROFILE-INFO] Données utilisateur extraites:', userData);
        
        setUserInfo(userData);
        setIsEditing(false);
        Alert.alert('Succès', 'Vos informations ont été mises à jour');
        console.log('✅ [PROFILE-INFO] État mis à jour, mode édition fermé');
      } else {
        console.error('❌ [PROFILE-INFO] Échec de la mise à jour:', response.error);
        Alert.alert('Erreur', 'Impossible de sauvegarder vos modifications');
      }
    } catch (error) {
      console.error('❌ [PROFILE-INFO] Erreur lors de la sauvegarde:', error);
      console.error('❌ [PROFILE-INFO] Stack trace:', error.stack);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      console.log('💾 [PROFILE-INFO] === FIN DE LA SAUVEGARDE ===');
    }
  };

  const handleCancel = () => {
    if (userInfo) {
      console.log('🔄 [PROFILE-INFO] Annulation - restauration des données originales:', userInfo);
      setEditedInfo({
        firstName: userInfo.firstName || '',
        lastName: userInfo.lastName || '',
        email: userInfo.email,
        phone: userInfo.phone || '',
        address: userInfo.address || '',
      });
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const renderPersonalInfo = () => {
    if (!userInfo) {
      return (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Informations personnelles</ThemedText>
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>Chargement...</ThemedText>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Informations personnelles</ThemedText>
        
        {/* Avatar et infos principales */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {(userInfo.firstName?.[0] || 'U')}{(userInfo.lastName?.[0] || 'K')}
              </ThemedText>
            </View>
          </View>
          <View style={styles.userInfo}>
            <ThemedText style={styles.userName}>
              {userInfo.firstName || 'Utilisateur'} {userInfo.lastName || 'KAMRI'}
            </ThemedText>
            <ThemedText style={styles.userEmail}>{userInfo.email}</ThemedText>
            <ThemedText style={styles.memberSince}>
              Membre depuis le {new Date(userInfo.createdAt).toLocaleDateString('fr-FR')}
            </ThemedText>
          </View>
        </View>

      {/* Détails des informations */}
      <View style={styles.infoCard}>
        <View style={styles.infoItem}>
          <Ionicons name="person" size={20} color="#4CAF50" />
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoLabel}>Prénom</ThemedText>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={editedInfo.firstName}
                onChangeText={(text) => setEditedInfo({ ...editedInfo, firstName: text })}
              />
            ) : (
              <ThemedText style={styles.infoValue}>{userInfo.firstName || 'Non renseigné'}</ThemedText>
            )}
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="person" size={20} color="#4CAF50" />
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoLabel}>Nom</ThemedText>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={editedInfo.lastName}
                onChangeText={(text) => setEditedInfo({ ...editedInfo, lastName: text })}
              />
            ) : (
              <ThemedText style={styles.infoValue}>{userInfo.lastName || 'Non renseigné'}</ThemedText>
            )}
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="mail" size={20} color="#4CAF50" />
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoLabel}>Email</ThemedText>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={editedInfo.email}
                onChangeText={(text) => setEditedInfo({ ...editedInfo, email: text })}
                keyboardType="email-address"
              />
            ) : (
              <ThemedText style={styles.infoValue}>{userInfo.email}</ThemedText>
            )}
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="call" size={20} color="#4CAF50" />
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoLabel}>Téléphone</ThemedText>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={editedInfo.phone}
                onChangeText={(text) => setEditedInfo({ ...editedInfo, phone: text })}
                keyboardType="phone-pad"
              />
            ) : (
              <ThemedText style={styles.infoValue}>{userInfo.phone || 'Non renseigné'}</ThemedText>
            )}
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="location" size={20} color="#4CAF50" />
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoLabel}>Adresse</ThemedText>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={editedInfo.address || ''}
                onChangeText={(text) => setEditedInfo({ ...editedInfo, address: text })}
                placeholder="Votre adresse complète"
                multiline
                numberOfLines={2}
              />
            ) : (
              <ThemedText style={styles.infoValue}>{userInfo.address || 'Non renseigné'}</ThemedText>
            )}
          </View>
        </View>

      </View>

      {/* Boutons d'action */}
      <View style={styles.actionButtons}>
        {isEditing ? (
          <View style={styles.editButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <ThemedText style={styles.cancelButtonText}>Annuler</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <ThemedText style={styles.saveButtonText}>Enregistrer</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={20} color="#4CAF50" />
            <ThemedText style={styles.editButtonText}>Modifier mes informations</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <UnifiedHeader />
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Chargement de vos informations...</ThemedText>
        </View>
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
            <ThemedText style={styles.heroTitle}>Mes informations de Profil</ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Gérez vos informations personnelles
            </ThemedText>
          </View>
        </View>

        {/* Contenu principal */}
        {renderPersonalInfo()}
        
        <HomeFooter />
      </ScrollView>
      
      <CurvedBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingBottom: 100,
  },
  scrollView: {
    flex: 1,
    marginTop: 90,
    paddingBottom: 140,
  },
  // Hero Section
  heroContainer: {
    height: 160,
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
    fontSize: 22,
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
  infoInput: {
    fontSize: 16,
    color: '#424242',
    borderBottomWidth: 1,
    borderBottomColor: '#4CAF50',
    paddingVertical: 4,
  },
  actionButtons: {
    marginTop: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
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
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 12,
    fontWeight: '500',
  },
});