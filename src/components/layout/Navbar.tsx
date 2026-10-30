import React from 'react';
import { Menu, PlusCircle, RefreshCw, AlertTriangle, ShieldCheck, Download, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useReports } from '../../context/ReportContext';
import { ActiveTab } from './Sidebar';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  setIsOpenMobile: (open: boolean) => void;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  landing: {
    title: 'Public Platform Gateway',
    subtitle: 'Citizen empowerment & municipal infrastructure intelligence',
  },
  dashboard: {
    title: 'Operations Intelligence Dashboard',
    subtitle: 'Real-time multi-county civic telemetry & risk prioritization',
  },
  report: {
    title: 'AI Problem Detection & Citizen Reporting',
    subtitle: 'Computer-vision assisted hazard classification and geolocation',
  },
  map: {
    title: 'Geospatial Community Monitoring',
    subtitle: 'Interactive spatial incident mapping across Nairobi & Kiambu grid',
  },
  insights: {
    title: 'AI Strategic Municipal Insights',
    subtitle: 'LLM synthesis for predictive civic risk and proactive dispatch',
  },
  'reports-list': {
    title: 'Incident Queue & Lifecycle Management',
    subtitle: 'Dispatch workflows, assignment, and resolution verification',
  },
  analytics: {
    title: 'Civic Analytics & Trend Reporting',
    subtitle: 'Aggregated metrics, resolution velocity, and dataset export',
  },
  settings: {
    title: 'Platform Configuration & Role Control',
    subtitle: 'Access controls and system simulation preferences',
  },
};

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, setIsOpenMobile }) => {
  const { user } = useAuth();
  const { stats, resetDemoData, exportToCSV } = useReports();

  const currentTabInfo = TAB_TITLES[activeTab] || {
    title: 'MtaaWatch AI',
    subtitle: 'Smarter Communities. Cleaner Cities.',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Page Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpenMobile(true)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {currentTabInfo.title}
              </h1>
              {stats.criticalIncidents > 0 && activeTab !== 'landing' && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  {stats.criticalIncidents} Critical
                </span>
              )}
            </div>
            <p className="hidden md:block text-xs text-slate-500 font-medium">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Reset for Judges */}
          <button
            onClick={() => {
              if (window.confirm('Reset all community records back to original Kenyan demonstration dataset?')) {
                resetDemoData();
              }
            }}
            title="Reset to initial Kenyan demo records"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo</span>
          </button>

          {/* Quick CSV Export */}
          <button
            onClick={exportToCSV}
            title="Export reports as CSV"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Export CSV</span>
          </button>

          {/* Primary CTA: Report a Problem */}
          {activeTab !== 'report' && (
            <button
              onClick={() => setActiveTab('report')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-500 hover:to-teal-600 shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Problem</span>
            </button>
          )}

          {/* Role badge */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900 leading-none">{user?.name}</p>
              <p className="text-[10px] text-teal-700 font-semibold mt-0.5">{user?.role}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-teal-400 flex items-center justify-center font-bold text-xs ring-2 ring-teal-500/30">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
