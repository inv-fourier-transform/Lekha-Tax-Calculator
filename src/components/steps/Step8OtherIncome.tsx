import { useState } from 'react';
import { useTaxState, useTaxDispatch } from '../../context/TaxContext';
import { formatIndianNumber } from '../../utils/formatCurrency';
import FAQ from '../FAQ';

/**
 * Step 8 — Income from Interest / Other Taxable Income (PRD §3.1 Step 8)
 */
export default function Step8OtherIncome() {
  const state = useTaxState();
  const dispatch = useTaxDispatch();
  const oi = state.otherIncome;

  const [displays, setDisplays] = useState({
    fdInterest: oi.fdInterest > 0 ? formatIndianNumber(oi.fdInterest) : '',
    rdInterest: oi.rdInterest > 0 ? formatIndianNumber(oi.rdInterest) : '',
    otherInterest: oi.otherInterest > 0 ? formatIndianNumber(oi.otherInterest) : '',
  });

  const handleNum = (key: keyof typeof displays) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw === '') { setDisplays(p => ({ ...p, [key]: '' })); dispatch({ type: 'SET_OTHER_INCOME', payload: { [key]: 0 } }); return; }
    const num = parseInt(raw, 10);
    setDisplays(p => ({ ...p, [key]: formatIndianNumber(num) }));
    dispatch({ type: 'SET_OTHER_INCOME', payload: { [key]: num } });
  };

  const total = oi.fdInterest + oi.rdInterest + oi.otherInterest;

  const faqItems = [
    { question: 'Is bank interest taxable?', answer: 'Yes. Banks deduct TDS, but you still report it.' },
    { question: 'I already entered savings interest in Step 7.', answer: 'That was for the DEDUCTION. This is the actual interest you EARNED. If it\'s the same amount, enter it here too.' },
  ];

  return (
    <div className="step">
      <div className="step__question">Any other interest income?</div>
      <p className="step__subtitle">This ADDS to your taxable income.</p>

      <div className="step__input-group">
        {([
          { key: 'fdInterest' as const, label: 'Interest from Fixed Deposits (FD)' },
          { key: 'rdInterest' as const, label: 'Interest from Recurring Deposits' },
          { key: 'otherInterest' as const, label: 'Any other interest income' },
        ]).map(f => (
          <div key={f.key} className="step__deduction-item">
            <label className="step__label">{f.label}</label>
            <div className="currency-input currency-input--sm">
              <span className="currency-input__prefix">Rs.</span>
              <input type="text" inputMode="numeric" className="currency-input__field" placeholder="0"
                value={displays[f.key]} onChange={handleNum(f.key)}
                aria-label={f.label} autoComplete="off" />
            </div>
          </div>
        ))}

        {total > 0 && (
          <div className="step__cap-badge">
            Total Other Income: Rs. {formatIndianNumber(total)}
          </div>
        )}
      </div>
      <FAQ items={faqItems} />
    </div>
  );
}
