/** Προεπιλογή: πρώτο μέτρο ύψους μάντρας. */
export const DEFAULT_WALL_HEIGHT = 1;

/** Προεπιλογή: πρόσθεση €/μ. ανά επόμενο μέτρο ύψους (50, 60, 70, 80… αν βάση 50 και συντ. 10). */
export const DEFAULT_HEIGHT_COEFFICIENT = 10;

/**
 * Σύνολο γραμμής «Μέτρο» (μήκος μάντρας × σωρευτική τιμή ανά μέτρο ύψους).
 *
 * Για κάθε μέτρο ύψους k = 1…H: τιμή ανά μέτρο μήκους = `pricePerMeter + (k - 1) × heightCoefficient`
 * (1ο μέτρο ύψους: `pricePerMeter`, 2ο: `+coefficient`, 3ο: `+2×coefficient`, …).
 *
 * Άθροισμα ανά μέτρο μήκους: `H × pricePerMeter + heightCoefficient × H × (H - 1) / 2`
 * Σύνολο: `priceMetra ×` το άθροισμα αυτό.
 *
 * Παράδειγμα: Μ=7, P=50, H=4, C=10 → 7 × (50+60+70+80) = 7 × 260 = 1820 €.
 */
export function metraLineTotal(
  pricePerMeter: number,
  priceMetra: number,
  wallHeight: number,
  heightCoefficient: number
): number {
  const P = Number(pricePerMeter) || 0;
  const M = Number(priceMetra) || 0;
  const C = Number(heightCoefficient) > 0 ? Number(heightCoefficient) : DEFAULT_HEIGHT_COEFFICIENT;

  const h = Number(wallHeight);
  if (!Number.isFinite(h) || h <= 0) {
    return P * M;
  }

  const tiers = Math.max(1, Math.floor(h));
  const sumPerFenceMeter =
    tiers * P + (C * tiers * (tiers - 1)) / 2;
  return M * sumPerFenceMeter;
}

export function projectMetraSubtotal(project: {
  price_per_meter: unknown;
  price_metra: unknown;
  wall_height?: unknown;
  height_coefficient?: unknown;
}): number {
  const wallH =
    project.wall_height != null && project.wall_height !== ""
      ? Number(project.wall_height)
      : DEFAULT_WALL_HEIGHT;
  const coef =
    project.height_coefficient != null && project.height_coefficient !== ""
      ? Number(project.height_coefficient)
      : DEFAULT_HEIGHT_COEFFICIENT;
  return metraLineTotal(
    Number(project.price_per_meter) || 0,
    Number(project.price_metra) || 0,
    Number.isFinite(wallH) && wallH > 0 ? wallH : DEFAULT_WALL_HEIGHT,
    Number.isFinite(coef) && coef > 0 ? coef : DEFAULT_HEIGHT_COEFFICIENT
  );
}
