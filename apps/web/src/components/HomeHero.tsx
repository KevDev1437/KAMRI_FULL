
export default function HomeHero() {
  return (
    <section className="relative h-[500px] bg-gradient-to-br from-[#4CAF50] via-[#2E7D32] to-[#4CAF50] rounded-3xl mx-6 my-16 overflow-hidden shadow-2xl">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[#4CAF50] opacity-95"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#81C784]/10 to-transparent"></div>
      
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white px-8 max-w-5xl">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight tracking-tight font-['Inter']">
            Découvrez les tendances du moment
          </h1>
          <p className="text-2xl md:text-3xl mb-12 opacity-90 font-light leading-relaxed font-['Inter']">
            Collection exclusive de vêtements et accessoires
          </p>
          
          <button className="bg-white text-[#4CAF50] px-12 py-6 rounded-full text-xl font-bold shadow-2xl hover:bg-[#E8F5E8] hover:shadow-white/30 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-in-out border-2 border-white/20">
            Explorer maintenant
          </button>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-16 right-16 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-16 left-16 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-[#81C784]/20 rounded-full blur-lg"></div>
    </section>
  );
}
