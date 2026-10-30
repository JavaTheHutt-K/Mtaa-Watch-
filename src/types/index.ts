export type ProblemCategory =
  | 'Illegal garbage dumping'
  | 'Overflowing waste bins'
  | 'Blocked drainage'
  | 'Flooding'
  | 'Damaged roads'
  | 'Broken streetlights'
  | 'Water leakage'
  | 'Other environmental or infrastructure problems';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ReportStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved';

export type PriorityTier = 'Low Priority' | 'Medium Priority' | 'High Priority' | 'Critical Priority';

export type UserRole = 'Administrator' | 'Community Reporter' | 'Authority Officer';

export interface LocationInfo {
  name: string;
  subCounty: string;
  county: string;
  lat: number;
  lng: number;
  landmark?: string;
}

export interface AIAnalysisResult {
  detectedProblem: string;
  problemCategory: ProblemCategory;
  descriptionOfEvidence: string;
  severityLevel: SeverityLevel;
  confidenceScore: number;
  recommendedResponse: string;
  suggestedDepartmentResponsible: string;
  analyzedAt: string;
  modelUsed: string;
}

export interface PriorityBreakdown {
  score: number;
  tier: PriorityTier;
  severityPoints: number;
  safetyPoints: number;
  populationPoints: number;
  recurrencePoints: number;
  agingPoints: number;
  explanation: string;
}

export interface StatusHistoryItem {
  status: ReportStatus;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface CommunityReport {
  id: string;
  title: string;
  description: string;
  category: ProblemCategory;
  severity: SeverityLevel;
  priorityScore: number;
  priorityTier: PriorityTier;
  priorityBreakdown: PriorityBreakdown;
  location: LocationInfo;
  reporter: {
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
  };
  status: ReportStatus;
  imageUrl?: string;
  affectedPeopleEstimate?: number;
  isRecurring: boolean;
  isDemoRecord: boolean;
  assignedDepartment?: string;
  assignedOfficer?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  aiAnalysis?: AIAnalysisResult;
  statusHistory: StatusHistoryItem[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  county?: string;
  subCounty?: string;
  department?: string;
}
