import { correctShoppingTranscript } from './correct-transcript';

const SPOKEN_AMOUNTS: Array<[RegExp, string]> = [
  [/\bfive hundred\b/gi, '500'],
  [/\bthree hundred\b/gi, '300'],
  [/\bfour hundred\b/gi, '400'],
  [/\bsix hundred\b/gi, '600'],
  [/\bseven hundred\b/gi, '700'],
  [/\beight hundred\b/gi, '800'],
  [/\bnine hundred\b/gi, '900'],
  [/\btwo hundred\b/gi, '200'],
  [/\bone hundred\b/gi, '100'],
  [/\ba thousand\b/gi, '1000'],
  [/\bone thousand\b/gi, '1000'],
  [/\btwo thousand\b/gi, '2000'],
];

export function normalizeShoppingQuery(text: string): string {
  let value = correctShoppingTranscript(text);

  for (const [pattern, replacement] of SPOKEN_AMOUNTS) {
    value = value.replace(pattern, replacement);
  }

  value = value.replace(/₹\s*/g, '');
  value = value.replace(/\b(\d+)\s*k\b/gi, (_, n) => String(Number(n) * 1000));
  value = value.replace(/\b(\d+)\s*(rs|rupees|rupee)\b/gi, '$1');

  return value.replace(/\s+/g, ' ').trim();
}
