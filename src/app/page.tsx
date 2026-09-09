import Hero from "@/components/Hero";
import Salon from "@/components/Salon";

export default function Home() {
  return (
    <>
      <div className="mb-12 sm:mb-16">
        <Hero />
      </div>
      <Salon />
      <section id="prestations" className="h-screen bg-creme" />
    </>
  );
}
