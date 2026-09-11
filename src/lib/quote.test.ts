import { describe, it, expect } from "vitest";
import { getQuote, type Selection, type ZoneChoice } from "./quote";

function zone(overrides: Partial<ZoneChoice> & { serviceId: string }): ZoneChoice {
  return {
    depose: false,
    frenchCount: 0,
    frenchStyle: "french",
    strassCount: 0,
    fleur3dCount: 0,
    tailleXL: false,
    nailArt: false,
    beaute: false,
    ...overrides,
  };
}

function selection(overrides: Partial<Selection>): Selection {
  return {
    mains: null,
    pieds: null,
    horsHoraires: false,
    ...overrides,
  };
}

describe("getQuote", () => {
  it("a) Semi-permanent mains alone", () => {
    const quote = getQuote(
      selection({ mains: zone({ serviceId: "mains-semi" }) })
    );
    expect(quote?.total).toBe(35);
    expect(quote?.durationMinutes).toBe(60);
    expect(quote?.route).toBe("rdv");
  });

  it("b) Dépose mains alone", () => {
    const quote = getQuote(
      selection({ mains: zone({ serviceId: "depose-mains" }) })
    );
    expect(quote?.total).toBe(10);
    expect(quote?.durationMinutes).toBe(30);
    expect(quote?.route).toBe("rdv");
  });

  it("c) Semi-permanent mains + dépose + French × 10", () => {
    const quote = getQuote(
      selection({
        mains: zone({
          serviceId: "mains-semi",
          depose: true,
          frenchCount: 10,
          frenchStyle: "french",
        }),
      })
    );
    expect(quote?.total).toBe(55);
    expect(quote?.durationMinutes).toBe(120);
    expect(quote?.route).toBe("rdv");
  });

  it("d) Capsule + gel mains + Taille L/XL + strass × 3", () => {
    const quote = getQuote(
      selection({
        mains: zone({
          serviceId: "mains-capsule",
          tailleXL: true,
          strassCount: 3,
        }),
      })
    );
    expect(quote?.total).toBe(63);
    expect(quote?.durationMinutes).toBe(90);
    expect(quote?.route).toBe("rdv");
  });

  it("e) Semi-permanent mains + nail art", () => {
    const quote = getQuote(
      selection({
        mains: zone({ serviceId: "mains-semi", nailArt: true }),
      })
    );
    expect(quote?.total).toBe(35);
    expect(quote?.hasDevis).toBe(true);
    expect(quote?.durationMinutes).toBe(90);
    expect(quote?.route).toBe("sur-demande");
  });

  it("f) Semi-permanent mains + semi-permanent pieds + hors horaires", () => {
    const quote = getQuote(
      selection({
        mains: zone({ serviceId: "mains-semi" }),
        pieds: zone({ serviceId: "pieds-semi" }),
        horsHoraires: true,
      })
    );
    expect(quote?.total).toBe(75);
    expect(quote?.durationMinutes).toBe(120);
    expect(quote?.route).toBe("sur-demande");
  });

  it("g) Gainage pieds + fleur 3D × 2", () => {
    const quote = getQuote(
      selection({
        pieds: zone({ serviceId: "pieds-gainage", fleur3dCount: 2 }),
      })
    );
    expect(quote?.total).toBe(47);
    expect(quote?.durationMinutes).toBe(75);
  });

  it("h) Semi-permanent mains + French × 4", () => {
    const quote = getQuote(
      selection({
        mains: zone({ serviceId: "mains-semi", frenchCount: 4 }),
      })
    );
    expect(quote?.total).toBe(39);
    expect(quote?.durationMinutes).toBe(75);
  });

  it("i) Semi-permanent mains + French × 5", () => {
    const quote = getQuote(
      selection({
        mains: zone({ serviceId: "mains-semi", frenchCount: 5 }),
      })
    );
    expect(quote?.total).toBe(40);
    expect(quote?.durationMinutes).toBe(90);
  });

  it("j) Both zones null", () => {
    const quote = getQuote(selection({}));
    expect(quote).toBeNull();
  });

  it("l) Rallongement (pieds) + Taille L/XL + French × 6 + dépose", () => {
    const quote = getQuote(
      selection({
        pieds: zone({
          serviceId: "pieds-rallongement",
          tailleXL: true,
          frenchCount: 6,
          depose: true,
        }),
      })
    );
    expect(quote?.total).toBe(71);
    expect(quote?.durationMinutes).toBe(135);
    expect(quote?.route).toBe("rdv");
  });

  it("m) Gainage mains + beauté", () => {
    const quote = getQuote(
      selection({
        mains: zone({ serviceId: "mains-gainage", beaute: true }),
      })
    );
    expect(quote?.total).toBe(70);
    expect(quote?.durationMinutes).toBe(90);
    expect(quote?.route).toBe("rdv");
  });

  it("n) Dépose mains (booked alone) + beauté", () => {
    const quote = getQuote(
      selection({
        mains: zone({ serviceId: "depose-mains", beaute: true }),
      })
    );
    expect(quote?.total).toBe(35);
    expect(quote?.durationMinutes).toBe(60);
    expect(quote?.route).toBe("rdv");
  });

  it("o) Semi-permanent pieds + dépose + beauté + French × 2", () => {
    const quote = getQuote(
      selection({
        pieds: zone({
          serviceId: "pieds-semi",
          depose: true,
          beaute: true,
          frenchCount: 2,
        }),
      })
    );
    expect(quote?.total).toBe(72);
    expect(quote?.durationMinutes).toBe(135);
    expect(quote?.route).toBe("rdv");
  });

  it("p) Throws: beauté on Beauté des mains", () => {
    expect(() =>
      getQuote(
        selection({
          mains: zone({ serviceId: "mains-beaute", beaute: true }),
        })
      )
    ).toThrow();
  });

  describe("k) throws", () => {

    it("French × 1 on Beauté des mains", () => {
      expect(() =>
        getQuote(
          selection({
            mains: zone({ serviceId: "mains-beaute", frenchCount: 1 }),
          })
        )
      ).toThrow();
    });

    it("Taille L/XL on Semi-permanent mains", () => {
      expect(() =>
        getQuote(
          selection({
            mains: zone({ serviceId: "mains-semi", tailleXL: true }),
          })
        )
      ).toThrow();
    });

    it("depose on Remplissage mains", () => {
      expect(() =>
        getQuote(
          selection({
            mains: zone({ serviceId: "mains-remplissage", depose: true }),
          })
        )
      ).toThrow();
    });

    it("strassCount 11", () => {
      expect(() =>
        getQuote(
          selection({
            mains: zone({ serviceId: "mains-semi", strassCount: 11 }),
          })
        )
      ).toThrow();
    });

    it("a pieds service placed in mains", () => {
      expect(() =>
        getQuote(
          selection({
            mains: zone({ serviceId: "pieds-semi" }),
          })
        )
      ).toThrow();
    });
  });
});
