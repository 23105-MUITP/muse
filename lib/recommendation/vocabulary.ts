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
  'option',
  'options',
  'rupees',
  'rupee',
  'rs',
  'rich',
  'packed',
  'high',
  'extra',
  'items',
  'item',
  'products',
  'product',
  'choices',
  'picks',
  'selection',
  'ones',
  'available',
  'above',
  'over',
  'starting',
  'least',
  'greater',
  'between',
  'around',
  'upto',
  'minimum',
  'maximum',
  'priced',
  'price',
  'from',
  'women',
  'womens',
  'woman',
  'womans',
  'ladies',
  'lady',
  'female',
  'girls',
  'girl',
  'men',
  'mens',
  'man',
  'mans',
  'gents',
  'male',
  'boys',
  'boy',
  'guys',
  'guy',
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
  shirt: ['shirt', 'shirts'],
  shirts: ['shirt', 'shirts'],
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

export const COLOR_WORDS = new Set([
  'white',
  'black',
  'blue',
  'red',
  'green',
  'pink',
  'yellow',
  'beige',
  'ivory',
  'cream',
  'navy',
  'grey',
  'gray',
  'brown',
  'maroon',
  'gold',
  'orange',
  'purple',
]);

export const MATERIAL_WORDS = new Set([
  'cotton',
  'linen',
  'wool',
  'woolen',
  'denim',
  'silk',
  'rayon',
  'fleece',
  'polyester',
  'georgette',
]);

/** Canonical garment/food type. Shirt is not a tee; a tee is not a kurta. */
export const NOUN_CANONICAL: Record<string, string> = {
  shirt: 'shirt',
  shirts: 'shirt',
  tee: 'tee',
  tees: 'tee',
  tshirt: 'tee',
  tshirts: 'tee',
  kurta: 'kurta',
  kurtas: 'kurta',
  kurti: 'kurta',
  kurtis: 'kurta',
  kirtan: 'kurta',
  kirtans: 'kurta',
  palazzo: 'palazzo',
  palazzos: 'palazzo',
  chinos: 'chinos',
  chino: 'chinos',
  joggers: 'joggers',
  jogger: 'joggers',
  jacket: 'jacket',
  jackets: 'jacket',
  stole: 'stole',
  stoles: 'stole',
  pants: 'pants',
  tea: 'tea',
  cookies: 'cookies',
  cookie: 'cookies',
  makhana: 'makhana',
  granola: 'granola',
  quinoa: 'quinoa',
  bars: 'bars',
  bar: 'bars',
  bites: 'bites',
  bite: 'bites',
  spread: 'spread',
};

export const WEAK_NAME_TOKENS = new Set([
  'blend',
  'print',
  'classic',
  'collection',
  'mixed',
  'herbal',
  'plant',
  'based',
  'energy',
  'everyday',
  'authentic',
  'trendy',
  'sophisticated',
  'elegant',
  'timeless',
  'ultra',
  'comfortable',
  'versatile',
  'premium',
  'assorted',
  'delicious',
  'roasted',
  'printed',
  'handblock',
  'embroidered',
  'athletic',
  'relaxed',
  'oversized',
  'formal',
  'seed',
  'dry',
  'fit',
  'slim',
  'masala',
  'jaipur',
  'lucknowi',
  'lucknow',
]);

export const PRODUCT_NOUNS = new Set(Object.keys(NOUN_CANONICAL));

export const DIETARY_WORDS = new Set([
  'vegan',
  'vegetarian',
  'gluten',
  'protein',
  'organic',
  'healthy',
]);

export const GENDER_WORDS = new Set([
  'women',
  'womens',
  'woman',
  'womans',
  'ladies',
  'lady',
  'female',
  'girls',
  'girl',
  'men',
  'mens',
  'man',
  'mans',
  'gents',
  'male',
  'boys',
  'boy',
  'guys',
  'guy',
]);

export const BROWSE_WORDS = new Set([
  ...Array.from(CATEGORY_WORDS),
  ...Object.keys(OCCASION_GROUPS),
  ...Object.keys(SEASON_GROUPS),
  ...Array.from(DIETARY_WORDS),
]);

export function isModifierToken(token: string): boolean {
  return (
    STOPWORDS.has(token) ||
    COLOR_WORDS.has(token) ||
    MATERIAL_WORDS.has(token) ||
    CATEGORY_WORDS.has(token) ||
    BROWSE_WORDS.has(token) ||
    DIETARY_WORDS.has(token) ||
    GENDER_WORDS.has(token) ||
    WEAK_NAME_TOKENS.has(token) ||
    token.length < 3
  );
}

export function tokenize(value: string): string[] {
  const normalized = value
    .toLowerCase()
    .replace(/\bt[\s-]*shirts?\b/g, 'tshirt');
  return normalized
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

export function hasTerm(text: string, term: string): boolean {
  const hay = text.toLowerCase();
  const needle = term.toLowerCase();
  if (needle === 'shirt' || needle === 'shirts') {
    const withoutTees = hay.replace(/t[\s-]?shirts?/g, 'tshirt');
    return /\bshirts?\b/.test(withoutTees);
  }
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`).test(hay);
}

export function productNounsFrom(keywords: string[]): string[] {
  const nouns = keywords
    .map((keyword) => NOUN_CANONICAL[keyword.toLowerCase()])
    .filter((noun): noun is string => Boolean(noun));
  return Array.from(new Set(nouns));
}

/** Prefer a specific garment (palazzo, shirt) over a generic one (pants) or a material (cotton). */
export function requiredProductNoun(keywords: string[]): string | undefined {
  const nouns = productNounsFrom(keywords);
  if (nouns.length === 0) return undefined;
  if (nouns.includes('palazzo')) return 'palazzo';
  if (nouns.includes('chinos')) return 'chinos';
  if (nouns.includes('joggers')) return 'joggers';
  if (nouns.includes('shirt')) return 'shirt';
  if (nouns.includes('tee')) return 'tee';
  if (nouns.includes('kurta')) return 'kurta';
  return [...nouns].sort((a, b) => b.length - a.length)[0];
}
