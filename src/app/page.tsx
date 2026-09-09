import Hero from "@/components/Hero";
import Salon from "@/components/Salon";
import Tarifs from "@/components/Tarifs";

export default function Home() {
  return (
    <>
      <div className="mb-12 sm:mb-16">
        <Hero />
      </div>
      <Salon />
      <Tarifs />
    </>
  );
}
