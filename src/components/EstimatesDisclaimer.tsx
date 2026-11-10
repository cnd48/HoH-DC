import React from 'react';
import { AlertCircle } from 'lucide-react';

interface EstimatesDisclaimerProps {
  className?: string;
  variant?: 'subtle' | 'card';
}

export const EstimatesDisclaimer: React.FC<EstimatesDisclaimerProps> = ({
  className = '',
  variant = 'card'
}) => {
  if (variant === 'subtle') {
    return (
      <div className={`pt-4 border-t border-slate-200/80 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed ${className}`}>
        <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-700 font-semibold">Estimates Disclaimer:</strong> All revenue figures, nightly rates, expenses, tax obligations, and statutory projections featured in this application are estimates for informational and planning purposes only. Actual market earnings, occupancy, and DC licensing outcomes may vary. Not legal, financial, or tax advice.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl bg-slate-50/90 border border-slate-200 p-3.5 sm:p-4 text-xs text-slate-600 space-y-1 ${className}`}
      role="note"
      aria-label="Estimates Disclaimer"
    >
      <div className="flex items-center gap-1.5 font-bold text-[#0D1B2A] text-[11px] sm:text-xs uppercase tracking-wider">
        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
        <span>Important Estimates & Regulatory Disclaimer</span>
      </div>
      <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
        All financial figures, nightly rates, occupancy estimates, mortgage coverage percentages, and regulatory rules featured in this application are estimates based on Washington, DC municipal data and typical market performance. Actual host revenue, expenses, and DLCP licensing eligibility may vary based on specific property conditions, season, and platform policy. This application provides educational guidance and does not constitute formal legal, accounting, or real estate advisory services.
      </p>
    </div>
  );
};
