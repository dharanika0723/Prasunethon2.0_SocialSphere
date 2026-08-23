import type { ReactNode } from 'react';
import { avatarColor, getInitials } from '@/lib/utils';

export function Avatar({
  name,
  src,
  size = 'md',
  className = '',
}: {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ${sizes[size]} ${className}`}
      />
    );
  }
  return (
    <div className={`rounded-full flex items-center justify-center font-semibold text-white shrink-0 ${avatarColor(name)} ${sizes[size]} ${className}`}>
      {getInitials(name)}
    </div>
  );
}

export function Badge({
  children,
  color = 'primary',
  className = '',
}: {
  children: ReactNode;
  color?: 'primary' | 'secondary' | 'accent' | 'gray' | 'red' | 'blue' | 'green' | 'amber';
  className?: string;
}) {
  const colors = {
    primary: 'bg-primary-100 text-primary-700',
    secondary: 'bg-secondary-100 text-secondary-700',
    accent: 'bg-accent-100 text-accent-700',
    gray: 'bg-gray-100 text-gray-600',
    red: 'bg-error-50 text-error-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-secondary-50 text-secondary-700',
    amber: 'bg-accent-50 text-accent-700',
  };
  return (
    <span className={`badge ${colors[color]} ${className}`}>{children}</span>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color = 'primary',
}: {
  icon: typeof import('lucide-react').Users;
  label: string;
  value: string | number;
  trend?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'error';
}) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    accent: 'bg-accent-50 text-accent-600',
    error: 'bg-error-50 text-error-600',
  };
  return (
    <div className="card p-5 hover:shadow-soft transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-secondary-600 bg-secondary-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof import('lucide-react').Users;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-ink mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

export function LoadingState({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-500 mt-3">{text}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-5">
      <div className="flex gap-3 mb-4">
        <div className="skeleton w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
      <div className="skeleton h-3 w-full mb-2" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  color = '#2563eb',
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{label}</div>
    </div>
  );
}

export function ProgressBar({
  value,
  max = 100,
  color = 'primary',
}: {
  value: number;
  max?: number;
  color?: 'primary' | 'secondary' | 'accent' | 'error';
}) {
  const pct = Math.min((value / max) * 100, 100);
  const colors = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-500',
    accent: 'bg-accent-500',
    error: 'bg-error-500',
  };
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${colors[color]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
