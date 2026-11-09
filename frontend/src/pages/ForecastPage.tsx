import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  DollarSign,
  Users,
  ShieldAlert,
  ArrowRight,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { OccupancyGauge } from '../components/OccupancyGauge';
import { apiService } from '../services/api';
import { ShowPredictionInput, ShowPredictionOutput } from '../types/api';

const PRESETS = [
  {
    name: 'Weekend Prime Blockbuster (IMAX)',
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
      movie_popularity: 8.2,
      historical_movie_demand: undefined,
      days_since_release: 0,
      is_weekend: 1,
      is_holiday: 0,
      is_cold_start: true,
    },
  },
  {
    name: 'Boutique VIP Drama Evening',
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#D8B46A]/15 text-[#D8B46A] text-xs font-semibold border border-[#D8B46A]/30">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Interactive Model Inference</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#F6F0E8] mt-1">
            Show-Level Demand Forecasting
          </h1>
          <p className="text-xs text-[#89858C] max-w-2xl mt-0.5">
            Input screening metadata to evaluate predicted ticket sales, seating occupancy, confidence intervals, and local SHAP feature attributions.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-[#89858C] uppercase tracking-wider">
            Presets:
          </span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePresetSelect(p)}
              className="px-2.5 py-1 rounded-lg bg-[#241018] text-[#D8B46A] text-xs font-medium border border-[#D8B46A]/25 hover:border-[#D8B46A]/70 hover:bg-[#241018]/80 transition-all"
            >
              {p.name.split(' ')[0]} {p.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form Column (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/15 backdrop-blur-md space-y-4">
          <div className="border-b border-[#D8B46A]/15 pb-3">
            <h3 className="text-sm font-bold text-[#F6F0E8] uppercase tracking-wider">
              Screening Parameters
            </h3>
            <p className="text-[11px] text-[#89858C]">
              Strictly features known at T-24h forecast horizon
            </p>
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
                <label className="text-[11px] font-medium text-[#89858C] block mb-1">
                  Show Date
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
                <label className="text-[11px] font-medium text-[#89858C] block mb-1">
                  Show Time (24h)
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
                  <option value="Screen-1">Screen-1 (IMAX - 350)</option>
                  <option value="Screen-2">Screen-2 (Dolby Atmos - 250)</option>
                  <option value="Screen-3">Screen-3 (Standard - 180)</option>
                  <option value="Screen-4">Screen-4 (Boutique VIP - 120)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#89858C] block mb-1">
                  Capacity (Seats)
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
                  Movie Buzz / Popularity Index: <strong className="text-[#D8B46A]">{formData.movie_popularity} / 10</strong>
                </label>
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
                  Historical Prior Occupancy (T-24h):
                </span>
                <span className="text-xs font-bold text-[#D8B46A]">
                  {formData.historical_movie_demand
                    ? `${(formData.historical_movie_demand * 100).toFixed(0)}%`
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
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D8B46A] to-[#F4E2BD] text-[#17171D] font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-[#D8B46A]/20 hover:opacity-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-[#17171D] border-t-transparent animate-spin" />
                  <span>Computing Model Inference...</span>
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
                      COLD-START PROTOCOL ACTIVE
                    </strong>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      This screening has limited or no prior booking history (≤ 3 days since release). The pipeline automatically anchored prediction to the <strong>{prediction.genre}</strong> genre prior with an expanded uncertainty interval (±{prediction.confidence_interval_90.residual_std.toFixed(1)} tickets).
                    </p>
                  </div>
                </div>
              )}

              {/* Main Forecast Hero Card */}
              <div className="p-6 rounded-2xl bg-[#241018]/65 border border-[#D8B46A]/40 backdrop-blur-md shadow-2xl space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#D8B46A] px-2 py-0.5 rounded bg-[#D8B46A]/10 border border-[#D8B46A]/20">
                      XGBoost Production Model Forecast
                    </span>
                    <h2 className="text-2xl font-extrabold text-[#F6F0E8] mt-1.5">
                      {prediction.movie_title}
                    </h2>
                    <p className="text-xs text-[#89858C]">
                      {prediction.show_date} • {prediction.show_time} • {prediction.screen_id} ({prediction.screen_type})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#89858C] block">Forecast Admissions</span>
                    <span className="text-4xl font-black text-[#F6F0E8]">
                      {prediction.predicted_tickets_sold}
                    </span>
                    <span className="text-xs text-[#89858C] block">
                      / {prediction.screen_capacity} seats
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
                  <div className="p-3 rounded-xl bg-[#17171D]/60 border border-[#D8B46A]/15 text-center">
                    <span className="text-[10px] text-[#89858C] uppercase tracking-wider block">
                      Est. Box Office
                    </span>
                    <span className="text-base font-extrabold text-[#D8B46A] mt-0.5 block">
                      ₹{prediction.estimated_ticket_revenue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-[#89858C]">
                      @ ₹{prediction.ticket_price} / ticket
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#17171D]/60 border border-[#D8B46A]/15 text-center">
                    <span className="text-[10px] text-[#89858C] uppercase tracking-wider block">
                      Empty Seats
                    </span>
                    <span className="text-base font-extrabold text-[#F6F0E8] mt-0.5 block">
                      {prediction.estimated_empty_seats}
                    </span>
                    <span className="text-[10px] text-[#89858C]">Unoccupied</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#17171D]/60 border border-[#D8B46A]/15 text-center">
                    <span className="text-[10px] text-[#89858C] uppercase tracking-wider block">
                      Naive Baseline
                    </span>
                    <span className="text-base font-extrabold text-[#89858C] mt-0.5 block">
                      {prediction.baseline_predicted_tickets}
                    </span>
                    <span className="text-[10px] text-[#89858C]">Cap-Adjusted Historical</span>
                  </div>
                </div>

                {/* 90% Prediction Interval Card */}
                <div className="p-3.5 rounded-xl bg-[#17171D]/80 border border-[#D8B46A]/20 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-[#F6F0E8] flex items-center space-x-1.5">
                      <span>90% Prediction Interval:</span>
                      <strong className="text-[#D8B46A]">
                        {prediction.confidence_interval_90.lower_tickets} – {prediction.confidence_interval_90.upper_tickets} Tickets
                      </strong>
                    </span>
                    <p className="text-[11px] text-[#89858C]">
                      {prediction.confidence_interval_90.lower_occupancy_pct}% to {prediction.confidence_interval_90.upper_occupancy_pct}% occupancy range • {prediction.confidence_interval_90.uncertainty_level}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#241018] text-[#89858C] border border-[#89858C]/20">
                    Residual σ = {prediction.confidence_interval_90.residual_std}
                  </span>
                </div>
              </div>

              {/* Local SHAP Feature Attribution Waterfall */}
              {prediction.explanation && (
                <div className="p-5 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/15 backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#F6F0E8] uppercase tracking-wider">
                        Explainable AI: Local SHAP Contribution
                      </h3>
                      <p className="text-[11px] text-[#89858C]">
                        How input features shifted the prediction away from the population baseline expected value ({prediction.explanation.base_expected_value} tickets)
                      </p>
                    </div>
                  </div>

                  {/* SHAP Bars */}
                  <div className="space-y-2 pt-1">
                    {prediction.explanation.top_contributions.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-mono text-[11px] text-[#F6F0E8]">
                            {item.feature}
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
                  <div className="p-3.5 rounded-xl bg-[#17171D]/60 border border-[#D8B46A]/15 text-xs text-[#F6F0E8] leading-relaxed">
                    <strong className="text-[#D8B46A] block mb-1">
                      Managerial Explanation Summary:
                    </strong>
                    {prediction.explanation.executive_explanation}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] rounded-2xl bg-[#241018]/25 border border-dashed border-[#D8B46A]/20 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#241018] flex items-center justify-center text-[#D8B46A] border border-[#D8B46A]/20">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#F6F0E8]">
                Awaiting Forecast Request
              </h3>
              <p className="text-xs text-[#89858C] max-w-sm">
                Adjust the screening parameters on the left or pick one of the enterprise presets, then click &quot;Run Demand Forecast&quot;.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
