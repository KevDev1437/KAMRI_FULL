export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to KAMRI
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your modern e-commerce platform
        </p>
        <div className="space-x-4">
          <a
            href="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Browse Products
          </a>
        </div>
      </div>
    </div>
  )
}

