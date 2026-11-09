import React from 'react';
import {
  FileText,
  ShieldCheck,
  Cpu,
  Layers,
  Database,
  Lock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#D8B46A]/15 text-[#D8B46A] text-xs font-semibold border border-[#D8B46A]/30">
          <FileText className="w-3.5 h-3.5" />
          <span>System Architecture &amp; Responsible AI Statement</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#F6F0E8] mt-1">
          Technical Architecture, Methodology &amp; Ethics
        </h1>
        <p className="text-xs text-[#89858C] max-w-3xl mt-0.5">
          Algions AI Labs Private Limited — Cinema Ticket Demand Forecasting Technical Specification &amp; Governance Charter.
        </p>
      </div>

      {/* Section 1: Problem Formulation */}
      <div className="p-6 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/20 backdrop-blur-md space-y-4">
        <h2 className="text-base font-bold text-[#F6F0E8] uppercase tracking-wider flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D8B46A]"></span>
          <span>1. Problem Formulation &amp; Prediction Mechanics</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <div className="p-3.5 rounded-xl bg-[#17171D]/70 border border-[#D8B46A]/15 space-y-1">
            <strong className="text-[#D8B46A] block">Target Variable</strong>
            <span className="font-mono text-[#F6F0E8] font-bold text-sm">tickets_sold</span>
            <p className="text-[#89858C] text-[11px] leading-relaxed">
              Integer admissions count bounded strictly to [0, screen_capacity]. Evaluated via both raw and capacity-constrained metrics.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#17171D]/70 border border-[#D8B46A]/15 space-y-1">
            <strong className="text-[#D8B46A] block">Prediction Unit</strong>
            <span className="text-[#F6F0E8] font-bold text-sm">One Cinema Show</span>
            <p className="text-[#89858C] text-[11px] leading-relaxed">
              Single scheduled showtime in a designated auditorium screen on a specific calendar date (e.g. Screen-1 at 19:45 on 2024-06-15).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#17171D]/70 border border-[#D8B46A]/15 space-y-1">
            <strong className="text-[#D8B46A] block">Forecast Horizon</strong>
            <span className="text-[#F6F0E8] font-bold text-sm">T - 24 Hours</span>
            <p className="text-[#89858C] text-[11px] leading-relaxed">
              Predictions run exactly 24 hours prior to showtime. All historical features strictly exclude information concluding within the lookahead window.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Mathematical Formulations */}
      <div className="p-6 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/20 backdrop-blur-md space-y-4">
        <h2 className="text-base font-bold text-[#F6F0E8] uppercase tracking-wider flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D8B46A]"></span>
          <span>2. Evaluation Metric Formulations</span>
        </h2>

        <div className="space-y-3 text-xs text-[#89858C] leading-relaxed">
          <p>
            Standard percentage error metrics such as MAPE fail when actual show attendance approaches zero (division by zero singularity). CinePulse implements <strong className="text-[#F6F0E8]">Weighted Absolute Percentage Error (WAPE)</strong>:
          </p>

          <div className="p-4 rounded-xl bg-[#17171D] border border-[#D8B46A]/20 font-mono text-center text-[#D8B46A] text-sm">
            WAPE = ( Σ | y_true - y_pred | / Σ y_true ) × 100%
          </div>

          <p>
            WAPE provides a volume-weighted percentage error that faithfully captures revenue impact across both small indie matinees and 350-seat IMAX sellouts.
          </p>
        </div>
      </div>

      {/* Section 3: Responsible AI & Ethical Principles */}
      <div className="p-6 rounded-2xl bg-[#241018]/45 border border-[#D8B46A]/20 backdrop-blur-md space-y-5">
        <h2 className="text-base font-bold text-[#F6F0E8] uppercase tracking-wider flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D8B46A]"></span>
          <span>3. Responsible AI, Privacy &amp; Governance Charter</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Privacy & Zero PII */}
          <div className="p-4 rounded-xl bg-[#17171D]/70 border border-[#D8B46A]/15 space-y-1.5">
            <div className="flex items-center space-x-2 text-[#D8B46A] font-bold">
              <Lock className="w-4 h-4" />
              <span>Zero Customer Personal Data (PII)</span>
            </div>
            <p className="text-[#89858C] text-[11px] leading-relaxed">
              CinePulse operates exclusively at the aggregate transactional show level. No individual customer identifiers, payment tokens, phone numbers, or user demographics are collected or processed.
            </p>
          </div>

          {/* Synthetic Data Transparency */}
          <div className="p-4 rounded-xl bg-[#17171D]/70 border border-[#D8B46A]/15 space-y-1.5">
            <div className="flex items-center space-x-2 text-[#D8B46A] font-bold">
              <Database className="w-4 h-4" />
              <span>Synthetic Generation Transparency</span>
            </div>
            <p className="text-[#89858C] text-[11px] leading-relaxed">
              The multiplex dataset (2,880 shows across 180 days) is programmatically synthesized using microeconomic demand curves, lifecycle decay, and stochastic shocks. Records are clearly labeled as synthetic.
            </p>
          </div>

          {/* Human-in-the-Loop Decision Support */}
          <div className="p-4 rounded-xl bg-[#17171D]/70 border border-[#D8B46A]/15 space-y-1.5">
            <div className="flex items-center space-x-2 text-[#D8B46A] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Human-in-the-Loop Decision Boundary</span>
            </div>
            <p className="text-[#89858C] text-[11px] leading-relaxed">
              The platform core philosophy is <span className="text-[#F6F0E8] font-semibold">PREDICT &rarr; UNDERSTAND &rarr; SIMULATE &rarr; RECOMMEND &rarr; DECIDE</span>. Autonomous operational overrides (e.g. canceling shows or locking prices) are intentionally disallowed.
            </p>
          </div>

          {/* Uncertainty Quantification */}
          <div className="p-4 rounded-xl bg-[#17171D]/70 border border-[#D8B46A]/15 space-y-1.5">
            <div className="flex items-center space-x-2 text-[#D8B46A] font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Uncertainty &amp; Confidence Bands</span>
            </div>
            <p className="text-[#89858C] text-[11px] leading-relaxed">
              Point predictions are never presented in isolation. Every forecast features 90% confidence prediction intervals, explicitly highlighting cold-start release volatility.
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Known Failure Modes & Limitations */}
      <div className="p-6 rounded-2xl bg-[#241018]/45 border border-amber-500/30 backdrop-blur-md space-y-4">
        <h2 className="text-base font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>4. Documented Model Limitations &amp; Failure Modes</span>
        </h2>

        <div className="space-y-2.5 text-xs text-[#89858C] leading-relaxed">
          <div className="p-3 rounded-xl bg-[#17171D]/60 border border-amber-500/20">
            <strong className="text-[#F6F0E8] block mb-0.5">1. Severe Exogenous Weather &amp; Civic Disruptions:</strong>
            Unprecedented floods, extreme snowstorms, or transit strikes depress cinema attendance irrespective of historical genre popularity. The model lacks external weather telemetry.
          </div>

          <div className="p-3 rounded-xl bg-[#17171D]/60 border border-amber-500/20">
            <strong className="text-[#F6F0E8] block mb-0.5">2. Viral Word-of-Mouth Discontinuities (Sleeper Hits / Sudden Flops):</strong>
            Social media virality can dramatically accelerate or extinguish demand within hours, defying opening weekend tracking.
          </div>

          <div className="p-3 rounded-xl bg-[#17171D]/60 border border-amber-500/20">
            <strong className="text-[#F6F0E8] block mb-0.5">3. Non-Causal Pricing Elasticity:</strong>
            Observational models cannot guarantee unconfounded causal price elasticity. What-if price simulations must be treated as guidance rather than deterministic guarantees.
          </div>
        </div>
      </div>
    </div>
  );
};

