import React, { useEffect, useState } from 'react';
import {
  Film,
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { apiService } from '../services/api';
import { DashboardSummary } from '../types/api';

interface DashboardPageProps {
  onNavigate: (tab: any) => void;
  onSelectShowForForecast?: (show: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectShowForForecast,
}) => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScreen, setSelectedScreen] = useState('ALL');
  const [selectedDemand, setSelectedDemand] = useState('ALL');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await apiService.getDashboardSummary();
      setData(summary);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
    }
  };

  // Filter shows in live table
  const filteredShows = (data?.recent_shows || []).filter((show: any) => {
    const matchesSearch =
      show.movie_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      show.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      show.show_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScreen =
      selectedScreen === 'ALL' || show.screen_id === selectedScreen;
    const matchesDemand =
      selectedDemand === 'ALL' || show.demand_category === selectedDemand;
    return matchesSearch && matchesScreen && matchesDemand;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#D8B46A] border-t-transparent animate-spin"></div>
        <p className="text-sm text-[#89858C]">Loading multiplex control center data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-[#241018]/50 border border-red-500/30 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="text-lg font-bold text-[#F6F0E8]">Backend Connection Required</h3>
        <p className="text-sm text-[#89858C] max-w-md mx-auto">{error}</p>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-[#D8B46A] text-[#17171D] font-semibold text-xs rounded-xl hover:bg-[#F4E2BD] transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Context Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#241018] via-[#241018]/80 to-[#17171D] border border-[#D8B46A]/25 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#D8B46A]/15 text-[#D8B46A] text-xs font-semibold border border-[#D8B46A]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cinema Demand Intelligence Active</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#F6F0E8]">
              Multiplex Control Center
            </h1>
            <p className="text-xs lg:text-sm text-[#89858C] max-w-2xl">
              Real-time show-level attendance forecasting and revenue optimization across 4 multiplex auditoriums. All predictions evaluate at T-24h forecast horizon.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('forecast')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D8B46A] to-[#F4E2BD] text-[#17171D] font-bold text-xs flex items-center space-x-2 shadow-lg shadow-[#D8B46A]/15 hover:opacity-95 transition-all"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Run Show Forecast</span>
            </button>
            <button
              onClick={() => onNavigate('simulator')}
              className="px-4 py-2.5 rounded-xl bg-[#241018] text-[#F6F0E8] font-semibold text-xs border border-[#D8B46A]/30 flex items-center space-x-2 hover:border-[#D8B46A]/60 transition-all"
            >
              <ArrowUpRight className="w-4 h-4 text-[#D8B46A]" />
              <span>What-If Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monitored Shows"
          value={data.total_shows.toLocaleString()}
          subtitle={`Screening window: ${data.date_range.start} to ${data.date_range.end}`}
          icon={Film}
          badge={{ text: 'Chronological Test Split', variant: 'accent' }}
        />
        <MetricCard
          title="Projected Admissions"
          value={data.total_predicted_tickets.toLocaleString()}
          subtitle="Total tickets forecast across scheduled shows"
          icon={Users}
          badge={{ text: 'XGBoost ML', variant: 'positive' }}
        />
        <MetricCard
          title="Average Occupancy"
          value={`${data.average_occupancy_pct}%`}
          subtitle="Mean auditorium seating utilization"
          icon={TrendingUp}
          badge={{
            text: data.average_occupancy_pct > 40 ? 'Healthy Pace' : 'Moderate',
            variant: data.average_occupancy_pct > 40 ? 'positive' : 'warning',
          }}
        />
        <MetricCard
          title="Projected Box Office"
          value={`₹${(data.total_projected_revenue / 100000).toFixed(1)} Lakhs`}
          subtitle={`₹${data.total_projected_revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Gross`}
          icon={DollarSign}
          badge={{ text: 'Forecast Yield', variant: 'accent' }}
        />
      </div>

      {/* Demand Segmentation & Screen Utilization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demand Categorization Breakdown */}
        <div className="p-5 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/15 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F6F0E8] uppercase tracking-wider">
              Demand Distribution
            </h3>
            <span className="text-xs text-[#89858C]">{data.total_shows} Shows Evaluated</span>
          </div>

          <div className="space-y-3 pt-2">
            {/* High Demand */}
            <div className="p-3 rounded-xl bg-[#241018]/80 border border-[#B66B7B]/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B66B7B]"></span>
                  <span className="text-xs font-semibold text-[#F6F0E8]">High Demand (&gt;75% Occupancy)</span>
                </div>
                <p className="text-[11px] text-[#89858C]">Prime blockbuster slots & sellouts</p>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-[#f7a8b8]">{data.high_demand_shows_count}</span>
                <span className="text-[11px] text-[#89858C] block">
                  {((data.high_demand_shows_count / data.total_shows) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Moderate Demand */}
            <div className="p-3 rounded-xl bg-[#241018]/80 border border-[#D8B46A]/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D8B46A]"></span>
                  <span className="text-xs font-semibold text-[#F6F0E8]">Moderate Demand (40-75%)</span>
                </div>
                <p className="text-[11px] text-[#89858C]">Stable operational screenings</p>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-[#D8B46A]">{data.moderate_demand_shows_count}</span>
                <span className="text-[11px] text-[#89858C] block">
                  {((data.moderate_demand_shows_count / data.total_shows) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Low Demand */}
            <div className="p-3 rounded-xl bg-[#241018]/80 border border-[#89858C]/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#89858C]"></span>
                  <span className="text-xs font-semibold text-[#F6F0E8]">Low Demand (&lt;40% Occupancy)</span>
                </div>
                <p className="text-[11px] text-[#89858C]">Candidates for screen reallocation</p>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-[#c9c7cb]">{data.low_demand_shows_count}</span>
                <span className="text-[11px] text-[#89858C] block">
                  {((data.low_demand_shows_count / data.total_shows) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Screen Utilization Cards */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/15 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F6F0E8] uppercase tracking-wider">
                Auditorium Utilization & Yield
              </h3>
              <p className="text-xs text-[#89858C]">Screen-wise capacity and box-office contribution</p>
            </div>
            <button
              onClick={() => onNavigate('recommendations')}
              className="text-xs font-semibold text-[#D8B46A] hover:underline"
            >
              View Screen Reallocations &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {data.screen_utilization.map((screen) => (
              <div
                key={screen.screen_id}
                className="p-3.5 rounded-xl bg-[#17171D]/70 border border-[#D8B46A]/20 hover:border-[#D8B46A]/40 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F6F0E8]">{screen.screen_id}</span>
                  <span className="text-[11px] font-semibold text-[#D8B46A] px-2 py-0.5 rounded bg-[#D8B46A]/10 border border-[#D8B46A]/20">
                    {screen.capacity} Seats
                  </span>
                </div>

                <div className="text-[11px] text-[#89858C] truncate">{screen.screen_type}</div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-lg font-extrabold text-[#F6F0E8]">{screen.avg_occupancy_pct}%</span>
                    <span className="text-[10px] text-[#89858C] block">Avg Occupancy</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#D8B46A]">
                      ₹{(screen.total_revenue / 100000).toFixed(1)}L
                    </span>
                    <span className="text-[10px] text-[#89858C] block">{screen.total_shows} shows</span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-[#241018] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D8B46A] to-[#B66B7B] rounded-full"
                    style={{ width: `${Math.min(100, screen.avg_occupancy_pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Show Demand Board Table */}
      <div className="p-5 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/15 backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#F6F0E8] uppercase tracking-wider">
              Upcoming Shows Forecasting Board
            </h3>
            <p className="text-xs text-[#89858C]">
              Model inferences generated 24 hours prior to screening start time
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#89858C]" />
              <input
                type="text"
                placeholder="Search movie or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#17171D] border border-[#D8B46A]/20 text-xs text-[#F6F0E8] focus:outline-none focus:border-[#D8B46A] w-48"
              />
            </div>

            {/* Screen Filter */}
            <select
              value={selectedScreen}
              onChange={(e) => setSelectedScreen(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#17171D] border border-[#D8B46A]/20 text-xs text-[#F6F0E8] focus:outline-none focus:border-[#D8B46A]"
            >
              <option value="ALL">All Screens</option>
              <option value="Screen-1">Screen-1 (350 Seats)</option>
              <option value="Screen-2">Screen-2 (250 Seats)</option>
              <option value="Screen-3">Screen-3 (180 Seats)</option>
              <option value="Screen-4">Screen-4 (120 Seats)</option>
            </select>

            {/* Demand Filter */}
            <select
              value={selectedDemand}
              onChange={(e) => setSelectedDemand(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#17171D] border border-[#D8B46A]/20 text-xs text-[#F6F0E8] focus:outline-none focus:border-[#D8B46A]"
            >
              <option value="ALL">All Demand</option>
              <option value="High Demand">High Demand (&gt;75%)</option>
              <option value="Moderate Demand">Moderate Demand</option>
              <option value="Low Demand">Low Demand (&lt;40%)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D8B46A]/15 text-[#89858C] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Show ID</th>
                <th className="py-3 px-3">Movie & Genre</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Screen</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3 text-right">Forecast Tickets</th>
                <th className="py-3 px-3 text-right">Occupancy %</th>
                <th className="py-3 px-3 text-right">Revenue</th>
                <th className="py-3 px-3 text-center">Category</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8B46A]/10 text-[#F6F0E8]">
              {filteredShows.slice(0, 15).map((show: any) => {
                const predTickets = Math.round(show.champ_pred || show.tickets_sold);
                const cap = show.screen_capacity;
                const occPct = ((predTickets / cap) * 100).toFixed(1);
                const rev = Math.round(predTickets * show.ticket_price);
                const isCold = show.is_cold_start;

                return (
                  <tr
                    key={show.show_id}
                    className="hover:bg-[#241018]/50 transition-colors group"
                  >
                    <td className="py-3 px-3 font-mono text-[11px] text-[#89858C]">
                      {show.show_id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#F6F0E8] flex items-center space-x-1.5">
                        <span>{show.movie_title}</span>
                        {isCold && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/70 text-amber-300 border border-amber-500/30 font-medium">
                            Cold-Start
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#89858C]">{show.genre}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-[11px] font-medium">{show.show_date}</div>
                      <div className="text-[10px] text-[#89858C]">{show.show_time} ({show.time_of_day_category})</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-[11px]">{show.screen_id}</div>
                      <div className="text-[10px] text-[#89858C]">{show.screen_capacity} cap</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#D8B46A]">
                      ₹{show.ticket_price}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-[#F6F0E8]">
                      {predTickets}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-bold">{occPct}%</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[11px] text-[#D8B46A]">
                      ₹{rev.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          show.demand_category === 'High Demand'
                            ? 'cinema-tag-high'
                            : show.demand_category === 'Moderate Demand'
                            ? 'cinema-tag-mod'
                            : 'cinema-tag-low'
                        }`}
                      >
                        {show.demand_category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          if (onSelectShowForForecast) onSelectShowForForecast(show);
                          onNavigate('forecast');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#241018] text-[#D8B46A] hover:bg-[#D8B46A] hover:text-[#17171D] font-semibold text-[10px] border border-[#D8B46A]/30 transition-all"
                      >
                        Inspect ML
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
