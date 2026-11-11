import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  MessageCircle,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { api } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { PaginatedListings, PublicSeller, StatusType } from '../types';
import { formatDate } from '../utils/format';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';
import { ListingCard } from '../components/ListingCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ListingGridSkeleton } from '../components/LoadingSkeleton';

export const SellerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [seller, setSeller] = useState<PublicSeller | null>(null);
  const [listings, setListings] = useState<PaginatedListings | null>(null);
  const [status, setStatus] = useState<StatusType>('AVAILABLE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !id || (user && Number(id) === user.id)) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/users/${id}`),
      api.get(`/users/${id}/listings`, { params: { status, per_page: 12 } }),
    ])
      .then(([profileResponse, listingsResponse]) => {
        if (!mounted) return;
        setSeller(profileResponse.data?.data || null);
        setListings(listingsResponse.data?.data || null);
      })
      .catch((err) => {
        if (mounted) {
          setError(
            err.response?.data?.error?.message ||
              'Profil penjual tidak ditemukan.'
          );
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [authLoading, id, status, user]);

  if (!authLoading && user && Number(id) === user.id) {
    return <Navigate to="/profile" replace />;
  }

  const whatsappNumber = seller?.whatsapp
    ? normalizeWhatsAppNumber(seller.whatsapp)
    : '';
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Halo ${seller?.name}, saya ingin melihat barang yang Anda jual di marketplace.`
      )}`
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {loading ? (
        <>
          <div className="h-48 rounded-2xl bg-slate-200 animate-pulse" />
          <ListingGridSkeleton count={4} />
        </>
      ) : error || !seller ? (
        <div className="py-8">
          <ErrorState
            title="Profil Tidak Ditemukan"
            message={error || 'Data penjual tidak tersedia.'}
            onRetry={() => window.location.reload()}
          />
        </div>
      ) : (
        <>
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-brand-600/20">
                  {seller.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                    {seller.name}
                  </h1>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {seller.location || 'Indonesia'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Bergabung {formatDate(seller.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl"
                >
                  <MessageCircle className="w-4 h-4" />
                  Hubungi WhatsApp
                </a>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
              <Stat
                icon={<Package className="w-4 h-4" />}
                label="Total"
                value={seller.available_listings_count + seller.sold_listings_count}
              />
              <Stat icon={<ShoppingBag className="w-4 h-4" />} label="Tersedia" value={seller.available_listings_count} />
              <Stat icon={<ShoppingBag className="w-4 h-4" />} label="Terjual" value={seller.sold_listings_count} />
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-900">Barang {seller.name}</h2>
              <div className="flex rounded-xl bg-slate-100 p-1">
                {(['AVAILABLE', 'SOLD'] as StatusType[]).map((value) => (
                  <button
                    key={value}
                    onClick={() => setStatus(value)}
                    className={`px-3 py-2 text-xs font-bold rounded-lg ${
                      status === value ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    {value === 'AVAILABLE' ? 'Tersedia' : 'Terjual'}
                  </button>
                ))}
              </div>
            </div>
            {!listings || listings.data.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8">
                <EmptyState
                  title={`Belum ada barang ${status === 'AVAILABLE' ? 'tersedia' : 'terjual'}`}
                  description="Belum ada listing pada kategori ini."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {listings.data.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({
  icon,
  label,
  value,
}) => (
  <div className="text-center">
    <div className="flex justify-center text-brand-600">{icon}</div>
    <div className="text-lg font-black text-slate-900 mt-1">{value}</div>
    <div className="text-[11px] text-slate-500">{label}</div>
  </div>
);
