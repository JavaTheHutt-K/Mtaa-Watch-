import React from 'react';
import {
  User,
  Shield,
  Building,
  Mail,
  Phone,
  RefreshCw,
  Cpu,
  Trash2,
  CheckCircle2,
  Database,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useReports } from '../../context/ReportContext';
import { UserRole } from '../../types';

export const ProfileSettingsView: React.FC = () => {
  const { user, switchRole, logout } = useAuth();
  const { reports, resetDemoData, clearAllReports } = useReports();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">{user?.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>{user?.email}</span>
              {user?.department && <span>• {user.department}</span>}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      {/* Role Simulation Switcher for Hackathon Demonstrations */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block">
            Hackathon Demonstration Controls
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
            Switch Role-Based Permissions
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Toggle between roles to showcase how interface capabilities adapt for citizens versus municipal officers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['Administrator', 'Authority Officer', 'Community Reporter'] as UserRole[]).map((r) => {
            const isSelected = user?.role === r;

            return (
              <div
                key={r}
                onClick={() => switchRole(r)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/40 shadow-xs ring-1 ring-teal-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900">{r}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">
                    {r === 'Administrator' &&
                      'Full municipal oversight, AI strategic generation, dataset exports, and incident assignment.'}
                    {r === 'Authority Officer' &&
                      'Field crew response, lifecycle status progression, and direct resolution verification.'}
                    {r === 'Community Reporter' &&
                      'Citizen photo upload, live GPS map reporting, tracking own neighborhood reports.'}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] font-semibold text-teal-700">
                  {isSelected ? 'Active Role' : 'Switch to this role'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Engine & System Connectivity */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block">
            AI Service Architecture
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">Gemini 3.8 Flash Integration</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-teal-600" />
                Computer Vision Model:
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono text-[10px]">
                Active
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Evaluates high-resolution photographic evidence for municipal solid waste, silt culvert
              blockage, asphalt erosion, and electrical hazards.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-teal-600" />
                Municipal Insights Agent:
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono text-[10px]">
                Active
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Synthesizes real-time reports into actionable cluster intelligence and cross-departmental
              resource directives for Kenyan county administrations.
            </p>
          </div>
        </div>
      </div>

      {/* Demonstration Database Operations */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Storage & Persistence
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">Local Demonstration Data</h3>
          <p className="text-xs text-slate-500 mt-1">
            Reports are persistently stored in browser storage. You can restore the pristine Kenyan sample
            dataset anytime for judges.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={() => {
              if (window.confirm('Reset all records back to the verified Kenyan demonstration seed?')) {
                resetDemoData();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
            <span>Restore Kenyan Demonstration Seed ({reports.length} records)</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all reports?')) {
                clearAllReports();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Database</span>
          </button>
        </div>
      </div>
    </div>
  );
};
