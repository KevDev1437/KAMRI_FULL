
export default function HomeHero() {
  return (
    <section className="relative min-h-[700px] bg-gradient-to-br from-[#EAF3EE] to-[#FFFFFF] w-full overflow-hidden shadow-lg">
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
            
            <button className="bg-[#2F6F4E] text-white px-8 py-4 text-lg font-semibold shadow-sm hover:bg-[#256046] transform hover:scale-105 transition-all duration-300 ease-in-out" style={{ fontFamily: 'Inter, sans-serif' }}>
              Explorer maintenant
            </button>
          </div>
          
              {/* Image - Colonne droite */}
              <div className="hero-image relative">
                <div className="relative w-full h-[600px] overflow-hidden shadow-lg">
                  {/* Image de modèle */}
                  <img
                    src="/modelo.png"
                    alt="Modèle KAMRI"
                    className="w-full h-full object-contain"
                  />
                  
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
