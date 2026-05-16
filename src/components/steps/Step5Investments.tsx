import { useState } from 'react';
import { useTaxState, useTaxDispatch } from '../../context/TaxContext';
import { formatIndianNumber } from '../../utils/formatCurrency';
import FAQ from '../FAQ';

const FIELDS: { key: keyof ReturnType<typeof useTaxState>['investments']; label: string; placeholder: string; monthly?: boolean }[] = [
  { key: 'pfMonthly', label: 'Employee PF (Monthly)', placeholder: '1,800', monthly: true },
  { key: 'ppf', label: 'PPF', placeholder: '0' },
  { key: 'elss', label: 'ELSS Mutual Funds', placeholder: '0' },
  { key: 'lifeInsurance', label: 'Life Insurance Premium', placeholder: '0' },
  { key: 'tuitionFees', label: 'Children Tuition Fees', placeholder: '0' },
  { key: 'homeLoanPrincipal', label: 'Home Loan Principal', placeholder: '0' },
  { key: 'nsc', label: 'NSC / Tax-Saver FD', placeholder: '0' },
  { key: 'ssy', label: 'Sukanya Samriddhi (SSY)', placeholder: '0' },
  { key: 'other80C', label: 'Other 80C', placeholder: '0' },
];

const CAP = 150000;

/**
 * Step 5 — Investments / 80C (PRD §3.1 Step 5)
 */
export default function Step5Investments() {
  const state = useTaxState();
  const dispatch = useTaxDispatch();

  // Local display values
  const [displays, setDisplays] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    FIELDS.forEach(f => {
      const val = state.investments[f.key];
      init[f.key] = val > 0 ? formatIndianNumber(val) : '';
    });
    return init;
  });

  const getTotal = () => {
    const inv = state.investments;
    return (inv.pfMonthly * 12) + inv.ppf + inv.elss + inv.lifeInsurance +
      inv.tuitionFees + inv.homeLoanPrincipal + inv.nsc + inv.ssy + inv.other80C;
  };

  const total = getTotal();
  const effective = Math.min(total, CAP);
  const capReached = total >= CAP;

  const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw === '') {
      setDisplays(p => ({ ...p, [key]: '' }));
      dispatch({ type: 'SET_INVESTMENTS', payload: { [key]: 0 } });
      return;
    }
    const num = parseInt(raw, 10);
    setDisplays(p => ({ ...p, [key]: formatIndianNumber(num) }));
    dispatch({ type: 'SET_INVESTMENTS', payload: { [key]: num } });
  };

  const faqItems = [
    { question: 'What is 80C?', answer: 'A basket of investments like PF, LIC, and ELSS that reduces your taxable income. Max Rs. 1.5 lakh.' },
    { question: "Is my company's PF contribution included?", answer: "No, only YOUR contribution (deducted from your salary) counts here." },
    { question: 'I have no investments.', answer: 'Leave everything blank. Your tax will be computed without deductions.' },
  ];

  return (
    <div className="step">
      <div className="step__question">How much did you invest this year?</div>
      <p className="step__subtitle">Common tax-saving investments (Old Regime only). Max limit Rs. 1,50,000.</p>

      {/* Running total badge */}
      <div className={`step__cap-badge ${capReached ? 'step__cap-badge--reached' : ''}`}>
        <span>80C Total: Rs. {formatIndianNumber(total)}</span>
        <span className="step__cap-badge-sep">·</span>
        <span>Effective: Rs. {formatIndianNumber(effective)}</span>
        {capReached && <span className="step__cap-badge-flag">Cap Reached ✓</span>}
      </div>

      <div className="step__input-group step__input-group--grid">
        {FIELDS.map(f => (
          <div key={f.key} className="step__field">
            <label className="step__label">
              {f.label}
              {f.monthly && <span className="step__label-tag">per month</span>}
            </label>
            <div className="currency-input currency-input--sm">
              <span className="currency-input__prefix">Rs.</span>
              <input type="text" inputMode="numeric" className="currency-input__field"
                placeholder={f.placeholder} value={displays[f.key]}
                onChange={handleChange(f.key)}
                aria-label={f.label} autoComplete="off" />
            </div>
            {f.monthly && state.investments[f.key] > 0 && (
              <span className="step__hint step__hint--subtle">
                = Rs. {formatIndianNumber(state.investments[f.key] * 12)}/year
              </span>
            )}
          </div>
        ))}
      </div>

      <FAQ items={faqItems} />
    </div>
  );
}
