import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CommunityReport, ProblemCategory, ReportStatus, SeverityLevel } from '../types';
import { INITIAL_SAMPLE_REPORTS } from '../data/sampleReports';
import { calculatePriorityScore } from '../utils/priority';

interface NewReportData {
  title: string;
  description: string;
  category: ProblemCategory;
  severity: SeverityLevel;
  location: {
    name: string;
    subCounty: string;
    county: string;
    lat: number;
    lng: number;
    landmark?: string;
  };
  reporter: {
    name: string;
    email: string;
    role: any;
    phone?: string;
  };
  imageUrl?: string;
  affectedPeopleEstimate?: number;
  isRecurring: boolean;
  hasSafetyHazard?: boolean;
  aiAnalysis?: any;
}

interface ReportStats {
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;
  criticalIncidents: number;
  avgResolutionTime: string;
  mostReportedCategory: string;
  resolutionRate: number;
  categoryCounts: Record<string, number>;
  severityCounts: Record<SeverityLevel, number>;
  statusCounts: Record<ReportStatus, number>;
}

interface ReportContextType {
  reports: CommunityReport[];
  stats: ReportStats;
  addReport: (data: NewReportData) => CommunityReport;
  updateReportStatus: (
    id: string,
    status: ReportStatus,
    note?: string,
    actor?: string,
    assignedDept?: string
  ) => void;
  deleteReport: (id: string) => void;
  resetDemoData: () => void;
  clearAllReports: () => void;
  exportToCSV: () => void;
}

const STORAGE_KEY = 'mtaawatch_reports_db_v2';

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<CommunityReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load reports from storage, using initial seed', e);
    }
    return INITIAL_SAMPLE_REPORTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch (e) {
      console.error('Failed to save reports to localStorage:', e);
    }
  }, [reports]);

  // Dynamically compute all statistics from report records
  const stats = useMemo<ReportStats>(() => {
    const total = reports.length;
    let resolved = 0;
    let critical = 0;
    const categoryCounts: Record<string, number> = {};
    const severityCounts: Record<SeverityLevel, number> = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0,
    };
    const statusCounts: Record<ReportStatus, number> = {
      Submitted: 0,
      'Under Review': 0,
      Assigned: 0,
      'In Progress': 0,
      Resolved: 0,
    };

    let totalResolutionHours = 0;
    let resolvedWithTimeCount = 0;

    reports.forEach((r) => {
      // Category count
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;

      // Severity count
      if (severityCounts[r.severity] !== undefined) {
        severityCounts[r.severity]++;
      }

      // Status count
      if (statusCounts[r.status] !== undefined) {
        statusCounts[r.status]++;
      }

      // Resolved
      if (r.status === 'Resolved') {
        resolved++;
        const resolvedEvent = r.statusHistory?.find((h) => h.status === 'Resolved');
        if (resolvedEvent) {
          const start = new Date(r.createdAt).getTime();
          const end = new Date(resolvedEvent.timestamp).getTime();
          const diffHours = (end - start) / (1000 * 60 * 60);
          if (diffHours > 0) {
            totalResolutionHours += diffHours;
            resolvedWithTimeCount++;
          }
        }
      }

      // Critical incidents
      if (r.severity === 'Critical' || r.priorityScore >= 80) {
        critical++;
      }
    });

    const pending = total - resolved;

    // Average resolution time
    let avgResolutionTime = '36.5 hrs';
    if (resolvedWithTimeCount > 0) {
      const avg = totalResolutionHours / resolvedWithTimeCount;
      if (avg < 24) {
        avgResolutionTime = `${Math.round(avg)} hrs`;
      } else {
        const days = (avg / 24).toFixed(1);
        avgResolutionTime = `${days} days`;
      }
    }

    // Most reported category
    let maxCategory = 'N/A';
    let maxCount = -1;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxCategory = cat;
      }
    });

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      totalReports: total,
      resolvedReports: resolved,
      pendingReports: pending,
      criticalIncidents: critical,
      avgResolutionTime,
      mostReportedCategory: maxCategory,
      resolutionRate,
      categoryCounts,
      severityCounts,
      statusCounts,
    };
  }, [reports]);

  const addReport = (data: NewReportData): CommunityReport => {
    const newId = `MW-2026-${String(reports.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const priorityBreakdown = calculatePriorityScore({
      severity: data.severity,
      category: data.category,
      isRecurring: data.isRecurring,
      affectedPeopleEstimate: data.affectedPeopleEstimate,
      hasSafetyHazard: data.hasSafetyHazard,
      createdAt: now,
    });

    const newReport: CommunityReport = {
      id: newId,
      title: data.title,
      description: data.description,
      category: data.category,
      severity: data.severity,
      priorityScore: priorityBreakdown.score,
      priorityTier: priorityBreakdown.tier,
      priorityBreakdown,
      location: data.location,
      reporter: data.reporter,
      status: 'Submitted',
      imageUrl: data.imageUrl,
      affectedPeopleEstimate: data.affectedPeopleEstimate,
      isRecurring: data.isRecurring,
      isDemoRecord: false, // Newly submitted reports are live real citizen submissions
      createdAt: now,
      updatedAt: now,
      aiAnalysis: data.aiAnalysis,
      assignedDepartment: data.aiAnalysis?.suggestedDepartmentResponsible || 'Nairobi / Kiambu County Directorate of Public Works',
      statusHistory: [
        {
          status: 'Submitted',
          timestamp: now,
          actor: data.reporter.name || 'Citizen Reporter',
          note: 'Report officially submitted via MtaaWatch AI platform.',
        },
      ],
    };

    setReports((prev) => [newReport, ...prev]);
    return newReport;
  };

  const updateReportStatus = (
    id: string,
    status: ReportStatus,
    note?: string,
    actor: string = 'Authority Officer',
    assignedDept?: string
  ) => {
    const now = new Date().toISOString();
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;

        const newHistory = [
          ...(r.statusHistory || []),
          {
            status,
            timestamp: now,
            actor,
            note: note || `Status transitioned to ${status}`,
          },
        ];

        return {
          ...r,
          status,
          updatedAt: now,
          assignedDepartment: assignedDept || r.assignedDepartment,
          resolutionNotes: status === 'Resolved' ? note || r.resolutionNotes : r.resolutionNotes,
          statusHistory: newHistory,
        };
      })
    );
  };

  const deleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const resetDemoData = () => {
    setReports(INITIAL_SAMPLE_REPORTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_REPORTS));
  };

  const clearAllReports = () => {
    setReports([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportToCSV = () => {
    if (reports.length === 0) return;

    const headers = [
      'Report ID',
      'Title',
      'Category',
      'Severity',
      'Priority Score',
      'Priority Tier',
      'Status',
      'County',
      'Sub-County',
      'Specific Location',
      'Latitude',
      'Longitude',
      'Reporter Name',
      'Reporter Email',
      'Affected People Est',
      'Is Recurring',
      'Assigned Department',
      'Date Reported',
      'Is Demo Record',
    ];

    const rows = reports.map((r) => [
      `"${r.id}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      `"${r.severity}"`,
      r.priorityScore,
      `"${r.priorityTier}"`,
      `"${r.status}"`,
      `"${r.location.county}"`,
      `"${r.location.subCounty}"`,
      `"${r.location.name.replace(/"/g, '""')}"`,
      r.location.lat,
      r.location.lng,
      `"${r.reporter.name}"`,
      `"${r.reporter.email}"`,
      r.affectedPeopleEstimate || 0,
      r.isRecurring ? 'Yes' : 'No',
      `"${(r.assignedDepartment || '').replace(/"/g, '""')}"`,
      `"${r.createdAt}"`,
      r.isDemoRecord ? 'Yes (Demo)' : 'No (Live)',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MtaaWatch_AI_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ReportContext.Provider
      value={{
        reports,
        stats,
        addReport,
        updateReportStatus,
        deleteReport,
        resetDemoData,
        clearAllReports,
        exportToCSV,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

export function useReports() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportProvider');
  }
  return context;
}
