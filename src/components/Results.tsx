import { useState, useEffect } from 'react';
import { useTaxState, useTaxDispatch } from '../context/TaxContext';
import { computeFullSummary } from '../utils/taxCalc';
import { computeTax, type TaxResult } from '../utils/taxEngine';
import { formatIndianNumber } from '../utils/formatCurrency';
import './Results.css';

/**
 * Results Page — PRD §3.3 (Core & Enhancements)
 * Covers Phase 5 Core + Phase 6 (Slabs, Education, Suggestions, Confetti, Share)
 * + Phase 7 (What-If Playground, Thermometer, Lifestyle) + Phase 8 (ELI21 Mode).
 */

interface ResultsProps {
  onStartOver: () => void;
}

function Row({ label, oldVal, newVal, highlight, bold }: {
  label: string;
  oldVal: number;
  newVal: number;
  highlight?: boolean;
  bold?: boolean;
}) {
  return (
    <tr className={`results__row ${bold ? 'results__row--bold' : ''} ${highlight ? 'results__row--highlight' : ''}`}>
      <td className="results__cell results__cell--label">{label}</td>
      <td className="results__cell results__cell--value">Rs. {formatIndianNumber(oldVal)}</td>
      <td className="results__cell results__cell--value">Rs. {formatIndianNumber(newVal)}</td>
    </tr>
  );
}

export default function Results({ onStartOver }: ResultsProps) {
  const state = useTaxState();
  const dispatch = useTaxDispatch();
  const summary = computeFullSummary(state);
  const age = state.ageGroup ?? 'below60';

  const oldTax: TaxResult = computeTax(summary.taxableOld, 'old', age);
  const newTax: TaxResult = computeTax(summary.taxableNew, 'new', age);

  const savings = Math.abs(oldTax.totalTax - newTax.totalTax);
  const betterRegime = oldTax.totalTax <= newTax.totalTax ? 'old' : 'new';
  const regimeLabel = betterRegime === 'old' ? 'Old' : 'New';

  // Enhancements states
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showSlabs, setShowSlabs] = useState(false);
  const [showPlayground, setShowPlayground] = useState(false);

  // What-If sliders
  const [extra80C, setExtra80C] = useState(0);
  const [extraNPS, setExtraNPS] = useState(0);
  const [salaryChangePercent, setSalaryChangePercent] = useState(0);

  // Confetti timeout
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleStartOver = () => {
    dispatch({ type: 'RESET' });
    onStartOver();
  };

  // ELI21 Translator
  const translate = (label: string): string => {
    if (!state.eli21Mode) return label;
    const dict: Record<string, string> = {
      'Standard Deduction': 'Standard Deduction (Fixed relief for all salaried employees)',
      'HRA Exemption': 'House Rent Relief (HRA Exemption based on rent paid)',
      'Section 80C': 'Basic Tax-Saving Investments (PF, PPF, LIC, Mutual Funds)',
      'Section 80D (Health)': 'Mediclaim / Health Insurance Relief',
      'Home Loan Interest (24b)': 'Home Loan Interest Relief',
      'NPS Employee (80CCD1B)': 'Personal Pension Investment (NPS Tier 1)',
      'Employer NPS (80CCD2)': 'Company Contribution to Pension (NPS)',
      'Education Loan (80E)': 'Education Loan Interest Relief',
      'Professional Tax': 'State Professional Tax Relief',
      'Savings Interest (80TTA)': 'Bank Savings Interest Exemption',
      'Savings Interest (80TTB)': 'Senior Citizen Bank Interest Exemption',
      'Donations (80G)': 'Approved Charitable Donations Relief',
      'Disability (80U)': 'Personal Disability Fixed Relief',
      'Dependent Disability (80DD)': 'Dependent Family Disability Fixed Relief',
      'Gross Total Income': 'Total Earnings Before Reliefs',
      'Total Deductions': 'Total Approved Reliefs Subtracted',
      'Taxable Income': 'Net Income on Which Tax is Applied',
      'Tax Before Rebate': 'Base Tax Calculated on Income Slabs',
      'Rebate u/s 87A': 'Government Full Tax Discount (Rebate 87A)',
      'Tax After Rebate': 'Remaining Tax After Discount',
      'Health & Edu. Cess (4%)': 'Extra Mandatory Government Surcharge (Cess)',
      'Total Tax Payable': 'Final Net Amount to Pay to Government',
    };
    return dict[label] || label;
  };

  // Handle Share Clipboard
  const handleShare = () => {
    const text = `📊 My FY 2026-27 Tax Regimes Comparison:\n` +
      `Gross Income: Rs. ${formatIndianNumber(summary.income.grossTotalIncome)}\n` +
      `Old Regime Tax: Rs. ${formatIndianNumber(oldTax.totalTax)}\n` +
      `New Regime Tax: Rs. ${formatIndianNumber(newTax.totalTax)}\n` +
      `👉 Recommended: ${regimeLabel} Regime (Save Rs. ${formatIndianNumber(savings)}!)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // What-If Hypothetical Calculation
  const hypoState = {
    ...state,
    monthlyInHand: state.monthlyInHand ? state.monthlyInHand * (1 + salaryChangePercent / 100) : null,
    investments: {
      ...state.investments,
      other80C: state.investments.other80C + extra80C,
    },
    otherDeductions: {
      ...state.otherDeductions,
      employeeNPS: state.otherDeductions.employeeNPS + extraNPS,
    }
  };
  const hypoSummary = computeFullSummary(hypoState);
  const hypoOldTax = computeTax(hypoSummary.taxableOld, 'old', age);
  const hypoNewTax = computeTax(hypoSummary.taxableNew, 'new', age);
  const hypoWinner = hypoOldTax.totalTax <= hypoNewTax.totalTax ? 'Old' : 'New';

  const resetPlayground = () => {
    setExtra80C(0);
    setExtraNPS(0);
    setSalaryChangePercent(0);
  };

  // Thermometer calc
  const typicalMaxDeductions = 325000; // Std Ded (75k) + 80C (1.5L) + 80D (50k) + NPS (50k)
  const utilizedPercent = Math.min(100, Math.round((summary.totalOldDeductions / typicalMaxDeductions) * 100));

  // Deduction helper rows
  const dedRows: { label: string; old: number; new: number }[] = [
    { label: 'Standard Deduction', old: summary.oldDeductions.stdDeduction, new: summary.newDeductions.stdDeduction },
  ];
  if (summary.oldDeductions.hra > 0) dedRows.push({ label: 'HRA Exemption', old: summary.oldDeductions.hra, new: 0 });
  if (summary.oldDeductions.sec80C > 0) dedRows.push({ label: 'Section 80C', old: summary.oldDeductions.sec80C, new: 0 });
  if (summary.oldDeductions.sec80D > 0) dedRows.push({ label: 'Section 80D (Health)', old: summary.oldDeductions.sec80D, new: 0 });
  if (summary.oldDeductions.homeLoanSO > 0) dedRows.push({ label: 'Home Loan Interest (24b)', old: summary.oldDeductions.homeLoanSO, new: 0 });
  if (summary.oldDeductions.empNPS > 0) dedRows.push({ label: 'NPS Employee (80CCD1B)', old: summary.oldDeductions.empNPS, new: 0 });
  if (summary.oldDeductions.employerNPS > 0) dedRows.push({ label: 'Employer NPS (80CCD2)', old: summary.oldDeductions.employerNPS, new: summary.newDeductions.employerNPS });
  if (summary.oldDeductions.eduLoan > 0) dedRows.push({ label: 'Education Loan (80E)', old: summary.oldDeductions.eduLoan, new: 0 });
  if (summary.oldDeductions.profTax > 0) dedRows.push({ label: 'Professional Tax', old: summary.oldDeductions.profTax, new: 0 });
  if (summary.oldDeductions.savInt > 0) dedRows.push({ label: age === 'senior' || age === 'superSenior' ? 'Savings Interest (80TTB)' : 'Savings Interest (80TTA)', old: summary.oldDeductions.savInt, new: 0 });
  if (summary.oldDeductions.donations > 0) dedRows.push({ label: 'Donations (80G)', old: summary.oldDeductions.donations, new: 0 });
  if (summary.oldDeductions.disability80U > 0) dedRows.push({ label: 'Disability (80U)', old: summary.oldDeductions.disability80U, new: 0 });
  if (summary.oldDeductions.disability80DD > 0) dedRows.push({ label: 'Dependent Disability (80DD)', old: summary.oldDeductions.disability80DD, new: 0 });

  return (
    <div className="results">
      {/* Top Action / ELI21 Bar */}
      <div className="results__topbar">
        <label className="results__eli21-toggle">
          <input
            type="checkbox"
            checked={state.eli21Mode}
            onChange={() => dispatch({ type: 'TOGGLE_ELI21' })}
            className="sr-only results__eli21-input"
          />
          <span className="results__eli21-switch" />
          <span className="results__eli21-label">
            💡 <strong>Explain Like I'm 21</strong> (Simple terms)
          </span>
        </label>

        <button className="results__share-btn" onClick={handleShare} type="button">
          {copied ? '✅ Copied Summary!' : '🔗 Share Result'}
        </button>
      </div>

      {/* Confetti absolute container */}
      {showConfetti && (
        <div className="results__confetti-container" aria-hidden="true">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className={`results__confetti-piece results__confetti-piece--${i % 5}`} style={{ left: `${(i / 30) * 100}%`, animationDelay: `${(i % 7) * 0.2}s` }} />
          ))}
        </div>
      )}

      {/* Hero Card */}
      <div className={`results__hero results__hero--${betterRegime}`}>
        <div className="results__hero-badge">FY 2026-27 · Tax Recommendation</div>
        <h1 className="results__hero-title">
          Pick the <span className="results__hero-regime">{regimeLabel} Tax Regime</span>
        </h1>
        {savings > 0 ? (
          <p className="results__hero-savings">
            You save <span className="results__hero-amount">Rs. {formatIndianNumber(savings)}</span> per year
          </p>
        ) : (
          <p className="results__hero-savings">Both regimes result in the identical tax amount.</p>
        )}
        <div className="results__hero-taxes">
          <div className={`results__hero-tax-card ${betterRegime === 'old' ? 'results__hero-tax-card--winner' : ''}`}>
            <span className="results__hero-tax-label">Old Regime Tax</span>
            <span className="results__hero-tax-value">Rs. {formatIndianNumber(oldTax.totalTax)}</span>
          </div>
          <div className="results__hero-vs">VS</div>
          <div className={`results__hero-tax-card ${betterRegime === 'new' ? 'results__hero-tax-card--winner' : ''}`}>
            <span className="results__hero-tax-label">New Regime Tax</span>
            <span className="results__hero-tax-value">Rs. {formatIndianNumber(newTax.totalTax)}</span>
          </div>
        </div>
      </div>

      {/* Salary Lifestyle Comparison */}
      {savings > 0 && (
        <div className="results__lifestyle">
          <h3 className="results__lifestyle-title">✨ What your annual savings equal in real life:</h3>
          <div className="results__lifestyle-grid">
            <div className="results__lifestyle-card">
              <span className="results__lifestyle-icon">🍿</span>
              <span className="results__lifestyle-count">{Math.floor(savings / 649)} months</span>
              <span className="results__lifestyle-desc">of Premium OTT streaming</span>
            </div>
            <div className="results__lifestyle-card">
              <span className="results__lifestyle-icon">☕</span>
              <span className="results__lifestyle-count">{Math.floor(savings / 400)} orders</span>
              <span className="results__lifestyle-desc">of gourmet coffee & snacks</span>
            </div>
            <div className="results__lifestyle-card">
              <span className="results__lifestyle-icon">🎬</span>
              <span className="results__lifestyle-count">{Math.floor(savings / 300)} tickets</span>
              <span className="results__lifestyle-desc">to premium weekend movies</span>
            </div>
          </div>
        </div>
      )}

      {/* Thermometer */}
      <div className="results__thermometer">
        <div className="results__thermometer-header">
          <span className="results__thermometer-title">🌡️ Tax Savings Thermometer (Old Regime Headroom)</span>
          <span className="results__thermometer-stat">{utilizedPercent}% Utilized</span>
        </div>
        <p className="results__thermometer-desc">
          You are claiming <strong>Rs. {formatIndianNumber(summary.totalOldDeductions)}</strong> out of typical core deductions (Rs. {formatIndianNumber(typicalMaxDeductions)}).
        </p>
        <div className="results__thermometer-track">
          <div className="results__thermometer-fill" style={{ width: `${utilizedPercent}%` }} />
        </div>
      </div>

      {/* Educational Bullets & Suggestions */}
      <div className="results__insights">
        <div className="results__insight-col">
          <h3 className="results__insight-title">🎓 Why this happens:</h3>
          <ul className="results__insight-list">
            <li>Standard deduction of Rs. 75,000 applies instantly to both regimes.</li>
            {summary.oldDeductions.hra > 0 && (
              <li>Your rent inputs gave an approved HRA exemption of <strong>Rs. {formatIndianNumber(summary.oldDeductions.hra)}</strong> under the Old Regime.</li>
            )}
            {summary.oldDeductions.sec80C > 0 && (
              <li>Section 80C core investments trimmed your taxable income by <strong>Rs. {formatIndianNumber(summary.oldDeductions.sec80C)}</strong> in the Old Regime.</li>
            )}
            {summary.oldDeductions.employerNPS > 0 && (
              <li>Your employer's NPS contribution gives dual tax-savings in <strong>both</strong> Old and New regimes simultaneously.</li>
            )}
            {newTax.rebate87A > 0 && (
              <li>New Regime qualifies for Rebate 87A discount of <strong>Rs. {formatIndianNumber(newTax.rebate87A)}</strong>, pulling down core tax liabilities.</li>
            )}
          </ul>
        </div>

        <div className="results__insight-col">
          <h3 className="results__insight-title">💡 Actionable suggestions:</h3>
          <ul className="results__insight-list results__insight-list--suggestions">
            {summary.oldDeductions.sec80C < 150000 ? (
              <li>You have <strong>Rs. {formatIndianNumber(150000 - summary.oldDeductions.sec80C)}</strong> of unused 80C headroom. Maxing this out could lower Old Regime tax further.</li>
            ) : (
              <li>Excellent job maximizing your full Section 80C ₹1.5L investment limit!</li>
            )}
            {summary.oldDeductions.empNPS === 0 && (
              <li>Adding up to Rs. 50,000 to personal NPS (Tier 1) unlocks an exclusive extra deduction u/s 80CCD(1B) in the Old Regime.</li>
            )}
            {state.healthInsurance.parentsPremium === 0 && (
              <li>Medical insurance premiums for parents provide an extra Rs. 25,000 to Rs. 50,000 deduction u/s 80D.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Expandable Slabs Breakdown Accordion */}
      <div className="results__accordion">
        <button
          className="results__accordion-trigger"
          onClick={() => setShowSlabs(!showSlabs)}
          type="button"
          aria-expanded={showSlabs}
        >
          <span>📑 View Slab-by-Slab Calculation Breakdown</span>
          <span className="results__accordion-icon">{showSlabs ? '▲' : '▼'}</span>
        </button>

        {showSlabs && (
          <div className="results__accordion-content">
            <div className="results__slabs-grid">
              <div className="results__slabs-col">
                <h4 className="results__slabs-title">Old Regime Slabs Breakdown</h4>
                <table className="results__slabs-table">
                  <thead>
                    <tr>
                      <th>Income Bracket</th>
                      <th>Rate</th>
                      <th>Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {oldTax.slabs.map((s, idx) => (
                      <tr key={idx}>
                        <td>Rs. {formatIndianNumber(s.from)} — {s.to ? `Rs. ${formatIndianNumber(s.to)}` : 'Above'}</td>
                        <td>{s.rate * 100}%</td>
                        <td>Rs. {formatIndianNumber(s.taxFromSlab)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="results__slabs-col">
                <h4 className="results__slabs-title">New Regime Slabs Breakdown</h4>
                <table className="results__slabs-table">
                  <thead>
                    <tr>
                      <th>Income Bracket</th>
                      <th>Rate</th>
                      <th>Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newTax.slabs.map((s, idx) => (
                      <tr key={idx}>
                        <td>Rs. {formatIndianNumber(s.from)} — {s.to ? `Rs. ${formatIndianNumber(s.to)}` : 'Above'}</td>
                        <td>{s.rate * 100}%</td>
                        <td>Rs. {formatIndianNumber(s.taxFromSlab)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* What-If Playground Panel */}
      <div className="results__playground">
        <button
          className="results__playground-trigger"
          onClick={() => setShowPlayground(!showPlayground)}
          type="button"
          aria-expanded={showPlayground}
        >
          <span>🧪 What-If Playground (Simulate more investments)</span>
          <span className="results__accordion-icon">{showPlayground ? '▲' : '▼'}</span>
        </button>

        {showPlayground && (
          <div className="results__playground-content">
            <p className="results__playground-hint">
              Instantly adjust parameters to see if extra investments shift the winning regime recommendation.
            </p>

            <div className="results__sliders">
              <div className="results__slider-group">
                <div className="results__slider-header">
                  <label htmlFor="extra80C-slider">Extra 80C Investments</label>
                  <span>+Rs. {formatIndianNumber(extra80C)}</span>
                </div>
                <input
                  id="extra80C-slider"
                  type="range"
                  min="0"
                  max="150000"
                  step="5000"
                  value={extra80C}
                  onChange={(e) => setExtra80C(Number(e.target.value))}
                  className="results__range"
                />
              </div>

              <div className="results__slider-group">
                <div className="results__slider-header">
                  <label htmlFor="extraNPS-slider">Extra NPS (Tier 1)</label>
                  <span>+Rs. {formatIndianNumber(extraNPS)}</span>
                </div>
                <input
                  id="extraNPS-slider"
                  type="range"
                  min="0"
                  max="50000"
                  step="5000"
                  value={extraNPS}
                  onChange={(e) => setExtraNPS(Number(e.target.value))}
                  className="results__range"
                />
              </div>

              <div className="results__slider-group">
                <div className="results__slider-header">
                  <label htmlFor="salary-slider">Hypothetical Salary Change</label>
                  <span>{salaryChangePercent >= 0 ? `+${salaryChangePercent}%` : `${salaryChangePercent}%`}</span>
                </div>
                <input
                  id="salary-slider"
                  type="range"
                  min="-20"
                  max="50"
                  step="5"
                  value={salaryChangePercent}
                  onChange={(e) => setSalaryChangePercent(Number(e.target.value))}
                  className="results__range"
                />
              </div>
            </div>

            <div className="results__hypo-card">
              <div className="results__hypo-stat">
                <span>Simulation Winner: <strong>{hypoWinner} Regime</strong></span>
                <span className="results__hypo-tax">Old: Rs. {formatIndianNumber(hypoOldTax.totalTax)} | New: Rs. {formatIndianNumber(hypoNewTax.totalTax)}</span>
              </div>
              <button className="results__playground-reset" onClick={resetPlayground} type="button">
                Reset Sim
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full Comparison Table */}
      <div className="results__table-wrap">
        <h2 className="results__table-title">📊 Detailed Comparison</h2>
        <div className="results__table-scroll">
          <table className="results__table">
            <thead>
              <tr>
                <th className="results__th results__th--label">Particulars</th>
                <th className="results__th results__th--value">Old Regime</th>
                <th className="results__th results__th--value">New Regime</th>
              </tr>
            </thead>
            <tbody>
              {/* Income Section */}
              <tr className="results__section-header"><td colSpan={3}>{translate('Income')}</td></tr>
              <Row label={translate('Annual In-Hand Salary')} oldVal={summary.income.annualInHand} newVal={summary.income.annualInHand} />
              {summary.income.bonus > 0 && <Row label={translate('Bonus / Arrears')} oldVal={summary.income.bonus} newVal={summary.income.bonus} />}
              {summary.income.otherIncome > 0 && <Row label={translate('Other Income (Interest)')} oldVal={summary.income.otherIncome} newVal={summary.income.otherIncome} />}
              {summary.income.pfAnnual > 0 && <Row label={translate('Employee PF (add-back)')} oldVal={summary.income.pfAnnual} newVal={summary.income.pfAnnual} />}
              {summary.income.profTax > 0 && <Row label={translate('Professional Tax (add-back)')} oldVal={summary.income.profTax} newVal={summary.income.profTax} />}
              <Row label={translate('Gross Total Income')} oldVal={summary.income.grossTotalIncome} newVal={summary.income.grossTotalIncome} bold />

              {/* Deductions Section */}
              <tr className="results__section-header"><td colSpan={3}>{translate('Deductions')}</td></tr>
              {dedRows.map((r, i) => <Row key={i} label={translate(r.label)} oldVal={r.old} newVal={r.new} />)}
              <Row label={translate('Total Deductions')} oldVal={summary.totalOldDeductions} newVal={summary.newDeductions.total} bold />

              {/* Taxable Income */}
              <tr className="results__section-header"><td colSpan={3}>{translate('Tax Calculation')}</td></tr>
              <Row label={translate('Taxable Income')} oldVal={summary.taxableOld} newVal={summary.taxableNew} bold />
              <Row label={translate('Tax Before Rebate')} oldVal={oldTax.taxBeforeRebate} newVal={newTax.taxBeforeRebate} />
              <Row label={translate('Rebate u/s 87A')} oldVal={oldTax.rebate87A} newVal={newTax.rebate87A} />
              <Row label={translate('Tax After Rebate')} oldVal={oldTax.taxAfterRebate} newVal={newTax.taxAfterRebate} />
              <Row label={translate('Health & Edu. Cess (4%)')} oldVal={oldTax.cess} newVal={newTax.cess} />
              <Row label={translate('Total Tax Payable')} oldVal={oldTax.totalTax} newVal={newTax.totalTax} bold highlight />
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="results__actions">
        <button className="results__start-over" onClick={handleStartOver} id="start-over-btn" type="button">
          ← Start Over
        </button>
      </div>

      {/* Disclaimer */}
      <div className="results__disclaimer">
        <p><strong>Disclaimer:</strong> This tool provides an indicative tax comparison based on publicly available FY 2026-27 tax rules. It is not tax advice. Consult a qualified CA for your actual filing. Your data never leaves this browser.</p>
      </div>
    </div>
  );
}
