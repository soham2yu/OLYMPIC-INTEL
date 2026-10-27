import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'gold' | 'silver' | 'bronze' | 'blue' | 'default';
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  onClick,
}) => {
  const getTheme = () => {
    switch (variant) {
      case 'gold':
        return {
          border: 'border-yellow-500/30 hover:border-yellow-500/60',
          bg: 'bg-gradient-to-br from-yellow-500/10 via-slate-900 to-slate-900',
          iconBg: 'bg-yellow-500/20 text-yellow-400',
          accent: 'text-yellow-400',
        };
      case 'silver':
        return {
          border: 'border-slate-400/30 hover:border-slate-400/60',
          bg: 'bg-gradient-to-br from-slate-400/10 via-slate-900 to-slate-900',
          iconBg: 'bg-slate-400/20 text-slate-300',
          accent: 'text-slate-300',
        };
      case 'bronze':
        return {
          border: 'border-amber-600/30 hover:border-amber-600/60',
          bg: 'bg-gradient-to-br from-amber-600/10 via-slate-900 to-slate-900',
          iconBg: 'bg-amber-600/20 text-amber-500',
          accent: 'text-amber-500',
        };
      case 'blue':
        return {
          border: 'border-sky-500/30 hover:border-sky-500/60',
          bg: 'bg-gradient-to-br from-sky-500/10 via-slate-900 to-slate-900',
          iconBg: 'bg-sky-500/20 text-sky-400',
          accent: 'text-sky-400',
        };
      default:
        return {
          border: 'border-slate-800 hover:border-slate-700',
          bg: 'bg-slate-900/80',
          iconBg: 'bg-slate-800 text-slate-400',
          accent: 'text-slate-100',
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-5 border ${theme.border} ${theme.bg} shadow-lg backdrop-blur-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer transform hover:-translate-y-1' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{title}</p>
        <div className={`p-2.5 rounded-lg ${theme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <h3 className={`text-2xl font-bold tracking-tight ${theme.accent}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
            <span>{subtitle}</span>
          </p>
        )}
      </div>
    </div>
  );
};
