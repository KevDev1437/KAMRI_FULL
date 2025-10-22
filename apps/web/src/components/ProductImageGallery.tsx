'use client';

import { useState } from 'react';

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

interface ProductImageGalleryProps {
  images: string[];
  mainImage: string;
  productName: string;
}

export default function ProductImageGallery({ images, mainImage, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div className="relative aspect-square bg-[#E8F5E8] rounded-2xl overflow-hidden shadow-lg">
        {(() => {
          const imageUrl = getCleanImageUrl(images[selectedImage]);
          return imageUrl ? (
            <img
              src={imageUrl}
              alt={productName}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                console.log('❌ Erreur de chargement d\'image:', e.currentTarget.src);
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null;
        })()}
        <div className={`${getCleanImageUrl(images[selectedImage]) ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
          <svg className="h-16 w-16 text-[#81C784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        {/* Bouton zoom (pour web) */}
        <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all duration-200">
          <svg className="h-5 w-5 text-[#81C784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 7l3 3-3 3" />
          </svg>
        </button>
      </div>

      {/* Miniatures */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map((image, index) => {
          const imageUrl = getCleanImageUrl(image);
          return (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                selectedImage === index
                  ? 'border-[#4CAF50] shadow-md'
                  : 'border-gray-200 hover:border-[#81C784]'
              }`}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${productName} ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log('❌ Erreur de chargement d\'image miniature:', e.currentTarget.src);
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`${imageUrl ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gray-100`}>
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </button>
          );
        })}
        ))}
      </div>
    </div>
  );
}
