"use client";

import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Stepper from "@/components/reserver/Stepper";
import SlotPicker, {
  formatDayLabel,
  formatTimeLabel,
} from "@/components/reserver/SlotPicker";
import {
  getQuote,
  type Selection,
  type ZoneChoice,
  type FrenchStyle,
} from "@/lib/quote";
import {
  services,
  supplements,
  servicesParCategorie,
  type Categorie,
  type Service,
} from "@/data/services";
import { formatDuration } from "@/lib/formatDuration";
import { openingHoursNote } from "@/data/site";

const ZONE_LABELS: Record<Categorie, string> = {
  mains: "Mains",
  pieds: "Pieds",
};

const FRENCH_STYLE_LABELS: Record<FrenchStyle, string> = {
  french: "French",
  babyboomer: "Babyboomer",
  chrome: "Chrome",
};

const NONE_VALUE = "none";

const initialSelection: Selection = {
  mains: null,
  pieds: null,
  horsHoraires: false,
};

type Step = "prestations" | "creneau" | "coordonnees";

const STEP_ORDER: Step[] = ["prestations", "creneau", "coordonnees"];

const STEP_LABELS: Record<Step, string> = {
  prestations: "Prestations",
  creneau: "Créneau",
  coordonnees: "Coordonnées",
};

const STEP_SUBTITLES: Record<Step, string> = {
  prestations: "Choisissez vos prestations, le prix s’affiche en direct.",
  creneau: "Choisissez le jour et l’heure.",
  coordonnees: "Vos coordonnées pour confirmer.",
};

function createFreshZone(serviceId: string): ZoneChoice {
  return {
    serviceId,
    depose: false,
    frenchCount: 0,
    frenchStyle: "french",
    strassCount: 0,
    fleur3dCount: 0,
    tailleXL: false,
    nailArt: false,
    beaute: false,
  };
}

function getServiceLabel(service: Service): string {
  return service.id.startsWith("depose-") ? "Dépose seule" : service.nom;
}

function findSupplementPrice(id: string): number | null {
  const supplement = supplements.find((s) => s.id === id);
  return supplement ? supplement.prix : null;
}

function findService(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M3 8.5L6.2 11.5L13 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ServiceRadioCardProps = {
  name: string;
  value: string;
  label: string;
  price: number | null;
  checked: boolean;
  onChange: () => void;
};

function ServiceRadioCard({
  name,
  value,
  label,
  price,
  checked,
  onChange,
}: ServiceRadioCardProps) {
  return (
    <label
      className={`flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-xl px-4 py-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sauge-fonce ${
        checked
          ? "border-2 border-sauge-fonce bg-white"
          : "border border-sauge-clair bg-white"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className="flex items-center gap-2 text-sauge-fonce">
        {checked && <CheckIcon />}
        {label}
      </span>
      {price !== null && <span className="text-sauge-fonce">{price} €</span>}
    </label>
  );
}

type CheckboxRowProps = {
  label: string;
  price: number | null;
  checked: boolean;
  onChange: (checked: boolean) => void;
  note?: string;
};

function CheckboxRow({ label, price, checked, onChange, note }: CheckboxRowProps) {
  return (
    <div>
      <label
        className={`flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-xl px-4 py-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sauge-fonce ${
          checked
            ? "border-2 border-sauge-fonce bg-white"
            : "border border-sauge-clair bg-white"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <span className="flex items-center gap-2 text-sauge-fonce">
          {checked && <CheckIcon />}
          {label}
        </span>
        <span className="text-sauge-fonce">
          {price === null ? "sur devis" : `${price} €`}
        </span>
      </label>
      {note && <p className="mt-1 px-4 text-sm text-sauge">{note}</p>}
    </div>
  );
}

type OptionsPanelProps = {
  zoneKey: Categorie;
  service: Service;
  zone: ZoneChoice;
  onUpdate: (updates: Partial<ZoneChoice>) => void;
};

function OptionsPanel({ zoneKey, service, zone, onUpdate }: OptionsPanelProps) {
  const deposeService = findService(`depose-${zoneKey}`);
  const beauteService = findService(`${zoneKey}-beaute`);
  const frenchPrice = findSupplementPrice("french");
  const strassPrice = findSupplementPrice("strass");
  const fleur3dPrice = findSupplementPrice("fleur3d");
  const tailleXLPrice = findSupplementPrice("taille");

  return (
    <div className="ml-4 flex flex-col gap-3 border-l-2 border-sauge-clair pl-4">
      {service.allowsDepose && deposeService && (
        <CheckboxRow
          label="Retrait de l’ancienne pose"
          price={deposeService.prix}
          checked={zone.depose}
          onChange={(checked) => onUpdate({ depose: checked })}
        />
      )}

      {service.allowsBeaute && beauteService && (
        <CheckboxRow
          label={beauteService.nom}
          price={beauteService.prix}
          checked={zone.beaute}
          onChange={(checked) => onUpdate({ beaute: checked })}
        />
      )}

      {service.allowsDeco && (
        <>
          <div>
            <Stepper
              label="French / Babyboomer / Chrome"
              priceLabel={`${frenchPrice} € / ongle`}
              count={zone.frenchCount}
              onChange={(frenchCount) => onUpdate({ frenchCount })}
            />
            {zone.frenchCount > 0 && (
              <div className="mt-2 flex gap-2">
                {(["french", "babyboomer", "chrome"] as const).map((style) => (
                  <label
                    key={style}
                    className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full px-3 text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sauge-fonce ${
                      zone.frenchStyle === style
                        ? "border-2 border-sauge-fonce bg-white"
                        : "border border-sauge-clair bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`frenchStyle-${zoneKey}`}
                      value={style}
                      checked={zone.frenchStyle === style}
                      onChange={() => onUpdate({ frenchStyle: style })}
                      className="sr-only"
                    />
                    <span className="text-sauge-fonce">
                      {FRENCH_STYLE_LABELS[style]}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <Stepper
            label="Gros strass"
            priceLabel={`${strassPrice} € / ongle`}
            count={zone.strassCount}
            onChange={(strassCount) => onUpdate({ strassCount })}
          />

          <Stepper
            label="Fleur 3D"
            priceLabel={`${fleur3dPrice} € / ongle`}
            count={zone.fleur3dCount}
            onChange={(fleur3dCount) => onUpdate({ fleur3dCount })}
          />

          <CheckboxRow
            label="Nail art (sur devis)"
            price={null}
            checked={zone.nailArt}
            onChange={(checked) => onUpdate({ nailArt: checked })}
            note="Le prix vous sera communiqué par la prothésiste."
          />
        </>
      )}

      {service.allowsTailleXL && (
        <CheckboxRow
          label="Taille L/XL"
          price={tailleXLPrice}
          checked={zone.tailleXL}
          onChange={(checked) => onUpdate({ tailleXL: checked })}
        />
      )}
    </div>
  );
}

export default function Configurateur() {
  const [selection, setSelection] = useState<Selection>(initialSelection);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("prestations");

  let quote = null as ReturnType<typeof getQuote>;
  let error: string | null = null;
  try {
    quote = getQuote(selection);
  } catch (e) {
    error = e instanceof Error ? e.message : "Une erreur est survenue.";
  }

  // Any change to the selection invalidates a previously chosen slot.
  useEffect(() => {
    setSelectedSlot(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  // Tag the current history entry so the browser back button can return to
  // step 1 instead of leaving the page, then track further step changes.
  useEffect(() => {
    window.history.replaceState({ step: "prestations" }, "");

    function handlePopState(event: PopStateEvent) {
      const nextStep = (event.state?.step as Step | undefined) ?? "prestations";
      setStep(nextStep);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Scroll to the top after the new step has rendered.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  function goToStep(next: Step) {
    window.history.pushState({ step: next }, "");
    setStep(next);
  }

  function goBackOneStep() {
    window.history.back();
  }

  function goToPrestations() {
    const currentIndex = STEP_ORDER.indexOf(step);
    if (currentIndex > 0) {
      window.history.go(-currentIndex);
    }
  }

  function handleServiceChange(zoneKey: Categorie, serviceId: string) {
    setSelection((prev) => ({
      ...prev,
      [zoneKey]: serviceId === NONE_VALUE ? null : createFreshZone(serviceId),
    }));
  }

  function updateZone(zoneKey: Categorie, updates: Partial<ZoneChoice>) {
    setSelection((prev) => {
      const current = prev[zoneKey];
      if (!current) return prev;
      return { ...prev, [zoneKey]: { ...current, ...updates } };
    });
  }

  const hasAnyPrestation = selection.mains !== null || selection.pieds !== null;
  const horsHorairesPrice = findSupplementPrice("hors-horaires");

  const formattedTotal =
    quote &&
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(quote.total);

  const recapLine = quote
    ? quote.lines.map((line) => line.label).join(" · ")
    : "";
  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <div className="bg-creme">
      <Container className="pb-32">
        <div className="flex flex-col gap-10">
          <div>
            {step !== "prestations" && (
              <button
                type="button"
                onClick={goBackOneStep}
                className="mb-2 flex min-h-11 items-center text-sauge-fonce focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauge-fonce"
              >
                ← Retour
              </button>
            )}
            <p className="font-sans text-sm text-sauge-fonce">
              Étape {stepIndex + 1} sur 3 · {STEP_LABELS[step]}
            </p>
            <p className="mt-3 font-sans text-sm text-sauge-fonce">
              {STEP_SUBTITLES[step]}
            </p>
          </div>

          {step !== "prestations" && quote && (
            <div className="flex items-start justify-between gap-4">
              <p className="line-clamp-2 text-sm text-sauge-fonce">
                {recapLine}
              </p>
              <button
                type="button"
                onClick={goToPrestations}
                className="min-h-11 shrink-0 text-sm text-sauge-fonce underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauge-fonce"
              >
                Modifier
              </button>
            </div>
          )}

          {step === "prestations" && (
            <>
              {(["mains", "pieds"] as const).map((zoneKey) => {
                const zone = selection[zoneKey];
                const groupName = `service-${zoneKey}`;
                return (
                  <fieldset key={zoneKey}>
                    <legend className="mb-4 font-serif text-xl text-sauge-fonce">
                      {ZONE_LABELS[zoneKey]}
                    </legend>
                    <div className="flex flex-col gap-3">
                      <ServiceRadioCard
                        name={groupName}
                        value={NONE_VALUE}
                        label="Aucune prestation"
                        price={null}
                        checked={zone === null}
                        onChange={() => handleServiceChange(zoneKey, NONE_VALUE)}
                      />
                      {servicesParCategorie(zoneKey).map((service) => (
                        <div key={service.id} className="flex flex-col gap-3">
                          <ServiceRadioCard
                            name={groupName}
                            value={service.id}
                            label={getServiceLabel(service)}
                            price={service.prix}
                            checked={zone?.serviceId === service.id}
                            onChange={() =>
                              handleServiceChange(zoneKey, service.id)
                            }
                          />
                          {zone?.serviceId === service.id && (
                            <OptionsPanel
                              zoneKey={zoneKey}
                              service={service}
                              zone={zone}
                              onUpdate={(updates) => updateZone(zoneKey, updates)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </fieldset>
                );
              })}

              {hasAnyPrestation && (
                <fieldset>
                  <legend className="mb-4 font-serif text-xl text-sauge-fonce">
                    Horaires
                  </legend>
                  <CheckboxRow
                    label="Je souhaite un créneau en dehors des horaires"
                    price={horsHorairesPrice}
                    checked={selection.horsHoraires}
                    onChange={(checked) =>
                      setSelection((prev) => ({ ...prev, horsHoraires: checked }))
                    }
                  />
                  <p className="mt-2 text-sm text-sauge">{openingHoursNote}</p>
                </fieldset>
              )}

              {quote && (
                <div>
                  <h2 className="mb-4 font-serif text-xl text-sauge-fonce">
                    Récapitulatif
                  </h2>
                  <div className="flex flex-col">
                    {quote.lines.map((line, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-4 border-b border-sauge-clair/40 py-3"
                      >
                        <span className="text-sauge-fonce">{line.label}</span>
                        <span className="text-sauge-fonce">
                          {line.price === null ? "sur devis" : `${line.price} €`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {step === "creneau" && quote && (
            <SlotPicker
              selection={selection}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
            />
          )}

          {step === "coordonnees" && (
            <p className="text-sauge-fonce">
              Étape suivante : vos coordonnées
            </p>
          )}
        </div>
      </Container>

      <div className="reserver-bar fixed inset-x-0 bottom-0 z-40 border-t border-sauge-clair bg-creme">
        <Container className="flex items-center justify-between gap-4 py-4">
          <div>
            {error ? (
              <p className="text-sm text-rose-profond">{error}</p>
            ) : quote ? (
              <>
                <p className="font-serif text-2xl text-sauge-fonce">
                  {formattedTotal}
                  {quote.hasDevis && " + devis"}
                </p>
                {selectedSlot ? (
                  <p className="text-sm text-sauge-fonce">
                    {formatDayLabel(selectedSlot)} · {formatTimeLabel(selectedSlot)}
                  </p>
                ) : (
                  <p className="text-sm text-sauge-fonce">
                    Durée estimée : {formatDuration(quote.durationMinutes)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sauge-fonce">Choisissez une prestation</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            <Button
              variant="primary"
              disabled={
                step === "prestations"
                  ? !quote
                  : step === "creneau"
                    ? !selectedSlot
                    : true
              }
              onClick={() => {
                if (step === "prestations") {
                  goToStep("creneau");
                } else if (step === "creneau") {
                  goToStep("coordonnees");
                }
              }}
            >
              {step === "prestations"
                ? quote?.route === "sur-demande"
                  ? "Envoyer une demande"
                  : "Choisir un créneau"
                : "Continuer"}
            </Button>
            {step === "prestations" &&
              !selectedSlot &&
              quote?.route === "sur-demande" && (
                <p className="text-sm text-sauge-fonce">
                  Confirmation par la prothésiste
                </p>
              )}
          </div>
        </Container>
      </div>
    </div>
  );
}
