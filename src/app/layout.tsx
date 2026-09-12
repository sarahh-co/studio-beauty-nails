import type { Metadata } from "next";
import { DM_Serif_Display, Geist } from "next/font/google";
import localFont from "next/font/local";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const quentin = localFont({
  src: "../assets/fonts/Quentin.woff2",
  display: "swap",
  variable: "--font-quentin",
});

export const metadata: Metadata = {
  title: "Studio Beauty Nails",
  description: "Prothésiste ongulaire",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${dmSerif.variable} ${geist.variable} ${quentin.variable}`}
    >
      <body className="overflow-x-hidden">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}