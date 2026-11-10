import React, { useState } from 'react';
import { AssessmentState, StepId } from '../types';
import { calculateEligibility } from '../utils/eligibility';
import { calculateNetEarnings } from '../utils/earnings';
import { calculateRiskEvaluation } from '../utils/risks';
import { calculateVerdict } from '../utils/verdict';
import {
  ClipboardList,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  ArrowRight,
  TrendingUp,
  Home,
  Scale
} from 'lucide-react';

interface AssessmentSnapshotProps {
  assessment: AssessmentState;
  onGoToStep?: (step: StepId) => void;
  defaultOpen?: boolean;
  className?: string;
}

export const AssessmentSnapshot: React.FC<AssessmentSnapshotProps> = ({
  assessment,
  onGoToStep,
  defaultOpen = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const eligibility = calculateEligibility(assessment.step1, assessment.step2);
  const earnings = calculateNetEarnings(assessment.step3);
  const risks = calculateRiskEvaluation(assessment.step1, assessment.step2, assessment.step3);
  const verdict = calculateVerdict(assessment.step1, assessment.step2, assessment.step3, assessment.step4);

  // Check how many questions have answers
  const hasStep1 = assessment.step1.isMainResidence !== null || assessment.step1.householdComposition !== null;
  const hasStep2 = assessment.step2.isCondoOrHoa !== null || assessment.step2.ownershipType !== null || Boolean(assessment.step2.lawMode);
  const hasStep3 = Boolean(assessment.step3.neighborhood) || assessment.step3.nightlyRate > 0;
  const hasStep4 = (assessment.step4?.hoursPerWeek ?? 0) > 0;

  const totalAnswered = [hasStep1, hasStep2, hasStep3, hasStep4].filter(Boolean).length;

  // Household labels
  const householdLabels: Record<string, string> = {
    just_me: 'Just me (Solo)',
    partner: 'Me & partner',
    family_children: 'Family with kids',
    older_relative: 'Older relative',
    senior: 'Senior homeowner'
  };

  const effectiveHourly = Math.round(
    earnings.netIncome / Math.max(1, (assessment.step4?.hoursPerWeek || 5) * 52)
  );

  return (
    <div className={`bg-white rounded-2xl border-2 border-slate-200/90 shadow-xs overflow-hidden transition-all ${className}`}>
      {/* Dropdown Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer select-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#0D1B2A] text-white flex items-center justify-center shrink-0">
            <ClipboardList className="w-4 h-4 text-rose-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-[#0D1B2A] tracking-tight">
                Assessment Snapshot
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 hidden sm:inline-block">
                {totalAnswered} of 4 modules recorded
              </span>
            </div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5">
              {isOpen ? 'Click to collapse summary' : 'Click to drop down live assessment answers & metrics'}
            </div>
          </div>
        </div>

        {/* Right Header Badges & Chevron */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {/* Quick Law Mode Badge */}
          <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 hidden md:inline-block">
            {assessment.step2.lawMode === 'proposed_2026' ? '2026 Bill' : assessment.step2.lawMode === 'current' ? 'Current Law' : 'Law Mode: Select'}
          </span>

          {/* Quick Eligibility Pill */}
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
            eligibility.status === 'green'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : eligibility.status === 'amber'
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}>
            {eligibility.status === 'green' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
            {eligibility.status === 'amber' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
            {eligibility.status === 'red' && <XCircle className="w-3 h-3 text-rose-600" />}
            <span>{eligibility.status.toUpperCase()}</span>
          </span>

          {/* Quick Net Revenue if entered */}
          {assessment.step3?.nightlyRate > 0 && (
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 hidden lg:inline-block">
              ${earnings.netIncome.toLocaleString()}/yr
            </span>
          )}

          {/* Toggle Chevron */}
          <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Dropdown Content Area */}
      {isOpen && (
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-fade-in text-xs">
          {/* User Name if provided */}
          {assessment.user?.name && (
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Homeowner:</span>
              <span className="font-bold text-[#0D1B2A]">{assessment.user.name}</span>
            </div>
          )}

          {/* Grid of Steps Answers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Step 1: Home */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#0D1B2A]">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Home className="w-3.5 h-3.5 text-rose-500" />
                  1. Your Home
                </span>
                {onGoToStep && (
                  <button
                    type="button"
                    onClick={() => onGoToStep('home')}
                    className="text-[10px] text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary:</span>
                  <span className="font-semibold text-slate-800">
                    {assessment.step1.isMainResidence === 'yes'
                      ? 'Yes (Primary)'
                      : assessment.step1.isMainResidence === 'no'
                      ? 'No (Second/Other)'
                      : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Household:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                    {assessment.step1.householdComposition
                      ? householdLabels[assessment.step1.householdComposition]
                      : 'Not selected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Eligibility */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#0D1B2A]">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Scale className="w-3.5 h-3.5 text-rose-500" />
                  2. DC Eligibility
                </span>
                {onGoToStep && (
                  <button
                    type="button"
                    onClick={() => onGoToStep('eligibility')}
                    className="text-[10px] text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Law Mode:</span>
                  <span className="font-semibold text-slate-800">
                    {assessment.step2.lawMode === 'proposed_2026' ? '2026 Bill' : assessment.step2.lawMode === 'current' ? 'Act 22-559' : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Condo / HOA:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                    {assessment.step2.isCondoOrHoa === 'yes'
                      ? assessment.step2.hoaAllowsStr === 'yes'
                        ? 'Allowed'
                        : assessment.step2.hoaAllowsStr === 'no'
                        ? 'Prohibited'
                        : 'Unsure'
                      : assessment.step2.isCondoOrHoa === 'no'
                      ? 'No HOA'
                      : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Title Deed:</span>
                  <span className="font-semibold text-slate-800">
                    {assessment.step2.ownershipType === 'personal'
                      ? 'Personal Name'
                      : assessment.step2.ownershipType === 'entity'
                      ? 'LLC / Trust'
                      : 'Not selected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3: Earnings */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#0D1B2A]">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                  3. Earnings
                </span>
                {onGoToStep && (
                  <button
                    type="button"
                    onClick={() => onGoToStep('earnings')}
                    className="text-[10px] text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Neighborhood:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                    {assessment.step3.neighborhood ? assessment.step3.neighborhood.split(',')[0] : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nightly Rate:</span>
                  <span className="font-semibold text-slate-800">
                    {assessment.step3.nightlyRate > 0 ? `$${assessment.step3.nightlyRate}/night` : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Net Profit:</span>
                  <span className="font-bold text-emerald-600">
                    ${earnings.netIncome.toLocaleString()}/yr
                  </span>
                </div>
              </div>
            </div>

            {/* Step 4: Time & Verdict */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#0D1B2A]">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  4. Time & Verdict
                </span>
                {onGoToStep && (
                  <button
                    type="button"
                    onClick={() => onGoToStep('time')}
                    className="text-[10px] text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Commitment:</span>
                  <span className="font-semibold text-slate-800">
                    {assessment.step4?.hoursPerWeek ? `${assessment.step4.hoursPerWeek} hrs/wk` : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk Profile:</span>
                  <span className={`font-bold ${
                    risks.overallRiskLevel === 'low'
                      ? 'text-emerald-700'
                      : risks.overallRiskLevel === 'medium'
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}>
                    {risks.overallRiskLevel.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Live Verdict:</span>
                  <span className="font-black text-[#0D1B2A]">{verdict.badgeLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Footer inside Dropdown */}
          {onGoToStep && (
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 text-[11px] text-slate-500">
              <span>All answers update this live snapshot in real time.</span>
              <button
                type="button"
                onClick={() => onGoToStep('verdict')}
                className="font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Jump to Final Verdict</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
