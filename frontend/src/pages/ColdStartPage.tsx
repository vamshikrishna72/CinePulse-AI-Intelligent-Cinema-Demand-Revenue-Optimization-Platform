import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  Layers,
  AlertTriangle,
  Film,
  Info,
} from 'lucide-react';
import { OccupancyGauge } from '../components/OccupancyGauge';
import { apiService } from '../services/api';
import { ShowPredictionOutput } from '../types/api';
import { MOVIE_CATALOG, getMoviePoster, GENRE_POSTERS } from '../utils/movieCatalog';

export const ColdStartPage: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState('Sci-Fi');
  const [popularity, setPopularity] = useState(8.5);
  const [screenCapacity, setScreenCapacity] = useState(350);
  const [ticketPrice, setTicketPrice] = useState(380);
  const [selectedMovieTitle, setSelectedMovieTitle] = useState('Quantum Horizon');

  const [coldPrediction, setColdPrediction] = useState<ShowPredictionOutput | null>(null);
  const [maturePrediction, setMaturePrediction] = useState<ShowPredictionOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleMovieSelect = (movie: (typeof MOVIE_CATALOG)[0]) => {
    setSelectedMovieTitle(movie.title);
    setSelectedGenre(movie.genre);
    setPopularity(movie.popularity);
    setColdPrediction(null);
    setMaturePrediction(null);
  };

  const runColdStartComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Cold-start show (Day 0, no historical demand)
      const coldRes = await apiService.predictShow({
        movie_title: selectedMovieTitle,
        genre: selectedGenre,
        release_date: '2024-06-25',
        show_date: '2024-06-25',
        show_time: '19:45',
        screen_id: 'Screen-1',
        screen_capacity: screenCapacity,
        ticket_price: ticketPrice,
        movie_popularity: popularity,
        days_since_release: 0,
        historical_shows_count: 0,
        is_cold_start: true,
      });

      // 2. Mature show (Day 15, rich historical demand ~0.62)
      const matureRes = await apiService.predictShow({
        movie_title: selectedMovieTitle,
        genre: selectedGenre,
        release_date: '2024-06-10',
        show_date: '2024-06-25',
        show_time: '19:45',
        screen_id: 'Screen-1',
        screen_capacity: screenCapacity,
        ticket_price: ticketPrice,
        movie_popularity: popularity,
        days_since_release: 15,
        historical_shows_count: 24,
        historical_movie_demand: 0.62,
        is_cold_start: false,
      });

      setColdPrediction(coldRes);
      setMaturePrediction(matureRes);
    } catch (err: any) {
      setError(err.message || 'Comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  const moviePoster = getMoviePoster(selectedMovieTitle, selectedGenre);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#D8B46A]/15 text-[#D8B46A] text-xs font-semibold border border-[#D8B46A]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cold-Start Intelligence Module</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#F6F0E8] mt-1">
            New Movie Release Demand Forecasting
          </h1>
          <p className="text-xs lg:text-sm text-[#89858C] max-w-3xl mt-0.5">
            When a new film opens in theaters, it has zero prior booking history. CinePulse automatically identifies cold-start conditions, substitutes robust genre priors, and communicates wider uncertainty intervals.
          </p>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#241018] border border-[#D8B46A]/30 text-xs font-semibold text-[#D8B46A] hover:bg-[#241018]/80 transition-all self-start md:self-auto"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Why Cold-Start Matters</span>
        </button>
      </div>

      {/* Explanatory Banner */}
      {showExplanation && (
        <div className="p-4 rounded-2xl bg-[#241018]/90 border border-[#D8B46A]/40 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#F6F0E8] flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-[#D8B46A]" />
              <span>What is the &quot;Cold-Start Problem&quot; in Cinema Booking?</span>
            </span>
            <button onClick={() => setShowExplanation(false)} className="text-[#89858C] hover:text-[#F6F0E8]">✕</button>
          </div>
          <p className="text-[#89858C] leading-relaxed">
            In machine learning, models normally rely heavily on a movie&apos;s recent booking pace (e.g. yesterday&apos;s occupancy). For an opening day premiere, that data simply does not exist yet. Basic models fail or produce dangerous illusions of certainty. CinePulse solves this by using pre-release metadata (director, star power, genre historical trends) and widening the prediction error bounds (±32 tickets instead of ±19 tickets) to guard cinema managers against under-staffing or over-booking.
          </p>
        </div>
      )}

      {/* 3 Conceptual Pillars Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#241018]/45 border border-[#D8B46A]/15 space-y-2 shadow-lg">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#D8B46A] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#D8B46A]"></span>
            <span>1. Detection Rule</span>
          </div>
          <p className="text-xs text-[#89858C] leading-relaxed">
            Automatically flags screenings where Days Since Release ≤ 3 or Historical Shows &lt; 3. Never pretends a new movie has reliable track records.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#241018]/45 border border-[#D8B46A]/15 space-y-2 shadow-lg">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#D8B46A] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#D8B46A]"></span>
            <span>2. Genre Prior Anchoring</span>
          </div>
          <p className="text-xs text-[#89858C] leading-relaxed">
            Smoothly anchors to 30-day historical multiplex genre performance (e.g. Animation 62%, Sci-Fi 58%, Comedy 48%) and pre-release buzz.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#241018]/45 border border-[#D8B46A]/15 space-y-2 shadow-lg">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#D8B46A] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#D8B46A]"></span>
            <span>3. Variance Expansion</span>
          </div>
          <p className="text-xs text-[#89858C] leading-relaxed">
            Expands confidence intervals by +66% (residual standard error σ = 32.2 tickets vs 19.4 tickets), explicitly warning managers of volatility.
          </p>
        </div>
      </div>

      {/* Movie Selection Strip with Poster Images */}
      <div className="p-4 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/20 backdrop-blur-md space-y-3 shadow-lg">
        <span className="text-xs font-bold text-[#F6F0E8] uppercase tracking-wider flex items-center space-x-2">
          <Film className="w-4 h-4 text-[#D8B46A]" />
          <span>Select Movie to Benchmark:</span>
        </span>
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#D8B46A]/30">
          {MOVIE_CATALOG.slice(0, 10).map((movie) => {
            const isSelected = selectedMovieTitle.toLowerCase() === movie.title.toLowerCase();
            return (
              <button
                key={movie.id}
                type="button"
                onClick={() => handleMovieSelect(movie)}
                className={`flex-shrink-0 flex items-center space-x-2.5 p-2 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-[#D8B46A] bg-[#241018] ring-1 ring-[#D8B46A]/50 shadow-md'
                    : 'border-[#89858C]/20 bg-[#17171D]/60 hover:border-[#D8B46A]/40'
                }`}
              >
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-10 h-14 object-cover rounded-lg border border-[#D8B46A]/20 flex-shrink-0"
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-[#F6F0E8] truncate max-w-[120px]">
                    {movie.title}
                  </div>
                  <div className="text-[10px] text-[#89858C]">{movie.genre}</div>
                  <div className="text-[10px] text-[#D8B46A]">★ {movie.popularity}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Cold-Start Benchmarking Controls */}
      <div className="p-5 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/15 backdrop-blur-md space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8B46A]/15 pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#F6F0E8] uppercase tracking-wider">
              Interactive Cold-Start vs Mature Comparison Tool
            </h3>
            <p className="text-xs text-[#89858C]">
              Execute side-by-side inference holding metadata constant while varying history depth (Day 0 vs Day 15)
            </p>
          </div>
          <button
            onClick={runColdStartComparison}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D8B46A] via-[#F4E2BD] to-[#D8B46A] text-[#17171D] font-extrabold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-[#D8B46A]/20 hover:opacity-95 transition-all disabled:opacity-50"
          >
            {loading ? <span>Evaluating ML Pipeline...</span> : <span>Run Cold-Start Benchmark</span>}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-[11px] font-medium text-[#89858C] block mb-1">
              Genre Prior Baseline
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#17171D] border border-[#D8B46A]/20 text-xs text-[#F6F0E8] focus:outline-none focus:border-[#D8B46A]"
            >
              <option value="Sci-Fi">Sci-Fi (Prior: 58%)</option>
              <option value="Action">Action (Prior: 55%)</option>
              <option value="Animation">Animation (Prior: 62%)</option>
              <option value="Comedy">Comedy (Prior: 48%)</option>
              <option value="Drama">Drama (Prior: 42%)</option>
              <option value="Horror">Horror (Prior: 50%)</option>
              <option value="Thriller">Thriller (Prior: 52%)</option>
              <option value="Romance">Romance (Prior: 40%)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#89858C] block mb-1">
              Pre-Release Buzz / Star Power: <strong className="text-[#D8B46A]">{popularity}</strong>
            </label>
            <input
              type="range"
              min="2.0"
              max="9.8"
              step="0.2"
              value={popularity}
              onChange={(e) => setPopularity(parseFloat(e.target.value))}
              className="w-full accent-[#D8B46A] cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#89858C] block mb-1">
              Auditorium Capacity
            </label>
            <select
              value={screenCapacity}
              onChange={(e) => setScreenCapacity(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-[#17171D] border border-[#D8B46A]/20 text-xs text-[#F6F0E8] focus:outline-none focus:border-[#D8B46A]"
            >
              <option value={350}>Screen-1 (IMAX - 350 Seats)</option>
              <option value={250}>Screen-2 (Dolby Atmos - 250 Seats)</option>
              <option value={180}>Screen-3 (Standard - 180 Seats)</option>
              <option value={120}>Screen-4 (Boutique VIP - 120 Seats)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#89858C] block mb-1">
              Admission Price (₹)
            </label>
            <input
              type="number"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(parseFloat(e.target.value) || 200)}
              className="w-full px-3 py-2 rounded-xl bg-[#17171D] border border-[#D8B46A]/20 text-xs text-[#F6F0E8] focus:outline-none focus:border-[#D8B46A]"
              min="100"
              max="800"
              step="20"
            />
          </div>
        </div>
      </div>

      {/* Comparison Results */}
      {coldPrediction && maturePrediction ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cold-Start Result Card */}
          <div className="p-6 rounded-2xl bg-[#241018]/65 border border-amber-500/40 backdrop-blur-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 px-2.5 py-0.5 rounded bg-amber-950/70 border border-amber-500/40">
                Opening Day (Cold-Start Release)
              </span>
              <span className="text-xs text-[#89858C]">History: 0 prior shows</span>
            </div>

            {/* Poster Header */}
            <div className="flex items-center space-x-3.5 p-3 rounded-xl bg-[#17171D]/80 border border-amber-500/20">
              <img
                src={moviePoster}
                alt={selectedMovieTitle}
                className="w-12 h-16 object-cover rounded-lg border border-amber-500/30 flex-shrink-0"
              />
              <div>
                <h4 className="text-sm font-bold text-[#F6F0E8]">{selectedMovieTitle}</h4>
                <p className="text-[11px] text-[#89858C]">Day 0 • Genre Default Prior</p>
                <span className="text-[10px] text-amber-300 font-semibold">⚠️ High Volatility State</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-[#89858C]">Model Prediction:</span>
              <div className="text-3xl font-black text-[#F6F0E8]">
                {coldPrediction.predicted_tickets_sold}{' '}
                <span className="text-sm font-normal text-[#89858C]">
                  / {coldPrediction.screen_capacity} seats
                </span>
              </div>
            </div>

            <OccupancyGauge
              percentage={coldPrediction.predicted_occupancy_percentage}
              tickets={coldPrediction.predicted_tickets_sold}
              capacity={coldPrediction.screen_capacity}
              category={coldPrediction.demand_category}
            />

            {/* Cold-Start Uncertainty Interval */}
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs space-y-1.5">
              <div className="flex justify-between font-semibold text-amber-200">
                <span>90% Prediction Uncertainty Range:</span>
                <span className="font-mono text-amber-300 font-bold">
                  {coldPrediction.confidence_interval_90.lower_tickets} – {coldPrediction.confidence_interval_90.upper_tickets} Tickets
                </span>
              </div>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                Notice the wider confidence interval range (Residual σ = {coldPrediction.confidence_interval_90.residual_std} tickets). Cinema managers must plan contingency staff or flexible screen arrangements.
              </p>
            </div>
          </div>

          {/* Mature Screening Result Card */}
          <div className="p-6 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/30 backdrop-blur-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8B46A] px-2.5 py-0.5 rounded bg-[#D8B46A]/15 border border-[#D8B46A]/30">
                Day 15 (Mature Screening)
              </span>
              <span className="text-xs text-[#89858C]">History: 24 observed shows</span>
            </div>

            {/* Poster Header */}
            <div className="flex items-center space-x-3.5 p-3 rounded-xl bg-[#17171D]/80 border border-[#D8B46A]/20">
              <img
                src={moviePoster}
                alt={selectedMovieTitle}
                className="w-12 h-16 object-cover rounded-lg border border-[#D8B46A]/30 flex-shrink-0"
              />
              <div>
                <h4 className="text-sm font-bold text-[#F6F0E8]">{selectedMovieTitle}</h4>
                <p className="text-[11px] text-[#89858C]">Day 15 • Established Booking Pace</p>
                <span className="text-[10px] text-emerald-400 font-semibold">✓ High Confidence State</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-[#89858C]">Model Prediction:</span>
              <div className="text-3xl font-black text-[#F6F0E8]">
                {maturePrediction.predicted_tickets_sold}{' '}
                <span className="text-sm font-normal text-[#89858C]">
                  / {maturePrediction.screen_capacity} seats
                </span>
              </div>
            </div>

            <OccupancyGauge
              percentage={maturePrediction.predicted_occupancy_percentage}
              tickets={maturePrediction.predicted_tickets_sold}
              capacity={maturePrediction.screen_capacity}
              category={maturePrediction.demand_category}
            />

            {/* Mature Tight Interval */}
            <div className="p-3.5 rounded-xl bg-[#17171D]/80 border border-[#D8B46A]/20 text-xs space-y-1.5">
              <div className="flex justify-between font-semibold text-[#F6F0E8]">
                <span>90% Prediction Uncertainty Range:</span>
                <span className="font-mono text-[#D8B46A] font-bold">
                  {maturePrediction.confidence_interval_90.lower_tickets} – {maturePrediction.confidence_interval_90.upper_tickets} Tickets
                </span>
              </div>
              <p className="text-[11px] text-[#89858C] leading-relaxed">
                Tighter variance bound (Residual σ = {maturePrediction.confidence_interval_90.residual_std} tickets) because the model directly leverages observed booking momentum.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 rounded-2xl bg-[#241018]/25 border border-dashed border-[#D8B46A]/20 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-[#D8B46A] mx-auto" />
          <h4 className="text-base font-bold text-[#F6F0E8]">
            Click &quot;Run Cold-Start Benchmark&quot; to test ML behavior
          </h4>
          <p className="text-xs text-[#89858C] max-w-md mx-auto leading-relaxed">
            This will trigger two live model evaluations using identical metadata, highlighting how CinePulse automatically substitutes genre priors and expands prediction uncertainty.
          </p>
        </div>
      )}
    </div>
  );
};
