"use client";

import { useEffect, useRef, useState } from "react";
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
import { openingHoursNote, phoneHref, instagramUrl } from "@/data/site";

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

type Step = "prestations" | "creneau" | "coordonnees" | "contact" | "confirmee";

const STEP_ORDER: Step[] = ["prestations", "creneau", "coordonnees"];

const STEP_LABELS: Record<Step, string> = {
  prestations: "Prestations",
  creneau: "Créneau",
  coordonnees: "Coordonnées",
  contact: "Contact",
  confirmee: "Confirmée",
};

const STEP_SUBTITLES: Record<Step, string> = {
  prestations: "Choisissez vos prestations, le prix s’affiche en direct.",
  creneau: "Choisissez le jour et l’heure.",
  coordonnees: "Vos coordonnées pour confirmer.",
  contact: "",
  confirmee: "",
};

const fullDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatFullDate(iso: string): string {
  return fullDateFormatter.format(new Date(iso));
}

function validateName(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length >= 2 && trimmed.length <= 80
    ? null
    : "Merci d’indiquer votre nom et prénom.";
}

function validateEmail(value: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ? null
    : "Adresse e-mail invalide.";
}

function validatePhone(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length >= 6 && trimmed.length <= 20
    ? null
    : "Numéro de téléphone invalide.";
}

function validateConsent(value: boolean): string | null {
  return value ? null : "Veuillez accepter pour continuer.";
}

function buildContactRecapText(quote: NonNullable<ReturnType<typeof getQuote>>): string {
  const lineStrings = quote.lines.map(
    (line) => `${line.label} ${line.price === null ? "sur devis" : `${line.price} €`}`
  );
  const total = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(quote.total);

  return [
    ...lineStrings,
    `Total : ${total}${quote.hasDevis ? " + devis" : ""}`,
    `Durée : ${formatDuration(quote.durationMinutes)}`,
  ].join("\n");
}

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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [phoneFailCount, setPhoneFailCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [creneauNotice, setCreneauNotice] = useState<string | null>(null);
  const [slotPickerKey, setSlotPickerKey] = useState(0);
  const [clipboardAvailable, setClipboardAvailable] = useState(false);
  const [recapCopied, setRecapCopied] = useState(false);
  const submittingRef = useRef(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  const nameError = validateName(name);
  const emailError = validateEmail(email);
  const phoneError = validatePhone(phone);
  const consentError = validateConsent(consent);
  const formIsValid = !nameError && !emailError && !phoneError && !consentError;

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

  // Checked client-side only, after mount, to avoid an SSR/client mismatch.
  useEffect(() => {
    setClipboardAvailable(
      typeof navigator !== "undefined" && !!navigator.clipboard
    );
  }, []);

  function goToStep(next: Step) {
    window.history.pushState({ step: next }, "");
    setStep(next);
  }

  function goBackOneStep() {
    window.history.back();
  }

  function goToPrestations() {
    if (step === "contact") {
      // Reached directly from "prestations" — always exactly one hop away.
      window.history.back();
      return;
    }
    const currentIndex = STEP_ORDER.indexOf(step);
    if (currentIndex > 0) {
      window.history.go(-currentIndex);
    }
  }

  async function handleCopyRecap() {
    if (!quote) return;
    try {
      await navigator.clipboard.writeText(buildContactRecapText(quote));
      setRecapCopied(true);
      setTimeout(() => setRecapCopied(false), 2000);
    } catch {
      // Clipboard write failed — the button simply won't confirm.
    }
  }

  async function handleSubmit() {
    setSubmitAttempted(true);

    if (nameError) {
      nameRef.current?.focus();
      return;
    }
    if (emailError) {
      emailRef.current?.focus();
      return;
    }
    if (phoneError) {
      setPhoneFailCount((c) => c + 1);
      phoneRef.current?.focus();
      return;
    }
    if (consentError) {
      consentRef.current?.focus();
      return;
    }
    if (!selectedSlot || submittingRef.current) return;

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selection,
          slotIso: selectedSlot,
          name,
          email,
          phone,
          consent,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        goToStep("confirmee");
        return;
      }

      if (response.status === 409) {
        setCreneauNotice(data.error ?? "Ce créneau vient d’être réservé.");
        setSelectedSlot(null);
        setSlotPickerKey((key) => key + 1);
        goToStep("creneau");
        return;
      }

      setSubmitError(data.error ?? "Une erreur est survenue.");
    } catch {
      setSubmitError("Une erreur réseau est survenue. Réessayez.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
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
  // hasDevis is set by getQuote() only when a zone has nail art selected.
  const goingToContact = quote?.hasDevis === true;
  const progressLabel =
    step === "contact"
      ? "Étape 2 sur 2 · Contact"
      : `Étape ${stepIndex + 1} sur 3 · ${STEP_LABELS[step]}`;

  if (step === "confirmee" && quote && selectedSlot) {
    const isSurDemande = quote.route === "sur-demande";
    return (
      <div className="bg-creme">
        <Container className="flex flex-col items-start gap-4 pb-16">
          <div
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-sauge-fonce text-creme"
          >
            <CheckIcon />
          </div>

          {isSurDemande ? (
            <h2 className="font-serif text-2xl text-sauge-fonce">
              Votre demande a bien été envoyée.
            </h2>
          ) : (
            <h2 className="font-serif text-2xl text-sauge-fonce">
              C’est confirmé !
            </h2>
          )}

          <p className="text-sauge-fonce">
            {formatFullDate(selectedSlot)} à {formatTimeLabel(selectedSlot)}
          </p>

          <div className="w-full">
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
            <p className="mt-3 font-serif text-xl text-sauge-fonce">
              {formattedTotal}
              {quote.hasDevis && " + devis"}
            </p>
          </div>

          {isSurDemande ? (
            <p className="text-sauge-fonce">
              La prothésiste vous confirmera le rendez-vous.
            </p>
          ) : (
            <p className="text-sauge-fonce">
              Un e-mail de confirmation vient de vous être envoyé.
            </p>
          )}

          <Button href="/" variant="ghost" className="mt-4">
            Retour à l’accueil
          </Button>
        </Container>
      </div>
    );
  }

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
              {progressLabel}
            </p>
            <p className="mt-3 font-sans text-sm text-sauge-fonce">
              {STEP_SUBTITLES[step]}
            </p>
          </div>

          {step !== "prestations" && step !== "contact" && quote && (
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
            <div>
              {creneauNotice && (
                <p className="mb-3 text-sm text-rose-profond">{creneauNotice}</p>
              )}
              <SlotPicker
                key={slotPickerKey}
                selection={selection}
                selectedSlot={selectedSlot}
                onSelectSlot={(iso) => {
                  setCreneauNotice(null);
                  setSelectedSlot(iso);
                }}
              />
            </div>
          )}

          {step === "coordonnees" && (
            <div className="flex flex-col gap-5">
              <div>
                <label
                  htmlFor="reserver-nom"
                  className="mb-1 block text-sm text-sauge-fonce"
                >
                  Nom et prénom
                </label>
                <input
                  id="reserver-nom"
                  ref={nameRef}
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={submitAttempted && !!nameError}
                  className="min-h-11 w-full rounded-lg border border-sauge-clair bg-white px-4 text-sauge-fonce focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauge-fonce"
                />
                {submitAttempted && nameError && (
                  <p className="mt-1 text-sm text-rose-profond">{nameError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="reserver-email"
                  className="mb-1 block text-sm text-sauge-fonce"
                >
                  E-mail
                </label>
                <input
                  id="reserver-email"
                  ref={emailRef}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={submitAttempted && !!emailError}
                  className="min-h-11 w-full rounded-lg border border-sauge-clair bg-white px-4 text-sauge-fonce focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauge-fonce"
                />
                {submitAttempted && emailError && (
                  <p className="mt-1 text-sm text-rose-profond">{emailError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="reserver-telephone"
                  className="mb-1 block text-sm text-sauge-fonce"
                >
                  Téléphone
                </label>
                <input
                  id="reserver-telephone"
                  ref={phoneRef}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={submitAttempted && !!phoneError}
                  className="min-h-11 w-full rounded-lg border border-sauge-clair bg-white px-4 text-sauge-fonce focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauge-fonce"
                />
                {submitAttempted && phoneError && (
                  <p className="mt-1 text-sm text-rose-profond">{phoneError}</p>
                )}
                {submitAttempted && phoneError && phoneFailCount >= 2 && (
                  <p className="mt-1 text-sm text-sauge-clair">Format : 06 12 34 56 78</p>
                )}
              </div>

              <div>
                <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm text-sauge-fonce has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sauge-fonce">
                  <input
                    ref={consentRef}
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    aria-invalid={submitAttempted && !!consentError}
                    className="mt-0.5"
                  />
                  J’accepte que mes coordonnées soient utilisées pour gérer mon
                  rendez-vous.
                </label>
                {submitAttempted && consentError && (
                  <p className="mt-1 text-sm text-rose-profond">{consentError}</p>
                )}
              </div>

              {submitError && (
                <p className="text-sm text-rose-profond">{submitError}</p>
              )}
            </div>
          )}

          {step === "contact" && quote && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-serif text-2xl text-sauge-fonce">
                  Votre nail art est sur devis
                </h2>
                <p className="mt-2 text-sauge-fonce">
                  Envoyez-moi votre inspiration et je vous propose un prix et
                  un créneau.
                </p>
              </div>

              <div>
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
                <p className="mt-3 font-serif text-xl text-sauge-fonce">
                  {formattedTotal} + devis
                </p>
              </div>

              {clipboardAvailable && (
                <button
                  type="button"
                  onClick={handleCopyRecap}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-sauge-clair px-4 text-sauge-fonce focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauge-fonce"
                >
                  {recapCopied ? "Copié" : "Copier le récapitulatif"}
                </button>
              )}

              <Button href={instagramUrl} target="_blank" rel="noopener noreferrer">
                Écrire sur Instagram
              </Button>

              <Button href={phoneHref} variant="ghost">
                Appeler
              </Button>

              <button
                type="button"
                onClick={goToPrestations}
                className="min-h-11 text-sm text-sauge-fonce underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauge-fonce"
              >
                Retour
              </button>
            </div>
          )}
        </div>
      </Container>

      {step !== "contact" && (
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
                    : !formIsValid || submitting
              }
              onClick={() => {
                if (step === "prestations") {
                  if (goingToContact) {
                    goToStep("contact");
                  } else {
                    goToStep("creneau");
                  }
                } else if (step === "creneau") {
                  goToStep("coordonnees");
                } else if (step === "coordonnees") {
                  handleSubmit();
                }
              }}
            >
              {step === "prestations"
                ? goingToContact
                  ? "Contacter la prothésiste"
                  : quote?.route === "sur-demande"
                    ? "Envoyer une demande"
                    : "Choisir un créneau"
                : step === "creneau"
                  ? "Continuer"
                  : submitting
                    ? "Réservation en cours…"
                    : "Confirmer"}
            </Button>
            {step === "prestations" &&
              !selectedSlot &&
              !goingToContact &&
              quote?.route === "sur-demande" && (
                <p className="text-sm text-sauge-fonce">
                  Confirmation par la prothésiste
                </p>
              )}
          </div>
        </Container>
      </div>
      )}
    </div>
  );
}
