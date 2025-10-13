import { useEffect, useState } from 'react';

interface CategoryTabsProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

interface Category {
  id: string;
  name: string;
  count: number;
  color: string;
  icon: string;
}

export default function CategoryTabs({ selectedCategory, setSelectedCategory }: CategoryTabsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Tes 7 catégories fixes
  const baseCategories: Category[] = [
    { id: 'tous', name: 'Tous', count: 0, color: '#4CAF50', icon: '🛍️' },
    { id: 'Mode', name: 'Mode', count: 0, color: '#FF6B6B', icon: '👕' },
    { id: 'Technologie', name: 'Technologie', count: 0, color: '#4ECDC4', icon: '💻' },
    { id: 'Maison', name: 'Maison', count: 0, color: '#45B7D1', icon: '🏠' },
    { id: 'Beauté', name: 'Beauté', count: 0, color: '#FECA57', icon: '💄' },
    { id: 'Accessoires', name: 'Accessoires', count: 0, color: '#96CEB4', icon: '🎒' },
    { id: 'Sport', name: 'Sport', count: 0, color: '#A8E6CF', icon: '⚽' },
    { id: 'Enfants', name: 'Enfants', count: 0, color: '#FFB6C1', icon: '🧸' },
  ];

  // Charger les comptes de catégories depuis le backend
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        console.log('🔄 [CategoryTabs] Chargement des comptes de catégories...');
        const response = await fetch('http://localhost:3001/api/web/categories');
        const data = await response.json();
        
        if (data.success) {
          // Mettre à jour les comptes de tes catégories fixes
          const updatedCategories = baseCategories.map(category => {
            const backendCategory = data.categories.find((bc: any) => bc.name === category.name);
            return {
              ...category,
              count: backendCategory ? backendCategory.count : 0
            };
          });
          
          // Utiliser le total fourni par le backend
          const totalCount = data.totalActiveProducts || updatedCategories.slice(1).reduce((sum, cat) => sum + cat.count, 0);
          updatedCategories[0].count = totalCount;
          
          setCategories(updatedCategories);
          console.log('✅ [CategoryTabs] Comptes mis à jour:', updatedCategories.map(c => `${c.name}: ${c.count}`));
        } else {
          console.error('❌ [CategoryTabs] Erreur:', data.message);
          setCategories(baseCategories);
        }
      } catch (error) {
        console.error('💥 [CategoryTabs] Erreur lors du chargement:', error);
        setCategories(baseCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-wrap gap-2">
          {baseCategories.map((category) => (
            <div
              key={category.id}
              className="px-4 py-2 rounded-full bg-gray-200 animate-pulse"
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
              selectedCategory === category.id
                ? 'bg-[#4CAF50] text-white shadow-lg transform scale-105'
                : 'bg-[#E8F5E8] text-[#424242] hover:bg-[#4CAF50] hover:text-white hover:scale-105'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
            {category.count > 0 && (
              <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                {category.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
