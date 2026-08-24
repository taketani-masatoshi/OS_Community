/**
 * Japanese corporate number (法人番号) — 13 digits with NTA check digit.
 * @see https://www.houjin-bangou.nta.go.jp/
 */

const JP_CORPORATE_NUMBER_RE = /^\d{13}$/;

/** Normalize: strip spaces/hyphens; return digits-only or null if empty. */
export function normalizeCorporateNumber(input: string): string {
  return input.replace(/[\s\-]/g, "").trim();
}

/**
 * Validate Japanese corporate number including check digit.
 * First digit is the check digit over the remaining 12 digits.
 */
export function isJapaneseCorporateNumber(input: string): boolean {
  const digits = normalizeCorporateNumber(input);
  if (!JP_CORPORATE_NUMBER_RE.test(digits)) return false;

  const body = digits.slice(1);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const n = Number(body[11 - i]);
    const weight = i % 2 === 0 ? 1 : 2;
    sum += n * weight;
  }
  const check = 9 - (sum % 9);
  return check === Number(digits[0]);
}

export function formatCorporateNumberDisplay(input: string): string {
  const digits = normalizeCorporateNumber(input);
  if (!JP_CORPORATE_NUMBER_RE.test(digits)) return input.trim();
  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 9)}-${digits.slice(9)}`;
}
