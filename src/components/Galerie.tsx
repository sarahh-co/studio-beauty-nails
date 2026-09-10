import Image from "next/image";
import Container from "./ui/Container";
import Reveal from "./ui/Reveal";
import GalleryMarqueeRow from "./ui/GalleryMarqueeRow";
import { galleryRows } from "@/data/gallery";
import { instagramHandle, instagramUrl } from "@/data/site";

const DIRECTIONS = ["left", "right", "left"] as const;

export default function Galerie() {
  return (
    <section id="galerie" className="bg-creme py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-sauge" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-sauge">
              GALERIE
            </span>
          </div>
          <h2 className="mt-4 font-serif text-[28px] leading-tight text-sauge-fonce">
            Mes poses
          </h2>
        </Reveal>
      </Container>

      <div className="marquee-rows mt-10">
        {galleryRows.map((images, index) => (
          <GalleryMarqueeRow
            key={index}
            images={images}
            direction={DIRECTIONS[index]}
          />
        ))}
      </div>

      <Container>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="insta-link group mt-6 inline-flex min-h-11 items-center gap-2 text-sauge-fonce focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauge-fonce"
        >
          <Image src="/icons/instagram.png" width={18} height={18} alt="" />
          <span className="relative inline-block w-fit text-sm font-light tracking-wide after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-sauge-fonce after:transition-transform after:duration-300 after:ease-out group-hover:after:origin-left group-hover:after:scale-x-100">
            @{instagramHandle}
          </span>
        </a>
      </Container>
    </section>
  );
}
