import React from 'react';
import { BookX, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PaperNotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl">
        <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
          <BookX className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-100">Paper Specification Not Found</h2>
          <p className="text-xs text-slate-400">
            The requested paper ID does not exist in the canonical knowledge base registry yet.
          </p>
        </div>
        <div>
          <Link
            href="/papers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Research Papers Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
