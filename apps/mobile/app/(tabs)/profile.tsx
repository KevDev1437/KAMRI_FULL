import { StyleSheet, View } from 'react-native';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.icon}>👤</ThemedText>
        <ThemedText style={styles.title}>Mon Profil</ThemedText>
        <ThemedText style={styles.subtitle}>
          Gérez vos informations personnelles
        </ThemedText>
      </ThemedView>
      <CurvedBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingBottom: 0, // No space - content goes directly under navigation
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
