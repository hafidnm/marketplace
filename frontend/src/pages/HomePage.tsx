import React, { useEffect, useState, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api/axios';
import type { Category, ConditionType, Listing, PaginatedListings } from '../types';
import { ListingCard } from '../components/ListingCard';
import { ListingGridSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { CONDITION_LABELS } from '../utils/format';

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();

  // URL query params as state
  const qParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category_id') || '';
  const conditionParam = (searchParams.get('condition') as ConditionType) || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(qParam);
  const [categories, setCategories] = useState<Category[]>([]);
  const [listingsData, setListingsData] = useState<PaginatedListings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync search input if query param changes from Navbar
  useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

  // 1. Fetch Categories once
  useEffect(() => {
    api
      .get('/categories')
      .then((res) => {
        if (res.data?.data) {
          setCategories(
            [...res.data.data].sort((a: Category, b: Category) => {
              if (a.slug === 'lainnya') return 1;
              if (b.slug === 'lainnya') return -1;
              return a.name.localeCompare(b.name, 'id');
            })
          );
        }
      })
      .catch((err) => console.warn('Could not load categories:', err));
  }, []);

  // 2. Fetch Listings when params change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const params: Record<string, string> = {
      page: pageParam.toString(),
    };
    if (qParam) params.q = qParam;
    if (categoryParam) params.category_id = categoryParam;
    if (conditionParam) params.condition = conditionParam;

    api
      .get('/listings', { params })
      .then((res) => {
        if (isMounted) {
          setListingsData(res.data?.data || null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err.response?.data?.error?.message ||
              'Gagal memuat katalog barang. Pastikan server backend aktif.'
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
  }, [qParam, categoryParam, conditionParam, pageParam]);

  // Update URL Search Params helper
  const updateFilters = (newParams: Record<string, string | null>) => {
    startTransition(() => {
      const next = new URLSearchParams(searchParams);
      Object.entries(newParams).forEach(([key, val]) => {
        if (!val) {
          next.delete(key);
        } else {
          next.set(key, val);
        }
      });
      // Reset page to 1 on filter changes (unless page was explicitly updated)
      if (!newParams.page) {
        next.set('page', '1');
      }
      setSearchParams(next);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchInput.trim() || null });
  };

  const handleCategorySelect = (categoryId: string) => {
    const nextVal = categoryParam === categoryId ? null : categoryId;
    updateFilters({ category_id: nextVal });
  };

  const handleConditionSelect = (condition: string) => {
    const nextVal = conditionParam === condition ? null : condition;
    updateFilters({ condition: nextVal });
  };

  const resetAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = !!(qParam || categoryParam || conditionParam);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner Komunitas */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 rounded-2xl p-6 sm:p-10 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
            LaPak. - Lapaknya Para Bapak!
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Jual dan Temukan Barang Incaran di LaPak.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Jual barang pribadi, temukan barang incaran, dan saling terhubung dalam satu komunitas.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama barang atau deskripsi..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-300 focus:border-brand-500 rounded-xl focus:outline-hidden transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateFilters({ q: null });
                }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer shrink-0"
          >
            Cari
          </button>
        </form>

        {/* Filter categories pills */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-brand-600" />
            <span>Kategori Barang</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategorySelect('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !categoryParam
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id.toString())}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  categoryParam === cat.id.toString()
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{cat.name}</span>
                {typeof cat.listings_count === 'number' && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      categoryParam === cat.id.toString()
                        ? 'bg-brand-700 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat.listings_count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filter condition pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mr-1">
              Kondisi:
            </span>
            <button
              onClick={() => handleConditionSelect('')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                !conditionParam
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Semua
            </button>
            {(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'] as ConditionType[]).map((cond) => (
              <button
                key={cond}
                onClick={() => handleConditionSelect(cond)}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                  conditionParam === cond
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {CONDITION_LABELS[cond]}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Listings Grid / States */}
      <div>
        {loading ? (
          <ListingGridSkeleton count={8} />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => updateFilters({ page: pageParam.toString() })}
          />
        ) : !listingsData || listingsData.data.length === 0 ? (
          <EmptyState
            title="Tidak ada barang yang cocok"
            description="Tidak ditemukan barang untuk pencarian atau filter saat ini. Coba gunakan kata kunci umum atau reset filter."
            actionText={hasActiveFilters ? 'Reset Filter' : undefined}
            onAction={resetAllFilters}
          />
        ) : (
          <div className="space-y-8">
            {/* Header info */}
            <div className="flex justify-between items-center text-sm text-slate-500">
              <p>
                Menampilkan{' '}
                <span className="font-bold text-slate-800">
                  {listingsData.data.length}
                </span>{' '}
                dari{' '}
                <span className="font-bold text-slate-800">
                  {listingsData.meta.total}
                </span>{' '}
                barang tersedia
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {listingsData.data.map((listing: Listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {/* Pagination */}
            {listingsData.meta.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={pageParam <= 1}
                  onClick={() =>
                    updateFilters({ page: Math.max(1, pageParam - 1).toString() })
                  }
                  className="px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-slate-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </button>

                <div className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-slate-800">
                  Halaman {listingsData.meta.current_page} dari{' '}
                  {listingsData.meta.last_page}
                </div>

                <button
                  disabled={pageParam >= listingsData.meta.last_page}
                  onClick={() =>
                    updateFilters({
                      page: Math.min(
                        listingsData.meta.last_page,
                        pageParam + 1
                      ).toString(),
                    })
                  }
                  className="px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-slate-700 transition-colors"
                >
                  Berikutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
