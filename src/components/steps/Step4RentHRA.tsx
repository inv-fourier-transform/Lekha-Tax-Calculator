import { useState, useRef, useEffect } from 'react';
import { useTaxState, useTaxDispatch } from '../../context/TaxContext';
import { formatIndianNumber } from '../../utils/formatCurrency';
import FAQ from '../FAQ';

/**
 * Step 4 — Rent & HRA (PRD §3.1 Step 4)
 */
export default function Step4RentHRA() {
  const state = useTaxState();
  const dispatch = useTaxDispatch();
  const rentRef = useRef<HTMLInputElement>(null);

  const [rentDisplay, setRentDisplay] = useState(state.monthlyRent > 0 ? formatIndianNumber(state.monthlyRent) : '');
  const [hraDisplay, setHraDisplay] = useState(state.monthlyHRA > 0 ? formatIndianNumber(state.monthlyHRA) : '');
  const [basicDisplay, setBasicDisplay] = useState(state.monthlyBasicDA > 0 ? formatIndianNumber(state.monthlyBasicDA) : '');

  useEffect(() => { rentRef.current?.focus(); }, []);

  const makeHandler = (field: 'monthlyRent' | 'monthlyHRA' | 'monthlyBasicDA', setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      if (raw === '') { setter(''); dispatch({ type: 'SET_RENT_HRA', payload: { [field]: 0 } }); return; }
      const num = parseInt(raw, 10);
      setter(formatIndianNumber(num));
      dispatch({ type: 'SET_RENT_HRA', payload: { [field]: num } });
    };

  const faqItems = [
    { question: 'I live in a PG.', answer: 'Yes, enter your share of the rent.' },
    { question: "I don't know my basic salary.", answer: "It's usually 40-50% of your gross. Check your payslip or ask HR." },
    { question: 'What are metro cities?', answer: 'Mumbai, Delhi, Kolkata, Chennai, Bengaluru, Hyderabad, Pune, Ahmedabad.' },
  ];

  return (
    <div className="step">
      <div className="step__question">Do you pay rent?</div>
      <p className="step__subtitle">To claim HRA exemption (Old Regime only). Leave blank if you don't pay rent.</p>

      <div className="step__input-group">
        <label className="step__label">Monthly Rent Paid</label>
        <div className="currency-input">
          <span className="currency-input__prefix">Rs.</span>
          <input ref={rentRef} type="text" inputMode="numeric" className="currency-input__field"
            placeholder="0" value={rentDisplay} onChange={makeHandler('monthlyRent', setRentDisplay)}
            aria-label="Monthly rent paid" autoComplete="off" />
        </div>

        {state.monthlyRent > 0 && (
          <>
            <div className="step__toggle-row">
              <label className="step__label" htmlFor="receives-hra">Do you receive HRA as part of your salary?</label>
              <button type="button" id="receives-hra"
                className={`toggle ${state.receivesHRA ? 'toggle--on' : ''}`}
                onClick={() => dispatch({ type: 'SET_RENT_HRA', payload: { receivesHRA: !state.receivesHRA } })}
                role="switch" aria-checked={state.receivesHRA}>
                <span className="toggle__knob" />
              </button>
            </div>

            {state.receivesHRA && (
              <div className="step__sub-fields">
                <div>
                  <label className="step__label">Monthly HRA Amount</label>
                  <div className="currency-input">
                    <span className="currency-input__prefix">Rs.</span>
                    <input type="text" inputMode="numeric" className="currency-input__field"
                      placeholder="0" value={hraDisplay} onChange={makeHandler('monthlyHRA', setHraDisplay)}
                      aria-label="Monthly HRA received" autoComplete="off" />
                  </div>
                </div>
                <div>
                  <label className="step__label">Monthly Basic + DA</label>
                  <div className="currency-input">
                    <span className="currency-input__prefix">Rs.</span>
                    <input type="text" inputMode="numeric" className="currency-input__field"
                      placeholder="0" value={basicDisplay} onChange={makeHandler('monthlyBasicDA', setBasicDisplay)}
                      aria-label="Monthly basic plus DA" autoComplete="off" />
                  </div>
                </div>
                <div>
                  <label className="step__label">City of Residence</label>
                  <div className="radio-cards radio-cards--row">
                    {(['metro', 'nonMetro'] as const).map(c => (
                      <button key={c} type="button"
                        className={`radio-card radio-card--compact ${state.cityType === c ? 'radio-card--selected' : ''}`}
                        onClick={() => dispatch({ type: 'SET_RENT_HRA', payload: { cityType: c } })}
                        aria-pressed={state.cityType === c}>
                        <span className="radio-card__indicator"><span className={`radio-card__dot ${state.cityType === c ? 'radio-card__dot--active' : ''}`} /></span>
                        <span className="radio-card__label">{c === 'metro' ? 'Metro' : 'Non-Metro'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <FAQ items={faqItems} />
    </div>
  );
}
