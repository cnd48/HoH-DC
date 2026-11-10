import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { StepId } from '../types';

interface NavigationButtonsProps {
  currentStep: StepId;
  isStep1Complete: boolean;
  isStep2Complete: boolean;
  isStep3Complete?: boolean;
  isStep4Complete?: boolean;
  onBack: () => void;
  onNext: () => void;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  isStep1Complete,
  isStep2Complete,
  isStep3Complete = true,
  isStep4Complete = true,
  onBack,
  onNext
}) => {
  const canGoBack = currentStep !== 'welcome';
  const canGoNext =
    currentStep === 'home'
      ? isStep1Complete
      : currentStep === 'eligibility'
      ? isStep2Complete
      : currentStep === 'earnings'
      ? isStep3Complete
      : currentStep === 'time'
      ? isStep4Complete
      : true;

  const getNextLabel = () => {
    switch (currentStep) {
      case 'home':
        return 'Next: Eligibility';
      case 'eligibility':
        return 'Next: Earnings';
      case 'earnings':
        return 'Next: Your Time';
      case 'time':
        return 'Next: Calculate Verdict';
      case 'verdict':
        return 'Print / Save Action Plan';
      default:
        return 'Continue';
    }
  };

  return (
    <div className="fixed sm:static bottom-0 left-0 right-0 z-30 bg-white/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t sm:border-t-0 border-slate-200 p-4 sm:p-0 shadow-lg sm:shadow-none print:hidden">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className={`min-h-[48px] px-5 sm:px-6 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
            canGoBack
              ? 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] cursor-pointer shadow-sm'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
          }`}
          aria-label="Previous step"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Status indicator on desktop */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium">
          {currentStep === 'home' && !isStep1Complete && (
            <span className="text-amber-600 font-medium">
              Please answer both questions to continue
            </span>
          )}
          {currentStep === 'home' && isStep1Complete && (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Step 1 answers saved! Click Next to check eligibility.
            </span>
          )}
          {currentStep === 'eligibility' && !isStep2Complete && (
            <span className="text-amber-600 font-medium">
              Complete eligibility and living space questions above to proceed
            </span>
          )}
          {currentStep === 'eligibility' && isStep2Complete && (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Eligibility evaluated! Click Next to explore DC earnings.
            </span>
          )}
          {currentStep === 'earnings' && (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Earnings projected! Click Next to assess time commitment.
            </span>
          )}
          {currentStep === 'time' && (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Time commitment & risk profile evaluated! Click Next to view Verdict.
            </span>
          )}
          {currentStep === 'verdict' && (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Assessment complete! Review your tailored verdict & checklist below.
            </span>
          )}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className={`min-h-[48px] px-6 sm:px-8 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
            canGoNext
              ? 'bg-[#0D1B2A] text-white hover:bg-[#1B2A4A] active:scale-[0.98] cursor-pointer shadow-md hover:shadow-lg ring-2 ring-rose-400/40 hover:ring-rose-400'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
          aria-label="Next step"
        >
          <span>{getNextLabel()}</span>
          <ArrowRight className="w-4 h-4 text-rose-300" />
        </button>
      </div>
    </div>
  );
};
