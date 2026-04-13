import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import GlobalLayoutWrapper from '@/components/layout/GlobalLayoutWrapper';
import { Toaster } from 'react-hot-toast';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MediStore - Your Trusted Online Pharmacy',
  description: 'Get authentic medicines delivered to your doorstep. Fast, reliable, and secure online pharmacy in Bangladesh.',
  keywords: ['medicine', 'pharmacy', 'healthcare', 'online medicine', 'delivery', 'Bangladesh pharmacy'],
  authors: [{ name: 'MediStore' }],
  openGraph: {
    title: 'MediStore - Your Trusted Online Pharmacy',
    description: 'Get authentic medicines delivered safely to your doorstep. 24/7 Expert Consultation available.',
    url: 'https://medistore.com',
    siteName: 'MediStore',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MediStore - Online Pharmacy',
    description: 'Fast, reliable, and secure online pharmacy. Flat 20% off on all Vitamins.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.png",   
    shortcut: "/favicon.png",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased`}>
        <Providers>
          <GlobalLayoutWrapper>
            {children}
          </GlobalLayoutWrapper>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'dark:bg-gray-800 dark:text-white',
              style: {
                borderRadius: '0.75rem',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}