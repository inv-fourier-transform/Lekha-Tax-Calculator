import { useEffect, useRef, useState } from 'react';
import { useTaxState } from '../context/TaxContext';
import { computeFullSummary } from '../utils/taxCalc';
import { computeTax } from '../utils/taxEngine';
import { formatIndianNumber } from '../utils/formatCurrency';
import './LivePreview.css';

function AN({ value, prefix = 'Rs. ' }: { value: number; prefix?: string }) {
  const [displayed, setDisplayed] = useState(value);
  const [hl, setHl] = useState(false);
  const prev = useRef(value);
  const raf = useRef(0);
  useEffect(() => {
    if (prev.current === value) return;
    const from = prev.current, to = value, dur = 400, start = performance.now();
    setHl(true);
    const t = setTimeout(() => setHl(false), 500);
    const animate = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setDisplayed(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    prev.current = value;
    return () => { cancelAnimationFrame(raf.current); clearTimeout(t); };
  }, [value]);
  return <span className={`preview-value ${hl ? 'preview-value--highlight' : ''}`}>{prefix}{formatIndianNumber(displayed)}</span>;
}

function Row({ label, value, total }: { label: string; value: number | null; total?: boolean }) {
  return (
    <div className={`preview__row ${total ? 'preview__row--total' : ''}`}>
      <span className="preview__label">{label}</span>
      <span className="preview__amount">
        {value !== null && value !== 0 ? <AN value={value} /> : <span className="preview__empty">—</span>}
      </span>
    </div>
  );
}

export default function LivePreview() {
  const s = useTaxState();
  const summary = computeFullSummary(s);
  const { income, oldDeductions: od, newDeductions: nd, totalOldDeductions, taxableOld, taxableNew } = summary;
  const hasData = s.monthlyInHand !== null && s.monthlyInHand > 0;
  const showDeductions = s.currentStep >= 4;
  const age = s.ageGroup ?? 'below60';

  // Real tax computation
  const oldTax = computeTax(taxableOld, 'old', age);
  const newTax = computeTax(taxableNew, 'new', age);
  const showTax = hasData && s.currentStep >= 4;
  const savings = Math.abs(oldTax.totalTax - newTax.totalTax);
  const betterRegime = oldTax.totalTax <= newTax.totalTax ? 'Old' : 'New';

  return (
    <div className="preview" aria-live="polite">
      <div className="preview__header">
        <span className="preview__header-icon" aria-hidden="true">📊</span>
        <h2 className="preview__title">Live Preview</h2>
        <span className="preview__badge">Auto-updates</span>
      </div>

      {/* Income */}
      <div className="preview__section">
        <h3 className="preview__section-title">Income Summary</h3>
        <Row label="Annual In-Hand Salary" value={hasData ? income.annualInHand : null} />
        {income.bonus > 0 && <Row label="Bonus / One-Time" value={income.bonus} />}
        {income.otherIncome > 0 && <Row label="Other Income (Interest)" value={income.otherIncome} />}
        {income.pfAnnual > 0 && <Row label="Employee PF (add-back)" value={income.pfAnnual} />}
        {income.profTax > 0 && <Row label="Professional Tax (add-back)" value={income.profTax} />}
        <div className="preview__divider" />
        <Row label="Gross Total Income" value={hasData ? income.grossTotalIncome : null} total />
      </div>

      {s.ageGroup && (
        <div className="preview__section preview__section--compact">
          <div className="preview__row">
            <span className="preview__label">Age Category</span>
            <span className="preview__tag">{s.ageGroup === 'below60' ? 'Below 60' : s.ageGroup === 'senior' ? 'Senior (60-79)' : 'Super Senior (80+)'}</span>
          </div>
        </div>
      )}

      {/* Old Regime Deductions */}
      {hasData && showDeductions && (
        <div className="preview__section">
          <h3 className="preview__section-title">Deductions — Old Regime</h3>
          <Row label="Standard Deduction" value={od.stdDeduction} />
          {od.hra > 0 && <Row label="HRA Exemption" value={od.hra} />}
          {od.sec80C > 0 && <Row label="Section 80C" value={od.sec80C} />}
          {od.sec80D > 0 && <Row label="Section 80D (Health)" value={od.sec80D} />}
          {od.homeLoanSO > 0 && <Row label="Home Loan Interest (24b)" value={od.homeLoanSO} />}
          {od.empNPS > 0 && <Row label="NPS Employee (80CCD1B)" value={od.empNPS} />}
          {od.employerNPS > 0 && <Row label="Employer NPS (80CCD2)" value={od.employerNPS} />}
          {od.eduLoan > 0 && <Row label="Education Loan (80E)" value={od.eduLoan} />}
          {od.profTax > 0 && <Row label="Professional Tax" value={od.profTax} />}
          {od.savInt > 0 && <Row label={s.ageGroup === 'senior' || s.ageGroup === 'superSenior' ? '80TTB' : '80TTA'} value={od.savInt} />}
          {od.donations > 0 && <Row label="Donations (80G)" value={od.donations} />}
          {od.disability80U > 0 && <Row label="Disability (80U)" value={od.disability80U} />}
          {od.disability80DD > 0 && <Row label="Dependent Disability (80DD)" value={od.disability80DD} />}
          <div className="preview__divider" />
          <Row label="Total Deductions" value={totalOldDeductions} />
          <Row label="Taxable Income (Old)" value={taxableOld} total />
        </div>
      )}

      {/* New Regime Deductions */}
      {hasData && showDeductions && (
        <div className="preview__section">
          <h3 className="preview__section-title">Deductions — New Regime</h3>
          <Row label="Standard Deduction" value={nd.stdDeduction} />
          {nd.employerNPS > 0 && <Row label="Employer NPS (80CCD2)" value={nd.employerNPS} />}
          <div className="preview__divider" />
          <Row label="Total Deductions" value={nd.total} />
          <Row label="Taxable Income (New)" value={taxableNew} total />
        </div>
      )}

      {/* Tax Summary — NEW in Phase 5 */}
      {showTax && (
        <div className="preview__section preview__section--tax">
          <h3 className="preview__section-title">💰 Tax Comparison</h3>
          <div className="preview__tax-grid">
            <div className="preview__tax-col">
              <span className="preview__tax-col-label">Old Regime</span>
              <span className="preview__tax-col-value"><AN value={oldTax.totalTax} /></span>
            </div>
            <div className="preview__tax-col">
              <span className="preview__tax-col-label">New Regime</span>
              <span className="preview__tax-col-value"><AN value={newTax.totalTax} /></span>
            </div>
          </div>
          {savings > 0 && (
            <div className="preview__recommendation">
              <span className="preview__rec-icon" aria-hidden="true">✅</span>
              <span>{betterRegime} regime saves Rs. {formatIndianNumber(savings)}</span>
            </div>
          )}
        </div>
      )}

      {/* Placeholder */}
      {hasData && !showDeductions && (
        <div className="preview__section preview__section--locked">
          <div className="preview__locked-content">
            <span className="preview__locked-icon" aria-hidden="true">🔒</span>
            <span className="preview__locked-text">Deductions & tax comparison will appear as you answer more questions</span>
          </div>
        </div>
      )}

      <div className="preview__privacy"><span aria-hidden="true">🔒</span> Your data never leaves this browser</div>
    </div>
  );
}
