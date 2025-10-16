'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import AuthModal from './AuthModal';

export default function ModernHeader() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const menuRef = useRef<HTMLDivElement>(null);

  // Log pour debug
  console.log('📊 [Header] wishlistCount:', wishlistCount, 'cartCount:', cartCount);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const categories = [
    { name: 'Accueil', href: '/', icon: '🏠' },
    { name: 'Produits', href: '/products', icon: '🛍️' },
    { name: 'Catégories', href: '/categories', icon: '📋' },
    { name: 'Contact', href: '/contact', icon: '📞' },
    { name: 'Promos', href: '/promotions', icon: '💸' },
  ];

  return (
    <>
      {/* Mini-bande promotionnelle */}
      <div className="bg-gradient-to-r from-[#E8F5E8] to-[#F0F8F0] py-2 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm text-[#424242]">
          <span className="flex items-center gap-1">
            <span>🚚</span>
            <span className="hidden xs:inline">Livraison gratuite à partir de 100€</span>
            <span className="xs:hidden">Livraison gratuite 100€+</span>
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="flex items-center gap-1">
            <span>🔄</span>
            <span className="hidden xs:inline">Retours faciles</span>
            <span className="xs:hidden">Retours</span>
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="flex items-center gap-1">
            <span>💬</span>
            <span className="hidden xs:inline">Support 24/7</span>
            <span className="xs:hidden">Support</span>
          </span>
        </div>
      </div>

      {/* Header principal */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-[#E8F5E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Ligne principale */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-0 py-4 lg:py-0 lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0 order-1 lg:order-1">
              <Link href="/" className="block">
                <img
                  src="/images/logo.png"
                  alt="KAMRI Logo"
                  className="h-16 sm:h-20 lg:h-24 w-auto transition-all duration-300 hover:scale-105"
                />
              </Link>
            </div>

            {/* Barre de recherche centrale */}
            <div className="flex-1 w-full max-w-2xl mx-0 lg:mx-8 order-3 lg:order-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 lg:h-5 lg:w-5 text-[#81C784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Rechercher des produits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 lg:pl-12 pr-3 lg:pr-4 py-3 lg:py-4 bg-[#E8F5E8] rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:bg-white transition-all duration-300 ease-in-out font-medium text-[#424242] placeholder-[#81C784] text-sm lg:text-lg"
                />
              </div>
            </div>

            {/* Icônes d'action */}
            <div className="flex items-center space-x-2 lg:space-x-4 order-2 lg:order-3">
              {/* Favoris */}
              <Link href="/favorites" className="relative p-2 lg:p-3 text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8] rounded-full transition-all duration-300 ease-in-out hover:scale-110">
                <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FF7043] text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Panier */}
              <Link href="/cart" className="relative p-2 lg:p-3 text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8] rounded-full transition-all duration-300 ease-in-out hover:scale-110">
                <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#4CAF50] text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Profil */}
              {isAuthenticated ? (
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2 lg:p-3 text-[#4CAF50] hover:bg-[#E8F5E8] rounded-full transition-all duration-300 ease-in-out hover:scale-110"
                  >
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#4CAF50] rounded-full flex items-center justify-center text-white font-bold text-sm lg:text-base">
                      {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || 'K'}
                    </div>
                  </button>

                  {/* Menu déroulant */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      
                      <Link 
                        href="/profile" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Mon profil
                      </Link>
                      
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                      >
                        <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Se déconnecter
                      </button>
                      
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="p-2 lg:p-3 text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8] rounded-full transition-all duration-300 ease-in-out hover:scale-110"
                >
                  <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Navigation horizontale des catégories */}
          <div className="border-t border-[#E8F5E8] py-2 lg:py-3">
            <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 lg:gap-8">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className={`flex items-center gap-1 lg:gap-2 px-2 sm:px-3 lg:px-4 py-1 lg:py-2 rounded-full font-medium transition-all duration-300 ease-in-out hover:scale-105 text-sm lg:text-base ${
                    pathname === category.href
                      ? 'bg-[#4CAF50] text-white shadow-lg'
                      : 'text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8]'
                  }`}
                >
                  <span className="text-sm lg:text-lg">{category.icon}</span>
                  <span className="hidden sm:inline">{category.name}</span>
                  <span className="sm:hidden">{category.name.charAt(0)}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Modal d'authentification */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}
