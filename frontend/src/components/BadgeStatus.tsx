import React from 'react';
import type { StatusType } from '../types';
import { STATUS_LABELS } from '../utils/format';

export const BadgeStatus: React.FC<{ status: StatusType; className?: string }> = ({
  status,
  className = '',
}) => {
  const isAvailable = status === 'AVAILABLE';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
        isAvailable
          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          : 'bg-rose-100 text-rose-800 border border-rose-200'
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
        }`}
      />
      {STATUS_LABELS[status] || status}
    </span>
  );
};
