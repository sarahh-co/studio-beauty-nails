"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "./ui/Container";
import Button from "./ui/Button";

const NAV_LINKS = [
  { label: "Le salon", href: "#le-salon" },
  { label: "Prestations & Tarifs", href: "#prestations" },
  { label: "Galerie", href: "#galerie" },
  { label: "Avis", href: "#avis" },
  { label: "FAQ", href: "#faq" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
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
    <header className="sticky top-0 z-50 bg-creme">
      <Container className="flex items-center justify-between h-[92px]">
        <Link href="/">
          <Image
            src="/logo.png"
            width={64}
            height={64}
            priority
            alt="Studio Beauty Nails"
          />
        </Link>

        <div className="flex items-center gap-3">
          <Button href="#reserver">Réserver</Button>

          <button
            type="button"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((prev) => !prev)}
            className="flex flex-col items-center gap-1"
          >
            <span className="flex flex-col items-center gap-[5px]">
              {open ? (
                <>
                  <div className="w-[22px] h-[1.5px] bg-sauge-fonce rotate-45 translate-y-[3.25px]" />
                  <div className="w-[22px] h-[1.5px] bg-sauge-fonce -rotate-45 -translate-y-[3.25px]" />
                </>
              ) : (
                <>
                  <div className="w-[22px] h-[1.5px] bg-sauge-fonce" />
                  <div className="w-[22px] h-[1.5px] bg-sauge-fonce" />
                  <div className="w-[22px] h-[1.5px] bg-sauge-fonce" />
                </>
              )}
            </span>
            <span className="text-[10px] uppercase tracking-[0.1em] text-sauge-fonce">
              MENU
            </span>
          </button>
        </div>
      </Container>

      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 bg-creme pt-[92px] transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <Container>
          <nav className="flex flex-col gap-8 py-12">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-serif text-[28px] text-sauge-fonce"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </Container>
      </div>
    </header>
  );
}
