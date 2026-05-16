import { useTaxState, useTaxDispatch } from '../../context/TaxContext';
import FAQ from '../FAQ';

const AGE_OPTIONS = [
  { value: 'below60' as const, label: 'Below 60', description: 'General taxpayer' },
  { value: 'senior' as const, label: '60 — 79', description: 'Senior Citizen' },
  { value: 'superSenior' as const, label: '80 or above', description: 'Super Senior Citizen' },
];

/**
 * Step 2 — Age Group (PRD §3.1 Step 2)
 * "How old are you?"
 */
export default function Step2Age() {
  const state = useTaxState();
  const dispatch = useTaxDispatch();

  const faqItems = [
    {
      question: 'Why does age matter?',
      answer: 'Senior citizens get higher tax-free limits under the old regime. The new regime is the same for everyone.',
    },
    {
      question: 'I turn 60 in December 2026.',
      answer: 'Select "Below 60" since you were below 60 on April 1, 2026.',
    },
  ];

  return (
    <div className="step">
      <div className="step__question">
        How old are you?
      </div>
      <p className="step__subtitle">
        Your age as of 1st April 2026.
      </p>

      <div className="step__input-group">
        <div className="radio-cards">
          {AGE_OPTIONS.map((opt) => {
            const isSelected = state.ageGroup === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`radio-card ${isSelected ? 'radio-card--selected' : ''}`}
                onClick={() => {
                  dispatch({ type: 'SET_AGE_GROUP', payload: opt.value });
                }}
                aria-pressed={isSelected}
                id={`age-option-${opt.value}`}
              >
                <span className="radio-card__indicator">
                  <span className={`radio-card__dot ${isSelected ? 'radio-card__dot--active' : ''}`} />
                </span>
                <div className="radio-card__content">
                  <span className="radio-card__label">{opt.label}</span>
                  <span className="radio-card__desc">{opt.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <FAQ items={faqItems} />
    </div>
  );
}
