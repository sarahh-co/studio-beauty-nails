"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Button from "./ui/Button";

export default function Hero() {
  const [revealed, setRevealed] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const check = () => {
      if (done.current) return;
      if (window.scrollY > 40) {
        done.current = true;
        setRevealed(true);
        window.removeEventListener("scroll", check);
      }
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, []);

  return (
    <section
      className={`relative isolate bg-creme px-4 py-4 md:px-8 ${
        revealed ? "hero-revealed" : ""
      }`}
    >
      <div className="relative mx-auto aspect-[3/4] w-full max-w-[600px] overflow-hidden rounded-2xl">
        <Image
          src="/hero-bg.webp"
          fill
          preload={true}
          alt=""
          className="object-cover"
        />

        <div className="absolute inset-0 z-10 bg-sauge-fonce opacity-30 mix-blend-soft-light" />

        <div className="hero-green absolute inset-0 z-20 bg-sauge-fonce opacity-0" />

        <div className="absolute inset-0 z-30 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="hero-hand-back absolute inset-0 z-40 pointer-events-none">
          <Image
            src="/hero-hand-back.webp"
            fill
            preload={true}
            alt=""
            className="object-cover"
          />
        </div>

        <div className="hero-text absolute bottom-[1%] left-0 z-50 max-w-md p-6 md:max-w-lg md:p-12">
          <h1 className="font-serif text-3xl leading-tight text-creme md:text-5xl mb-6 md:mb-8">
            L&apos;élégance au bout des doigts
          </h1>

          <div className="hero-swap grid">
            <p
              className="hero-sub mt-3 font-sans text-sm text-creme/85 md:text-base"
              style={{ gridArea: "1 / 1" }}
            >
              Prothésiste ongulaire — prenez rendez-vous en ligne
            </p>
            <div
              className="hero-cta flex w-full gap-3"
              style={{ gridArea: "1 / 1" }}
            >
              <Button href="#reserver" className="flex-[1.25] py-4">
                Réserver
              </Button>
              <Button href="#prestations" variant="ghost" className="flex-1">
                Prestations
              </Button>
            </div>
          </div>
        </div>

        <div className="hero-hand-front absolute inset-0 z-[60] pointer-events-none">
          <Image
            src="/hero-hand-front.webp"
            fill
            preload={true}
            alt=""
            className="object-cover"
          />
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-0 z-[70] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, transparent 45%, rgba(38, 42, 36, 0.38) 100%)",
          }}
        />

        <div
          aria-hidden="true"
          className="hero-grain absolute inset-0 z-[71] pointer-events-none"
        />
      </div>
    </section>
  );
}
