import React, { useState } from 'react';
import {
  Step1Answers,
  Step2Answers,
  Step3Answers,
  Step4Answers
} from '../types';
import { calculateNetEarnings } from '../utils/earnings';
import { calculateRiskEvaluation, RiskCategory, RiskLevel } from '../utils/risks';
import {
  Clock,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  ChevronDown,
  ChevronUp,
  Info,
  Sliders
} from 'lucide-react';
import { EstimatesDisclaimer } from './EstimatesDisclaimer';

interface Step4YourTimeProps {
  step1Answers: Step1Answers;
  step2Answers: Step2Answers;
  step3Answers: Step3Answers;
  answers: Step4Answers;
  onChange: (updated: Partial<Step4Answers>) => void;
}

export const Step4YourTime: React.FC<Step4YourTimeProps> = ({
  step1Answers,
  step2Answers,
  step3Answers,
  answers,
  onChange
}) => {
  const [expandedRiskId, setExpandedRiskId] = useState<string | null>(null);
  const [showTaskBreakdown, setShowTaskBreakdown] = useState(false);
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium-high'>('all');

  // Compute financial net income from Step 3 answers
  const earnings = calculateNetEarnings(step3Answers);
  const yearlyHours = Math.max(1, answers.hoursPerWeek * 52);
  const effectiveHourlyRate = Math.round(earnings.netIncome / yearlyHours);

  // Compute risk meter data
  const riskEvaluation = calculateRiskEvaluation(
    step1Answers,
    step2Answers,
    step3Answers
  );

  const handleHoursChange = (val: number) => {
    const clamped = Math.max(1, Math.min(40, val));
    onChange({ hoursPerWeek: clamped });
  };

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            LOW RISK
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            MEDIUM RISK
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            HIGH RISK
          </span>
        );
    }
  };

  const filteredCategories = riskEvaluation.categories.filter((cat) => {
    if (riskFilter === 'high') return cat.level === 'high';
    if (riskFilter === 'medium-high') return cat.level === 'high' || cat.level === 'medium';
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1.5">
          <span>Step 4 of 5</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500 font-medium">Workload & DC Risk Profile</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B2A] tracking-tight">
          Your Time Commitment & Risk Evaluation
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
          Hosting on Airbnb is an active operational commitment. Evaluate your effective hourly earnings against your projected profits, and review your home’s personalized DC risk profile.
        </p>
      </div>

      {/* 2. EFFECTIVE HOURLY EARNINGS HERO BANNER */}
      <div className="bg-[#0D1B2A] text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              Effective Hourly Return
            </span>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight flex items-baseline gap-2">
              <span className="text-emerald-400 tabular-nums">${effectiveHourlyRate}</span>
              <span className="text-lg sm:text-2xl font-bold text-slate-300">/ hour</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Based on spending <strong className="text-white">{answers.hoursPerWeek} hrs/week</strong> ({yearlyHours.toLocaleString()} hrs/year) to generate a projected <strong className="text-emerald-300">${earnings.netIncome.toLocaleString()}</strong> in net annual hosting income.
            </p>
          </div>

          {/* Quick Comparison Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 text-left shrink-0 sm:min-w-[240px]">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
              DC Benchmark Comparison
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>DC Min. Wage:</span>
                <span className="font-semibold text-white">$17.50/hr</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>DC Co-Host Fee:</span>
                <span className="font-semibold text-white">~$35–$45/hr</span>
              </div>
              <div className="pt-1.5 border-t border-white/15 flex items-center justify-between font-bold">
                <span className="text-rose-300">Your Hosting Wage:</span>
                <span className={`text-sm ${effectiveHourlyRate >= 45 ? 'text-emerald-400' : 'text-amber-300'}`}>
                  ${effectiveHourlyRate}/hr
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION: TIME COMMITMENT ESTIMATOR & PRESETS */}
      <section aria-labelledby="hours-input-title" className="bg-white rounded-2xl border-2 border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-rose-500" />
              <h2 id="hours-input-title" className="text-lg sm:text-xl font-bold text-[#0D1B2A]">
                Hosting Hours Per Week
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select a hosting style preset or adjust the slider to match your schedule.
            </p>
          </div>

          <div className="flex items-baseline gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 self-start sm:self-auto">
            <span className="text-2xl font-black text-rose-600">
              {answers.hoursPerWeek}
            </span>
            <span className="text-xs font-bold text-slate-700">hrs</span>
            <span className="text-xs text-slate-500">/ week</span>
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="space-y-2.5">
          <input
            type="range"
            min="1"
            max="25"
            step="1"
            value={answers.hoursPerWeek}
            onChange={(e) => handleHoursChange(parseInt(e.target.value, 10))}
            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
            aria-label="Hours per week spent on hosting"
          />

          <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
            <span>1 hr/wk (delegated)</span>
            <span className="font-semibold text-rose-600">Default: 5 hrs/wk</span>
            <span>25 hrs/wk (deeply hands-on)</span>
          </div>
        </div>

        {/* Hosting Style & Commitment Drop-down Preset */}
        <div>
          <label htmlFor="commitment-preset-select" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
            <span>Hosting Style & Commitment Preset</span>
            <span className="text-[11px] text-slate-400 font-normal">Select a preset or adjust the slider above</span>
          </label>
          <div className="relative">
            <select
              id="commitment-preset-select"
              value={answers.hoursPerWeek || ''}
              onChange={(e) => handleHoursChange(parseInt(e.target.value, 10))}
              className="w-full h-11 pl-4 pr-10 rounded-xl bg-slate-50 border-2 border-slate-300 text-slate-900 font-semibold text-xs sm:text-sm focus:bg-white focus:border-rose-500 focus:outline-none transition-colors cursor-pointer appearance-none"
            >
              <option value="">Select</option>
              <option value={2}>Light Touch (2 hrs/week — Smart locks + hired turnover cleaner)</option>
              <option value={5}>Standard Host (5 hrs/week — Direct guest messaging & supply restocking)</option>
              <option value={9}>Hands-On Turnovers (9 hrs/week — Self-cleaning, laundry & in-person meets)</option>
              <option value={15}>Bespoke Hospitality (15 hrs/week — Frequent 1-night turns & concierge touches)</option>
              {answers.hoursPerWeek > 0 && !([2, 5, 9, 15].includes(answers.hoursPerWeek)) && (
                <option value={answers.hoursPerWeek}>Custom ({answers.hoursPerWeek} hrs/week via slider)</option>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Collapsible Dropdown: Weekly Task Distribution Breakdown */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowTaskBreakdown(!showTaskBreakdown)}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>View estimated breakdown of your {answers.hoursPerWeek} weekly hours</span>
            </span>
            {showTaskBreakdown ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {showTaskBreakdown && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-fade-in">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-[#0D1B2A] block">Guest Inquiries & Check-In</span>
                <span className="text-rose-600 font-extrabold text-sm block mt-0.5">
                  ~{(answers.hoursPerWeek * 0.35).toFixed(1)} hrs/wk
                </span>
                <p className="text-slate-500 text-[11px] mt-1">
                  Messaging before arrival, key codes, parking advice & house manual answers.
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-[#0D1B2A] block">Turnovers & Restocking</span>
                <span className="text-rose-600 font-extrabold text-sm block mt-0.5">
                  ~{(answers.hoursPerWeek * 0.45).toFixed(1)} hrs/wk
                </span>
                <p className="text-slate-500 text-[11px] mt-1">
                  Washing sheets, replenishing toiletries, taking out trash, and inspecting space.
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-[#0D1B2A] block">Upkeep & DC Compliance</span>
                <span className="text-rose-600 font-extrabold text-sm block mt-0.5">
                  ~{(answers.hoursPerWeek * 0.20).toFixed(1)} hrs/wk
                </span>
                <p className="text-slate-500 text-[11px] mt-1">
                  Smoke/CO detector tests, HVAC filters, DLCP license tracking & tax logs.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. SECTION: DYNAMIC 4-BAR RISK METER */}
      <section aria-labelledby="risk-meter-title" className="bg-white rounded-2xl border-2 border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-rose-500" />
                <h2 id="risk-meter-title" className="text-lg sm:text-xl font-bold text-[#0D1B2A]">
                  DC Hosting Risk Meter
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Calibrated to your household composition, ownership title, HOA rules, and hosting mode.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">Filter:</span>
                <div className="relative">
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value as any)}
                    className="h-8 pl-2.5 pr-7 rounded-lg bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 appearance-none cursor-pointer focus:outline-none focus:border-rose-500"
                    aria-label="Filter risk categories"
                  >
                    <option value="all">All Dimensions ({riskEvaluation.categories.length})</option>
                    <option value="high">High Risk Only</option>
                    <option value="medium-high">Medium & High</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Overall:</span>
                {getRiskBadge(riskEvaluation.overallRiskLevel)}
              </div>
            </div>
          </div>
        </div>

        {/* 4 BARS CONTAINER */}
        <div className="space-y-3 pt-1">
          {filteredCategories.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
              No categories match the selected filter.
            </div>
          ) : (
            filteredCategories.map((cat, index) => {
              const isExpanded = expandedRiskId === cat.id;

              return (
                <div
                  key={cat.id}
                  className={`rounded-xl border-2 transition-all ${
                    cat.level === 'high'
                      ? 'border-rose-300 bg-rose-50/20'
                      : cat.level === 'medium'
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200 bg-slate-50/40'
                  }`}
                >
                  {/* Collapsible Bar Header: Clickable to expand/collapse details */}
                  <button
                    type="button"
                    onClick={() => setExpandedRiskId(isExpanded ? null : cat.id)}
                    className="w-full p-3.5 sm:p-4 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] transition-colors cursor-pointer rounded-xl"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#0D1B2A] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-[#0D1B2A] flex items-center gap-2">
                          <span>{cat.title}</span>
                        </h3>
                        <span className="text-xs font-medium text-slate-500">
                          {cat.headline}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      {/* Mini Gauge Bar Preview */}
                      <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full ${
                            cat.level === 'high'
                              ? 'w-full bg-rose-500'
                              : cat.level === 'medium'
                              ? 'w-2/3 bg-amber-500'
                              : 'w-1/3 bg-emerald-500'
                          }`}
                        />
                      </div>
                      {getRiskBadge(cat.level)}
                      <span className="text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    </div>
                  </button>

                  {/* Expandable Body: Reasons & Mitigations */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-200/70 space-y-3 animate-fade-in">
                      {/* VISUAL 3-STAGE GAUGE BAR */}
                      <div className="space-y-1 pt-2">
                        <div className="grid grid-cols-3 gap-1.5 h-2.5">
                          <div
                            className={`h-full rounded-l-md transition-all ${
                              cat.level === 'low' || cat.level === 'medium' || cat.level === 'high'
                                ? cat.level === 'low'
                                  ? 'bg-emerald-500'
                                  : 'bg-emerald-300'
                                : 'bg-slate-200'
                            }`}
                          />
                          <div
                            className={`h-full transition-all ${
                              cat.level === 'medium' || cat.level === 'high'
                                ? cat.level === 'medium'
                                  ? 'bg-amber-500'
                                  : 'bg-amber-300'
                                : 'bg-slate-200'
                            }`}
                          />
                          <div
                            className={`h-full rounded-r-md transition-all ${
                              cat.level === 'high' ? 'bg-rose-500' : 'bg-slate-200'
                            }`}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-0.5">
                          <span className={cat.level === 'low' ? 'text-emerald-700 font-extrabold' : ''}>Low</span>
                          <span className={cat.level === 'medium' ? 'text-amber-700 font-extrabold' : ''}>Medium</span>
                          <span className={cat.level === 'high' ? 'text-rose-700 font-extrabold' : ''}>High</span>
                        </div>
                      </div>

                      {/* Reasons */}
                      <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Why this rating for your setup:
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {cat.reasons.map((reason, rIdx) => (
                            <li key={rIdx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                              <span className="leading-relaxed">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Mitigations */}
                      <div className="pt-2.5 border-t border-slate-200/80 bg-white/70 rounded-xl p-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D1B2A]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Recommended DC Action Plan & Mitigations</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {cat.mitigations.map((mit, mIdx) => (
                            <li key={mIdx} className="flex items-start gap-2">
                              <span className="text-emerald-600 font-bold shrink-0">✓</span>
                              <span className="leading-relaxed">{mit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 5. SUMMARY ACTION FOOTER CARD */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="text-sm font-bold text-[#0D1B2A]">
            Ready for your tailored recommendation?
          </div>
          <p className="text-xs text-slate-500">
            Proceed to Step 5: Verdict to receive your final Host, Hold, or Mid-Term Rental synthesis.
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-semibold text-slate-600 block">
            Projected Net: <strong className="text-emerald-700">${earnings.netIncome.toLocaleString()}/yr</strong>
          </span>
          <span className="text-xs text-slate-500 block">
            At {answers.hoursPerWeek} hrs/wk (${effectiveHourlyRate}/hr)
          </span>
        </div>
      </div>

      {/* Estimates Disclaimer */}
      <EstimatesDisclaimer variant="subtle" />
    </div>
  );
};
