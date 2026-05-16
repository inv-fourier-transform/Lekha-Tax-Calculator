import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useTaxState, useTaxDispatch } from '../../context/TaxContext';
import { formatIndianNumber } from '../../utils/formatCurrency';
import FAQ from '../FAQ';

/**
 * Step 1 — Monthly In-Hand Salary (PRD §3.1 Step 1)
 * "How much lands in your bank account every month?"
 */
export default function Step1Salary() {
  const state = useTaxState();
  const dispatch = useTaxDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  // Local display value (formatted)
  const [displayValue, setDisplayValue] = useState(
    state.monthlyInHand ? formatIndianNumber(state.monthlyInHand) : ''
  );
  const [error, setError] = useState('');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw === '') {
      setDisplayValue('');
      dispatch({ type: 'SET_MONTHLY_IN_HAND', payload: null });
      setError('');
      return;
    }

    const num = parseInt(raw, 10);
    if (num > 9999999) {
      setError('Maximum Rs. 99,99,999');
      return;
    }

    setDisplayValue(formatIndianNumber(num));
    dispatch({ type: 'SET_MONTHLY_IN_HAND', payload: num });
    setError('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValid()) {
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const isValid = () => {
    return state.monthlyInHand !== null && state.monthlyInHand > 0;
  };

  const faqItems = [
    {
      question: 'I get paid fortnightly.',
      answer: 'Just multiply one payment by 2. Or add both and enter the monthly total.',
    },
    {
      question: 'Should I include variable pay or bonuses?',
      answer: "No. Add only your fixed monthly in-hand. We'll handle bonuses separately in the next step.",
    },
    {
      question: 'My in-hand varies every month.',
      answer: "Enter your average. Don't overthink it.",
    },
  ];

  return (
    <div className="step">
      <div className="step__question">
        How much lands in your bank account every month?
      </div>
      <p className="step__subtitle">
        Your take-home salary after all deductions. Don't include bonuses.
      </p>

      <div className="step__input-group">
        <div className={`currency-input ${error ? 'currency-input--error' : ''}`}>
          <span className="currency-input__prefix">Rs.</span>
          <input
            ref={inputRef}
            id="monthly-salary-input"
            type="text"
            inputMode="numeric"
            className="currency-input__field"
            placeholder="50,000"
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-label="Monthly in-hand salary"
            autoComplete="off"
          />
        </div>
        {error && <p className="step__error">{error}</p>}

        {state.monthlyInHand !== null && state.monthlyInHand > 0 && (
          <p className="step__hint">
            That's Rs. {formatIndianNumber(state.monthlyInHand * 12)} per year
          </p>
        )}
      </div>

      <FAQ items={faqItems} />
    </div>
  );
}
