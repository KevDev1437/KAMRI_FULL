interface ProductFiltersProps {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

export default function ProductFilters({ 
  priceRange, 
  setPriceRange, 
  sortBy, 
  setSortBy,
  showFilters,
  setShowFilters 
}: ProductFiltersProps) {
  const sortOptions = [
    { value: 'populaire', label: 'Plus populaire' },
    { value: 'nouveautes', label: 'Nouveautés' },
    { value: 'prix_croissant', label: 'Prix croissant' },
    { value: 'prix_decroissant', label: 'Prix décroissant' },
    { value: 'note', label: 'Mieux notés' },
  ];

  const brands = ['KAMRI', 'TechBrand', 'GameTech', 'Luxury', 'HomeStyle'];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-[#424242] mb-6">Filtres</h3>
      
      {/* Tri */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-[#424242] mb-3">Trier par</h4>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full p-3 border border-[#E8F5E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-[#424242]"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Prix */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-[#424242] mb-3">Prix</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-full p-2 border border-[#E8F5E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-[#424242]"
            />
            <span className="text-[#81C784]">$</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Max"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full p-2 border border-[#E8F5E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-[#424242]"
            />
            <span className="text-[#81C784]">$</span>
          </div>
        </div>
      </div>

      {/* Marques */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-[#424242] mb-3">Marques</h4>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-[#4CAF50] bg-gray-100 border-gray-300 rounded focus:ring-[#4CAF50] focus:ring-2"
              />
              <span className="ml-2 text-sm text-[#424242]">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Évaluation */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-[#424242] mb-3">Note minimum</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center">
              <input
                type="radio"
                name="rating"
                className="w-4 h-4 text-[#4CAF50] bg-gray-100 border-gray-300 focus:ring-[#4CAF50] focus:ring-2"
              />
              <div className="ml-2 flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1 text-sm text-[#424242]">et plus</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Bouton réinitialiser */}
      <button className="w-full bg-[#E8F5E8] text-[#424242] py-2 px-4 rounded-lg hover:bg-[#4CAF50] hover:text-white transition-all duration-300">
        Réinitialiser les filtres
      </button>
    </div>
  );
}
