import React from 'react';

interface OccupancyGaugeProps {
  percentage: number;
  tickets: number;
  capacity: number;
  category: 'Low Demand' | 'Moderate Demand' | 'High Demand' | string;
}

export const OccupancyGauge: React.FC<OccupancyGaugeProps> = ({
  percentage,
  tickets,
  capacity,
  category,
}) => {
  const getCategoryTheme = () => {
    if (category === 'High Demand') {
      return {
        bg: 'bg-[#B66B7B]/20',
        text: 'text-[#f7a8b8]',
        border: 'border-[#B66B7B]/40',
        bar: 'bg-gradient-to-r from-[#D8B46A] to-[#B66B7B]',
      };
    } else if (category === 'Moderate Demand') {
      return {
        bg: 'bg-[#D8B46A]/20',
        text: 'text-[#D8B46A]',
        border: 'border-[#D8B46A]/40',
        bar: 'bg-gradient-to-r from-[#D8B46A] to-[#F4E2BD]',
      };
    } else {
      return {
        bg: 'bg-[#89858C]/20',
        text: 'text-[#c9c7cb]',
        border: 'border-[#89858C]/40',
        bar: 'bg-[#89858C]',
      };
    }
  };

  const theme = getCategoryTheme();
  const clampedPct = Math.min(100, Math.max(0, percentage));

  return (
    <div className="p-4 rounded-xl bg-[#17171D]/60 border border-[#D8B46A]/15">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#89858C] uppercase tracking-wider font-medium">
          Screen Occupancy
        </span>
        <span
          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${theme.bg} ${theme.text} ${theme.border}`}
        >
          {category}
        </span>
      </div>

      <div className="flex items-baseline space-x-2 my-1">
        <span className="text-3xl font-extrabold text-[#F6F0E8]">{percentage}%</span>
        <span className="text-xs text-[#89858C]">
          ({tickets} / {capacity} seats booked)
        </span>
      </div>

      {/* Progress Bar with markers */}
      <div className="relative w-full h-3 bg-[#241018] rounded-full overflow-hidden mt-3 border border-[#D8B46A]/20">
        <div
          className={`h-full transition-all duration-500 rounded-full ${theme.bar}`}
          style={{ width: `${clampedPct}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-[#89858C] mt-1.5 px-0.5">
        <span>0%</span>
        <span>Low &lt;40%</span>
        <span>Mod 40-75%</span>
        <span>High &gt;75%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

