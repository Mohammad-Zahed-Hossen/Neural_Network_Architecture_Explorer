'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log error to console for debugging (don't expose to users)
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center w-full bg-background mesh-gradient">
      <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Something went wrong while rendering this page
          </h2>
          <p className="text-sm text-slate-400">
            An unexpected error occurred. You can try again or return to the catalog.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#22d3ee] text-[#020617] font-bold text-sm rounded-xl hover:bg-[#06b6d4] transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900/50 border border-[#1f2937] text-slate-300 font-bold text-sm rounded-xl hover:text-white hover:bg-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}