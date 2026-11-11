import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  X,
  Plus,
  AlertCircle,
  Tag,
  MapPin,
  ArrowLeft,
} from 'lucide-react';
import { api } from '../api/axios';
import type { Category, ConditionType } from '../types';
import { CONDITION_LABELS } from '../utils/format';

interface PreviewFile {
  file: File;
  previewUrl: string;
}

export const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    condition: 'LIKE_NEW' as ConditionType,
    location: '',
    description: '',
  });

  const [selectedFiles, setSelectedFiles] = useState<PreviewFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

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
          if (res.data.data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              category_id: res.data.data[0].id.toString(),
            }));
          }
        }
      })
      .catch((err) => console.warn('Could not load categories:', err));
  }, []);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files);
    const validFiles: PreviewFile[] = [];

    for (const file of filesArray) {
      if (selectedFiles.length + validFiles.length >= 5) {
        alert('Maksimal 5 foto barang yang dapat diunggah.');
        break;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert(`File ${file.name} melebihi batas ukuran maksimal 2MB.`);
        continue;
      }
      validFiles.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (selectedFiles.length === 0) {
      setErrorMessage('Wajib mengunggah minimal 1 foto barang.');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category_id', formData.category_id);
      data.append('price', formData.price);
      data.append('condition', formData.condition);
      data.append('location', formData.location);
      data.append('description', formData.description);

      selectedFiles.forEach((item) => {
        data.append('images[]', item.file);
      });

      const response = await api.post('/listings', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newId = response.data?.data?.id;
      if (newId) {
        navigate(`/listings/${newId}`);
      } else {
        navigate('/profile');
      }
    } catch (err: unknown) {
      const errorData = (
        err as {
          response?: {
            data?: {
              error?: {
                message?: string;
                details?: Record<string, string[]>;
              };
            };
          };
        }
      )?.response?.data?.error;

      setErrorMessage(
        errorData?.message ||
          'Gagal memasang barang. Mohon periksa kembali isian formulir.'
      );
      if (errorData?.details) {
        setFieldErrors(errorData.details);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke LaPak.</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Jual Barang
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Lengkapi data barang dagangan Anda secara jujur dan transparan untuk sesama bapak.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Perhatian</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Upload Foto Barang */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Foto Barang <span className="text-rose-500">*</span>
              </h2>
              <p className="text-xs text-slate-500">
                Format: JPG, PNG, WEBP. Maksimal 5 foto, masing-masing maks 2MB.
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-700 rounded-md">
              {selectedFiles.length} / 5 Foto
            </span>
          </div>

          {/* Previews grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {selectedFiles.map((item, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden border border-slate-300 group bg-slate-100"
              >
                <img
                  src={item.previewUrl}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {idx === 0 && (
                  <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Sampul
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                  title="Hapus foto ini"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Upload Button */}
            {selectedFiles.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50/50 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-brand-700 transition-all cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                <span className="text-xs font-semibold">Tambah Foto</span>
              </button>
            )}
          </div>

          <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-500">
            Rp
          </span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {fieldErrors['images'] && (
            <p className="text-xs text-rose-600">{fieldErrors['images'][0]}</p>
          )}
        </div>

        {/* Card 2: Informasi Detail Barang */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h2 className="text-base font-bold text-slate-900">
            Informasi Barang
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul / Nama Barang <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Contoh: Bor Cordless Bosch GSB 120-LI Lengkap Box"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl focus:outline-hidden transition-all"
            />
            {fieldErrors.name && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.name[0]}</p>
            )}
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
                  placeholder="Contoh: 750000"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl focus:outline-hidden transition-all"
                />
              </div>
              {fieldErrors.price && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.price[0]}</p>
              )}
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
                  placeholder="Contoh: Jakarta Selatan / Bintaro"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl focus:outline-hidden transition-all"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
              {fieldErrors.location && (
                <p className="text-xs text-rose-600 mt-1">
                  {fieldErrors.location[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi Barang <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <textarea
                required
                rows={5}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Jelaskan kondisi kelengkapan, riwayat pemakaian, alasan jual, dan minus barang secara jujur..."
                className="w-full p-4 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:border-brand-500 rounded-xl focus:outline-hidden transition-all"
              />
            </div>
            {fieldErrors.description && (
              <p className="text-xs text-rose-600 mt-1">
                {fieldErrors.description[0]}
              </p>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/"
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
                <Plus className="w-4 h-4" />
                <span>Pasang Barang Sekarang</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
