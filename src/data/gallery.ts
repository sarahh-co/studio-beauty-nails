import type { StaticImageData } from "next/image";

import pose01 from "@/assets/galerie/pose-01.webp";
import pose02 from "@/assets/galerie/pose-02.webp";
import pose03 from "@/assets/galerie/pose-03.webp";
import pose04 from "@/assets/galerie/pose-04.webp";
import pose05 from "@/assets/galerie/pose-05.webp";
import pose06 from "@/assets/galerie/pose-06.webp";
import pose07 from "@/assets/galerie/pose-07.webp";
import pose08 from "@/assets/galerie/pose-08.webp";
import pose09 from "@/assets/galerie/pose-09.webp";
import pose10 from "@/assets/galerie/pose-10.webp";
import pose11 from "@/assets/galerie/pose-11.webp";
import pose12 from "@/assets/galerie/pose-12.webp";

export type GalleryImage = {
  src: StaticImageData;
  alt: string;
};

export const galleryRows: GalleryImage[][] = [
  [
    { src: pose01, alt: "Pose semi-permanent, teinte nude" },
    { src: pose02, alt: "Pose gel, effet naturel" },
    { src: pose03, alt: "Pose capsule, forme amande" },
    { src: pose04, alt: "Pose semi-permanent, teinte rose poudré" },
  ],
  [
    { src: pose05, alt: "Pose gainage, finition brillante" },
    { src: pose06, alt: "Pose semi-permanent, french manucure" },
    { src: pose07, alt: "Pose gel, forme carrée" },
    { src: pose08, alt: "Pose capsule, teinte nude profond" },
  ],
  [
    { src: pose09, alt: "Pose pieds, semi-permanent" },
    { src: pose10, alt: "Pose rallongement, forme ballerine" },
    { src: pose11, alt: "Pose semi-permanent, teinte terracotta" },
    { src: pose12, alt: "Pose gel, détail nail art" },
  ],
];
