import { useState } from 'react';
import { useTaxState, useTaxDispatch } from '../../context/TaxContext';
import { formatIndianNumber } from '../../utils/formatCurrency';
import FAQ from '../FAQ';

interface DeductionField {
  key: string;
  stateKey: keyof ReturnType<typeof useTaxState>['otherDeductions'];
  label: string;
  subtitle?: string;
  showIf?: (s: ReturnType<typeof useTaxState>) => boolean;
  isToggle?: boolean;
  toggleLabel?: string;
}

const FIELDS: DeductionField[] = [
  { key: 'homeLoanInterestSO', stateKey: 'homeLoanInterestSO', label: 'Home Loan Interest (Self-Occupied)', subtitle: 'Max Rs. 2,00,000 deduction under old regime' },
  { key: 'employeeNPS', stateKey: 'employeeNPS', label: 'Your NPS Contribution', subtitle: 'Up to Rs. 50,000 extra deduction (80CCD(1B))' },
  { key: 'employerNPSMonthly', stateKey: 'employerNPSMonthly', label: 'Employer NPS (Monthly)', subtitle: 'Available in BOTH regimes (80CCD(2))' },
  { key: 'educationLoanInterest', stateKey: 'educationLoanInterest', label: 'Education Loan Interest (80E)', subtitle: 'No limit on deduction amount' },
  { key: 'professionalTax', stateKey: 'professionalTax', label: 'Professional Tax', subtitle: 'Usually Rs. 2,400-2,500/year' },
  { key: 'savingsInterest', stateKey: 'savingsInterest', label: 'Savings Account Interest', subtitle: 'Up to Rs. 10,000 deductible (80TTA)', showIf: s => s.ageGroup !== 'senior' && s.ageGroup !== 'superSenior' },
  { key: 'seniorInterest', stateKey: 'savingsInterest', label: 'Interest from Savings/FDs (80TTB)', subtitle: 'Up to Rs. 50,000 for senior citizens', showIf: s => s.ageGroup === 'senior' || s.ageGroup === 'superSenior' },
  { key: 'donations', stateKey: 'donations', label: 'Donations to Charities (80G)', subtitle: 'Enter total eligible donation amount' },
];

/**
 * Step 7 — Loans, NPS & Other Deductions (PRD §3.1 Step 7)
 */
export default function Step7Deductions() {
  const state = useTaxState();
  const dispatch = useTaxDispatch();
  const od = state.otherDeductions;

  const [displays, setDisplays] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    FIELDS.forEach(f => {
      const val = od[f.stateKey];
      if (typeof val === 'number') init[f.key] = val > 0 ? formatIndianNumber(val) : '';
    });
    return init;
  });

  const handleNum = (key: string, stateKey: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw === '') { setDisplays(p => ({ ...p, [key]: '' })); dispatch({ type: 'SET_OTHER_DEDUCTIONS', payload: { [stateKey]: 0 } }); return; }
    const num = parseInt(raw, 10);
    setDisplays(p => ({ ...p, [key]: formatIndianNumber(num) }));
    dispatch({ type: 'SET_OTHER_DEDUCTIONS', payload: { [stateKey]: num } });
  };

  const faqItems = [
    { question: 'Home loan interest — self-occupied vs let-out?', answer: 'Self-occupied: old regime only, max Rs. 2 lakh. Let-out: both regimes, but new regime doesn\'t allow set-off.' },
    { question: 'What is NPS?', answer: 'National Pension System. Your employer may contribute. You can also contribute extra for tax saving.' },
    { question: "I don't know my professional tax.", answer: "It's usually Rs. 2,400–2,500/year. Check your payslip." },
  ];

  return (
    <div className="step">
      <div className="step__question">A few more things that can save tax</div>
      <p className="step__subtitle">Check the ones that apply to you. Skip what doesn't.</p>

      <div className="step__input-group">
        {FIELDS.filter(f => !f.showIf || f.showIf(state)).map(f => (
          <div key={f.key} className="step__deduction-item">
            <label className="step__label">{f.label}</label>
            {f.subtitle && <span className="step__hint step__hint--subtle">{f.subtitle}</span>}
            <div className="currency-input currency-input--sm">
              <span className="currency-input__prefix">Rs.</span>
              <input type="text" inputMode="numeric" className="currency-input__field" placeholder="0"
                value={displays[f.key] || ''} onChange={handleNum(f.key, f.stateKey)}
                aria-label={f.label} autoComplete="off" />
            </div>
            {f.stateKey === 'employerNPSMonthly' && od.employerNPSMonthly > 0 && (
              <span className="step__hint">= Rs. {formatIndianNumber(od.employerNPSMonthly * 12)}/year</span>
            )}
          </div>
        ))}

        {/* Disability toggles */}
        <div className="step__deduction-item">
          <div className="step__toggle-row">
            <label className="step__label" style={{ marginBottom: 0 }}>I have a disability (80U)</label>
            <button type="button" className={`toggle ${od.hasDisability ? 'toggle--on' : ''}`}
              onClick={() => dispatch({ type: 'SET_OTHER_DEDUCTIONS', payload: { hasDisability: !od.hasDisability } })}
              role="switch" aria-checked={od.hasDisability}><span className="toggle__knob" /></button>
          </div>
          {od.hasDisability && (
            <div className="step__toggle-row" style={{ marginTop: '8px' }}>
              <label className="step__label" style={{ marginBottom: 0 }}>Severe disability (≥ 80%)?</label>
              <button type="button" className={`toggle ${od.disabilitySevere ? 'toggle--on' : ''}`}
                onClick={() => dispatch({ type: 'SET_OTHER_DEDUCTIONS', payload: { disabilitySevere: !od.disabilitySevere } })}
                role="switch" aria-checked={od.disabilitySevere}><span className="toggle__knob" /></button>
            </div>
          )}
        </div>

        <div className="step__deduction-item">
          <div className="step__toggle-row">
            <label className="step__label" style={{ marginBottom: 0 }}>Disabled dependent (80DD)</label>
            <button type="button" className={`toggle ${od.hasDependentDisability ? 'toggle--on' : ''}`}
              onClick={() => dispatch({ type: 'SET_OTHER_DEDUCTIONS', payload: { hasDependentDisability: !od.hasDependentDisability } })}
              role="switch" aria-checked={od.hasDependentDisability}><span className="toggle__knob" /></button>
          </div>
          {od.hasDependentDisability && (
            <div className="step__toggle-row" style={{ marginTop: '8px' }}>
              <label className="step__label" style={{ marginBottom: 0 }}>Severe disability (≥ 80%)?</label>
              <button type="button" className={`toggle ${od.dependentDisabilitySevere ? 'toggle--on' : ''}`}
                onClick={() => dispatch({ type: 'SET_OTHER_DEDUCTIONS', payload: { dependentDisabilitySevere: !od.dependentDisabilitySevere } })}
                role="switch" aria-checked={od.dependentDisabilitySevere}><span className="toggle__knob" /></button>
            </div>
          )}
        </div>
      </div>
      <FAQ items={faqItems} />
    </div>
  );
}
