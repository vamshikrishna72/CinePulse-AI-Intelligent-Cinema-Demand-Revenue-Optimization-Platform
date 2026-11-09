import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'positive' | 'warning' | 'neutral' | 'accent';
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
}) => {
  const badgeStyles = {
    positive: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-950/60 text-amber-400 border-amber-500/30',
    neutral: 'bg-[#241018] text-[#89858C] border-[#89858C]/20',
    accent: 'bg-[#D8B46A]/15 text-[#D8B46A] border-[#D8B46A]/30',
  };

  return (
    <div className="p-5 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/15 backdrop-blur-md shadow-lg hover:border-[#D8B46A]/35 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#89858C] uppercase tracking-wider">
          {title}
        </span>
        <div className="p-2 rounded-xl bg-[#241018] text-[#D8B46A] border border-[#D8B46A]/20">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold tracking-tight text-[#F6F0E8]">
          {value}
        </div>
        {badge && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              badgeStyles[badge.variant]
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="mt-2 text-xs text-[#89858C] leading-tight">
          {subtitle}
        </div>
      )}
    </div>
  );
};

