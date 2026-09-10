"use client";

import { useLayoutEffect, useRef } from "react";
import ReviewCard from "./ReviewCard";
import type { Review } from "@/data/reviews";

const COPIES = ["a", "b", "c"] as const;

type ReviewCarouselProps = {
  reviews: Review[];
};

export default function ReviewCarousel({ reviews }: ReviewCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const setWidthRef = useRef(0);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;

    function isOverflowing() {
      return track!.scrollWidth > track!.clientWidth + 1;
    }

    function measure() {
      const aFirst = track!.querySelector<HTMLElement>(
        '[data-copy="a"][data-index="0"]'
      );
      const bFirst = track!.querySelector<HTMLElement>(
        '[data-copy="b"][data-index="0"]'
      );
      if (aFirst && bFirst) {
        setWidthRef.current = bFirst.offsetLeft - aFirst.offsetLeft;
      }
    }

    function centerOnB() {
      if (!isOverflowing()) return;
      track!.scrollTo({ left: setWidthRef.current, behavior: "instant" });
    }

    function handleSettle() {
      if (!isOverflowing()) return;
      const sw = setWidthRef.current;
      if (sw <= 0) return;
      const sl = track!.scrollLeft;
      if (sl < sw - 1) {
        track!.scrollTo({ left: sl + sw, behavior: "instant" });
      } else if (sl >= 2 * sw - 1) {
        track!.scrollTo({ left: sl - sw, behavior: "instant" });
      }
    }

    function handleScroll() {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(handleSettle, 150);
    }

    measure();
    centerOnB();

    const supportsScrollend = "onscrollend" in window;
    if (supportsScrollend) {
      track.addEventListener("scrollend", handleSettle);
    } else {
      track.addEventListener("scroll", handleScroll);
    }

    const resizeObserver = new ResizeObserver(() => {
      measure();
      centerOnB();
    });
    resizeObserver.observe(track);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (supportsScrollend) {
        track.removeEventListener("scrollend", handleSettle);
      } else {
        track.removeEventListener("scroll", handleScroll);
      }
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <ul
      ref={trackRef}
      className="scrollbar-hide -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:snap-none"
      style={{ scrollPaddingLeft: "1.25rem" }}
    >
      {COPIES.flatMap((copy) =>
        reviews.map((review, index) => {
          const isReal = copy === "b";
          return (
            <li
              key={`${copy}-${index}`}
              data-copy={copy}
              data-index={index}
              aria-hidden={isReal ? undefined : true}
              inert={isReal ? undefined : true}
              className={`w-[85%] shrink-0 snap-start snap-always md:w-auto md:shrink md:snap-align-none ${
                isReal ? "" : "md:hidden"
              }`}
            >
              <ReviewCard review={review} index={index} />
            </li>
          );
        })
      )}
    </ul>
  );
}
