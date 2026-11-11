import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Save,
  AlertCircle,
  Tag,
  MapPin,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../api/axios';
import type { Category, ConditionType, Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { CONDITION_LABELS } from '../utils/format';
import { ErrorState } from '../components/ErrorState';

export const EditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    condition: 'LIKE_NEW' as ConditionType,
    location: '',
    description: '',
  });

  const [listing, setListing] = useState<Listing | null>(null);

  // Fetch Category and Listing
  useEffect(() => {
    let isMounted = true;
    setInitialLoading(true);

    Promise.all([
      api.get('/categories'),
      api.get(`/listings/${id}`),
    ])
      .then(([catRes, listingRes]) => {
        if (!isMounted) return;

        if (catRes.data?.data) {
          setCategories(
            [...catRes.data.data].sort((a: Category, b: Category) => {
              if (a.slug === 'lainnya') return 1;
              if (b.slug === 'lainnya') return -1;
              return a.name.localeCompare(b.name, 'id');
            })
          );
        }

        const data: Listing = listingRes.data?.data;
        if (data) {
          setListing(data);
          // Check ownership
          if (user && data.seller && user.id !== data.seller.id) {
            setErrorMessage('Anda tidak memiliki hak akses untuk mengedit barang ini.');
            return;
          }

          setFormData({
            name: data.name,
            category_id: data.category?.id?.toString() || '',
            price: data.price.toString(),
            condition: data.condition,
            location: data.location,
            description: data.description,
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setErrorMessage(
          err.response?.data?.error?.message ||
            'Gagal memuat data barang.'
        );
      })
      .finally(() => {
        if (isMounted) setInitialLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, user]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      await api.put(`/listings/${id}`, {
        name: formData.name,
        category_id: formData.category_id,
        price: parseInt(formData.price, 10),
        condition: formData.condition,
        location: formData.location,
        description: formData.description,
      });

      setSuccessMessage('Informasi barang berhasil diperbarui!');
      setTimeout(() => {
        navigate(`/listings/${id}`);
      }, 1000);
    } catch (err: unknown) {
      const errorData = (
        err as {
          response?: {
            data?: {
              error?: {
                message?: string;
              };
            };
          };
        }
      )?.response?.data?.error;

      setErrorMessage(
        errorData?.message ||
          'Gagal memperbarui barang. Mohon periksa kembali isian formulir.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Memuat data barang...</p>
        </div>
      </div>
    );
  }

  if (errorMessage && !listing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <ErrorState
          title="Tidak Diizinkan"
          message={errorMessage}
          onRetry={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <Link
          to={`/listings/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Detail Barang</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Edit Informasi Barang
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Perbarui rincian, kondisi, harga, atau deskripsi barang dagangan Anda.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p>{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul / Nama Barang <span className="text-rose-500">*</span>
            </label>
            <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-500">
              Rp
            </span>
            <input
              type="text"
              required
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl focus:outline-hidden transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl focus:outline-hidden transition-all appearance-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Tag className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kondisi Barang <span className="text-rose-500">*</span>
              </label>
              <select
                required
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl focus:outline-hidden transition-all cursor-pointer"
              >
                {(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'] as ConditionType[]).map(
                  (cond) => (
                    <option key={cond} value={cond}>
                      {CONDITION_LABELS[cond]}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Harga (Rupiah) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-500">
                  Rp
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl focus:outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Lokasi / Kota COD <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl focus:outline-hidden transition-all"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi Barang <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-4 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl focus:outline-hidden transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            to={`/listings/${id}`}
            className="px-5 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-600/20 transition-all cursor-pointer flex items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
