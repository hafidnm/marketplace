import React from 'react';
import { ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <Logo light />
            <p className="text-xs text-slate-400 leading-relaxed">
              Jual barang pribadi, temukan barang incaran, dan saling terhubung dalam satu komunitas.
            </p>
          </div>

          {/* Nilai utama */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Jujur & Apa Adanya</span>
            </div>
            <p className="text-xs text-slate-400">
              Kondisi barang dijelaskan transparan sesuai pemakaian harian bapak.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Langsung Kontak WA</span>
            </div>
            <p className="text-xs text-slate-400">
              Tanya jawab, nego santai, dan janjian COD langsung via WhatsApp pemilik.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              <span>Komunitas Guyub</span>
            </div>
            <p className="text-xs text-slate-400">
              Menjalin silaturahmi sesama penghobi di berbagai kota di Indonesia.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} LaPak. Lapaknya Para Bapak!</p>
          <p className="text-slate-500">Dibangun dengan React, Vite, TypeScript, Tailwind, & Laravel 11.</p>
        </div>
      </div>
    </footer>
  );
};
