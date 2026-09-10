import Image from "next/image";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";
import ReviewCarousel from "./ReviewCarousel";
import { reviews } from "@/data/reviews";
import { googleReviewsUrl } from "@/data/site";

export default function Avis() {
  return (
    <Section id="avis" className="bg-creme">
      <Reveal>
        <h2 className="font-serif text-[32px] leading-tight text-sauge-fonce md:text-[48px]">
          Retours d’expérience
        </h2>
      </Reveal>

      <Reveal className="mt-10">
        <div className="panel-bevel rounded-3xl bg-sauge-fonce p-5 md:p-8">
          <h3 className="mb-5 inline-flex items-center gap-2 font-sans text-xl font-medium text-creme">
            <Image
              src="/icons/google.svg"
              width={24}
              height={24}
              unoptimized
              alt=""
            />
            Avis Google
          </h3>

          <ReviewCarousel reviews={reviews} />
        </div>
      </Reveal>

      <a
        href={googleReviewsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="insta-link group mt-6 inline-flex min-h-11 items-center gap-2 text-sauge-fonce focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sauge-fonce"
      >
        <span className="relative inline-block w-fit text-sm font-light tracking-wide after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-sauge-fonce after:transition-transform after:duration-300 after:ease-out group-hover:after:origin-left group-hover:after:scale-x-100">
          Voir tous les avis sur Google
        </span>
        <span aria-hidden="true">→</span>
      </a>
    </Section>
  );
}
