import type { Metadata } from "next";
import Section from "@/components/ui/Section";
import Configurateur from "@/components/reserver/Configurateur";

export const metadata: Metadata = {
  title: "Réserver — Studio Beauty Nails",
};

export default function ReserverPage() {
  return (
    <>
      <Section className="bg-creme">
        <h1 className="font-serif text-3xl leading-tight text-sauge-fonce md:text-5xl">
          Réserver
        </h1>
      </Section>

      <Configurateur />
    </>
  );
}
