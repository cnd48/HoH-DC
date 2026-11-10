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
          <strong className="text-slate-700 font-semibold">Disclaimer:</strong> The figures featured in this app (including nightly rates, revenue, occupancy, expenses, and mortgage coverage) are estimates for informational and planning purposes only. Actual market performance and DC DLCP licensing outcomes may vary. This tool does not provide legal, financial, or tax advice.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl bg-slate-50/90 border border-slate-200 p-3.5 sm:p-4 text-xs text-slate-600 space-y-1.5 ${className}`}
      role="note"
      aria-label="Estimates Disclaimer"
    >
      <div className="flex items-center gap-1.5 font-bold text-[#0D1B2A] text-[11px] sm:text-xs uppercase tracking-wider">
        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
        <span>Important Estimates & Regulatory Disclaimer</span>
      </div>
      <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
        <strong>Disclaimer:</strong> The figures featured in this app are estimates based on Washington, DC municipal data, typical neighborhood pricing, and general regulatory benchmarks. Actual host earnings, expenses, occupancy, and DLCP licensing eligibility may vary based on your specific property, timing, and platform policies. Not formal legal, accounting, or real estate advisory services.
      </p>
    </div>
  );
};
