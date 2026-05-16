import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useTaxState, useTaxDispatch } from '../../context/TaxContext';
import { formatIndianNumber } from '../../utils/formatCurrency';
import FAQ from '../FAQ';

/**
 * Step 3 — Bonus / Arrears / Other One-Time Salary (PRD §3.1 Step 3)
 * "Any extra salary this year?"
 */
export default function Step3Bonus() {
  const state = useTaxState();
  const dispatch = useTaxDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  const [displayValue, setDisplayValue] = useState(
    state.bonusIncome > 0 ? formatIndianNumber(state.bonusIncome) : ''
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw === '') {
      setDisplayValue('');
      dispatch({ type: 'SET_BONUS_INCOME', payload: 0 });
      return;
    }

    const num = parseInt(raw, 10);
    setDisplayValue(formatIndianNumber(num));
    dispatch({ type: 'SET_BONUS_INCOME', payload: num });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Bonus is optional, always valid
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const faqItems = [
    {
      question: 'What counts here?',
      answer: 'Performance bonus, retention bonus, salary arrears, annual variable pay.',
    },
    {
      question: 'Is PF included in this?',
      answer: "No. We'll handle PF in the investments section.",
    },
  ];

  return (
    <div className="step">
      <div className="step__question">
        Any extra salary this year?
      </div>
      <p className="step__subtitle">
        Bonus, arrears, or variable pay. Leave blank if none.
      </p>

      <div className="step__input-group">
        <div className="currency-input">
          <span className="currency-input__prefix">Rs.</span>
          <input
            ref={inputRef}
            id="bonus-input"
            type="text"
            inputMode="numeric"
            className="currency-input__field"
            placeholder="0"
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-label="Annual bonus or one-time salary income"
            autoComplete="off"
          />
        </div>

        <p className="step__hint step__hint--subtle">
          This is optional. Leave blank or enter 0 if you didn't receive any.
        </p>
      </div>

      <FAQ items={faqItems} />
    </div>
  );
}
