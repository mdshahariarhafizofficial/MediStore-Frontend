'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Truck, Clock, Star, CheckCircle, Users, Award, Package } from 'lucide-react';
import Button from '@/components/ui/Button';
import MedicineCard from '@/components/medicine/MedicineCard';
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

  const features = [
    {
      icon: Shield,
      title: '100% Authentic',
      description: 'Verified medicines from licensed manufacturers',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Same-day delivery in metro cities',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Always available for your queries',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Award,
      title: 'Certified Pharmacy',
      description: 'Government approved and licensed',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Cardiologist',
      content: 'As a doctor, I trust MediStore for all my patients\' medication needs. Reliable and authentic.',
      rating: 5,
      avatar: 'SJ',
    },
    {
      name: 'Rahim Ahmed',
      role: 'Regular Customer',
      content: 'Been using MediStore for 2 years. Never faced any issues. Delivery is always on time.',
      rating: 5,
      avatar: 'RA',
    },
    {
      name: 'Nusrat Jahan',
      role: 'Working Mother',
      content: 'MediStore has made managing my family\'s health so much easier. Highly recommended!',
      rating: 5,
      avatar: 'NJ',
    },
  ];

  const categories = [
    { name: 'Pain Relief', count: '120+ Products', icon: '💊' },
    { name: 'Cold & Cough', count: '85+ Products', icon: '🤧' },
    { name: 'First Aid', count: '65+ Products', icon: '🩹' },
    { name: 'Vitamins', count: '95+ Products', icon: '🍊' },
    { name: 'Digestive', count: '75+ Products', icon: '🤢' },
    { name: 'Skin Care', count: '50+ Products', icon: '🧴' },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
    <section className="relative gradient-bg text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm mb-4">
                <CheckCircle className="h-4 w-4 mr-1" />
                Trusted by 50,000+ customers
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Your Health,
                <span className="block text-white/90">Our Priority</span>
              </h1>
              <p className="text-xl text-white/80 mt-6 max-w-2xl">
                Get authentic medicines delivered safely to your doorstep. Bangladesh's most trusted online pharmacy.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop">
                <Button 
                  size="lg" 
                  className="bg-white text-primary-700 hover:bg-gray-100 px-8"
                >
                  Shop Medicines
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/register">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white/30 text-white hover:bg-white/10 px-8"
                >
                  Create Account
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <p className="text-3xl font-bold">10K+</p>
                <p className="text-sm text-white/70">Medicines</p>
              </div>
              <div>
                <p className="text-3xl font-bold">50K+</p>
                <p className="text-sm text-white/70">Happy Customers</p>
              </div>
              <div>
                <p className="text-3xl font-bold">24/7</p>
                <p className="text-sm text-white/70">Support</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-[4/3] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 bg-white/20 rounded-full mb-6">
                    <Package className="h-16 w-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">MediStore Pharmacy</h3>
                  <p className="text-white/80">Authentic Medicines</p>
                  <p className="text-white/80">Fast Delivery</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Fast Delivery</p>
                  <p className="text-sm text-gray-600">Within 2-4 hours</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">100% Secure</p>
                  <p className="text-sm text-gray-600">Safe & Authentic</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-gradient">MediStore</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We are committed to providing the safest and most reliable healthcare experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-2xl p-6 shadow-soft hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-100"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
              <p className="text-gray-600 mt-2">Find medicines for every need</p>
            </div>
            <Link href="/shop">
              <Button variant="outline">
                View All Categories
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/shop?category=${category.name.toLowerCase()}`}
                className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-primary-200 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl mb-3">{category.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{category.count}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Medicines */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Medicines</h2>
              <p className="text-gray-600 mt-2">Our most trusted healthcare products</p>
            </div>
            <Link href="/shop">
              <Button variant="outline">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 rounded-xl p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines available</h3>
              <p className="text-gray-600">Check back soon for updates</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Our Customers
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied customers who trust us with their health
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-6 text-gray-500">
              <Users className="h-6 w-6" />
              <span className="text-sm">50,000+ happy customers and counting</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <Shield className="h-4 w-4 mr-2" />
            <span className="text-sm">Trusted & Secure</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience Hassle-Free Healthcare?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join Bangladesh's fastest growing online pharmacy. Get started in just 2 minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100 px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8">
                Browse Medicines
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-primary-200">
            <p>✅ No hidden fees • ✅ Free delivery on first order • ✅ 24/7 support</p>
          </div>
        </div>
      </section>
    </div>
  );
}