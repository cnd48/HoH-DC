import React, { useState } from 'react';
import {
  MainResidenceChoice,
  HouseholdChoice,
  Step1Answers
} from '../types';
import {
  Home,
  Building,
  User,
  Users,
  Baby,
  HeartHandshake,
  Award,
  CheckCircle2,
  Info,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { EstimatesDisclaimer } from './EstimatesDisclaimer';

interface Step1YourHomeProps {
  answers: Step1Answers;
  onChange: (updated: Partial<Step1Answers>) => void;
}

export const Step1YourHome: React.FC<Step1YourHomeProps> = ({
  answers,
  onChange
}) => {
  const [showLegalDetails, setShowLegalDetails] = useState(false);
  const isComplete = answers.isMainResidence !== null && answers.householdComposition !== null;

  const householdOptions: {
    value: HouseholdChoice;
    label: string;
    sublabel: string;
    badge: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: 'just_me',
      label: 'Just me (Solo homeowner)',
      sublabel: 'Solo host',
      badge: 'Maximum Flexibility',
      desc: 'Complete control over guest calendar, privacy, and noise standards.',
      icon: <User className="w-4 h-4 text-rose-500" />
    },
    {
      value: 'partner',
      label: 'Me and my partner (Couple / Co-owners)',
      sublabel: 'Shared household',
      badge: 'Shared Effort',
      desc: 'Shared turnover duties, mutual calendar syncing, and unified privacy preferences.',
      icon: <HeartHandshake className="w-4 h-4 text-rose-500" />
    },
    {
      value: 'family_children',
      label: 'Family with children (Minors in the home)',
      sublabel: 'Family priority',
      badge: 'Privacy Priority',
      desc: 'Child safety, bedtime quiet hours, and school schedules guide hosting boundaries.',
      icon: <Baby className="w-4 h-4 text-rose-500" />
    },
    {
      value: 'older_relative',
      label: 'An older relative lives with us (Multi-generational)',
      sublabel: 'Accessibility focus',
      badge: 'Low Disruption',
      desc: 'Emphasis on separate basement entrance, minimal noise, and mobility accessibility.',
      icon: <Users className="w-4 h-4 text-rose-500" />
    },
    {
      value: 'senior',
      label: "I'm a senior homeowner (Age 65+ / Aging in place)",
      sublabel: 'Tax relief synergy',
      badge: 'Property Tax Relief',
      desc: 'Reliable supplemental income to offset DC property taxes with low-stress hosting.',
      icon: <Award className="w-4 h-4 text-rose-500" />
    }
  ];

  const selectedHousehold = householdOptions.find((h) => h.value === answers.householdComposition);

  return (
    <div className="space-y-6 pb-8">
      {/* Step Introduction - Compact Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
          <span>Step 1 of 5</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500 font-medium">Core Living Arrangement</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0D1B2A] tracking-tight">
            Your Home in Washington, DC
          </h1>
          {isComplete && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Step 1 Answered
            </span>
          )}
        </div>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
          Use the quick drop-downs below to select your residency status and household arrangement.
        </p>
      </div>

      {/* Main Interactive Form Card - Compact Drop-down Layout */}
      <div className="bg-white rounded-2xl border-2 border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5">
        {/* QUESTION 1: Main Residence Drop-down */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="residency-dropdown"
              className="text-xs sm:text-sm font-bold text-[#0D1B2A] flex items-center gap-2"
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0D1B2A] text-white text-[11px] font-bold">
                1
              </span>
              <span>Do you live in this home as your primary residence?</span>
            </label>
            {answers.isMainResidence && (
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Selected
              </span>
            )}
          </div>

          <div className="relative">
            <select
              id="residency-dropdown"
              value={answers.isMainResidence ?? ''}
              onChange={(e) => onChange({ isMainResidence: (e.target.value as MainResidenceChoice) || null })}
              className="w-full h-12 pl-4 pr-10 rounded-xl bg-slate-50 border-2 border-slate-300 hover:border-slate-400 focus:border-rose-500 focus:bg-white text-slate-900 font-semibold text-xs sm:text-sm appearance-none transition-all outline-none cursor-pointer"
            >
              <option value="" disabled>
                Select
              </option>
              <option value="yes">
                ✓ Yes — Primary Residence (I reside here at least 183 days/year · DC STR eligible)
              </option>
              <option value="no">
                ✗ No — Second Home or Inherited Property (Restricted under DC Law 22-559)
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Quick Informative Pill based on selection */}
          {answers.isMainResidence === 'yes' && (
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2 animate-fade-in">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-emerald-950">DC Compliance Confirmed:</strong> You qualify for both a standard DC Short-Term Rental license (hosted) and Vacation Rental endorsement (up to 90 unhosted nights/year).
              </div>
            </div>
          )}
          {answers.isMainResidence === 'no' && (
            <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-amber-950">DC Law Alert (Act 22-559):</strong> DC requires short-term rentals to be the operator's primary domicile. In Step 2, we will test exceptions and 30+ day medium-term rental alternatives.
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* QUESTION 2: Household Composition Drop-down */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="household-dropdown"
              className="text-xs sm:text-sm font-bold text-[#0D1B2A] flex items-center gap-2"
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0D1B2A] text-white text-[11px] font-bold">
                2
              </span>
              <span>Who shares the home with you on a daily basis?</span>
            </label>
            {answers.householdComposition && (
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Selected
              </span>
            )}
          </div>

          <div className="relative">
            <select
              id="household-dropdown"
              value={answers.householdComposition ?? ''}
              onChange={(e) => onChange({ householdComposition: (e.target.value as HouseholdChoice) || null })}
              className="w-full h-12 pl-4 pr-10 rounded-xl bg-slate-50 border-2 border-slate-300 hover:border-slate-400 focus:border-rose-500 focus:bg-white text-slate-900 font-semibold text-xs sm:text-sm appearance-none transition-all outline-none cursor-pointer"
            >
              <option value="" disabled>
                Select
              </option>
              {householdOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.badge}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Context Card for Selected Household */}
          {selectedHousehold && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 animate-fade-in text-xs">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                {selectedHousehold.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#0D1B2A]">{selectedHousehold.sublabel}</span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    {selectedHousehold.badge}
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  {selectedHousehold.desc}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Dropdown: DC Legal Note */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowLegalDetails(!showLegalDetails)}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>How does DC law define primary residence? (Act 22-559)</span>
            </span>
            {showLegalDetails ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {showLegalDetails && (
            <div className="mt-2.5 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-600 space-y-1.5 leading-relaxed animate-fade-in">
              <p>
                <strong>DC Code § 30-201.01:</strong> A primary residence is where an owner is physically present for at least 183 aggregate days during the calendar year, and is documented via DC DMV Driver’s License, voter registration, and DC Homestead Property Tax Deduction.
              </p>
              <p className="text-slate-500 text-[11px]">
                Failure to maintain primary residence can lead to revocation of the DLCP short-term license and retroactive loss of the Homestead tax deduction.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Estimates Disclaimer */}
      <EstimatesDisclaimer variant="subtle" />
    </div>
  );
};
