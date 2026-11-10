import {
  Step1Answers,
  Step2Answers,
  Step3Answers,
  Step4Answers,
  EligibilityStatus
} from '../types';
import { calculateEligibility } from './eligibility';
import { calculateNetEarnings } from './earnings';
import { calculateRiskEvaluation } from './risks';

export type VerdictDecision = 'GO' | 'GO_WITH_CONDITIONS' | 'HOLD';

export interface VerdictReason {
  title: string;
  detail: string;
  iconType: 'home' | 'cash' | 'legal' | 'shield';
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  authorityOrUrl?: string;
  urlText?: string;
  isMandatory: boolean;
  category: 'legal' | 'safety' | 'insurance' | 'operations';
}

export interface VerdictResult {
  decision: VerdictDecision;
  headline: string;
  subtitle: string;
  badgeLabel: string;
  badgeColorClass: string;
  accentBorderClass: string;
  reasons: VerdictReason[];
  checklist: ChecklistItem[];
  keyConditions: string[];
}

export function calculateVerdict(
  step1: Step1Answers,
  step2: Step2Answers,
  step3: Step3Answers,
  step4: Step4Answers
): VerdictResult {
  const eligibility = calculateEligibility(step1, step2);
  const earnings = calculateNetEarnings(step3);
  const risks = calculateRiskEvaluation(step1, step2, step3);
  const yearlyHours = Math.max(1, step4.hoursPerWeek * 52);
  const hourlyRate = Math.round(earnings.netIncome / yearlyHours);
  const living = step2.householdLiving || {};

  // 1. DETERMINE VERDICT DECISION
  let decision: VerdictDecision = 'GO';
  const keyConditions: string[] = [];

  // Hard disqualifiers for HOLD:
  if (eligibility.status === 'red') {
    decision = 'HOLD';
  } else if (earnings.netIncome <= 0) {
    decision = 'HOLD';
  } else if (step2.isCondoOrHoa === 'yes' && step2.hoaAllowsStr === 'no') {
    decision = 'HOLD';
  } else if (step1.isMainResidence === 'no' && step2.lawMode === 'current') {
    decision = 'HOLD';
  } else if (step2.ownershipType === 'entity') {
    decision = 'HOLD';
  } else {
    // Check for GO WITH CONDITIONS:
    const isAmberEligibility = eligibility.status === 'amber';
    const hasHoaUnsure = step2.isCondoOrHoa === 'yes' && step2.hoaAllowsStr === 'not_sure';
    const hasFamilyPrivacyConcern =
      step1.householdComposition === 'family_children' &&
      (living.hasPrivateEntrance === 'no' || living.sharesKitchenBath === 'yes_shared');
    const hasNoiseConcern =
      (step1.householdComposition === 'older_relative' || step1.householdComposition === 'senior') &&
      living.isNoiseAConcern === 'yes';
    const isAwayCapped = step3.hostingMode === 'away';
    const isModerateHourly = hourlyRate < 35;
    const hasHighRisk = risks.overallRiskLevel === 'high';

    if (
      isAmberEligibility ||
      hasHoaUnsure ||
      hasFamilyPrivacyConcern ||
      hasNoiseConcern ||
      isAwayCapped ||
      isModerateHourly ||
      hasHighRisk
    ) {
      decision = 'GO_WITH_CONDITIONS';

      if (hasHoaUnsure) {
        keyConditions.push('Obtain written approval from your condo/HOA board before listing.');
      }
      if (hasFamilyPrivacyConcern) {
        keyConditions.push('Establish private access separation or lockable partition doors to protect family routines.');
      }
      if (hasNoiseConcern) {
        keyConditions.push('Enforce 10 PM quiet hours and install a privacy-safe decibel sensor.');
      }
      if (isAwayCapped) {
        keyConditions.push('Strictly monitor the 90-night annual DC vacation rental limit for unhosted stays.');
      }
      if (step1.isMainResidence === 'no' && step2.lawMode === 'proposed_2026') {
        keyConditions.push('Wait for formal DC Council enactment of the 2026 second-home STR bill before operating.');
      }
    } else {
      decision = 'GO';
    }
  }

  // 2. CONSTRUCT 3 PERSONALIZED REASONS
  const reasons: VerdictReason[] = [];

  // Reason 1: Living Space & Household Setup
  if (step3.spaceType === 'basement_unit' && living.hasPrivateEntrance === 'yes') {
    reasons.push({
      title: 'Private Entrance Protects Household Space',
      detail:
        "Your basement's separate entrance keeps your family's space private, allowing guests to check in independently without passing through your main living areas.",
      iconType: 'home'
    });
  } else if (step1.householdComposition === 'family_children') {
    if (living.hasPrivateEntrance === 'no') {
      reasons.push({
        title: 'Shared Family Footprint Requires Clear Boundaries',
        detail:
          'Because guests share common hallways with your children, hosting will require set arrival windows and clear house rules regarding common areas.',
        iconType: 'home'
      });
    } else {
      reasons.push({
        title: 'Separate Access Isolates Family Routines',
        detail:
          'Your dedicated entrance buffers household noise, letting children play upstairs while guests stay undisturbed below.',
        iconType: 'home'
      });
    }
  } else if (step1.householdComposition === 'older_relative' || step1.householdComposition === 'senior') {
    if (living.isNoiseAConcern === 'yes') {
      reasons.push({
        title: 'Noise Control Protocol is Essential',
        detail:
          'With sensitive household members, setting clear 10:00 PM quiet hours and vetting business or mature travelers prevents sleep disruption.',
        iconType: 'shield'
      });
    } else {
      reasons.push({
        title: 'Flexible On-Site Hospitality',
        detail:
          'Having someone at home makes guest assistance effortless and qualifies you for unlimited hosted nights under DC law.',
        iconType: 'home'
      });
    }
  } else if (step1.householdComposition === 'partner') {
    if (living.spaceType === 'separate_unit') {
      reasons.push({
        title: 'Autonomous Unit Gives You Maximum Privacy',
        detail:
          'Your separate unit allows you and your partner to enjoy complete personal privacy while generating rental income on the same property.',
        iconType: 'home'
      });
    } else {
      reasons.push({
        title: 'On-Site Hosted Room Exempt from 90-Night Cap',
        detail:
          'Hosting a spare room while living in the home avoids the 90-night DC unhosted vacation rental restriction entirely.',
        iconType: 'home'
      });
    }
  } else {
    // Just me (solo)
    if (step3.hostingMode === 'away') {
      reasons.push({
        title: 'Monetizes Your Travel While Away from DC',
        detail:
          'Listing your home while traveling turns empty days into revenue, comfortably operating within DC’s 90-night unhosted allowance.',
        iconType: 'home'
      });
    } else {
      reasons.push({
        title: 'Solo Hosted Operation Offers High Control',
        detail:
          'As a solo homeowner, you retain full oversight of guest interactions and schedule cleanings around your own routine.',
        iconType: 'home'
      });
    }
  }

  // Reason 2: Financial Comparison & Hourly Efficiency
  const mortgageCoverage = earnings.mortgageCoveragePercent;
  const netVsLongTerm = earnings.netDifferenceVsLongTerm;

  if (decision === 'HOLD') {
    if (earnings.longTermAnnualIncome > earnings.netIncome) {
      reasons.push({
        title: 'Long-Term Lease Delivers Better Net Value',
        detail: `A traditional tenant generates $${earnings.longTermAnnualIncome.toLocaleString()}/yr ($${Math.abs(netVsLongTerm).toLocaleString()}/yr more than short-term hosting) with zero guest turnover effort or licensing hurdles.`,
        iconType: 'cash'
      });
    } else {
      reasons.push({
        title: 'High Legal or Capital Risk Outweighs Return',
        detail:
          'Operating under current licensing restrictions exposes you to civil fines ($1,000–$5,000) that would rapidly erase projected rental gains.',
        iconType: 'legal'
      });
    }
  } else {
    if (netVsLongTerm > 0) {
      reasons.push({
        title: `Outperforms Long-Term Rent & Covers ${mortgageCoverage}% of Mortgage`,
        detail: `Hosting is projected to net $${earnings.netIncome.toLocaleString()}/yr (+$${netVsLongTerm.toLocaleString()} more than a 12-month lease) at an effective rate of $${hourlyRate}/hour for your ${step4.hoursPerWeek} weekly hours.`,
        iconType: 'cash'
      });
    } else {
      reasons.push({
        title: `Covers ${mortgageCoverage}% of Mortgage While Retaining Property Use`,
        detail: `Hosting nets $${earnings.netIncome.toLocaleString()}/yr at $${hourlyRate}/hour. While a 12-month lease yields slightly more, hosting lets you reclaim the space whenever family or friends visit DC.`,
        iconType: 'cash'
      });
    }
  }

  // Reason 3: DC Regulatory Status & Compliance Standing
  if (step1.isMainResidence === 'no') {
    if (step2.lawMode === 'current') {
      reasons.push({
        title: 'Non-Primary Residences Cannot Be Licensed in DC',
        detail:
          'Current DC Law 22-559 strictly bars short-term rentals on secondary or inherited properties. DLCP actively audits and penalizes unlicensed listings.',
        iconType: 'legal'
      });
    } else {
      reasons.push({
        title: '2026 Proposed Bill Pending Council Enactment',
        detail:
          'The proposed bill would permit one secondary home license per DC resident, but is not yet active law. Proceeding now would risk DLCP citations.',
        iconType: 'legal'
      });
    }
  } else if (step2.ownershipType === 'entity') {
    reasons.push({
      title: 'Ownership Must Be Held by a Natural Person',
      detail:
        'DC DLCP issues STR licenses solely to individuals. The property deed cannot be held under an LLC or corporate entity.',
      iconType: 'legal'
    });
  } else if (step2.isCondoOrHoa === 'yes') {
    if (step2.hoaAllowsStr === 'yes') {
      reasons.push({
        title: 'HOA Bylaw Approval Accelerates City Licensing',
        detail:
          'Having confirmed condo/HOA rules satisfies the mandatory written permission requirement for your boss.dc.gov license application.',
        iconType: 'legal'
      });
    } else if (step2.hoaAllowsStr === 'not_sure') {
      reasons.push({
        title: 'Written Condo/HOA Verification is the Vital Next Step',
        detail:
          'DC DLCP requires formal written authorization from your condo board or HOA president before issuing your 2-year license.',
        iconType: 'legal'
      });
    } else {
      reasons.push({
        title: 'Condo/HOA Bylaws Prohibit Short-Term Rentals',
        detail:
          'Operating in violation of building rules leads to steep HOA fines, legal action, and immediate revocation of any city permits.',
        iconType: 'legal'
      });
    }
  } else {
    reasons.push({
      title: 'Fee-Simple Primary Residence Fully Compliant',
      detail:
        'As an individual owner-occupant of a fee-simple home, you qualify for an expedited $99 DLCP Basic Business License without HOA review.',
      iconType: 'legal'
    });
  }

  // Ensure exactly 3 reasons
  const finalReasons = reasons.slice(0, 3);

  // 3. BUILD PRINTABLE CHECKLIST OF NEXT STEPS
  const checklist: ChecklistItem[] = [
    {
      id: 'hoa',
      title: 'Get HOA / Condo Board approval in writing',
      description:
        step2.isCondoOrHoa === 'yes'
          ? 'Request a written sign-off from your board president or property manager affirming short-term rentals are allowed under building bylaws (required by DC DLCP).'
          : 'Confirm your fee-simple deed has no restrictive historic or neighborhood covenant limiting rentals (rare in DC, but good practice).',
      isMandatory: step2.isCondoOrHoa === 'yes',
      category: 'legal'
    },
    {
      id: 'insurance',
      title: 'Get dedicated Short-Term Rental Insurance Rider',
      description:
        'Standard homeowner policies exclude commercial lodging activity. Secure a commercial STR rider with at least $500,000–$1,000,000 in liability protection beyond baseline Airbnb AirCover.',
      isMandatory: true,
      category: 'insurance'
    },
    {
      id: 'license',
      title: 'Apply for your license at boss.dc.gov',
      description:
        'Submit for your 2-year DC Basic Business License (BBL) with Short-Term Rental endorsement ($99 fee) via the DC Department of Licensing and Consumer Protection (DLCP) portal.',
      authorityOrUrl: 'https://boss.dc.gov',
      urlText: 'boss.dc.gov',
      isMandatory: true,
      category: 'legal'
    },
    {
      id: 'safety_smoke_co',
      title: 'Install safety items: Smoke & Carbon Monoxide Detectors',
      description:
        'Install working, interconnected smoke detectors in every bedroom and common hallway, plus carbon monoxide detectors on every level with sleeping quarters (DC Fire Code Title 12-H).',
      isMandatory: true,
      category: 'safety'
    },
    {
      id: 'safety_extinguisher',
      title: 'Install safety items: Fire Extinguisher & Emergency Card',
      description:
        'Mount a certified 2A:10B:C fire extinguisher in the kitchen/cooking area, and clearly post an emergency exit route diagram with 24/7 host contact numbers.',
      isMandatory: true,
      category: 'safety'
    },
    {
      id: 'listing_display',
      title: 'Display your DC license number on all listings',
      description:
        'DC law requires publishing your DLCP license number in the first lines of your Airbnb and Vrbo descriptions. Platforms automatically cross-check numbers with city records.',
      isMandatory: true,
      category: 'operations'
    }
  ];

  // Headings & copy per decision
  let headline = '';
  let subtitle = '';
  let badgeLabel = '';
  let badgeColorClass = '';
  let accentBorderClass = '';

  switch (decision) {
    case 'GO':
      headline = 'GO: Strong Green Light for DC Hosting';
      subtitle =
        'Your property, household setup, and market projections demonstrate excellent alignment for a compliant, profitable Airbnb operation in Washington, DC.';
      badgeLabel = 'GO';
      badgeColorClass = 'bg-emerald-600 text-white';
      accentBorderClass = 'border-emerald-500 shadow-emerald-100';
      break;

    case 'GO_WITH_CONDITIONS':
      headline = 'GO WITH CONDITIONS: Favorable with Key Safeguards';
      subtitle =
        'Short-term hosting has solid profit potential for your home, provided you resolve specific verification items and living boundary safeguards before launching.';
      badgeLabel = 'GO WITH CONDITIONS';
      badgeColorClass = 'bg-amber-500 text-white';
      accentBorderClass = 'border-amber-500 shadow-amber-100';
      break;

    case 'HOLD':
      headline = 'HOLD: Hosting is Not Recommended at This Time';
      subtitle =
        'Regulatory barriers (such as non-primary residence status or HOA restrictions) or unfavorable risk-adjusted economics suggest holding off or choosing a 30+ day medium-term lease.';
      badgeLabel = 'HOLD';
      badgeColorClass = 'bg-rose-600 text-white';
      accentBorderClass = 'border-rose-500 shadow-rose-100';
      break;
  }

  return {
    decision,
    headline,
    subtitle,
    badgeLabel,
    badgeColorClass,
    accentBorderClass,
    reasons: finalReasons,
    checklist,
    keyConditions
  };
}
