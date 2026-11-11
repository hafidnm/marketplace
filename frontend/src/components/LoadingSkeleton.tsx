import React from 'react';

export const ListingGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs animate-pulse"
        >
          <div className="w-full aspect-4/3 bg-slate-200" />
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-200 rounded-sm w-20" />
              <div className="h-4 bg-slate-200 rounded-sm w-16" />
            </div>
            <div className="h-5 bg-slate-200 rounded-sm w-4/5" />
            <div className="h-6 bg-slate-200 rounded-sm w-1/2" />
            <div className="h-4 bg-slate-200 rounded-sm w-2/3 pt-2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ListingDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <div className="w-full aspect-4/3 bg-slate-200 rounded-2xl" />
          <div className="grid grid-cols-4 gap-3">
            <div className="aspect-square bg-slate-200 rounded-lg" />
            <div className="aspect-square bg-slate-200 rounded-lg" />
            <div className="aspect-square bg-slate-200 rounded-lg" />
            <div className="aspect-square bg-slate-200 rounded-lg" />
          </div>
        </div>
        <div className="lg:col-span-5 space-y-6">
          <div className="h-6 bg-slate-200 rounded-sm w-1/3" />
          <div className="h-9 bg-slate-200 rounded-sm w-3/4" />
          <div className="h-10 bg-slate-200 rounded-sm w-1/2" />
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="h-32 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
