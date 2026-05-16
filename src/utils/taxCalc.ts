/**
 * Shared income & deduction computations.
 * Used by LivePreview and Results page.
 */
import type { TaxState } from '../context/TaxContext';

export interface DeductionBreakdown {
  stdDeduction: number;
  hra: number;
  sec80C: number;
  sec80D: number;
  homeLoanSO: number;
  empNPS: number;
  employerNPS: number;
  eduLoan: number;
  profTax: number;
  savInt: number;
  donations: number;
  disability80U: number;
  disability80DD: number;
}

export interface IncomeBreakdown {
  annualInHand: number;
  bonus: number;
  otherIncome: number;
  pfAnnual: number;
  profTax: number;
  grossTotalIncome: number;
}

export interface TaxSummary {
  income: IncomeBreakdown;
  oldDeductions: DeductionBreakdown;
  newDeductions: { stdDeduction: number; employerNPS: number; total: number };
  totalOldDeductions: number;
  taxableOld: number;
  taxableNew: number;
}

export function computeHRA(s: TaxState): number {
  if (!s.receivesHRA || s.monthlyRent <= 0 || s.monthlyHRA <= 0) return 0;
  const bAnn = s.monthlyBasicDA * 12, hAnn = s.monthlyHRA * 12, rAnn = s.monthlyRent * 12;
  return Math.round(Math.min(hAnn, Math.max(0, rAnn - 0.10 * bAnn), bAnn * (s.cityType === 'metro' ? 0.50 : 0.40)));
}

export function compute80C(s: TaxState): number {
  const i = s.investments;
  return Math.min((i.pfMonthly * 12) + i.ppf + i.elss + i.lifeInsurance + i.tuitionFees + i.homeLoanPrincipal + i.nsc + i.ssy + i.other80C, 150000);
}

export function compute80D(s: TaxState): number {
  const h = s.healthInsurance;
  const selfLim = h.selfHasSenior ? 50000 : 25000;
  const parLim = h.parentsAreSenior ? 50000 : 25000;
  return Math.min(h.selfPremium + h.checkupSelf, selfLim) + Math.min(h.parentsPremium + h.checkupParents, parLim);
}

export function computeOtherDeductions(s: TaxState) {
  const od = s.otherDeductions;
  const homeLoanSO = Math.min(od.homeLoanInterestSO, 200000);
  const empNPS = Math.min(od.employeeNPS, 50000);
  const employerNPS = od.employerNPSMonthly * 12;
  const eduLoan = od.educationLoanInterest;
  const profTax = od.professionalTax;
  const isSenior = s.ageGroup === 'senior' || s.ageGroup === 'superSenior';
  const savInt = isSenior ? Math.min(od.savingsInterest, 50000) : Math.min(od.savingsInterest, 10000);
  const donations = od.donations;
  const disability80U = od.hasDisability ? (od.disabilitySevere ? 125000 : 75000) : 0;
  const disability80DD = od.hasDependentDisability ? (od.dependentDisabilitySevere ? 125000 : 75000) : 0;
  return { homeLoanSO, empNPS, employerNPS, eduLoan, profTax, savInt, donations, disability80U, disability80DD };
}

export function computeFullSummary(s: TaxState): TaxSummary {
  const otherIncome = s.otherIncome.fdInterest + s.otherIncome.rdInterest + s.otherIncome.otherInterest;
  const annualInHand = (s.monthlyInHand ?? 0) * 12;
  const bonus = s.bonusIncome;
  const pfAnnual = s.investments.pfMonthly * 12;
  const profTax = s.otherDeductions.professionalTax;
  const hra = computeHRA(s);
  const sec80C = compute80C(s);
  const sec80D = compute80D(s);
  const od = computeOtherDeductions(s);

  // Employer NPS forms part of gross salary before being claimed as a deduction
  const grossTotalIncome = annualInHand + bonus + otherIncome + pfAnnual + profTax + od.employerNPS;

  const stdDedOld = 50000;
  const stdDedNew = 75000;

  const totalOld = stdDedOld + hra + sec80C + sec80D + od.homeLoanSO + od.empNPS + od.employerNPS + od.eduLoan + od.profTax + od.savInt + od.donations + od.disability80U + od.disability80DD;
  const taxableOld = Math.max(0, grossTotalIncome - totalOld);

  const newTotal = stdDedNew + od.employerNPS;
  const taxableNew = Math.max(0, grossTotalIncome - newTotal);

  return {
    income: { annualInHand, bonus, otherIncome, pfAnnual, profTax, grossTotalIncome },
    oldDeductions: { stdDeduction: stdDedOld, hra, sec80C, sec80D, homeLoanSO: od.homeLoanSO, empNPS: od.empNPS, employerNPS: od.employerNPS, eduLoan: od.eduLoan, profTax: od.profTax, savInt: od.savInt, donations: od.donations, disability80U: od.disability80U, disability80DD: od.disability80DD },
    newDeductions: { stdDeduction: stdDedNew, employerNPS: od.employerNPS, total: newTotal },
    totalOldDeductions: totalOld,
    taxableOld,
    taxableNew,
  };
}
