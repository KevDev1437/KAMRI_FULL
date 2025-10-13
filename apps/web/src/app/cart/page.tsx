'use client';

import { calculateDiscountPercentage, formatDiscountPercentage } from '@kamri/lib';
import { motion } from 'framer-motion';
import { useState } from 'react';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      price: 1299,
      originalPrice: 1399,
      image: 'https://images.unsplash.com/photo-1592899677977-9d26d3ba4f33?w=300',
      quantity: 1,
      size: '256GB',
      color: 'Titanium Naturel',
      inStock: true,
      savings: 100
    },
    {
      id: '2',
      name: 'AirPods Pro 2',
      price: 249,
      originalPrice: 279,
      image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300',
      quantity: 2,
      size: 'Standard',
      color: 'Blanc',
      inStock: true,
      savings: 60
    },
    {
      id: '3',
      name: 'MacBook Air M2',
      price: 1199,
      originalPrice: 1199,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
      quantity: 1,
      size: '13"',
      color: 'Gris sidéral',
      inStock: false,
      savings: 0
    }
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set(['1', '2', '3']));

  // Calculs
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalSavings = cartItems.reduce((sum, item) => sum + (item.savings * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const promoDiscount = promoCode === 'WELCOME10' ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - promoDiscount;
  
  // Calcul du pourcentage moyen de réduction
  const itemsWithDiscount = cartItems.filter(item => item.originalPrice > item.price);
  const averageDiscountPercentage = itemsWithDiscount.length > 0 
    ? itemsWithDiscount.reduce((sum, item) => sum + calculateDiscountPercentage(item.originalPrice, item.price), 0) / itemsWithDiscount.length
    : 0;

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article de votre panier ?')) {
      setCartItems(items => items.filter(item => item.id !== id));
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
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

  const proceedToCheckout = () => {
    const selectedCount = selectedItems.size;
    if (selectedCount === 0) {
      alert('Veuillez sélectionner au moins un article');
      return;
    }
    alert(`Procéder au paiement de ${selectedCount} article(s) pour ${total.toFixed(2)}€`);
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
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
                      setCartItems([]);
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
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    
                    {/* Détails du produit */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-[#424242] mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.size} • {item.color}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
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
                            <span className="text-xl font-bold text-[#4CAF50]">{item.price}€</span>
                            {item.originalPrice > item.price && (
                              <span className="text-sm text-gray-500 line-through">{item.originalPrice}€</span>
                            )}
                          </div>
                          {item.originalPrice > item.price && (
                            <span className="bg-[#E8F5E8] text-[#4CAF50] px-2 py-1 rounded-full text-sm font-medium">
                              {formatDiscountPercentage(calculateDiscountPercentage(item.originalPrice, item.price))}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {!item.inStock && (
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6 mt-6"
            >
              <h3 className="text-lg font-semibold text-[#424242] mb-4">Vous pourriez aussi aimer</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'iPhone 15', price: 999, image: 'https://images.unsplash.com/photo-1592899677977-9d26d3ba4f33?w=200' },
                  { name: 'AirPods Max', price: 549, image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=200' },
                  { name: 'Apple Watch', price: 399, image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=200' }
                ].map((product, index) => (
                  <div key={index} className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-300 cursor-pointer border border-gray-100">
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg mb-3" />
                    <h4 className="font-medium text-[#424242] text-center mb-1">{product.name}</h4>
                    <p className="text-sm text-[#4CAF50] font-semibold">{product.price}€</p>
                  </div>
                ))}
              </div>
            </motion.div>
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
                  <span className="font-medium">{subtotal.toFixed(2)}€</span>
                </div>
                
                {averageDiscountPercentage > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Économies</span>
                    <span className="text-[#4CAF50] font-medium">
                      {formatDiscountPercentage(Math.round(averageDiscountPercentage))}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)}€`}
                  </span>
                </div>
                
                {promoDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Réduction promo</span>
                    <span className="text-[#4CAF50] font-medium">-{promoDiscount.toFixed(2)}€</span>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-[#424242]">Total</span>
                    <span className="text-xl font-bold text-[#4CAF50]">{total.toFixed(2)}€</span>
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
                
                <button className="w-full text-[#4CAF50] hover:text-[#45a049] font-medium transition-colors duration-300">
                  Continuer mes achats
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
      
      <HomeFooter />
    </div>
  );
}