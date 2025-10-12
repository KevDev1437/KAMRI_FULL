import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import ContactPageHeader from '../../components/ContactPageHeader';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import HomeFooter from '../../components/HomeFooter';
import { ThemedText } from '../../components/themed-text';

export default function ContactScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const subjects = [
    'Question générale',
    'Problème avec ma commande',
    'Retour de produit',
    'Suggestion d\'amélioration',
    'Partenariat',
    'Autre'
  ];

  const faqs = [
    {
      question: 'Où est ma commande ?',
      answer: 'Vous pouvez suivre votre commande en temps réel depuis votre espace client. Nous vous envoyons également des notifications par email à chaque étape de l\'expédition.'
    },
    {
      question: 'Comment retourner un produit ?',
      answer: 'Le retour est simple et gratuit ! Connectez-vous à votre compte, sélectionnez la commande concernée et cliquez sur "Retourner". Nous vous enverrons une étiquette de retour prépayée.'
    },
    {
      question: 'Quels sont les délais de livraison ?',
      answer: 'La livraison standard est de 2-3 jours ouvrés en France métropolitaine. Pour les livraisons express, comptez 24h. Les livraisons à l\'étranger prennent 5-7 jours ouvrés.'
    },
    {
      question: 'Quels modes de paiement acceptez-vous ?',
      answer: 'Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay et les virements bancaires. Tous les paiements sont sécurisés.'
    }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (!formData.subject) {
      newErrors.subject = 'Le sujet est requis';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Le message est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Simulation d'envoi de formulaire
      console.log('Données du formulaire:', formData);
      Alert.alert(
        'Message envoyé !',
        'Votre message a été envoyé avec succès. Nous vous répondrons dans les 24h.',
        [{ text: 'OK' }]
      );
      
      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectSubject = (subject: string) => {
    setFormData(prev => ({ ...prev, subject }));
    setShowSubjectModal(false);
  };

  return (
    <View style={styles.container}>
      <ContactPageHeader />
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
            <ThemedText style={styles.heroTitle}>Contactez-nous</ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Une question, un problème ou une suggestion ? Écrivez-nous, notre équipe vous répond sous 24h.
            </ThemedText>
          </View>
        </View>

        {/* Formulaire */}
        <View style={styles.formSection}>
          <ThemedText style={styles.sectionTitle}>Envoyez-nous un message</ThemedText>
          
          {/* Nom */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Nom complet *</ThemedText>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(value) => handleChange('name', value)}
              placeholder="Votre nom complet"
              placeholderTextColor="#9CA3AF"
            />
            {errors.name && <ThemedText style={styles.errorText}>{errors.name}</ThemedText>}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Adresse email *</ThemedText>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              placeholder="votre@email.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <ThemedText style={styles.errorText}>{errors.email}</ThemedText>}
          </View>

          {/* Sujet */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Sujet *</ThemedText>
            <TouchableOpacity 
              style={[styles.selectContainer, errors.subject && styles.inputError]}
              onPress={() => setShowSubjectModal(true)}
            >
              <ThemedText style={[styles.selectText, !formData.subject && styles.placeholderText]}>
                {formData.subject || 'Sélectionnez un sujet'}
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            {errors.subject && <ThemedText style={styles.errorText}>{errors.subject}</ThemedText>}
          </View>

          {/* Message */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Message *</ThemedText>
            <TextInput
              style={[styles.textArea, errors.message && styles.inputError]}
              value={formData.message}
              onChangeText={(value) => handleChange('message', value)}
              placeholder="Décrivez votre question ou votre problème..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            {errors.message && <ThemedText style={styles.errorText}>{errors.message}</ThemedText>}
          </View>

          {/* Bouton d'envoi */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <ThemedText style={styles.submitButtonText}>Envoyer le message</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Informations de contact */}
        <View style={styles.infoSection}>
          <ThemedText style={styles.sectionTitle}>Informations de contact</ThemedText>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="mail" size={24} color="#4CAF50" />
              </View>
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoTitle}>Email</ThemedText>
                <ThemedText style={styles.infoText}>support@kamri.com</ThemedText>
                <ThemedText style={styles.infoSubtext}>Réponse sous 24h</ThemedText>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="time" size={24} color="#4CAF50" />
              </View>
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoTitle}>Horaires</ThemedText>
                <ThemedText style={styles.infoText}>Lun-Ven, 9h-18h</ThemedText>
                <ThemedText style={styles.infoSubtext}>Support en français</ThemedText>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="call" size={24} color="#4CAF50" />
              </View>
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoTitle}>Téléphone</ThemedText>
                <ThemedText style={styles.infoText}>+33 1 23 45 67 89</ThemedText>
                <ThemedText style={styles.infoSubtext}>Appel gratuit</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Réseaux sociaux */}
        <View style={styles.socialSection}>
          <ThemedText style={styles.sectionTitle}>Suivez-nous</ThemedText>
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-instagram" size={24} color="#E4405F" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-tiktok" size={24} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.socialText}>
            Restez informé de nos dernières nouveautés
          </ThemedText>
        </View>

        {/* Section FAQ */}
        <View style={styles.faqSection}>
          <ThemedText style={styles.sectionTitle}>Questions fréquentes</ThemedText>
          <ThemedText style={styles.faqSubtitle}>
            Trouvez rapidement les réponses à vos questions
          </ThemedText>
          
          <View style={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity 
                  style={styles.faqQuestion}
                  onPress={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <ThemedText style={styles.faqQuestionText}>{faq.question}</ThemedText>
                  <Ionicons 
                    name={openFAQ === index ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#4CAF50" 
                  />
                </TouchableOpacity>
                
                {openFAQ === index && (
                  <View style={styles.faqAnswer}>
                    <ThemedText style={styles.faqAnswerText}>{faq.answer}</ThemedText>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
        
        <HomeFooter />
      </ScrollView>
      
      {/* Modal de sélection du sujet */}
      <Modal
        visible={showSubjectModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSubjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Sélectionnez un sujet</ThemedText>
              <TouchableOpacity onPress={() => setShowSubjectModal(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {subjects.map((subject, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.subjectOption}
                  onPress={() => selectSubject(subject)}
                >
                  <ThemedText style={styles.subjectOptionText}>{subject}</ThemedText>
                  {formData.subject === subject && (
                    <Ionicons name="checkmark" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
      
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
    paddingBottom: 120, // Espace suffisant pour la barre de navigation courbée
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#424242',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  selectContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    color: '#424242',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  textArea: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#424242',
    minHeight: 120,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  submitButton: {
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
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#4CAF50',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  socialSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  // Hero Section Styles
  heroContainer: {
    height: 200,
    position: 'relative',
    marginBottom: 20,
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
  // FAQ Section Styles
  faqSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  faqSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  faqContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
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
    paddingVertical: 8,
  },
  subjectOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  subjectOptionText: {
    fontSize: 16,
    color: '#424242',
    flex: 1,
  },
});
