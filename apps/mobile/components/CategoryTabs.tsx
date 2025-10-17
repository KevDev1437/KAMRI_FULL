import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface CategoryTabsProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories?: Category[];
}

export default function CategoryTabs({ selectedCategory, setSelectedCategory, categories }: CategoryTabsProps) {
  // Catégories par défaut si aucune n'est fournie
  const defaultCategories = [
    { id: 'tous', name: 'Tous', icon: '🛍️' },
    { id: 'mode', name: 'Mode', icon: '👕' },
    { id: 'technologie', name: 'Tech', icon: '💻' },
    { id: 'maison', name: 'Maison', icon: '🏠' },
    { id: 'beaute', name: 'Beauté', icon: '💅' },
    { id: 'accessoires', name: 'Accessoires', icon: '🎒' },
    { id: 'sport', name: 'Sport', icon: '⚽' },
    { id: 'enfants', name: 'Enfants', icon: '🧸' },
  ];

  // Utiliser les catégories fournies ou les catégories par défaut
  const displayCategories = categories && categories.length > 0 
    ? [{ id: 'tous', name: 'Tous', icon: '🛍️' }, ...categories]
    : defaultCategories;
  
  console.log('📂 [CATEGORY-TABS] Catégories affichées:', displayCategories.map(c => ({ id: c.id, name: c.name })));
  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategory
            ]}
            onPress={() => {
              console.log('📂 [CATEGORY-TABS] Catégorie sélectionnée:', category.id, category.name);
              setSelectedCategory(category.id);
            }}
          >
            <ThemedText style={styles.categoryIcon}>{category.icon || '🛍️'}</ThemedText>
            <ThemedText style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedText
            ]}>
              {category.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    minWidth: 70,
  },
  selectedCategory: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#424242',
    textAlign: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
