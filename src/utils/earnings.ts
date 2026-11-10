import { Step3Answers } from '../types';

export interface EarningsCalculationResult {
  bookedNights: number;
  numStays: number;
  yearlyGrossRevenue: number;
  airbnbFee: number;
  yearlyCleaning: number;
  yearlyUtilities: number;
  yearlyInsurance: number;
  yearlyLicense: number;
  totalExpenses: number;
  netIncome: number;
  monthlyNetIncome: number;
  annualMortgage: number;
  mortgageCoveragePercent: number;
  longTermAnnualIncome: number;
  netDifferenceVsLongTerm: number;
  effectiveHourlyRate: (hoursPerWeek: number) => number;
}

export function calculateNetEarnings(answers: Step3Answers): EarningsCalculationResult {
  const isAway = answers.hostingMode === 'away';
  const rawBookedNights = Math.round(365 * (answers.occupancyPercent / 100));
  // In away mode, DC law 22-559 strictly caps unhosted vacation rentals at 90 nights per year
  const bookedNights = isAway ? Math.min(rawBookedNights, 90) : rawBookedNights;
  const numStays = Math.max(1, Math.ceil(bookedNights / (answers.avgStayLength || 3)));

  // Revenues & Deductions
  const yearlyGrossRevenue = bookedNights * answers.nightlyRate;
  const airbnbFee = Math.round(yearlyGrossRevenue * 0.03); // 3% host split fee
  const yearlyCleaning = numStays * answers.cleaningCostPerStay;
  const yearlyUtilities = answers.monthlyUtilitiesSupplies * 12;
  const yearlyInsurance = answers.annualInsurance;
  const yearlyLicense = 50; // $50/year ($99 for 2-year DC DLCP license amortized)

  const totalExpenses =
    airbnbFee + yearlyCleaning + yearlyUtilities + yearlyInsurance + yearlyLicense;
  const netIncome = Math.max(0, yearlyGrossRevenue - totalExpenses);
  const monthlyNetIncome = Math.round(netIncome / 12);

  // Mortgage & Coverage
  const annualMortgage = answers.monthlyMortgage * 12;
  const mortgageCoveragePercent =
    annualMortgage > 0 ? Math.round((netIncome / annualMortgage) * 100) : 0;

  // Comparison with Long Term Rent
  const longTermAnnualIncome = answers.monthlyLongTermRent * 12;
  const netDifferenceVsLongTerm = netIncome - longTermAnnualIncome;

  const effectiveHourlyRate = (hoursPerWeek: number): number => {
    const yearlyHours = Math.max(1, hoursPerWeek * 52);
    return Math.round(netIncome / yearlyHours);
  };

  return {
    bookedNights,
    numStays,
    yearlyGrossRevenue,
    airbnbFee,
    yearlyCleaning,
    yearlyUtilities,
    yearlyInsurance,
    yearlyLicense,
    totalExpenses,
    netIncome,
    monthlyNetIncome,
    annualMortgage,
    mortgageCoveragePercent,
    longTermAnnualIncome,
    netDifferenceVsLongTerm,
    effectiveHourlyRate
  };
}
