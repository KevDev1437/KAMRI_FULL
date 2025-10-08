
export default function HomeHero() {
  return (
    <section className="relative h-96 bg-gradient-to-r from-[#1E88E5] to-[#1976D2] rounded-2xl mx-4 my-8 overflow-hidden">
      <div className="absolute inset-0 bg-[#1E88E5] opacity-90"></div>
      
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Découvrez les tendances du moment
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Collection exclusive de vêtements et accessoires
          </p>
          
          <button className="bg-[#FF7043] text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-[#F4511E] transition-colors">
            Explorer maintenant
          </button>
        </div>
      </div>
    </section>
  );
}
