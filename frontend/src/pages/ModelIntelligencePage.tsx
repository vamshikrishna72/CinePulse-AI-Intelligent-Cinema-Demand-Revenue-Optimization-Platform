import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  Award,
  Layers,
  BarChart2,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { apiService } from '../services/api';
import { ModelMetricsResponse } from '../types/api';

export const ModelIntelligencePage: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [explainData, setExplainData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModelIntelligence();
  }, []);

  const loadModelIntelligence = async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, exp] = await Promise.all([
        apiService.getModelMetrics(),
        apiService.getModelExplainability(),
      ]);
      setMetrics(m);
      setExplainData(exp);
    } catch (err: any) {
      setError(err.message || 'Failed to load model intelligence data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#D8B46A] border-t-transparent animate-spin"></div>
        <p className="text-sm text-[#89858C]">Loading model benchmark metrics and feature importance...</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-8 rounded-2xl bg-[#241018]/50 border border-red-500/30 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="text-lg font-bold text-[#F6F0E8]">Model Intelligence Unavailable</h3>
        <p className="text-sm text-[#89858C] max-w-md mx-auto">{error}</p>
        <button
          onClick={loadModelIntelligence}
          className="px-4 py-2 bg-[#D8B46A] text-[#17171D] font-semibold text-xs rounded-xl hover:bg-[#F4E2BD] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Format top feature importances for chart
  const topXgbFeatures = explainData?.xgboost
    ? Object.entries(explainData.xgboost)
        .slice(0, 10)
        .map(([feature, gain]) => ({
          feature: feature.replace('time_of_day_category_', 'Time: ').replace('screen_type_', 'Screen: '),
          gain: Number((Number(gain) * 100).toFixed(1)),
        }))
        .reverse()
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#D8B46A]/15 text-[#D8B46A] text-xs font-semibold border border-[#D8B46A]/30">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Evaluation Benchmarks &amp; Model Audit</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#F6F0E8] mt-1">
          Model Intelligence &amp; Chronological Validation
        </h1>
        <p className="text-xs text-[#89858C] max-w-3xl mt-0.5">
          Defensible comparison between the naive capacity-adjusted historical baseline, Random Forest, and the champion XGBoost regressor on held-out test data untouched during tuning.
        </p>
      </div>

      {/* Model Benchmark Leaderboard Table */}
      <div className="p-6 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/20 backdrop-blur-md shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8B46A]/15 pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#F6F0E8] uppercase tracking-wider">
              Held-Out Test Set Performance Leaderboard (N = 432 Shows)
            </h3>
            <p className="text-xs text-[#89858C]">
              Chronological split: Evaluated on future unseen shows from 2024-06-02 to 2024-06-28
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30">
            Selected Champion: XGBoost Regressor
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D8B46A]/15 text-[#89858C] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Model Approach</th>
                <th className="py-3 px-3 text-right">Constrained WAPE %</th>
                <th className="py-3 px-3 text-right">Constrained MAE</th>
                <th className="py-3 px-3 text-right">Constrained RMSE</th>
                <th className="py-3 px-3 text-right">Raw MAE</th>
                <th className="py-3 px-3 text-right">WAPE Error Reduction</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8B46A]/10 text-[#F6F0E8]">
              {/* XGBoost Champion */}
              <tr className="bg-[#241018]/70 border-l-4 border-l-[#D8B46A]">
                <td className="py-3.5 px-3">
                  <div className="font-extrabold text-[#F6F0E8] flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-[#D8B46A]" />
                    <span>XGBoost Regressor (Champion)</span>
                  </div>
                  <span className="text-[11px] text-[#89858C]">
                    Gradient Boosted Decision Trees (200 trees, lr=0.05, max_depth=5)
                  </span>
                </td>
                <td className="py-3.5 px-3 text-right font-extrabold text-lg text-[#D8B46A]">
                  {metrics.test.xgboost.constrained_wape}%
                </td>
                <td className="py-3.5 px-3 text-right font-bold text-[#F6F0E8]">
                  {metrics.test.xgboost.constrained_mae} tickets
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-[#89858C]">
                  {metrics.test.xgboost.constrained_rmse}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-[#89858C]">
                  {metrics.test.xgboost.raw_mae}
                </td>
                <td className="py-3.5 px-3 text-right font-extrabold text-emerald-400">
                  -48.9% vs Baseline
                </td>
                <td className="py-3.5 px-3 text-center">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                    Production Champion
                  </span>
                </td>
              </tr>

              {/* Random Forest */}
              <tr className="hover:bg-[#241018]/40">
                <td className="py-3 px-3">
                  <div className="font-semibold text-[#F6F0E8]">Random Forest Regressor</div>
                  <span className="text-[11px] text-[#89858C]">
                    Ensemble Bagging (150 trees, max_depth=12)
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-bold text-[#F6F0E8]">
                  {metrics.test.random_forest.constrained_wape}%
                </td>
                <td className="py-3 px-3 text-right font-medium text-[#F6F0E8]">
                  {metrics.test.random_forest.constrained_mae} tickets
                </td>
                <td className="py-3 px-3 text-right font-mono text-[#89858C]">
                  {metrics.test.random_forest.constrained_rmse}
                </td>
                <td className="py-3 px-3 text-right font-mono text-[#89858C]">
                  {metrics.test.random_forest.raw_mae}
                </td>
                <td className="py-3 px-3 text-right font-bold text-emerald-400">
                  -45.1% vs Baseline
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#241018] text-[#89858C] border border-[#89858C]/20">
                    Candidate Benchmark
                  </span>
                </td>
              </tr>

              {/* Baseline */}
              <tr className="hover:bg-[#241018]/40">
                <td className="py-3 px-3">
                  <div className="font-semibold text-[#89858C]">
                    Capacity-Adjusted Historical Baseline
                  </div>
                  <span className="text-[11px] text-[#89858C]">
                    Domain baseline: Screen Capacity × Historical Movie Occupancy
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-bold text-[#89858C]">
                  {metrics.test.baseline.constrained_wape}%
                </td>
                <td className="py-3 px-3 text-right font-medium text-[#89858C]">
                  {metrics.test.baseline.constrained_mae} tickets
                </td>
                <td className="py-3 px-3 text-right font-mono text-[#89858C]">
                  {metrics.test.baseline.constrained_rmse}
                </td>
                <td className="py-3 px-3 text-right font-mono text-[#89858C]">
                  {metrics.test.baseline.raw_mae}
                </td>
                <td className="py-3 px-3 text-right font-mono text-[#89858C]">
                  Reference 0.0%
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#241018] text-[#89858C] border border-[#89858C]/20">
                    Naive Baseline
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Segmented Error Analysis & Global Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segmented Error Breakdown */}
        <div className="p-5 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/15 backdrop-blur-md space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#F6F0E8] uppercase tracking-wider">
              Segmented Error Diagnostics (Champion Model)
            </h3>
            <p className="text-[11px] text-[#89858C]">
              Error behavior across demand regimes and cold-start conditions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D8B46A]/15 text-[#89858C] uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-2">Segment</th>
                  <th className="py-2.5 px-2 text-right">Sample N</th>
                  <th className="py-2.5 px-2 text-right">MAE</th>
                  <th className="py-2.5 px-2 text-right">RMSE</th>
                  <th className="py-2.5 px-2 text-right">WAPE %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8B46A]/10 text-[#F6F0E8]">
                {Object.entries(metrics.test_segmented_analysis || {}).map(([segName, segVal]) => (
                  <tr key={segName} className="hover:bg-[#241018]/40">
                    <td className="py-2.5 px-2 font-medium capitalize">
                      {segName.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-[#89858C]">
                      {segVal.sample_count}
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-[#F6F0E8]">
                      {segVal.constrained_mae}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-[#89858C]">
                      {segVal.constrained_rmse}
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-[#D8B46A]">
                      {segVal.constrained_wape}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Feature Importance Chart */}
        <div className="p-5 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/15 backdrop-blur-md space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#F6F0E8] uppercase tracking-wider">
              Global Feature Importance (XGBoost Relative Gain)
            </h3>
            <p className="text-[11px] text-[#89858C]">
              Top 10 structural features driving overall ticket demand variance
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topXgbFeatures}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#241018" />
                <XAxis type="number" unit="%" stroke="#89858C" fontSize={10} />
                <YAxis dataKey="feature" type="category" stroke="#89858C" fontSize={10} width={130} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#17171D',
                    borderColor: 'rgba(216, 180, 106, 0.3)',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="gain" name="Relative Gain %" fill="#D8B46A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chronological Validation Protocol Card */}
      <div className="p-5 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/15 backdrop-blur-md space-y-3">
        <h3 className="text-sm font-bold text-[#F6F0E8] uppercase tracking-wider">
          Chronological Splitting &amp; Leakage Protection Protocol
        </h3>
        <p className="text-xs text-[#89858C] leading-relaxed">
          Standard k-fold cross-validation is strictly invalid for time-dependent cinema sales due to temporal lookahead leakage. CinePulse enforces a strict chronological partition across the 180-day operating history:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-[#17171D]/60 border border-[#89858C]/20">
            <span className="text-[10px] text-[#89858C] uppercase tracking-wider block">
              1. Training Split (70%)
            </span>
            <span className="text-sm font-bold text-[#F6F0E8]">2,000 Shows</span>
            <span className="text-[11px] text-[#89858C] block mt-0.5">
              2024-01-01 to 2024-05-04
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#17171D]/60 border border-[#D8B46A]/20">
            <span className="text-[10px] text-[#D8B46A] uppercase tracking-wider block">
              2. Validation Split (15%)
            </span>
            <span className="text-sm font-bold text-[#D8B46A]">448 Shows</span>
            <span className="text-[11px] text-[#89858C] block mt-0.5">
              2024-05-05 to 2024-06-01 (Model Tuning)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#17171D]/60 border border-[#B66B7B]/30">
            <span className="text-[10px] text-[#f7a8b8] uppercase tracking-wider block">
              3. Test Split (15%)
            </span>
            <span className="text-sm font-bold text-[#f7a8b8]">432 Shows</span>
            <span className="text-[11px] text-[#89858C] block mt-0.5">
              2024-06-02 to 2024-06-28 (Untouched Benchmark)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
