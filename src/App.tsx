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
import { AssessmentSnapshot } from './components/AssessmentSnapshot';
import { EstimatesDisclaimer } from './components/EstimatesDisclaimer';
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
    Boolean(assessment.step2.lawMode) &&
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
              {/* Condensed Dropdown Assessment Snapshot on Each Step */}
              <AssessmentSnapshot
                assessment={assessment}
                onGoToStep={handleStepSelect}
                defaultOpen={false}
              />

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

            {/* Estimates Disclaimer at bottom of assessment page */}
            <EstimatesDisclaimer variant="subtle" />
          </div>

          {/* Sticky Sidebar: DC Legal Context & Live Assessment Snapshot in Dropdown Format */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 print:hidden">
            {/* Live Assessment Snapshot in Drop-Down format */}
            <AssessmentSnapshot
              assessment={assessment}
              onGoToStep={handleStepSelect}
              defaultOpen={false}
              className="hidden lg:block"
            />

            <DCContextCard />
          </div>
        </div>
        )}
      </main>

      {/* 4. Mobile Bottom Navigation Spacer so content is not obscured */}
      <div className="h-20 sm:hidden print:hidden" />

      {/* 5. Quiet Clean Footer with Estimates Disclaimer on bottom of page */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0D1B2A]">Host or Hold DC</span>
              <span className="text-slate-300">·</span>
              <span>Washington, DC Short-Term Rental Assessment</span>
            </div>
            <div className="text-xs font-medium text-slate-600">
              Educational tool, not legal advice. Rules checked November 2026.
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 text-center sm:text-left leading-relaxed">
            <strong className="text-slate-700">Disclaimer:</strong> The figures, financial projections, nightly rates, expenses, and regulatory calculations featured in this application are estimates for informational and planning purposes only. Actual market earnings, occupancy, and DLCP licensing outcomes may vary.
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
