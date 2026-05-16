import { useTaxState, useTaxDispatch } from '../context/TaxContext';
import Step1Salary from './steps/Step1Salary';
import Step2Age from './steps/Step2Age';
import Step3Bonus from './steps/Step3Bonus';
import Step4RentHRA from './steps/Step4RentHRA';
import Step5Investments from './steps/Step5Investments';
import Step6Health from './steps/Step6Health';
import Step7Deductions from './steps/Step7Deductions';
import Step8OtherIncome from './steps/Step8OtherIncome';
import LivePreview from './LivePreview';
import './Wizard.css';
import './steps/Steps.css';

const TOTAL_STEPS = 8;

interface WizardProps {
  onBack: () => void;
  onResults: () => void;
}

/**
 * Wizard — PRD §3.1
 * Two-column layout: question card (left) + live preview (right).
 * Progress bar, back/continue navigation, keyboard support.
 */
export default function Wizard({ onBack, onResults }: WizardProps) {
  const state = useTaxState();
  const dispatch = useTaxDispatch();

  const currentStep = state.currentStep;

  // ---- Step Validation ----
  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return state.monthlyInHand !== null && state.monthlyInHand > 0;
      case 2:
        return state.ageGroup !== null;
      case 3:
        return true; // Bonus is optional
      default:
        return true;
    }
  };

  const handleContinue = () => {
    if (!isStepValid()) return;

    if (currentStep === TOTAL_STEPS) {
      onResults();
    } else {
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      dispatch({ type: 'PREV_STEP' });
    } else {
      onBack();
    }
  };

  // ---- Render Current Step ----
  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Salary />;
      case 2: return <Step2Age />;
      case 3: return <Step3Bonus />;
      case 4: return <Step4RentHRA />;
      case 5: return <Step5Investments />;
      case 6: return <Step6Health />;
      case 7: return <Step7Deductions />;
      case 8: return <Step8OtherIncome />;
      default:
        return (
          <div className="step">
            <div className="step__question">Step {currentStep}</div>
            <p className="step__subtitle">Coming in the next phase.</p>
          </div>
        );
    }
  };

  // ---- Progress Dots ----
  const progressPercent = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="wizard">
      {/* Header */}
      <header className="wizard__header">
        <button className="wizard__back-home" onClick={onBack} aria-label="Back to home">
          <span aria-hidden="true">←</span>
          <span>TaxRegime</span>
        </button>
        <div className="wizard__progress-info">
          Step {currentStep} of {TOTAL_STEPS}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="wizard__progress-bar" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
        <div className="wizard__progress-fill" style={{ width: `${progressPercent}%` }} />
        {/* Step dots */}
        <div className="wizard__progress-dots">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`wizard__dot ${i + 1 <= currentStep ? 'wizard__dot--active' : ''} ${i + 1 === currentStep ? 'wizard__dot--current' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div className="wizard__body">
        {/* Left: Question Card */}
        <div className="wizard__question-panel">
          <div className="wizard__card" key={currentStep}>
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="wizard__nav">
            <button
              className="wizard__nav-back"
              onClick={handleBack}
              type="button"
            >
              ← {currentStep === 1 ? 'Home' : 'Back'}
            </button>

            <button
              className={`wizard__nav-continue ${!isStepValid() ? 'wizard__nav-continue--disabled' : ''}`}
              onClick={handleContinue}
              disabled={!isStepValid()}
              type="button"
              id="continue-btn"
            >
              {currentStep === 8 ? 'See Results →' : 'Continue →'}
            </button>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="wizard__preview-panel">
          <LivePreview />
        </div>
      </div>
    </div>
  );
}
