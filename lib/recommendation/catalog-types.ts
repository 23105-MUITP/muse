import type { Product } from '@/lib/types';
import { expandKeyword, isModifierToken, PRODUCT_NOUNS, tokenize } from './vocabulary';

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
    .map((token) => {
      const aliases = expandKeyword(token);
      const seen = new Set<string>();
      const matches: Product[] = [];
      for (const alias of aliases) {
        for (const product of index.get(alias) || []) {
          if (!seen.has(product.id)) {
            seen.add(product.id);
            matches.push(product);
          }
        }
        for (const product of products) {
          if (!product.inStock || seen.has(product.id)) continue;
          if (tokenMatchesProduct(product, alias)) {
            seen.add(product.id);
            matches.push(product);
          }
        }
      }
      return { token, matches };
    })
    .filter((hit) => hit.matches.length > 0);

  const unknownTokens = queryTokens.filter(
    (token) =>
      !isModifierToken(token) &&
      !typeHits.some((hit) => hit.token === token) &&
      !index.has(token) &&
      !products.some((product) => tokenMatchesProduct(product, token))
  );
  const catalogNounHits = typeHits.filter(
    (hit) => PRODUCT_NOUNS.has(hit.token) || expandKeyword(hit.token).some((alias) => PRODUCT_NOUNS.has(alias))
  );

  // "running shoes" must not collapse onto sportswear/track pants.
  if (unknownTokens.length > 0 && catalogNounHits.length === 0) {
    return new Set();
  }

  const rankedHits =
    unknownTokens.length > 0 && catalogNounHits.length > 0 ? catalogNounHits : typeHits;
  if (rankedHits.length > 0) {
    rankedHits.sort((a, b) => {
      const spec = a.matches.length - b.matches.length;
      if (spec !== 0) return spec;
      return b.token.length - a.token.length;
    });
    return new Set(rankedHits[0].matches.map((product) => product.id));
  }

  return null;
}
