import React, { useState } from 'react';
import { Landmark, TrendingUp, ShieldAlert, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export const DCContextCard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-4 shadow-sm">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left cursor-pointer group"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/70 shrink-0">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0D1B2A] group-hover:text-rose-600 transition-colors">
              DC Rental Context
            </h3>
            <p className="text-[11px] text-slate-500">
              Municipal Regulations & Market Stats
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-700 transition-colors">
          <span className="text-[10px] font-semibold uppercase">{isExpanded ? 'Hide' : 'View'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-4 pt-2 border-t border-slate-100 animate-fade-in">
          {/* Point 1: DC Law on Primary Residence */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Primary Residence Rule (Law 22-559)
            </div>
            <p className="pl-3 leading-relaxed text-slate-600">
              DC requires short-term rental hosts to be primary residents of the property (owning or living there for at least 183 days/yr). You may host unlimited hosted nights, plus up to 90 unhosted nights/year with a Vacation Rental endorsement.
            </p>
          </div>

          {/* Point 2: DC Real Data Benchmark */}
          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
              <span>Real DC Host Earnings (Active Listings)</span>
            </div>
            <p className="pl-5 leading-relaxed text-slate-600">
              According to District market data, active licensed hosts generate a median of <strong className="text-slate-900">$27,000 to $58,700/year</strong> depending on neighborhood (e.g., Shaw, Capitol Hill, and Logan Circle lead revenue).
            </p>
          </div>

          {/* Point 3: License Compliance */}
          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-700" />
              <span>76%+ Licensed in Top Wards</span>
            </div>
            <p className="pl-5 leading-relaxed text-slate-600">
              Over 76% of active DC listings now operate with verified DLCP business licenses. Platforms share booking data directly with the DC government.
            </p>
          </div>

          {/* Cherry blossom badge */}
          <div className="pt-2 text-[11px] font-medium text-rose-700 bg-rose-50/70 p-2.5 rounded-xl border border-rose-100 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Tailored for DC rowhomes, condos, and single-family properties.</span>
          </div>
        </div>
      )}
    </aside>
  );
};
