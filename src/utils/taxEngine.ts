/**
 * Tax Computation Engine — PRD §4.4
 * FY 2026-27 (AY 2027-28)
 * Pure functions, no side-effects.
 */

// ---- Types ----

export interface SlabDetail {
  from: number;
  to: number | null; // null = no upper limit
  rate: number; // e.g. 0.05 = 5%
  incomeInSlab: number;
  taxFromSlab: number;
}

export interface TaxResult {
  taxableIncome: number;
  slabs: SlabDetail[];
  taxBeforeRebate: number;
  rebate87A: number;
  taxAfterRebate: number;
  surcharge: number;
  cess: number;
  totalTax: number;
}

// ---- Slab Definitions ----

const NEW_REGIME_SLABS: [number, number | null, number][] = [
  [0, 400000, 0],
  [400000, 800000, 0.05],
  [800000, 1200000, 0.10],
  [1200000, 1600000, 0.15],
  [1600000, 2000000, 0.20],
  [2000000, 2400000, 0.25],
  [2400000, null, 0.30],
];

const OLD_REGIME_BELOW60: [number, number | null, number][] = [
  [0, 250000, 0],
  [250000, 500000, 0.05],
  [500000, 1000000, 0.20],
  [1000000, null, 0.30],
];

const OLD_REGIME_SENIOR: [number, number | null, number][] = [
  [0, 300000, 0],
  [300000, 500000, 0.05],
  [500000, 1000000, 0.20],
  [1000000, null, 0.30],
];

const OLD_REGIME_SUPER_SENIOR: [number, number | null, number][] = [
  [0, 500000, 0],
  [500000, 1000000, 0.20],
  [1000000, null, 0.30],
];

function getOldSlabs(age: 'below60' | 'senior' | 'superSenior') {
  switch (age) {
    case 'senior': return OLD_REGIME_SENIOR;
    case 'superSenior': return OLD_REGIME_SUPER_SENIOR;
    default: return OLD_REGIME_BELOW60;
  }
}

// ---- Core Computation ----

function computeSlabTax(taxableIncome: number, slabDefs: [number, number | null, number][]): { slabs: SlabDetail[]; total: number } {
  const slabs: SlabDetail[] = [];
  let total = 0;

  for (const [from, to, rate] of slabDefs) {
    if (taxableIncome <= from) {
      slabs.push({ from, to, rate, incomeInSlab: 0, taxFromSlab: 0 });
      continue;
    }
    const upper = to === null ? taxableIncome : Math.min(taxableIncome, to);
    const incomeInSlab = upper - from;
    const taxFromSlab = Math.round(incomeInSlab * rate);
    total += taxFromSlab;
    slabs.push({ from, to, rate, incomeInSlab, taxFromSlab });
  }

  return { slabs, total };
}

/**
 * Compute tax for a given taxable income under a specific regime.
 *
 * PRD §4.4:
 * - Rebate 87A (New): ₹60,000 if taxable ≤ ₹12,00,000
 * - Rebate 87A (Old): ₹12,500 if taxable ≤ ₹5,00,000
 * - Marginal relief: If income barely exceeds the rebate threshold,
 *   tax is capped so take-home doesn't drop below the threshold case.
 * - Cess: 4% on tax after rebate
 */
export function computeTax(
  taxableIncome: number,
  regime: 'old' | 'new',
  age: 'below60' | 'senior' | 'superSenior'
): TaxResult {
  const slabDefs = regime === 'new' ? NEW_REGIME_SLABS : getOldSlabs(age);
  const { slabs, total: taxBeforeRebate } = computeSlabTax(taxableIncome, slabDefs);

  // Rebate §87A
  let rebate87A = 0;
  let taxAfterRebate = taxBeforeRebate;

  if (regime === 'new') {
    if (taxableIncome <= 1200000) {
      rebate87A = Math.min(taxBeforeRebate, 60000);
      taxAfterRebate = taxBeforeRebate - rebate87A;
    } else {
      // Marginal relief: tax should not exceed (income - 12,00,000)
      const excess = taxableIncome - 1200000;
      if (taxBeforeRebate > excess) {
        // Apply marginal relief — tax = excess, rebate = difference
        rebate87A = taxBeforeRebate - excess;
        taxAfterRebate = excess;
      }
    }
  } else {
    // Old regime
    if (taxableIncome <= 500000) {
      rebate87A = Math.min(taxBeforeRebate, 12500);
      taxAfterRebate = taxBeforeRebate - rebate87A;
    } else {
      // Marginal relief for old regime
      const excess = taxableIncome - 500000;
      if (taxBeforeRebate > 0 && taxBeforeRebate - 12500 > 0) {
        const taxWithoutRebate = taxBeforeRebate;
        const taxWithRebate = Math.max(0, taxWithoutRebate - 12500);
        if (taxWithRebate > excess) {
          rebate87A = taxBeforeRebate - excess;
          taxAfterRebate = excess;
        }
      }
    }
  }

  // Surcharge (not applicable for income ≤ ₹50L per PRD scope)
  const surcharge = 0;

  // Cess @ 4%
  const cess = Math.round((taxAfterRebate + surcharge) * 0.04);
  const totalTax = taxAfterRebate + surcharge + cess;

  return {
    taxableIncome,
    slabs,
    taxBeforeRebate,
    rebate87A,
    taxAfterRebate,
    surcharge,
    cess,
    totalTax,
  };
}
