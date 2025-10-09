
export default function HomeHeader() {
  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src="/logo.png"
              alt="KAMRI Logo"
              className="h-20 w-auto"
              style={{ maxWidth: '280px', height: '90px' }}
            />
          </div>

          {/* Barre de recherche */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher des produits..."
                className="w-full pl-12 pr-4 py-3 bg-[#F5F5F5] rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {/* Navigation principale */}
          <nav className="hidden md:flex items-center space-x-8">
            <button className="text-[#1E88E5] font-semibold border-b-2 border-[#1E88E5] pb-1">
              Accueil
            </button>
            <button className="text-[#9CA3AF] hover:text-[#1E88E5] font-medium transition-colors duration-200">
              Produits
            </button>
            <button className="text-[#9CA3AF] hover:text-[#1E88E5] font-medium transition-colors duration-200">
              Catégories
            </button>
            <button className="text-[#9CA3AF] hover:text-[#1E88E5] font-medium transition-colors duration-200">
              Contact
            </button>
          </nav>

          {/* Icônes de navigation */}
          <div className="flex items-center space-x-6">
            <button className="p-3 text-[#212121] hover:text-[#1E88E5] hover:bg-[#F5F5F5] rounded-full transition-all duration-200">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button className="relative p-3 text-[#212121] hover:text-[#1E88E5] hover:bg-[#F5F5F5] rounded-full transition-all duration-200">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-[#FF7043] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                3
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
