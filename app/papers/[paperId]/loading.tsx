import React from 'react';

export default function PaperDetailsLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 bg-slate-800/80 rounded w-1/4" />

      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="h-6 bg-slate-800 rounded-full w-24" />
          <div className="h-6 bg-slate-800 rounded-full w-32" />
        </div>
        <div className="h-10 bg-slate-800 rounded-xl w-3/4" />
        <div className="h-5 bg-slate-800/60 rounded w-1/2" />
      </div>

      {/* TL;DR Skeleton */}
      <div className="h-32 bg-slate-900/80 border border-slate-800 rounded-2xl" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-48 bg-slate-900/60 rounded-2xl border border-slate-800" />
        <div className="h-48 bg-slate-900/60 rounded-2xl border border-slate-800" />
        <div className="h-48 bg-slate-900/60 rounded-2xl border border-slate-800" />
        <div className="h-48 bg-slate-900/60 rounded-2xl border border-slate-800" />
      </div>
    </div>
  );
}
