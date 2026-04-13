'use client';

import Link from 'next/link';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-error-500" />
            
            <div className="w-20 h-20 bg-error-50 dark:bg-error-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
               <ShieldAlert className="h-10 w-10 text-error-500 dark:text-error-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">System Error</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto text-sm">
              An unexpected application error occurred. Our engineers have been notified.
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-8 text-left border border-gray-100 dark:border-gray-700">
               <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all line-clamp-3">
                 {error.message || 'Unknown runtime error.'}
                 {error.digest && <span className="block mt-1">Digest: {error.digest}</span>}
               </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={() => reset()} size="lg" className="w-full justify-center">
                Try Auto-Recovery
              </Button>
              <Link href="/">
                <Button variant="outline" size="lg" className="w-full justify-center">
                  <Home className="h-4 w-4 mr-2" />
                  Return to Homepage
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
