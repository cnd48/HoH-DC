import { Step1Answers, Step2Answers, Step3Answers, Step4Answers, ASSESSMENT_STEPS, StepId } from '../types';
import { calculateEligibility } from '../utils/eligibility';
import { calculateNetEarnings } from '../utils/earnings';
import { calculateRiskEvaluation } from '../utils/risks';
import {
  CheckCircle2,
  DollarSign,
  Clock,
  ArrowLeft,
  Scale,
  Sparkles,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  TrendingUp,
  Shield
} from 'lucide-react';

interface StepPreviewProps {
  currentStep: StepId;
  step1Answers: Step1Answers;
  step2Answers: Step2Answers;
  step3Answers?: Step3Answers;
  step4Answers?: Step4Answers;
  onBackToStep1: () => void;
  onBackToStep2: () => void;
  onBackToStep3?: () => void;
  onBackToStep4?: () => void;
  onGoToStep: (step: StepId) => void;
}

export const StepPreview: React.FC<StepPreviewProps> = ({
  currentStep,
  step1Answers,
  step2Answers,
  step3Answers,
  step4Answers,
  onBackToStep1,
  onBackToStep2,
  onBackToStep3,
  onBackToStep4,
  onGoToStep
}) => {
  const currentStepDef = ASSESSMENT_STEPS.find((s) => s.id === currentStep) || ASSESSMENT_STEPS[2];
  const eligibility = calculateEligibility(step1Answers, step2Answers);

  const householdLabels: Record<string, string> = {
    just_me: 'Just me (Solo homeowner)',
    partner: 'Me and my partner',
    family_children: 'Family with children',
    older_relative: 'An older relative lives with us',
    senior: "I'm a senior homeowner"
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1.5">
          <span>Step {currentStepDef.stepNumber} of 5</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500 font-medium">Upcoming Module</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B2A] tracking-tight">
          {currentStepDef.title}: DC Assessment
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          {currentStepDef.description}. Answers from previous steps have been securely saved and loaded below.
        </p>
      </div>

      {/* Saved Profile Summary (Steps 1 & 2) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-[#0D1B2A]">
              Saved Profile (Steps 1 & 2)
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStep1}
              type="button"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Edit Home
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={onBackToStep2}
              type="button"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Edit Eligibility
            </button>
            {onBackToStep3 && (
              <>
                <span className="text-slate-300">·</span>
                <button
                  onClick={onBackToStep3}
                  type="button"
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Edit Earnings
                </button>
              </>
            )}
            {onBackToStep4 && (
              <>
                <span className="text-slate-300">·</span>
                <button
                  onClick={onBackToStep4}
                  type="button"
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Edit Time
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Main Residence
            </span>
            <span className="text-xs font-bold text-[#0D1B2A] block mt-1">
              {step1Answers.isMainResidence === 'yes' ? 'Yes (Primary Home)' : 'No (Second/Inherited)'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Household Setup
            </span>
            <span className="text-xs font-bold text-[#0D1B2A] block mt-1 truncate">
              {step1Answers.householdComposition ? householdLabels[step1Answers.householdComposition] : 'Not specified'}
            </span>
          </div>

          <div className={`p-3.5 rounded-xl border ${
            eligibility.status === 'green'
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
              : eligibility.status === 'amber'
              ? 'bg-amber-50/80 border-amber-300 text-amber-900'
              : 'bg-rose-50/80 border-rose-300 text-rose-900'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block">
              Eligibility Status
            </span>
            <span className="text-xs font-extrabold flex items-center gap-1.5 mt-1">
              {eligibility.status === 'green' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              {eligibility.status === 'amber' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
              {eligibility.status === 'red' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
              <span>{eligibility.status.toUpperCase()}</span>
              <span className="text-[10px] opacity-75 font-medium">({step2Answers.lawMode === 'current' ? 'Current Law' : '2026 Bill'})</span>
            </span>
          </div>
        </div>

        {/* Living Parameters Strip */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">Living Setup:</span>
          {step2Answers.householdLiving?.hasPrivateEntrance && (
            <span>Entrance: <strong>{step2Answers.householdLiving.hasPrivateEntrance === 'yes' ? 'Private' : 'Shared'}</strong></span>
          )}
          {step2Answers.householdLiving?.sharesKitchenBath && (
            <span>Bath/Kitchen: <strong>{step2Answers.householdLiving.sharesKitchenBath === 'no_private' ? 'Private' : 'Shared'}</strong></span>
          )}
          {step2Answers.householdLiving?.isNoiseAConcern && (
            <span>Noise: <strong>{step2Answers.householdLiving.isNoiseAConcern === 'yes' ? 'Quiet Essential' : 'Flexible'}</strong></span>
          )}
          {step2Answers.householdLiving?.managementPreference && (
            <span>Turnover: <strong>{step2Answers.householdLiving.managementPreference === 'self' ? 'Self-Managed' : 'Hire Help'}</strong></span>
          )}
          {step2Answers.householdLiving?.travelNightsPerYear && (
            <span>Travel: <strong>{step2Answers.householdLiving.travelNightsPerYear === 'under_30' ? '<30 nights' : step2Answers.householdLiving.travelNightsPerYear === '30_to_90' ? '30-90 nights' : '90+ nights'}</strong></span>
          )}
          {step2Answers.householdLiving?.spaceType && (
            <span>Space: <strong>{step2Answers.householdLiving.spaceType === 'separate_unit' ? 'Separate Unit' : step2Answers.householdLiving.spaceType === 'spare_room' ? 'Spare Room' : 'Entire Home Away'}</strong></span>
          )}
        </div>

        {/* Step 3 Earnings Strip if populated */}
        {step3Answers && (
          <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <TrendingUp className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                <strong>{step3Answers.neighborhood.split(',')[0]}</strong> ({step3Answers.spaceType.replace('_', ' ')}): ${step3Answers.nightlyRate}/night · {step3Answers.occupancyPercent}% occupancy
              </span>
            </div>
            <div className="font-extrabold text-[#0D1B2A] text-sm tabular-nums">
              ${(
                step3Answers.nightlyRate *
                (step3Answers.hostingMode === 'away'
                  ? Math.min(Math.round(365 * (step3Answers.occupancyPercent / 100)), 90)
                  : Math.round(365 * (step3Answers.occupancyPercent / 100)))
              ).toLocaleString()}/yr gross
            </div>
          </div>
        )}

        {/* Step 4 Time Commitment Strip if populated */}
        {step4Answers && step3Answers && (
          <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                Hosting Effort: <strong>{step4Answers.hoursPerWeek} hrs/week</strong> ({(step4Answers.hoursPerWeek * 52).toLocaleString()} hrs/yr)
              </span>
            </div>
            <div className="font-extrabold text-[#0D1B2A] text-sm tabular-nums flex items-center gap-1.5">
              <span>Effective Return:</span>
              <span className="text-emerald-700">
                ${Math.round(calculateNetEarnings(step3Answers).netIncome / Math.max(1, step4Answers.hoursPerWeek * 52))}/hr
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Preview of Upcoming Assessment Steps */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[#0D1B2A]">
          Remaining Assessment Modules
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-5 rounded-2xl border transition-all ${
            currentStep === 'earnings'
              ? 'bg-rose-50/30 border-rose-400 ring-2 ring-rose-200'
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#0D1B2A] text-white flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-rose-300" />
              </div>
              <div>
                <span className="text-xs font-semibold text-rose-600">Step 3</span>
                <h4 className="text-sm font-bold text-[#0D1B2A]">Earnings & DC Data</h4>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates nightly rates, 90-day unhosted caps, and neighborhood comps (Capitol Hill $35k, Shaw $58k).
            </p>
          </div>

          <div className={`p-5 rounded-2xl border transition-all ${
            currentStep === 'time'
              ? 'bg-rose-50/30 border-rose-400 ring-2 ring-rose-200'
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#0D1B2A] text-white flex items-center justify-center">
                <Clock className="w-5 h-5 text-rose-300" />
              </div>
              <div>
                <span className="text-xs font-semibold text-rose-600">Step 4</span>
                <h4 className="text-sm font-bold text-[#0D1B2A]">Your Time & Hosting Effort</h4>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Turnover, guest messages, DC noise compliance, and self-management vs. co-hosting trade-offs.
            </p>
          </div>

          <div className={`p-5 rounded-2xl border transition-all ${
            currentStep === 'verdict'
              ? 'bg-rose-50/30 border-rose-400 ring-2 ring-rose-200'
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#0D1B2A] text-white flex items-center justify-center">
                <Scale className="w-5 h-5 text-rose-300" />
              </div>
              <div>
                <span className="text-xs font-semibold text-rose-600">Step 5</span>
                <h4 className="text-sm font-bold text-[#0D1B2A]">Verdict: Host or Hold DC</h4>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Personalized final verdict score: Host, Hold, or Consider 30+ Day Medium-Term Rentals.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-start gap-3">
        <button
          onClick={onBackToStep2}
          type="button"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>Return to Step 2: Eligibility</span>
        </button>
      </div>
    </div>
  );
};
