import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">MediStore</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Your Health, Our Priority
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Get authentic medicines delivered to your doorstep. Trusted by thousands of customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/shop" 
                className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
              >
                Shop Now
              </Link>
              <Link 
                href="/register" 
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose MediStore</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                title: 'Authentic Products',
                description: 'All medicines sourced from verified manufacturers',
              },
              {
                title: 'Fast Delivery',
                description: 'Same-day delivery in major cities',
              },
              {
                title: '24/7 Support',
                description: 'Round-the-clock customer support',
              },
              {
                title: 'Secure Payment',
                description: 'Multiple secure payment options',
              },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Medicines */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Medicines</h2>
            <Link href="/shop" className="text-blue-600 hover:text-blue-700 font-semibold">
              View All →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Paracetamol 500mg',
                price: '৳5.99',
                category: 'Pain Relief',
                stock: 'In Stock',
              },
              {
                name: 'Vitamin C 1000mg',
                price: '৳12.99',
                category: 'Supplements',
                stock: 'In Stock',
              },
              {
                name: 'Ibuprofen 400mg',
                price: '৳8.99',
                category: 'Pain Relief',
                stock: 'Low Stock',
              },
              {
                name: 'Cetirizine 10mg',
                price: '৳6.99',
                category: 'Allergy',
                stock: 'In Stock',
              },
            ].map((medicine, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                <h3 className="font-semibold text-lg mb-2">{medicine.name}</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">{medicine.category}</span>
                  <span className={`text-sm font-medium ${
                    medicine.stock === 'In Stock' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {medicine.stock}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-700">{medicine.price}</span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">MediStore</h3>
              <p className="text-gray-400">
                Your trusted online pharmacy for quality medicines and healthcare products.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link href="/shop" className="text-gray-400 hover:text-white">Shop</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white">About</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Categories</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Pain Relief</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cold & Cough</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">First Aid</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Vitamins</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@medistore.com</li>
                <li>Phone: +880 1234 567890</li>
                <li>Address: Dhaka, Bangladesh</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} MediStore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}