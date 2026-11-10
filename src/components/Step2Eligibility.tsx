import React, { useState } from 'react';
import {
  Step1Answers,
  Step2Answers,
  CondoHoaChoice,
  HoaRulesChoice,
  OwnershipChoice,
  LawMode
} from '../types';
import { calculateEligibility } from '../utils/eligibility';
import {
  Building2,
  Home,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Scale,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  DoorClosed,
  Bath,
  Volume2,
  Wrench,
  Calendar,
  Layers
} from 'lucide-react';
import { EstimatesDisclaimer } from './EstimatesDisclaimer';

interface Step2EligibilityProps {
  step1Answers: Step1Answers;
  answers: Step2Answers;
  onChange: (updated: Partial<Step2Answers>) => void;
}

export const Step2Eligibility: React.FC<Step2EligibilityProps> = ({
  step1Answers,
  answers,
  onChange
}) => {
  const [showStatutoryDetails, setShowStatutoryDetails] = useState(false);
  const result = calculateEligibility(step1Answers, answers);

  const isCondoAnswered = answers.isCondoOrHoa !== null;
  const isHoaSubAnswered = answers.isCondoOrHoa === 'no' || answers.hoaAllowsStr !== null;
  const isOwnershipAnswered = answers.ownershipType !== null;
  const isStep2Complete = isCondoAnswered && isHoaSubAnswered && isOwnershipAnswered;

  // Combined Condo/HOA dropdown helper value
  const getCondoDropdownValue = () => {
    if (answers.isCondoOrHoa === null) return '';
    if (answers.isCondoOrHoa === 'no') return 'fee_simple';
    if (answers.isCondoOrHoa === 'yes') {
      if (answers.hoaAllowsStr === 'yes') return 'condo_allowed';
      if (answers.hoaAllowsStr === 'no') return 'condo_prohibited';
      if (answers.hoaAllowsStr === 'not_sure') return 'condo_unsure';
      return 'condo_needs_sub';
    }
    return '';
  };

  const handleCondoDropdownChange = (val: string) => {
    if (val === 'fee_simple') {
      onChange({ isCondoOrHoa: 'no', hoaAllowsStr: null });
    } else if (val === 'condo_allowed') {
      onChange({ isCondoOrHoa: 'yes', hoaAllowsStr: 'yes' });
    } else if (val === 'condo_prohibited') {
      onChange({ isCondoOrHoa: 'yes', hoaAllowsStr: 'no' });
    } else if (val === 'condo_unsure') {
      onChange({ isCondoOrHoa: 'yes', hoaAllowsStr: 'not_sure' });
    }
  };

  const householdComp = step1Answers.householdComposition;

  return (
    <div className="space-y-6 pb-8">
      {/* Step Introduction - Compact Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
          <span>Step 2 of 5</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500 font-medium">District Regulations & HOA Check</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0D1B2A] tracking-tight">
            DC Licensing & Property Eligibility
          </h1>
          {isStep2Complete && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${
              result.status === 'green'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : result.status === 'amber'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}>
              {result.status === 'green' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              {result.status === 'amber' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
              {result.status === 'red' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
              <span>{result.status.toUpperCase()} ELIGIBILITY</span>
            </span>
          )}
        </div>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
          Select your HOA, property deed, and household living setup via the drop-downs below to calculate local compliance.
        </p>
      </div>

      {/* Legislative Framework Drop-down Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-rose-500 shrink-0" />
            <div>
              <span className="text-xs font-bold text-[#0D1B2A] uppercase tracking-wider">
                Regulatory Framework
              </span>
              <p className="text-[11px] text-slate-500">
                Choose which DC statute to evaluate against
              </p>
            </div>
          </div>

          <div className="relative sm:w-72">
            <select
              value={answers.lawMode}
              onChange={(e) => onChange({ lawMode: e.target.value as LawMode })}
              className="w-full h-10 pl-3 pr-9 rounded-xl bg-slate-50 border-2 border-slate-300 hover:border-slate-400 focus:border-rose-500 focus:bg-white text-xs font-bold text-slate-800 appearance-none outline-none cursor-pointer"
            >
              <option value="current">Current Law: Act 22-559 (Active)</option>
              <option value="proposed_2026">Proposed 2026 Bill (Pending Reform)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <span>
            {answers.lawMode === 'current' ? (
              <span><strong>Current DC Law:</strong> STR licenses are restricted exclusively to your <em>primary residence</em> (183+ days/year). Non-primary properties cannot be legally licensed.</span>
            ) : (
              <span><strong>Proposed 2026 Bill:</strong> Would permit DC residents to license <em>one second property</em> they own in the District, expanding short-term rental opportunities for local owners.</span>
            )}
          </span>
        </div>
      </div>

      {/* Main Questions Drop-down Form Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5">
        {/* QUESTION 1: Condo or HOA Drop-down */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="condo-dropdown" className="text-xs sm:text-sm font-bold text-[#0D1B2A] flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0D1B2A] text-white text-[11px] font-bold">
                1
              </span>
              <span>Is the home a condominium or governed by an HOA?</span>
            </label>
            {isCondoAnswered && isHoaSubAnswered && (
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Selected
              </span>
            )}
          </div>

          <div className="relative">
            <select
              id="condo-dropdown"
              value={getCondoDropdownValue()}
              onChange={(e) => handleCondoDropdownChange(e.target.value)}
              className="w-full h-12 pl-4 pr-10 rounded-xl bg-slate-50 border-2 border-slate-300 hover:border-slate-400 focus:border-rose-500 focus:bg-white text-slate-900 font-semibold text-xs sm:text-sm appearance-none transition-all outline-none cursor-pointer"
            >
              <option value="" disabled>Select</option>
              <option value="fee_simple">No — Fee-Simple Single Family / Rowhouse (No HOA or Condo Board)</option>
              <option value="condo_allowed">Yes — Condo / HOA (Bylaws explicitly allow short-term rentals)</option>
              <option value="condo_prohibited">Yes — Condo / HOA (Bylaws prohibit rentals &lt; 30 days)</option>
              <option value="condo_unsure">Yes — Condo / HOA (Unsure / Need to verify declaration of covenants)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* QUESTION 2: Ownership Deed Type Drop-down */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="ownership-dropdown" className="text-xs sm:text-sm font-bold text-[#0D1B2A] flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0D1B2A] text-white text-[11px] font-bold">
                2
              </span>
              <span>How is the property legally titled?</span>
            </label>
            {isOwnershipAnswered && (
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Selected
              </span>
            )}
          </div>

          <div className="relative">
            <select
              id="ownership-dropdown"
              value={answers.ownershipType ?? ''}
              onChange={(e) => onChange({ ownershipType: (e.target.value as OwnershipChoice) || null })}
              className="w-full h-12 pl-4 pr-10 rounded-xl bg-slate-50 border-2 border-slate-300 hover:border-slate-400 focus:border-rose-500 focus:bg-white text-slate-900 font-semibold text-xs sm:text-sm appearance-none transition-all outline-none cursor-pointer"
            >
              <option value="" disabled>Select</option>
              <option value="personal">Individual Natural Person (In my personal name · DLCP license eligible)</option>
              <option value="entity">LLC, Corporation, or Trust (Corporate ownership · Barred under DC law)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* QUESTION 3: Household Living Logistics Drop-downs (Tailored to Step 1 Household) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0D1B2A] text-white text-[11px] font-bold">
              3
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#0D1B2A]">
              Household Living & Layout Logistics
            </span>
            <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Tailored to your household
            </span>
          </div>

          {/* Branch A: Family with Children */}
          {householdComp === 'family_children' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Guest Entrance Setup
                </label>
                <div className="relative">
                  <select
                    value={answers.householdLiving?.hasPrivateEntrance ?? ''}
                    onChange={(e) =>
                      onChange({
                        householdLiving: {
                          ...answers.householdLiving,
                          hasPrivateEntrance: (e.target.value as 'yes' | 'no') || null
                        }
                      })
                    }
                    className="w-full h-11 pl-3 pr-8 rounded-xl bg-slate-50 border-2 border-slate-300 focus:border-rose-500 text-xs font-semibold text-slate-900 appearance-none outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select</option>
                    <option value="yes">Private Exterior Entrance (Separate doors)</option>
                    <option value="no">Shared Entrance (Through main family foyer)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Bath & Kitchen Facilities
                </label>
                <div className="relative">
                  <select
                    value={answers.householdLiving?.sharesKitchenBath ?? ''}
                    onChange={(e) =>
                      onChange({
                        householdLiving: {
                          ...answers.householdLiving,
                          sharesKitchenBath: (e.target.value as 'no_private' | 'yes_shared') || null
                        }
                      })
                    }
                    className="w-full h-11 pl-3 pr-8 rounded-xl bg-slate-50 border-2 border-slate-300 focus:border-rose-500 text-xs font-semibold text-slate-900 appearance-none outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select</option>
                    <option value="no_private">Dedicated Private Bathroom & Kitchenette</option>
                    <option value="yes_shared">Shared Bathroom or Kitchen with Family</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Branch B: Older Relative / Senior */}
          {(householdComp === 'older_relative' || householdComp === 'senior') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Noise Sensitivity
                </label>
                <div className="relative">
                  <select
                    value={answers.householdLiving?.isNoiseAConcern ?? ''}
                    onChange={(e) =>
                      onChange({
                        householdLiving: {
                          ...answers.householdLiving,
                          isNoiseAConcern: (e.target.value as 'yes' | 'no') || null
                        }
                      })
                    }
                    className="w-full h-11 pl-3 pr-8 rounded-xl bg-slate-50 border-2 border-slate-300 focus:border-rose-500 text-xs font-semibold text-slate-900 appearance-none outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select</option>
                    <option value="yes">Quiet Essential (Strict 10pm quiet hours)</option>
                    <option value="no">Normal Everyday Noise Acceptable</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Turnover & Cleaning Management
                </label>
                <div className="relative">
                  <select
                    value={answers.householdLiving?.managementPreference ?? ''}
                    onChange={(e) =>
                      onChange({
                        householdLiving: {
                          ...answers.householdLiving,
                          managementPreference: (e.target.value as 'self' | 'hire_help') || null
                        }
                      })
                    }
                    className="w-full h-11 pl-3 pr-8 rounded-xl bg-slate-50 border-2 border-slate-300 focus:border-rose-500 text-xs font-semibold text-slate-900 appearance-none outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select</option>
                    <option value="hire_help">Hiring Cleaning Help / Turnover Co-host</option>
                    <option value="self">Self-Managing Cleanings & Linens</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Branch C: Just Me (Solo) */}
          {householdComp === 'just_me' && (
            <div className="pt-1">
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Annual Travel / Nights Away From DC
              </label>
              <div className="relative">
                <select
                  value={answers.householdLiving?.travelNightsPerYear ?? ''}
                  onChange={(e) =>
                    onChange({
                      householdLiving: {
                        ...answers.householdLiving,
                        travelNightsPerYear: (e.target.value as 'under_30' | '30_to_90' | 'over_90') || null
                      }
                    })
                  }
                  className="w-full h-11 pl-3 pr-8 rounded-xl bg-slate-50 border-2 border-slate-300 focus:border-rose-500 text-xs font-semibold text-slate-900 appearance-none outline-none cursor-pointer"
                >
                  <option value="" disabled>Select</option>
                  <option value="under_30">Under 30 nights/year away (Occasional weekends & getaways)</option>
                  <option value="30_to_90">30 to 90 nights/year away (Fits DC 90-night Vacation Rental Cap)</option>
                  <option value="over_90">Over 90 nights/year away (Exceeds DC unhosted cap · requires hosted stays)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}

          {/* Branch D: Partner */}
          {householdComp === 'partner' && (
            <div className="pt-1">
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Intended Rental Space Configuration
              </label>
              <div className="relative">
                <select
                  value={answers.householdLiving?.spaceType ?? ''}
                  onChange={(e) =>
                    onChange({
                      householdLiving: {
                        ...answers.householdLiving,
                        spaceType: (e.target.value as 'spare_room' | 'separate_unit' | 'entire_home_away') || null
                      }
                    })
                  }
                  className="w-full h-11 pl-3 pr-8 rounded-xl bg-slate-50 border-2 border-slate-300 focus:border-rose-500 text-xs font-semibold text-slate-900 appearance-none outline-none cursor-pointer"
                >
                  <option value="" disabled>Select</option>
                  <option value="separate_unit">Separate Basement Apartment / English Basement</option>
                  <option value="spare_room">Spare Bedroom Suite (Shared hallway/kitchen)</option>
                  <option value="entire_home_away">Entire Home Only While Traveling Away</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-Time DC Eligibility Result Card */}
      {isStep2Complete && (
        <div className={`rounded-2xl border-2 p-5 shadow-sm transition-all animate-fade-in ${
          result.status === 'green'
            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
            : result.status === 'amber'
            ? 'bg-amber-50/70 border-amber-300 text-amber-950'
            : 'bg-rose-50/70 border-rose-300 text-rose-950'
        }`}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {result.status === 'green' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
              {result.status === 'amber' && <AlertTriangle className="w-6 h-6 text-amber-600" />}
              {result.status === 'red' && <XCircle className="w-6 h-6 text-rose-600" />}
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider">
                  {result.status.toUpperCase()} ELIGIBILITY
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-bold">{result.headline}</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {result.reason}
              </p>

              {/* Collapsible Dropdown for Detailed Statutory Points */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatutoryDetails(!showStatutoryDetails)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  <span>{showStatutoryDetails ? 'Hide' : 'View'} statutory points & requirements</span>
                  {showStatutoryDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showStatutoryDetails && (
                  <ul className="mt-2 space-y-1 text-xs list-disc list-inside bg-white/70 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                    {result.bulletPoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                    {result.billDifference && (
                      <li className="font-semibold text-rose-900 pt-1 border-t border-slate-200/60 list-none">
                        💡 {result.billDifference}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estimates Disclaimer */}
      <EstimatesDisclaimer variant="subtle" />
    </div>
  );
};
