import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  User,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Scale,
  Sparkles,
  TrendingUp,
  FileCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { EstimatesDisclaimer } from './EstimatesDisclaimer';

interface WelcomePageProps {
  user: UserProfile;
  onChange: (updated: Partial<UserProfile>) => void;
  onStart: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  user,
  onChange,
  onStart
}) => {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean }>({});
  const [showLawDetails, setShowLawDetails] = useState(false);
  const [showEvaluates, setShowEvaluates] = useState(true);

  const validate = (currentName: string, currentEmail: string) => {
    const errs: { name?: string; email?: string } = {};
    if (!currentName.trim()) {
      errs.name = 'Please enter your name to continue.';
    } else if (currentName.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!currentEmail.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!emailRegex.test(currentEmail.trim())) {
      errs.email = 'Please enter a valid email address (e.g., name@example.com).';
    }

    return errs;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    onChange({ name: val });
    if (touched.name) {
      const errs = validate(val, email);
      setErrors((prev) => ({ ...prev, name: errs.name }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    onChange({ email: val });
    if (touched.email) {
      const errs = validate(name, val);
      setErrors((prev) => ({ ...prev, email: errs.email }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true });
    const errs = validate(name, email);
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      onChange({ name: name.trim(), email: email.trim() });
      onStart();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-6">
      {/* Hero Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D1B2A] via-[#16243b] to-[#0D1B2A] text-white p-7 sm:p-10 shadow-2xl border border-slate-700/50">
        {/* Soft cherry blossom glow accent */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-rose-300" />
            <span>Washington, DC Homeowner Advisor</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Should you list on Airbnb in DC — or <span className="text-rose-400">hold</span>?
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            DC enforces some of the strictest short-term rental laws in the country (DLCP Law 22-559).
            Before you spend thousands on licensing, safety inspections, and furnishings, assess your
            eligibility, calculate real neighborhood revenue, and evaluate your hosting time.
          </p>

          {/* Collapsible Dropdown: DC Law 22-559 Key Takeaways */}
          <div>
            <button
              type="button"
              onClick={() => setShowLawDetails(!showLawDetails)}
              className="inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-white transition-colors cursor-pointer font-medium underline underline-offset-4"
            >
              <span>{showLawDetails ? 'Hide DC statutory overview' : 'View DC Law 22-559 core requirements'}</span>
              {showLawDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showLawDetails && (
              <div className="mt-2.5 p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200 space-y-1.5 animate-fade-in">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-rose-400" />
                  <span>District Department of Licensing and Consumer Protection (DLCP):</span>
                </div>
                <ul className="space-y-1 list-disc pl-4 text-slate-300 text-[11px]">
                  <li>Short-term rentals are restricted exclusively to a homeowner’s <strong>primary residence</strong>.</li>
                  <li><strong>90-day annual cap</strong> for unhosted rentals (host off-premise) unless an endorsement exemption is granted.</li>
                  <li>Properties owned under an LLC, corporate entity, or secondary investment properties are strictly disqualified from STR licenses.</li>
                </ul>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-rose-400" />
              3-minute assessment
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Scale className="w-4 h-4 text-rose-400" />
              Updated with 2026 DC laws
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5 font-medium">
              <FileCheck className="w-4 h-4 text-rose-400" />
              Custom printable action plan
            </span>
          </div>
        </div>
      </div>

      {/* Grid: 3 Pillars + Welcome Intake Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form to capture Name & Email */}
        <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0D1B2A] tracking-tight">
              Get Started with Your Assessment
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Enter your name and email to personalize your Washington, DC assessment and save your customized action plan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="user-name" className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Full Name <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="user-name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                  placeholder="e.g., Jane Smith"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                    touched.name && errors.name
                      ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-[#0D1B2A] focus:ring-2 focus:ring-slate-200 text-slate-900 bg-white'
                  }`}
                  autoFocus
                />
              </div>
              {touched.name && errors.name && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
                  <span>⚠️</span>
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label htmlFor="user-email" className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Email Address <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  placeholder="e.g., jane@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                    touched.email && errors.email
                      ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-[#0D1B2A] focus:ring-2 focus:ring-slate-200 text-slate-900 bg-white'
                  }`}
                />
              </div>
              {touched.email && errors.email ? (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
                  <span>⚠️</span>
                  <span>{errors.email}</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Used exclusively to personalize your DC Host or Hold Action Plan.
                </p>
              )}
            </div>

            {/* Submit CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full min-h-[52px] px-6 py-3.5 rounded-xl bg-[#0D1B2A] hover:bg-[#1B2A4A] text-white font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl ring-2 ring-rose-400/40 hover:ring-rose-400 active:scale-[0.99] cursor-pointer"
              >
                <span>Begin DC Home Assessment</span>
                <ArrowRight className="w-5 h-5 text-rose-300" />
              </button>
            </div>

            {/* Privacy Reassurance Note */}
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>We value your privacy. Your contact details are stored locally and never sold or shared.</span>
            </div>
          </form>
        </div>

        {/* Right Column: What We Evaluate in the 4 Steps */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
            <button
              type="button"
              onClick={() => setShowEvaluates(!showEvaluates)}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <h3 className="text-xs sm:text-sm font-bold text-[#0D1B2A] uppercase tracking-wider flex items-center gap-2">
                <span>What This Assessment Evaluates</span>
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold group-hover:text-slate-800 transition-colors">
                <span className="hidden sm:inline text-[11px] font-normal">{showEvaluates ? 'Collapse' : 'Expand'}</span>
                {showEvaluates ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showEvaluates && (
              <div className="space-y-3 pt-1 animate-fade-in">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0D1B2A]">DC Legal Eligibility & Zoning</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Checks DC DLCP primary residence rules, 90-day unhosted caps, and HOA/condo bylaws.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0D1B2A]">Ward & Neighborhood Economics</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Simulates actual DC nightly rates, cleaning fees, and 10.25% transient occupancy tax.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0D1B2A]">Host Workload & Hourly Wage</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Evaluates guest check-ins, cleaning hours, noise rules, and effective net hourly return.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0D1B2A]">Action Plan & DLCP Checklist</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Generates a printable DC launch checklist with official links to boss.dc.gov.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100% Free · No credit card required</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estimates Disclaimer */}
      <EstimatesDisclaimer variant="subtle" />
    </div>
  );
};
