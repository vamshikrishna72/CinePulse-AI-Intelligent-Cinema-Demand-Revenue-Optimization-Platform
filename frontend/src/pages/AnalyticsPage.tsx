import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { apiService } from '../services/api';
import { DemandAnalyticsResponse } from '../types/api';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<DemandAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getDemandAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#D8B46A] border-t-transparent animate-spin"></div>
        <p className="text-sm text-[#89858C]">Aggregating operational multiplex analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-8 rounded-2xl bg-[#241018]/50 border border-red-500/30 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="text-lg font-bold text-[#F6F0E8]">Analytics Unavailable</h3>
        <p className="text-sm text-[#89858C] max-w-md mx-auto">{error}</p>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 bg-[#D8B46A] text-[#17171D] font-semibold text-xs rounded-xl hover:bg-[#F4E2BD] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#D8B46A]/15 text-[#D8B46A] text-xs font-semibold border border-[#D8B46A]/30">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Operational Analytics & Trends</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#F6F0E8] mt-1">
          Cinema Demand Intelligence & Historical Analytics
        </h1>
        <p className="text-xs text-[#89858C] max-w-2xl mt-0.5">
          Longitudinal demand tracking, time-of-day occupancy elasticity, and genre performance benchmarks.
        </p>
      </div>

      {/* Chart 1: Daily Demand Trend Area Chart */}
      <div className="p-5 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/15 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#F6F0E8] uppercase tracking-wider">
              Daily Admissions: Actual vs Model Forecast
            </h3>
            <p className="text-[11px] text-[#89858C]">
              Aggregated daily ticket sales across all auditoriums during test horizon
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center space-x-1.5 text-[#F6F0E8]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D8B46A]"></span>
              <span>Predicted</span>
            </span>
            <span className="flex items-center space-x-1.5 text-[#89858C]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B66B7B]"></span>
              <span>Actuals</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.daily_trends}>
              <defs>
                <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D8B46A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#D8B46A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B66B7B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#B66B7B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#241018" />
              <XAxis dataKey="show_date" stroke="#89858C" fontSize={10} />
              <YAxis stroke="#89858C" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#17171D',
                  borderColor: 'rgba(216, 180, 106, 0.3)',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                }}
              />
              <Area
                type="monotone"
                dataKey="predicted_tickets"
                stroke="#D8B46A"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPred)"
                name="Forecast Tickets"
              />
              <Area
                type="monotone"
                dataKey="actual_tickets"
                stroke="#B66B7B"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorAct)"
                name="Actual Tickets"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: 2 Charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Weekday vs Weekend by Showtime Period */}
        <div className="p-5 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/15 backdrop-blur-md space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#F6F0E8] uppercase tracking-wider">
              Time-of-Day Occupancy: Weekday vs Weekend
            </h3>
            <p className="text-[11px] text-[#89858C]">
              Shows significant weekend prime surge (+35% occupancy uplift in evening slots)
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.time_of_day_patterns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#241018" />
                <XAxis dataKey="period" stroke="#89858C" fontSize={11} />
                <YAxis unit="%" stroke="#89858C" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#17171D',
                    borderColor: 'rgba(216, 180, 106, 0.3)',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="weekday_occupancy"
                  name="Weekday Occupancy %"
                  fill="#89858C"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="weekend_occupancy"
                  name="Weekend Occupancy %"
                  fill="#D8B46A"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Genre Demand Performance */}
        <div className="p-5 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/15 backdrop-blur-md space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#F6F0E8] uppercase tracking-wider">
              Genre Occupancy &amp; Pricing Elasticity
            </h3>
            <p className="text-[11px] text-[#89858C]">
              Animation and Sci-Fi lead occupancy; Drama shows lower weekday sensitivity
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.genre_performance}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#241018" />
                <XAxis type="number" unit="%" stroke="#89858C" fontSize={11} domain={[0, 100]} />
                <YAxis dataKey="genre" type="category" stroke="#89858C" fontSize={11} width={75} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#17171D',
                    borderColor: 'rgba(216, 180, 106, 0.3)',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
                <Bar
                  dataKey="avg_occupancy"
                  name="Mean Occupancy %"
                  fill="#B66B7B"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Genre Summary Table */}
      <div className="p-5 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/15 backdrop-blur-md space-y-3">
        <h3 className="text-sm font-bold text-[#F6F0E8] uppercase tracking-wider">
          Genre Demand Matrix Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D8B46A]/15 text-[#89858C] uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Genre</th>
                <th className="py-2.5 px-3 text-right">Shows Count</th>
                <th className="py-2.5 px-3 text-right">Avg Occupancy %</th>
                <th className="py-2.5 px-3 text-right">Total Admissions</th>
                <th className="py-2.5 px-3 text-right">Avg Ticket Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8B46A]/10 text-[#F6F0E8]">
              {analytics.genre_performance.map((g) => (
                <tr key={g.genre} className="hover:bg-[#241018]/40">
                  <td className="py-2.5 px-3 font-semibold text-[#F6F0E8]">{g.genre}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#89858C]">{g.shows_count}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#D8B46A]">{g.avg_occupancy}%</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#F6F0E8]">{g.total_tickets.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#89858C]">₹{g.avg_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
