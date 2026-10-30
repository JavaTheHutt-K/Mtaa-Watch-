import React from 'react';
import {
  ArrowRight,
  Shield,
  Eye,
  Cpu,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Users,
  Building2,
  Trash2,
  Droplets,
  Flame,
  Zap,
} from 'lucide-react';
import { ActiveTab } from '../layout/Sidebar';
import { useReports } from '../../context/ReportContext';

interface LandingPageProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab }) => {
  const { stats } = useReports();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1427] via-[#0f233a] to-[#0d3b42] text-white p-8 sm:p-12 lg:p-16 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>AI-Driven Civic Infrastructure & Environmental Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
            Smarter Communities.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-200">
              Cleaner Cities.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            MtaaWatch AI empowers Kenyan citizens and county authorities to detect, prioritize, and
            resolve chronic community challenges—from hazardous garbage dumpsites in Ruiru to blocked
            drainage in Nairobi—using multimodal computer vision and geospatial analytics.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('report')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base"
            >
              <span>Report a Problem Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 backdrop-blur-md transition-all cursor-pointer text-sm sm:text-base"
            >
              <span>Explore Live Dashboard</span>
            </button>
          </div>

          {/* Demonstration Notice */}
          <div className="pt-4 flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>
              Connected to Nairobi City County & Kiambu County demonstration grids • Currently monitoring{' '}
              <strong className="text-slate-200">{stats.totalReports} active reports</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Impact Statistics Cards (Clearly Marked Demonstration Figures) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Platform Impact Metrics</h2>
            <p className="text-xs text-slate-500">
              Demonstration figures reflecting platform performance benchmarks across pilot wards.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
            Demonstration Figures
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">74%</div>
            <div className="text-xs font-semibold text-slate-700 mt-1">Faster Incident Triage</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Reduced manual classification lag</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">12,450+</div>
            <div className="text-xs font-semibold text-slate-700 mt-1">Citizens Protected</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Benefiting from hazard mitigation</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">94.8%</div>
            <div className="text-xs font-semibold text-slate-700 mt-1">Gemini AI Vision Accuracy</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Validated against ground truth inspection</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">6 Authorities</div>
            <div className="text-xs font-semibold text-slate-700 mt-1">Integrated Dispatch Lines</div>
            <div className="text-[11px] text-slate-400 mt-0.5">KURA, KeNHA, NCWSC, KPLC, Sub-counties</div>
          </div>
        </div>
      </section>

      {/* The Problem We Are Solving */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
            The Civic Challenge
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
            Why Traditional Community Reporting Breaks Down
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            In rapidly expanding urban Kenyan centers like Nairobi, Ruiru, Juja, and Thika, civic complaints
            are typically scattered across WhatsApp groups, social media tags, or paper desk ledgers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Unfiltered & Overwhelming Volume</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Municipal dispatch desks receive hundreds of vague complaints without photographic proof,
              exact coordinates, or objective urgency ratings.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Lack of Risk Prioritization</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A lethal exposed high-voltage wire or burst sewage line risks being handled on a first-come,
              first-served queue behind cosmetic issues.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Jurisdictional Confusion</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizens don't know whether a pothole falls under KURA, KeNHA, or County Government.
              Reports get bounced around instead of resolved.
            </p>
          </div>
        </div>
      </section>

      {/* How the Platform Works (4-Step Workflow) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
            Operational Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How MtaaWatch AI Bridges Citizens and Authorities
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A frictionless, end-to-end intelligence cycle powered by Gemini 3.8 and geospatial telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative group hover:border-teal-400 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center text-sm mb-4">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Citizen Capture</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizen takes a quick photograph on their smartphone and drops a pin on the community map.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative group hover:border-teal-400 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center text-sm mb-4">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">AI Vision Inspection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gemini 3.8 Flash inspects the image, extracts physical evidence, detects the problem category,
              and evaluates severity.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative group hover:border-teal-400 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-extrabold flex items-center justify-center text-sm mb-4">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Risk Prioritization</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Algorithmic scoring (0-100) weighs public safety, affected residents, recurrence, and response lag
              transparently.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative group hover:border-teal-400 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 font-extrabold flex items-center justify-center text-sm mb-4">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Targeted Dispatch</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              System routes action directly to the responsible utility (NCWSC, KURA, County Works) with
              audit tracking to resolution.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Categories Supported */}
      <section className="bg-gradient-to-b from-slate-900 to-[#0c1427] text-white p-8 sm:p-12 rounded-3xl space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Civic Scope</span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight">
            Supported Problem Domains Across Kenyan Mtaas
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Engineered to detect and route both acute emergencies and chronic municipal infrastructure decay.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { title: 'Illegal Garbage Dumping', icon: Trash2, desc: 'Dumpsites, plastic heaps, market refuse' },
            { title: 'Overflowing Waste Bins', icon: Trash2, desc: 'Public skips, estate bins overcapacity' },
            { title: 'Blocked Drainage', icon: Droplets, desc: 'Clogged roadside culverts, silt buildup' },
            { title: 'Flash Flooding', icon: Droplets, desc: 'Impassable roads, submerged pedestrian walks' },
            { title: 'Damaged Roads', icon: AlertTriangle, desc: 'Deep craters, subsidence, broken bridges' },
            { title: 'Broken Streetlights', icon: Zap, desc: 'Dark corridors, exposed base wiring' },
            { title: 'Water Leakage', icon: Droplets, desc: 'Pressurized main bursts, dry household taps' },
            { title: 'Structural & Safety', icon: Shield, desc: 'Collapsed retaining walls, landslips' },
          ].map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div
                key={i}
                className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl hover:border-teal-400/50 transition-all"
              >
                <Icon className="w-5 h-5 text-teal-400 mb-2" />
                <h4 className="font-bold text-sm text-white">{cat.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1">{cat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to clean up your neighborhood?
          </h3>
          <p className="text-sm text-teal-100 max-w-xl">
            Spot an open dumpsite, broken drainage trench, or dangerous pothole? Submit a report now
            and let MtaaWatch AI classify, score, and dispatch it to the right authority.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('report')}
            className="px-6 py-3 rounded-xl bg-white text-teal-900 font-extrabold shadow-md hover:bg-teal-50 transition-colors cursor-pointer text-sm"
          >
            Submit a Community Report
          </button>
        </div>
      </section>
    </div>
  );
};
