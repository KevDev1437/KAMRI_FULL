import { ScrollView, StyleSheet, View } from 'react-native';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import HomeFooter from '../../components/HomeFooter';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.icon}>👤</ThemedText>
          <ThemedText style={styles.title}>Mon Profil</ThemedText>
          <ThemedText style={styles.subtitle}>
            Gérez vos informations personnelles
          </ThemedText>
        </ThemedView>
        
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
    paddingBottom: 100, // Espace pour la barre de navigation courbée
  },
  scrollView: {
    flex: 1,
    paddingBottom: 120, // Espace suffisant pour la barre de navigation courbée
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: 400,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#81C784',
    textAlign: 'center',
  },
});
