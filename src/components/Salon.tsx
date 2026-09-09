"use client";

import { useEffect, useRef } from "react";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";

export default function Salon() {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const vid = videoRef.current;
    if (!frame || !vid) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) vid.play().catch(() => {});
        else vid.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(frame);
    return () => io.disconnect();
  }, []);

  return (
    <Section id="le-salon" className="bg-creme">
      <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
        <Reveal className="md:order-2">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-sauge" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-sauge">
              LE SALON
            </span>
          </div>
          <h2 className="mt-4 font-serif text-[28px] leading-tight text-sauge-fonce md:text-[40px]">
            Tout ce qu&apos;il faut pour vous sublimer.
          </h2>
        </Reveal>

        <Reveal delay={150} className="md:order-1">
          <div
            ref={frameRef}
            className="relative mx-auto w-full max-w-[300px] rounded-[44px] bg-sauge-fonce p-[10px] shadow-[0_20px_50px_-20px_rgba(76,86,80,0.5)]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[44px] pointer-events-none ring-1 ring-inset ring-white/15"
            />

            <div className="relative overflow-hidden rounded-[36px] aspect-[9/16] bg-black">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                src="/salon.mp4"
                poster="/salon-poster.jpg"
                muted
                loop
                playsInline
                preload="metadata"
              />

              <div
                aria-hidden="true"
                className="absolute left-1/2 top-[10px] -translate-x-1/2 z-10 h-[5px] w-[86px] rounded-full bg-white/25 pointer-events-none"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
