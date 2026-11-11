import React from 'react';
import type { ConditionType } from '../types';
import { CONDITION_LABELS } from '../utils/format';

interface Props {
  condition: ConditionType;
  className?: string;
}

export const BadgeCondition: React.FC<Props> = ({ condition, className = '' }) => {
  const styles: Record<ConditionType, string> = {
    NEW: 'bg-blue-50 text-blue-700 border-blue-200',
    LIKE_NEW: 'bg-teal-50 text-teal-700 border-teal-200',
    GOOD: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    FAIR: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
        styles[condition] || 'bg-slate-100 text-slate-700 border-slate-200'
      } ${className}`}
    >
      {CONDITION_LABELS[condition] || condition}
    </span>
  );
};
