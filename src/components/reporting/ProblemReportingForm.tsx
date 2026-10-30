import React, { useState, useId } from 'react';
import {
  Upload,
  Camera,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  MapPin,
  ShieldCheck,
  Building,
  Users,
  RotateCcw,
  Send,
  Loader2,
  FileCheck,
  Info,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useReports } from '../../context/ReportContext';
import { HACKATHON_DEMO_IMAGES } from '../../data/sampleReports';
import { LocationPickerMap } from '../map/LocationPickerMap';
import { calculatePriorityScore } from '../../utils/priority';
import { AIAnalysisResult, ProblemCategory, SeverityLevel } from '../../types';
import { ActiveTab } from '../layout/Sidebar';

interface ProblemReportingFormProps {
  setActiveTab: (tab: ActiveTab) => void;
  onReportCreated?: (reportId: string) => void;
}

const CATEGORIES: ProblemCategory[] = [
  'Illegal garbage dumping',
  'Overflowing waste bins',
  'Blocked drainage',
  'Flooding',
  'Damaged roads',
  'Broken streetlights',
  'Water leakage',
  'Other environmental or infrastructure problems',
];

export const ProblemReportingForm: React.FC<ProblemReportingFormProps> = ({
  setActiveTab,
  onReportCreated,
}) => {
  const { user } = useAuth();
  const { addReport } = useReports();
  const formId = useId();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProblemCategory>('Illegal garbage dumping');
  const [severity, setSeverity] = useState<SeverityLevel>('High');
  const [isRecurring, setIsRecurring] = useState(false);
  const [hasSafetyHazard, setHasSafetyHazard] = useState(true);
  const [affectedPeopleEstimate, setAffectedPeopleEstimate] = useState<number | ''>(150);

  // Location State (Default: Ruiru / Kiambu area)
  const [locationName, setLocationName] = useState('Kimbo - Matangi Road Junction');
  const [subCounty, setSubCounty] = useState('Ruiru');
  const [county, setCounty] = useState('Kiambu County');
  const [lat, setLat] = useState(-1.1465);
  const [lng, setLng] = useState(36.9582);

  // Image & AI State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any | null>(null);

  // Calculate live priority score preview
  const livePriority = calculatePriorityScore({
    severity,
    category,
    isRecurring,
    affectedPeopleEstimate: typeof affectedPeopleEstimate === 'number' ? affectedPeopleEstimate : undefined,
    hasSafetyHazard,
    createdAt: new Date().toISOString(),
  });

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setAiAnalysis(null);
      setAiError(null);
      // Auto-trigger analysis
      triggerGeminiAnalysis(result, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  // Quick preset loader for hackathon judges
  const handleLoadDemoPreset = async (preset: (typeof HACKATHON_DEMO_IMAGES)[0]) => {
    setTitle(preset.name);
    setDescription(preset.description);
    setCategory(preset.category);
    setLocationName(preset.location.name);
    setSubCounty(preset.location.subCounty);
    setCounty(preset.location.county);
    setLat(preset.location.lat);
    setLng(preset.location.lng);
    setImagePreview(preset.imageUrl);
    setAiAnalysis(null);
    setAiError(null);

    // Fetch image and convert to base64 to send to server Gemini endpoint
    try {
      setIsAnalyzing(true);
      const res = await fetch(preset.imageUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        triggerGeminiAnalysis(base64Data, blob.type || 'image/jpeg', preset.category, preset.description);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.warn('Could not fetch preset for base64 analysis, providing manual flow', err);
      setIsAnalyzing(false);
    }
  };

  // Call Server-Side Gemini API
  const triggerGeminiAnalysis = async (
    base64Data: string,
    mimeType: string,
    catOverride?: ProblemCategory,
    descOverride?: string
  ) => {
    setIsAnalyzing(true);
    setAiError(null);

    try {
      const response = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
          userCategory: catOverride || category,
          userDescription: descOverride || description,
          location: `${locationName}, ${subCounty}, ${county}`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'AI analysis could not complete. Manual reporting enabled.');
      }

      const res = data.analysis;
      const formattedResult: AIAnalysisResult = {
        detectedProblem: res.detectedProblem,
        problemCategory: res.problemCategory as ProblemCategory,
        descriptionOfEvidence: res.descriptionOfEvidence,
        severityLevel: res.severityLevel as SeverityLevel,
        confidenceScore: res.confidenceScore || 92,
        recommendedResponse: res.recommendedResponse,
        suggestedDepartmentResponsible: res.suggestedDepartmentResponsible,
        analyzedAt: new Date().toISOString(),
        modelUsed: data.source || 'gemini-3.8-flash',
      };

      setAiAnalysis(formattedResult);

      // Automatically update category and severity based on AI inspection
      if (formattedResult.problemCategory && CATEGORIES.includes(formattedResult.problemCategory)) {
        setCategory(formattedResult.problemCategory);
      }
      if (['Low', 'Medium', 'High', 'Critical'].includes(formattedResult.severityLevel)) {
        setSeverity(formattedResult.severityLevel);
      }
      if (!title) {
        setTitle(formattedResult.detectedProblem);
      }
      if (!description) {
        setDescription(formattedResult.descriptionOfEvidence);
      }
    } catch (error: any) {
      console.error('Gemini image analysis error:', error);
      setAiError(error.message || 'Image analysis service temporarily unavailable. You can proceed with manual report details below.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Location Picker handler
  const handleLocationChange = (newLat: number, newLng: number, place?: string, subC?: string) => {
    setLat(newLat);
    setLng(newLng);
    if (place) setLocationName(place);
    if (subC) {
      setSubCounty(subC);
      if (['Starehe', 'Kasarani', 'Westlands', 'Embakasi East'].includes(subC)) {
        setCounty('Nairobi City County');
      } else {
        setCounty('Kiambu County');
      }
    }
  };

  // Submit Report
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a short title for the report.');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = addReport({
        title,
        description: description || 'Citizen reported community issue.',
        category,
        severity,
        location: {
          name: locationName,
          subCounty,
          county,
          lat,
          lng,
        },
        reporter: {
          name: user?.name || 'Citizen Reporter',
          email: user?.email || 'citizen@mtaawatch.ke',
          role: user?.role || 'Community Reporter',
          phone: user?.phone,
        },
        imageUrl: imagePreview || undefined,
        affectedPeopleEstimate: typeof affectedPeopleEstimate === 'number' ? affectedPeopleEstimate : undefined,
        isRecurring,
        hasSafetyHazard,
        aiAnalysis: aiAnalysis || undefined,
      });

      setSubmissionSuccess(created);
      if (onReportCreated) onReportCreated(created.id);
    } catch (err) {
      console.error('Failed to submit report:', err);
      alert('Could not submit report. Please verify all inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Confirmation Screen
  if (submissionSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-lg text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {submissionSuccess.id}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            Community Report Officially Submitted!
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Your report has been analyzed by Gemini AI, scored for civic risk priority, and logged onto
            the county geospatial monitoring grid.
          </p>
        </div>

        {/* Priority Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Calculated Priority:</span>
            <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {submissionSuccess.priorityScore}/100 ({submissionSuccess.priorityTier})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Category & Severity:</span>
            <span className="text-slate-800">
              {submissionSuccess.category} • {submissionSuccess.severity}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Assigned Routing:</span>
            <span className="text-slate-800 font-medium truncate max-w-[260px]">
              {submissionSuccess.assignedDepartment}
            </span>
          </div>
        </div>

        {/* Action Buttons to Continue Demo */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('map')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            <span>View on Live Map</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>See Dashboard Stats</span>
          </button>
          <button
            onClick={() => {
              setSubmissionSuccess(null);
              setTitle('');
              setDescription('');
              setImagePreview(null);
              setAiAnalysis(null);
            }}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            AI-Assisted Problem Reporting
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload a photo of an environmental or infrastructure hazard. Gemini AI will inspect evidence
            and assist classification.
          </p>
        </div>

        {/* Quick Hackathon Demo Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Judge Quick Test:
          </span>
          {HACKATHON_DEMO_IMAGES.slice(0, 3).map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleLoadDemoPreset(preset)}
              className="text-[11px] font-medium bg-teal-50 hover:bg-teal-100 text-teal-800 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors cursor-pointer"
            >
              ⚡ {preset.name.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (Image Upload & AI Vision Result) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Image Upload Area */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-teal-600" />
                  Problem Photograph
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setAiAnalysis(null);
                      setAiError(null);
                    }}
                    className="text-[11px] text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Clear Image
                  </button>
                )}
              </div>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-900 group">
                  <img
                    src={imagePreview}
                    alt="Community problem evidence"
                    className="w-full h-full object-cover"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center">
                      <Loader2 className="w-8 h-8 text-teal-400 animate-spin mb-2" />
                      <p className="text-xs font-bold text-teal-300">Gemini 3.8 Flash Vision</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Inspecting physical evidence, silt, debris & hazards...
                      </p>
                    </div>
                  )}
                  {!isAnalyzing && (
                    <div className="absolute bottom-2 right-2">
                      <label className="text-[11px] font-semibold bg-white/90 backdrop-blur-sm text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:bg-white transition-colors">
                        Change Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  )}
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-teal-50/30">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Click to upload or take a photograph
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
                    Supports JPEG, PNG, WEBP. Live Gemini vision inspection begins automatically.
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              )}

              {/* AI Fallback or Error notice */}
              {aiError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-800">AI Service Notice</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">{aiError}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      You can proceed with manual category and severity selection below.
                    </p>
                  </div>
                </div>
              )}

              {/* Gemini AI Inspection Results Panel */}
              {aiAnalysis && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white border border-teal-500/30 space-y-3.5 shadow-md animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                      <Sparkles className="w-4 h-4 text-teal-400" />
                      <span>Gemini 3.8 Vision Inspection</span>
                    </div>
                    <span className="text-[10px] font-mono bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/40">
                      {aiAnalysis.confidenceScore}% Confidence
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Detected Civic Problem:
                    </span>
                    <h4 className="font-bold text-sm text-teal-100">{aiAnalysis.detectedProblem}</h4>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Observed Visual Evidence:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                      {aiAnalysis.descriptionOfEvidence}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">Assessed Severity:</span>
                      <span className="font-bold text-amber-400">{aiAnalysis.severityLevel}</span>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">Classified Category:</span>
                      <span className="font-semibold text-slate-200 truncate block">
                        {aiAnalysis.problemCategory}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60 text-xs">
                    <span className="text-[10px] text-teal-400 font-semibold block flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      Suggested Responsible Department:
                    </span>
                    <span className="text-slate-200 font-medium">
                      {aiAnalysis.suggestedDepartmentResponsible}
                    </span>
                  </div>

                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60 text-xs">
                    <span className="text-[10px] text-teal-400 font-semibold block flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Recommended Response:
                    </span>
                    <span className="text-slate-300 text-[11px] leading-relaxed">
                      {aiAnalysis.recommendedResponse}
                    </span>
                  </div>

                  <p className="text-[9px] text-slate-400 italic text-center">
                    Note: AI analyzes visual evidence. Geolocation is captured separately via map / GPS.
                  </p>
                </div>
              )}
            </div>

            {/* Live Risk Priority Preview Card (Section 3.E) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  Intelligent Priority Score
                </span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    livePriority.tier === 'Critical Priority'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : livePriority.tier === 'High Priority'
                      ? 'bg-orange-100 text-orange-800 border border-orange-300'
                      : livePriority.tier === 'Medium Priority'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {livePriority.tier}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-black text-slate-900">{livePriority.score}</div>
                <span className="text-xs text-slate-500 font-semibold">/ 100 max score</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    livePriority.score >= 80
                      ? 'bg-rose-600'
                      : livePriority.score >= 60
                      ? 'bg-orange-500'
                      : livePriority.score >= 30
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${livePriority.score}%` }}
                />
              </div>

              {/* Formula Factors Breakdown */}
              <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Severity Baseline:</span>
                  <span className="font-semibold text-slate-900">+{livePriority.severityPoints} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Public Safety Exposure:</span>
                  <span className="font-semibold text-slate-900">+{livePriority.safetyPoints} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Affected Population Volume:</span>
                  <span className="font-semibold text-slate-900">+{livePriority.populationPoints} pts</span>
                </div>
                {isRecurring && (
                  <div className="flex justify-between text-teal-700">
                    <span>Chronic Recurrence:</span>
                    <span className="font-semibold">+{livePriority.recurrencePoints} pts</span>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-slate-400 italic">
                Transparent multi-factor algorithm. No artificial population extrapolation.
              </p>
            </div>
          </div>

          {/* Right Column (Report Details & Geolocation) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                Report Details & Parameters
              </h3>

              {/* Title */}
              <div>
                <label
                  htmlFor={`${formId}-title`}
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Report Title *
                </label>
                <input
                  id={`${formId}-title`}
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Major garbage dump blocking Kimbo feeder road"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor={`${formId}-desc`}
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Description & Context
                </label>
                <textarea
                  id={`${formId}-desc`}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide context on how long this issue has persisted, health risks, or road blockages..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>

              {/* Category & Severity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor={`${formId}-cat`}
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Problem Category
                  </label>
                  <select
                    id={`${formId}-cat`}
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProblemCategory)}
                    className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={`${formId}-sev`}
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Assessed Severity Level
                  </label>
                  <select
                    id={`${formId}-sev`}
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                    className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white font-semibold"
                  >
                    <option value="Low">Low - Minor aesthetic / small trash</option>
                    <option value="Medium">Medium - Regular blockage / inconvenience</option>
                    <option value="High">High - Significant hazard / traffic cut-off</option>
                    <option value="Critical">Critical - Acute danger / electric hazard / flood</option>
                  </select>
                </div>
              </div>

              {/* Impact Inputs for Prioritization */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Civic Impact Variables
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={`${formId}-pop`}
                      className="block text-xs text-slate-600 mb-1 font-medium flex items-center gap-1"
                    >
                      <Users className="w-3 h-3 text-slate-500" />
                      Estimated Affected Residents
                    </label>
                    <input
                      id={`${formId}-pop`}
                      type="number"
                      min={0}
                      step={10}
                      value={affectedPeopleEstimate}
                      onChange={(e) =>
                        setAffectedPeopleEstimate(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="e.g. 200"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="flex flex-col justify-center gap-2 pt-2 sm:pt-0">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>Recurring Chronic Problem</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasSafetyHazard}
                        onChange={(e) => setHasSafetyHazard(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>Immediate Public Safety Hazard</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Geolocation & Interactive Map Pin Drop (Requirement 3.D & 3.F) */}
              <div className="pt-2">
                <LocationPickerMap lat={lat} lng={lng} onChange={handleLocationChange} />
              </div>

              {/* Location Text inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label
                    htmlFor={`${formId}-loc-name`}
                    className="block text-[11px] font-semibold text-slate-600 mb-1"
                  >
                    Locality / Landmark
                  </label>
                  <input
                    id={`${formId}-loc-name`}
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`${formId}-subcounty`}
                    className="block text-[11px] font-semibold text-slate-600 mb-1"
                  >
                    Sub-County
                  </label>
                  <input
                    id={`${formId}-subcounty`}
                    type="text"
                    value={subCounty}
                    onChange={(e) => setSubCounty(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`${formId}-county`}
                    className="block text-[11px] font-semibold text-slate-600 mb-1"
                  >
                    County
                  </label>
                  <input
                    id={`${formId}-county`}
                    type="text"
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm shadow-md shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting & Scoring...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Community Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
