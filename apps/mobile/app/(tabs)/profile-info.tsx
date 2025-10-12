import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import HomeFooter from '../../components/HomeFooter';
import ProfileInfoHeader from '../../components/ProfileInfoHeader';
import { ThemedText } from '../../components/themed-text';

export default function ProfileInfoScreen() {
  const [userInfo, setUserInfo] = useState({
    firstName: 'Ulrich',
    lastName: 'Kevin',
    email: 'ulrich.kevin@email.com',
    phone: '+33 6 12 34 56 78',
    birthDate: '15 Janvier 1990',
    address: '123 Rue de la Paix, 75001 Paris',
    memberSince: '15 Janvier 2024'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState(userInfo);

  const handleSave = () => {
    setUserInfo(editedInfo);
    setIsEditing(false);
    Alert.alert('Succès', 'Vos informations ont été mises à jour');
  };

  const handleCancel = () => {
    setEditedInfo(userInfo);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const renderPersonalInfo = () => (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Informations personnelles</ThemedText>
      
      {/* Avatar et infos principales */}
      <View style={styles.avatarCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {userInfo.firstName[0]}{userInfo.lastName[0]}
            </ThemedText>
          </View>
        </View>
        <View style={styles.userInfo}>
          <ThemedText style={styles.userName}>{userInfo.firstName} {userInfo.lastName}</ThemedText>
          <ThemedText style={styles.userEmail}>{userInfo.email}</ThemedText>
          <ThemedText style={styles.memberSince}>Membre depuis le {userInfo.memberSince}</ThemedText>
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
              <ThemedText style={styles.infoValue}>{userInfo.firstName}</ThemedText>
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
              <ThemedText style={styles.infoValue}>{userInfo.lastName}</ThemedText>
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
              <ThemedText style={styles.infoValue}>{userInfo.phone}</ThemedText>
            )}
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="calendar" size={20} color="#4CAF50" />
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoLabel}>Date de naissance</ThemedText>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={editedInfo.birthDate}
                onChangeText={(text) => setEditedInfo({ ...editedInfo, birthDate: text })}
                placeholder="DD/MM/YYYY"
              />
            ) : (
              <ThemedText style={styles.infoValue}>{userInfo.birthDate}</ThemedText>
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
                value={editedInfo.address}
                onChangeText={(text) => setEditedInfo({ ...editedInfo, address: text })}
                multiline
              />
            ) : (
              <ThemedText style={styles.infoValue}>{userInfo.address}</ThemedText>
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

  return (
    <View style={styles.container}>
      <ProfileInfoHeader />
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
});
