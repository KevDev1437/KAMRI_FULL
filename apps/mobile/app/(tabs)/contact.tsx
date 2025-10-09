import { StyleSheet, View } from 'react-native';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import { ThemedText } from '../../components/themed-text';

export default function ContactScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Contact</ThemedText>
        <ThemedText style={styles.subtitle}>
          Nous sommes là pour vous aider
        </ThemedText>
      </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
