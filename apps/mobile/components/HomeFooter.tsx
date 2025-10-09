import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function HomeFooter() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Section */}
        <View style={styles.topSection}>
          
          {/* Informational Links */}
          <View style={styles.linksSection}>
            <View style={styles.linkColumn}>
              <ThemedText style={styles.sectionTitle}>Nous connaître</ThemedText>
              <TouchableOpacity style={styles.linkItem}>
                <ThemedText style={styles.linkText}>À propos de KAMRI</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <ThemedText style={styles.linkText}>KAMRI - Mode et Style</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <ThemedText style={styles.linkText}>Programme d'affiliation</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <ThemedText style={styles.linkText}>Contactez-nous</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <ThemedText style={styles.linkText}>Mentions légales</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.linkColumn}>
              <ThemedText style={styles.sectionTitle}>Service client</ThemedText>
              <TouchableOpacity style={styles.linkItem}>
                <ThemedText style={styles.linkText}>Politique de retour</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <ThemedText style={styles.linkText}>Politique de confidentialité</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <ThemedText style={styles.linkText}>Informations de livraison</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <ThemedText style={styles.linkText}>Alertes sécurité</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.linkColumn}>
              <ThemedText style={styles.sectionTitle}>Aide</ThemedText>
              <TouchableOpacity style={styles.linkItem}>
                <ThemedText style={styles.linkText}>Centre d'aide</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <ThemedText style={styles.linkText}>FAQ</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <ThemedText style={styles.linkText}>Centre de sécurité</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <ThemedText style={styles.linkText}>Protection des achats</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* App Download */}
          <View style={styles.appSection}>
            <ThemedText style={styles.sectionTitle}>Téléchargez l'app KAMRI</ThemedText>
            <View style={styles.appFeatures}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
                <ThemedText style={styles.featureText}>Alertes de promotions</ThemedText>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
                <ThemedText style={styles.featureText}>Paiement sécurisé</ThemedText>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
                <ThemedText style={styles.featureText}>Suivi des commandes</ThemedText>
              </View>
            </View>
            
            {/* App Store Buttons */}
            <View style={styles.appButtons}>
              <TouchableOpacity style={styles.appButton}>
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                <View style={styles.appButtonText}>
                  <ThemedText style={styles.appButtonSubtext}>Télécharger dans</ThemedText>
                  <ThemedText style={styles.appButtonMaintext}>App Store</ThemedText>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.appButton}>
                <Ionicons name="logo-google-playstore" size={20} color="#FFFFFF" />
                <View style={styles.appButtonText}>
                  <ThemedText style={styles.appButtonSubtext}>Disponible sur</ThemedText>
                  <ThemedText style={styles.appButtonMaintext}>Google Play</ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Social Media */}
          <View style={styles.socialSection}>
            <ThemedText style={styles.sectionTitle}>Connectez-vous avec KAMRI</ThemedText>
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-instagram" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-twitter" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-tiktok" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-youtube" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-pinterest" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Security & Payments */}
        <View style={styles.middleSection}>
          <View style={styles.securitySection}>
            <ThemedText style={styles.sectionTitle}>Certificats de sécurité</ThemedText>
            <View style={styles.certContainer}>
              <View style={styles.certItem}>
                <ThemedText style={styles.certText}>SSL Sécurisé</ThemedText>
              </View>
              <View style={styles.certItem}>
                <ThemedText style={styles.certText}>PCI DSS</ThemedText>
              </View>
              <View style={styles.certItem}>
                <ThemedText style={styles.certText}>Paiement Sécurisé</ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.paymentSection}>
            <ThemedText style={styles.sectionTitle}>Nous acceptons</ThemedText>
            <View style={styles.paymentContainer}>
              <View style={styles.paymentItem}>
                <ThemedText style={styles.paymentText}>VISA</ThemedText>
              </View>
              <View style={styles.paymentItem}>
                <ThemedText style={styles.paymentText}>Mastercard</ThemedText>
              </View>
              <View style={styles.paymentItem}>
                <ThemedText style={styles.paymentText}>PayPal</ThemedText>
              </View>
              <View style={styles.paymentItem}>
                <ThemedText style={styles.paymentText}>Apple Pay</ThemedText>
              </View>
              <View style={styles.paymentItem}>
                <ThemedText style={styles.paymentText}>Google Pay</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.bottomSection}>
          <ThemedText style={styles.copyright}>
            © 2024 KAMRI. Tous droits réservés.
          </ThemedText>
          <View style={styles.legalLinks}>
            <TouchableOpacity style={styles.legalLink}>
              <ThemedText style={styles.legalText}>Conditions d'utilisation</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.legalLink}>
              <ThemedText style={styles.legalText}>Politique de confidentialité</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.legalLink}>
              <ThemedText style={styles.legalText}>Mentions légales</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8F5E8',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 0,
    paddingBottom: 20, // Padding normal
  },
  topSection: {
    paddingBottom: 20,
  },
  linksSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  linkColumn: {
    flex: 1,
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 12,
  },
  linkItem: {
    marginBottom: 8,
  },
  linkText: {
    fontSize: 13,
    color: '#81C784',
  },
  appSection: {
    marginBottom: 24,
  },
  appFeatures: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#81C784',
  },
  appButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  appButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  appButtonText: {
    marginLeft: 8,
  },
  appButtonSubtext: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  appButtonMaintext: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  socialSection: {
    marginBottom: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleSection: {
    borderTopWidth: 1,
    borderTopColor: '#81C784',
    paddingTop: 20,
    paddingBottom: 20,
  },
  securitySection: {
    marginBottom: 20,
  },
  certContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  certItem: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  certText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  paymentSection: {
    marginBottom: 20,
  },
  paymentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  paymentItem: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  paymentText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: '#81C784',
    paddingTop: 16,
    alignItems: 'center',
  },
  copyright: {
    fontSize: 12,
    color: '#81C784',
    marginBottom: 12,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  legalLink: {
    marginHorizontal: 8,
    marginBottom: 8,
  },
  legalText: {
    fontSize: 11,
    color: '#81C784',
  },
});