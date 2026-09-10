import Hero from "@/components/Hero";
import Salon from "@/components/Salon";
import Tarifs from "@/components/Tarifs";
import Galerie from "@/components/Galerie";
import Avis from "@/components/Avis";
import Faq from "@/components/Faq";

export default function Home() {
  return (
    <>
      <div className="mb-12 sm:mb-16">
        <Hero />
      </div>
      <Salon />
      <Tarifs />
      <Galerie />
      <Avis />
      <Faq />
    </>
  );
}
