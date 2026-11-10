import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  AlertCircle,
  HelpCircle,
  DollarSign,
  Users,
  ShieldAlert,
  ArrowRight,
  Layers,
  ChevronRight,
  Info,
  Clock,
  Film,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { OccupancyGauge } from '../components/OccupancyGauge';
import { apiService } from '../services/api';
import { ShowPredictionInput, ShowPredictionOutput } from '../types/api';
import { MOVIE_CATALOG, getMoviePoster } from '../utils/movieCatalog';

const PRESETS = [
  {
    name: 'Weekend Prime Blockbuster (IMAX)',
    description: 'High-budget Sci-Fi Friday night in the flagship IMAX theater',
    data: {
      movie_title: 'Quantum Horizon',
      genre: 'Sci-Fi',
      release_date: '2024-06-01',
      show_date: '2024-06-15',
      show_time: '19:45',
      screen_id: 'Screen-1',
      screen_type: 'IMAX / Premium Large Format',
      screen_capacity: 350,
      ticket_price: 380,
      movie_popularity: 8.8,
      historical_movie_demand: 0.65,
      days_since_release: 14,
      is_weekend: 1,
      is_holiday: 0,
    },
  },
  {
    name: 'Weekday Matinee Comedy',
    description: 'Affordable mid-week afternoon screening in standard screen',
    data: {
      movie_title: 'Laughter Therapy',
      genre: 'Comedy',
      release_date: '2024-05-10',
      show_date: '2024-06-12',
      show_time: '13:30',
      screen_id: 'Screen-3',
      screen_type: 'Standard Audi',
      screen_capacity: 180,
      ticket_price: 200,
      movie_popularity: 7.2,
      historical_movie_demand: 0.38,
      days_since_release: 33,
      is_weekend: 0,
      is_holiday: 0,
    },
  },
  {
    name: 'Opening Day Cold-Start Release',
    description: 'Brand new release with zero prior ticket history (Day 0)',
    data: {
      movie_title: 'Neon Syndicate',
      genre: 'Thriller',
      release_date: '2024-06-21',
      show_date: '2024-06-21',
      show_time: '20:00',
      screen_id: 'Screen-2',
      screen_type: 'Standard Dolby Atmos',
      screen_capacity: 250,
      ticket_price: 300,
      movie_popularity: 8.3,
      historical_movie_demand: undefined,
      days_since_release: 0,
      is_weekend: 1,
      is_holiday: 0,
      is_cold_start: true,
    },
  },
  {
    name: 'Boutique VIP Drama Evening',
    description: 'Intimate luxury screening with plush recliners & premium ticket price',
    data: {
      movie_title: 'Letters from Verona',
      genre: 'Romance',
      release_date: '2024-05-15',
      show_date: '2024-06-16',
      show_time: '19:45',
      screen_id: 'Screen-4',
      screen_type: 'Boutique / VIP',
      screen_capacity: 120,
      ticket_price: 450,
      movie_popularity: 6.2,
      historical_movie_demand: 0.45,
      days_since_release: 32,
      is_weekend: 1,
      is_holiday: 0,
    },
  },
];

export const ForecastPage: React.FC = () => {
  const [formData, setFormData] = useState<ShowPredictionInput>(PRESETS[0].data);
  const [prediction, setPrediction] = useState<ShowPredictionOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelperModal, setShowHelperModal] = useState(false);

  const handleMovieSelect = (movie: (typeof MOVIE_CATALOG)[0]) => {
    setFormData((prev) => ({
      ...prev,
      movie_title: movie.title,
      genre: movie.genre,
      movie_popularity: movie.popularity,
      poster_url: movie.poster_url,
    }));
  };

  const handlePresetSelect = (preset: (typeof PRESETS)[0]) => {
    setFormData(preset.data);
    setPrediction(null);
  };

  const handleInputChange = (field: keyof ShowPredictionInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.predictShow(formData);
      setPrediction(res);
    } catch (err: any) {
      setError(err.message || 'Forecast generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const currentPoster = getMoviePoster(formData.movie_title, formData.genre);
  const selectedMovieCatalog = MOVIE_CATALOG.find(
    (m) => m.title.toLowerCase() === formData.movie_title.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#D8B46A]/15 text-[#D8B46A] text-xs font-semibold border border-[#D8B46A]/30">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Interactive Machine Learning Inference</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#F6F0E8] mt-1">
            Show-Level Demand Forecasting
          </h1>
          <p className="text-xs lg:text-sm text-[#89858C] max-w-2xl mt-0.5">
            Select a movie, configure screening schedule, and let our trained XGBoost model forecast ticket sales, attendance percentages, and revenue with SHAP explainability.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowHelperModal(!showHelperModal)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#241018] border border-[#D8B46A]/30 text-xs font-semibold text-[#D8B46A] hover:bg-[#241018]/80 transition-all"
          >
            <HelpCircle className="w-4 h-4" />
            <span>How to Read Forecasts</span>
          </button>
        </div>
      </div>

      {/* Helper Modal / Explanation Banner */}
      {showHelperModal && (
        <div className="p-5 rounded-2xl bg-[#241018]/90 border border-[#D8B46A]/40 backdrop-blur-md shadow-2xl relative space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-bold text-[#F6F0E8]">
              <Sparkles className="w-4 h-4 text-[#D8B46A]" />
              <span>CinePulse Forecasting Guide for Managers</span>
            </div>
            <button
              onClick={() => setShowHelperModal(false)}
              className="text-xs text-[#89858C] hover:text-[#F6F0E8] font-bold"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#17171D] border border-[#D8B46A]/15 space-y-1">
              <span className="font-bold text-[#D8B46A] block">1. Forecast Horizon</span>
              <p className="text-[#89858C] text-[11px] leading-relaxed">
                Predictions evaluate strictly 24 hours prior to showtime (T-24h). Zero lookahead data leakage.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#17171D] border border-[#D8B46A]/15 space-y-1">
              <span className="font-bold text-[#D8B46A] block">2. Occupancy Rate</span>
              <p className="text-[#89858C] text-[11px] leading-relaxed">
                Tickets sold ÷ Screen Capacity. Low (&lt;45%), Moderate (45-75%), High (&gt;75%).
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#17171D] border border-[#D8B46A]/15 space-y-1">
              <span className="font-bold text-[#D8B46A] block">3. 90% Prediction Range</span>
              <p className="text-[#89858C] text-[11px] leading-relaxed">
                Statistically justified confidence bounds where 90% of actual outcomes are expected to fall.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#17171D] border border-[#D8B46A]/15 space-y-1">
              <span className="font-bold text-[#D8B46A] block">4. SHAP Feature Impact</span>
              <p className="text-[#89858C] text-[11px] leading-relaxed">
                Transparently reveals which factors (e.g. IMAX, Weekend, Popularity) drove the prediction up or down.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Movie Poster Picker Gallery */}
      <div className="p-5 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/20 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#F6F0E8] uppercase tracking-wider flex items-center space-x-2">
              <Film className="w-4 h-4 text-[#D8B46A]" />
              <span>Step 1: Pick a Movie from Active Catalog</span>
            </h3>
            <p className="text-[11px] text-[#89858C]">
              Click any movie poster to auto-populate title, genre, and buzz popularity
            </p>
          </div>
          <span className="text-[10px] text-[#D8B46A] font-semibold bg-[#D8B46A]/10 px-2.5 py-1 rounded-full border border-[#D8B46A]/20">
            {MOVIE_CATALOG.length} Movies Available
          </span>
        </div>

        {/* Horizontal Poster Scrollable Gallery */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-[#D8B46A]/30">
          {MOVIE_CATALOG.map((movie) => {
            const isSelected = formData.movie_title.toLowerCase() === movie.title.toLowerCase();
            return (
              <button
                key={movie.id}
                type="button"
                onClick={() => handleMovieSelect(movie)}
                className={`flex-shrink-0 w-28 group text-left rounded-xl overflow-hidden border transition-all duration-200 ${
                  isSelected
                    ? 'border-[#D8B46A] ring-2 ring-[#D8B46A]/50 scale-105 shadow-xl shadow-[#D8B46A]/20 bg-[#241018]'
                    : 'border-[#89858C]/20 hover:border-[#D8B46A]/60 bg-[#17171D]/80 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#17171D]">
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#17171D]/90 backdrop-blur-sm text-[9px] font-bold text-[#D8B46A] border border-[#D8B46A]/30">
                    ★ {movie.popularity}
                  </div>
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#D8B46A]/20 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-[#D8B46A] text-[#17171D] flex items-center justify-center font-bold text-xs shadow-md">
                        ✓
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-2 space-y-0.5">
                  <h4 className="text-[11px] font-bold text-[#F6F0E8] truncate group-hover:text-[#D8B46A] transition-colors">
                    {movie.title}
                  </h4>
                  <div className="flex items-center justify-between text-[9px] text-[#89858C]">
                    <span>{movie.genre}</span>
                    <span>{movie.runtime_min}m</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Operational Scenario Presets */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold text-[#89858C] uppercase tracking-wider flex-shrink-0">
          Or Quick Presets:
        </span>
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePresetSelect(p)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-[#241018] text-[#D8B46A] text-xs font-medium border border-[#D8B46A]/25 hover:border-[#D8B46A]/70 hover:bg-[#241018]/80 transition-all flex items-center space-x-1.5"
          >
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form Column (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/20 backdrop-blur-md space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#D8B46A]/15 pb-3">
            <div>
              <h3 className="text-xs font-bold text-[#F6F0E8] uppercase tracking-wider">
                Step 2: Screening Parameters
              </h3>
              <p className="text-[11px] text-[#89858C]">
                Strictly features known at T-24h forecast horizon
              </p>
            </div>
            <span className="text-[10px] text-[#D8B46A] font-mono px-2 py-0.5 rounded bg-[#D8B46A]/10 border border-[#D8B46A]/20">
              Live Input
            </span>
          </div>

          {/* Selected Movie Visual Preview Card */}
          <div className="p-3 rounded-xl bg-[#17171D]/90 border border-[#D8B46A]/20 flex items-center space-x-3">
            <img
              src={currentPoster}
              alt={formData.movie_title}
              className="w-14 h-20 object-cover rounded-lg border border-[#D8B46A]/30 shadow-md flex-shrink-0"
            />
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#D8B46A]/15 text-[#D8B46A] border border-[#D8B46A]/30">
                  {formData.genre}
                </span>
                <span className="text-[10px] text-[#89858C]">
                  Popularity: <strong className="text-[#D8B46A]">★ {formData.movie_popularity}</strong>
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-[#F6F0E8] truncate">
                {formData.movie_title}
              </h4>
              <p className="text-[10px] text-[#89858C] italic truncate">
                {selectedMovieCatalog?.tagline || 'Theatrical Presentation'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Movie Title & Genre */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[#89858C] block mb-1">
                  Movie Title
                </label>
                <input
                  type="text"
                  value={formData.movie_title}
                  onChange={(e) => handleInputChange('movie_title', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#17171D] border border-[#D8B46A]/20 text-xs text-[#F6F0E8] focus:outline-none focus:border-[#D8B46A]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#89858C] block mb-1">
                  Genre
                </label>
                <select
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#17171D] border border-[#D8B46A]/20 text-xs text-[#F6F0E8] focus:outline-none focus:border-[#D8B46A]"
                >
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Action">Action</option>
                  <option value="Drama">Drama</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Horror">Horror</option>
                  <option value="Animation">Animation</option>
                  <option value="Romance">Romance</option>
                  <option value="Thriller">Thriller</option>
                </select>
              </div>
            </div>

            {/* Date & Showtime */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[#89858C] block mb-1 flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-[#D8B46A]" />
                  <span>Show Date</span>
                </label>
                <input
                  type="date"
                  value={formData.show_date}
                  onChange={(e) => handleInputChange('show_date', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#17171D] border border-[#D8B46A]/20 text-xs text-[#F6F0E8] focus:outline-none focus:border-[#D8B46A]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#89858C] block mb-1 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-[#D8B46A]" />
                  <span>Show Time (24h)</span>
                </label>
                <input
                  type="time"
                  value={formData.show_time}
                  onChange={(e) => handleInputChange('show_time', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#17171D] border border-[#D8B46A]/20 text-xs text-[#F6F0E8] focus:outline-none focus:border-[#D8B46A]"
                  required
                />
              </div>
            </div>

            {/* Screen & Capacity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[#89858C] block mb-1">
                  Auditorium Screen
                </label>
                <select
                  value={formData.screen_id}
                  onChange={(e) => {
                    const sid = e.target.value;
                    let cap = 250;
                    let type = 'Standard Dolby Atmos';
                    if (sid === 'Screen-1') {
                      cap = 350;
                      type = 'IMAX / Premium Large Format';
                    } else if (sid === 'Screen-3') {
                      cap = 180;
                      type = 'Standard Audi';
                    } else if (sid === 'Screen-4') {
                      cap = 120;
                      type = 'Boutique / VIP';
                    }
                    setFormData((prev) => ({
                      ...prev,
                      screen_id: sid,
                      screen_capacity: cap,
                      screen_type: type,
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#17171D] border border-[#D8B46A]/20 text-xs text-[#F6F0E8] focus:outline-none focus:border-[#D8B46A]"
                >
                  <option value="Screen-1">Screen-1 (IMAX - 350 seats)</option>
                  <option value="Screen-2">Screen-2 (Dolby Atmos - 250 seats)</option>
                  <option value="Screen-3">Screen-3 (Standard - 180 seats)</option>
                  <option value="Screen-4">Screen-4 (Boutique VIP - 120 seats)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#89858C] block mb-1">
                  Screen Capacity
                </label>
                <input
                  type="number"
                  value={formData.screen_capacity}
                  onChange={(e) => handleInputChange('screen_capacity', parseInt(e.target.value) || 100)}
                  className="w-full px-3 py-2 rounded-xl bg-[#17171D] border border-[#D8B46A]/20 text-xs text-[#F6F0E8] focus:outline-none focus:border-[#D8B46A]"
                  min="10"
                  max="600"
                  required
                />
              </div>
            </div>

            {/* Ticket Price & Days Since Release */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[#89858C] block mb-1">
                  Ticket Price (₹)
                </label>
                <input
                  type="number"
                  value={formData.ticket_price}
                  onChange={(e) => handleInputChange('ticket_price', parseFloat(e.target.value) || 200)}
                  className="w-full px-3 py-2 rounded-xl bg-[#17171D] border border-[#D8B46A]/20 text-xs text-[#F6F0E8] focus:outline-none focus:border-[#D8B46A]"
                  min="50"
                  max="1500"
                  step="10"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#89858C] block mb-1">
                  Days Since Release
                </label>
                <input
                  type="number"
                  value={formData.days_since_release ?? 10}
                  onChange={(e) => handleInputChange('days_since_release', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#17171D] border border-[#D8B46A]/20 text-xs text-[#F6F0E8] focus:outline-none focus:border-[#D8B46A]"
                  min="0"
                  max="120"
                />
              </div>
            </div>

            {/* Movie Popularity Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-[#89858C]">
                  Movie Buzz / Star Power: <strong className="text-[#D8B46A]">★ {formData.movie_popularity} / 10</strong>
                </label>
                <span className="text-[10px] text-[#89858C]">
                  {formData.movie_popularity >= 8.5 ? 'Blockbuster Buzz' : formData.movie_popularity >= 7 ? 'Solid Attraction' : 'Niche Appeal'}
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.1"
                value={formData.movie_popularity}
                onChange={(e) => handleInputChange('movie_popularity', parseFloat(e.target.value))}
                className="w-full accent-[#D8B46A] cursor-pointer"
              />
            </div>

            {/* Historical Movie Demand & Cold-Start Override */}
            <div className="p-3 rounded-xl bg-[#17171D]/60 border border-[#D8B46A]/15 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#89858C]">
                  Prior Occupancy Velocity (T-24h):
                </span>
                <span className="text-xs font-bold text-[#D8B46A]">
                  {formData.historical_movie_demand
                    ? `${(formData.historical_movie_demand * 100).toFixed(0)}% avg occupancy`
                    : 'Genre Default (Cold-Start)'}
                </span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.95"
                step="0.05"
                value={formData.historical_movie_demand || 0.50}
                onChange={(e) => handleInputChange('historical_movie_demand', parseFloat(e.target.value))}
                className="w-full accent-[#D8B46A] cursor-pointer"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F84464] to-[#E03150] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl shadow-[#F84464]/30 hover:opacity-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Computing XGBoost Demand Forecast...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>Run Demand Forecast</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {prediction ? (
            <div className="space-y-4">
              {/* Cold-Start Advisory Banner */}
              {prediction.is_cold_start && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start space-x-3">
                  <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-amber-300 font-semibold mb-0.5">
                      COLD-START PROTOCOL ACTIVE (NEW MOVIE RELEASE)
                    </strong>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      This screening has limited or no prior booking history (≤ 3 days since release). The pipeline automatically anchored prediction to the <strong>{prediction.genre}</strong> genre baseline with an expanded uncertainty interval (±{prediction.confidence_interval_90.residual_std.toFixed(1)} tickets).
                    </p>
                  </div>
                </div>
              )}

              {/* Main Forecast Hero Card */}
              <div className="p-6 rounded-2xl bg-[#241018]/65 border border-[#D8B46A]/40 backdrop-blur-md shadow-2xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={prediction.poster_url || currentPoster}
                      alt={prediction.movie_title}
                      className="w-20 h-28 object-cover rounded-xl border border-[#D8B46A]/30 shadow-xl flex-shrink-0"
                    />
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#D8B46A] px-2 py-0.5 rounded bg-[#D8B46A]/10 border border-[#D8B46A]/20">
                        XGBoost Production Model Forecast
                      </span>
                      <h2 className="text-2xl font-extrabold text-[#F6F0E8] mt-1.5">
                        {prediction.movie_title}
                      </h2>
                      <p className="text-xs text-[#89858C] mt-0.5">
                        {prediction.show_date} • {prediction.show_time} • {prediction.screen_id} ({prediction.screen_type})
                      </p>
                      <div className="inline-flex items-center space-x-2 mt-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#17171D] text-[#D8B46A] border border-[#D8B46A]/20">
                          {prediction.demand_category}
                        </span>
                        <span className="text-[10px] text-[#89858C]">
                          Genre: {prediction.genre}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right bg-[#17171D]/60 p-3.5 rounded-xl border border-[#D8B46A]/15 sm:bg-transparent sm:p-0 sm:border-none">
                    <span className="text-xs text-[#89858C] block">Forecast Admissions</span>
                    <span className="text-4xl font-black text-[#F6F0E8] tracking-tight">
                      {prediction.predicted_tickets_sold}
                    </span>
                    <span className="text-xs text-[#89858C] block mt-0.5">
                      of {prediction.screen_capacity} available seats
                    </span>
                  </div>
                </div>

                {/* Occupancy Gauge */}
                <OccupancyGauge
                  percentage={prediction.predicted_occupancy_percentage}
                  tickets={prediction.predicted_tickets_sold}
                  capacity={prediction.screen_capacity}
                  category={prediction.demand_category}
                />

                {/* KPI Sub-Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-[#17171D]/80 border border-[#D8B46A]/15 text-center">
                    <span className="text-[10px] text-[#89858C] uppercase tracking-wider block">
                      Est. Box Office
                    </span>
                    <span className="text-lg font-extrabold text-[#D8B46A] mt-0.5 block">
                      ₹{prediction.estimated_ticket_revenue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-[#89858C]">
                      @ ₹{prediction.ticket_price} / ticket
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#17171D]/80 border border-[#D8B46A]/15 text-center">
                    <span className="text-[10px] text-[#89858C] uppercase tracking-wider block">
                      Empty Seats
                    </span>
                    <span className="text-lg font-extrabold text-[#F6F0E8] mt-0.5 block">
                      {prediction.estimated_empty_seats}
                    </span>
                    <span className="text-[10px] text-[#89858C]">Opportunity Loss</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#17171D]/80 border border-[#D8B46A]/15 text-center">
                    <span className="text-[10px] text-[#89858C] uppercase tracking-wider block">
                      Naive Baseline
                    </span>
                    <span className="text-lg font-extrabold text-[#89858C] mt-0.5 block">
                      {prediction.baseline_predicted_tickets}
                    </span>
                    <span className="text-[10px] text-[#89858C]">Cap-Adjusted</span>
                  </div>
                </div>

                {/* 90% Prediction Interval Card */}
                <div className="p-4 rounded-xl bg-[#17171D]/90 border border-[#D8B46A]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#F6F0E8] flex items-center space-x-2">
                      <span>90% Prediction Uncertainty Interval:</span>
                      <strong className="text-[#D8B46A] text-sm">
                        {prediction.confidence_interval_90.lower_tickets} – {prediction.confidence_interval_90.upper_tickets} Tickets
                      </strong>
                    </span>
                    <p className="text-[11px] text-[#89858C] leading-relaxed">
                      {prediction.confidence_interval_90.lower_occupancy_pct}% to {prediction.confidence_interval_90.upper_occupancy_pct}% occupancy range • Confidence: {prediction.confidence_interval_90.uncertainty_level}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[#241018] text-[#D8B46A] border border-[#D8B46A]/20 whitespace-nowrap self-start sm:self-auto">
                    Residual σ = {prediction.confidence_interval_90.residual_std} tickets
                  </span>
                </div>
              </div>

              {/* Local SHAP Feature Attribution Waterfall */}
              {prediction.explanation && (
                <div className="p-5 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/15 backdrop-blur-md space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#F6F0E8] uppercase tracking-wider flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-[#D8B46A]" />
                        <span>Explainable AI: Why Did Model Predict This?</span>
                      </h3>
                      <p className="text-[11px] text-[#89858C]">
                        How input features pushed predicted tickets above or below the baseline average ({prediction.explanation.base_expected_value} tickets)
                      </p>
                    </div>
                  </div>

                  {/* SHAP Bars */}
                  <div className="space-y-2.5 pt-1">
                    {prediction.explanation.top_contributions.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-mono text-[11px] text-[#F6F0E8] flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D8B46A]"></span>
                            <span>{item.feature}</span>
                          </span>
                          <span
                            className={`font-mono text-xs font-bold ${
                              item.shap_value >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {item.shap_value >= 0 ? `+${item.shap_value}` : item.shap_value} tickets
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#17171D] rounded-full overflow-hidden flex">
                          {item.shap_value >= 0 ? (
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(100, item.shap_value * 2.5)}%` }}
                            />
                          ) : (
                            <div
                              className="h-full bg-rose-500 rounded-full"
                              style={{ width: `${Math.min(100, Math.abs(item.shap_value) * 2.5)}%` }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Executive Narrative */}
                  <div className="p-4 rounded-xl bg-[#17171D]/80 border border-[#D8B46A]/20 text-xs text-[#F6F0E8] leading-relaxed space-y-1.5">
                    <strong className="text-[#D8B46A] flex items-center space-x-1.5 font-bold uppercase tracking-wider text-[11px]">
                      <Info className="w-3.5 h-3.5" />
                      <span>Executive Plain-English Summary</span>
                    </strong>
                    <p className="text-[#89858C] text-[12px] leading-relaxed">
                      {prediction.explanation.executive_explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[460px] rounded-2xl bg-[#241018]/25 border border-dashed border-[#D8B46A]/20 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#241018] flex items-center justify-center text-[#D8B46A] border border-[#D8B46A]/30 shadow-lg">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#F6F0E8]">
                Ready to Forecast Demand
              </h3>
              <p className="text-xs text-[#89858C] max-w-sm leading-relaxed">
                Click any movie poster above or pick an operational preset on the left, then click &quot;Run Demand Forecast&quot; to see real-time machine learning predictions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
