
export default function HomeHero() {
  return (
    <section className="relative h-[400px] bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#1565C0] rounded-3xl mx-6 my-12 overflow-hidden shadow-2xl">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[#1E88E5] opacity-95"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white px-8 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Découvrez les tendances du moment
          </h1>
          <p className="text-xl md:text-2xl mb-10 opacity-95 font-light leading-relaxed">
            Collection exclusive de vêtements et accessoires
          </p>
          
          <button className="bg-[#FF7043] text-white px-10 py-5 rounded-full text-xl font-bold shadow-2xl hover:bg-[#F4511E] hover:shadow-[#FF7043]/30 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            Explorer maintenant
          </button>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
    </section>
  );
}
