import type { CSSProperties } from "react";
import Image from "next/image";
import type { GalleryImage } from "@/data/gallery";

type GalleryMarqueeRowProps = {
  images: GalleryImage[];
  direction: "left" | "right";
  duration?: number;
  desktopDuration?: number;
};

export default function GalleryMarqueeRow({
  images,
  direction,
  duration = 40,
  desktopDuration = 55,
}: GalleryMarqueeRowProps) {
  // 4 copies total: copies 2-4 are aria-hidden duplicates; copies 3-4
  // only render from 768px up (mobile keeps its original 2-copy loop).
  const quadrupled = [...images, ...images, ...images, ...images];

  const trackStyle = {
    "--marquee-duration": `${duration}s`,
    "--marquee-duration-desktop": `${desktopDuration}s`,
  } as CSSProperties;

  return (
    <div className="marquee-row w-full overflow-hidden">
      <div
        className={`marquee-track flex w-max items-start ${
          direction === "right" ? "marquee-track-reverse" : ""
        }`}
        style={trackStyle}
      >
        {quadrupled.map((image, index) => {
          const setIndex = Math.floor(index / images.length);
          const isDuplicate = setIndex > 0;
          const isDesktopOnly = setIndex > 1;
          return (
            <Image
              key={index}
              src={image.src}
              alt={isDuplicate ? "" : image.alt}
              aria-hidden={isDuplicate ? "true" : undefined}
              // mobile: widest card at 224px tall: pose-04/pose-09 are 1:1, giving 224 * (1170/1170) = 224px
              // desktop: widest card at 480px tall: pose-04/pose-09 are 1:1, giving 480 * (1170/1170) = 480px
              sizes="(min-width: 768px) 480px, 224px"
              className={`marquee-card mr-3 h-56 w-auto shrink-0 rounded-2xl ${
                isDesktopOnly ? "hidden md:block" : ""
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
