'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CJCategory, SearchFilters } from '@/types/cj'
import { DollarSign, Filter, Globe, Package, RotateCcw, Search, Truck } from 'lucide-react'
import { useState } from 'react'

interface CJSearchFiltersProps {
  filters: SearchFilters
  categories: CJCategory[]
  onFiltersChange: (filters: Partial<SearchFilters>) => void
  onSearch: () => void
  loading: boolean
}

export const CJSearchFilters = ({ 
  filters, 
  categories, 
  onFiltersChange, 
  onSearch, 
  loading 
}: CJSearchFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Fonction pour réinitialiser les filtres
  const handleReset = () => {
    onFiltersChange({
      keyword: '',
      category: 'ALL',
      minPrice: 0,
      maxPrice: 1000,
      stockCountry: 'ALL',
      minStock: 0,
      deliveryTime: 'ALL',
      freeShippingOnly: false,
      sortBy: 'popularity',
      productType: 'ALL'
    })
  }

  // Fonction pour construire l'arbre des catégories
  const buildCategoryTree = (categories: CJCategory[]): CJCategory[] => {
    const categoryMap = new Map<string, CJCategory>()
    const rootCategories: CJCategory[] = []

    // Créer une map de toutes les catégories
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] })
    })

    // Construire l'arbre
    categories.forEach(cat => {
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        const parent = categoryMap.get(cat.parentId)!
        parent.children = parent.children || []
        parent.children.push(categoryMap.get(cat.id)!)
      } else {
        rootCategories.push(categoryMap.get(cat.id)!)
      }
    })

    return rootCategories
  }

  // Fonction pour rendre les options de catégories de manière hiérarchique
  const renderCategoryOptions = (categories: CJCategory[], level: number = 0): JSX.Element[] => {
    return categories.map(category => (
      <div key={category.id}>
        <SelectItem value={category.id} className="pl-4">
          {'— '.repeat(level)}{category.name}
        </SelectItem>
        {category.children && renderCategoryOptions(category.children, level + 1)}
      </div>
    ))
  }

  const categoryTree = buildCategoryTree(categories)

  return (
    <div className="space-y-6">
      {/* Filtres de base */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recherche par mot-clé */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Search className="w-4 h-4 mr-2" />
            Recherche
          </label>
          <Input
            placeholder="Mot-clé, SKU, nom..."
            value={filters.keyword}
            onChange={(e) => onFiltersChange({ keyword: e.target.value })}
            className="w-full"
          />
        </div>

        {/* Catégorie */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Catégorie
          </label>
          <Select
            value={filters.category}
            onValueChange={(value) => onFiltersChange({ category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes les catégories</SelectItem>
              {renderCategoryOptions(categoryTree)}
            </SelectContent>
          </Select>
        </div>

        {/* Prix minimum */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Prix min
          </label>
          <Input
            type="number"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => onFiltersChange({ minPrice: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Prix maximum */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Prix max
          </label>
          <Input
            type="number"
            placeholder="1000"
            value={filters.maxPrice}
            onChange={(e) => onFiltersChange({ maxPrice: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Bouton pour afficher/masquer les filtres avancés */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center"
        >
          <Filter className="w-4 h-4 mr-2" />
          {showAdvanced ? 'Masquer' : 'Afficher'} les filtres avancés
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
          <Button
            onClick={onSearch}
            disabled={loading}
            className="kamri-button flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Recherche...' : 'Rechercher'}
          </Button>
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          {/* Pays de stock */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              Pays stock
            </label>
            <Select
              value={filters.stockCountry}
              onValueChange={(value) => onFiltersChange({ stockCountry: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les pays</SelectItem>
                <SelectItem value="US">🇺🇸 États-Unis</SelectItem>
                <SelectItem value="FR">🇫🇷 France</SelectItem>
                <SelectItem value="CN">🇨🇳 Chine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stock minimum */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Stock minimum
            </label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minStock}
              onChange={(e) => onFiltersChange({ minStock: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Délai de livraison */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Truck className="w-4 h-4 mr-2" />
              Livraison
            </label>
            <Select
              value={filters.deliveryTime}
              onValueChange={(value) => onFiltersChange({ deliveryTime: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les délais</SelectItem>
                <SelectItem value="24">⚡ 24h</SelectItem>
                <SelectItem value="48">🚚 48h</SelectItem>
                <SelectItem value="72">📦 72h</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type de produit */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Type de produit
            </label>
            <Select
              value={filters.productType}
              onValueChange={(value) => onFiltersChange({ productType: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les types</SelectItem>
                <SelectItem value="ORDINARY_PRODUCT">Produits ordinaires</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tri */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Trier par
            </label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => onFiltersChange({ sortBy: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">🔥 Popularité</SelectItem>
                <SelectItem value="price_asc">💰 Prix croissant</SelectItem>
                <SelectItem value="price_desc">💰 Prix décroissant</SelectItem>
                <SelectItem value="newest">🆕 Plus récents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Livraison gratuite uniquement */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Options
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="freeShipping"
                checked={filters.freeShippingOnly}
                onChange={(e) => onFiltersChange({ freeShippingOnly: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="freeShipping" className="text-sm text-gray-700">
                🚚 Livraison gratuite uniquement
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
