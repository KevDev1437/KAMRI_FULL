interface CategoryTabsProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const categories = [
  { id: 'tous', name: 'Tous', icon: '🛍️' },
  { id: 'mode', name: 'Mode', icon: '👕' },
  { id: 'technologie', name: 'Technologie', icon: '💻' },
  { id: 'maison', name: 'Maison', icon: '🏠' },
  { id: 'beaute', name: 'Beauté', icon: '💅' },
  { id: 'accessoires', name: 'Accessoires', icon: '🎒' },
  { id: 'sport', name: 'Sport', icon: '⚽' },
  { id: 'enfants', name: 'Enfants', icon: '🧸' },
];

export default function CategoryTabs({ selectedCategory, setSelectedCategory }: CategoryTabsProps) {
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
          </button>
        ))}
      </div>
    </div>
  );
}
