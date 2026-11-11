import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Package,
} from 'lucide-react';
import { api } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { Listing, PaginatedListings } from '../types';
import { formatRupiah, formatDate } from '../utils/format';
import { BadgeStatus } from '../components/BadgeStatus';
import { BadgeCondition } from '../components/BadgeCondition';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ListingGridSkeleton } from '../components/LoadingSkeleton';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [listingsData, setListingsData] = useState<PaginatedListings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status toggle & delete state
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [deleteModalListing, setDeleteModalListing] = useState<Listing | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUserListings = () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    api
      .get(`/users/${user.id}/listings`)
      .then((res) => {
        setListingsData(res.data?.data || null);
      })
      .catch((err) => {
        setError(
          err.response?.data?.error?.message ||
            'Gagal memuat daftar listing Anda.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserListings();
  }, [user]);

  // Toggle status AVAILABLE <-> SOLD
  const handleToggleStatus = async (listing: Listing) => {
    const nextStatus = listing.status === 'AVAILABLE' ? 'SOLD' : 'AVAILABLE';
    setActionLoadingId(listing.id);

    try {
      await api.patch(`/listings/${listing.id}/status`, {
        status: nextStatus,
      });

      // Update state locally
      setListingsData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.map((item) =>
            item.id === listing.id ? { ...item, status: nextStatus } : item
          ),
        };
      });
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || 'Gagal mengubah status barang.'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteModalListing) return;
    setDeleteLoading(true);

    try {
      await api.delete(`/listings/${deleteModalListing.id}`);
      setListingsData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.filter((item) => item.id !== deleteModalListing.id),
          meta: {
            ...prev.meta,
            total: Math.max(0, prev.meta.total - 1),
          },
        };
      });
      setDeleteModalListing(null);
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || 'Gagal menghapus barang.'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Info Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-brand-600/20">
              {user?.name?.charAt(0).toUpperCase() || <UserIcon className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {user?.name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Penjual
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user?.email}
                </span>
                {user?.whatsapp && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {user.whatsapp}
                  </span>
                )}
                {user?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {user.location}
                  </span>
                )}
                {user?.created_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Bergabung {formatDate(user.created_at)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            to="/listings/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Pasang Barang Baru</span>
          </Link>
        </div>
      </div>

      {/* Own Listings Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-600" />
              <span>Kelola Daftar Barang Saya</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ubah status barang laku, edit spesifikasi harga, atau hapus listing.
            </p>
          </div>
          {listingsData && (
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              Total {listingsData.data.length} Barang
            </span>
          )}
        </div>

        {loading ? (
          <ListingGridSkeleton count={4} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchUserListings} />
        ) : !listingsData || listingsData.data.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <EmptyState
              title="Anda belum memasang barang dagangan"
              description="Punya bor, reel pancing, sparepart motor, atau koleksi barang hobi bapak yang tidak terpakai? Pasang sekarang!"
              actionText="Pasang Barang Pertama"
              onAction={() => window.location.assign('/listings/create')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listingsData.data.map((listing: Listing) => {
              const isActionLoading = actionLoadingId === listing.id;
              const isSold = listing.status === 'SOLD';
              const thumbUrl =
                listing.primary_image ||
                listing.images?.[0]?.url ||
                listing.images?.[0]?.path ||
                'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80';

              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  {/* Top Preview */}
                  <div>
                    <div className="relative aspect-16/9 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={thumbUrl}
                        alt={listing.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <BadgeStatus status={listing.status} />
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        <BadgeCondition condition={listing.condition} />
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <Link
                        to={`/listings/${listing.id}`}
                        className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-brand-700 transition-colors"
                      >
                        {listing.name}
                      </Link>
                      <div className="text-base font-black text-slate-900">
                        {formatRupiah(listing.price)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{listing.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Toggle Status Button */}
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => handleToggleStatus(listing)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isSold
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                      title={isSold ? 'Tandai kembali Tersedia' : 'Tandai sudah Terjual'}
                    >
                      {isActionLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                      ) : isSold ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Set Tersedia</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-slate-500" />
                          <span>Set Terjual</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      {/* Edit */}
                      <Link
                        to={`/listings/${listing.id}/edit`}
                        className="p-2 text-slate-600 hover:text-brand-700 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                        title="Edit rincian barang"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setDeleteModalListing(listing)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                        title="Hapus listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteModalListing}
        title="Hapus Barang Ini?"
        message={`Apakah Anda yakin ingin menghapus "${deleteModalListing?.name}"? Tindakan ini tidak dapat dibatalkan dan foto barang akan dihapus.`}
        confirmText="Ya, Hapus Barang"
        cancelText="Batal"
        isDangerous={true}
        isLoading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalListing(null)}
      />
    </div>
  );
};
