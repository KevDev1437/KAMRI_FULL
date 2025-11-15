'use client';

import { calculateDiscountPercentage, formatDiscountPercentage } from '@kamri/lib';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';
import RecommendedProducts from '../../components/RecommendedProducts';
import { useCart } from '../../contexts/CartContext';
import { apiClient } from '../../lib/api';
import { ShippingOptions, ShippingOption } from '../../components/ShippingOptions';

// Fonction utilitaire pour nettoyer les URLs d'images
const getCleanImageUrl = (image: string | string[] | null | undefined): string | null => {
  if (!image) return null;
  
  if (typeof image === 'string') {
    // Si c'est une string, vérifier si c'est un JSON
    try {
      const parsed = JSON.parse(image);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
      return image;
    } catch {
      return image;
    }
  } else if (Array.isArray(image) && image.length > 0) {
    return image[0];
  }
  
  return null;
};

export default function CartPage() {
  const { cartItems, cartCount, loading, removeFromCart, updateQuantity, clearCart } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  
  // États pour le calcul de fret
  const [selectedCountry, setSelectedCountry] = useState<string>('FR');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOption | null>(null);
  const [showShippingOptions, setShowShippingOptions] = useState(false);

  // Calculs
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalSavings = cartItems.reduce((sum, item) => {
    const originalPrice = item.product.originalPrice || item.product.price;
    return sum + ((originalPrice - item.product.price) * item.quantity);
  }, 0);
  
  // Calcul du shipping : utiliser l'option sélectionnée ou fallback
  const shipping = selectedShippingOption?.freight || (subtotal > 100 ? 0 : 9.99);
  const promoDiscount = promoCode === 'WELCOME10' ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - promoDiscount;
  
  // Détecter les produits CJ dans le panier
  const cjProducts = cartItems.filter(item => 
    item.product.source === 'cj-dropshipping' || 
    (item.product as any).cjProductId ||
    (item.product as any).productVariants?.some((v: any) => v.cjVariantId)
  );
  
  const hasCJProducts = cjProducts.length > 0;
  
  // Calcul du pourcentage moyen de réduction
  const itemsWithDiscount = cartItems.filter(item => item.product.originalPrice && item.product.originalPrice > item.product.price);
  const averageDiscountPercentage = itemsWithDiscount.length > 0 
    ? itemsWithDiscount.reduce((sum, item) => sum + calculateDiscountPercentage(item.product.originalPrice!, item.product.price), 0) / itemsWithDiscount.length
    : 0;

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article de votre panier ?')) {
      try {
        await removeFromCart(itemId);
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const applyPromoCode = () => {
    if (promoCode === 'WELCOME10') {
      alert('Code appliqué ! Réduction de 10% appliquée');
    } else {
      alert('Code invalide - Le code promo n\'est pas valide');
    }
  };

  // Calculer le fret pour les produits CJ
  const calculateFreight = async () => {
    const cjProductsCheck = cartItems.filter(item => 
      item.product.source === 'cj-dropshipping' || 
      (item.product as any).cjProductId ||
      (item.product as any).productVariants?.some((v: any) => v.cjVariantId)
    );
    
    if (cjProductsCheck.length === 0) return;

    try {
      setLoadingShipping(true);
      setShippingError(null);
      setShippingOptions([]);

      // Préparer les produits pour le calcul
      const products: Array<{ vid: string; quantity: number }> = [];
      
      for (const item of cjProductsCheck) {
        const product = item.product as any;
        // Chercher un variant CJ
        const variant = product.productVariants?.find((v: any) => v.cjVariantId);
        if (variant && variant.cjVariantId) {
          products.push({
            vid: variant.cjVariantId,
            quantity: item.quantity
          });
        }
      }

      if (products.length === 0) {
        setShippingError('Aucun variant CJ trouvé dans le panier');
        return;
      }

      const response = await apiClient.calculateCJFreight({
        startCountryCode: 'CN', // Chine (pays d'origine CJ)
        endCountryCode: selectedCountry,
        products
      });

      if (response.error) {
        setShippingError(response.error);
        return;
      }

      if (response.data?.freightOptions) {
        setShippingOptions(response.data.freightOptions);
        if (response.data.freightOptions.length > 0) {
          setSelectedShippingOption(response.data.freightOptions[0]);
        }
      } else {
        setShippingError('Aucune option de livraison disponible');
      }
    } catch (err: any) {
      console.error('Erreur calcul fret:', err);
      setShippingError(err.message || 'Erreur lors du calcul des frais de livraison');
    } finally {
      setLoadingShipping(false);
    }
  };

  // Calculer le fret quand le pays change ou quand le panier change
  useEffect(() => {
    const hasCJ = cartItems.some(item => 
      item.product.source === 'cj-dropshipping' || 
      (item.product as any).cjProductId ||
      (item.product as any).productVariants?.some((v: any) => v.cjVariantId)
    );
    
    if (hasCJ && selectedCountry) {
      calculateFreight();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, cartItems.length]);

  const proceedToCheckout = () => {
    const selectedCount = selectedItems.size;
    if (selectedCount === 0) {
      alert('Veuillez sélectionner au moins un article');
      return;
    }
    alert(`Procéder au paiement de ${selectedCount} article(s) pour ${total.toFixed(2)}$`);
  };

  return (
    <div className="min-h-screen bg-[#F0F8F0]">
      <ModernHeader />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#EAF3EE] to-[#FFFFFF] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-[#4CAF50] mb-4">
              Mon Panier
            </h1>
            <p className="text-lg sm:text-xl text-[#424242] mb-8 max-w-3xl mx-auto">
              {cartItems.length} article(s) dans votre panier
            </p>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale - Articles du panier */}
          <div className="lg:col-span-2">
            {/* Header avec sélection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-6"
            >
              <div className="flex justify-between items-center">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-3 text-[#424242] hover:text-[#4CAF50] transition-colors duration-300"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedItems.size === cartItems.length 
                      ? 'bg-[#4CAF50] border-[#4CAF50]' 
                      : 'border-gray-300'
                  }`}>
                    {selectedItems.size === cartItems.length && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium">
                    {selectedItems.size === cartItems.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </span>
                </button>
                
                <button
                  onClick={async () => {
                    if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
                      try {
                        await clearCart();
                        console.log('✅ Panier vidé avec succès');
                      } catch (error) {
                        console.error('❌ Erreur lors du vidage du panier:', error);
                      }
                    }
                  }}
                  className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Vider le panier</span>
                </button>
              </div>
            </motion.div>

            {/* Liste des articles */}
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox de sélection */}
                    <button
                      onClick={() => toggleItemSelection(item.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-2 ${
                        selectedItems.has(item.id) 
                          ? 'bg-[#4CAF50] border-[#4CAF50]' 
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedItems.has(item.id) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>

                    {/* Image du produit */}
                    {(() => {
                      const imageUrl = getCleanImageUrl(item.product.image);
                      return imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                          onError={(e) => {
                            console.log('❌ Erreur de chargement d\'image:', e.currentTarget.src);
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null;
                    })()}
                    <div className={`${getCleanImageUrl(item.product.image) ? 'hidden' : 'flex'} w-24 h-24 bg-gray-100 rounded-lg items-center justify-center`}>
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    
                    {/* Détails du produit */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-[#424242] mb-1">{item.product.name}</h3>
                          <p className="text-sm text-gray-500">
                            {item.product.category?.name || 'Non catégorisé'} • {item.product.supplier?.name || 'N/A'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-600 transition-colors duration-300 p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#4CAF50]">{item.product.price}$</span>
                            {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                              <span className="text-sm text-gray-500 line-through">{item.product.originalPrice}$</span>
                            )}
                          </div>
                          {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                            <span className="bg-[#E8F5E8] text-[#4CAF50] px-2 py-1 rounded-full text-sm font-medium">
                              {formatDiscountPercentage(calculateDiscountPercentage(item.product.originalPrice, item.product.price))}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {item.product.stock <= 0 && (
                        <div className="mt-2">
                          <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-medium">
                            Rupture de stock
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Code promo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6 mt-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#424242]">Code promo</h3>
                <button
                  onClick={() => setShowPromoInput(!showPromoInput)}
                  className="text-[#4CAF50] hover:text-[#45a049] font-medium transition-colors duration-300"
                >
                  {showPromoInput ? 'Masquer' : 'J\'ai un code'}
                </button>
              </div>
              
              {showPromoInput && (
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Entrez votre code promo"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all duration-300"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="bg-[#4CAF50] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#45a049] transition-colors duration-300"
                  >
                    Appliquer
                  </button>
                </div>
              )}
            </motion.div>

            {/* Produits recommandés */}
            <RecommendedProducts />
          </div>

          {/* Sidebar - Résumé et commande */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-6"
            >
              <h3 className="text-xl font-bold text-[#424242] mb-6">Résumé de la commande</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{subtotal.toFixed(2)}$</span>
                </div>
                
                {averageDiscountPercentage > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Économies</span>
                    <span className="text-[#4CAF50] font-medium">
                      {formatDiscountPercentage(Math.round(averageDiscountPercentage))}
                    </span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Livraison</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)}$`}
                      </span>
                      {hasCJProducts && (
                        <button
                          onClick={() => setShowShippingOptions(!showShippingOptions)}
                          className="text-xs text-[#4CAF50] hover:underline"
                        >
                          {showShippingOptions ? 'Masquer' : 'Options'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {hasCJProducts && showShippingOptions && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Pays de destination:
                        </label>
                        <select
                          value={selectedCountry}
                          onChange={(e) => setSelectedCountry(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm"
                        >
                          <option value="FR">🇫🇷 France</option>
                          <option value="US">🇺🇸 États-Unis</option>
                          <option value="GB">🇬🇧 Royaume-Uni</option>
                          <option value="DE">🇩🇪 Allemagne</option>
                          <option value="ES">🇪🇸 Espagne</option>
                          <option value="IT">🇮🇹 Italie</option>
                          <option value="CA">🇨🇦 Canada</option>
                          <option value="BE">🇧🇪 Belgique</option>
                          <option value="CH">🇨🇭 Suisse</option>
                          <option value="NL">🇳🇱 Pays-Bas</option>
                          <option value="AU">🇦🇺 Australie</option>
                        </select>
                      </div>
                      
                      <ShippingOptions
                        options={shippingOptions}
                        loading={loadingShipping}
                        error={shippingError}
                        selectedOption={selectedShippingOption}
                        onSelect={(option) => {
                          setSelectedShippingOption(option);
                        }}
                      />
                    </div>
                  )}
                </div>
                
                {promoDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Réduction promo</span>
                    <span className="text-[#4CAF50] font-medium">-{promoDiscount.toFixed(2)}$</span>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-[#424242]">Total</span>
                    <span className="text-xl font-bold text-[#4CAF50]">{total.toFixed(2)}$</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center text-sm text-gray-600">
                  {selectedItems.size} article(s) sélectionné(s)
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={proceedToCheckout}
                  className="w-full bg-[#4CAF50] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#45a049] transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  Commander
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </motion.button>
                
                <a 
                  href="/products" 
                  className="w-full text-[#4CAF50] hover:text-[#45a049] font-medium transition-colors duration-300 text-center block py-2"
                >
                  Continuer mes achats
                </a>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
      
      <HomeFooter />
    </div>
  );
}