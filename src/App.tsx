/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ReportProvider } from './context/ReportContext';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { IntelligenceDashboard } from './components/dashboard/IntelligenceDashboard';
import { ProblemReportingForm } from './components/reporting/ProblemReportingForm';
import { GeospatialMonitoringView } from './components/map/GeospatialMonitoringView';
import { AIInsightsModule } from './components/insights/AIInsightsModule';
import { ReportManagementView } from './components/reports/ReportManagementView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ProfileSettingsView } from './components/profile/ProfileSettingsView';
import { AuthModal } from './components/auth/AuthModal';
import { CommunityReport } from './types';

function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [inspectedReport, setInspectedReport] = useState<CommunityReport | null>(null);

  const handleSelectReportForInspect = (report: CommunityReport) => {
    setInspectedReport(report);
  };

  const handleReportCreated = (_reportId: string) => {
    // Report created callback
  };

  // If on landing page, display landing experience with quick switch
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        {/* Landing Top Header */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 via-emerald-500 to-cyan-400 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
              MW
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                MtaaWatch <span className="text-teal-600">AI</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-teal-600 px-3 py-1.5 transition-colors cursor-pointer"
            >
              Operations Dashboard
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-slate-700 hover:text-teal-600 px-3 py-1.5 transition-colors cursor-pointer"
            >
              Geospatial Map
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              Report a Problem
            </button>
          </div>
        </header>

        {/* Landing Page Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <LandingPage setActiveTab={setActiveTab} />
        </main>

        {/* Landing Footer */}
        <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-700">MtaaWatch AI • Smarter Communities. Cleaner Cities.</p>
          <p>
            AI-powered community problem detection & municipal triage across Kenyan counties.
          </p>
        </footer>
      </div>
    );
  }

  // Dashboard / Operational Shell with Dark Navy Sidebar
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Dark Navy Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setIsOpenMobile={setIsOpenMobile}
        />

        {/* Dynamic View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <IntelligenceDashboard
              setActiveTab={setActiveTab}
              onSelectReportForInspect={handleSelectReportForInspect}
            />
          )}

          {activeTab === 'report' && (
            <ProblemReportingForm
              setActiveTab={setActiveTab}
              onReportCreated={handleReportCreated}
            />
          )}

          {activeTab === 'map' && (
            <GeospatialMonitoringView
              setActiveTab={setActiveTab}
              initialSelectedReport={inspectedReport}
            />
          )}

          {activeTab === 'insights' && <AIInsightsModule />}

          {activeTab === 'reports-list' && (
            <ReportManagementView initialSelectedReport={inspectedReport} />
          )}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'settings' && <ProfileSettingsView />}
        </main>
      </div>

      {/* Authentication Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ReportProvider>
        <MainApp />
      </ReportProvider>
    </AuthProvider>
  );
}
