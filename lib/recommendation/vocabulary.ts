export const STOPWORDS = new Set([
  'under',
  'below',
  'less',
  'than',
  'show',
  'find',
  'want',
  'need',
  'please',
  'something',
  'cheap',
  'cheaper',
  'options',
  'rupees',
  'rupee',
  'rs',
  'the',
  'for',
  'and',
  'with',
  'some',
  'looking',
  'like',
  'related',
  'whatever',
  'kuch',
  'liye',
  'ke',
  'ka',
  'ki',
  'mujhe',
  'chahiye',
  'light',
  'heavy',
  'nice',
  'good',
  'cute',
  'pretty',
  'simple',
  'best',
  'new',
  'perfect',
  'daily',
]);

export const CATEGORY_WORDS = new Set([
  'fashion',
  'food',
  'wear',
  'clothes',
  'clothing',
  'outfit',
  'outfits',
  'look',
  'looks',
  'snacks',
  'snack',
  'breakfast',
  'ethnic',
  'casual',
  'formal',
]);

export const KEYWORD_ALIASES: Record<string, string[]> = {
  kurta: ['kurta', 'kurtas', 'kurti', 'kurtis'],
  kurtas: ['kurta', 'kurtas', 'kurti', 'kurtis'],
  kurti: ['kurta', 'kurtas', 'kurti', 'kurtis'],
  kurtis: ['kurta', 'kurtas', 'kurti', 'kurtis'],
  kirtan: ['kurta', 'kurtas', 'kurti', 'kurtis'],
  kirtans: ['kurta', 'kurtas', 'kurti', 'kurtis'],
  kirten: ['kurta', 'kurtas', 'kurti', 'kurtis'],
  curtain: ['kurta', 'kurtas', 'kurti', 'kurtis'],
  curtains: ['kurta', 'kurtas', 'kurti', 'kurtis'],
  tee: ['tee', 'tees', 't-shirt', 'tshirt'],
  tees: ['tee', 'tees', 't-shirt', 'tshirt'],
  tshirt: ['tee', 't-shirt', 'tshirt'],
  tshirts: ['tee', 't-shirt', 'tshirt'],
  palazzo: ['palazzo', 'palazzos'],
  chinos: ['chinos', 'chino'],
  joggers: ['joggers', 'jogger'],
  stole: ['stole', 'stoles', 'dupatta'],
  stool: ['stole', 'stoles'],
  makhana: ['makhana', 'makana', 'fox nut'],
  quinoa: ['quinoa'],
  chikankari: ['chikankari', 'chikan'],
  denim: ['denim'],
};

/** Spoken / Hinglish words that map to product occasion labels. */
export const OCCASION_GROUPS: Record<string, string[]> = {
  wedding: ['wedding', 'festive', 'party'],
  weddings: ['wedding', 'festive', 'party'],
  shaadi: ['wedding', 'festive', 'party'],
  shadi: ['wedding', 'festive', 'party'],
  bridal: ['wedding', 'festive', 'party'],
  bride: ['wedding', 'festive', 'party'],
  marriage: ['wedding', 'festive', 'party'],
  festive: ['festive', 'wedding', 'party'],
  festival: ['festive', 'wedding', 'party'],
  diwali: ['festive', 'wedding', 'party'],
  navratri: ['festive', 'party'],
  eid: ['festive', 'party'],
  puja: ['festive'],
  function: ['festive', 'wedding', 'party'],
  celebration: ['festive', 'party'],
  office: ['office', 'meeting', 'formal'],
  work: ['office', 'meeting', 'formal'],
  workplace: ['office', 'meeting'],
  meeting: ['office', 'meeting', 'formal'],
  corporate: ['office', 'meeting', 'formal'],
  gym: ['gym', 'sports'],
  workout: ['gym', 'sports'],
  sports: ['gym', 'sports'],
  athletic: ['gym', 'sports'],
  running: ['gym', 'sports'],
  party: ['party', 'festive'],
  parties: ['party', 'festive'],
  date: ['date', 'party', 'casual'],
  college: ['college', 'casual'],
  lounge: ['lounge', 'casual'],
  travel: ['travel', 'casual'],
};

export const SEASON_GROUPS: Record<string, Array<'summer' | 'winter' | 'monsoon' | 'all-season'>> = {
  summer: ['summer', 'all-season'],
  winter: ['winter', 'all-season'],
  cold: ['winter', 'all-season'],
  monsoon: ['monsoon', 'all-season'],
  rainy: ['monsoon', 'all-season'],
  rain: ['monsoon', 'all-season'],
};

export const STYLE_TYPE_GROUPS: Record<string, string[]> = {
  gym: ['sportswear'],
  workout: ['sportswear'],
  sports: ['sportswear'],
  athletic: ['sportswear'],
  office: ['formal', 'ethnic'],
  work: ['formal', 'ethnic'],
  wedding: ['ethnic'],
  shaadi: ['ethnic'],
  festive: ['ethnic'],
  casual: ['casual', 'streetwear'],
};

export const DIETARY_WORDS = new Set([
  'vegan',
  'vegetarian',
  'gluten',
  'protein',
  'organic',
  'healthy',
]);

export const BROWSE_WORDS = new Set([
  ...Array.from(CATEGORY_WORDS),
  ...Object.keys(OCCASION_GROUPS),
  ...Object.keys(SEASON_GROUPS),
  ...Array.from(DIETARY_WORDS),
]);

export function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[\s/_-]+/)
    .map((token) => token.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);
}

export function specificProductKeywords(keywords: string[]): string[] {
  return keywords.flatMap(tokenize).filter((keyword) => {
    return keyword.length > 2 && !STOPWORDS.has(keyword) && !/^\d+$/.test(keyword);
  });
}

export function expandKeyword(keyword: string): string[] {
  const lower = keyword.toLowerCase();
  return KEYWORD_ALIASES[lower] || [lower];
}

export function occasionLabelsFor(keyword: string): string[] {
  return OCCASION_GROUPS[keyword.toLowerCase()] || [];
}

export function seasonsFor(keyword: string) {
  return SEASON_GROUPS[keyword.toLowerCase()] || [];
}

export function styleTypesFor(keyword: string): string[] {
  return STYLE_TYPE_GROUPS[keyword.toLowerCase()] || [];
}
