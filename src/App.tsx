import React, { useState, useEffect } from 'react';
import { AssessmentState, StepId, Step1Answers, Step2Answers, Step3Answers, Step4Answers, UserProfile } from './types';
import {
  loadAssessmentState,
  saveAssessmentState,
  resetAssessmentState
} from './utils/storage';
import { calculateEligibility } from './utils/eligibility';
import { calculateNetEarnings } from './utils/earnings';
import { calculateRiskEvaluation } from './utils/risks';
import { calculateVerdict } from './utils/verdict';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { WelcomePage } from './components/WelcomePage';
import { Step1YourHome } from './components/Step1YourHome';
import { Step2Eligibility } from './components/Step2Eligibility';
import { Step3Earnings } from './components/Step3Earnings';
import { Step4YourTime } from './components/Step4YourTime';
import { ProcessingStep } from './components/ProcessingStep';
import { Step5Verdict } from './components/Step5Verdict';
import { StepPreview } from './components/StepPreview';
import { DCContextCard } from './components/DCContextCard';
import { NavigationButtons } from './components/NavigationButtons';
import { ChatDrawer } from './components/ChatDrawer';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, Scale, TrendingUp, Clock, Shield, RotateCcw } from 'lucide-react';

export default function App() {
  const [assessment, setAssessment] = useState<AssessmentState>(() => loadAssessmentState());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Sync to localStorage whenever answers change
  useEffect(() => {
    saveAssessmentState(assessment);
  }, [assessment]);

  const triggerSaveIndicator = () => {
    setSaveStatus('Answers saved');
    const timer = setTimeout(() => {
      setSaveStatus(null);
    }, 1800);
    return () => clearTimeout(timer);
  };

  const handleUserChange = (updated: Partial<UserProfile>) => {
    setAssessment((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        ...updated
      }
    }));
    triggerSaveIndicator();
  };

  const handleStartAssessment = () => {
    setAssessment((prev) => ({
      ...prev,
      currentStep: 'home'
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep1Change = (updated: Partial<Step1Answers>) => {
    setAssessment((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        ...updated
      }
    }));
    triggerSaveIndicator();
  };

  const handleStep2Change = (updated: Partial<Step2Answers>) => {
    setAssessment((prev) => ({
      ...prev,
      step2: {
        ...prev.step2,
        ...updated
      }
    }));
    triggerSaveIndicator();
  };

  const handleStep3Change = (updated: Partial<Step3Answers>) => {
    setAssessment((prev) => ({
      ...prev,
      step3: {
        ...prev.step3,
        ...updated
      }
    }));
    triggerSaveIndicator();
  };

  const handleStep4Change = (updated: Partial<Step4Answers>) => {
    setAssessment((prev) => ({
      ...prev,
      step4: {
        ...prev.step4,
        ...updated
      }
    }));
    triggerSaveIndicator();
  };

  const [showResetModal, setShowResetModal] = useState(false);

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    const clean = resetAssessmentState();
    setAssessment(clean);
    setShowResetModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isStep1Complete =
    assessment.step1.isMainResidence !== null &&
    assessment.step1.householdComposition !== null;

  const isCoreEligibilityComplete =
    assessment.step2.isCondoOrHoa !== null &&
    (assessment.step2.isCondoOrHoa === 'no' || assessment.step2.hoaAllowsStr !== null) &&
    assessment.step2.ownershipType !== null;

  const isLivingComplete = (() => {
    const living = assessment.step2.householdLiving || {};
    const comp = assessment.step1.householdComposition;
    if (comp === 'family_children') {
      return Boolean(living.hasPrivateEntrance && living.sharesKitchenBath);
    }
    if (comp === 'older_relative' || comp === 'senior') {
      return Boolean(living.isNoiseAConcern && living.managementPreference);
    }
    if (comp === 'just_me') {
      return Boolean(living.travelNightsPerYear);
    }
    if (comp === 'partner') {
      return Boolean(living.spaceType);
    }
    return true;
  })();

  const isStep2Complete = isCoreEligibilityComplete && isLivingComplete;

  const isStep3Complete =
    Boolean(assessment.step3.neighborhood) &&
    assessment.step3.nightlyRate > 0 &&
    assessment.step3.occupancyPercent > 0;

  const isStep4Complete = (assessment.step4?.hoursPerWeek ?? 0) > 0;

  const handleNext = () => {
    if (assessment.currentStep === 'welcome') {
      handleStartAssessment();
    } else if (assessment.currentStep === 'home') {
      if (!isStep1Complete) return;
      setAssessment((prev) => ({
        ...prev,
        currentStep: 'eligibility'
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (assessment.currentStep === 'eligibility') {
      if (!isStep2Complete) return;
      setAssessment((prev) => ({
        ...prev,
        currentStep: 'earnings'
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (assessment.currentStep === 'earnings') {
      if (!isStep3Complete) return;
      setAssessment((prev) => ({
        ...prev,
        currentStep: 'time'
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (assessment.currentStep === 'time') {
      if (!isStep4Complete) return;
      setAssessment((prev) => ({
        ...prev,
        currentStep: 'processing'
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (assessment.currentStep === 'processing') {
      setAssessment((prev) => ({
        ...prev,
        currentStep: 'verdict'
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (assessment.currentStep === 'verdict') {
      window.print();
    }
  };

  const handleBack = () => {
    if (assessment.currentStep === 'verdict') {
      setAssessment((prev) => ({
        ...prev,
        currentStep: 'time'
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (assessment.currentStep === 'processing') {
      setAssessment((prev) => ({
        ...prev,
        currentStep: 'time'
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (assessment.currentStep === 'time') {
      setAssessment((prev) => ({
        ...prev,
        currentStep: 'earnings'
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (assessment.currentStep === 'earnings') {
      setAssessment((prev) => ({
        ...prev,
        currentStep: 'eligibility'
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (assessment.currentStep === 'eligibility') {
      setAssessment((prev) => ({
        ...prev,
        currentStep: 'home'
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (assessment.currentStep === 'home') {
      setAssessment((prev) => ({
        ...prev,
        currentStep: 'welcome'
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepSelect = (stepId: StepId) => {
    if (stepId === 'welcome' || stepId === 'home') {
      setAssessment((prev) => ({
        ...prev,
        currentStep: stepId
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Check navigation restrictions
    if (stepId === 'eligibility' && !isStep1Complete) return;
    if (stepId === 'earnings' && (!isStep1Complete || !isStep2Complete)) return;
    if (stepId === 'time' && (!isStep1Complete || !isStep2Complete || !isStep3Complete)) return;
    if (stepId === 'processing' && (!isStep1Complete || !isStep2Complete || !isStep3Complete || !isStep4Complete)) return;
    if (stepId === 'verdict' && (!isStep1Complete || !isStep2Complete || !isStep3Complete || !isStep4Complete)) {
      return;
    }
    setAssessment((prev) => ({
      ...prev,
      currentStep: stepId
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasAnyAnswers =
    Boolean(assessment.user?.name) ||
    Boolean(assessment.user?.email) ||
    assessment.step1.isMainResidence !== null ||
    assessment.step1.householdComposition !== null ||
    assessment.step2.isCondoOrHoa !== null ||
    assessment.step2.ownershipType !== null;
    assessment.step2.ownershipType !== null;

  const currentEligibility = calculateEligibility(assessment.step1, assessment.step2);
  const currentEarnings = calculateNetEarnings(assessment.step3);
  const currentRisks = calculateRiskEvaluation(assessment.step1, assessment.step2, assessment.step3);
  const currentVerdict = calculateVerdict(
    assessment.step1,
    assessment.step2,
    assessment.step3,
    assessment.step4
  );
  const currentEffectiveHourly = Math.round(
    currentEarnings.netIncome / Math.max(1, (assessment.step4?.hoursPerWeek ?? 5) * 52)
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900 print:bg-white print:text-black">
      {/* 1. Header */}
      <div className="print:hidden">
        <Header
          onReset={handleReset}
          hasAnswers={hasAnyAnswers}
          userName={assessment.user?.name}
        />
      </div>

      {/* 2. Five-Step Progress Bar */}
      <div className="print:hidden">
        <ProgressBar
          currentStep={assessment.currentStep}
          onStepSelect={handleStepSelect}
          isStep1Complete={isStep1Complete}
          isStep2Complete={isStep2Complete}
          isStep3Complete={isStep3Complete}
          isStep4Complete={isStep4Complete}
        />
      </div>

      {/* Save Notification Pill */}
      <div className="fixed top-20 right-6 z-50 pointer-events-none transition-all duration-300 print:hidden">
        {saveStatus && (
          <div className="bg-[#0D1B2A] text-white text-xs font-semibold py-1.5 px-3 rounded-full shadow-lg border border-slate-700/50 flex items-center gap-1.5 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      {/* 3. Main Workspace Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 print:p-0 print:max-w-none">
        {assessment.currentStep === 'welcome' ? (
          <div key="welcome" className="step-transition">
            <WelcomePage
              user={assessment.user}
              onChange={handleUserChange}
              onStart={handleStartAssessment}
            />
          </div>
        ) : assessment.currentStep === 'processing' ? (
          <div key="processing" className="step-transition">
            <ProcessingStep
              assessment={assessment}
              onComplete={() => {
                setAssessment((prev) => ({
                  ...prev,
                  currentStep: 'verdict'
                }));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Assessment Column */}
            <div className="lg:col-span-8 space-y-6 print:col-span-12">
              <div key={assessment.currentStep} className="step-transition">
                {assessment.currentStep === 'home' && (
                  <Step1YourHome
                    answers={assessment.step1}
                    onChange={handleStep1Change}
                  />
                )}

                {assessment.currentStep === 'eligibility' && (
                  <Step2Eligibility
                    step1Answers={assessment.step1}
                    answers={assessment.step2}
                    onChange={handleStep2Change}
                  />
                )}

                {assessment.currentStep === 'earnings' && (
                  <Step3Earnings
                    step1Answers={assessment.step1}
                    step2Answers={assessment.step2}
                    answers={assessment.step3}
                    onChange={handleStep3Change}
                  />
                )}

                {assessment.currentStep === 'time' && (
                  <Step4YourTime
                    step1Answers={assessment.step1}
                    step2Answers={assessment.step2}
                    step3Answers={assessment.step3}
                    answers={assessment.step4}
                    onChange={handleStep4Change}
                  />
                )}

                {assessment.currentStep === 'verdict' && (
                  <Step5Verdict
                    user={assessment.user}
                    step1Answers={assessment.step1}
                    step2Answers={assessment.step2}
                    step3Answers={assessment.step3}
                    answers={assessment.step4}
                    onReset={handleReset}
                    onGoToStep={handleStepSelect}
                  />
                )}
              </div>

            {/* Anchored Navigation Buttons on Tablet/Desktop */}
            <div className="pt-6 border-t border-slate-200">
              <NavigationButtons
                currentStep={assessment.currentStep}
                isStep1Complete={isStep1Complete}
                isStep2Complete={isStep2Complete}
                isStep3Complete={isStep3Complete}
                isStep4Complete={isStep4Complete}
                onBack={handleBack}
                onNext={handleNext}
              />
            </div>
          </div>

          {/* Sticky Sidebar: DC Legal Context & Live Assessment Snapshot */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 print:hidden">
            {/* Real-time Assessment Snapshot Card */}
            {hasAnyAnswers && (
              <div className="bg-white rounded-2xl border-2 border-slate-200/90 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-[#0D1B2A] uppercase tracking-wider">
                    Assessment Snapshot
                  </span>
                  <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    {assessment.step2.lawMode === 'current' ? 'Current Law' : '2026 Bill'}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {assessment.user?.name && (
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Homeowner:</span>
                      <span className="font-bold text-[#0D1B2A] text-right truncate max-w-[150px]">
                        {assessment.user.name}
                      </span>
                    </div>
                  )}
                  {/* Step 1 Items */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Main Residence:</span>
                    <span className="font-semibold text-slate-800 text-right">
                      {assessment.step1.isMainResidence === 'yes'
                        ? 'Yes (Primary)'
                        : assessment.step1.isMainResidence === 'no'
                        ? 'No (Second / Inherited)'
                        : 'Unselected'}
                    </span>
                  </div>

                  {/* Step 2 Items */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Property Type:</span>
                    <span className="font-semibold text-slate-800 text-right">
                      {assessment.step2.isCondoOrHoa === 'yes'
                        ? `Condo/HOA (${assessment.step2.hoaAllowsStr === 'yes' ? 'Allowed' : assessment.step2.hoaAllowsStr === 'no' ? 'Blocked' : 'Unsure'})`
                        : assessment.step2.isCondoOrHoa === 'no'
                        ? 'Fee-Simple (No HOA)'
                        : 'Unselected'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Ownership:</span>
                    <span className="font-semibold text-slate-800 text-right">
                      {assessment.step2.ownershipType === 'personal'
                        ? 'Individual (Personal)'
                        : assessment.step2.ownershipType === 'entity'
                        ? 'LLC / Trust (Corporate)'
                        : 'Unselected'}
                    </span>
                  </div>

                  {/* Step 2 Household Living Details if answered */}
                  {assessment.step2.householdLiving?.hasPrivateEntrance && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Entrance:</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {assessment.step2.householdLiving.hasPrivateEntrance === 'yes' ? 'Private Entrance' : 'Shared Entrance'}
                      </span>
                    </div>
                  )}

                  {assessment.step2.householdLiving?.sharesKitchenBath && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Facilities:</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {assessment.step2.householdLiving.sharesKitchenBath === 'no_private' ? 'Private Bath/Kitchen' : 'Shared Facilities'}
                      </span>
                    </div>
                  )}

                  {assessment.step2.householdLiving?.isNoiseAConcern && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Noise Sensitivity:</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {assessment.step2.householdLiving.isNoiseAConcern === 'yes' ? 'Quiet Essential' : 'Normal Noise Fine'}
                      </span>
                    </div>
                  )}

                  {assessment.step2.householdLiving?.managementPreference && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Turnover:</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {assessment.step2.householdLiving.managementPreference === 'self' ? 'Self-Managed' : 'Hiring Help'}
                      </span>
                    </div>
                  )}

                  {assessment.step2.householdLiving?.travelNightsPerYear && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Annual Travel:</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {assessment.step2.householdLiving.travelNightsPerYear === 'under_30' ? '< 30 nights' : assessment.step2.householdLiving.travelNightsPerYear === '30_to_90' ? '30–90 nights' : '90+ nights'}
                      </span>
                    </div>
                  )}

                  {assessment.step2.householdLiving?.spaceType && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Space Offered:</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {assessment.step2.householdLiving.spaceType === 'separate_unit' ? 'Separate Unit' : assessment.step2.householdLiving.spaceType === 'spare_room' ? 'Spare Room' : 'Entire Home Away'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Eligibility Result Pill */}
                <div className={`mt-3 pt-3 border-t border-slate-100 flex items-center justify-between p-2.5 rounded-xl ${
                  currentEligibility.status === 'green'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : currentEligibility.status === 'amber'
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    {currentEligibility.status === 'green' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {currentEligibility.status === 'amber' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                    {currentEligibility.status === 'red' && <XCircle className="w-4 h-4 text-rose-600" />}
                    <span>{currentEligibility.status.toUpperCase()} ELIGIBILITY</span>
                  </div>
                </div>

                {/* Step 3 Projected Revenue Strip in Sidebar */}
                {assessment.step3?.nightlyRate > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>{assessment.step3.neighborhood.split(',')[0]}</span>
                      <span>${assessment.step3.nightlyRate}/night · {assessment.step3.occupancyPercent}% occ</span>
                    </div>
                    <div className="flex items-center justify-between font-extrabold text-[#0D1B2A]">
                      <span>Projected Net:</span>
                      <span className="text-emerald-700 text-sm tabular-nums">
                        ${currentEarnings.netIncome.toLocaleString()}/yr
                      </span>
                    </div>
                  </div>
                )}

                {/* Step 4 Time Commitment & Risk Strip in Sidebar */}
                {assessment.step4 && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Effort:
                      </span>
                      <span className="font-bold text-[#0D1B2A]">
                        {assessment.step4.hoursPerWeek} hrs/wk (${currentEffectiveHourly}/hr)
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/70">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        Risk Level:
                      </span>
                      <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                        currentRisks.overallRiskLevel === 'low'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentRisks.overallRiskLevel === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {currentRisks.overallRiskLevel.toUpperCase()}
                      </span>
                    </div>

                    {/* Step 5 Verdict Summary in Sidebar */}
                    <div className={`mt-2 p-2 rounded-xl border flex items-center justify-between text-xs font-bold ${
                      currentVerdict.decision === 'GO'
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                        : currentVerdict.decision === 'GO_WITH_CONDITIONS'
                        ? 'bg-amber-50 text-amber-950 border-amber-300'
                        : 'bg-rose-50 text-rose-950 border-rose-300'
                    }`}>
                      <span>VERDICT:</span>
                      <span className="font-extrabold">{currentVerdict.badgeLabel}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DCContextCard />
          </div>
        </div>
        )}
      </main>

      {/* 4. Mobile Bottom Navigation Spacer so content is not obscured */}
      <div className="h-20 sm:hidden print:hidden" />

      {/* 5. Quiet Clean Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0D1B2A]">Host or Hold DC</span>
            <span className="text-slate-300">·</span>
            <span>Washington, DC Short-Term Rental Assessment</span>
          </div>
          <div className="text-xs font-medium text-slate-600">
            Educational tool, not legal advice. Rules checked November 2026.
          </div>
        </div>
      </footer>

      {/* Floating Ask a DC Hosting Question Chat Assistant */}
      <ChatDrawer assessment={assessment} />

      {/* In-App Reset Confirmation Modal (avoiding window.alert/confirm) */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in print:hidden">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0D1B2A]">Start Fresh?</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This will clear your saved answers and return to Step 1.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors cursor-pointer"
              >
                Yes, Start Over
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
