import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  DollarSign,
  Users,
  ShieldAlert,
  Sparkles,
  SlidersHorizontal,
  Clock,
  Calendar,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { OccupancyGauge } from './OccupancyGauge';
import { apiService } from '../services/api';
import { ShowPredictionOutput } from '../types/api';
import { getMoviePoster } from '../utils/movieCatalog';

interface ShowtimeModalProps {
  show: {
    show_id: string;
    movie_title: string;
    genre: string;
    show_date: string;
    show_time: string;
    screen_id: string;
    screen_type?: string;
    screen_capacity: number;
    ticket_price: number;
    demand_category?: string;
    predicted_occupancy_pct?: number;
    predicted_tickets?: number;
    is_cold_start?: boolean;
    poster_url?: string;
  };
  onClose: () => void;
  onNavigateToSimulator?: () => void;
}

export const ShowtimeIntelligenceModal: React.FC<ShowtimeModalProps> = ({
  show,
  onClose,
  onNavigateToSimulator,
}) => {
  const [prediction, setPrediction] = useState<ShowPredictionOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'seating' | 'shap' | 'details'>('seating');

  useEffect(() => {
    let isMounted = true;
    async function fetchForecast() {
      setLoading(true);
      try {
        const res = await apiService.predictShow({
          movie_title: show.movie_title,
          genre: show.genre,
          show_date: show.show_date,
          show_time: show.show_time,
          screen_id: show.screen_id,
          screen_capacity: show.screen_capacity,
          ticket_price: show.ticket_price,
          movie_popularity: 8.5,
          is_cold_start: show.is_cold_start,
        });
        if (isMounted) setPrediction(res);
      } catch (err) {
        console.error('Failed to load forecast for modal', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchForecast();
    return () => {
      isMounted = false;
    };
  }, [show]);

  const poster = show.poster_url || getMoviePoster(show.movie_title, show.genre);
  const occPct = prediction ? prediction.predicted_occupancy_percentage : (show.predicted_occupancy_pct || 65);
  const tickets = prediction ? prediction.predicted_tickets_sold : (show.predicted_tickets || Math.round(show.screen_capacity * (occPct / 100)));
  const rev = prediction ? prediction.estimated_ticket_revenue : tickets * show.ticket_price;
  const emptySeats = show.screen_capacity - tickets;

  // Generate visual seat layout representation (BookMyShow curved screen style)
  const rows = ['A (Recliner)', 'B (VIP)', 'C (Prime)', 'D (Prime)', 'E (Classic)', 'F (Classic)'];
  const seatsPerRow = 16;
  const totalGridSeats = rows.length * seatsPerRow;
  const bookedSeatThreshold = Math.round((tickets / show.screen_capacity) * totalGridSeats);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#1E202B] border border-white/10 shadow-2xl overflow-hidden text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#17171D]">
          <div className="flex items-center space-x-3">
            <img
              src={poster}
              alt={show.movie_title}
              className="w-12 h-16 object-cover rounded-lg border border-white/10 shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white">{show.movie_title}</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#F84464] text-white">
                  {show.genre}
                </span>
                {show.is_cold_start && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Cold-Start
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 flex items-center space-x-2">
                <span>{show.screen_id} ({show.screen_capacity} Seats)</span>
                <span>•</span>
                <span>{show.show_date}</span>
                <span>•</span>
                <strong className="text-[#D8B46A]">{show.show_time}</strong>
                <span>•</span>
                <span>₹{show.ticket_price}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#F84464] text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-white/10 px-6 bg-[#17171D]/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('seating')}
            className={`py-3 px-4 border-b-2 transition-all ${
              activeTab === 'seating'
                ? 'border-[#F84464] text-[#F84464]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Auditorium Seat Occupancy Layout
          </button>
          <button
            onClick={() => setActiveTab('shap')}
            className={`py-3 px-4 border-b-2 transition-all ${
              activeTab === 'shap'
                ? 'border-[#F84464] text-[#F84464]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            SHAP Demand Drivers &amp; Confidence Interval
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-[#F84464] text-[#F84464]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Screening Audit &amp; Metadata
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Real-time KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#17171D] border border-white/5 text-center">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                Forecast Admissions
              </span>
              <span className="text-xl font-black text-white mt-0.5 block">
                {tickets} / {show.screen_capacity}
              </span>
              <span className="text-[10px] text-neutral-400">Seats Booked</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#17171D] border border-white/5 text-center">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                Occupancy Ratio
              </span>
              <span
                className={`text-xl font-black mt-0.5 block ${
                  occPct >= 75 ? 'text-[#F84464]' : occPct >= 45 ? 'text-[#D8B46A]' : 'text-emerald-400'
                }`}
              >
                {occPct}%
              </span>
              <span className="text-[10px] text-neutral-400">
                {occPct >= 75 ? 'Almost Full / High' : occPct >= 45 ? 'Filling Fast' : 'Available'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#17171D] border border-white/5 text-center">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                Projected Revenue
              </span>
              <span className="text-xl font-black text-[#D8B46A] mt-0.5 block">
                ₹{rev.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-neutral-400">@ ₹{show.ticket_price} ticket</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#17171D] border border-white/5 text-center">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                Unoccupied Seats
              </span>
              <span className="text-xl font-black text-neutral-300 mt-0.5 block">
                {emptySeats}
              </span>
              <span className="text-[10px] text-neutral-400">Remaining</span>
            </div>
          </div>

          {/* TAB 1: BookMyShow Cinema Seat Layout */}
          {activeTab === 'seating' && (
            <div className="p-6 rounded-2xl bg-[#17171D] border border-white/5 space-y-6">
              {/* Cinema Screen Curve Graphic */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-3/4 h-2.5 rounded-t-full bg-gradient-to-r from-transparent via-[#0072CE] to-transparent shadow-lg shadow-[#0072CE]/40" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                  All eyes this way please • Screen Curve
                </span>
              </div>

              {/* Seat Matrix */}
              <div className="space-y-2 max-w-lg mx-auto py-2">
                {rows.map((rowName, rIdx) => (
                  <div key={rowName} className="flex items-center space-x-2">
                    <span className="w-20 text-[10px] font-semibold text-neutral-400 truncate">
                      {rowName}
                    </span>
                    <div className="flex-1 flex items-center justify-center space-x-1.5">
                      {Array.from({ length: seatsPerRow }).map((_, cIdx) => {
                        const seatNumber = rIdx * seatsPerRow + cIdx;
                        const isBooked = seatNumber < bookedSeatThreshold;
                        return (
                          <div
                            key={cIdx}
                            title={`${rowName} - Seat ${cIdx + 1} (${isBooked ? 'Occupied' : 'Available'})`}
                            className={`w-3.5 h-3.5 rounded-sm transition-all ${
                              isBooked
                                ? occPct >= 75
                                  ? 'bg-[#F84464] border border-[#F84464]/80'
                                  : 'bg-[#D8B46A] border border-[#D8B46A]/80'
                                : 'bg-neutral-800 border border-neutral-700 hover:border-white'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Seat Legend */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-neutral-400 border-t border-white/5">
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 rounded-sm bg-neutral-800 border border-neutral-700"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 rounded-sm bg-[#D8B46A]"></div>
                  <span>Filling Fast</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 rounded-sm bg-[#F84464]"></div>
                  <span>High Demand / Booked</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHAP Explainability & Prediction Interval */}
          {activeTab === 'shap' && (
            <div className="space-y-4">
              {prediction?.explanation ? (
                <div className="p-5 rounded-2xl bg-[#17171D] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-[#D8B46A]" />
                        <span>Why did the model predict {prediction.predicted_tickets_sold} tickets?</span>
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Top SHAP feature attributions compared to baseline population average ({prediction.explanation.base_expected_value} tickets)
                      </p>
                    </div>
                  </div>

                  {/* SHAP Bars */}
                  <div className="space-y-2 pt-2">
                    {prediction.explanation.top_contributions.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-mono text-neutral-300">{item.feature}</span>
                          <span
                            className={`font-mono font-bold ${
                              item.shap_value >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {item.shap_value >= 0 ? `+${item.shap_value}` : item.shap_value} tickets
                          </span>
                        </div>
                        <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden flex">
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

                  {/* Narrative */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 leading-relaxed">
                    <strong className="text-[#D8B46A] block mb-1">Executive Assessment:</strong>
                    {prediction.explanation.executive_explanation}
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-[#17171D] text-center text-xs text-neutral-400">
                  Loading SHAP local feature contributions from production model...
                </div>
              )}

              {/* 90% Confidence Interval */}
              {prediction?.confidence_interval_90 && (
                <div className="p-4 rounded-xl bg-[#17171D] border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">
                      90% Statistically Justified Prediction Bounds:
                    </span>
                    <span className="text-neutral-400">
                      {prediction.confidence_interval_90.lower_occupancy_pct}% to {prediction.confidence_interval_90.upper_occupancy_pct}% occupancy range
                    </span>
                  </div>
                  <span className="text-sm font-black text-[#D8B46A]">
                    {prediction.confidence_interval_90.lower_tickets} – {prediction.confidence_interval_90.upper_tickets} Tickets
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Details & Governance */}
          {activeTab === 'details' && (
            <div className="p-5 rounded-2xl bg-[#17171D] border border-white/10 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 space-y-1">
                  <span className="text-neutral-400 block">Forecast Horizon</span>
                  <span className="text-sm font-bold text-white">Strictly T - 24 Hours</span>
                  <p className="text-[11px] text-neutral-400">Zero lookahead or future booking data leakage</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 space-y-1">
                  <span className="text-neutral-400 block">Production Model</span>
                  <span className="text-sm font-bold text-[#F84464]">XGBoost Regressor</span>
                  <p className="text-[11px] text-neutral-400">Held-out test WAPE 21.35% (vs Baseline 41.75%)</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#17171D]">
          <span className="text-xs text-neutral-400">
            Show ID: <strong className="text-neutral-200 font-mono">{show.show_id}</strong>
          </span>

          <div className="flex items-center space-x-3">
            {onNavigateToSimulator && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToSimulator();
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center space-x-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#D8B46A]" />
                <span>Simulate Changes in What-If</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-[#F84464] hover:bg-[#E03150] text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
