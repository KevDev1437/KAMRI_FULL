
export default function HomeFooter() {
  return (
    <footer className="bg-[#F5F5F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-[#1E88E5] mb-2">KAMRI</h3>
          <p className="text-[#9CA3AF] mb-6">Votre destination mode préférée</p>
          
          {/* Social links */}
          <div className="flex justify-center space-x-4 mb-6">
            <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow">
              <span className="text-lg">📘</span>
            </button>
            <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow">
              <span className="text-lg">📷</span>
            </button>
            <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow">
              <span className="text-lg">🐦</span>
            </button>
          </div>
          
          <p className="text-sm text-[#9CA3AF]">
            © 2024 KAMRI. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
