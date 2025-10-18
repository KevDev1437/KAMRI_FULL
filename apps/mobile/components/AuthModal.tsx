import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

interface PasswordStrength {
  score: number;
  text: string;
  color: string;
}

export default function AuthModal({ visible, onClose, onLoginSuccess }: AuthModalProps) {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Nettoyer les données au montage du composant
  React.useEffect(() => {
    if (visible) {
      console.log('🧹 [AUTH-MODAL] Nettoyage des données de connexion');
      setLoginData({ email: '', password: '' });
      setIsLoading(false);
    }
  }, [visible]);


  const handleLogin = async () => {
    if (!loginData.email) {
      Alert.alert('Erreur', 'Veuillez entrer votre email');
      return;
    }

    if (isLoading) {
      console.log('⏳ [AUTH-MODAL] Connexion déjà en cours, ignorer le clic');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 [AUTH-MODAL] Tentative de connexion avec:', loginData.email);
      console.log('🔐 [AUTH-MODAL] Type de email:', typeof loginData.email);
      console.log('🔐 [AUTH-MODAL] Email complet:', JSON.stringify(loginData.email));
      
      // Utiliser l'API réelle pour la connexion
      const success = await login(loginData.email);
      
      if (success) {
        console.log('✅ [AUTH-MODAL] Connexion réussie');
        Alert.alert('Succès', 'Connexion réussie !');
        onClose();
        onLoginSuccess?.();
      } else {
        console.log('❌ [AUTH-MODAL] Échec de la connexion');
        Alert.alert('Erreur', 'Impossible de se connecter. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('❌ [AUTH-MODAL] Erreur lors de la connexion:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };


  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      {/* Avantages KAMRI */}
      <View style={styles.benefitsContainer}>
        <View style={styles.benefitItem}>
          <Ionicons name="car-outline" size={16} color="#4CAF50" />
          <ThemedText style={styles.benefitText}>Livraison gratuite</ThemedText>
        </View>
        <View style={styles.benefitItem}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#2196F3" />
          <ThemedText style={styles.benefitText}>Qualité garantie</ThemedText>
        </View>
      </View>

      {/* Sécurité */}
      <View style={styles.securityContainer}>
        <Ionicons name="lock-closed-outline" size={16} color="#4CAF50" />
        <ThemedText style={styles.securityText}>Données protégées</ThemedText>
      </View>

      {/* Email simple */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>E-mail ou numéro de téléphone</ThemedText>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="votre@email.com ou +33 6 12 34 56 78"
            placeholderTextColor="#9CA3AF"
            value={loginData.email}
            onChangeText={(text) => setLoginData({ ...loginData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Bouton Continuer */}
      <TouchableOpacity 
        style={[styles.submitButton, (isLoading || !loginData.email) && styles.submitButtonDisabled]}
        onPress={handleLogin}
        disabled={isLoading || !loginData.email}
      >
        <LinearGradient
          colors={['#4CAF50', '#45A049']}
          style={styles.submitButtonGradient}
        >
          <ThemedText style={styles.submitButtonText}>
            {isLoading ? 'Connexion...' : 'Continuer'}
          </ThemedText>
        </LinearGradient>
      </TouchableOpacity>


      {/* Connexion sociale */}
      <View style={styles.socialContainer}>
        <ThemedText style={styles.socialText}>Ou continuer avec</ThemedText>
        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-google" size={24} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-apple" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );


  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ThemedView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>
              Se connecter
            </ThemedText>
            <View style={styles.placeholder} />
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoImageContainer}>
              <Image
                source={require('../assets/images/logo2.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <ThemedText style={styles.logoText}>KAMRI</ThemedText>
          </View>


          {/* Contenu du formulaire */}
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {renderLoginForm()}
          </ScrollView>
          </ThemedView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
  },
  placeholder: {
    width: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  logoImage: {
    width: 35,
    height: 35,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 7,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#4CAF50',
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  formContainer: {
    gap: 16,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputGroup: {
    gap: 6,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#424242',
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  socialContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  socialText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  passwordStrengthContainer: {
    marginTop: 8,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  passwordCriteria: {
    marginTop: 6,
    gap: 6,
  },
  criteriaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  criteriaText: {
    fontSize: 10,
    color: '#6B7280',
    flexShrink: 1,
  },
  confirmPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  confirmPasswordText: {
    fontSize: 11,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 6,
  },
  switchText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  switchLink: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  benefitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    flex: 1,
    gap: 4,
  },
  benefitText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  securityText: {
    fontSize: 11,
    color: '#6B7280',
  },
});
