import React, { useState } from 'react';
import {
  Step1Answers,
  Step2Answers,
  Step3Answers,
  Step4Answers,
  StepId,
  UserProfile
} from '../types';
import { calculateVerdict, VerdictDecision, ChecklistItem } from '../utils/verdict';
import { calculateNetEarnings } from '../utils/earnings';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Printer,
  RotateCcw,
  Home,
  DollarSign,
  ShieldCheck,
  Scale,
  Sparkles,
  ExternalLink,
  CheckSquare,
  Square,
  Clock,
  ArrowLeft,
  Flame,
  Bell,
  FileCheck,
  BadgeAlert,
  UserCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { EstimatesDisclaimer } from './EstimatesDisclaimer';

interface Step5VerdictProps {
  user?: UserProfile;
  step1Answers: Step1Answers;
  step2Answers: Step2Answers;
  step3Answers: Step3Answers;
  answers: Step4Answers;
  onReset: () => void;
  onGoToStep: (step: StepId) => void;
}

export const Step5Verdict: React.FC<Step5VerdictProps> = ({
  user,
  step1Answers,
  step2Answers,
  step3Answers,
  answers,
  onReset,
  onGoToStep
}) => {
  const verdict = calculateVerdict(step1Answers, step2Answers, step3Answers, answers);
  const earnings = calculateNetEarnings(step3Answers);
  const hourlyRate = Math.round(earnings.netIncome / Math.max(1, answers.hoursPerWeek * 52));

  // Local state for interactive checklist
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [checklistFilter, setChecklistFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showSafetyDetails, setShowSafetyDetails] = useState(false);

  const toggleChecklist = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const completedCount = verdict.checklist.filter((item) => checkedItems[item.id]).length;

  const filteredChecklist = verdict.checklist.filter((item) => {
    const isDone = Boolean(checkedItems[item.id]);
    if (checklistFilter === 'pending') return !isDone;
    if (checklistFilter === 'completed') return isDone;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const getVerdictCardStyles = (decision: VerdictDecision) => {
    switch (decision) {
      case 'GO':
        return {
          bannerBg: 'bg-emerald-600',
          badgeText: 'text-white',
          glowRing: 'ring-4 ring-emerald-100 border-emerald-500',
          gradientBg: 'from-emerald-950 via-[#0D1B2A] to-[#0D1B2A]',
          accentText: 'text-emerald-400',
          icon: <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
        };
      case 'GO_WITH_CONDITIONS':
        return {
          bannerBg: 'bg-amber-500',
          badgeText: 'text-slate-950',
          glowRing: 'ring-4 ring-amber-100 border-amber-500',
          gradientBg: 'from-amber-950/80 via-[#0D1B2A] to-[#0D1B2A]',
          accentText: 'text-amber-300',
          icon: <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
        };
      case 'HOLD':
        return {
          bannerBg: 'bg-rose-600',
          badgeText: 'text-white',
          glowRing: 'ring-4 ring-rose-100 border-rose-500',
          gradientBg: 'from-rose-950/80 via-[#0D1B2A] to-[#0D1B2A]',
          accentText: 'text-rose-400',
          icon: <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400" />
        };
    }
  };

  const styles = getVerdictCardStyles(verdict.decision);

  const getReasonIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="w-5 h-5 text-rose-500" />;
      case 'cash':
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
      case 'legal':
        return <Scale className="w-5 h-5 text-indigo-500" />;
      case 'shield':
        return <ShieldCheck className="w-5 h-5 text-amber-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-rose-500" />;
    }
  };

  return (
    <div className="space-y-10 pb-16 print:p-0 print:space-y-6">
      {/* 1. Header with Print / Action Toolbar */}
      <div className="border-b border-slate-200/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1.5">
            <span>Step 5 of 5</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-medium">Final Assessment Synthesis</span>
            {user?.name && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-[#0D1B2A] font-bold">Prepared for {user.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B2A] tracking-tight">
            Verdict: Host or Hold DC
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-xl">
            {user?.name ? `${user.name}’s custom evaluation` : 'Custom evaluation'} based on your home’s eligibility, neighborhood rates, hosting effort, and household setup.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer shadow-sm active:scale-95"
            aria-label="Print or save as PDF"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print / Save Action Plan</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
            aria-label="Start over with a fresh assessment"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start Over</span>
          </button>
        </div>
      </div>

      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              HOST OR HOLD DC · ASSESSMENT VERDICT
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Washington, DC Homeowner Short-Term Rental Feasibility & Action Plan
              {user?.name && ` · Prepared for ${user.name}${user.email ? ` (${user.email})` : ''}`}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Generated: {new Date().toLocaleDateString()}</div>
            <div>boss.dc.gov Compliance Reference</div>
          </div>
        </div>
      </div>

      {/* 2. THE BIG VERDICT CARD (GO / GO WITH CONDITIONS / HOLD) */}
      <div
        className={`bg-gradient-to-br ${styles.gradientBg} text-white rounded-3xl p-6 sm:p-9 shadow-2xl relative overflow-hidden border-2 transition-all print:border-2 print:p-6 print:bg-white print:text-slate-900`}
      >
        {/* Soft background glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none print:hidden" />

        <div className="relative z-10 space-y-6">
          {/* Top row: Big Badge + Icon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`inline-block px-5 py-2 rounded-2xl text-xl sm:text-2xl font-black tracking-wider uppercase shadow-lg ${styles.bannerBg} ${styles.badgeText}`}
              >
                {verdict.badgeLabel}
              </span>
              <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider hidden sm:inline-block">
                Official DC Recommendation
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto print:hidden">
              {styles.icon}
            </div>
          </div>

          {/* Headline & Subtitle */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white print:text-slate-950">
              {verdict.headline}
            </h2>
            <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed print:text-slate-700">
              {verdict.subtitle}
            </p>
          </div>

          {/* Conditions Strip if Go With Conditions */}
          {verdict.keyConditions.length > 0 && (
            <div className="bg-amber-400/15 border border-amber-400/30 rounded-2xl p-4 space-y-2 text-xs sm:text-sm print:bg-amber-50 print:border-amber-300 print:text-amber-950">
              <div className="font-extrabold text-amber-300 print:text-amber-900 flex items-center gap-1.5">
                <BadgeAlert className="w-4 h-4 text-amber-400" />
                <span>Prerequisites to Clear Before Listing:</span>
              </div>
              <ul className="space-y-1 text-slate-200 print:text-amber-900">
                {verdict.keyConditions.map((cond, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">⚠️</span>
                    <span>{cond}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/15 print:border-slate-300">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 print:bg-slate-100 print:border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-300 print:text-slate-600 block">
                Net Annual Income
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-400 print:text-emerald-700 tabular-nums block mt-0.5">
                ${earnings.netIncome.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-300 print:text-slate-500">
                ~${earnings.monthlyNetIncome.toLocaleString()}/mo
              </span>
            </div>

            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 print:bg-slate-100 print:border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-300 print:text-slate-600 block">
                Mortgage Covered
              </span>
              <span className="text-lg sm:text-xl font-black text-rose-300 print:text-rose-700 tabular-nums block mt-0.5">
                {earnings.mortgageCoveragePercent}%
              </span>
              <span className="text-[10px] text-slate-300 print:text-slate-500">
                of ${earnings.annualMortgage.toLocaleString()}/yr
              </span>
            </div>

            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 print:bg-slate-100 print:border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-300 print:text-slate-600 block">
                Effective Hourly Rate
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-400 print:text-emerald-700 tabular-nums block mt-0.5">
                ${hourlyRate}/hr
              </span>
              <span className="text-[10px] text-slate-300 print:text-slate-500">
                at {answers.hoursPerWeek} hrs/week
              </span>
            </div>

            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 print:bg-slate-100 print:border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-300 print:text-slate-600 block">
                DC Night Allowance
              </span>
              <span className="text-base sm:text-lg font-black text-white print:text-slate-900 block mt-0.5">
                {step3Answers.hostingMode === 'hosted' ? 'Unlimited' : '90 Nights Capped'}
              </span>
              <span className="text-[10px] text-slate-300 print:text-slate-500">
                {step3Answers.hostingMode === 'hosted' ? 'Host on-site' : 'DC Law 22-559 limit'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. THREE PERSONALIZED REASONS SECTION */}
      <section aria-labelledby="reasons-title" className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Sparkles className="w-5 h-5 text-rose-500" />
          <h2 id="reasons-title" className="text-lg sm:text-xl font-bold text-[#0D1B2A]">
            3 Personalized Reasons for Your Home
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {verdict.reasons.map((reason, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border-2 border-slate-200/90 shadow-sm flex flex-col justify-between space-y-3 print:border-slate-300"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    {getReasonIcon(reason.iconType)}
                  </div>
                  <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Reason #{idx + 1}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#0D1B2A] leading-snug">
                  {reason.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">
                  {reason.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PRINTABLE CHECKLIST OF NEXT STEPS */}
      <section
        aria-labelledby="checklist-title"
        className="bg-white rounded-2xl border-2 border-slate-200/90 p-5 sm:p-7 shadow-sm space-y-5 print:border-slate-300"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-rose-500" />
              <h2 id="checklist-title" className="text-lg sm:text-xl font-bold text-[#0D1B2A]">
                Printable DC Launch & Compliance Checklist
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Required legal approvals, safety hardware, and licensing portals before going live in Washington, DC.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto print:hidden">
            {/* Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Filter:</span>
              <div className="relative">
                <select
                  value={checklistFilter}
                  onChange={(e) => setChecklistFilter(e.target.value as any)}
                  className="h-8 pl-2.5 pr-7 rounded-lg bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 appearance-none cursor-pointer focus:outline-none focus:border-rose-500"
                  aria-label="Filter checklist items"
                >
                  <option value="all">All Tasks ({verdict.checklist.length})</option>
                  <option value="pending">Pending ({verdict.checklist.length - completedCount})</option>
                  <option value="completed">Completed ({completedCount})</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <span className="text-xs font-semibold text-slate-500">
                {completedCount}/{verdict.checklist.length}
              </span>
              <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${(completedCount / verdict.checklist.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* The Checklist Items */}
        <div className="space-y-3">
          {filteredChecklist.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
              No tasks found in this view.
            </div>
          ) : (
            filteredChecklist.map((item) => {
              const isChecked = Boolean(checkedItems[item.id]);

              return (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                    isChecked
                      ? 'bg-emerald-50/50 border-emerald-400'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  } print:bg-white print:border-slate-300`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0 print:text-slate-800"
                    aria-label={isChecked ? `Mark ${item.title} incomplete` : `Mark ${item.title} complete`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span
                        className={`text-sm font-bold ${
                          isChecked ? 'text-emerald-950 line-through opacity-80' : 'text-[#0D1B2A]'
                        }`}
                      >
                        {item.title}
                      </span>

                      {item.authorityOrUrl && (
                        <a
                          href={item.authorityOrUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline print:text-slate-900"
                        >
                          <span>{item.urlText}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Collapsible Dropdown: Safety Note Alert Callout */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSafetyDetails(!showSafetyDetails)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
              <Flame className="w-4 h-4 text-amber-600 shrink-0" />
              <span>DC Life Safety Standards (Title 12-H) Requirements</span>
            </div>
            {showSafetyDetails ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
          {showSafetyDetails && (
            <div className="p-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white space-y-1">
              <p>
                Smoke alarms must be under 10 years old and have a sealed 10-year battery or hardwire connection. Carbon monoxide alarms are mandatory within 15 feet of every bedroom. A working fire extinguisher must be clearly visible or signed inside kitchen cabinetry.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 5. EDIT PREVIOUS ANSWERS / START OVER FOOTER CARD */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="text-sm font-bold text-[#0D1B2A]">
            Want to revise your numbers or assumptions?
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Use the dropdown below to jump directly back to any step to tweak rates, occupancy, or household setup.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) onGoToStep(e.target.value as StepId);
              }}
              className="h-10 pl-3 pr-8 rounded-xl bg-slate-50 border-2 border-slate-300 text-xs font-bold text-slate-800 appearance-none cursor-pointer focus:outline-none focus:border-rose-500 transition-colors"
              aria-label="Jump to a specific step"
            >
              <option value="" disabled>Select</option>
              <option value="home">Step 1: Your Home</option>
              <option value="eligibility">Step 2: DC Eligibility</option>
              <option value="earnings">Step 3: Neighborhood Earnings</option>
              <option value="time">Step 4: Your Time & Risks</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={onReset}
            className="h-10 px-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start Over</span>
          </button>
        </div>
      </div>

      {/* Estimates Disclaimer */}
      <EstimatesDisclaimer variant="card" />
    </div>
  );
};
