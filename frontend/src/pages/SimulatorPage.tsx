import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShieldAlert,
  Sparkles,
  Info,
  RefreshCw,
  CheckCircle2,
  Film,
  Calendar,
  Clock,
} from 'lucide-react';
import { apiService } from '../services/api';
import { ShowPredictionInput, SimulationResponse } from '../types/api';
import { MOVIE_CATALOG, getMoviePoster } from '../utils/movieCatalog';

const DEFAULT_BASE_SHOW: ShowPredictionInput = {
  movie_title: 'Apex Velocity',
  genre: 'Action',
  release_date: '2024-05-15',
  show_date: '2024-06-20',
  show_time: '13:30',
  screen_id: 'Screen-3',
  screen_type: 'Standard Audi',
  screen_capacity: 180,
  ticket_price: 220,
  movie_popularity: 8.5,
  days_since_release: 36,
  is_weekend: 0,
  historical_movie_demand: 0.42,
};

export const SimulatorPage: React.FC = () => {
  const [baseScenario, setBaseScenario] = useState<ShowPredictionInput>(DEFAULT_BASE_SHOW);
  const [simScenario, setSimScenario] = useState<ShowPredictionInput>({
    ...DEFAULT_BASE_SHOW,
    show_time: '19:45',
    screen_id: 'Screen-1',
    screen_type: 'IMAX / Premium Large Format',
    screen_capacity: 350,
    ticket_price: 380,
    is_weekend: 1,
  });

  const [simulationResult, setSimulationResult] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMovieChange = (movie: (typeof MOVIE_CATALOG)[0]) => {
    const updatedBase: ShowPredictionInput = {
      ...baseScenario,
      movie_title: movie.title,
      genre: movie.genre,
      movie_popularity: movie.popularity,
    };
    setBaseScenario(updatedBase);
    setSimScenario((prev) => ({
      ...prev,
      movie_title: movie.title,
      genre: movie.genre,
      movie_popularity: movie.popularity,
    }));
    setSimulationResult(null);
  };

  const handleSimFieldChange = (field: keyof ShowPredictionInput, value: any) => {
    setSimScenario((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRunSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.simulateScenario(baseScenario, simScenario);
      setSimulationResult(res);
    } catch (err: any) {
      setError(err.message || 'Simulation execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const basePoster = getMoviePoster(baseScenario.movie_title, baseScenario.genre);
  const simPoster = getMoviePoster(simScenario.movie_title, simScenario.genre);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#D8B46A]/15 text-[#D8B46A] text-xs font-semibold border border-[#D8B46A]/30">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Counterfactual Operational Reasoning</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#F6F0E8] mt-1">
          What-If Demand Simulator
        </h1>
        <p className="text-xs lg:text-sm text-[#89858C] max-w-3xl mt-0.5">
          Simulate operational adjustments in showtime slot, ticket pricing, auditorium allocation, and weekend scheduling. Both baseline and counterfactual states are re-evaluated using the actual production XGBoost model pipeline.
        </p>
      </div>

      {/* Prominent Causal Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#241018]/80 border border-[#D8B46A]/30 flex items-start space-x-3.5 shadow-lg">
        <Info className="w-5 h-5 text-[#D8B46A] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-[#F6F0E8] uppercase tracking-wider">
            Causal Governance &amp; Decision Support Notice
          </h4>
          <p className="text-[11px] text-[#89858C] leading-relaxed">
            Model predictions reflect conditional statistical associations under historical operating regimes. Changing ticket price or auditorium does not guarantee causal outcomes in the presence of unobserved macroeconomic shocks or local competition. Cinema managers should utilize simulated deltas as operational guidelines alongside real-time pre-booking velocity.
          </p>
        </div>
      </div>

      {/* Visual Movie Selector for Simulation */}
      <div className="p-4 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/20 backdrop-blur-md space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#F6F0E8] uppercase tracking-wider flex items-center space-x-2">
            <Film className="w-4 h-4 text-[#D8B46A]" />
            <span>Select Movie to Simulate:</span>
          </span>
          <span className="text-[10px] text-[#89858C]">
            Active: <strong className="text-[#D8B46A]">{baseScenario.movie_title}</strong>
          </span>
        </div>
        <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#D8B46A]/30">
          {MOVIE_CATALOG.slice(0, 8).map((movie) => {
            const isSelected = baseScenario.movie_title.toLowerCase() === movie.title.toLowerCase();
            return (
              <button
                key={movie.id}
                type="button"
                onClick={() => handleMovieChange(movie)}
                className={`flex-shrink-0 flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-[#D8B46A] bg-[#241018] ring-1 ring-[#D8B46A]/50 shadow-md'
                    : 'border-[#89858C]/20 bg-[#17171D]/60 hover:border-[#D8B46A]/40'
                }`}
              >
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-8 h-11 object-cover rounded-md border border-[#D8B46A]/20 flex-shrink-0"
                />
                <div className="text-left">
                  <div className="text-[11px] font-bold text-[#F6F0E8] truncate max-w-[100px]">
                    {movie.title}
                  </div>
                  <div className="text-[9px] text-[#89858C]">{movie.genre}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Workbench: Dual Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Baseline Scenario */}
        <div className="p-5 rounded-2xl bg-[#241018]/45 border border-[#89858C]/20 backdrop-blur-md space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#89858C]/20 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#89858C] px-2 py-0.5 rounded bg-[#89858C]/10 border border-[#89858C]/20">
                Baseline Reference State
              </span>
              <h3 className="text-base font-bold text-[#F6F0E8] mt-1">
                {baseScenario.movie_title}
              </h3>
            </div>
            <span className="text-xs text-[#89858C]">Scheduled</span>
          </div>

          {/* Baseline Movie Card with Poster */}
          <div className="p-3 rounded-xl bg-[#17171D]/80 border border-[#89858C]/20 flex items-center space-x-3.5">
            <img
              src={basePoster}
              alt={baseScenario.movie_title}
              className="w-14 h-20 object-cover rounded-lg border border-[#89858C]/30 shadow-md flex-shrink-0"
            />
            <div className="space-y-1 min-w-0">
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#89858C]/20 text-[#F6F0E8]">
                {baseScenario.genre}
              </span>
              <h4 className="text-sm font-bold text-[#F6F0E8] truncate">
                {baseScenario.movie_title}
              </h4>
              <p className="text-[10px] text-[#89858C]">
                Auditorium: {baseScenario.screen_id} ({baseScenario.screen_capacity} seats)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#17171D]/60 border border-[#89858C]/15">
              <span className="text-[10px] text-[#89858C] block">Showtime Period</span>
              <span className="text-sm font-bold text-[#F6F0E8]">{baseScenario.show_time}</span>
              <span className="text-[10px] text-[#89858C] block">Matinee Slot</span>
            </div>

            <div className="p-3 rounded-xl bg-[#17171D]/60 border border-[#89858C]/15">
              <span className="text-[10px] text-[#89858C] block">Auditorium Screen</span>
              <span className="text-sm font-bold text-[#F6F0E8]">{baseScenario.screen_id}</span>
              <span className="text-[10px] text-[#89858C] block">{baseScenario.screen_capacity} Seats</span>
            </div>

            <div className="p-3 rounded-xl bg-[#17171D]/60 border border-[#89858C]/15">
              <span className="text-[10px] text-[#89858C] block">Ticket Price</span>
              <span className="text-sm font-bold text-[#D8B46A]">₹{baseScenario.ticket_price}</span>
              <span className="text-[10px] text-[#89858C] block">Standard Yield</span>
            </div>

            <div className="p-3 rounded-xl bg-[#17171D]/60 border border-[#89858C]/15">
              <span className="text-[10px] text-[#89858C] block">Timing Placement</span>
              <span className="text-sm font-bold text-[#F6F0E8]">
                {baseScenario.is_weekend ? 'Weekend' : 'Weekday'}
              </span>
              <span className="text-[10px] text-[#89858C] block">Day 36 of release</span>
            </div>
          </div>
        </div>

        {/* Right Column: Counterfactual Simulator Controls */}
        <div className="p-5 rounded-2xl bg-[#241018]/65 border border-[#D8B46A]/35 backdrop-blur-md space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#D8B46A]/20 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8B46A] px-2 py-0.5 rounded bg-[#D8B46A]/15 border border-[#D8B46A]/30">
                Counterfactual Scenario (Adjustable)
              </span>
              <h3 className="text-base font-bold text-[#F6F0E8] mt-1">
                Simulated Operational Modifications
              </h3>
            </div>
            <Sparkles className="w-4 h-4 text-[#D8B46A]" />
          </div>

          {/* Simulated Movie Card with Poster */}
          <div className="p-3 rounded-xl bg-[#17171D]/80 border border-[#D8B46A]/20 flex items-center space-x-3.5">
            <img
              src={simPoster}
              alt={simScenario.movie_title}
              className="w-14 h-20 object-cover rounded-lg border border-[#D8B46A]/30 shadow-md flex-shrink-0"
            />
            <div className="space-y-1 min-w-0">
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#D8B46A]/15 text-[#D8B46A]">
                {simScenario.genre}
              </span>
              <h4 className="text-sm font-bold text-[#F6F0E8] truncate">
                {simScenario.movie_title} (What-If)
              </h4>
              <p className="text-[10px] text-[#89858C]">
                Reallocated to: {simScenario.screen_id} ({simScenario.screen_capacity} seats)
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Showtime Selection */}
            <div>
              <label className="text-[11px] font-medium text-[#89858C] block mb-1">
                Simulated Showtime Slot: <strong className="text-[#F6F0E8]">{simScenario.show_time}</strong>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { time: '10:15', label: 'Morning' },
                  { time: '13:30', label: 'Matinee' },
                  { time: '19:45', label: 'Evening Prime' },
                  { time: '22:45', label: 'Night' },
                ].map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => handleSimFieldChange('show_time', slot.time)}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                      simScenario.show_time === slot.time
                        ? 'bg-[#D8B46A] text-[#17171D] font-bold border-[#D8B46A]'
                        : 'bg-[#17171D] text-[#89858C] border-[#D8B46A]/20 hover:border-[#D8B46A]/50'
                    }`}
                  >
                    <div className="text-[11px] font-mono leading-none">{slot.time}</div>
                    <div className="text-[9px] mt-0.5 truncate">{slot.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ticket Price Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-[#89858C]">
                  Simulated Ticket Admission Price:
                </label>
                <span className="text-sm font-extrabold text-[#D8B46A]">
                  ₹{simScenario.ticket_price}
                </span>
              </div>
              <input
                type="range"
                min="120"
                max="600"
                step="20"
                value={simScenario.ticket_price}
                onChange={(e) => handleSimFieldChange('ticket_price', parseFloat(e.target.value))}
                className="w-full accent-[#D8B46A] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#89858C] mt-0.5">
                <span>₹120 (Discounted)</span>
                <span>₹280 (Standard)</span>
                <span>₹600 (Premium VIP)</span>
              </div>
            </div>

            {/* Screen Capacity Reallocation */}
            <div>
              <label className="text-[11px] font-medium text-[#89858C] block mb-1">
                Auditorium Screen Allocation:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Screen-1', cap: 350, type: 'IMAX / Premium Large Format', label: 'Screen-1 (IMAX - 350)' },
                  { id: 'Screen-2', cap: 250, type: 'Standard Dolby Atmos', label: 'Screen-2 (Atmos - 250)' },
                  { id: 'Screen-3', cap: 180, type: 'Standard Audi', label: 'Screen-3 (Standard - 180)' },
                  { id: 'Screen-4', cap: 120, type: 'Boutique / VIP', label: 'Screen-4 (Boutique - 120)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSimScenario((prev) => ({
                        ...prev,
                        screen_id: s.id,
                        screen_capacity: s.cap,
                        screen_type: s.type,
                      }));
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      simScenario.screen_id === s.id
                        ? 'bg-[#241018] text-[#D8B46A] border-[#D8B46A] font-bold shadow-md'
                        : 'bg-[#17171D] text-[#89858C] border-[#D8B46A]/20 hover:border-[#D8B46A]/50'
                    }`}
                  >
                    <div className="text-[11px]">{s.id}</div>
                    <div className="text-[10px] text-[#89858C]">{s.cap} Seats Capacity</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Day of Week Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#17171D]/60 border border-[#D8B46A]/15">
              <span className="text-[11px] text-[#89858C]">
                Weekend Prime Placement (Fri/Sat/Sun):
              </span>
              <button
                type="button"
                onClick={() => handleSimFieldChange('is_weekend', simScenario.is_weekend ? 0 : 1)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  simScenario.is_weekend
                    ? 'bg-[#D8B46A] text-[#17171D] border-[#D8B46A]'
                    : 'bg-[#241018] text-[#89858C] border-[#89858C]/30'
                }`}
              >
                {simScenario.is_weekend ? 'Weekend Surge ON' : 'Weekday Regular'}
              </button>
            </div>

            {/* Run Simulation Button */}
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F84464] to-[#E03150] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl shadow-[#F84464]/30 hover:opacity-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Dual XGBoost Inferences...</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Run Counterfactual Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Output Comparison View */}
      {simulationResult && (
        <div className="p-6 rounded-2xl bg-[#241018]/65 border border-[#D8B46A]/40 backdrop-blur-md shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8B46A]/20 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8B46A] px-2 py-0.5 rounded bg-[#D8B46A]/10 border border-[#D8B46A]/20">
                Paired Model Simulation Output
              </span>
              <h3 className="text-xl font-extrabold text-[#F6F0E8] mt-1">
                Comparative Scenario Assessment
              </h3>
            </div>

            <div className="text-xs text-[#89858C]">
              Model: <strong className="text-[#F6F0E8]">XGBoost Production Regressor</strong>
            </div>
          </div>

          {/* Delta KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Delta Tickets */}
            <div className="p-4 rounded-xl bg-[#17171D]/80 border border-[#D8B46A]/20 text-center">
              <span className="text-[10px] text-[#89858C] uppercase tracking-wider block">
                Net Attendance Shift
              </span>
              <div className="flex items-center justify-center space-x-1.5 mt-1">
                {simulationResult.differences.delta_tickets >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-rose-400" />
                )}
                <span
                  className={`text-2xl font-black ${
                    simulationResult.differences.delta_tickets >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {simulationResult.differences.delta_tickets >= 0 ? '+' : ''}
                  {simulationResult.differences.delta_tickets} Tickets
                </span>
              </div>
              <span className="text-[11px] text-[#89858C] block mt-0.5">
                ({simulationResult.differences.percentage_change_tickets >= 0 ? '+' : ''}
                {simulationResult.differences.percentage_change_tickets}%)
              </span>
            </div>

            {/* Delta Revenue */}
            <div className="p-4 rounded-xl bg-[#17171D]/80 border border-[#D8B46A]/20 text-center">
              <span className="text-[10px] text-[#89858C] uppercase tracking-wider block">
                Net Box Office Delta
              </span>
              <div className="flex items-center justify-center space-x-1.5 mt-1">
                <DollarSign className="w-5 h-5 text-[#D8B46A]" />
                <span
                  className={`text-2xl font-black ${
                    simulationResult.differences.delta_revenue >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {simulationResult.differences.delta_revenue >= 0 ? '+₹' : '-₹'}
                  {Math.abs(simulationResult.differences.delta_revenue).toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[11px] text-[#89858C] block mt-0.5">
                ({simulationResult.differences.percentage_change_revenue >= 0 ? '+' : ''}
                {simulationResult.differences.percentage_change_revenue}%)
              </span>
            </div>

            {/* Delta Occupancy Rate */}
            <div className="p-4 rounded-xl bg-[#17171D]/80 border border-[#D8B46A]/20 text-center">
              <span className="text-[10px] text-[#89858C] uppercase tracking-wider block">
                Auditorium Occupancy Shift
              </span>
              <span
                className={`text-2xl font-black block mt-1 ${
                  simulationResult.differences.delta_occupancy_pct >= 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {simulationResult.differences.delta_occupancy_pct >= 0 ? '+' : ''}
                {simulationResult.differences.delta_occupancy_pct}%
              </span>
              <span className="text-[11px] text-[#89858C] block mt-0.5">
                {simulationResult.base_result.predicted_occupancy_percentage}% &rarr;{' '}
                {simulationResult.simulated_result.predicted_occupancy_percentage}%
              </span>
            </div>
          </div>

          {/* Operational Takeaway Card */}
          <div className="p-4 rounded-xl bg-[#17171D] border border-emerald-500/30 text-emerald-200 text-xs flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-emerald-300 font-semibold mb-0.5">
                MANAGER OPERATIONAL TAKEAWAY
              </strong>
              <p className="text-[11px] text-emerald-100/90 leading-relaxed">
                {simulationResult.operational_takeaway}
              </p>
            </div>
          </div>

          {/* Side by Side Comparative Breakdown */}
          <div className="grid grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-4 rounded-xl bg-[#17171D]/60 border border-[#89858C]/20 space-y-2">
              <div className="flex items-center space-x-2">
                <img
                  src={basePoster}
                  alt="Base"
                  className="w-8 h-12 object-cover rounded border border-[#89858C]/30 flex-shrink-0"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#89858C] block">
                    Original Baseline
                  </span>
                  <span className="text-xs font-bold text-[#F6F0E8]">
                    {simulationResult.base_result.screen_id} • {simulationResult.base_result.show_time}
                  </span>
                </div>
              </div>
              <div className="flex justify-between border-t border-[#89858C]/15 pt-2">
                <span className="text-[#89858C]">Tickets Sold:</span>
                <span className="font-bold text-[#F6F0E8]">
                  {simulationResult.base_result.predicted_tickets_sold} / {simulationResult.base_result.screen_capacity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#89858C]">Revenue:</span>
                <span className="font-mono text-[#D8B46A]">
                  ₹{simulationResult.base_result.estimated_ticket_revenue.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#89858C]">Occupancy:</span>
                <span className="font-bold text-[#F6F0E8]">
                  {simulationResult.base_result.predicted_occupancy_percentage}%
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#17171D]/60 border border-[#D8B46A]/30 space-y-2">
              <div className="flex items-center space-x-2">
                <img
                  src={simPoster}
                  alt="Simulated"
                  className="w-8 h-12 object-cover rounded border border-[#D8B46A]/40 flex-shrink-0"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#D8B46A] block">
                    Simulated Scenario
                  </span>
                  <span className="text-xs font-bold text-[#F6F0E8]">
                    {simulationResult.simulated_result.screen_id} • {simulationResult.simulated_result.show_time}
                  </span>
                </div>
              </div>
              <div className="flex justify-between border-t border-[#D8B46A]/15 pt-2">
                <span className="text-[#89858C]">Tickets Sold:</span>
                <span className="font-bold text-[#D8B46A]">
                  {simulationResult.simulated_result.predicted_tickets_sold} / {simulationResult.simulated_result.screen_capacity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#89858C]">Revenue:</span>
                <span className="font-mono text-[#D8B46A]">
                  ₹{simulationResult.simulated_result.estimated_ticket_revenue.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#89858C]">Occupancy:</span>
                <span className="font-bold text-[#D8B46A]">
                  {simulationResult.simulated_result.predicted_occupancy_percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
