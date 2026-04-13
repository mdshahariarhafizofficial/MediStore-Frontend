'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, Shield, Truck, Clock, Star, CheckCircle, Users, 
  Award, Package, Mail, ChevronRight, ChevronLeft, HeartPulse, Activity
} from 'lucide-react';
import Button from '@/components/ui/Button';
import MedicineCard from '@/components/medicine/MedicineCard';
import MedicineCardSkeleton from '@/components/medicine/MedicineCardSkeleton';
import AISearchSuggest from '@/components/ui/AISearchSuggest';
import { useQuery } from '@tanstack/react-query';
import { medicineApi } from '@/lib/api/medicine';

export default function HomePage() {
  const { data: featuredMedicines, isLoading } = useQuery({
    queryKey: ['featured-medicines'],
    queryFn: () =>
      medicineApi.getAllMedicines({
        limit: 8,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = [
    {
      title: "Your Health, Our Priority",
      subtitle: "Get authentic medicines delivered safely to your doorstep. Bangladesh's most trusted online pharmacy.",
      bgImage: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1600&q=80"
    },
    {
      title: "24/7 Expert Consultation",
      subtitle: "Connect with certified medical professionals anytime, anywhere for tailored advice and prescriptions.",
      bgImage: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1600&q=80"
    },
    {
      title: "Save Up To 20% on Monthly Refills",
      subtitle: "Subscribe to your regular medications and enjoy exclusive discounts with free priority delivery.",
      bgImage: "https://images.unsplash.com/photo-1576602976047-17f1c6fe9549?w=1600&q=80"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const features = [
    { icon: Shield, title: '100% Authentic', description: 'Verified medicines from licensed manufacturers', color: 'from-blue-500 to-blue-600' },
    { icon: Truck, title: 'Fast Delivery', description: 'Same-day delivery in metro cities', color: 'from-green-500 to-green-600' },
    { icon: Clock, title: '24/7 Support', description: 'Always available for your queries', color: 'from-purple-500 to-purple-600' },
    { icon: Award, title: 'Certified Pharmacy', description: 'Government approved and licensed', color: 'from-orange-500 to-orange-600' },
  ];

  const testimonials = [
    { name: 'Dr. Sarah Johnson', role: 'Cardiologist', content: 'As a doctor, I trust MediStore for all my patients\' medication needs. Reliable and authentic.', rating: 5, avatar: 'SJ' },
    { name: 'Rahim Ahmed', role: 'Regular Customer', content: 'Been using MediStore for 2 years. Never faced any issues. Delivery is always on time.', rating: 5, avatar: 'RA' },
    { name: 'Nusrat Jahan', role: 'Working Mother', content: 'MediStore has made managing my family\'s health so much easier. Highly recommended!', rating: 5, avatar: 'NJ' },
  ];

  const categories = [
    { name: 'Pain Relief', count: '120+ Products', icon: '💊' },
    { name: 'Cold & Cough', count: '85+ Products', icon: '🤧' },
    { name: 'First Aid', count: '65+ Products', icon: '🩹' },
    { name: 'Vitamins', count: '95+ Products', icon: '🍊' },
    { name: 'Digestive', count: '75+ Products', icon: '🤢' },
    { name: 'Skin Care', count: '50+ Products', icon: '🧴' },
  ];

  const faqs = [
    { q: "How fast is your delivery?", a: "We guarantee same-day delivery for orders placed before 3 PM in metropolitan areas. Other areas take 1-2 business days." },
    { q: "Are the medicines authentic?", a: "Yes, 100%. We source all our medicines directly from authorized distributors and manufacturers." },
    { q: "Do you accept returns?", a: "Yes, you can return unopened packages within 7 days of delivery. Refer to our refund policy for more details." },
    { q: "Do I need a prescription?", a: "Prescription requirement applies to restricted drugs as per government regulations. OTC medicines can be bought without one." }
  ];

  return (
    <div className="overflow-hidden bg-white dark:bg-gray-900 transition-colors">
      {/* 1. Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div 
            key={index} 
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div className="absolute inset-0 bg-black/60 z-10" />
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.bgImage})` }}
            />
          </div>
        ))}
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-md mb-6 animate-fade-in">
            <CheckCircle className="h-4 w-4 mr-2 text-green-400" /> Trusted by 50,000+ customers
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-6 animate-slide-up">
            {heroSlides[currentSlide].title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {heroSlides[currentSlide].subtitle}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in items-center max-w-4xl mx-auto" style={{ animationDelay: '0.4s' }}>
            <div className="w-full sm:w-2/3 lg:w-3/4">
              <AISearchSuggest placeholder="Search for medicines, brands, symptoms... (AI Powered)" className="w-full" />
            </div>
            <Link href="/shop" className="w-full sm:w-auto h-full">
              <Button size="lg" className="w-full h-full min-h-[56px] sm:min-h-[60px] px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg hover:shadow-primary-600/30 transition-all font-bold text-lg whitespace-nowrap">
                Browse All
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <button 
          onClick={() => setCurrentSlide((prev) => (prev > 0 ? prev - 1 : heroSlides.length - 1))}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </section>

      {/* 2. Stats Section */}
      <section className="py-10 bg-primary-50 dark:bg-gray-800 border-b border-primary-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">10K+</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">Products</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">50K+</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">Happy Customers</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">4.9/5</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">Average Rating</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">2hr</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">Average Delivery Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose <span className="text-primary-600">MediStore</span></h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">We are committed to providing the safest and most reliable healthcare experience</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Deal of the Day / Trending Section */}
      <section className="py-16 bg-gradient-to-br from-error-500 to-orange-500 text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-8 md:mb-0 max-w-lg">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 mb-4">
              <Activity className="h-4 w-4 mr-2" /> Flash Deal
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Flat 20% OFF on all Vitamins!</h2>
            <p className="text-xl text-white/90">Boost your immunity this season with our premium selection of vitamins and supplements.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 text-center shadow-xl">
            <p className="text-sm font-medium uppercase tracking-widest text-white/80 mb-2">Offer ends in</p>
            <div className="flex gap-4 text-3xl font-bold">
              <div className="bg-white text-error-600 rounded-lg p-3 w-16">12<span className="block text-xs font-normal text-gray-500 uppercase mt-1">Hrs</span></div>
              <div className="bg-white text-error-600 rounded-lg p-3 w-16">45<span className="block text-xs font-normal text-gray-500 uppercase mt-1">Min</span></div>
              <div className="bg-white text-error-600 rounded-lg p-3 w-16">30<span className="block text-xs font-normal text-gray-500 uppercase mt-1">Sec</span></div>
            </div>
            <Link href="/shop?category=vitamins">
              <Button variant="outline" className="w-full mt-6 border-white/30 text-black hover:bg-white transition-colors">Shop Now</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Categories Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Shop by Category</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Find medicines for every condition</p>
            </div>
            <Link href="/shop">
              <Button variant="outline">View All <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Link key={index} href={`/shop?category=${category.name.toLowerCase()}`} className="group relative bg-white dark:bg-gray-900 rounded-2xl p-6 text-center shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Featured Products Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Trending Products</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Our most popular healthcare items right now</p>
          </div>
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <MedicineCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredMedicines?.data?.medicines.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredMedicines.data.medicines.map((medicine) => (
                <MedicineCard key={medicine.id} medicine={medicine} />
              ))}
            </div>
          ) : (
             <div className="text-center py-12">
               <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
               <p className="text-gray-600 dark:text-gray-400">No products available. Check back soon.</p>
             </div>
          )}
        </div>
      </section>

      {/* 7. Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Loved by Customers</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">See what our users have to say about our service</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((test, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 relative">
                <div className="absolute top-8 right-8 text-primary-100 dark:text-gray-800 text-6xl font-serif">"</div>
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(test.rating)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />)}
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic mb-8 relative z-10">{test.content}</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">{test.avatar}</div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{test.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Trust badges Section */}
      <section className="py-12 border-y border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">Trusted by Top Healthcare Providers</p>
          <div className="flex flex-wrap justify-center gap-12 sm:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Placeholders for partner logos */}
             <div className="text-xl font-bold font-serif dark:text-white">Beximco Pharma</div>
             <div className="text-xl font-bold font-serif dark:text-white">Square Meds</div>
             <div className="text-xl font-bold font-serif dark:text-white">Incepta</div>
             <div className="text-xl font-bold font-serif dark:text-white">Renata Ltd</div>
          </div>
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                 <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Newsletter / CTA Section */}
      <section className="py-24 relative overflow-hidden bg-primary-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1600&q=80')] opacity-10 bg-cover bg-center" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <HeartPulse className="h-16 w-16 mx-auto mb-6 text-primary-400" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Stay Healthy, Stay Informed</h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">Get exclusive offers, health tips, and early access to sales directly to your inbox.</p>
          <form className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="px-6 py-4 rounded-xl flex-grow text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <Button size="lg" className="px-8 whitespace-nowrap bg-white text-primary-900 hover:bg-gray-100">Subscribe Now</Button>
          </form>
          <p className="text-sm text-primary-300 mt-6">We respect your privacy. No spam, ever.</p>
        </div>
      </section>
    </div>
  );
}