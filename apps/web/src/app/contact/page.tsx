import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F0F8F0]">
      <ModernHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#4CAF50] mb-6">
            Contact
          </h1>
          <p className="text-xl text-[#424242] mb-8">
            Nous sommes là pour vous aider
          </p>
        </div>
      </main>
      
      <HomeFooter />
    </div>
  );
}
