"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";
import Button from "./ui/Button";
import {
  type Categorie,
  servicesParCategorie,
  supplements,
} from "@/data/services";

const CARD_LABELS: Record<Categorie, string> = {
  mains: "Tarifs mains",
  pieds: "Tarifs pieds",
};

const CARD_IMAGES: Record<Categorie, string> = {
  mains: "/tarifs-mains-sq.webp",
  pieds: "/tarifs-pieds-sq.webp",
};

export default function Tarifs() {
  const [open, setOpen] = useState<Categorie | null>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(null);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <Section id="prestations" className="bg-creme-fonce">
      <Reveal>
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-sauge" />
          <span className="text-[11px] uppercase tracking-[0.18em] text-sauge">
            PRESTATIONS & TARIFS
          </span>
        </div>
        <h2 className="mt-4 font-serif text-[28px] leading-tight text-sauge-fonce md:text-[40px]">
          Mains et pieds, à votre rythme.
        </h2>
      </Reveal>

      <Reveal delay={150}>
        <div className="mt-10 grid grid-cols-2 gap-4 md:gap-6">
          {(["mains", "pieds"] as const).map((categorie) => (
            <button
              key={categorie}
              type="button"
              onClick={() => setOpen(categorie)}
              aria-expanded={open === categorie}
              aria-controls="tarifs-panel"
              className="group relative aspect-[2/3] md:aspect-square w-full overflow-hidden rounded-2xl text-left"
            >
              <Image
                src={CARD_IMAGES[categorie]}
                fill
                sizes="(max-width: 768px) 50vw, 420px"
                alt=""
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

              <span className="absolute bottom-4 left-4 right-4 font-serif text-[20px] text-creme">
                {CARD_LABELS[categorie]}
              </span>
            </button>
          ))}
        </div>
      </Reveal>

      <div
        className={`fixed inset-0 z-[60] bg-sauge-fonce/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(null)}
      />

      <div
        id="tarifs-panel"
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`fixed bottom-0 left-0 right-0 z-[61] max-h-[80vh] overflow-y-auto rounded-t-3xl bg-creme p-6 pb-10 md:top-0 md:bottom-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-[440px] md:rounded-t-none md:rounded-l-3xl md:p-10 transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open
            ? "translate-y-0 md:translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full pointer-events-none invisible"
        }`}
      >
        <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-sauge-clair md:hidden" />

        {open && (
          <>
            <h3 className="font-serif text-[24px] text-sauge-fonce">
              {CARD_LABELS[open]}
            </h3>

            <div className="mt-4">
              {servicesParCategorie(open).map((service) => (
                <div
                  key={service.id}
                  className="flex items-baseline justify-between border-b border-sauge-clair/40 py-3"
                >
                  <span className="text-sauge-fonce">{service.nom}</span>
                  <span className="text-right text-sauge-fonce">
                    {service.prix} €
                    <span className="block text-[12px] text-sauge">
                      {service.duree} min
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <h4 className="mt-6 font-serif text-[18px] text-sauge-fonce">
              Suppléments
            </h4>

            <div className="mt-2">
              {supplements.map((supplement) => (
                <div
                  key={supplement.id}
                  className="flex items-baseline justify-between border-b border-sauge-clair/40 py-3"
                >
                  <span className="text-sauge-fonce">{supplement.nom}</span>
                  <span className="text-sauge-fonce">
                    {supplement.prix === null
                      ? "sur devis"
                      : supplement.unite === "doigt"
                        ? `${supplement.prix} € / doigt`
                        : `+${supplement.prix} €`}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[13px] text-sauge">
              La dépose peut être réservée seule ou ajoutée à une prestation.
            </p>

            <Button href="/reserver" className="mt-6 w-full">
              Réserver
            </Button>
          </>
        )}
      </div>
    </Section>
  );
}
