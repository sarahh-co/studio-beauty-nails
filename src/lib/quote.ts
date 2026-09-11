import {
  services,
  supplements,
  addOnDurations,
  type Categorie,
} from "@/data/services";

export type FrenchStyle = "french" | "babyboomer" | "chrome";

export type ZoneChoice = {
  serviceId: string;
  depose: boolean;
  frenchCount: number; // 0–10, covers French / Babyboomer / Chrome
  frenchStyle: FrenchStyle; // info for her only, does not change the price
  strassCount: number; // 0–10
  fleur3dCount: number; // 0–10
  tailleXL: boolean;
  nailArt: boolean;
  beaute: boolean;
};

export type Selection = {
  mains: ZoneChoice | null;
  pieds: ZoneChoice | null;
  horsHoraires: boolean;
};

export type QuoteLine = {
  label: string;
  price: number | null; // null = sur devis
};

export type Quote = {
  lines: QuoteLine[];
  total: number;
  hasDevis: boolean;
  durationMinutes: number;
  route: "rdv" | "sur-demande";
};

const FRENCH_STYLE_LABELS: Record<FrenchStyle, string> = {
  french: "French",
  babyboomer: "Babyboomer",
  chrome: "Chrome",
};

function getSupplementPrice(id: string): number | null {
  const supplement = supplements.find((s) => s.id === id);
  if (!supplement) {
    throw new Error(`Supplément inconnu : ${id}`);
  }
  return supplement.prix;
}

function requireSupplementPrice(id: string): number {
  const prix = getSupplementPrice(id);
  if (prix === null) {
    throw new Error(`Le supplément "${id}" n'a pas de prix fixe`);
  }
  return prix;
}

function validateCount(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > 10) {
    throw new Error(`${name} doit être un entier compris entre 0 et 10`);
  }
}

function tierDuration(count: number): number {
  if (count === 0) return 0;
  if (count <= 4) return addOnDurations.decoTier1;
  return addOnDurations.decoTier2;
}

type ZoneResult = {
  lines: QuoteLine[];
  price: number;
  durationMinutes: number;
  hasDevis: boolean;
};

function processZone(zoneKey: Categorie, zone: ZoneChoice): ZoneResult {
  const service = services.find((s) => s.id === zone.serviceId);
  if (!service) {
    throw new Error(`Service inconnu : ${zone.serviceId}`);
  }
  if (service.categorie !== zoneKey) {
    throw new Error(
      `Le service "${service.nom}" n'appartient pas à la catégorie ${zoneKey}`
    );
  }

  validateCount("frenchCount", zone.frenchCount);
  validateCount("strassCount", zone.strassCount);
  validateCount("fleur3dCount", zone.fleur3dCount);

  const hasDecoSelection =
    zone.frenchCount > 0 ||
    zone.strassCount > 0 ||
    zone.fleur3dCount > 0 ||
    zone.nailArt;
  if (hasDecoSelection && !service.allowsDeco) {
    throw new Error(`La déco n'est pas disponible pour "${service.nom}"`);
  }

  if (zone.tailleXL && !service.allowsTailleXL) {
    throw new Error(`La taille L/XL n'est pas disponible pour "${service.nom}"`);
  }

  if (zone.depose && !service.allowsDepose) {
    throw new Error(`La dépose ne peut pas être ajoutée à "${service.nom}"`);
  }

  if (zone.beaute && !service.allowsBeaute) {
    throw new Error(`La beauté ne peut pas être ajoutée à "${service.nom}"`);
  }

  const lines: QuoteLine[] = [];
  let price = service.prix;
  let durationMinutes = service.durationMinutes;
  let hasDevis = false;

  lines.push({ label: `${service.nom} (${zoneKey})`, price: service.prix });

  if (zone.depose) {
    const deposeService = services.find((s) => s.id === `depose-${zoneKey}`);
    if (!deposeService) {
      throw new Error(`Service de dépose introuvable pour ${zoneKey}`);
    }
    price += deposeService.prix;
    lines.push({ label: "Dépose", price: deposeService.prix });
    durationMinutes += addOnDurations.deposeAjoutee;
  }

  if (zone.beaute) {
    const beauteService = services.find((s) => s.id === `${zoneKey}-beaute`);
    if (!beauteService) {
      throw new Error(`Service de beauté introuvable pour ${zoneKey}`);
    }
    price += beauteService.prix;
    lines.push({ label: beauteService.nom, price: beauteService.prix });
    durationMinutes += addOnDurations.beauteAjoutee;
  }

  if (zone.frenchCount > 0) {
    const unitPrice = requireSupplementPrice("french");
    const lineTotal = unitPrice * zone.frenchCount;
    price += lineTotal;
    lines.push({
      label: `${FRENCH_STYLE_LABELS[zone.frenchStyle]} × ${zone.frenchCount}`,
      price: lineTotal,
    });
    durationMinutes += tierDuration(zone.frenchCount);
  }

  if (zone.strassCount > 0) {
    const unitPrice = requireSupplementPrice("strass");
    const lineTotal = unitPrice * zone.strassCount;
    price += lineTotal;
    lines.push({ label: `Strass × ${zone.strassCount}`, price: lineTotal });
    durationMinutes += tierDuration(zone.strassCount);
  }

  if (zone.fleur3dCount > 0) {
    const unitPrice = requireSupplementPrice("fleur3d");
    const lineTotal = unitPrice * zone.fleur3dCount;
    price += lineTotal;
    lines.push({ label: `Fleur 3D × ${zone.fleur3dCount}`, price: lineTotal });
    durationMinutes += addOnDurations.fleur3dChacune * zone.fleur3dCount;
  }

  if (zone.tailleXL) {
    const tailleXLPrice = requireSupplementPrice("taille");
    price += tailleXLPrice;
    lines.push({ label: "Taille L/XL", price: tailleXLPrice });
    durationMinutes += addOnDurations.tailleXL;
  }

  if (zone.nailArt) {
    lines.push({ label: "Nail art — sur devis", price: null });
    hasDevis = true;
    durationMinutes += addOnDurations.nailArt;
  }

  return { lines, price, durationMinutes, hasDevis };
}

export function getQuote(selection: Selection): Quote | null {
  if (!selection.mains && !selection.pieds) {
    return null;
  }

  const lines: QuoteLine[] = [];
  let total = 0;
  let durationMinutes = 0;
  let hasDevis = false;
  let hasNailArt = false;

  if (selection.mains) {
    const result = processZone("mains", selection.mains);
    lines.push(...result.lines);
    total += result.price;
    durationMinutes += result.durationMinutes;
    hasDevis = hasDevis || result.hasDevis;
    hasNailArt = hasNailArt || selection.mains.nailArt;
  }

  if (selection.pieds) {
    const result = processZone("pieds", selection.pieds);
    lines.push(...result.lines);
    total += result.price;
    durationMinutes += result.durationMinutes;
    hasDevis = hasDevis || result.hasDevis;
    hasNailArt = hasNailArt || selection.pieds.nailArt;
  }

  if (selection.horsHoraires) {
    const horsHorairesPrice = requireSupplementPrice("hors-horaires");
    total += horsHorairesPrice;
    lines.push({ label: "Hors horaires", price: horsHorairesPrice });
  }

  durationMinutes = Math.ceil(durationMinutes / 15) * 15;

  const route: Quote["route"] =
    selection.horsHoraires || hasNailArt ? "sur-demande" : "rdv";

  return { lines, total, hasDevis, durationMinutes, route };
}
