import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<Props> = ({
  title = 'Gagal memuat data',
  message = 'Terjadi kendala saat menghubungi server. Pastikan server backend sedang aktif.',
  onRetry,
}) => {
  return (
    <div className="py-12 px-4 text-center max-w-md mx-auto">
      <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-rose-200">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Coba Lagi
        </button>
      )}
    </div>
  );
};
