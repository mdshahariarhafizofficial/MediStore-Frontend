import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full text-center">
        <div className="w-32 h-32 bg-primary-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-8 border-[8px] border-white dark:border-gray-900 shadow-xl relative z-10">
           <FileQuestion className="h-16 w-16 text-primary-500 dark:text-gray-400" />
        </div>
        
        <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Page Not Found</h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-sm mx-auto text-lg leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/">
            <Button size="lg" className="px-8 shadow-lg shadow-primary-600/20 hover:-translate-y-1 transition-transform">
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
