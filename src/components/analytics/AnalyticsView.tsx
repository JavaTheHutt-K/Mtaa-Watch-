import React, { useMemo } from 'react';
import {
  Download,
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useReports } from '../../context/ReportContext';

export const AnalyticsView: React.FC = () => {
  const { reports, stats, exportToCSV } = useReports();

  // 1. Category Distribution
  const categoryData = useMemo(() => {
    return Object.entries(stats.categoryCounts).map(([cat, count]) => ({
      category: cat.length > 20 ? cat.slice(0, 20) + '...' : cat,
      fullCategory: cat,
      count,
    }));
  }, [stats.categoryCounts]);

  // 2. Severity Distribution
  const severityData = useMemo(() => {
    return [
      { name: 'Critical', count: stats.severityCounts.Critical, color: '#ef4444' },
      { name: 'High', count: stats.severityCounts.High, color: '#f97316' },
      { name: 'Medium', count: stats.severityCounts.Medium, color: '#eab308' },
      { name: 'Low', count: stats.severityCounts.Low, color: '#10b981' },
    ];
  }, [stats.severityCounts]);

  // 3. Reports by Location (Sub-County)
  const locationData = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      const sub = r.location.subCounty || 'Unknown';
      counts[sub] = (counts[sub] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([subCounty, count]) => ({ subCounty, count }))
      .sort((a, b) => b.count - a.count);
  }, [reports]);

  // 4. Monthly / Timeline trends
  const monthlyTrends = useMemo(() => {
    const monthlyMap: Record<string, { submitted: number; resolved: number }> = {};

    reports.forEach((r) => {
      const d = new Date(r.createdAt);
      const monthKey = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { submitted: 0, resolved: 0 };
      }
      monthlyMap[monthKey].submitted += 1;
      if (r.status === 'Resolved') {
        monthlyMap[monthKey].resolved += 1;
      }
    });

    return Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      submitted: data.submitted,
      resolved: data.resolved,
    }));
  }, [reports]);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Civic Analytics & Operational Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated metric reports, spatial distribution breakdown, and municipal resolution velocity
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Complete Dataset (.CSV)</span>
        </button>
      </div>

      {/* Primary KPI Row (Requirement 3.I) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Community Incidents
          </span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalReports}</div>
          <span className="text-[11px] text-teal-600 font-medium mt-1 block">
            Live telemetry database
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Overall Resolution Rate
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">
            {stats.resolutionRate}%
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${stats.resolutionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Pending Dispatch Queue
          </span>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">{stats.pendingReports}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">In review or execution</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Mean Resolution Time
          </span>
          <div className="text-3xl font-extrabold text-indigo-600 mt-1">
            {stats.avgResolutionTime}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">From report to verification</span>
        </div>
      </div>

      {/* Charts Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Incident Distribution by Category</h3>
            <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
              Civic Scope
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={10} width={90} />
                <Tooltip
                  formatter={(val: any, _name: any, item: any) => [
                    `${val} incidents`,
                    item.payload.fullCategory,
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Severity Threat Distribution</h3>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
              Risk Weighting
            </span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {severityData.map((entry, index) => (
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
                  formatter={(val) => <span className="text-xs text-slate-700 font-semibold">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2: Monthly Trends & Location Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Incident Trends */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Monthly Incident Trends</h3>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Submitted vs Resolved
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="submitted"
                  name="Submitted"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#10b981"
                  strokeWidth={2.5}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reports by Sub-County Location */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Reports by Sub-County Location</h3>
            <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
              Geographic Spread
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="subCounty" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} reports`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
