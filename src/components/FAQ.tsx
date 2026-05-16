import { useState } from 'react';
import './FAQ.css';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

/**
 * FAQ Accordion — PRD §3.1
 * 2-3 common doubts at the bottom of each step.
 */
export default function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faq">
      <div className="faq__header">
        <span className="faq__header-icon" aria-hidden="true">💡</span>
        <span className="faq__header-text">Common questions</span>
      </div>
      <div className="faq__list">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className={`faq__item ${isOpen ? 'faq__item--open' : ''}`}>
              <button
                className="faq__question"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <span className={`faq__chevron ${isOpen ? 'faq__chevron--open' : ''}`} aria-hidden="true">
                  ›
                </span>
              </button>
              <div className={`faq__answer-wrapper ${isOpen ? 'faq__answer-wrapper--open' : ''}`}>
                <p className="faq__answer">{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
