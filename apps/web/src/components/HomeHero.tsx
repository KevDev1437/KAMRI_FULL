
export default function HomeHero() {
  return (
    <section className="relative min-h-[600px] bg-gradient-to-br from-[#EAF3EE] to-[#FFFFFF] rounded-3xl mx-6 my-16 overflow-hidden shadow-lg">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Contenu texte - Colonne gauche */}
          <div className="hero-content space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold text-[#1A3C2E] leading-tight tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              Découvrez les tendances du moment
            </h1>
            <p className="text-xl md:text-2xl text-[#4B6254] font-light leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Collection exclusive de vêtements et accessoires
            </p>
            
            <button className="bg-[#2F6F4E] text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-sm hover:bg-[#256046] transform hover:scale-105 transition-all duration-300 ease-in-out" style={{ fontFamily: 'Inter, sans-serif' }}>
              Explorer maintenant
            </button>
          </div>
          
          {/* Image - Colonne droite */}
          <div className="hero-image relative">
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-lg">
              {/* Placeholder pour l'image de modèle */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#E8F5E8] to-[#F5F5F5] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-[#4CAF50] rounded-full mx-auto flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-[#4B6254] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Image de modèle
                  </p>
                </div>
              </div>
              
              {/* Overlay décoratif */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Éléments décoratifs subtils */}
      <div className="absolute top-8 right-8 w-16 h-16 bg-[#4CAF50]/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-8 left-8 w-24 h-24 bg-[#81C784]/10 rounded-full blur-2xl"></div>
    </section>
  );
}
