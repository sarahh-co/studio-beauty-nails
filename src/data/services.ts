export type Categorie = "mains" | "pieds";

export type Service = {
  id: string;
  nom: string;
  prix: number;
  duree: number; // minutes
  categorie: Categorie;
  standalone: boolean; // can be booked on its own
  couplable: boolean; // can be added to another service
};

export type Supplement = {
  id: string;
  nom: string;
  prix: number | null; // null = sur devis
  unite: "doigt" | "forfait";
  forceSurDemande: boolean;
};

export const services: Service[] = [
  // MAINS
  {
    id: "mains-beaute",
    nom: "Beauté des mains",
    prix: 25,
    duree: 60,
    categorie: "mains",
    standalone: true,
    couplable: false,
  },
  {
    id: "mains-semi",
    nom: "Semi-permanent",
    prix: 35,
    duree: 60,
    categorie: "mains",
    standalone: true,
    couplable: false,
  },
  {
    id: "mains-gainage",
    nom: "Gainage (gel/rubber base) + semi",
    prix: 45,
    duree: 60,
    categorie: "mains",
    standalone: true,
    couplable: false,
  },
  {
    id: "mains-capsule",
    nom: "Capsule + gel (semi-permanent)",
    prix: 55,
    duree: 60,
    categorie: "mains",
    standalone: true,
    couplable: false,
  },
  // remplissage is deliberately 45 for mains and 40 for pieds — confirmed, not a typo
  {
    id: "mains-remplissage",
    nom: "Remplissage",
    prix: 45,
    duree: 60,
    categorie: "mains",
    standalone: true,
    couplable: false,
  },
  {
    id: "depose-mains",
    nom: "Dépose",
    prix: 10,
    duree: 30,
    categorie: "mains",
    standalone: true,
    couplable: true,
  },

  // PIEDS
  {
    id: "pieds-beaute",
    nom: "Beauté des pieds",
    prix: 25,
    duree: 60,
    categorie: "pieds",
    standalone: true,
    couplable: false,
  },
  {
    id: "pieds-semi",
    nom: "Semi-permanent",
    prix: 35,
    duree: 60,
    categorie: "pieds",
    standalone: true,
    couplable: false,
  },
  {
    id: "pieds-gainage",
    nom: "Gainage gel/rubber base + semi",
    prix: 45,
    duree: 60,
    categorie: "pieds",
    standalone: true,
    couplable: false,
  },
  {
    id: "pieds-rallongement",
    nom: "Rallongement (acrygel + semi-permanent)",
    prix: 50,
    duree: 60,
    categorie: "pieds",
    standalone: true,
    couplable: false,
  },
  // remplissage is deliberately 45 for mains and 40 for pieds — confirmed, not a typo
  {
    id: "pieds-remplissage",
    nom: "Remplissage (gel/rubber base)",
    prix: 40,
    duree: 60,
    categorie: "pieds",
    standalone: true,
    couplable: false,
  },
  {
    id: "depose-pieds",
    nom: "Dépose",
    prix: 10,
    duree: 30,
    categorie: "pieds",
    standalone: true,
    couplable: true,
  },
];

// Add-on DURATION is tiered, not per-unit, and is calculated in the
// configurateur rather than stored here:
//   1-4 doigts        -> +15 min
//   5-10 doigts        -> +30 min
//   each 3D flower      -> +5 min
//   taille L/XL          -> +10 min
export const supplements: Supplement[] = [
  {
    id: "french",
    nom: "French / Babyboomer / Chrome",
    prix: 1,
    unite: "doigt",
    forceSurDemande: false,
  },
  {
    id: "strass",
    nom: "Gros strass",
    prix: 1,
    unite: "doigt",
    forceSurDemande: false,
  },
  {
    id: "fleur3d",
    nom: "3D (fleur)",
    prix: 1,
    unite: "doigt",
    forceSurDemande: false,
  },
  {
    id: "taille",
    nom: "Taille L/XL",
    prix: 5,
    unite: "forfait",
    forceSurDemande: false,
  },
  {
    id: "nailart",
    nom: "Nail art",
    prix: null,
    unite: "forfait",
    forceSurDemande: true,
  },
];

export const servicesParCategorie = (c: Categorie) =>
  services.filter((s) => s.categorie === c);
