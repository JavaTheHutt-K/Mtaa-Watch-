import React, { useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Timer,
  Layers,
  ArrowUpRight,
  MapPin,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Flame,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useReports } from '../../context/ReportContext';
import { ActiveTab } from '../layout/Sidebar';
import { CommunityReport, SeverityLevel } from '../../types';

interface IntelligenceDashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSelectReportForInspect?: (report: CommunityReport) => void;
}

const SEVERITY_COLORS_MAP: Record<SeverityLevel, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#10b981',
};

const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#10b981'];

export const IntelligenceDashboard: React.FC<IntelligenceDashboardProps> = ({
  setActiveTab,
  onSelectReportForInspect,
}) => {
  const { reports, stats } = useReports();

  // 1. Calculate Reports Over Time (grouped by date)
  const timelineData = useMemo(() => {
    const countsByDay: Record<string, number> = {};
    const sorted = [...reports].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sorted.forEach((r) => {
      const dateStr = new Date(r.createdAt).toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
      });
      countsByDay[dateStr] = (countsByDay[dateStr] || 0) + 1;
    });

    return Object.entries(countsByDay).map(([date, count]) => ({
      date,
      incidents: count,
    }));
  }, [reports]);

  // 2. Category Distribution Bar Chart Data
  const categoryChartData = useMemo(() => {
    return Object.entries(stats.categoryCounts).map(([name, count]) => ({
      name: name.length > 18 ? name.slice(0, 18) + '...' : name,
      fullName: name,
      count,
    }));
  }, [stats.categoryCounts]);

  // 3. Severity Distribution Pie Chart Data
  const severityChartData = useMemo(() => {
    return [
      { name: 'Critical', value: stats.severityCounts.Critical, color: '#ef4444' },
      { name: 'High', value: stats.severityCounts.High, color: '#f97316' },
      { name: 'Medium', value: stats.severityCounts.Medium, color: '#eab308' },
      { name: 'Low', value: stats.severityCounts.Low, color: '#10b981' },
    ].filter((item) => item.value > 0);
  }, [stats.severityCounts]);

  // 4. Geographic Distribution Summary (by subCounty)
  const geographicDistribution = useMemo(() => {
    const map: Record<string, { county: string; total: number; critical: number }> = {};
    reports.forEach((r) => {
      const sub = r.location.subCounty || 'Other';
      if (!map[sub]) {
        map[sub] = { county: r.location.county, total: 0, critical: 0 };
      }
      map[sub].total += 1;
      if (r.severity === 'Critical' || r.priorityScore >= 80) {
        map[sub].critical += 1;
      }
    });

    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [reports]);

  // 5. High-Priority Incidents (Score >= 70 or Critical)
  const highPriorityIncidents = useMemo(() => {
    return reports
      .filter((r) => r.priorityScore >= 70 || r.severity === 'Critical')
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 4);
  }, [reports]);

  // 6. Recent Reports (sorted by newest)
  const recentReports = useMemo(() => {
    return [...reports]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [reports]);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Ticker */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-teal-800/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
            <Sparkles className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                Live Municipal Telemetry
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium">
                Real-Time Recalculated
              </span>
            </div>
            <p className="text-sm font-medium text-slate-200 mt-0.5">
              Aggregating live community reports across Nairobi & Kiambu sub-counties.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('insights')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-teal-900 bg-teal-300 hover:bg-teal-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate AI Insights</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>View Map</span>
          </button>
        </div>
      </div>

      {/* 6 Key Statistic Cards (Requirement 3.C) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Reports */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Reports</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.totalReports}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium flex items-center gap-1">
            <span className="text-teal-600 font-semibold">{stats.resolutionRate}%</span> resolution rate
          </div>
        </div>

        {/* Resolved Reports */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{stats.resolvedReports}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Work orders closed</div>
        </div>

        {/* Pending Reports */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{stats.pendingReports}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">In triage or dispatch</div>
        </div>

        {/* Critical Incidents */}
        <div className="bg-white p-4.5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Critical
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{stats.criticalIncidents}</div>
          <div className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            High hazard alert
          </div>
        </div>

        {/* Average Resolution Time */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Resolution</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.avgResolutionTime}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Calculated from log</div>
        </div>

        {/* Most Reported Problem Category */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Category</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-extrabold text-slate-900 truncate" title={stats.mostReportedCategory}>
            {stats.mostReportedCategory}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {stats.categoryCounts[stats.mostReportedCategory] || 0} incidents logged
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid (3 Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Reports Over Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-900 text-sm">Reports Over Time</h3>
              <span className="text-[11px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                Incident Trend
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Daily volume of community submissions</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="incidents"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0d9488' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Categories Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-900 text-sm">Problem Categories</h3>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                By Frequency
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Volume breakdown across civic categories</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={80} />
                <Tooltip
                  formatter={(value: any, _name: any, item: any) => [
                    `${value} reports`,
                    item.payload.fullName,
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#14b8a6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Incident Severity Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-900 text-sm">Incident Severity</h3>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                Risk Classification
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Proportion by assessed threat level</p>
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} reports`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span className="text-xs text-slate-700 font-medium">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* High-Priority Incidents & Geographic Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* High-Priority Incidents (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">High-Priority Incidents Requiring Action</h3>
                <p className="text-xs text-slate-500">
                  Prioritized by algorithmic risk score (severity, public safety hazard & population)
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('reports-list')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {highPriorityIncidents.map((incident) => {
              const badgeBg =
                incident.severity === 'Critical'
                  ? 'bg-rose-500 text-white'
                  : 'bg-amber-500 text-slate-950';

              return (
                <div
                  key={incident.id}
                  onClick={() => {
                    if (onSelectReportForInspect) onSelectReportForInspect(incident);
                    setActiveTab('reports-list');
                  }}
                  className="p-4 rounded-xl border border-slate-200/90 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer bg-slate-50/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {incident.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeBg}`}>
                          {incident.severity}
                        </span>
                        <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {incident.priorityScore} pts
                        </span>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                      {incident.title}
                    </h4>

                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {incident.location.name}, {incident.location.subCounty}
                      </span>
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">
                      {incident.status} • {incident.assignedDepartment?.split(' ')[0] || 'Unassigned'}
                    </span>
                    <span className="text-teal-600 font-semibold flex items-center gap-0.5 text-[11px]">
                      Details <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Geographic Problem Distribution (1 Column) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Geographic Distribution</h3>
              <p className="text-xs text-slate-500">Active incidents by Kenyan sub-county</p>
            </div>
            <button
              onClick={() => setActiveTab('map')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Map View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {geographicDistribution.map(([subCounty, data]) => {
              const percentage = Math.round((data.total / stats.totalReports) * 100) || 0;
              return (
                <div key={subCounty} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800">{subCounty}</span>
                    <span className="text-slate-500">
                      <strong>{data.total}</strong> reports ({percentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1">
                    <div
                      className="bg-teal-500 h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{data.county}</span>
                    {data.critical > 0 && (
                      <span className="text-rose-600 font-semibold">
                        {data.critical} critical incident{data.critical > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Community Reports Table (Requirement 3.C) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Incident Submissions</h3>
            <p className="text-xs text-slate-500">
              Live chronological feed of community issues submitted by citizens and field scouts
            </p>
          </div>
          <button
            onClick={() => setActiveTab('reports-list')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 cursor-pointer"
          >
            Manage All {stats.totalReports} Incidents
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Problem / Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Severity & Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reported</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentReports.map((report) => {
                const sevColor = SEVERITY_COLORS_MAP[report.severity];

                return (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700 whitespace-nowrap">
                      {report.id}
                      {report.isDemoRecord && (
                        <span className="block text-[9px] text-slate-400 font-normal">Demo</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate" title={report.title}>
                        {report.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{report.category}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-800 font-medium">{report.location.subCounty}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        {report.location.name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: sevColor }}
                        />
                        <span className="font-semibold text-slate-800">{report.severity}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                          {report.priorityScore} pts
                        </span>
                      </div>
                    </td>
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
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {new Date(report.createdAt).toLocaleDateString('en-GB', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => {
                          if (onSelectReportForInspect) onSelectReportForInspect(report);
                          setActiveTab('reports-list');
                        }}
                        className="text-teal-600 hover:text-teal-800 font-semibold text-xs hover:underline cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
