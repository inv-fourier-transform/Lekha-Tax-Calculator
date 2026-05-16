import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';

/**
 * TaxState — PRD §7.3
 * Global state for the tax wizard.
 */
export interface TaxState {
  // Step 1
  monthlyInHand: number | null;

  // Step 2
  ageGroup: 'below60' | 'senior' | 'superSenior' | null;

  // Step 3
  bonusIncome: number;

  // Step 4
  monthlyRent: number;
  receivesHRA: boolean;
  monthlyHRA: number;
  monthlyBasicDA: number;
  cityType: 'metro' | 'nonMetro';

  // Step 5
  investments: {
    pfMonthly: number;
    ppf: number;
    lifeInsurance: number;
    elss: number;
    tuitionFees: number;
    homeLoanPrincipal: number;
    nsc: number;
    ssy: number;
    other80C: number;
  };

  // Step 6
  healthInsurance: {
    selfPremium: number;
    selfHasSenior: boolean;
    parentsPremium: number;
    parentsAreSenior: boolean;
    checkupSelf: number;
    checkupParents: number;
  };

  // Step 7
  otherDeductions: {
    homeLoanInterestSO: number;
    homeLoanInterestLO: number;
    employeeNPS: number;
    employerNPSMonthly: number;
    employerNPSBasicDA: number;
    educationLoanInterest: number;
    professionalTax: number;
    savingsInterest: number;
    donations: number;
    rentWithoutHRA: number;
    hasDisability: boolean;
    disabilitySevere: boolean;
    hasDependentDisability: boolean;
    dependentDisabilitySevere: boolean;
  };

  // Step 8
  otherIncome: {
    fdInterest: number;
    rdInterest: number;
    otherInterest: number;
  };

  // UI State
  currentStep: number;
  eli21Mode: boolean;
}

const initialState: TaxState = {
  monthlyInHand: null,
  ageGroup: null,
  bonusIncome: 0,

  monthlyRent: 0,
  receivesHRA: false,
  monthlyHRA: 0,
  monthlyBasicDA: 0,
  cityType: 'nonMetro',

  investments: {
    pfMonthly: 0,
    ppf: 0,
    lifeInsurance: 0,
    elss: 0,
    tuitionFees: 0,
    homeLoanPrincipal: 0,
    nsc: 0,
    ssy: 0,
    other80C: 0,
  },

  healthInsurance: {
    selfPremium: 0,
    selfHasSenior: false,
    parentsPremium: 0,
    parentsAreSenior: false,
    checkupSelf: 0,
    checkupParents: 0,
  },

  otherDeductions: {
    homeLoanInterestSO: 0,
    homeLoanInterestLO: 0,
    employeeNPS: 0,
    employerNPSMonthly: 0,
    employerNPSBasicDA: 0,
    educationLoanInterest: 0,
    professionalTax: 0,
    savingsInterest: 0,
    donations: 0,
    rentWithoutHRA: 0,
    hasDisability: false,
    disabilitySevere: false,
    hasDependentDisability: false,
    dependentDisabilitySevere: false,
  },

  otherIncome: {
    fdInterest: 0,
    rdInterest: 0,
    otherInterest: 0,
  },

  currentStep: 1,
  eli21Mode: false,
};

// ---- Action Types ----
export type TaxAction =
  | { type: 'SET_MONTHLY_IN_HAND'; payload: number | null }
  | { type: 'SET_AGE_GROUP'; payload: TaxState['ageGroup'] }
  | { type: 'SET_BONUS_INCOME'; payload: number }
  | { type: 'SET_RENT_HRA'; payload: Partial<Pick<TaxState, 'monthlyRent' | 'receivesHRA' | 'monthlyHRA' | 'monthlyBasicDA' | 'cityType'>> }
  | { type: 'SET_INVESTMENTS'; payload: Partial<TaxState['investments']> }
  | { type: 'SET_HEALTH_INSURANCE'; payload: Partial<TaxState['healthInsurance']> }
  | { type: 'SET_OTHER_DEDUCTIONS'; payload: Partial<TaxState['otherDeductions']> }
  | { type: 'SET_OTHER_INCOME'; payload: Partial<TaxState['otherIncome']> }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'TOGGLE_ELI21' }
  | { type: 'RESET' };

function taxReducer(state: TaxState, action: TaxAction): TaxState {
  switch (action.type) {
    case 'SET_MONTHLY_IN_HAND':
      return { ...state, monthlyInHand: action.payload };
    case 'SET_AGE_GROUP':
      return { ...state, ageGroup: action.payload };
    case 'SET_BONUS_INCOME':
      return { ...state, bonusIncome: action.payload };
    case 'SET_RENT_HRA':
      return { ...state, ...action.payload };
    case 'SET_INVESTMENTS':
      return { ...state, investments: { ...state.investments, ...action.payload } };
    case 'SET_HEALTH_INSURANCE':
      return { ...state, healthInsurance: { ...state.healthInsurance, ...action.payload } };
    case 'SET_OTHER_DEDUCTIONS':
      return { ...state, otherDeductions: { ...state.otherDeductions, ...action.payload } };
    case 'SET_OTHER_INCOME':
      return { ...state, otherIncome: { ...state.otherIncome, ...action.payload } };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, 8) };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };
    case 'TOGGLE_ELI21':
      return { ...state, eli21Mode: !state.eli21Mode };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

// ---- Context ----
const TaxStateContext = createContext<TaxState | null>(null);
const TaxDispatchContext = createContext<Dispatch<TaxAction> | null>(null);

export function TaxProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taxReducer, initialState);

  return (
    <TaxStateContext.Provider value={state}>
      <TaxDispatchContext.Provider value={dispatch}>
        {children}
      </TaxDispatchContext.Provider>
    </TaxStateContext.Provider>
  );
}

export function useTaxState(): TaxState {
  const ctx = useContext(TaxStateContext);
  if (!ctx) throw new Error('useTaxState must be inside TaxProvider');
  return ctx;
}

export function useTaxDispatch(): Dispatch<TaxAction> {
  const ctx = useContext(TaxDispatchContext);
  if (!ctx) throw new Error('useTaxDispatch must be inside TaxProvider');
  return ctx;
}
