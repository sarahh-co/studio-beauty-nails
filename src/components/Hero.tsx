import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-creme px-4 py-4 md:px-8">
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

        <div className="hero-hand-back absolute inset-0 z-40">
          <Image
            src="/hero-hand-back.webp"
            fill
            preload={true}
            alt=""
            className="object-cover"
          />
        </div>

        <div className="hero-text absolute bottom-[18%] left-0 z-50 max-w-md p-6 md:max-w-lg md:p-12">
          <h1 className="font-serif text-3xl leading-tight text-creme md:text-5xl">
            L&apos;élégance au bout des doigts
          </h1>
          <p className="mt-3 font-sans text-sm text-creme/85 md:text-base">
            Prothésiste ongulaire — prenez rendez-vous en ligne
          </p>
        </div>

        <div className="hero-hand-front absolute inset-0 z-[60]">
          <Image
            src="/hero-hand-front.webp"
            fill
            preload={true}
            alt=""
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
