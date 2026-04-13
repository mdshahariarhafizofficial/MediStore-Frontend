'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, BookOpen, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function BlogPage() {
  const categories = ['All', 'Health Tips', 'Medicine', 'Wellness', 'News'];

  const posts = [
    {
      id: 1,
      title: '10 Essential Vitamins to Boost Your Immunity This Winter',
      excerpt: 'Discover the most important vitamins and minerals you need to keep your immune system strong during the colder months.',
      image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=800&q=80',
      category: 'Health Tips',
      date: 'Oct 15, 2023',
      author: 'Dr. Sarah Smith',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'Understanding Generic vs. Branded Medicines',
      excerpt: 'Are generic medicines really as effective as their branded counterparts? We break down the science and facts.',
      image: 'https://images.unsplash.com/photo-1585830812416-a6c86bb14576?w=800&q=80',
      category: 'Medicine',
      date: 'Oct 12, 2023',
      author: 'Pharm. David Lee',
      readTime: '8 min read'
    },
    {
      id: 3,
      title: 'The Truth About Daily Supplements',
      excerpt: 'A comprehensive guide to understanding which daily supplements actually work and which ones are just hype.',
      image: 'https://images.unsplash.com/photo-1550572017-edb7df089e9d?w=800&q=80',
      category: 'Wellness',
      date: 'Oct 08, 2023',
      author: 'Dr. Emily Chen',
      readTime: '6 min read'
    },
    {
      id: 4,
      title: 'How to Store Medicines Safely at Home',
      excerpt: 'Proper storage is crucial for maintaining the efficacy of your medications. Learn the best practices for home storage.',
      image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=800&q=80',
      category: 'Health Tips',
      date: 'Oct 05, 2023',
      author: 'Team MediStore',
      readTime: '4 min read'
    },
    {
      id: 5,
      title: 'New Guidelines for Antibiotic Usage Released',
      excerpt: 'The World Health Organization has released updated guidelines on the proper use of antibiotics to prevent resistance.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
      category: 'News',
      date: 'Sep 28, 2023',
      author: 'Medical Board',
      readTime: '10 min read'
    },
    {
      id: 6,
      title: 'Mental Health in the Digital Age',
      excerpt: 'How excessive screen time affects our mental wellbeing and proactive steps you can take to maintain balance.',
      image: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=800&q=80',
      category: 'Wellness',
      date: 'Sep 22, 2023',
      author: 'Dr. John Davies',
      readTime: '7 min read'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 mb-6 uppercase tracking-wider">
            <BookOpen className="h-4 w-4 mr-2" /> Our Healthcare Blog
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            Insights for a Healthier You
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Expert advice, health tips, and the latest medical news curated by healthcare professionals.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((category, idx) => (
            <button
              key={idx}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${
                idx === 0 
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md' 
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Post (First one) */}
        <div className="mb-16">
          <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row group hover:shadow-xl transition-shadow duration-300">
            <div className="md:w-1/2 relative min-h-[300px] md:min-h-[400px] overflow-hidden">
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <img 
                src={posts[0].image} 
                alt={posts[0].title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent md:w-1/2" />
              <div className="absolute top-6 left-6 z-10">
                <span className="px-4 py-1.5 bg-primary-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg">
                  {posts[0].category}
                </span>
              </div>
            </div>
            
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4 gap-4 font-medium">
                <span className="flex items-center"><Calendar className="h-4 w-4 mr-1.5" />{posts[0].date}</span>
                <span className="flex items-center"><Clock className="h-4 w-4 mr-1.5" />{posts[0].readTime}</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-primary-600 transition-colors">
                {posts[0].title}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg leading-relaxed text-lg">
                {posts[0].excerpt}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{posts[0].author}</p>
                    <p className="text-xs text-gray-500">Medical Expert</p>
                  </div>
                </div>
                
                <Link href="#" className="font-bold text-primary-600 dark:text-primary-400 flex items-center hover:text-primary-800 transition-colors group/link">
                  Read More <ArrowRight className="h-4 w-4 ml-1 transform group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Regular Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(1).map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col hover:shadow-xl transition-shadow duration-300 group">
              <div className="relative h-60 overflow-hidden">
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-900 dark:text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-4 gap-4">
                  <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1" />{post.date}</span>
                  <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" />{post.readTime}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 text-sm leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{post.author}</span>
                  <button className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 flex items-center justify-center transition-colors">
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-16 text-center">
          <Button variant="outline" size="lg" className="px-10 border-gray-200 dark:border-gray-700">
            Load More Articles
          </Button>
        </div>

      </div>
    </div>
  );
}
