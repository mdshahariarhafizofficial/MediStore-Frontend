'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Truck, Clock, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import MedicineCard from '@/components/medicine/MedicineCard';
import { useQuery } from '@tanstack/react-query';
import { medicineApi } from '@/lib/api/medicine';

export default function HomePage() {
  const { data: featuredMedicines } = useQuery({
    queryKey: ['featured-medicines'],
    queryFn: () =>
      medicineApi.getAllMedicines({
        limit: 6,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  const features = [
    {
      icon: Shield,
      title: '100% Authentic Products',
      description: 'All medicines are sourced directly from verified manufacturers',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Same-day delivery available in major cities',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for your queries',
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: 'Multiple secure payment options including COD',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Regular Customer',
      content: 'MediStore has been a lifesaver! I get my regular medicines delivered right to my doorstep.',
      rating: 5,
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Medical Practitioner',
      content: 'I recommend MediStore to my patients. Reliable service and authentic products.',
      rating: 5,
    },
    {
      name: 'Emma Wilson',
      role: 'Working Professional',
      content: 'As someone with a busy schedule, MediStore has made managing my health so much easier.',
      rating: 5,
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Your Health, Our Priority
              </h1>
              <p className="text-xl text-primary-100">
                Get authentic medicines delivered to your doorstep. Trusted by thousands of customers across Bangladesh.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/shop">
                  <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-96 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">100% Authentic Medicines</h2>
                  <p className="text-lg">Verified by healthcare professionals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose MediStore</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We are committed to providing the best healthcare shopping experience
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 text-primary-600 rounded-full mb-4">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Medicines */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Medicines</h2>
              <p className="text-gray-600 mt-2">Our most popular healthcare products</p>
            </div>
            <Link href="/shop">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {featuredMedicines?.data?.medicines.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMedicines.data.medicines.map((medicine) => (
                <MedicineCard key={medicine.id} medicine={medicine} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400">
                <p className="text-lg">Loading medicines...</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trusted by thousands of satisfied customers across Bangladesh
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <div className="text-primary-600 font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of satisfied customers who trust MediStore for their healthcare needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}