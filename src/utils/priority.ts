import { ProblemCategory, PriorityBreakdown, PriorityTier, SeverityLevel } from '../types';

interface PriorityInput {
  severity: SeverityLevel;
  category: ProblemCategory;
  isRecurring: boolean;
  affectedPeopleEstimate?: number;
  hasSafetyHazard?: boolean;
  createdAt?: string;
}

/**
 * Calculates a transparent, multi-factor civic risk priority score (0 - 100)
 * strictly adhering to verified citizen inputs and detected severity.
 */
export function calculatePriorityScore(input: PriorityInput): PriorityBreakdown {
  const {
    severity,
    category,
    isRecurring,
    affectedPeopleEstimate,
    hasSafetyHazard,
    createdAt = new Date().toISOString(),
  } = input;

  // 1. Severity Points (Max 35 pts)
  let severityPoints = 10;
  if (severity === 'Critical') severityPoints = 35;
  else if (severity === 'High') severityPoints = 25;
  else if (severity === 'Medium') severityPoints = 18;
  else severityPoints = 8; // Low

  // 2. Public Safety Impact (Max 25 pts)
  // Categories naturally posing health epidemics or physical hazard
  let safetyPoints = 0;
  const isHighRiskCategory =
    category === 'Flooding' ||
    category === 'Water leakage' ||
    category === 'Broken streetlights' ||
    category === 'Damaged roads';

  if (hasSafetyHazard || severity === 'Critical') {
    safetyPoints += 18;
  }
  if (isHighRiskCategory) {
    safetyPoints += 7;
  }
  safetyPoints = Math.min(25, safetyPoints);

  // 3. Verified Affected Population Points (Max 20 pts)
  // Does NOT invent population data; strictly uses provided estimate
  let populationPoints = 0;
  if (typeof affectedPeopleEstimate === 'number' && affectedPeopleEstimate > 0) {
    if (affectedPeopleEstimate >= 500) {
      populationPoints = 20;
    } else if (affectedPeopleEstimate >= 150) {
      populationPoints = 14;
    } else if (affectedPeopleEstimate >= 50) {
      populationPoints = 9;
    } else {
      populationPoints = 4;
    }
  }

  // 4. Recurrence Factor (Max 10 pts)
  const recurrencePoints = isRecurring ? 10 : 0;

  // 5. Age Factor / Lingering Unresolved (Max 10 pts)
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffHours = Math.max(0, (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
  let agingPoints = 0;
  if (diffHours >= 120) {
    // 5+ days
    agingPoints = 10;
  } else if (diffHours >= 48) {
    // 2+ days
    agingPoints = 6;
  } else if (diffHours >= 12) {
    // 12 hours
    agingPoints = 3;
  } else {
    agingPoints = 1;
  }

  // Total Score clamped 0 - 100
  const rawScore = severityPoints + safetyPoints + populationPoints + recurrencePoints + agingPoints;
  const score = Math.min(100, Math.max(5, Math.round(rawScore)));

  // Tier mapping according to specification
  let tier: PriorityTier = 'Low Priority';
  if (score >= 80) {
    tier = 'Critical Priority';
  } else if (score >= 60) {
    tier = 'High Priority';
  } else if (score >= 30) {
    tier = 'Medium Priority';
  } else {
    tier = 'Low Priority';
  }

  // Human-readable explanation of score
  const reasons: string[] = [];
  reasons.push(`${severity} severity baseline (+${severityPoints} pts)`);
  if (safetyPoints > 0) {
    reasons.push(`Public safety or health exposure (+${safetyPoints} pts)`);
  }
  if (populationPoints > 0) {
    reasons.push(`Citizen impact volume (${affectedPeopleEstimate?.toLocaleString()} reported affected: +${populationPoints} pts)`);
  } else {
    reasons.push(`No affected population volume entered (0 pts added)`);
  }
  if (isRecurring) {
    reasons.push(`Chronic recurring incident flag (+${recurrencePoints} pts)`);
  }
  if (agingPoints > 1) {
    reasons.push(`Report aging and dispatch delay (+${agingPoints} pts)`);
  }

  const explanation = `Score ${score}/100 [${tier}]: Derived from ${reasons.join(', ')}.`;

  return {
    score,
    tier,
    severityPoints,
    safetyPoints,
    populationPoints,
    recurrencePoints,
    agingPoints,
    explanation,
  };
}
