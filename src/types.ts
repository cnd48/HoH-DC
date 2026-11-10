export type StepId = 'welcome' | 'home' | 'eligibility' | 'earnings' | 'time' | 'processing' | 'verdict';

export interface UserProfile {
  name: string;
  email: string;
}

export interface StepDefinition {
  id: StepId;
  stepNumber: number;
  title: string;
  shortLabel: string;
  description: string;
}

export const ASSESSMENT_STEPS: StepDefinition[] = [
  {
    id: 'home',
    stepNumber: 1,
    title: 'Your Home',
    shortLabel: 'Home',
    description: 'Primary residence status & household setup in DC'
  },
  {
    id: 'eligibility',
    stepNumber: 2,
    title: 'Eligibility',
    shortLabel: 'Eligibility',
    description: 'DC DLCP short-term rental license, HOA, and zoning'
  },
  {
    id: 'earnings',
    stepNumber: 3,
    title: 'Earnings',
    shortLabel: 'Earnings',
    description: 'Projected nightly rates & neighborhood DC market data'
  },
  {
    id: 'time',
    stepNumber: 4,
    title: 'Your Time',
    shortLabel: 'Your Time',
    description: 'Cleaning, turnaround, guest communication & effort'
  },
  {
    id: 'verdict',
    stepNumber: 5,
    title: 'Verdict',
    shortLabel: 'Verdict',
    description: 'Personalized Host vs. Hold recommendation'
  }
];

export type MainResidenceChoice = 'yes' | 'no';

export type HouseholdChoice =
  | 'just_me'
  | 'partner'
  | 'family_children'
  | 'older_relative'
  | 'senior';

export interface Step1Answers {
  isMainResidence: MainResidenceChoice | null;
  householdComposition: HouseholdChoice | null;
}

export type CondoHoaChoice = 'yes' | 'no';
export type HoaRulesChoice = 'yes' | 'no' | 'not_sure';
export type OwnershipChoice = 'personal' | 'entity';
export type LawMode = 'current' | 'proposed_2026';

export interface HouseholdLivingAnswers {
  // Family with children
  hasPrivateEntrance?: 'yes' | 'no' | null;
  sharesKitchenBath?: 'no_private' | 'yes_shared' | null;

  // Older relative / Senior homeowner
  isNoiseAConcern?: 'yes' | 'no' | null;
  managementPreference?: 'self' | 'hire_help' | null;

  // Just me
  travelNightsPerYear?: 'under_30' | '30_to_90' | 'over_90' | null;

  // Me and my partner
  spaceType?: 'spare_room' | 'separate_unit' | 'entire_home_away' | null;
}

export interface Step2Answers {
  isCondoOrHoa: CondoHoaChoice | null;
  hoaAllowsStr: HoaRulesChoice | null;
  ownershipType: OwnershipChoice | null;
  lawMode: LawMode | '';
  householdLiving: HouseholdLivingAnswers;
}

export type EligibilityStatus = 'green' | 'amber' | 'red';

export interface EligibilityResult {
  status: EligibilityStatus;
  headline: string;
  reason: string;
  bulletPoints: string[];
  billDifference: string | null;
  isStatusChangedByBill: boolean;
}

export type RentalSpaceType = 'private_room' | 'basement_unit' | 'whole_home';
export type HostingMode = 'hosted' | 'away';

export interface Step3Answers {
  neighborhood: string;
  spaceType: RentalSpaceType | '';
  hostingMode: HostingMode | '';
  nightlyRate: number;
  occupancyPercent: number; // default 60%
  avgStayLength: number; // default 3 nights
  cleaningCostPerStay: number; // default $60
  monthlyUtilitiesSupplies: number; // default $150
  annualInsurance: number; // default $600
  monthlyMortgage: number; // default $2,800
  monthlyLongTermRent: number; // default $2,200
}

export interface Step4Answers {
  hoursPerWeek: number; // default 0 until selected (5 recommended)
  managementStyle?: 'self' | 'cohost_cleaner';
}

export interface AssessmentState {
  currentStep: StepId;
  user: UserProfile;
  step1: Step1Answers;
  step2: Step2Answers;
  step3: Step3Answers;
  step4: Step4Answers;
  lastUpdated?: string;
}

export const INITIAL_ASSESSMENT_STATE: AssessmentState = {
  currentStep: 'welcome',
  user: {
    name: '',
    email: ''
  },
  step1: {
    isMainResidence: null,
    householdComposition: null
  },
  step2: {
    isCondoOrHoa: null,
    hoaAllowsStr: null,
    ownershipType: null,
    lawMode: '',
    householdLiving: {
      hasPrivateEntrance: null,
      sharesKitchenBath: null,
      isNoiseAConcern: null,
      managementPreference: null,
      travelNightsPerYear: null,
      spaceType: null
    }
  },
  step3: {
    neighborhood: '',
    spaceType: '',
    hostingMode: '',
    nightlyRate: 0,
    occupancyPercent: 60,
    avgStayLength: 3,
    cleaningCostPerStay: 60,
    monthlyUtilitiesSupplies: 150,
    annualInsurance: 600,
    monthlyMortgage: 2800,
    monthlyLongTermRent: 2200
  },
  step4: {
    hoursPerWeek: 0,
    managementStyle: 'self'
  }
};
