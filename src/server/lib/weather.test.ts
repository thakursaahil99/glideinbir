import { describe, it, expect, vi } from "vitest";

// weather.ts reads the admin override from the DB; these tests only cover
// the pure vote logic, so keep Prisma (and its env check) out of it.
vi.mock("@/server/db/prisma", () => ({ prisma: {} }));

const { consensusSky, parseMetar } = await import("./weather");

const r = (code: number, cloudCover: number, precipitation = 0) => ({ code, cloudCover, precipitation, snowfall: 0 });

describe("consensusSky", () => {
  it("shows rain when several models agree, even if one says clear (Bir, 7 Oct 2026 12:45)", () => {
    const readings = [r(2, 67), r(80, 17, 0.5), r(2, 90), r(95, 100), r(51, 100, 0.1), r(1, 35)];
    const sky = consensusSky(readings, true, { wet: false, thunder: false, snow: false, cloudCover: 75 });
    expect(sky.effect).toBe("rain");
    expect(sky.label).toBe("Light rain");
  });

  it("does not rain off a single wet model", () => {
    const sky = consensusSky([r(0, 5), r(61, 30, 0.2), r(1, 10), r(0, 0)], true, null);
    expect(sky.effect).toBe("sun");
  });

  it("needs a cloudy sky before two wet votes count", () => {
    expect(consensusSky([r(61, 20), r(61, 20), r(0, 10), r(0, 10)], true, null).effect).toBe("sun");
    expect(consensusSky([r(61, 80), r(61, 80), r(2, 60), r(1, 50)], true, null).effect).toBe("rain");
  });

  it("calls a thunderstorm on two storm votes, counting the METAR", () => {
    const metar = { wet: true, thunder: true, snow: false, cloudCover: 75 };
    const sky = consensusSky([r(95, 100), r(61, 90), r(3, 100)], true, metar);
    expect(sky.effect).toBe("storm");
  });

  it("uses the median cloud cover for clouds vs sun, and night after dark", () => {
    expect(consensusSky([r(0, 80), r(1, 75), r(2, 90)], true, null)).toMatchObject({ effect: "clouds", label: "Overcast" });
    expect(consensusSky([r(0, 45), r(1, 50), r(0, 10)], true, null).label).toBe("Partly cloudy");
    expect(consensusSky([r(0, 5), r(0, 2), r(1, 10)], false, null).effect).toBe("night");
  });
});

describe("parseMetar", () => {
  it("reads rain and thunder from the present-weather group", () => {
    expect(parseMetar("METAR VIGG 070530Z 05004KT 5000 -TSRA BKN030 FEW035CB OVC080 19/19 Q1022", "OVC")).toEqual({
      wet: true,
      thunder: true,
      snow: false,
      cloudCover: 100,
    });
  });

  it("ignores a TEMPO forecast tail and cloud groups", () => {
    const m = parseMetar("METAR VIDN 051130Z 20005KT 2500 BR SCT020 FEW025CB 29/28 Q1012 TEMPO 1500 TSRA", "SCT");
    expect(m).toMatchObject({ wet: false, thunder: false, cloudCover: 45 });
  });

  it("counts showers in the vicinity", () => {
    expect(parseMetar("METAR VIGG 071000Z 31002KT 6000 VCSH BKN030 21/19 Q1022", "BKN").wet).toBe(true);
  });
});
