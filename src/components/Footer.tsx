"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Container from "./ui/Container";
import footerFeuille from "@/assets/footer-feuille.jpg";
import plan from "@/assets/plan.jpg";
import {
  instagramHandle,
  instagramUrl,
  phoneDisplay,
  phoneHref,
  addressLines,
  mapsUrl,
  openingHours,
} from "@/data/site";

export default function Footer() {
  const pathname = usePathname();
  const isReserver = pathname === "/reserver";
  const year = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footerEl = footerRef.current;
    if (!footerEl) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let ticking = false;

    function updateShift() {
      ticking = false;
      const rect = footerEl!.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const total = viewportHeight + rect.height;
      const traveled = viewportHeight - rect.top;
      const progress = Math.min(1, Math.max(0, traveled / total));
      const spare = footerEl!.offsetHeight * 0.3;
      const shift = progress * spare;
      footerEl!.style.setProperty("--footer-shift", `${-shift}px`);
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateShift);
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          updateShift();
          window.addEventListener("scroll", onScroll, { passive: true });
        } else {
          window.removeEventListener("scroll", onScroll);
        }
      },
      { threshold: 0 }
    );

    observer.observe(footerEl);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      className={`relative isolate overflow-hidden ${isReserver ? "pb-24" : ""}`}
    >
      <div className="footer-image-layer absolute inset-x-0 top-0">
        <Image
          src={footerFeuille}
          alt=""
          fill
          sizes="100vw"
          quality={70}
          className="object-cover"
        />
      </div>

      <div aria-hidden="true" className="footer-overlay absolute inset-0" />

      <Container className="relative z-10 py-10">
        <div className="flex flex-col gap-7">
          <p aria-hidden="true" className="footer-wordmark mb-6">
            <span className="footer-wordmark-line1">studio</span>
            <span className="footer-wordmark-line2">beauty nails</span>
          </p>

          <div>
            <h2 className="text-sm uppercase tracking-wide text-creme opacity-80">
              Contact
            </h2>
            <div className="mt-3 flex flex-col gap-2">
              <a
                href={phoneHref}
                className="flex min-h-11 items-center text-creme hover:underline hover:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-creme"
              >
                {phoneDisplay}
              </a>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 flex-col justify-center text-creme hover:underline hover:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-creme md:hidden"
              >
                {addressLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="insta-link group flex min-h-11 items-center gap-2 text-creme focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-creme"
              >
                <Image src="/icons/instagram.png" width={18} height={18} alt="" />
                <span className="relative inline-block w-fit text-sm font-light tracking-wide after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-creme after:transition-transform after:duration-300 after:ease-out group-hover:after:origin-left group-hover:after:scale-x-100">
                  @{instagramHandle}
                </span>
              </a>
            </div>
          </div>

          <div className="flex items-start gap-6 md:items-center">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-11 flex-col justify-center text-creme hover:underline hover:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-creme md:order-1 md:flex"
            >
              {addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </a>

            <div className="order-1 md:order-3">
              <h2 className="text-sm uppercase tracking-wide text-creme opacity-80">
                Horaires
              </h2>
              <div className="mt-3 flex flex-col text-creme">
                <span>{openingHours.days}</span>
                <span>{openingHours.hours}</span>
              </div>
            </div>

            <div className="order-2 w-40 shrink-0 md:w-80">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block aspect-square w-40 overflow-hidden rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-creme md:w-80"
              >
                <Image
                  src={plan}
                  alt="Plan d’accès — 141 Pl. Jean Monnet, Saint-Genis-Pouilly"
                  fill
                  sizes="(max-width: 768px) 160px, 320px"
                  className="object-cover"
                />
              </a>
              <p className="mt-1 text-[10px] text-creme opacity-70">
                Données cartographiques © Google
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-creme/20 pt-4 text-sm text-creme opacity-80">
            <p>© {year} Studio Beauty Nails</p>
            <div className="flex gap-4">
              <Link
                href="/mentions-legales"
                className="min-h-11 items-center hover:underline hover:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-creme"
              >
                Mentions légales
              </Link>
              <Link
                href="/confidentialite"
                className="min-h-11 items-center hover:underline hover:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-creme"
              >
                Confidentialité
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
