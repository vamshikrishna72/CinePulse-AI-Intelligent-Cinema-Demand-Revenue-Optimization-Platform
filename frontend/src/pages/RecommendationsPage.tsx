import React, { useEffect, useState } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Users,
  Maximize2,
  DollarSign,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { apiService } from '../services/api';
import { RecommendationItem } from '../types/api';

interface RecommendationsPageProps {
  onNavigateToSimulator?: () => void;
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({
  onNavigateToSimulator,
}) => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [implementedIds, setImplementedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const recs = await apiService.getRecommendations();
      setRecommendations(recs);
    } catch (err: any) {
      setError(err.message || 'Failed to load recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleImplemented = (id: string) => {
    setImplementedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredRecs = recommendations.filter((r) => {
    if (selectedCategory === 'ALL') return true;
    return r.type === selectedCategory;
  });

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'screen_reallocation':
        return Maximize2;
      case 'staffing':
        return Users;
      case 'pricing_promo':
        return DollarSign;
      case 'cold_start_watch':
        return Sparkles;
      default:
        return Lightbulb;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#D8B46A] border-t-transparent animate-spin"></div>
        <p className="text-sm text-[#89858C]">Evaluating screening forecasts against operational rules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl bg-[#241018]/50 border border-red-500/30 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="text-lg font-bold text-[#F6F0E8]">Recommendations Engine Offline</h3>
        <p className="text-sm text-[#89858C] max-w-md mx-auto">{error}</p>
        <button
          onClick={loadRecommendations}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#D8B46A]/15 text-[#D8B46A] text-xs font-semibold border border-[#D8B46A]/30">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Rule-Governed Prescriptive Analytics</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#F6F0E8] mt-1">
            Smart Operational Recommendations
          </h1>
          <p className="text-xs text-[#89858C] max-w-2xl mt-0.5">
            Prescriptive suggestions translated from XGBoost attendance forecasts to optimize screen capacity allocation, concession staffing, and mid-week pricing.
          </p>
        </div>

        {/* Implemented Counter */}
        <div className="p-3 rounded-xl bg-[#241018] border border-[#D8B46A]/20 text-right">
          <span className="text-[10px] text-[#89858C] uppercase tracking-wider block">
            Actions Acknowledged
          </span>
          <span className="text-lg font-extrabold text-[#D8B46A]">
            {implementedIds.size} / {recommendations.length}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#D8B46A]/15 pb-3">
        {[
          { id: 'ALL', label: 'All Suggestions' },
          { id: 'screen_reallocation', label: 'Screen Reallocation' },
          { id: 'staffing', label: 'Staffing Reinforcement' },
          { id: 'pricing_promo', label: 'Pricing & Promos' },
          { id: 'cold_start_watch', label: 'Cold-Start Tracking' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === tab.id
                ? 'bg-[#D8B46A] text-[#17171D] shadow-md shadow-[#D8B46A]/15'
                : 'bg-[#241018] text-[#89858C] border border-[#D8B46A]/20 hover:text-[#F6F0E8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-4">
        {filteredRecs.map((rec) => {
          const Icon = getCategoryIcon(rec.type);
          const isDone = implementedIds.has(rec.id);

          return (
            <div
              key={rec.id}
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                isDone
                  ? 'bg-[#17171D]/40 border-emerald-500/20 opacity-75'
                  : 'bg-[#241018]/55 border-[#D8B46A]/25 hover:border-[#D8B46A]/50 shadow-xl'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-[#17171D] text-[#D8B46A] border border-[#D8B46A]/25 flex-shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-[#F6F0E8]">{rec.title}</h3>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          rec.priority === 'high'
                            ? 'bg-rose-950/70 text-rose-300 border-rose-500/40'
                            : rec.priority === 'medium'
                            ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                            : 'bg-[#241018] text-[#89858C] border-[#89858C]/30'
                        }`}
                      >
                        {rec.priority} Priority
                      </span>
                      {rec.predicted_occupancy_pct && (
                        <span className="text-[10px] text-[#D8B46A] font-semibold">
                          Occupancy: {rec.predicted_occupancy_pct}%
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#89858C] leading-relaxed max-w-2xl">
                      {rec.description}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 flex-shrink-0 sm:self-center">
                  <button
                    onClick={() => handleToggleImplemented(rec.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                      isDone
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-[#241018] text-[#D8B46A] border border-[#D8B46A]/30 hover:bg-[#D8B46A] hover:text-[#17171D]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isDone ? 'Implemented' : 'Acknowledge'}</span>
                  </button>

                  {onNavigateToSimulator && (
                    <button
                      onClick={onNavigateToSimulator}
                      className="p-1.5 rounded-xl bg-[#241018] text-[#89858C] hover:text-[#D8B46A] border border-[#D8B46A]/20 transition-colors"
                      title="Simulate scenario adjustment"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Box Callout */}
              <div className="mt-3.5 p-3 rounded-xl bg-[#17171D]/80 border border-[#D8B46A]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-x-1">
                  <strong className="text-[#D8B46A]">Suggested Action:</strong>
                  <span className="text-[#F6F0E8]">{rec.suggested_action}</span>
                </div>
                {rec.expected_revenue_impact && (
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold flex-shrink-0">
                    {rec.expected_revenue_impact}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
