import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  User,
  MapPin,
  Sparkles,
  X,
  Send,
  Calendar,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { useReports } from '../../context/ReportContext';
import { useAuth } from '../../context/AuthContext';
import { CommunityReport, ProblemCategory, ReportStatus, SeverityLevel } from '../../types';

interface ReportManagementViewProps {
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

export const ReportManagementView: React.FC<ReportManagementViewProps> = ({
  initialSelectedReport,
}) => {
  const { reports, updateReportStatus, deleteReport, exportToCSV } = useReports();
  const { user } = useAuth();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProblemCategory>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<'All' | SeverityLevel>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | ReportStatus>('All');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'severity'>('priority');

  // Selected for full detail modal
  const [inspectingReport, setInspectingReport] = useState<CommunityReport | null>(
    initialSelectedReport || null
  );

  // Status transition form within modal
  const [newStatus, setNewStatus] = useState<ReportStatus>('In Progress');
  const [statusNote, setStatusNote] = useState('');
  const [assignedDept, setAssignedDept] = useState('');

  // Filtered & sorted reports
  const displayedReports = useMemo(() => {
    return reports
      .filter((r) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            r.id.toLowerCase().includes(q) ||
            r.title.toLowerCase().includes(q) ||
            r.location.name.toLowerCase().includes(q) ||
            r.location.subCounty.toLowerCase().includes(q) ||
            r.reporter.name.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q);
          if (!matches) return false;
        }

        if (selectedCategory !== 'All' && r.category !== selectedCategory) return false;
        if (selectedSeverity !== 'All' && r.severity !== selectedSeverity) return false;
        if (selectedStatus !== 'All' && r.status !== selectedStatus) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          return b.priorityScore - a.priorityScore;
        }
        if (sortBy === 'date') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // severity
        const rank = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return rank[b.severity] - rank[a.severity];
      });
  }, [reports, searchQuery, selectedCategory, selectedSeverity, selectedStatus, sortBy]);

  const handleOpenInspect = (report: CommunityReport) => {
    setInspectingReport(report);
    setNewStatus(report.status);
    setAssignedDept(report.assignedDepartment || '');
    setStatusNote('');
  };

  const handleApplyStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingReport) return;

    updateReportStatus(
      inspectingReport.id,
      newStatus,
      statusNote || `Status updated to ${newStatus}`,
      user?.name || 'Authorized Officer',
      assignedDept || inspectingReport.assignedDepartment
    );

    // Refresh inspecting modal
    const updated = reports.find((r) => r.id === inspectingReport.id);
    if (updated) {
      setInspectingReport({
        ...updated,
        status: newStatus,
        assignedDepartment: assignedDept || updated.assignedDepartment,
      });
    } else {
      setInspectingReport(null);
    }

    setStatusNote('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Permanently remove report ${id}?`)) {
      deleteReport(id);
      if (inspectingReport?.id === id) {
        setInspectingReport(null);
      }
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Top Header & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Community Incident Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review incoming problem submissions, assign municipal response teams, and update lifecycle status
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-200 bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-200 bg-white font-medium"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  Severity: {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-200 bg-white"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-teal-800"
            >
              <option value="priority">Sort: Highest Priority First</option>
              <option value="date">Sort: Newest First</option>
              <option value="severity">Sort: Highest Severity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Reports Table (Requirement 3.H columns) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Reporter</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Priority Score</th>
                <th className="py-3 px-4">Date Reported</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedReports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No community reports found matching your current filter criteria.
                  </td>
                </tr>
              ) : (
                displayedReports.map((report) => {
                  const isCrit = report.severity === 'Critical';
                  const isHigh = report.severity === 'High';

                  return (
                    <tr
                      key={report.id}
                      onClick={() => handleOpenInspect(report)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Report ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-700 whitespace-nowrap">
                        {report.id}
                        {report.isDemoRecord ? (
                          <span className="block text-[9px] text-slate-400 font-normal">Demo</span>
                        ) : (
                          <span className="block text-[9px] text-emerald-600 font-semibold">Live</span>
                        )}
                      </td>

                      {/* Reporter */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{report.reporter.name}</div>
                        <div className="text-[10px] text-slate-400">{report.reporter.role}</div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 max-w-[180px]">
                        <div className="font-medium text-slate-800 truncate" title={report.category}>
                          {report.category}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate" title={report.title}>
                          {report.title}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-800 font-semibold">{report.location.subCounty}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                          {report.location.name}
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCrit
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : isHigh
                              ? 'bg-orange-100 text-orange-800 border border-orange-300'
                              : report.severity === 'Medium'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {report.severity}
                        </span>
                      </td>

                      {/* Priority Score */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-black text-xs ${
                              report.priorityScore >= 80
                                ? 'text-rose-600'
                                : report.priorityScore >= 60
                                ? 'text-orange-600'
                                : 'text-slate-800'
                            }`}
                          >
                            {report.priorityScore}
                          </span>
                          <span className="text-[10px] text-slate-400">/100</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {report.priorityTier.replace(' Priority', '')}
                        </span>
                      </td>

                      {/* Date Reported */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-600">
                        {new Date(report.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            report.status === 'Resolved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : report.status === 'In Progress'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : report.status === 'Assigned'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : report.status === 'Under Review'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenInspect(report);
                            }}
                            className="px-2.5 py-1 rounded-lg text-teal-700 bg-teal-50 hover:bg-teal-100 font-semibold text-[11px] border border-teal-200 transition-colors"
                          >
                            Manage
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(report.id, e)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete report"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Dossier & Status Transition Modal */}
      {inspectingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                    {inspectingReport.id}
                  </span>
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                    {inspectingReport.category}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mt-2">
                  {inspectingReport.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectingReport(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo & Vision analysis */}
            {inspectingReport.imageUrl && (
              <div className="rounded-2xl overflow-hidden aspect-video border border-slate-200 bg-slate-900">
                <img
                  src={inspectingReport.imageUrl}
                  alt={inspectingReport.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {inspectingReport.aiAnalysis && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
                <div className="flex items-center justify-between text-teal-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    Gemini 3.8 Vision Evidence Diagnosis
                  </span>
                  <span className="font-mono">{inspectingReport.aiAnalysis.confidenceScore}% confidence</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {inspectingReport.aiAnalysis.descriptionOfEvidence}
                </p>
                <div className="pt-1 text-[11px] text-teal-300 font-semibold">
                  Action Recommendation: {inspectingReport.aiAnalysis.recommendedResponse}
                </div>
              </div>
            )}

            {/* Location & Priority metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  Location Coordinates:
                </span>
                <p className="text-slate-800 font-medium">{inspectingReport.location.name}</p>
                <p className="text-slate-500 text-[11px]">
                  {inspectingReport.location.subCounty}, {inspectingReport.location.county} (
                  {inspectingReport.location.lat.toFixed(4)}, {inspectingReport.location.lng.toFixed(4)})
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Priority Score:
                </span>
                <p className="text-base font-extrabold text-slate-900">
                  {inspectingReport.priorityScore}/100{' '}
                  <span className="text-xs font-semibold text-rose-700">
                    ({inspectingReport.priorityTier})
                  </span>
                </p>
                <p className="text-slate-500 text-[10px]">
                  {inspectingReport.priorityBreakdown?.explanation}
                </p>
              </div>
            </div>

            {/* Status Transition Form (Requirement 3.H) */}
            <form onSubmit={handleApplyStatusUpdate} className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-3">
              <span className="text-xs font-bold text-teal-900 uppercase tracking-wider block">
                Update Report Lifecycle & Authority Assignment
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Transition Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                    className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    <option value="Submitted">Submitted (Initial Log)</option>
                    <option value="Under Review">Under Review (Desk Triage)</option>
                    <option value="Assigned">Assigned (Dispatched to Team)</option>
                    <option value="In Progress">In Progress (Field Work Active)</option>
                    <option value="Resolved">Resolved (Work Order Verified)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Assigned County Authority / Unit
                  </label>
                  <input
                    type="text"
                    value={assignedDept}
                    onChange={(e) => setAssignedDept(e.target.value)}
                    placeholder="e.g. KURA Central Region / NCWSC Unit"
                    className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Operational Audit Note / Resolution Remarks
                </label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Enter dispatch notes, contractor job number, or verification details..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setInspectingReport(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-sm cursor-pointer"
                >
                  Commit Status Update
                </button>
              </div>
            </form>

            {/* Status History Timeline Audit */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Lifecycle Audit Trail
              </span>
              <div className="space-y-2">
                {inspectingReport.statusHistory?.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                    <div className="flex-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900">{h.status}</span>
                        <span className="text-slate-400">
                          {new Date(h.timestamp).toLocaleString('en-GB')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{h.note}</p>
                      <span className="text-[10px] text-slate-400 block mt-1">By: {h.actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
