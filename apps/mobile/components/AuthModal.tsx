import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
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
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  onRegisterSuccess?: () => void;
}

interface PasswordStrength {
  score: number;
  text: string;
  color: string;
}

export default function AuthModal({ visible, onClose, onLoginSuccess, onRegisterSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { width } = Dimensions.get('window');

  // Validation du mot de passe
  const validatePassword = (password: string): PasswordStrength => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score <= 2) return { score, text: 'Faible', color: '#EF4444' };
    if (score <= 3) return { score, text: 'Moyen', color: '#F59E0B' };
    return { score, text: 'Fort', color: '#10B981' };
  };

  const passwordStrength = validatePassword(registerData.password);
  const isPasswordValid = passwordStrength.score >= 4;
  const isFormValid = registerData.firstName && 
                     registerData.lastName && 
                     registerData.email && 
                     isPasswordValid && 
                     registerData.password === registerData.confirmPassword;

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    try {
      // Simulation d'authentification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock de validation - Utilisateur de test
      if (loginData.email === 'test@test.com' && loginData.password === 'password123') {
        onLoginSuccess?.();
        onClose();
      } else {
        Alert.alert('Erreur', 'Email ou mot de passe incorrect\n\nUtilisateur de test :\nEmail: test@test.com\nMot de passe: password123');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isFormValid) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs correctement');
      return;
    }

    setIsLoading(true);
    try {
      // Simulation d'inscription
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onRegisterSuccess?.();
      onClose();
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création du compte');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Email</ThemedText>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="votre@email.com"
            placeholderTextColor="#9CA3AF"
            value={loginData.email}
            onChangeText={(text) => setLoginData({ ...loginData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Mot de passe</ThemedText>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Votre mot de passe"
            placeholderTextColor="#9CA3AF"
            value={loginData.password}
            onChangeText={(text) => setLoginData({ ...loginData, password: text })}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.forgotPassword}>
        <ThemedText style={styles.forgotPasswordText}>Mot de passe oublié ?</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#4CAF50', '#45A049']}
          style={styles.submitButtonGradient}
        >
          <ThemedText style={styles.submitButtonText}>
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </ThemedText>
        </LinearGradient>
      </TouchableOpacity>

      {/* Bouton de test rapide */}
      <TouchableOpacity 
        style={styles.testButton}
        onPress={() => {
          setLoginData({ email: 'test@test.com', password: 'password123' });
        }}
      >
        <ThemedText style={styles.testButtonText}>
          🧪 Remplir avec les données de test
        </ThemedText>
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

  const renderRegisterForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.nameRow}>
        <View style={[styles.inputGroup, styles.halfInput]}>
          <ThemedText style={styles.inputLabel}>Prénom</ThemedText>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Prénom"
              placeholderTextColor="#9CA3AF"
              value={registerData.firstName}
              onChangeText={(text) => setRegisterData({ ...registerData, firstName: text })}
            />
          </View>
        </View>

        <View style={[styles.inputGroup, styles.halfInput]}>
          <ThemedText style={styles.inputLabel}>Nom</ThemedText>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Nom"
              placeholderTextColor="#9CA3AF"
              value={registerData.lastName}
              onChangeText={(text) => setRegisterData({ ...registerData, lastName: text })}
            />
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Email</ThemedText>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="votre@email.com"
            placeholderTextColor="#9CA3AF"
            value={registerData.email}
            onChangeText={(text) => setRegisterData({ ...registerData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Mot de passe</ThemedText>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Votre mot de passe"
            placeholderTextColor="#9CA3AF"
            value={registerData.password}
            onChangeText={(text) => setRegisterData({ ...registerData, password: text })}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>
        </View>
        
        {/* Indicateur de force du mot de passe */}
        {registerData.password.length > 0 && (
          <View style={styles.passwordStrengthContainer}>
            <View style={styles.passwordStrengthBar}>
              <View 
                style={[
                  styles.passwordStrengthFill, 
                  { 
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    backgroundColor: passwordStrength.color 
                  }
                ]} 
              />
            </View>
            <View style={styles.passwordStrengthInfo}>
              <ThemedText style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                {passwordStrength.text}
              </ThemedText>
              {isPasswordValid && (
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              )}
            </View>
          </View>
        )}

        {/* Critères de validation */}
        <View style={styles.passwordCriteria}>
          <View style={styles.criteriaRow}>
            <View style={styles.criteriaItem}>
              <Ionicons 
                name={registerData.password.length >= 8 ? "checkmark" : "close"} 
                size={12} 
                color={registerData.password.length >= 8 ? "#10B981" : "#EF4444"} 
              />
              <ThemedText style={styles.criteriaText}>Au moins 8 caractères</ThemedText>
            </View>
            <View style={styles.criteriaItem}>
              <Ionicons 
                name={/[A-Z]/.test(registerData.password) ? "checkmark" : "close"} 
                size={12} 
                color={/[A-Z]/.test(registerData.password) ? "#10B981" : "#EF4444"} 
              />
              <ThemedText style={styles.criteriaText}>Une majuscule</ThemedText>
            </View>
          </View>
          <View style={styles.criteriaRow}>
            <View style={styles.criteriaItem}>
              <Ionicons 
                name={/\d/.test(registerData.password) ? "checkmark" : "close"} 
                size={12} 
                color={/\d/.test(registerData.password) ? "#10B981" : "#EF4444"} 
              />
              <ThemedText style={styles.criteriaText}>Un chiffre</ThemedText>
            </View>
            <View style={styles.criteriaItem}>
              <Ionicons 
                name={/[!@#$%^&*(),.?":{}|<>]/.test(registerData.password) ? "checkmark" : "close"} 
                size={12} 
                color={/[!@#$%^&*(),.?":{}|<>]/.test(registerData.password) ? "#10B981" : "#EF4444"} 
              />
              <ThemedText style={styles.criteriaText}>Un caractère spécial</ThemedText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Confirmer le mot de passe</ThemedText>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Confirmez votre mot de passe"
            placeholderTextColor="#9CA3AF"
            value={registerData.confirmPassword}
            onChangeText={(text) => setRegisterData({ ...registerData, confirmPassword: text })}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons 
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>
        </View>
        
        {/* Validation de confirmation */}
        {registerData.confirmPassword.length > 0 && (
          <View style={styles.confirmPasswordContainer}>
            <Ionicons 
              name={registerData.password === registerData.confirmPassword ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={registerData.password === registerData.confirmPassword ? "#10B981" : "#EF4444"} 
            />
            <ThemedText style={[
              styles.confirmPasswordText,
              { color: registerData.password === registerData.confirmPassword ? "#10B981" : "#EF4444" }
            ]}>
              {registerData.password === registerData.confirmPassword ? 'Mots de passe identiques' : 'Mots de passe différents'}
            </ThemedText>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, (!isFormValid || isLoading) && styles.submitButtonDisabled]}
        onPress={handleRegister}
        disabled={!isFormValid || isLoading}
      >
        <LinearGradient
          colors={['#4CAF50', '#45A049']}
          style={styles.submitButtonGradient}
        >
          <ThemedText style={styles.submitButtonText}>
            {isLoading ? 'Création...' : 'Créer mon compte'}
          </ThemedText>
        </LinearGradient>
      </TouchableOpacity>
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
              {activeTab === 'login' ? 'Connexion' : 'Inscription'}
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

          {/* Onglets */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'login' && styles.activeTab]}
              onPress={() => setActiveTab('login')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                Connexion
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'register' && styles.activeTab]}
              onPress={() => setActiveTab('register')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
                Inscription
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Contenu du formulaire */}
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {activeTab === 'login' ? renderLoginForm() : renderRegisterForm()}
          </ScrollView>

          {/* Lien de basculement */}
          <View style={styles.switchContainer}>
            <ThemedText style={styles.switchText}>
              {activeTab === 'login' ? "Vous n'avez pas de compte ?" : 'Vous avez déjà un compte ?'}
            </ThemedText>
            <TouchableOpacity onPress={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}>
              <ThemedText style={styles.switchLink}>
                {activeTab === 'login' ? 'Créer un compte' : 'Se connecter'}
              </ThemedText>
            </TouchableOpacity>
          </View>
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
  testButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  testButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});
