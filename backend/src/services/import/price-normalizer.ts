const INTEGER_PATTERN = /^\d+$/;

function decimalToInteger(value: string, multiplier: bigint) {
  const normalized = value.replace(/,/g, "").trim();
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  const scale = 10n ** BigInt(fraction.length);
  const scaled = BigInt(whole) * scale + BigInt(fraction || "0");
  const numerator = scaled * multiplier * 100n;
  if (numerator % scale !== 0n) return null;
  return (numerator / scale).toString();
}

function normalizePlainRupeeAmount(value: string) {
  const normalized = value.replace(/,/g, "").trim();
  if (!INTEGER_PATTERN.test(normalized)) return null;
  return (BigInt(normalized) * 100n).toString();
}

export function normalizePriceToPaise(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const value = raw.replace(/₹|INR/gi, "").replace(/\s+/g, " ").trim();
  if (!value) return null;

  const unitMatch = value.match(/^(?:(?:starting\s+)?from|approx(?:imately)?|around)?\s*(\d[\d,]*(?:\.\d+)?)\s*(crores?|cr|lakhs?|lacs?|lac|l)\s*(?:onwards|\+)?$/i);
  if (unitMatch) {
    const unit = unitMatch[2].toLowerCase();
    const multiplier = unit.startsWith("cr") || unit.startsWith("crore")
      ? 10_000_000n
      : 100_000n;
    return decimalToInteger(unitMatch[1], multiplier);
  }

  const plainMatch = value.match(/^\d[\d,]*$/);
  return plainMatch ? normalizePlainRupeeAmount(plainMatch[0]) : null;
}
