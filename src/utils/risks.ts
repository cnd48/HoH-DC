import { Step1Answers, Step2Answers, Step3Answers } from '../types';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskCategory {
  id: 'neighbor' | 'wear' | 'fines' | 'income';
  title: string;
  level: RiskLevel;
  score: number; // 0 to 100
  headline: string;
  reasons: string[];
  mitigations: string[];
}

export interface RiskEvaluationResult {
  categories: RiskCategory[];
  overallRiskLevel: RiskLevel;
}

export function calculateRiskEvaluation(
  step1: Step1Answers,
  step2: Step2Answers,
  step3: Step3Answers
): RiskEvaluationResult {
  const living = step2.householdLiving || {};

  // 1. NEIGHBOR COMPLAINTS RISK
  let neighborScore = 20; // baseline
  const neighborReasons: string[] = [];
  const neighborMitigations: string[] = [];

  // Condo / HOA factor
  if (step2.isCondoOrHoa === 'yes') {
    neighborScore += 25;
    if (step2.hoaAllowsStr === 'yes') {
      neighborReasons.push('Condo/HOA allows STRs, but shared elevators and hallways increase neighbor visibility.');
    } else if (step2.hoaAllowsStr === 'not_sure') {
      neighborReasons.push('Unverified HOA bylaws create high vulnerability to neighbor reports to building management.');
    } else {
      neighborReasons.push('HOA bylaws prohibit STRs; neighbors can easily report listings directly to property management.');
    }
  } else {
    neighborScore -= 10;
    neighborReasons.push('Fee-simple detached/rowhouse property has no HOA board or shared condo corridors.');
  }

  // Household & entrance factors (Prompt explicitly: "higher privacy risk for a family without a separate entrance")
  if (step1.householdComposition === 'family_children') {
    if (living.hasPrivateEntrance === 'no') {
      neighborScore += 30;
      neighborReasons.push('Family with children without a separate entrance: Guests walk through family living areas, increasing hallway noise and privacy friction.');
    } else {
      neighborReasons.push('Dedicated private entrance keeps family routines and guest arrivals physically separated.');
    }

    if (living.sharesKitchenBath === 'yes_shared') {
      neighborScore += 25;
      neighborReasons.push('Shared kitchen or bathroom increases noise during morning and evening rush hours.');
    }
  } else if (step1.householdComposition === 'older_relative' || step1.householdComposition === 'senior') {
    if (living.isNoiseAConcern === 'yes') {
      neighborScore += 20;
      neighborReasons.push('Sensitive household members noted noise is a primary concern with late-night guest arrivals.');
    }
  }

  // Turnover frequency & space type
  if (step3.spaceType === 'whole_home' && step3.avgStayLength <= 2) {
    neighborScore += 20;
    neighborReasons.push('Frequent weekend turnovers (1-2 night stays) elevate roller-bag noise and unfamiliar faces on the block.');
  } else if (step3.spaceType === 'basement_unit') {
    neighborScore -= 10;
    neighborReasons.push('English basements are standard in DC and minimize sound transfer to neighboring homes.');
  }

  neighborScore = Math.min(100, Math.max(10, neighborScore));
  const neighborLevel: RiskLevel = neighborScore >= 60 ? 'high' : neighborScore >= 35 ? 'medium' : 'low';

  if (neighborLevel !== 'low') {
    neighborMitigations.push('Install a Minut noise sensor (detects decibels without recording audio) to curb late-night parties.');
    neighborMitigations.push('Enforce 10:00 PM quiet hours and prohibit outdoor porch gatherings after dark.');
    neighborMitigations.push('Provide neighbors with your direct cell phone before listing so they contact you rather than 311.');
  } else {
    neighborMitigations.push('Continue maintaining clear house rules and responsive on-site communication.');
  }

  // 2. WEAR ON THE HOME RISK
  let wearScore = 20; // baseline
  const wearReasons: string[] = [];
  const wearMitigations: string[] = [];

  if (step3.spaceType === 'whole_home') {
    wearScore += 35;
    wearReasons.push('Whole-home rental gives guests unsupervised access to all kitchen appliances, furniture, and plumbing.');
  } else if (step3.spaceType === 'basement_unit') {
    wearScore += 15;
    wearReasons.push('Self-contained basement apartment concentrates foot traffic to tiled or engineered floors.');
  } else {
    wearScore -= 15;
    wearReasons.push('Private room setup restricts guest footprint to a single bedroom and designated bath.');
  }

  // Occupancy rate & turnovers
  if (step3.occupancyPercent >= 70) {
    wearScore += 25;
    wearReasons.push(`High occupancy (${step3.occupancyPercent}%) means over 250 days of active residential usage per year.`);
  } else if (step3.occupancyPercent <= 40) {
    wearScore -= 10;
    wearReasons.push(`Moderate occupancy (${step3.occupancyPercent}%) leaves ample buffer time between reservations.`);
  }

  if (step3.avgStayLength <= 2) {
    wearScore += 20;
    wearReasons.push('Rapid 1-2 night turnovers multiply luggage wheel scuffs, sheet wash cycles, and door lock usage.');
  } else if (step3.avgStayLength >= 5) {
    wearScore -= 15;
    wearReasons.push('Longer stays (5+ nights) dramatically reduce turnover frequency and wear per booking dollar.');
  }

  if (step3.hostingMode === 'away') {
    wearScore += 10;
    wearReasons.push('Unhosted stays mean wear-and-tear cannot be spotted or corrected until you return.');
  }

  wearScore = Math.min(100, Math.max(10, wearScore));
  const wearLevel: RiskLevel = wearScore >= 60 ? 'high' : wearScore >= 35 ? 'medium' : 'low';

  if (wearLevel !== 'low') {
    wearMitigations.push('Require a 2 or 3-night minimum stay to cut annual guest turns in half.');
    wearMitigations.push('Lock owner closets and secure high-value personal items and sentimental decor.');
    wearMitigations.push('Maintain a $500 security deposit requirement through Airbnb AirCover.');
  } else {
    wearMitigations.push('Standard quarterly deep-cleans and mattress protectors are sufficient.');
  }

  // 3. FINES FOR HOSTING WITHOUT A LICENSE
  let finesScore = 15; // baseline
  const finesReasons: string[] = [];
  const finesMitigations: string[] = [];

  if (step1.isMainResidence === 'no') {
    if (step2.lawMode === 'current') {
      finesScore = 95; // strictly illegal under current law
      finesReasons.push('Current DC Law 22-559 strictly prohibits short-term rentals in non-primary or second residences. Operating without an owner-occupant license incurs civil fines starting at $1,000 up to $5,000 per violation.');
    } else {
      finesScore = 65;
      finesReasons.push('Under the proposed 2026 bill, second-home licensing would be allowed, but the bill is currently pending Council approval and not yet enacted law.');
    }
  } else {
    finesReasons.push('Primary residence status satisfies DC DLCP statutory eligibility requirements.');
  }

  if (step2.ownershipType === 'entity') {
    finesScore = Math.max(finesScore, 90);
    finesReasons.push('DC law strictly mandates that STR licenses are issued exclusively to natural persons, not LLCs, corporations, or institutional trusts.');
  }

  if (step2.isCondoOrHoa === 'yes') {
    if (step2.hoaAllowsStr === 'no') {
      finesScore = Math.max(finesScore, 85);
      finesReasons.push('Operating contrary to HOA covenants can trigger building fines, attorney fees, and city licensing revocation.');
    } else if (step2.hoaAllowsStr === 'not_sure') {
      finesScore = Math.max(finesScore, 45);
      finesReasons.push('DC DLCP requires written HOA/condo board confirmation; unverified rules carry audit risk.');
    }
  }

  if (step3.hostingMode === 'away') {
    finesReasons.push('DC Vacation Rental endorsement is legally capped at 90 nights per year. Exceeding 90 nights invites automated DLCP platform sanctions.');
  }

  finesScore = Math.min(100, Math.max(10, finesScore));
  const finesLevel: RiskLevel = finesScore >= 60 ? 'high' : finesScore >= 35 ? 'medium' : 'low';

  if (finesLevel === 'high') {
    finesMitigations.push('Do NOT list on Airbnb until primary residence or corporate ownership title is resolved.');
    finesMitigations.push('Consider 30+ day medium-term rentals (travel nurses, Capitol Hill fellows) which are exempt from DC STR licensing.');
  } else if (finesLevel === 'medium') {
    finesMitigations.push('Obtain written authorization from your condo/HOA president before submitting your DLCP application.');
    finesMitigations.push('Apply for your $99 DC Basic Business License (BBL) with STR endorsement through dlcp.dc.gov.');
  } else {
    finesMitigations.push('File your 2-year DLCP license ($99) and display your license number clearly in your Airbnb listing description.');
  }

  // 4. INCOME UPS AND DOWNS (VOLATILITY)
  let incomeScore = 20; // baseline
  const incomeReasons: string[] = [];
  const incomeMitigations: string[] = [];

  if (step3.hostingMode === 'away') {
    incomeScore += 35;
    incomeReasons.push('Away hosting is legally capped at 90 nights in DC, leaving 275 days unrented unless you switch to 30-day corporate leases.');
    if (living.travelNightsPerYear === 'under_30') {
      incomeScore += 25;
      incomeReasons.push('You indicated traveling under 30 nights/year, making it difficult to hit revenue targets without vacating your home.');
    }
  } else {
    incomeReasons.push('Hosted status enables year-round bookings without the 90-night annual ceiling.');
  }

  if (step3.spaceType === 'whole_home') {
    incomeScore += 15;
    incomeReasons.push('Whole-home revenue in DC heavily concentrates during April (Cherry Blossoms) and May, dropping in January/February.');
  } else {
    incomeScore -= 10;
    incomeReasons.push('Private room and basement rentals maintain stable demand from solo professionals and government interns year-round.');
  }

  if (step3.occupancyPercent >= 75) {
    incomeScore += 15;
    incomeReasons.push('Aggressive 75%+ occupancy assumption leaves little margin for seasonal weather downturns or government recess lulls.');
  }

  incomeScore = Math.min(100, Math.max(10, incomeScore));
  const incomeLevel: RiskLevel = incomeScore >= 60 ? 'high' : incomeScore >= 35 ? 'medium' : 'low';

  if (incomeLevel !== 'low') {
    incomeMitigations.push('Implement dynamic pricing (e.g., PriceLabs or Wheelhouse) to capture high peak-month premiums and discount slow winter weeks.');
    incomeMitigations.push('Offer 30-to-90 day mid-term stays in January/February to stabilize winter cashflow.');
    incomeMitigations.push('Keep a 3-month operating reserve for utilities and cleaning fees during off-peak periods.');
  } else {
    incomeMitigations.push('Maintain competitive weekday rates to secure steady business travel bookings.');
  }

  const categories: RiskCategory[] = [
    {
      id: 'neighbor',
      title: 'Neighbor Complaints',
      level: neighborLevel,
      score: neighborScore,
      headline:
        neighborLevel === 'high'
          ? 'Elevated Neighbor Friction'
          : neighborLevel === 'medium'
          ? 'Moderate Neighbor Sensitivity'
          : 'Low Neighbor Risk',
      reasons: neighborReasons,
      mitigations: neighborMitigations
    },
    {
      id: 'wear',
      title: 'Wear on the Home',
      level: wearLevel,
      score: wearScore,
      headline:
        wearLevel === 'high'
          ? 'High Foot Traffic & Wear'
          : wearLevel === 'medium'
          ? 'Standard Residential Wear'
          : 'Low Wear & Tear Footprint',
      reasons: wearReasons,
      mitigations: wearMitigations
    },
    {
      id: 'fines',
      title: 'Fines for Hosting Without a License',
      level: finesLevel,
      score: finesScore,
      headline:
        finesLevel === 'high'
          ? 'Severe DC DLCP Penalty Exposure'
          : finesLevel === 'medium'
          ? 'Licensing Audit & Verification Exposure'
          : 'Low Legal & Fine Exposure',
      reasons: finesReasons,
      mitigations: finesMitigations
    },
    {
      id: 'income',
      title: 'Income Ups and Downs',
      level: incomeLevel,
      score: incomeScore,
      headline:
        incomeLevel === 'high'
          ? 'High Revenue Volatility & Caps'
          : incomeLevel === 'medium'
          ? 'Moderate Seasonal Fluctuation'
          : 'Consistent Cashflow Stability',
      reasons: incomeReasons,
      mitigations: incomeMitigations
    }
  ];

  const highCount = categories.filter((c) => c.level === 'high').length;
  const mediumCount = categories.filter((c) => c.level === 'medium').length;
  const overallRiskLevel: RiskLevel =
    highCount >= 2 || categories.find((c) => c.id === 'fines')?.level === 'high'
      ? 'high'
      : highCount === 1 || mediumCount >= 2
      ? 'medium'
      : 'low';

  return {
    categories,
    overallRiskLevel
  };
}
