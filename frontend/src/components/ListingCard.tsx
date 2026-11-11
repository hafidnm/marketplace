import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Tag } from 'lucide-react';
import type { Listing } from '../types';
import { formatRupiah } from '../utils/format';
import { BadgeCondition } from './BadgeCondition';
import { BadgeStatus } from './BadgeStatus';

interface Props {
  listing: Listing;
}

export const ListingCard: React.FC<Props> = ({ listing }) => {
  const imageUrl =
    listing.primary_image ||
    listing.images?.[0]?.url ||
    listing.images?.[0]?.path ||
    'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80';

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-brand-400 transition-all flex flex-col"
    >
      {/* Image container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={listing.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <BadgeStatus status={listing.status} />
        </div>
        <div className="absolute top-2.5 right-2.5">
          <BadgeCondition condition={listing.condition} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {listing.category && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mb-1">
              <Tag className="w-3 h-3 text-brand-600" />
              <span>{listing.category.name}</span>
            </div>
          )}
          <h3 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-brand-700 transition-colors">
            {listing.name}
          </h3>
        </div>

        <div>
          <div className="text-lg font-extrabold text-slate-900 tracking-tight">
            {formatRupiah(listing.price)}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
