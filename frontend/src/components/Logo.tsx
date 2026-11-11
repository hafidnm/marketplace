import React from 'react';

interface LogoProps {
  compact?: boolean;
  light?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  compact = false,
  light = false,
  className = '',
}) => (
  <span className={`inline-flex items-center gap-2 ${className}`}>
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="Ikon LaPak"
      className="w-10 h-10 shrink-0"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7 21.5 24 10l17 11.5v16A3.5 3.5 0 0 1 37.5 41h-27A3.5 3.5 0 0 1 7 37.5v-16Z" className="fill-brand-100 stroke-brand-700" strokeWidth="2.5" />
      <path d="M5 21.5h38L39 29H9l-4-7.5Z" className="fill-brand-500 stroke-brand-700" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M12 29v12M36 29v12M19 29v12M29 29v12" className="stroke-brand-700" strokeWidth="2.5" />
    </svg>
    {!compact && (
      <span className={`font-black text-2xl tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
        La<span className="text-brand-600">Pak.</span>
      </span>
    )}
  </span>
);
