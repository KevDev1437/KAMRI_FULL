'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function ModernHeader() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'Accueil', href: '/', icon: '🏠' },
    { name: 'Produits', href: '/products', icon: '🛍️' },
    { name: 'Catégories', href: '/categories', icon: '📋' },
    { name: 'Contact', href: '/contact', icon: '📞' },
    { name: 'Promos', href: '/products?category=promotions', icon: '💸' },
  ];

  return (
    <>
      {/* Mini-bande promotionnelle */}
      <div className="bg-gradient-to-r from-[#E8F5E8] to-[#F0F8F0] py-2 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 text-sm text-[#424242]">
          <span className="flex items-center gap-1">
            <span>🚚</span>
            <span>Livraison gratuite à partir de 100€</span>
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="flex items-center gap-1">
            <span>🔄</span>
            <span>Retours faciles</span>
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="flex items-center gap-1">
            <span>💬</span>
            <span>Support 24/7</span>
          </span>
        </div>
      </div>

      {/* Header principal */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-[#E8F5E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Ligne principale */}
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="block">
                <img
                  src="/logo.png"
                  alt="KAMRI Logo"
                  className="h-12 w-auto transition-all duration-300 hover:scale-105"
                />
              </Link>
            </div>

            {/* Barre de recherche centrale */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-[#81C784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Rechercher des produits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#E8F5E8] rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:bg-white transition-all duration-300 ease-in-out font-medium text-[#424242] placeholder-[#81C784] text-lg"
                />
              </div>
            </div>

            {/* Icônes d'action */}
            <div className="flex items-center space-x-4">
              {/* Favoris */}
              <button className="relative p-3 text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8] rounded-full transition-all duration-300 ease-in-out hover:scale-110">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-[#FF7043] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  2
                </span>
              </button>

              {/* Panier */}
              <button className="relative p-3 text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8] rounded-full transition-all duration-300 ease-in-out hover:scale-110">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-[#4CAF50] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  3
                </span>
              </button>

              {/* Profil */}
              <button className="p-3 text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8] rounded-full transition-all duration-300 ease-in-out hover:scale-110">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation horizontale des catégories */}
          <div className="border-t border-[#E8F5E8] py-3">
            <nav className="flex items-center justify-center space-x-8">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ease-in-out hover:scale-105 ${
                    pathname === category.href
                      ? 'bg-[#4CAF50] text-white shadow-lg'
                      : 'text-[#424242] hover:text-[#4CAF50] hover:bg-[#E8F5E8]'
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
