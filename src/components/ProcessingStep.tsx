import React, { useState, useEffect } from 'react';
import { AssessmentState } from '../types';
import {
  Sparkles,
  CheckCircle2,
  Scale,
  DollarSign,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

interface ProcessingStepProps {
  assessment: AssessmentState;
  onComplete: () => void;
}

interface StepPhase {
  percent: number;
  label: string;
  detail: string;
  icon: React.ReactNode;
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  assessment,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const userName = assessment.user?.name?.trim() || 'Washington Homeowner';
  const neighborhoodName = assessment.step3?.neighborhood?.split(',')[0] || 'Washington, DC';
  const hours = assessment.step4?.hoursPerWeek ?? 5;

  const phases: StepPhase[] = [
    {
      percent: 25,
      label: 'Checking DC Law 22-559 & DLCP Rules',
      detail: 'Verifying primary residence status, 90-day unhosted caps, and zoning allowance.',
      icon: <Scale className="w-4 h-4 text-rose-400" />
    },
    {
      percent: 50,
      label: `Benchmarking ${neighborhoodName} Rates`,
      detail: 'Calculating gross revenue, 10.25% DC occupancy tax, and turnover expenses.',
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />
    },
    {
      percent: 75,
      label: `Evaluating Host Effort (${hours} hrs/week)`,
      detail: 'Balancing guest communication, turnover labor, and net effective hourly return.',
      icon: <Clock className="w-4 h-4 text-amber-400" />
    },
    {
      percent: 100,
      label: 'Synthesizing Host or Hold Verdict',
      detail: 'Compiling personalized recommendations and DLCP compliance checklist.',
      icon: <Sparkles className="w-4 h-4 text-rose-300" />
    }
  ];

  useEffect(() => {
    // Smooth progress animation over ~3.4 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDone(true);
          return 100;
        }
        // Advance smoothly with subtle variations
        const next = prev + Math.floor(Math.random() * 6) + 4;
        return next > 100 ? 100 : next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // When 100% reached, auto-advance after 900ms
  useEffect(() => {
    if (isDone) {
      const timer = setTimeout(() => {
        onComplete();
      }, 950);
      return () => clearTimeout(timer);
    }
  }, [isDone, onComplete]);

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 space-y-8 animate-fade-in">
      {/* Main Processing & Congratulations Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D1B2A] via-[#16243b] to-[#0D1B2A] text-white p-7 sm:p-10 shadow-2xl border-2 border-slate-700/60 text-center">
        {/* Soft Background Accents */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 flex flex-col items-center">
          {/* 1. Celebratory Animated Graphic */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center my-2">
            {/* Outer pulsating ring */}
            <div className="absolute inset-0 rounded-full border-2 border-rose-500/40 animate-ping opacity-30" />
            {/* Middle rotating dash ring */}
            <div className="absolute inset-2 rounded-full border-2 border-dashed border-rose-400/60 animate-spin" style={{ animationDuration: '12s' }} />
            {/* Inner soft glow */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-rose-500/30 to-amber-500/20 blur-md" />

            {/* Core Graphic Crest */}
            <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#0D1B2A] border-2 border-rose-400 shadow-xl flex items-center justify-center">
              {/* Custom SVG Graphic of DC Capitol Dome + Home */}
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12 text-rose-300 drop-shadow"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Capitol / House Dome */}
                <path
                  d="M24 6L6 20H10V40H38V20H42L24 6Z"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="fill-rose-500/20"
                />
                {/* Pillars */}
                <line x1="16" y1="26" x2="16" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="24" y1="26" x2="24" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="32" y1="26" x2="32" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                {/* Pediment star */}
                <circle cx="24" cy="18" r="2" fill="#F43F5E" />
              </svg>
            </div>

            {/* Floating Sparkle / Check Badges */}
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-[#0D1B2A] animate-bounce">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg border-2 border-[#0D1B2A]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 2. Congratulations Message */}
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <span>🎉 Assessment Completed</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Congratulations, {userName}!
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              You’ve answered all 4 core modules. We’re computing your tailored Washington, DC
              recommendation, comparing your numbers with District data, and generating your custom
              DLCP action plan.
            </p>
          </div>

          {/* 3. The Processing Bar & Real-time Progress Counter */}
          <div className="w-full max-w-xl space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-rose-300">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                {isDone ? 'Calculations Complete' : 'Analyzing DC Short-Term Rental Data...'}
              </span>
              <span className="tabular-nums font-bold text-white text-sm">
                {progress}%
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="h-3.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/80 p-0.5 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 via-rose-400 to-emerald-400 transition-all duration-150 ease-out shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 4. Stage Checkpoints List */}
          <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-2">
            {phases.map((phase, idx) => {
              const isPhaseDone = progress >= phase.percent;
              const isCurrent = progress < phase.percent && (idx === 0 || progress >= phases[idx - 1].percent);

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition-all text-xs flex items-start gap-2.5 ${
                    isPhaseDone
                      ? 'bg-white/10 border-emerald-500/50 text-white'
                      : isCurrent
                      ? 'bg-rose-500/15 border-rose-400/50 text-white ring-1 ring-rose-400/30'
                      : 'bg-white/5 border-white/10 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isPhaseDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      phase.icon
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-100 flex items-center justify-between">
                      <span className="truncate">{phase.label}</span>
                      {isPhaseDone && (
                        <span className="text-[10px] text-emerald-300 font-semibold ml-1">Done</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300/80 mt-0.5 leading-snug">
                      {phase.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 5. Completion Announcement & Action Button */}
          <div className="pt-3 w-full max-w-md">
            <button
              type="button"
              onClick={onComplete}
              className={`w-full min-h-[50px] px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] cursor-pointer ${
                isDone
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white ring-2 ring-emerald-300'
                  : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
              }`}
            >
              <span>{isDone ? 'View Your Verdict Now' : 'Skip Directly to Verdict'}</span>
              <ArrowRight className="w-4 h-4 text-rose-200" />
            </button>
            <p className="text-[11px] text-slate-400 mt-2">
              {isDone ? 'Redirecting to your results...' : 'Click above anytime to bypass the processing animation.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
