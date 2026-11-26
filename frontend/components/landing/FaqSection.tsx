'use client';

import { useState } from 'react';
import { FAQ_ITEMS } from '@/components/landing/faqData';
import { useReveal } from '@/components/landing/useReveal';
import { PlusIcon } from '@/components/ui/icons';

/** Sand chapter: eyebrow, heading and accordion rows. */
export function FaqSection() {
  const ref = useReveal<HTMLElement>();
  const [openIds, setOpenIds] = useState<number[]>([]);

  const toggle = (i: number) =>
    setOpenIds((ids) => (ids.includes(i) ? ids.filter((x) => x !== i) : [...ids, i]));

  return (
    <section ref={ref} id="faq" aria-labelledby="faq-title" className="scroll-mt-16 bg-sand text-ink py-chapter">
      <div className="content-1000">
        <div className="text-center mb-8 md:mb-12">
          <p data-reveal className="type-card-heading text-bronze-deep">Questions</p>
          <h2 id="faq-title" data-reveal className="type-heading mt-3">Answered plainly</h2>
        </div>

        <div>
          {FAQ_ITEMS.map(({ q, a }, i) => {
            const open = openIds.includes(i);
            return (
              <div key={q} data-reveal className="border-b border-ink/15 mb-3">
                <h3>
                  <button
                    type="button"
                    id={`faq-btn-${i}`}
                    aria-expanded={open}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => toggle(i)}
                    className="w-full min-h-[68px] flex items-center justify-between gap-6 text-left py-3 type-card-heading rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-deep"
                  >
                    <span className="text-[20px] leading-[26px] md:text-[24px] md:leading-[28px]">{q}</span>
                    <span className={`shrink-0 text-bronze transition-transform duration-300 ease-out ${open ? 'rotate-45' : ''}`}>
                      <PlusIcon className="w-8 h-8" />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-panel-${i}`}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  {/* inert keeps a collapsed answer out of the reading order (it is only visually 0 tall) */}
                  <div className="overflow-hidden" inert={!open}>
                    <p className="type-body text-muted max-w-[720px] pb-5">{a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
