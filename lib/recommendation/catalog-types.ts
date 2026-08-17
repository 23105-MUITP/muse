import type { Product } from '@/lib/types';
import {
  BROWSE_WORDS,
  CATEGORY_WORDS,
  COLOR_WORDS,
  DIETARY_WORDS,
  MATERIAL_WORDS,
  STOPWORDS,
  WEAK_NAME_TOKENS,
  expandKeyword,
  tokenize,
} from './vocabulary';

function isModifierToken(token: string): boolean {
  return (
    STOPWORDS.has(token) ||
    COLOR_WORDS.has(token) ||
    MATERIAL_WORDS.has(token) ||
    CATEGORY_WORDS.has(token) ||
    BROWSE_WORDS.has(token) ||
    DIETARY_WORDS.has(token) ||
    WEAK_NAME_TOKENS.has(token) ||
    token.length < 3
  );
}

export function distinctiveNameTokens(product: Product): string[] {
  const brandTokens = new Set(tokenize(product.brand));
  return tokenize(product.name).filter(
    (token) => !isModifierToken(token) && !brandTokens.has(token)
  );
}

function tokenMatchesProduct(product: Product, token: string): boolean {
  const hay = [product.name, product.subcategory, ...product.tags].join(' ').toLowerCase();
  return expandKeyword(token).some((alias) => {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (alias === 'shirt' || alias === 'shirts') {
      return /\bshirts?\b/.test(hay.replace(/t[\s-]?shirts?/g, 'tshirt'));
    }
    return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`).test(hay);
  });
}

/** Map a catalog type word to the in-stock products that actually are that thing. */
export function catalogTypeIndex(products: Product[]): Map<string, Product[]> {
  const index = new Map<string, Product[]>();
  for (const product of products) {
    if (!product.inStock) continue;
    const tokens = Array.from(
      new Set([
        ...distinctiveNameTokens(product),
        ...tokenize(product.subcategory).filter((token) => !isModifierToken(token)),
      ])
    );
    for (const token of tokens) {
      const list = index.get(token) || [];
      if (!list.some((item) => item.id === product.id)) list.push(product);
      index.set(token, list);
    }
  }
  return index;
}

/**
 * If the shopper named a catalog product type (shirt, kurta, cookies, …),
 * return those product ids. Empty set = named a type we do not sell.
 * Null = no product type in the query (occasion / browse).
 */
export function catalogTypeGate(
  queryTokens: string[],
  products: Product[]
): Set<string> | null {
  const index = catalogTypeIndex(products);
  const typeHits = queryTokens
    .filter((token) => !isModifierToken(token))
    .map((token) => ({
      token,
      matches: index.get(token) || products.filter((product) => tokenMatchesProduct(product, token)),
    }))
    .filter((hit) => (index.has(hit.token) || hit.matches.length > 0) && hit.matches.length > 0);

  if (typeHits.length > 0) {
    typeHits.sort((a, b) => {
      const spec = a.matches.length - b.matches.length;
      if (spec !== 0) return spec;
      return b.token.length - a.token.length;
    });
    return new Set(typeHits[0].matches.map((product) => product.id));
  }

  const unknownType = queryTokens.some(
    (token) =>
      !isModifierToken(token) &&
      !index.has(token) &&
      !products.some((product) => tokenMatchesProduct(product, token))
  );
  return unknownType ? new Set() : null;
}
