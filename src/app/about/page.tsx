'use client';

import React from 'react';
import Image from 'next/image';
import { Shield, Truck, Users, Heart, Award, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const stats = [
    { value: '50K+', label: 'Happy Customers' },
    { value: '10K+', label: 'Medicines Available' },
    { value: '2hr', label: 'Average Delivery' },
    { value: '99%', label: 'Positive Feedbacks' }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Authenticity',
      description: 'We source all our products directly from manufacturers or authorized distributors.'
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your health and convenience is our top priority, offering 24/7 dedicated support.'
    },
    {
      icon: Truck,
      title: 'Fast Accessibility',
      description: 'Bringing healthcare to your doorstep efficiently, safely, and affordably.'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      
      {/* 1. Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-primary-900 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1600&q=80')] mix-blend-overlay bg-cover bg-center opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-white/20 backdrop-blur-md mb-6 text-white uppercase tracking-wider">
            <Award className="h-4 w-4 mr-2" /> Our Story
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Redefining Healthcare <br className="hidden md:block" /> Accessibility
          </h1>
          <p className="text-lg md:text-xl text-gray-200">
            MediStore was founded with a simple vision: to make authentic medicines accessible, affordable, and convenient for everyone in Bangladesh.
          </p>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 -mt-10 relative z-20 mx-4 max-w-6xl xl:mx-auto rounded-2xl shadow-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-6 md:px-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold text-primary-600 dark:text-primary-400 mb-2">{stat.value}</h2>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. The Mission */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80" 
                alt="Pharmacist helping patient" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary-600/10" />
            </div>
            
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                In a rapidly evolving world, accessing authentic healthcare products shouldn't be a challenge. We are building a robust digital ecosystem that bridges the gap between verified pharmacies and individuals who need crucial medications urgently.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Ensuring 100% verified, authentic medications",
                  "Promoting transparency in medicine pricing",
                  "Delivering within record time in emergencies"
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Values */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Our Core Values</h2>
            <p className="text-gray-600 dark:text-gray-400">The fundamental beliefs that guide our actions and shape our relationships with our customers.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((val, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-6 border border-primary-100 dark:border-primary-800/50">
                  <val.icon className="h-7 w-7 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{val.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA Join Us */}
      <section className="py-24">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-12 md:p-20 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1600&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Experience Better Healthcare</h2>
              <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">Join MediStore today and get your prescribed medicines delivered safely to your door.</p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register" className="px-8 py-4 bg-white text-primary-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-lg">
                  Create an Account
                </Link>
                <Link href="/shop" className="px-8 py-4 bg-transparent text-white border-2 border-white/30 hover:border-white font-bold rounded-xl transition-all text-lg flex items-center justify-center">
                  Shop Medicines <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
         </div>
      </section>

    </div>
  );
}
