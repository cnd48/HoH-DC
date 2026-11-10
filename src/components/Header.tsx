import React from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  hasAnswers: boolean;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({ onReset, hasAnswers, userName }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single text element wordmark with Cherry Blossom motif */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#0D1B2A] flex items-center justify-center text-rose-300 shadow-sm border border-slate-700/30">
            {/* Custom stylized cherry blossom petal icon */}
            <svg
              className="w-5 h-5 text-rose-400 fill-rose-300/40"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c-1.5 2-2 4-2 6 0 2 1.5 3 2 3s2-1 2-3c0-2-.5-4-2-6zm7 5.5c-2-.5-4 0-5.5 1.5-1.5 1.5-1.5 3.5-.5 4.5s3 0 4.5-1.5c1.5-1.5 2-3.5 1.5-4.5zm-14 0c-.5 1 0 3 1.5 4.5 1.5 1.5 3.5 1.5 4.5.5s1-3-.5-4.5C9 7.5 7 7 5 8.5zM7.5 19.5c1 1.5 3 2 4.5 1 1.5-1 1.5-3 .5-4.5s-3-1.5-4.5-.5-1.5 3-.5 4zm9 0c1-1 .5-3-.5-4s-3-.5-4.5.5-.5 3.5.5 4.5 3.5.5 4.5-1z"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-[#0D1B2A] whitespace-nowrap">
                Host or Hold <span className="text-rose-500">DC</span>
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 tracking-tight hidden sm:block">
              Washington, DC Homeowner Assessment
            </p>
          </div>
        </div>

        {/* Zone 2: Informative quiet status */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 font-medium">
          {userName && (
            <span className="font-bold text-[#0D1B2A] bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 truncate max-w-[170px]">
              Homeowner: {userName}
            </span>
          )}
          <span className="text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200/70 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            DC Short-Term Rental Act Aligned
          </span>
          <span className="text-slate-300">·</span>
          <span>District Law (DLCP) Compliant</span>
        </div>

        {/* Zone 3: 1 Primary contextual action (Reset / Start Fresh) */}
        <div className="flex items-center gap-2 shrink-0">
          {hasAnswers && (
            <button
              onClick={onReset}
              className="text-xs font-semibold text-slate-600 hover:text-[#0D1B2A] hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200"
              title="Clear saved answers and start fresh"
              type="button"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Start Over</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
