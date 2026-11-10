import React from 'react';
import { ASSESSMENT_STEPS, StepId } from '../types';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: StepId;
  onStepSelect?: (step: StepId) => void;
  isStep1Complete: boolean;
  isStep2Complete: boolean;
  isStep3Complete?: boolean;
  isStep4Complete?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  onStepSelect,
  isStep1Complete,
  isStep2Complete,
  isStep3Complete = true,
  isStep4Complete = true
}) => {
  if (currentStep === 'welcome' || currentStep === 'processing') {
    return null;
  }

  const currentIndex = Math.max(0, ASSESSMENT_STEPS.findIndex((s) => s.id === currentStep));
  // Calculate progress based on steps completed
  let progressPercent = 10;
  if (currentStep === 'home') {
    progressPercent = isStep1Complete ? 20 : 10;
  } else if (currentStep === 'eligibility') {
    progressPercent = isStep2Complete ? 40 : 25;
  } else if (currentStep === 'earnings') {
    progressPercent = isStep3Complete ? 60 : 45;
  } else if (currentStep === 'time') {
    progressPercent = isStep4Complete ? 80 : 65;
  } else {
    progressPercent = 100;
  }

  return (
    <div className="w-full bg-white border-b border-slate-200/80 py-4 px-4 sm:px-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-4xl mx-auto">
        {/* Mobile View: Compact bar + Step text */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-[#0D1B2A] flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0D1B2A] text-white text-[11px] font-bold">
                {currentIndex + 1}
              </span>
              <span>{ASSESSMENT_STEPS[currentIndex]?.title}</span>
            </span>
            <span className="text-slate-500 font-medium tabular-nums">
              Step {currentIndex + 1} of 5 ({progressPercent}%)
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 px-1">
            {ASSESSMENT_STEPS.map((step, idx) => {
              const isPast = idx < currentIndex || (idx === 0 && isStep1Complete && currentStep !== 'home');
              const isCur = step.id === currentStep;
              return (
                <button
                  key={step.id}
                  onClick={() => onStepSelect && onStepSelect(step.id)}
                  disabled={idx > 1 && !isStep1Complete}
                  className={`text-[10px] font-medium transition-colors ${
                    isCur
                      ? 'text-rose-600 font-bold'
                      : isPast
                      ? 'text-[#0D1B2A]'
                      : 'text-slate-400'
                  }`}
                >
                  {step.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop / Tablet View: Full Step Rail */}
        <div className="hidden sm:block">
          <div className="relative">
            {/* Background Track */}
            <div className="absolute top-4 left-6 right-6 h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />
            
            {/* Active Progress Track with Cherry Blossom Pink */}
            <div
              className="absolute top-4 left-6 h-1 bg-gradient-to-r from-rose-400 via-rose-500 to-rose-500 -translate-y-1/2 z-0 rounded-full transition-all duration-300"
              style={{
                width: `calc(${progressPercent}% - 3rem * (1 - ${progressPercent / 100}))`
              }}
            />

            {/* Step Nodes */}
            <div className="relative z-10 flex justify-between">
              {ASSESSMENT_STEPS.map((step, index) => {
                const isCompleted =
                  (index === 0 && isStep1Complete && currentStep !== 'home') ||
                  (index === 1 && isStep2Complete && currentIndex > 1) ||
                  (index === 2 && isStep3Complete && currentIndex > 2) ||
                  (index === 3 && isStep4Complete && currentIndex > 3) ||
                  index < currentIndex;
                const isCurrent = step.id === currentStep;
                const isClickable =
                  index === 0 ||
                  (index === 1 && isStep1Complete) ||
                  (index === 2 && isStep1Complete && isStep2Complete) ||
                  (index === 3 && isStep1Complete && isStep2Complete && isStep3Complete) ||
                  (index === 4 && isStep1Complete && isStep2Complete && isStep3Complete && isStep4Complete);

                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center group cursor-pointer"
                    onClick={() => {
                      if (isClickable && onStepSelect) {
                        onStepSelect(step.id);
                      }
                    }}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 border-2 ${
                        isCompleted
                          ? 'bg-[#0D1B2A] border-[#0D1B2A] text-white shadow-sm'
                          : isCurrent
                          ? 'bg-white border-rose-500 text-rose-600 ring-4 ring-rose-100 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <span>{step.stepNumber}</span>
                      )}
                    </div>
                    
                    <span
                      className={`mt-2 text-xs transition-colors whitespace-nowrap ${
                        isCurrent
                          ? 'font-bold text-[#0D1B2A]'
                          : isCompleted
                          ? 'font-medium text-slate-700'
                          : 'font-normal text-slate-400'
                      }`}
                    >
                      {step.title}
                    </span>
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-0.5"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
