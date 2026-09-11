"use client";

type StepperProps = {
  label: string;
  priceLabel: string;
  count: number;
  onChange: (count: number) => void;
  min?: number;
  max?: number;
};

export default function Stepper({
  label,
  priceLabel,
  count,
  onChange,
  min = 0,
  max = 10,
}: StepperProps) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 rounded-xl border border-sauge-clair bg-white px-4 py-3">
      <div>
        <p className="text-sauge-fonce">{label}</p>
        <p className="text-sm text-sauge-fonce">{priceLabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Retirer un ongle"
          disabled={count <= min}
          onClick={() => onChange(Math.max(min, count - 1))}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sauge-clair text-lg text-sauge-fonce disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauge-fonce"
        >
          −
        </button>
        <span
          aria-live="polite"
          className="w-6 text-center text-sauge-fonce"
        >
          {count}
        </span>
        <button
          type="button"
          aria-label="Ajouter un ongle"
          disabled={count >= max}
          onClick={() => onChange(Math.min(max, count + 1))}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sauge-clair text-lg text-sauge-fonce disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauge-fonce"
        >
          +
        </button>
      </div>
    </div>
  );
}
