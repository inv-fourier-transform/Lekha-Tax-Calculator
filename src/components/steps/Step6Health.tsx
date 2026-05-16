import { useState } from 'react';
import { useTaxState, useTaxDispatch } from '../../context/TaxContext';
import { formatIndianNumber } from '../../utils/formatCurrency';
import FAQ from '../FAQ';

/**
 * Step 6 — Health Insurance / 80D (PRD §3.1 Step 6)
 */
export default function Step6Health() {
  const state = useTaxState();
  const dispatch = useTaxDispatch();
  const h = state.healthInsurance;

  const [displays, setDisplays] = useState({
    selfPremium: h.selfPremium > 0 ? formatIndianNumber(h.selfPremium) : '',
    parentsPremium: h.parentsPremium > 0 ? formatIndianNumber(h.parentsPremium) : '',
    checkupSelf: h.checkupSelf > 0 ? formatIndianNumber(h.checkupSelf) : '',
    checkupParents: h.checkupParents > 0 ? formatIndianNumber(h.checkupParents) : '',
  });

  const handleNum = (key: keyof typeof displays) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw === '') { setDisplays(p => ({ ...p, [key]: '' })); dispatch({ type: 'SET_HEALTH_INSURANCE', payload: { [key]: 0 } }); return; }
    const num = parseInt(raw, 10);
    setDisplays(p => ({ ...p, [key]: formatIndianNumber(num) }));
    dispatch({ type: 'SET_HEALTH_INSURANCE', payload: { [key]: num } });
  };

  const selfLimit = h.selfHasSenior ? 50000 : 25000;
  const parentsLimit = h.parentsAreSenior ? 50000 : 25000;

  const faqItems = [
    { question: 'I have corporate health insurance.', answer: 'If the company pays, you can\'t claim it. Only premiums YOU pay count.' },
    { question: 'What is preventive check-up?', answer: 'Annual health check-up bills up to Rs. 5,000 count within your 80D limit.' },
  ];

  return (
    <div className="step">
      <div className="step__question">Do you pay for health insurance?</div>
      <p className="step__subtitle">For yourself, spouse, children, or parents.</p>

      <div className="step__input-group">
        {/* Self + Family */}
        <div className="step__sub-fields">
          <h4 className="step__section-label">Self, Spouse & Children</h4>
          <div>
            <label className="step__label">Annual Premium</label>
            <div className="currency-input currency-input--sm">
              <span className="currency-input__prefix">Rs.</span>
              <input type="text" inputMode="numeric" className="currency-input__field" placeholder="0"
                value={displays.selfPremium} onChange={handleNum('selfPremium')} aria-label="Self health insurance premium" autoComplete="off" />
            </div>
            <span className="step__hint step__hint--subtle">Limit: Rs. {formatIndianNumber(selfLimit)}</span>
          </div>
          <div className="step__toggle-row">
            <label className="step__label" style={{ marginBottom: 0 }}>Is anyone covered above 60 years old?</label>
            <button type="button" className={`toggle ${h.selfHasSenior ? 'toggle--on' : ''}`}
              onClick={() => dispatch({ type: 'SET_HEALTH_INSURANCE', payload: { selfHasSenior: !h.selfHasSenior } })}
              role="switch" aria-checked={h.selfHasSenior}><span className="toggle__knob" /></button>
          </div>
          <div>
            <label className="step__label">Preventive Health Check-up</label>
            <div className="currency-input currency-input--sm">
              <span className="currency-input__prefix">Rs.</span>
              <input type="text" inputMode="numeric" className="currency-input__field" placeholder="0"
                value={displays.checkupSelf} onChange={handleNum('checkupSelf')} aria-label="Preventive checkup self" autoComplete="off" />
            </div>
            <span className="step__hint step__hint--subtle">Max Rs. 5,000 within above limit</span>
          </div>
        </div>

        {/* Parents */}
        <div className="step__sub-fields">
          <h4 className="step__section-label">Parents</h4>
          <div>
            <label className="step__label">Annual Premium for Parents</label>
            <div className="currency-input currency-input--sm">
              <span className="currency-input__prefix">Rs.</span>
              <input type="text" inputMode="numeric" className="currency-input__field" placeholder="0"
                value={displays.parentsPremium} onChange={handleNum('parentsPremium')} aria-label="Parents health insurance premium" autoComplete="off" />
            </div>
            <span className="step__hint step__hint--subtle">Limit: Rs. {formatIndianNumber(parentsLimit)}</span>
          </div>
          <div className="step__toggle-row">
            <label className="step__label" style={{ marginBottom: 0 }}>Are your parents above 60?</label>
            <button type="button" className={`toggle ${h.parentsAreSenior ? 'toggle--on' : ''}`}
              onClick={() => dispatch({ type: 'SET_HEALTH_INSURANCE', payload: { parentsAreSenior: !h.parentsAreSenior } })}
              role="switch" aria-checked={h.parentsAreSenior}><span className="toggle__knob" /></button>
          </div>
          <div>
            <label className="step__label">Preventive Health Check-up (Parents)</label>
            <div className="currency-input currency-input--sm">
              <span className="currency-input__prefix">Rs.</span>
              <input type="text" inputMode="numeric" className="currency-input__field" placeholder="0"
                value={displays.checkupParents} onChange={handleNum('checkupParents')} aria-label="Preventive checkup parents" autoComplete="off" />
            </div>
          </div>
        </div>
      </div>
      <FAQ items={faqItems} />
    </div>
  );
}
