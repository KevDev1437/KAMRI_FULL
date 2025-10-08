
export default function HomeHeader() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-[#1E88E5]">KAMRI</h1>
          </div>

          {/* Barre de recherche */}
          <div className="flex-1 max-w-lg mx-8">
            <input
              type="text"
              placeholder="Rechercher des produits..."
              className="w-full px-4 py-2 bg-[#F5F5F5] rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
            />
          </div>

          {/* Icônes de navigation */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-[#212121] hover:text-[#1E88E5] transition-colors">
              <span className="text-xl">👤</span>
            </button>
            <button className="p-2 text-[#212121] hover:text-[#1E88E5] transition-colors">
              <span className="text-xl">🛒</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
