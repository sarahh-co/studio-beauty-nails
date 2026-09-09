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
              AMBIANCE
            </span>
          </div>
          <h2 className="mt-4 font-serif text-[28px] leading-tight text-sauge-fonce md:text-[40px]">
            Un lieu calme, lumineux, pensé pour ralentir.
          </h2>
        </Reveal>

        <Reveal delay={150} className="md:order-1">
          <div
            ref={frameRef}
            className="mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-[38px] border-[10px] border-sauge-fonce bg-sauge-fonce"
          >
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
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
