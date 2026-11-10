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
  Info,
  ChevronRight,
  HelpCircle,
  PlayCircle,
  Star,
  Play,
  Layers,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { apiService } from '../services/api';
import { DashboardSummary } from '../types/api';
import { MOVIE_CATALOG, PREMIERE_MOVIES, MovieCatalogItem } from '../utils/movieCatalog';
import { BookMyShowHeroBanner } from '../components/BookMyShowHeroBanner';
import { MovieDetailsModal } from '../components/MovieDetailsModal';
import { ShowtimeIntelligenceModal } from '../components/ShowtimeIntelligenceModal';

interface DashboardPageProps {
  onNavigate: (tab: any) => void;
  onSelectMovieForForecast?: (movie: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectMovieForForecast,
}) => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScreen, setSelectedScreen] = useState('ALL');
  const [selectedDemand, setSelectedDemand] = useState('ALL');

  // Modals state
  const [selectedMovieForModal, setSelectedMovieForModal] = useState<MovieCatalogItem | null>(null);
  const [activeShowtimeModal, setActiveShowtimeModal] = useState<any | null>(null);
  const [showGuide, setShowGuide] = useState(false);

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
        <div className="w-12 h-12 rounded-full border-2 border-[#F84464] border-t-transparent animate-spin"></div>
        <p className="text-sm text-neutral-400">Loading BookMyShow cinema intelligence data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-[#1E202B] border border-red-500/30 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Backend Connection Required</h3>
        <p className="text-sm text-neutral-400 max-w-md mx-auto">{error}</p>
        <button
          onClick={loadDashboard}
          className="px-5 py-2.5 bg-[#F84464] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#E03150] transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* SECTION 1: BookMyShow Hero Banner Carousel (from Screenshots 2 & 3) */}
      <BookMyShowHeroBanner onNavigate={onNavigate} />

      {/* SECTION 2: "Recommended Movies" Section (Exact BookMyShow Layout from Screenshots 2 & 3) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Recommended Movies
          </h2>
          <button
            onClick={() => onNavigate('showtimes')}
            className="text-xs font-bold text-[#F84464] hover:text-[#E03150] flex items-center space-x-1"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Recommended Movies Horizontal Scroll Strip / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {MOVIE_CATALOG.slice(0, 5).map((movie) => (
            <div
              key={movie.id}
              onClick={() => setSelectedMovieForModal(movie)}
              className="group cursor-pointer space-y-2"
            >
              {/* Poster Container with Bottom Rating Bar */}
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#1E202B] border border-white/10 group-hover:border-[#F84464]/60 transition-all duration-300 shadow-lg group-hover:shadow-2xl group-hover:scale-[1.02]">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Rating Badge Overlay (BookMyShow Signature Style) */}
                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-white font-bold">
                    <Star className="w-3.5 h-3.5 fill-[#F84464] text-[#F84464]" />
                    <span>{movie.rating}</span>
                    <span className="text-[10px] text-neutral-400 font-normal">
                      {movie.votes}
                    </span>
                  </div>
                </div>

                {/* Promoted / Hot Badge */}
                {movie.is_promoted && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[#F84464] text-[9px] font-black uppercase text-white shadow">
                    PROMOTED
                  </div>
                )}
              </div>

              {/* Title & Genre Subtext */}
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white truncate group-hover:text-[#F84464] transition-colors">
                  {movie.title}
                </h3>
                <p className="text-xs text-neutral-400 truncate">
                  {movie.formats.slice(0, 2).join(', ')} • {movie.genre}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: BookMyShow "PREMIERE" Dark Navy Section (Exact Layout from Screenshot 1) */}
      <div className="p-6 sm:p-8 rounded-2xl bms-premiere-banner shadow-2xl space-y-5">
        {/* Premiere Banner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#F84464] flex items-center justify-center text-white shadow-lg shadow-[#F84464]/40">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-black tracking-wider uppercase text-white">
                  PREMIERE
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                  Cold-Start AI Protocol
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Brand new releases opening every Friday with zero prior booking history
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('coldstart')}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all self-start sm:self-auto"
          >
            Explore Cold-Start Model
          </button>
        </div>

        {/* Premieres Card Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {PREMIERE_MOVIES.map((movie) => (
            <div
              key={movie.id}
              onClick={() => setSelectedMovieForModal(movie)}
              className="group cursor-pointer space-y-2"
            >
              <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-[#17171D] border border-white/15 group-hover:border-[#F84464] transition-all shadow-lg group-hover:scale-[1.02]">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Pink/Red PREMIERE Badge (Matching Screenshot 1) */}
                <div className="absolute bottom-2.5 left-2.5">
                  <span className="bms-badge-premiere shadow-lg">
                    PREMIERE
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#F84464] transition-colors">
                  {movie.title}
                </h4>
                <p className="text-[11px] text-neutral-400 truncate">
                  {movie.languages.slice(0, 2).join(', ')} • {movie.genre}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: Multiplex Control Center Executive KPIs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Multiplex Control Center
            </h2>
            <p className="text-xs text-neutral-400">
              Aggregated attendance and revenue performance across 4 auditoriums (T-24h forecast horizon)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('showtimes')}
              className="px-3.5 py-1.5 rounded-lg bg-[#F84464] hover:bg-[#E03150] text-white text-xs font-bold transition-all shadow-md shadow-[#F84464]/20"
            >
              View Theaters Grid
            </button>
            <button
              onClick={() => setShowGuide(true)}
              className="px-3 py-1.5 rounded-lg bg-[#1E202B] hover:bg-white/10 text-neutral-300 text-xs font-semibold border border-white/10 transition-all flex items-center space-x-1"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#D8B46A]" />
              <span>How It Works</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Forecast Admissions"
            value={data.total_predicted_tickets.toLocaleString('en-IN')}
            subtitle={`Across ${data.total_shows} scheduled shows`}
            icon={Users}
            badge={{ text: 'Admissions', variant: 'neutral' }}
          />

          <MetricCard
            title="Average Multiplex Occupancy"
            value={`${data.average_occupancy_pct}%`}
            subtitle="Seating fill-rate across all auditoriums"
            icon={TrendingUp}
            badge={{ text: 'Fill Rate', variant: 'accent' }}
          />

          <MetricCard
            title="Projected Box Office"
            value={`₹${(data.total_projected_revenue / 100000).toFixed(2)} Lakh`}
            subtitle={`₹${data.total_projected_revenue.toLocaleString('en-IN')} gross`}
            icon={DollarSign}
            badge={{ text: 'Revenue', variant: 'positive' }}
          />

          <MetricCard
            title="High Demand Screenings"
            value={`${data.high_demand_shows_count} Shows`}
            subtitle="Shows exceeding 75% occupancy"
            icon={Sparkles}
            badge={{ text: 'Hot Shows', variant: 'warning' }}
          />
        </div>
      </div>

      {/* SECTION 5: Live Screen Utilization Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.screen_utilization.map((screen) => (
          <div
            key={screen.screen_id}
            className="p-4 rounded-xl bg-[#1E202B] border border-white/10 space-y-2 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{screen.screen_id}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D8B46A]/15 text-[#D8B46A]">
                {screen.capacity} Seats
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 truncate">{screen.screen_type}</p>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs text-neutral-400">Avg Occupancy:</span>
              <span className="text-base font-black text-white">{screen.avg_occupancy_pct}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D8B46A] to-[#F84464]"
                style={{ width: `${Math.min(100, screen.avg_occupancy_pct)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 6: Live Upcoming Screenings Table */}
      <div className="p-6 rounded-2xl bg-[#1E202B] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Film className="w-4 h-4 text-[#F84464]" />
              <span>Live Scheduled Screenings Ledger</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Click any screening row to open the BookMyShow seating layout and real-time AI demand modal
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search film or screen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-[#17171D] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#F84464]"
              />
            </div>

            {/* Screen Filter */}
            <select
              value={selectedScreen}
              onChange={(e) => setSelectedScreen(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#17171D] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F84464]"
            >
              <option value="ALL">All Screens</option>
              <option value="Screen-1">Screen-1 (IMAX)</option>
              <option value="Screen-2">Screen-2 (Atmos)</option>
              <option value="Screen-3">Screen-3 (Standard)</option>
              <option value="Screen-4">Screen-4 (VIP)</option>
            </select>
          </div>
        </div>

        {/* Shows Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#17171D] text-neutral-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Film &amp; Poster</th>
                <th className="py-3 px-3">Date &amp; Slot</th>
                <th className="py-3 px-3">Auditorium</th>
                <th className="py-3 px-3">Ticket Price</th>
                <th className="py-3 px-3">Forecast Admissions</th>
                <th className="py-3 px-3">Occupancy</th>
                <th className="py-3 px-3">Demand State</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredShows.slice(0, 10).map((show) => {
                const occ = show.predicted_occupancy_pct || 60;
                return (
                  <tr
                    key={show.show_id}
                    onClick={() => setActiveShowtimeModal(show)}
                    className="hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={show.poster_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200'}
                          alt={show.movie_title}
                          className="w-8 h-12 object-cover rounded shadow border border-white/10 flex-shrink-0"
                        />
                        <div>
                          <span className="font-bold text-white block">{show.movie_title}</span>
                          <span className="text-[10px] text-neutral-400">{show.genre}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-neutral-300">
                      <div>{show.show_date}</div>
                      <div className="text-[10px] text-neutral-400">{show.show_time}</div>
                    </td>

                    <td className="py-3 px-3 text-neutral-300">
                      <span className="font-semibold text-white">{show.screen_id}</span>
                      <span className="text-[10px] text-neutral-400 block">
                        ({show.screen_capacity} seats)
                      </span>
                    </td>

                    <td className="py-3 px-3 font-bold text-[#D8B46A]">
                      ₹{show.ticket_price}
                    </td>

                    <td className="py-3 px-3 font-black text-white">
                      {show.predicted_tickets}{' '}
                      <span className="text-[10px] font-normal text-neutral-400">
                        / {show.screen_capacity}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{occ}%</span>
                        <div className="w-12 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              occ >= 75 ? 'bg-[#F84464]' : occ >= 45 ? 'bg-[#D8B46A]' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, occ)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          occ >= 75
                            ? 'bg-[#F84464]/15 text-[#F84464] border border-[#F84464]/30'
                            : occ >= 45
                            ? 'bg-[#D8B46A]/15 text-[#D8B46A] border border-[#D8B46A]/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {occ >= 75 ? 'High Demand' : occ >= 45 ? 'Filling Fast' : 'Available'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveShowtimeModal(show);
                        }}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-[#F84464] text-white text-[10px] font-bold transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl p-6 rounded-2xl bg-[#1E202B] border border-white/15 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#D8B46A]" />
                <span>How CinePulse AI Operates</span>
              </h3>
              <button onClick={() => setShowGuide(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
              <p>
                <strong>1. BookMyShow Theater Showtimes:</strong> Browse live showtimes color-coded by AI-predicted occupancy: Green (Available), Orange (Filling Fast), Red (Almost Full).
              </p>
              <p>
                <strong>2. Real-Time ML Predictions:</strong> Every screening is evaluated using an XGBoost regressor trained on 2,880 historical shows, evaluated strictly 24 hours prior to showtime.
              </p>
              <p>
                <strong>3. What-If Simulator:</strong> Modify ticket prices, showtimes, and screens to explore counterfactual attendance shifts.
              </p>
              <p>
                <strong>4. Cold-Start Protocol:</strong> Newly released movies opening on Day 0 automatically substitute genre-level demand priors with expanded confidence intervals.
              </p>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03150] text-white font-bold text-xs uppercase"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Movie Details Modal */}
      {selectedMovieForModal && (
        <MovieDetailsModal
          movie={selectedMovieForModal}
          onClose={() => setSelectedMovieForModal(null)}
          onSelectMovieForForecast={(m) => {
            if (onSelectMovieForForecast) onSelectMovieForForecast(m);
            onNavigate('forecast');
          }}
          onViewShowtimes={(m) => {
            onNavigate('showtimes');
          }}
        />
      )}

      {/* Showtime Intelligence Modal */}
      {activeShowtimeModal && (
        <ShowtimeIntelligenceModal
          show={activeShowtimeModal}
          onClose={() => setActiveShowtimeModal(null)}
          onNavigateToSimulator={() => onNavigate('simulator')}
        />
      )}
    </div>
  );
};
