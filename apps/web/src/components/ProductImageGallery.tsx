'use client';

import { useState } from 'react';

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
        <img
          src={images[selectedImage]}
          alt={productName}
          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
        />
        
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
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              selectedImage === index
                ? 'border-[#4CAF50] shadow-md'
                : 'border-gray-200 hover:border-[#81C784]'
            }`}
          >
            <img
              src={image}
              alt={`${productName} ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
