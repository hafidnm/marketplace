import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Tag,
  Calendar,
  MessageCircle,
  ShieldCheck,
  Edit,
  User as UserIcon,
} from 'lucide-react';
import { api } from '../api/axios';
import type { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatRupiah, formatDate } from '../utils/format';
import { generateWhatsAppLink } from '../utils/whatsapp';
import { BadgeCondition } from '../components/BadgeCondition';
import { BadgeStatus } from '../components/BadgeStatus';
import { ListingDetailSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    api
      .get(`/listings/${id}`)
      .then((res) => {
        if (isMounted) {
          setListing(res.data?.data || null);
          setSelectedImageIndex(0);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err.response?.data?.error?.message ||
              'Barang tidak ditemukan atau telah dihapus.'
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <ListingDetailSkeleton />;
  }

  if (error || !listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState
          title="Barang Tidak Ditemukan"
          message={error || 'Data barang tidak tersedia.'}
          onRetry={() => navigate('/')}
        />
      </div>
    );
  }

  // Gallery images collection
  const allImages =
    listing.images && listing.images.length > 0
      ? listing.images.map((img) => img.url || img.path)
      : [
          listing.primary_image ||
            'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&auto=format&fit=crop&q=80',
        ];

  const activeImage = allImages[selectedImageIndex] || allImages[0];
  const isOwner = user && listing.seller && user.id === listing.seller.id;
  const isSold = listing.status === 'SOLD';

  const waLink = listing.seller?.whatsapp
    ? generateWhatsAppLink(
        listing.seller.whatsapp,
        listing.name,
        listing.price
      )
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Katalog</span>
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Photo Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Big Image */}
          <div className="relative aspect-4/3 w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center">
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="w-full h-full cursor-zoom-in"
              aria-label="Lihat gambar lebih besar"
            >
              <img
                src={activeImage}
                alt={listing.name}
                className="w-full h-full object-contain sm:object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&auto=format&fit=crop&q=80';
                }}
              />
            </button>
            {/* Status overlay badge */}
            <div className="absolute top-4 left-4 flex gap-2">
              <BadgeStatus status={listing.status} className="shadow-md" />
              <BadgeCondition condition={listing.condition} className="shadow-md" />
            </div>
          </div>

          {/* Thumbnails row */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImageIndex(idx);
                  }}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-100 ${
                    selectedImageIndex === idx
                      ? 'border-brand-500 shadow-md ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

          )}

          {lightboxOpen && (
            <div
              className="fixed inset-0 z-50 bg-slate-950/95 p-4 sm:p-8 flex items-center justify-center"
              role="dialog"
              aria-modal="true"
              aria-label="Detail gambar barang"
              onClick={() => setLightboxOpen(false)}
            >
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 text-white hover:text-brand-300 text-3xl leading-none"
                aria-label="Tutup gambar"
              >
                ×
              </button>
              <img
                src={activeImage}
                alt={listing.name}
                className="max-h-full max-w-full object-contain"
                onClick={(event) => event.stopPropagation()}
              />
            </div>
          )}

          {/* Description Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">Deskripsi Barang</h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </div>
          </div>
        </div>

        {/* Right Column: Key Details & Seller Action */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Pricing & Title */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            {listing.category && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 w-fit px-2.5 py-1 rounded-md border border-brand-200">
                <Tag className="w-3.5 h-3.5" />
                <span>{listing.category.name}</span>
              </div>
            )}

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {listing.name}
              </h1>
              <div className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
                {formatRupiah(listing.price)}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Lokasi Barang
                  </div>
                  <div className="font-bold text-slate-800 truncate">
                    {listing.location}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Dipasang Pada
                  </div>
                  <div className="font-bold text-slate-800">
                    {formatDate(listing.created_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Owner action or Buyer WhatsApp CTA */}
            <div className="pt-4 border-t border-slate-100">
              {isOwner ? (
                <div className="space-y-3">
                  <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-xs text-brand-800 font-medium">
                    Ini adalah barang jualan Anda. Anda dapat memperbarui informasi atau mengubah status.
                  </div>
                  <Link
                    to={`/listings/${listing.id}/edit`}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Informasi Barang</span>
                  </Link>
                </div>
              ) : isSold ? (
                <div className="space-y-2">
                  <button
                    disabled
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-200 text-slate-400 font-bold text-sm rounded-xl cursor-not-allowed"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Barang Sudah Terjual (Sold Out)</span>
                  </button>
                  <p className="text-center text-xs text-slate-400">
                    Penjual telah menandai barang ini laku. Tombol kontak WhatsApp dinonaktifkan.
                  </p>
                </div>
              ) : waLink ? (
                <div className="space-y-2">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Hubungi Penjual via WhatsApp</span>
                  </a>
                  <p className="text-center text-[11px] text-slate-500">
                    Membuka obrolan WhatsApp dengan pesan otomatis & harga barang.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-500 text-center">
                  Penjual belum menyertakan nomor WhatsApp.
                </div>
              )}
            </div>
          </div>

          {/* Seller Profile Card */}
          {listing.seller && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Informasi Penjual
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    <Link
                      to={`/penjual/${listing.seller.id}`}
                      className="hover:text-brand-700 transition-colors"
                    >
                      {listing.seller.name}
                    </Link>
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{listing.seller.location || 'Indonesia'}</span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Anggota Komunitas Terverifikasi</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
