import React, { useState } from 'react';
import {
  Step1Answers,
  Step2Answers,
  Step3Answers,
  RentalSpaceType,
  HostingMode
} from '../types';
import {
  DC_NEIGHBORHOODS,
  NeighborhoodData,
  TOP_10_NEIGHBORHOODS_BY_LISTINGS,
  getMedianPriceForRentalSpace
} from '../data/dcNeighborhoods';
import {
  DollarSign,
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles,
  RotateCcw,
  Info,
  Layers,
  Home,
  UserCheck,
  ShieldAlert,
  ArrowDown,
  Building,
  CheckCircle2,
  Percent,
  Bed,
  DoorClosed,
  BarChart3,
  Scale,
  ArrowRight,
  ShieldCheck,
  Clock,
  KeyRound,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { EstimatesDisclaimer } from './EstimatesDisclaimer';

interface Step3EarningsProps {
  step1Answers: Step1Answers;
  step2Answers: Step2Answers;
  answers: Step3Answers;
  onChange: (updated: Partial<Step3Answers>) => void;
}

export const Step3Earnings: React.FC<Step3EarningsProps> = ({
  step1Answers,
  step2Answers,
  answers,
  onChange
}) => {
  // Timeframe toggle state for data visualization: Annual vs Monthly
  const [timeframe, setTimeframe] = useState<'annual' | 'monthly'>('annual');

  // Collapsible dropdown states for deep-dive analyses to eliminate scrolling
  const [showWaterfall, setShowWaterfall] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showSeasonality, setShowSeasonality] = useState(false);
  const [showTop10, setShowTop10] = useState(false);

  // Find active neighborhood in dataset
  const activeNeighborhoodData =
    DC_NEIGHBORHOODS.find((n) => n.neighborhood === answers.neighborhood) ||
    DC_NEIGHBORHOODS[0];

  // Sync rate when neighborhood or space type changes
  const handleNeighborhoodChange = (newNeighborhood: string) => {
    const data = DC_NEIGHBORHOODS.find((n) => n.neighborhood === newNeighborhood);
    const newRate = getMedianPriceForRentalSpace(data, (answers.spaceType as RentalSpaceType) || 'basement_unit');
    onChange({
      neighborhood: newNeighborhood,
      nightlyRate: Math.round(newRate)
    });
  };

  const handleSpaceTypeChange = (newSpaceType: RentalSpaceType) => {
    const newRate = getMedianPriceForRentalSpace(activeNeighborhoodData, newSpaceType);
    onChange({
      spaceType: newSpaceType,
      nightlyRate: Math.round(newRate)
    });
  };

  const handleResetToMedian = () => {
    const spaceType = (answers.spaceType as RentalSpaceType) || 'basement_unit';
    const medianRate = getMedianPriceForRentalSpace(activeNeighborhoodData, spaceType);
    onChange({
      nightlyRate: Math.round(medianRate)
    });
  };

  // --- CORE FINANCIAL CALCULATIONS ---
  const isAway = answers.hostingMode === 'away';
  const rawBookedNights = Math.round(365 * (answers.occupancyPercent / 100));
  // In away mode, DC law strictly caps unhosted vacation rentals at 90 nights
  const bookedNights = isAway ? Math.min(rawBookedNights, 90) : rawBookedNights;
  const numStays = Math.max(1, Math.ceil(bookedNights / answers.avgStayLength));

  // Revenue & Expenses
  const yearlyGrossRevenue = bookedNights * answers.nightlyRate;
  const airbnbFee = Math.round(yearlyGrossRevenue * 0.03); // 3% host fee
  const yearlyCleaning = numStays * answers.cleaningCostPerStay;
  const yearlyUtilities = answers.monthlyUtilitiesSupplies * 12;
  const yearlyInsurance = answers.annualInsurance;
  const yearlyLicense = 50; // $50/year ($99 for 2-year DC DLCP license amortized)

  const totalExpenses =
    airbnbFee + yearlyCleaning + yearlyUtilities + yearlyInsurance + yearlyLicense;
  const netIncome = Math.max(0, yearlyGrossRevenue - totalExpenses);

  // Mortgage & Coverage
  const annualMortgage = answers.monthlyMortgage * 12;
  const mortgageCoveragePercent =
    annualMortgage > 0 ? Math.round((netIncome / annualMortgage) * 100) : 0;

  // Comparison: Long-Term Rental Net
  const longTermAnnualIncome = answers.monthlyLongTermRent * 12;
  const ltrMortgageCoveragePercent =
    annualMortgage > 0 ? Math.round((longTermAnnualIncome / annualMortgage) * 100) : 0;
  const netDifferenceVsLongTerm = netIncome - longTermAnnualIncome;

  // Timeframe-adjusted values for simple visualization
  const isAnnual = timeframe === 'annual';
  const multiplier = isAnnual ? 1 : 1 / 12;
  const displayStrGross = Math.round(yearlyGrossRevenue * multiplier);
  const displayStrExpenses = Math.round(totalExpenses * multiplier);
  const displayStrNet = Math.round(netIncome * multiplier);
  const displayLtrIncome = Math.round(longTermAnnualIncome * multiplier);
  const displayDelta = displayStrNet - displayLtrIncome;
  const displayDeltaAbs = Math.abs(displayDelta);
  const displayDeltaPct =
    displayLtrIncome > 0 ? Math.round((displayDeltaAbs / displayLtrIncome) * 100) : 0;

  // Typical DC Long-Term Market Rent benchmark for the selected space type
  const typicalDcLongTermRent =
    answers.spaceType === 'private_room'
      ? 1250
      : answers.spaceType === 'basement_unit'
      ? 2200
      : 3600;

  const currentMedianRate = Math.round(
    getMedianPriceForRentalSpace(activeNeighborhoodData, (answers.spaceType as RentalSpaceType) || 'basement_unit')
  );

  // --- SEASONALITY DATA (DC Index) ---
  const SEASONALITY_WEIGHTS = [
    { month: 'Jan', weight: 0.65, label: 'Winter Low' },
    { month: 'Feb', weight: 0.70, label: 'Winter Low' },
    { month: 'Mar', weight: 1.10, label: 'Spring Festival' },
    { month: 'Apr', weight: 1.45, label: 'Cherry Blossom Peak' },
    { month: 'May', weight: 1.35, label: 'Graduations Peak' },
    { month: 'Jun', weight: 1.25, label: 'Summer Tourism' },
    { month: 'Jul', weight: 1.20, label: 'July 4th Tourism' },
    { month: 'Aug', weight: 1.10, label: 'Congressional Recess' },
    { month: 'Sep', weight: 1.15, label: 'Fall Inbound' },
    { month: 'Oct', weight: 1.20, label: 'Conferences Peak' },
    { month: 'Nov', weight: 0.95, label: 'Fall Taper' },
    { month: 'Dec', weight: 0.85, label: 'Holiday Travel' }
  ];

  const totalWeight = SEASONALITY_WEIGHTS.reduce((sum, item) => sum + item.weight, 0);
  const monthlySeasonality = SEASONALITY_WEIGHTS.map((item) => {
    const monthlyNet = Math.round((netIncome * item.weight) / totalWeight);
    return {
      ...item,
      amount: monthlyNet
    };
  });

  const maxMonthlyAmount = Math.max(...monthlySeasonality.map((m) => m.amount), 1000);

  return (
    <div className="space-y-10 pb-12">
      {/* Step Introduction */}
      <div className="border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1.5">
          <span>Step 3 of 5</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500 font-medium">District Market Data & Cashflow</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B2A] tracking-tight">
          Earnings & Revenue Projection
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Calculate your net income from gross booking revenue down to take-home cashflow, complete with DC expense benchmarks, mortgage coverage, and direct comparisons against long-term tenant leasing.
        </p>
      </div>

      {/* BIG HEADLINE RESULT: "Hosting could cover X% of your mortgage." */}
      <div className="bg-[#0D1B2A] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              Mortgage Relief Metric
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {answers.nightlyRate > 0 ? (
                <>Hosting could cover <span className="text-rose-400 tabular-nums">{mortgageCoveragePercent}%</span> of your mortgage.</>
              ) : (
                <>Project your <span className="text-rose-400">mortgage relief</span> & DC cashflow.</>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {answers.nightlyRate > 0
                ? `Based on $${answers.monthlyMortgage.toLocaleString()}/mo ($${annualMortgage.toLocaleString()}/yr) in housing costs and a projected annual net profit of $${netIncome.toLocaleString()} after all DC platform fees, cleaning, and supplies.`
                : `Select your Washington, DC neighborhood, space type, and nightly rate below to calculate personalized net revenue and mortgage offset.`
              }
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 text-right shrink-0">
            <span className="text-[11px] font-semibold text-slate-300 block uppercase tracking-wider">
              Net Annual Income
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums mt-0.5">
              ${netIncome.toLocaleString()}
            </div>
            <span className="text-xs text-slate-300 block mt-1">
              ~${Math.round(netIncome / 12).toLocaleString()}/month net
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: PRIMARY INPUTS */}
      <div className="bg-white rounded-2xl border-2 border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-6">
        <h2 className="text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2">
          <Layers className="w-5 h-5 text-rose-500" />
          <span>Space Type & DC Neighborhood</span>
        </h2>

        {/* 1. Neighborhood Select */}
        <div>
          <label
            htmlFor="neighborhood-dropdown"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between"
          >
            <span>Washington, DC Neighborhood</span>
            <span className="text-slate-400 font-normal">Data from {activeNeighborhoodData.listings} listings</span>
          </label>
          <div className="relative">
            <select
              id="neighborhood-dropdown"
              value={answers.neighborhood || ''}
              onChange={(e) => handleNeighborhoodChange(e.target.value)}
              className="w-full h-12 px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-slate-900 font-semibold text-sm sm:text-base focus:bg-white focus:border-rose-500 focus:outline-none transition-colors cursor-pointer appearance-none"
            >
              <option value="">Select</option>
              {DC_NEIGHBORHOODS.map((n) => (
                <option key={n.neighborhood} value={n.neighborhood}>
                  {n.neighborhood} ({n.listings} active listings · Med. ${Math.round(n.medianNightlyPrice)}/night)
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-600">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 2. Space Type & Hosting Mode Drop-downs (Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Space Type Drop-down */}
          <div>
            <label htmlFor="space-type-select" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Rental Space Type
            </label>
            <div className="relative">
              <select
                id="space-type-select"
                value={answers.spaceType || ''}
                onChange={(e) => handleSpaceTypeChange(e.target.value as RentalSpaceType)}
                className="w-full h-11 pl-4 pr-10 rounded-xl bg-slate-50 border-2 border-slate-300 text-slate-900 font-semibold text-xs sm:text-sm focus:bg-white focus:border-rose-500 focus:outline-none transition-colors cursor-pointer appearance-none"
              >
                <option value="">Select</option>
                <option value="basement_unit">Basement Unit / In-Law Suite (English basement or self-contained unit)</option>
                <option value="private_room">Private Room / Master Suite (Single bedroom inside home)</option>
                <option value="whole_home">Whole Home (Entire rowhouse, condo, or house)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Hosting Mode Drop-down */}
          <div>
            <label htmlFor="hosting-mode-select" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
              <span>Hosting Mode</span>
              <span className="text-[10px] text-rose-600 font-semibold">
                {answers.hostingMode === 'hosted' ? 'Unlimited Nights' : answers.hostingMode === 'away' ? '90 Nights Capped' : ''}
              </span>
            </label>
            <div className="relative">
              <select
                id="hosting-mode-select"
                value={answers.hostingMode || ''}
                onChange={(e) => onChange({ hostingMode: e.target.value as HostingMode })}
                className="w-full h-11 pl-4 pr-10 rounded-xl bg-slate-50 border-2 border-slate-300 text-slate-900 font-semibold text-xs sm:text-sm focus:bg-white focus:border-rose-500 focus:outline-none transition-colors cursor-pointer appearance-none"
              >
                <option value="">Select</option>
                <option value="hosted">Hosted Stays (Host Present · Unlimited Nights under DC Law)</option>
                <option value="away">Away / Vacation Stays (Host Traveling · 90-Night DC Statutory Cap)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Away Mode Notice Required if away selected */}
        {answers.hostingMode === 'away' && (
          <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5 animate-fade-in">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>DC Vacation Rental Cap Notice:</strong> Under DC Law 22-559, unhosted stays where the owner is away are capped at <strong>90 nights per calendar year</strong>. Your booked nights slider is automatically capped at 90.
            </div>
          </div>
        )}

        {/* Dynamic Median Price Callout */}
        <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              {answers.neighborhood ? (
                <>
                  <div className="text-xs sm:text-sm font-bold text-[#0D1B2A]">
                    Typical in {activeNeighborhoodData.neighborhood}:
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-rose-600 mt-0.5">
                    ${currentMedianRate}/night
                    <span className="text-xs font-semibold text-slate-600 ml-1.5">
                      (based on {activeNeighborhoodData.listings} active listings)
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs sm:text-sm font-bold text-[#0D1B2A]">
                    DC Neighborhood Market Baseline
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Select a neighborhood from the dropdown above to view municipal rates and listings.
                  </div>
                </>
              )}
            </div>
          </div>

          {answers.neighborhood && answers.nightlyRate !== currentMedianRate && (
            <button
              type="button"
              onClick={handleResetToMedian}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800 bg-white px-3 py-1.5 rounded-lg border border-rose-200 shadow-2xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to ${currentMedianRate}/night
            </button>
          )}
        </div>
      </div>

      {/* SECTION 2: SLIDERS & EXPENSE INPUTS */}
      <div className="bg-white rounded-2xl border-2 border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-7">
        <h2 className="text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-rose-500" />
          <span>Operational Sliders & Financial Inputs</span>
        </h2>

        {/* 2-Column Grid for Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slider 1: Nightly Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="nightly-rate-slider" className="text-xs font-bold text-[#0D1B2A] uppercase">
                Nightly Rate
              </label>
              <div className="flex items-center gap-1 text-sm font-black text-[#0D1B2A] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                <span>$</span>
                <input
                  type="number"
                  min="50"
                  max="1500"
                  value={answers.nightlyRate}
                  onChange={(e) => onChange({ nightlyRate: Math.max(20, parseInt(e.target.value) || 20) })}
                  className="w-16 font-black bg-transparent focus:outline-none text-right"
                />
                <span className="text-[10px] text-slate-500">/night</span>
              </div>
            </div>
            <input
              id="nightly-rate-slider"
              type="range"
              min="50"
              max="1000"
              step="5"
              value={answers.nightlyRate}
              onChange={(e) => onChange({ nightlyRate: parseInt(e.target.value, 10) })}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>$50</span>
              <span>CSV Median: ${currentMedianRate}</span>
              <span>$1,000+</span>
            </div>
          </div>

          {/* Slider 2: Occupancy Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="occupancy-slider" className="text-xs font-bold text-[#0D1B2A] uppercase">
                Occupancy Rate
              </label>
              <div className="text-sm font-black text-[#0D1B2A] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {answers.occupancyPercent}% ({bookedNights} booked nights/yr)
              </div>
            </div>
            <input
              id="occupancy-slider"
              type="range"
              min="10"
              max="95"
              step="5"
              value={answers.occupancyPercent}
              onChange={(e) => onChange({ occupancyPercent: parseInt(e.target.value, 10) })}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>10%</span>
              <span className="font-semibold text-rose-600">Default: 60%</span>
              <span>95%</span>
            </div>
          </div>

          {/* Slider 3: Average Stay Length */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="stay-length-slider" className="text-xs font-bold text-[#0D1B2A] uppercase">
                Average Stay Length
              </label>
              <div className="text-sm font-black text-[#0D1B2A] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {answers.avgStayLength} nights ({numStays} turnovers/yr)
              </div>
            </div>
            <input
              id="stay-length-slider"
              type="range"
              min="1"
              max="14"
              step="1"
              value={answers.avgStayLength}
              onChange={(e) => onChange({ avgStayLength: Math.max(1, parseInt(e.target.value, 10)) })}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>1 night</span>
              <span className="font-semibold text-rose-600">Default: 3 nights</span>
              <span>14 nights</span>
            </div>
          </div>

          {/* Slider 4: Cleaning Cost per Stay */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="cleaning-cost-slider" className="text-xs font-bold text-[#0D1B2A] uppercase">
                Cleaning Cost per Stay
              </label>
              <div className="text-sm font-black text-[#0D1B2A] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                ${answers.cleaningCostPerStay} (${yearlyCleaning.toLocaleString()}/yr)
              </div>
            </div>
            <input
              id="cleaning-cost-slider"
              type="range"
              min="0"
              max="200"
              step="5"
              value={answers.cleaningCostPerStay}
              onChange={(e) => onChange({ cleaningCostPerStay: parseInt(e.target.value, 10) })}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>$0 (Self-clean)</span>
              <span className="font-semibold text-rose-600">Default: $60</span>
              <span>$200</span>
            </div>
          </div>

          {/* Slider 5: Monthly Utilities & Supplies */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="utilities-slider" className="text-xs font-bold text-[#0D1B2A] uppercase">
                Monthly Utilities & Supplies
              </label>
              <div className="text-sm font-black text-[#0D1B2A] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                ${answers.monthlyUtilitiesSupplies}/mo (${yearlyUtilities.toLocaleString()}/yr)
              </div>
            </div>
            <input
              id="utilities-slider"
              type="range"
              min="0"
              max="400"
              step="10"
              value={answers.monthlyUtilitiesSupplies}
              onChange={(e) => onChange({ monthlyUtilitiesSupplies: parseInt(e.target.value, 10) })}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>$0</span>
              <span className="font-semibold text-rose-600">Default: $150</span>
              <span>$400/mo</span>
            </div>
          </div>

          {/* Slider 6: Annual Extra Insurance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="insurance-slider" className="text-xs font-bold text-[#0D1B2A] uppercase">
                Annual STR Insurance Rider
              </label>
              <div className="text-sm font-black text-[#0D1B2A] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                ${answers.annualInsurance}/yr
              </div>
            </div>
            <input
              id="insurance-slider"
              type="range"
              min="0"
              max="1500"
              step="50"
              value={answers.annualInsurance}
              onChange={(e) => onChange({ annualInsurance: parseInt(e.target.value, 10) })}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>$0 (AirCover only)</span>
              <span className="font-semibold text-rose-600">Default: $600</span>
              <span>$1,500/yr</span>
            </div>
          </div>
        </div>

        {/* COMPARATIVE BENCHMARKS: Mortgage & Long-Term Rent Inputs */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Financial Comparison Baselines (Mortgage & Long-Term Rent)
            </div>
            <span className="text-[11px] font-semibold text-rose-600">
              Key drivers for your Verdict
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input 1: Monthly Mortgage Payment */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label htmlFor="monthly-mortgage-input" className="block text-xs font-bold text-[#0D1B2A] mb-1">
                Your Monthly Mortgage Payment (PITI)
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold">$</span>
                <input
                  id="monthly-mortgage-input"
                  type="number"
                  min="500"
                  max="15000"
                  step="50"
                  value={answers.monthlyMortgage}
                  onChange={(e) => onChange({ monthlyMortgage: Math.max(100, parseInt(e.target.value) || 100) })}
                  className="w-full h-11 pl-8 pr-4 rounded-lg bg-white border border-slate-300 font-bold text-[#0D1B2A] focus:border-rose-500 focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Totaling ${(answers.monthlyMortgage * 12).toLocaleString()}/year in housing costs
              </span>
            </div>

            {/* Input 2: Potential Monthly Long-Term Rent */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="long-term-rent-input" className="block text-xs font-bold text-[#0D1B2A] mb-1">
                    Potential Monthly Long-Term Rent
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">Standard 12-mo lease</span>
                </div>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold">$</span>
                  <input
                    id="long-term-rent-input"
                    type="number"
                    min="500"
                    max="12000"
                    step="50"
                    value={answers.monthlyLongTermRent}
                    onChange={(e) => onChange({ monthlyLongTermRent: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full h-11 pl-8 pr-4 rounded-lg bg-white border border-slate-300 font-bold text-[#0D1B2A] focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick DC Market Presets */}
              <div className="mt-2.5 pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-500 block mb-1">Quick DC Market Baselines:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => onChange({ monthlyLongTermRent: 1250 })}
                    className="text-[10px] font-semibold bg-white hover:bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300 transition-colors"
                  >
                    1BR/Room ($1,250)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ monthlyLongTermRent: 2200 })}
                    className="text-[10px] font-semibold bg-white hover:bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300 transition-colors"
                  >
                    Basement ($2,200)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ monthlyLongTermRent: 3600 })}
                    className="text-[10px] font-semibold bg-white hover:bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300 transition-colors"
                  >
                    Whole House ($3,600)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHART 1: WATERFALL CHART (Collapsible Dropdown Accordion) */}
      <section aria-labelledby="waterfall-title" className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowWaterfall(!showWaterfall)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <h2 id="waterfall-title" className="text-sm sm:text-base font-bold text-[#0D1B2A]">
                1. Cashflow Waterfall & 10.25% DC Tax Breakdown
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Gross booking revenue down to net profit after DC taxes, cleaning, supplies & licensing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 hidden sm:inline-block">
              Profit Margin: {yearlyGrossRevenue > 0 ? Math.round((netIncome / yearlyGrossRevenue) * 100) : 0}%
            </span>
            {showWaterfall ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
        </button>

        {showWaterfall && (
          <div className="p-5 sm:p-7 border-t border-slate-100 space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs font-bold text-[#0D1B2A]">
                  Deductions Cascade (DC Title 47-2001 & Operating Expenses)
                </div>
                <div className="text-xs font-semibold text-emerald-700">
                  Retained Margin: {yearlyGrossRevenue > 0 ? Math.round((netIncome / yearlyGrossRevenue) * 100) : 0}%
                </div>
              </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visual cascade of every deduction including Airbnb platform fees, turnover cleanings, utilities, insurance, and the DC licensing fee.
          </p>

          {/* Explicit Axis Labels Indicator */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <strong>Y-Axis / Amount:</strong> Annual Cashflow ($USD)
            </span>
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <strong>X-Axis / Flow:</strong> Revenue → Platform & Operating Deductions → Net Take-Home
            </span>
          </div>
        </div>

        {/* Visual Waterfall Progression */}
        <div className="space-y-3 pt-2">
          {/* Baseline Step: Gross Revenue */}
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold text-emerald-950">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">+</span>
                <span>Gross Booking Revenue ({bookedNights} nights × ${answers.nightlyRate}/night)</span>
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-700 tabular-nums">
                +${yearlyGrossRevenue.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-3 bg-emerald-200/80 rounded-full mt-2.5 overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full w-full transition-all duration-500" />
            </div>
            <div className="flex justify-between text-[10px] text-emerald-800 font-semibold mt-1">
              <span>Baseline 100% Gross</span>
              <span>${yearlyGrossRevenue.toLocaleString()} Total Collected</span>
            </div>
          </div>

          {/* Deductions Group */}
          <div className="pl-3 sm:pl-4 border-l-2 border-rose-300 space-y-2.5 my-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
              Operating Deductions (-${totalExpenses.toLocaleString()}/yr total)
            </div>

            {/* Deduction A: Airbnb fee */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-xs shrink-0">-</span>
                <span>Airbnb Host Service Fee (3.0% of booking subtotal)</span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  {yearlyGrossRevenue > 0 ? ((airbnbFee / yearlyGrossRevenue) * 100).toFixed(1) : 0}% of gross
                </span>
                <span className="font-extrabold text-rose-600 tabular-nums text-sm">-${airbnbFee.toLocaleString()}</span>
              </div>
            </div>

            {/* Deduction B: Cleaning */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-xs shrink-0">-</span>
                <span>Turnover Cleanings ({numStays} guest turnovers × ${answers.cleaningCostPerStay})</span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  {yearlyGrossRevenue > 0 ? ((yearlyCleaning / yearlyGrossRevenue) * 100).toFixed(1) : 0}% of gross
                </span>
                <span className="font-extrabold text-rose-600 tabular-nums text-sm">-${yearlyCleaning.toLocaleString()}</span>
              </div>
            </div>

            {/* Deduction C: Utilities & Supplies */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-xs shrink-0">-</span>
                <span>Utilities, WiFi & Supplies (${answers.monthlyUtilitiesSupplies}/mo × 12)</span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  {yearlyGrossRevenue > 0 ? ((yearlyUtilities / yearlyGrossRevenue) * 100).toFixed(1) : 0}% of gross
                </span>
                <span className="font-extrabold text-rose-600 tabular-nums text-sm">-${yearlyUtilities.toLocaleString()}</span>
              </div>
            </div>

            {/* Deduction D: Insurance */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-xs shrink-0">-</span>
                <span>Annual Commercial STR Insurance Rider</span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  {yearlyGrossRevenue > 0 ? ((yearlyInsurance / yearlyGrossRevenue) * 100).toFixed(1) : 0}% of gross
                </span>
                <span className="font-extrabold text-rose-600 tabular-nums text-sm">-${yearlyInsurance.toLocaleString()}</span>
              </div>
            </div>

            {/* Deduction E: DC License ($50/year) */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-xs shrink-0">-</span>
                <span>DC DLCP Short-Term Rental License ($99 / 2 yrs amortized)</span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  DC Mandate
                </span>
                <span className="font-extrabold text-rose-600 tabular-nums text-sm">-${yearlyLicense}</span>
              </div>
            </div>
          </div>

          {/* Final Step: Net Take-Home */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0D1B2A] text-white shadow-lg border border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-rose-300 font-bold block">
                  Net Annual Host Profit (Take-Home Cashflow)
                </span>
                <span className="text-xs text-slate-300 mt-0.5 block">
                  After all ${totalExpenses.toLocaleString()} in annual DC platform & operating expenses
                </span>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
                  =${netIncome.toLocaleString()}
                </div>
                <span className="text-xs font-semibold text-slate-300">
                  ~${Math.round(netIncome / 12).toLocaleString()}/month net
                </span>
              </div>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full mt-3 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${yearlyGrossRevenue > 0 ? Math.max(5, Math.round((netIncome / yearlyGrossRevenue) * 100)) : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1.5">
              <span>$0</span>
              <span className="text-emerald-300">{yearlyGrossRevenue > 0 ? Math.round((netIncome / yearlyGrossRevenue) * 100) : 0}% retained profit</span>
              <span>${yearlyGrossRevenue.toLocaleString()} (Gross)</span>
            </div>
          </div>
        </div>
        </div>
        )}
      </section>

      {/* CHART 2: COMPREHENSIVE LONG-TERM RENTAL VS. SHORT-TERM RENTAL (Collapsible Dropdown Accordion) */}
      <section aria-labelledby="comparison-title" className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowComparison(!showComparison)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <div>
              <h2 id="comparison-title" className="text-sm sm:text-base font-bold text-[#0D1B2A]">
                2. Strategy Comparison: Short-Term vs. Long-Term Lease vs. 90-Day Cap
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Compare annual and monthly net profits across 4 DC hosting strategies
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 hidden sm:inline-block">
              {netIncome > answers.monthlyLongTermRent * 12 ? 'STR Leads by +$' + (netIncome - answers.monthlyLongTermRent * 12).toLocaleString() : 'Compare Options'}
            </span>
            {showComparison ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
        </button>

        {showComparison && (
          <div className="p-5 sm:p-7 border-t border-slate-100 space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#0D1B2A]">
                    Model Comparison: Short-Term vs. Long-Term Lease
                  </div>
                  <p className="text-xs text-slate-500">
                    Visualizing how short-term Airbnb hosting compares against a conventional 12-month tenant lease.
                  </p>
                </div>

            {/* Interactive Timeframe Toggle: Annual vs Monthly */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setTimeframe('annual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isAnnual
                    ? 'bg-[#0D1B2A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual ($/Year)
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isAnnual
                    ? 'bg-[#0D1B2A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly ($/Month)
              </button>
            </div>
          </div>

          {/* Explicit Axis Labels Indicator */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <strong>Y-Axis / Scale:</strong> Estimated Cashflow ({isAnnual ? '$USD / Year' : '$USD / Month'})
            </span>
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <strong>X-Axis / Strategies:</strong> Short-Term Rental · Long-Term Tenant · Keep Empty (Hold)
            </span>
          </div>
        </div>

        {/* DYNAMIC EARNINGS CONTEXT CALLOUT (DELTA METER) */}
        <div className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          displayDelta > 0
            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
            : displayDelta < 0
            ? 'bg-amber-50/70 border-amber-300 text-amber-950'
            : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              displayDelta > 0
                ? 'bg-emerald-600 text-white'
                : displayDelta < 0
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-white'
            }`}>
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold flex items-center gap-2">
                {displayDelta > 0 ? (
                  <span>Short-Term Hosting earns +${displayDeltaAbs.toLocaleString()}{isAnnual ? '/year' : '/month'} (+{displayDeltaPct}%) more</span>
                ) : displayDelta < 0 ? (
                  <span>Long-Term Tenant generates +${displayDeltaAbs.toLocaleString()}{isAnnual ? '/year' : '/month'} (+{displayDeltaPct}%) more</span>
                ) : (
                  <span>Both strategies project identical income (${displayStrNet.toLocaleString()}{isAnnual ? '/yr' : '/mo'})</span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {displayDelta > 0
                  ? `You earn a ${displayDeltaPct}% cashflow premium and keep personal use of the space when not hosting, in exchange for turnover cleaning and active guest care.`
                  : displayDelta < 0
                  ? `A 12-month standard lease delivers more net cashflow with zero turnover effort, but under DC law (TOPA), you surrender 100% of personal access to the space.`
                  : `Revenue is equal. Choose based on whether personal flexibility (STR) or zero-effort management (LTR) matters more.`}
              </p>
            </div>
          </div>

          <div className="self-end sm:self-auto shrink-0 text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Net Advantage
            </span>
            <span className={`text-base font-black ${displayDelta > 0 ? 'text-emerald-700' : displayDelta < 0 ? 'text-amber-700' : 'text-slate-700'}`}>
              {displayDelta > 0 ? `+` : displayDelta < 0 ? `-` : ``}${displayDeltaAbs.toLocaleString()}{isAnnual ? '/yr' : '/mo'}
            </span>
          </div>
        </div>

        {/* COMPARATIVE VERTICAL BAR CHART VISUALIZER */}
        {(() => {
          const maxComparisonVal = Math.max(displayStrGross, displayLtrIncome, 1000);
          const strGrossPct = Math.max(8, Math.round((displayStrGross / maxComparisonVal) * 100));
          const strNetPct = Math.max(8, Math.round((displayStrNet / maxComparisonVal) * 100));
          const longTermPct = Math.max(8, Math.round((displayLtrIncome / maxComparisonVal) * 100));

          return (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold text-slate-700 gap-1 pb-1">
                <span className="text-slate-600 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-rose-500" />
                  Comparative Revenue & Net Earnings ({isAnnual ? 'Annual Totals' : 'Monthly Averages'})
                </span>
                <span className="text-slate-400 text-[11px] font-mono">
                  Scale Ceiling: ${maxComparisonVal.toLocaleString()}
                </span>
              </div>

              {/* Chart Plot Area with Y-axis guidelines */}
              <div className="relative pt-6 pb-2">
                {/* Horizontal Dashed Guidelines */}
                <div className="absolute inset-x-0 top-6 border-b border-dashed border-slate-300 pointer-events-none flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>${maxComparisonVal.toLocaleString()}</span>
                  <span>100%</span>
                </div>
                <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-200 pointer-events-none flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>${Math.round(maxComparisonVal / 2).toLocaleString()}</span>
                  <span>50%</span>
                </div>
                <div className="absolute inset-x-0 bottom-8 border-b border-slate-300 pointer-events-none flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>$0</span>
                  <span>0%</span>
                </div>

                {/* Vertical Proportional Columns */}
                <div className="grid grid-cols-3 gap-3 sm:gap-8 items-end h-56 sm:h-64 px-2 sm:px-8 z-10 relative">
                  {/* Column 1: Short-Term Rental (Dual representation: Gross vs Net) */}
                  <div className="flex flex-col items-center h-full justify-end group">
                    <div className="text-center mb-1.5">
                      <span className="text-[11px] text-slate-500 block">Gross: ${displayStrGross.toLocaleString()}</span>
                      <span className="text-xs sm:text-base font-black text-rose-600 tabular-nums block">
                        Net: ${displayStrNet.toLocaleString()}
                      </span>
                    </div>

                    {/* Proportional Pillar with Net Fill */}
                    <div
                      className="w-full max-w-[72px] rounded-t-xl bg-rose-100 border-2 border-rose-300 overflow-hidden flex flex-col justify-end shadow-sm group-hover:border-rose-500 transition-all duration-300"
                      style={{ height: `${strGrossPct}%` }}
                    >
                      {/* Net take-home portion inside pillar */}
                      <div
                        className="w-full bg-gradient-to-t from-rose-600 via-rose-500 to-rose-400 rounded-t-lg transition-all duration-500 flex items-center justify-center"
                        style={{ height: `${Math.round((displayStrNet / (displayStrGross || 1)) * 100)}%` }}
                      >
                        <span className="text-[10px] text-white font-extrabold opacity-0 group-hover:opacity-100 transition-opacity">
                          Net
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-center">
                      <span className="block text-xs sm:text-sm font-extrabold text-[#0D1B2A]">Short-Term (STR)</span>
                      <span className="text-[10px] text-rose-600 font-bold block sm:inline">Airbnb · Flexible</span>
                    </div>
                  </div>

                  {/* Column 2: Long-Term Rental */}
                  <div className="flex flex-col items-center h-full justify-end group">
                    <div className="text-center mb-1.5">
                      <span className="text-[11px] text-slate-400 block">Fixed Rent</span>
                      <span className="text-xs sm:text-base font-black text-slate-700 tabular-nums block">
                        ${displayLtrIncome.toLocaleString()}
                      </span>
                    </div>

                    <div
                      className="w-full max-w-[72px] rounded-t-xl bg-gradient-to-t from-slate-700 via-slate-600 to-slate-500 shadow-sm transition-all duration-500 group-hover:scale-105"
                      style={{ height: `${longTermPct}%` }}
                    />

                    <div className="mt-3 text-center">
                      <span className="block text-xs sm:text-sm font-extrabold text-[#0D1B2A]">Long-Term (LTR)</span>
                      <span className="text-[10px] text-slate-500 font-semibold block sm:inline">12-Mo Lease</span>
                    </div>
                  </div>

                  {/* Column 3: Doing Nothing */}
                  <div className="flex flex-col items-center h-full justify-end group">
                    <div className="text-center mb-1.5">
                      <span className="text-[11px] text-slate-400 block">Unrented</span>
                      <span className="text-xs sm:text-base font-black text-slate-400 tabular-nums block">
                        $0
                      </span>
                    </div>

                    <div
                      className="w-full max-w-[72px] rounded-t-xl bg-slate-300 transition-all duration-500"
                      style={{ height: '4px' }}
                    />

                    <div className="mt-3 text-center">
                      <span className="block text-xs sm:text-sm font-extrabold text-[#0D1B2A]">Doing Nothing</span>
                      <span className="text-[10px] text-slate-400 font-semibold block sm:inline">Hold / Empty</span>
                    </div>
                  </div>
                </div>

                {/* X-Axis Caption Label */}
                <div className="pt-2 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  X-Axis: Monetization Strategies
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-rose-500 shrink-0"></span>
                  <span>STR Net Cashflow</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-rose-200 border border-rose-300 shrink-0"></span>
                  <span>STR Platform & Cleaning Costs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-slate-700 shrink-0"></span>
                  <span>Long-Term Guaranteed Rent</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 3 Detailed Comparative Strategy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Card A: Airbnb Net Income */}
          <div className="p-5 rounded-2xl border-2 border-rose-400 bg-rose-50/40 shadow-sm relative flex flex-col justify-between">
            <div className="absolute -top-3 right-4 bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
              Flexible Use
            </div>
            <div>
              <span className="text-xs font-bold text-[#0D1B2A] uppercase tracking-wider block">
                Option A: Short-Term Rental
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#0D1B2A] tabular-nums mt-1">
                ${displayStrNet.toLocaleString()}
                <span className="text-xs font-normal text-slate-500 ml-1">
                  {isAnnual ? '/year' : '/month'}
                </span>
              </div>
              <span className="text-xs font-semibold text-rose-600 block mt-0.5">
                Gross: ${displayStrGross.toLocaleString()} {isAnnual ? '/yr' : '/mo'}
              </span>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                Retain personal use of your home when not hosting. Covers <strong>{mortgageCoveragePercent}%</strong> of your mortgage.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-rose-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span>Personal Use:</span>
                <span className="font-bold text-emerald-700">100% when unbooked</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>DC Law:</span>
                <span className="font-semibold text-slate-900">{isAway ? '90-night vacation cap' : 'Unlimited nights (hosted)'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Effort:</span>
                <span className="font-semibold text-slate-900">Active turnovers</span>
              </div>
            </div>
          </div>

          {/* Card B: Long-Term Rental */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Option B: Long-Term Tenant
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                Passive
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-slate-800 tabular-nums">
                ${displayLtrIncome.toLocaleString()}
                <span className="text-xs font-normal text-slate-500 ml-1">
                  {isAnnual ? '/year' : '/month'}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                ${answers.monthlyLongTermRent.toLocaleString()}/mo guaranteed
              </span>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                Zero guest turnover effort. Covers <strong>{ltrMortgageCoveragePercent}%</strong> of your mortgage, but you completely surrender home access.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span>Personal Use:</span>
                <span className="font-bold text-rose-700">0 days (Exclusive lease)</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>DC Law:</span>
                <span className="font-semibold text-slate-900">DC TOPA & Rent Control</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Effort:</span>
                <span className="font-semibold text-slate-900">Passive (1 lease/yr)</span>
              </div>
            </div>
          </div>

          {/* Card C: Doing Nothing */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Option C: Keep Empty / Hold
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-400 tabular-nums mt-1">
                $0
                <span className="text-xs font-normal text-slate-400 ml-1">
                  {isAnnual ? '/year' : '/month'}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                $0 income
              </span>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                Maximum privacy, zero neighbor interactions, and zero licensing requirements. You pay 100% of mortgage costs out-of-pocket.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-rose-600 font-semibold">
              Full out-of-pocket mortgage: ${(answers.monthlyMortgage * (isAnnual ? 12 : 1)).toLocaleString()}{isAnnual ? '/yr' : '/mo'}
            </div>
          </div>
        </div>
        </div>
        )}
      </section>

      {/* CHART 3: DC SEASONALITY (Collapsible Dropdown Accordion) */}
      <section aria-labelledby="seasonality-title" className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSeasonality(!showSeasonality)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <div>
              <h2 id="seasonality-title" className="text-sm sm:text-base font-bold text-[#0D1B2A]">
                3. Washington, DC Seasonality Projection (Monthly Net Income)
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Monthly revenue swings from Cherry Blossom peak (April) to winter trough (Jan/Feb)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 hidden sm:inline-block">
              Peak: April (~${maxMonthlyAmount.toLocaleString()}/mo)
            </span>
            {showSeasonality ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
        </button>

        {showSeasonality && (
          <div className="p-5 sm:p-7 border-t border-slate-100 space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="text-xs font-bold text-[#0D1B2A]">
                  DC Monthly Seasonality Projection
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  DC tourism surges in <strong>April (Cherry Blossoms)</strong> and <strong>May (University Graduations)</strong>; dips in January & February.
                </p>

            {/* Explicit Axis Labels Indicator */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <strong>Y-Axis / Amount:</strong> Estimated Net Monthly Income ($USD / Month)
              </span>
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <strong>X-Axis / Timeline:</strong> Month of the Year (Jan – Dec)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 self-start sm:self-auto shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Peak Month: April (~${monthlySeasonality[3]?.amount.toLocaleString()})</span>
          </div>
        </div>

        {/* Responsive Seasonality Bar & Guide Graph */}
        <div className="space-y-4 pt-2">
          <div className="relative bg-slate-50/80 rounded-2xl border border-slate-200/80 p-3 sm:p-5">
            {/* Y-Axis Guideline Ticks */}
            <div className="absolute inset-x-3 sm:inset-x-5 top-5 border-b border-dashed border-slate-200 pointer-events-none flex justify-between text-[10px] text-slate-400 font-mono">
              <span>${maxMonthlyAmount.toLocaleString()}</span>
              <span className="text-[9px] uppercase tracking-wider text-rose-500 font-bold">Peak (145%)</span>
            </div>
            <div className="absolute inset-x-3 sm:inset-x-5 top-1/2 border-b border-dashed border-slate-200 pointer-events-none flex justify-between text-[10px] text-slate-400 font-mono">
              <span>${Math.round(maxMonthlyAmount / 2).toLocaleString()}</span>
              <span className="text-[9px] text-slate-400 font-medium">Mid</span>
            </div>
            <div className="absolute inset-x-3 sm:inset-x-5 bottom-12 border-b border-slate-300 pointer-events-none flex justify-between text-[10px] text-slate-400 font-mono">
              <span>$0</span>
              <span className="text-[9px] text-slate-400 font-medium">Base</span>
            </div>

            {/* 12 Months Columns */}
            <div className="grid grid-cols-12 gap-1 sm:gap-2 items-end h-48 sm:h-56 pt-6 pb-2 relative z-10">
              {monthlySeasonality.map((item) => {
                const heightPercent = Math.max(12, Math.round((item.amount / maxMonthlyAmount) * 100));
                const isPeak = item.month === 'Apr' || item.month === 'May';

                return (
                  <div key={item.month} className="flex flex-col items-center h-full justify-end group relative">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 pointer-events-none z-30 bg-[#0D1B2A] text-white text-[10px] font-bold py-1 px-2 rounded-md whitespace-nowrap shadow-lg">
                      ${item.amount.toLocaleString()} ({item.label})
                    </div>

                    <div
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                        isPeak
                          ? 'bg-gradient-to-t from-rose-500 to-rose-400 ring-2 ring-rose-300 shadow-sm'
                          : item.month === 'Jan' || item.month === 'Feb'
                          ? 'bg-slate-300'
                          : 'bg-[#1B2A4A] group-hover:bg-rose-400'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />

                    <span
                      className={`text-[10px] sm:text-xs font-bold mt-2.5 ${
                        isPeak ? 'text-rose-600 font-black' : 'text-slate-600'
                      }`}
                    >
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-center text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider pt-2 border-t border-slate-200 mt-2">
              X-Axis: Month of the Year (Jan – Dec)
            </div>
          </div>

          {/* Seasonality Legend Callouts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
              <div>
                <strong className="text-rose-950">April Peak (Cherry Blossoms):</strong> Over 1.5 million visitors flock to the National Mall; nightly rates can be priced 40%+ higher.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
              <div>
                <strong className="text-rose-950">May Peak (Commencements):</strong> Georgetown, GW, Howard, and AU graduations create peak family booking demand across all wards.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400 mt-1 shrink-0" />
              <div>
                <strong className="text-slate-800">Jan/Feb Winter Trough:</strong> Congressional recess and cold weather reduce leisure travelers; low rates incentivize mid-term leases.
              </div>
            </div>
          </div>
        </div>
        </div>
        )}
      </section>

      {/* CHART 4: DC MARKET BENCHMARKS (Collapsible Dropdown Accordion) */}
      <section aria-labelledby="top10-title" className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTop10(!showTop10)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D1B2A] shrink-0" />
            <div>
              <h2 id="top10-title" className="text-sm sm:text-base font-bold text-[#0D1B2A]">
                4. DC Market Benchmark: Median Nightly Price Across Top 10 Neighborhoods
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Compare typical nightly rates across the 10 DC areas with highest listing inventory
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 hidden sm:inline-block">
              10 DC Neighborhoods
            </span>
            {showTop10 ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </div>
        </button>

        {showTop10 && (
          <div className="p-5 sm:p-7 border-t border-slate-100 space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs font-bold text-[#0D1B2A]">
                  Top 10 DC Neighborhoods by Active Listings
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  From DC Airbnb Dataset
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Compare typical nightly prices across Washington, DC's 10 neighborhoods with the highest active listing supply.
              </p>

          {/* Explicit Axis Labels Indicator */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <strong>Y-Axis / Category:</strong> DC Neighborhoods (Ranked by Listing Count)
            </span>
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <strong>X-Axis / Metric:</strong> Median Nightly Rate ($USD / Night)
            </span>
          </div>
        </div>

        {/* Horizontal Comparative Bar Chart */}
        <div className="space-y-3 pt-2">
          {TOP_10_NEIGHBORHOODS_BY_LISTINGS.map((item, idx) => {
            const isUserNeighborhood = item.neighborhood === answers.neighborhood;
            const maxRate = 600; // Reference ceiling for top 10 medians
            const widthPct = Math.min(100, Math.round((item.medianNightlyPrice / maxRate) * 100));

            return (
              <div
                key={item.neighborhood}
                onClick={() => handleNeighborhoodChange(item.neighborhood)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isUserNeighborhood
                    ? 'bg-rose-50/60 border-rose-400 shadow-xs ring-2 ring-rose-200'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-1.5">
                  <div className="flex items-center gap-2 font-bold text-[#0D1B2A]">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-black shrink-0">
                      {idx + 1}
                    </span>
                    <span className="truncate max-w-[280px] sm:max-w-none">{item.neighborhood}</span>
                    {isUserNeighborhood && (
                      <span className="text-[10px] font-extrabold uppercase bg-rose-600 text-white px-2 py-0.5 rounded-full">
                        Your Selection
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto text-slate-500 font-semibold text-[11px]">
                    <span>{item.listings} listings</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-extrabold text-[#0D1B2A] text-xs">${Math.round(item.medianNightlyPrice)}/night</span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUserNeighborhood
                        ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                        : 'bg-[#1B2A4A]'
                    }`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}

          <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-2 pt-1 border-t border-slate-200">
            <span>$0/night</span>
            <span>$150/night</span>
            <span>$300/night</span>
            <span>$450/night</span>
            <span>$600/night (Scale Ceiling)</span>
          </div>
        </div>
      </div>
      )}
    </section>

    {/* Estimates Disclaimer */}
    <EstimatesDisclaimer variant="subtle" />
  </div>
);
};
