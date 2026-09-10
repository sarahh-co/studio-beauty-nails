import Section from "./ui/Section";
import Reveal from "./ui/Reveal";
import { faq } from "@/data/faq";

export default function Faq() {
  return (
    <Section id="faq" className="bg-creme">
      <Reveal>
        <h2 className="font-serif text-[28px] leading-tight text-sauge-fonce">
          Questions fréquentes
        </h2>
      </Reveal>

      <div className="mt-10 max-w-2xl border-t border-sauge-clair">
        {faq.map((item) => (
          <details key={item.question} className="border-b border-sauge-clair">
            <summary className="faq-summary flex min-h-11 cursor-pointer items-center justify-between gap-4 py-5 font-sans text-lg font-medium text-sauge-fonce">
              {item.question}
              <svg
                aria-hidden="true"
                className="faq-icon h-5 w-5 shrink-0 text-sauge-fonce"
                viewBox="0 0 20 20"
                fill="none"
              >
                <line
                  x1="10"
                  y1="4"
                  x2="10"
                  y2="16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="4"
                  y1="10"
                  x2="16"
                  y2="10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </summary>
            <p className="faq-answer whitespace-pre-line pb-5 pr-9 text-base leading-relaxed text-sauge-fonce">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}
