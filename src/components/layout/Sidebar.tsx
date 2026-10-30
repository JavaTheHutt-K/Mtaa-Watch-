import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Map,
  Sparkles,
  ClipboardList,
  BarChart3,
  Shield,
  HelpCircle,
  Home,
  CheckCircle2,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useReports } from '../../context/ReportContext';

export type ActiveTab =
  | 'landing'
  | 'dashboard'
  | 'report'
  | 'map'
  | 'insights'
  | 'reports-list'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const { user, switchRole } = useAuth();
  const { stats } = useReports();

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Intelligence Dashboard',
      icon: LayoutDashboard,
      badge: stats.criticalIncidents > 0 ? `${stats.criticalIncidents} crit` : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'report' as ActiveTab,
      label: 'Report a Problem',
      icon: PlusCircle,
      accent: true,
    },
    {
      id: 'map' as ActiveTab,
      label: 'Geospatial Monitor',
      icon: Map,
      badge: `${stats.totalReports}`,
      badgeColor: 'bg-slate-700 text-slate-300',
    },
    {
      id: 'insights' as ActiveTab,
      label: 'AI Strategic Insights',
      icon: Sparkles,
      highlight: true,
    },
    {
      id: 'reports-list' as ActiveTab,
      label: 'Incident Management',
      icon: ClipboardList,
      badge: stats.pendingReports > 0 ? `${stats.pendingReports}` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Analytics & Reporting',
      icon: BarChart3,
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container: Deep Navy themed */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0c1427] text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full bg-[#0c1427] rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-teal-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">MtaaWatch</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-teal-400/80 font-medium tracking-wide">
                Smarter Communities. Cleaner Cities.
              </p>
            </div>
          </div>
        </div>

        {/* Live System Indicator */}
        <div className="px-5 py-2.5 bg-slate-900/50 border-b border-slate-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400 font-medium text-[11px]">Nairobi & Kiambu Grid</span>
          </div>
          <span className="text-[10px] font-mono text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/50">
            Gemini 3.8 Live
          </span>
        </div>

        {/* Primary Navigation */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Operations & Oversight
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/25 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : item.highlight ? 'text-teal-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="flex h-2 w-2 rounded-full bg-teal-400" />
                  )}
                </div>
              </button>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Platform Pages
          </div>

          <button
            onClick={() => handleNavClick('landing')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'landing'
                ? 'bg-slate-800 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Home className="w-4 h-4 text-slate-400" />
              <span>Public Landing Page</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        {/* User Role Card & Fast Switcher */}
        <div className="p-3.5 m-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate w-32">{user?.name}</p>
                <p className="text-[10px] text-teal-400/90 font-medium truncate">{user?.role}</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Online" />
          </div>

          {/* Quick Role Switcher for Hackathon Judges */}
          <div className="pt-2 border-t border-slate-800">
            <p className="text-[10px] text-slate-400 mb-1.5 font-medium flex items-center justify-between">
              <span>Demo Role Simulation:</span>
            </p>
            <div className="grid grid-cols-3 gap-1">
              {(['Administrator', 'Authority Officer', 'Community Reporter'] as const).map((r) => {
                const isCurrent = user?.role === r;
                return (
                  <button
                    key={r}
                    onClick={() => switchRole(r)}
                    className={`text-[9px] py-1 px-1 rounded font-medium truncate transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-teal-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                    title={r}
                  >
                    {r.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>v2.4 Hackathon Edition</span>
          <span className="text-teal-400 font-mono">KE-47</span>
        </div>
      </aside>
    </>
  );
};
