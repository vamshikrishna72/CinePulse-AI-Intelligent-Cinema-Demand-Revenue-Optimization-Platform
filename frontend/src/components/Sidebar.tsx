import React from 'react';
import {
  LayoutDashboard,
  Film,
  TrendingUp,
  BarChart3,
  SlidersHorizontal,
  Sparkles,
  BrainCircuit,
  Lightbulb,
  FileText,
} from 'lucide-react';

export type NavTabId =
  | 'dashboard'
  | 'showtimes'
  | 'forecast'
  | 'analytics'
  | 'simulator'
  | 'coldstart'
  | 'models'
  | 'recommendations'
  | 'docs';

interface SidebarProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    {
      id: 'dashboard' as NavTabId,
      label: 'Movies & Home',
      description: 'BookMyShow Catalog & KPIs',
      icon: LayoutDashboard,
    },
    {
      id: 'showtimes' as NavTabId,
      label: 'Theaters & Showtimes',
      description: 'Color-Coded Screen Schedules',
      icon: Film,
    },
    {
      id: 'forecast' as NavTabId,
      label: 'Demand Forecasting',
      description: 'Show-Level ML Inference',
      icon: TrendingUp,
    },
    {
      id: 'simulator' as NavTabId,
      label: 'What-If Simulator',
      description: 'Counterfactual Scenario Testing',
      icon: SlidersHorizontal,
    },
    {
      id: 'coldstart' as NavTabId,
      label: 'Cold-Start AI',
      description: 'Premiere & New Release Priors',
      icon: Sparkles,
    },
    {
      id: 'recommendations' as NavTabId,
      label: 'Recommendations',
      description: 'Staffing & Screen Allocation',
      icon: Lightbulb,
    },
    {
      id: 'analytics' as NavTabId,
      label: 'Operational Analytics',
      description: 'Daily Trends & Multiplex Usage',
      icon: BarChart3,
    },
    {
      id: 'models' as NavTabId,
      label: 'Model Audit',
      description: 'Leaderboard & Evaluation Metrics',
      icon: BrainCircuit,
    },
    {
      id: 'docs' as NavTabId,
      label: 'Architecture & Ethics',
      description: 'Methodology, Scope & Governance',
      icon: FileText,
    },
  ];

  return (
    <aside className="w-64 bg-[#17171D] border-r border-white/10 min-h-[calc(100vh-105px)] flex flex-col justify-between p-3.5 hidden md:flex">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-black tracking-widest text-neutral-400 uppercase">
          Cinema Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-start space-x-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                isActive
                  ? 'bg-[#1E202B] text-white border border-[#F84464]/60 shadow-lg shadow-[#F84464]/10 font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div
                className={`mt-0.5 p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#F84464] text-white'
                    : 'bg-white/5 text-neutral-400 group-hover:text-white group-hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs block truncate">{item.label}</span>
                <span className="text-[10px] text-neutral-500 block truncate group-hover:text-neutral-400">
                  {item.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Branding Info */}
      <div className="p-3 rounded-xl bg-[#1E202B] border border-white/5 space-y-1 text-center">
        <div className="text-[10px] font-bold text-white uppercase tracking-wider">
          Algions AI Labs Private Limited
        </div>
        <div className="text-[9px] text-neutral-400">
          BookMyShow-Style Demand Platform v2.4
        </div>
      </div>
    </aside>
  );
};
