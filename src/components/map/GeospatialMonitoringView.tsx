import React, { useState, useMemo } from 'react';
import {
  Filter,
  Search,
  MapPin,
  Sparkles,
  Layers,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Shield,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';
import { LeafletMap } from './LeafletMap';
import { useReports } from '../../context/ReportContext';
import { useAuth } from '../../context/AuthContext';
import { CommunityReport, ProblemCategory, ReportStatus, SeverityLevel } from '../../types';
import { ActiveTab } from '../layout/Sidebar';

interface GeospatialMonitoringViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  initialSelectedReport?: CommunityReport | null;
}

const CATEGORIES: ('All' | ProblemCategory)[] = [
  'All',
  'Illegal garbage dumping',
  'Overflowing waste bins',
  'Blocked drainage',
  'Flooding',
  'Damaged roads',
  'Broken streetlights',
  'Water leakage',
  'Other environmental or infrastructure problems',
];

const SEVERITIES: ('All' | SeverityLevel)[] = ['All', 'Critical', 'High', 'Medium', 'Low'];
const STATUSES: ('All' | ReportStatus)[] = [
  'All',
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
];

export const GeospatialMonitoringView: React.FC<GeospatialMonitoringViewProps> = ({
  setActiveTab,
  initialSelectedReport,
}) => {
  const { reports, updateReportStatus } = useReports();
  const { user } = useAuth();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProblemCategory>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<'All' | SeverityLevel>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | ReportStatus>('All');
  const [showDemoFilter, setShowDemoFilter] = useState<'all' | 'live' | 'demo'>('all');

  // Selected report for side drawer
  const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(
    initialSelectedReport || (reports.length > 0 ? reports[0] : null)
  );

  // Status update modal / inline toggle
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.title.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.location.name.toLowerCase().includes(q) ||
          r.location.subCounty.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Category
      if (selectedCategory !== 'All' && r.category !== selectedCategory) return false;

      // Severity
      if (selectedSeverity !== 'All' && r.severity !== selectedSeverity) return false;

      // Status
      if (selectedStatus !== 'All' && r.status !== selectedStatus) return false;

      // Demo filter
      if (showDemoFilter === 'live' && r.isDemoRecord) return false;
      if (showDemoFilter === 'demo' && !r.isDemoRecord) return false;

      return true;
    });
  }, [reports, searchQuery, selectedCategory, selectedSeverity, selectedStatus, showDemoFilter]);

  const handleStatusChange = (newStatus: ReportStatus) => {
    if (!selectedReport) return;
    updateReportStatus(
      selectedReport.id,
      newStatus,
      statusUpdateNote || `Status updated from geospatial monitoring view.`,
      user?.name || 'Authority Officer',
      selectedReport.assignedDepartment
    );
    // Update local selection
    setSelectedReport((prev) => (prev ? { ...prev, status: newStatus } : null));
    setIsUpdatingStatus(false);
    setStatusUpdateNote('');
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, ward, or keyword..."
              className="w-full text-xs pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">
              Showing <strong className="text-slate-900">{filteredReports.length}</strong> of{' '}
              {reports.length} incidents
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedSeverity('All');
                setSelectedStatus('All');
                setShowDemoFilter('all');
              }}
              className="text-teal-600 hover:underline font-semibold cursor-pointer text-xs"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
              Severity
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 bg-white font-medium"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 bg-white"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
              Data Source
            </label>
            <select
              value={showDemoFilter}
              onChange={(e) => setShowDemoFilter(e.target.value as any)}
              className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">All Records</option>
              <option value="live">Live Submissions Only</option>
              <option value="demo">Demo Records Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Map & Incident Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Map Container */}
        <div className="lg:col-span-8">
          <LeafletMap
            reports={filteredReports}
            selectedReport={selectedReport}
            onSelectReport={(rep) => setSelectedReport(rep)}
            height="580px"
          />

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Interactive Leaflet grid. Click any pin to open full operational dossier.</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">EPSG:4326 WGS84</span>
          </div>
        </div>

        {/* Selected Incident Dossier / Inspector Panel */}
        <div className="lg:col-span-4">
          {selectedReport ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {selectedReport.id}
                    </span>
                    {selectedReport.isDemoRecord ? (
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Demo Record
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Live Citizen Report
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">
                    {selectedReport.title}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block text-xs font-extrabold px-2.5 py-1 rounded-full ${
                      selectedReport.severity === 'Critical'
                        ? 'bg-rose-500 text-white'
                        : selectedReport.severity === 'High'
                        ? 'bg-orange-500 text-white'
                        : selectedReport.severity === 'Medium'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {selectedReport.severity}
                  </span>
                  <div className="text-[11px] font-mono font-bold text-slate-600 mt-1">
                    Score: {selectedReport.priorityScore}
                  </div>
                </div>
              </div>

              {/* Photo Thumbnail if available */}
              {selectedReport.imageUrl && (
                <div className="rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-900">
                  <img
                    src={selectedReport.imageUrl}
                    alt={selectedReport.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Location & Reporter details */}
              <div className="text-xs space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-start gap-1.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">{selectedReport.location.name}</span>
                    <span className="text-slate-500 block text-[11px]">
                      {selectedReport.location.subCounty}, {selectedReport.location.county}
                      {selectedReport.location.landmark && ` • (${selectedReport.location.landmark})`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200/60">
                  <span>Reported by: {selectedReport.reporter.name}</span>
                  <span>{new Date(selectedReport.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
              </div>

              {/* AI Vision Evidence Callout */}
              {selectedReport.aiAnalysis && (
                <div className="p-3 rounded-xl bg-teal-950/90 text-teal-100 text-xs space-y-1 border border-teal-800/60">
                  <div className="flex items-center justify-between font-bold text-teal-300 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-400" />
                      Gemini Vision Inspection:
                    </span>
                    <span className="font-mono text-[10px]">
                      {selectedReport.aiAnalysis.confidenceScore}% conf
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {selectedReport.aiAnalysis.descriptionOfEvidence}
                  </p>
                </div>
              )}

              {/* Priority Breakdown Reason */}
              <div className="text-xs">
                <span className="font-bold text-slate-700 block mb-0.5">Priority Logic:</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {selectedReport.priorityBreakdown?.explanation ||
                    `Calculated priority ${selectedReport.priorityScore} based on severity and local civic impact.`}
                </p>
              </div>

              {/* Responsible Department */}
              <div className="text-xs p-2.5 rounded-lg bg-slate-100 text-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Assigned Authority:
                </span>
                <span className="font-semibold text-slate-900 block mt-0.5">
                  {selectedReport.assignedDepartment || 'Sub-County Engineering Unit'}
                </span>
              </div>

              {/* Current Status & Workflow Transition */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Lifecycle Status:</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                    {selectedReport.status}
                  </span>
                </div>

                {/* Authority Update Controls */}
                {isUpdatingStatus ? (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <label className="font-semibold text-slate-700 block">
                      Transition Status to:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['Under Review', 'Assigned', 'In Progress', 'Resolved'] as ReportStatus[]).map(
                        (st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStatusChange(st)}
                            className="px-2 py-1.5 rounded-lg bg-white hover:bg-teal-50 border border-slate-200 text-slate-800 font-semibold hover:border-teal-500 transition-colors text-[11px] cursor-pointer"
                          >
                            {st}
                          </button>
                        )
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsUpdatingStatus(false)}
                      className="text-[10px] text-slate-500 hover:text-slate-800 underline block text-center pt-1"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsUpdatingStatus(true)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Update Lifecycle / Dispatch Status</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">Select a marker on the map to inspect incident dossier</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
