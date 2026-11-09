import React from 'react';
import {
  LayoutDashboard,
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
      label: 'Control Center',
      description: 'Multiplex Overview & Live Board',
      icon: LayoutDashboard,
    },
    {
      id: 'forecast' as NavTabId,
      label: 'Demand Forecasting',
      description: 'Show-Level ML Inference',
      icon: TrendingUp,
    },
    {
      id: 'analytics' as NavTabId,
      label: 'Operational Analytics',
      description: 'Daily Trends & Screen Usage',
      icon: BarChart3,
    },
    {
      id: 'simulator' as NavTabId,
      label: 'What-If Simulator',
      description: 'Counterfactual Scenario Testing',
      icon: SlidersHorizontal,
    },
    {
      id: 'coldstart' as NavTabId,
      label: 'Cold-Start Intelligence',
      description: 'New Releases & Prior Anchoring',
      icon: Sparkles,
    },
    {
      id: 'models' as NavTabId,
      label: 'Model Intelligence',
      description: 'Leaderboard & Evaluation Diagnostics',
      icon: BrainCircuit,
    },
    {
      id: 'recommendations' as NavTabId,
      label: 'Smart Recommendations',
      description: 'Staffing & Screen Allocation',
      icon: Lightbulb,
    },
    {
      id: 'docs' as NavTabId,
      label: 'Architecture & AI Ethics',
      description: 'Methodology, Scope & Governance',
      icon: FileText,
    },
  ];

  return (
    <aside className="w-64 bg-[#17171D] border-r border-[#D8B46A]/15 min-h-[calc(100vh-65px)] flex flex-col justify-between p-4">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-[#89858C] uppercase">
          Navigation Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-start space-x-3 px-3.5 py-3 rounded-xl text-left transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-[#241018] to-[#241018]/60 text-[#F6F0E8] border border-[#D8B46A]/40 shadow-md shadow-[#D8B46A]/5'
                  : 'text-[#89858C] hover:text-[#F6F0E8] hover:bg-[#241018]/30'
              }`}
            >
              <div
                className={`mt-0.5 p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#D8B46A] text-[#17171D]'
                    : 'bg-[#241018]/60 text-[#89858C] group-hover:text-[#D8B46A]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div
                  className={`text-sm font-medium leading-none ${
                    isActive ? 'text-[#F6F0E8] font-semibold' : 'text-[#c7c4c8]'
                  }`}
                >
                  {item.label}
                </div>
                <div className="text-[11px] text-[#89858C] truncate mt-1">
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Decision Support Advisory Card */}
      <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#241018]/60 to-[#17171D] border border-[#D8B46A]/20 mt-6">
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#D8B46A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D8B46A]"></span>
          <span>Decision Support Mode</span>
        </div>
        <p className="text-[11px] text-[#89858C] mt-1.5 leading-relaxed">
          CinePulse provides advisory forecasts with uncertainty bands to empower cinema managers. Automated operational overrides are disabled.
        </p>
      </div>
    </aside>
  );
};
