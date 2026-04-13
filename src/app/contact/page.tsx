'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300 pt-10 pb-24">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Contact Us</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Have questions about our medicines, your order, or just want to say hi? We're here to help you 24/7.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Left Column - Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-8 border border-gray-100 dark:border-gray-800">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Get in Touch</h3>
               
               <div className="space-y-8">
                 <div className="flex">
                   <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                     <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                   </div>
                   <div>
                     <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                     <p className="text-lg font-bold text-gray-900 dark:text-white">+880 1234 567890</p>
                     <p className="text-sm text-gray-500 mt-1">Mon-Fri from 8am to 5pm</p>
                   </div>
                 </div>

                 <div className="flex">
                   <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                     <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                   </div>
                   <div>
                     <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Email</p>
                     <p className="text-lg font-bold text-gray-900 dark:text-white">support@medistore.com</p>
                     <p className="text-sm text-gray-500 mt-1">We respond within 24 hours</p>
                   </div>
                 </div>

                 <div className="flex">
                   <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                     <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                   </div>
                   <div>
                     <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Office</p>
                     <p className="text-lg font-bold text-gray-900 dark:text-white">Banani, Dhaka</p>
                     <p className="text-sm text-gray-500 mt-1">123 Health Avenue, Block E</p>
                   </div>
                 </div>
               </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-8 text-white">
              <MessageSquare className="h-10 w-10 mb-4 text-primary-200" />
              <h3 className="text-xl font-bold mb-2">Live Chat</h3>
              <p className="text-primary-100 mb-6">Need immediate assistance? Our support agents are online and ready to help.</p>
              <button className="w-full py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                Start Chat Setup
              </button>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-8 sm:p-12 border border-gray-100 dark:border-gray-800 h-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Send us a message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                    <input required type="text" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                    <input required type="text" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400" placeholder="Doe" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <input required type="email" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400" placeholder="you@example.com" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                  <input required type="text" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400" placeholder="How can we help?" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Message</label>
                  <textarea required rows={5} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 resize-none" placeholder="Include as much detail as possible..." />
                </div>

                <Button type="submit" loading={isSubmitting} size="lg" className="w-full py-4 text-lg font-bold shadow-lg shadow-primary-600/20">
                  <Send className="h-5 w-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
