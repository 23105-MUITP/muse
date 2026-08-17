import { describe, expect, it } from 'vitest';
import productsData from '@/data/products.json';
import { matchProducts } from './matcher';
import { distinctiveNameTokens } from './catalog-types';
import type { ExtractedContext, Product } from '@/lib/types';

const products = productsData.products as Product[];

function context(overrides: Partial<ExtractedContext> = {}): ExtractedContext {
  return {
    intent: 'search',
    category: 'unknown',
    budget: { hasConstraint: false },
    dietaryPreferences: {
      vegan: false,
      vegetarian: false,
      glutenFree: false,
      proteinRich: false,
      organic: false,
      lowCalorie: false,
    },
    stylePreferences: {},
    keywords: [],
    originalQuery: 'test',
    ...overrides,
  };
}

const TYPE_QUERIES: Array<{ query: string; mustInclude: string; mustExclude: RegExp }> = [
  { query: 'white cotton shirt', mustInclude: 'Linen Blend Formal Shirt', mustExclude: /kurta|tee|cookie|makhana/i },
  { query: 'cotton kurta', mustInclude: 'Everyday Cotton Kurta', mustExclude: /shirt|tee|cookie/i },
  { query: 'oversized cotton tee', mustInclude: 'Oversized Cotton Tee', mustExclude: /shirt|kurta|tea/i },
  { query: 'chikankari kurti', mustInclude: 'Embroidered Chikankari Kurti', mustExclude: /shirt|cookie/i },
  { query: 'denim jacket', mustInclude: 'Classic Denim Jacket', mustExclude: /kurta|chino|cookie/i },
  { query: 'palazzo pants', mustInclude: 'Printed Palazzo Pants', mustExclude: /track|jogger|cookie/i },
  { query: 'slim fit chinos', mustInclude: 'Slim Fit Chinos', mustExclude: /palazzo|track|cookie/i },
  { query: 'woolen stole', mustInclude: 'Woolen Ethnic Stole', mustExclude: /kurta|jacket|cookie/i },
  { query: 'joggers', mustInclude: 'Relaxed Fit Joggers', mustExclude: /track|palazzo|cookie/i },
  { query: 'track pants', mustInclude: 'Athletic Dry-Fit Track Pants', mustExclude: /palazzo|jogger|cookie/i },
  { query: 'protein cookies', mustInclude: 'Plant-Based Protein Cookies', mustExclude: /shirt|kurta|jacket/i },
  { query: 'chia energy bars', mustInclude: 'Oats & Chia Seed Energy Bars', mustExclude: /cookie|shirt|kurta/i },
  { query: 'quinoa bites', mustInclude: 'Quinoa Energy Bites', mustExclude: /shirt|kurta|cookie/i },
  { query: 'masala makhana', mustInclude: 'Masala Roasted Makhana', mustExclude: /shirt|kurta|granola/i },
  { query: 'organic granola', mustInclude: 'Organic Granola Mix', mustExclude: /shirt|kurta|makhana/i },
  { query: 'peanut butter', mustInclude: 'Peanut Butter Protein Spread', mustExclude: /shirt|kurta|cookie/i },
  { query: 'trail mix', mustInclude: 'Mixed Dry Fruits Trail Mix', mustExclude: /shirt|kurta|granola/i },
  { query: 'green tea', mustInclude: 'Herbal Green Tea Collection', mustExclude: /tee|shirt|kurta/i },
];

describe('catalog type matching', () => {
  it.each(TYPE_QUERIES)('"$query" returns $mustInclude', ({ query, mustInclude, mustExclude }) => {
    const results = matchProducts(
      products,
      context({
        originalQuery: query,
        keywords: query.split(' '),
      })
    );
    const names = results.map((product) => product.name);
    expect(names, `got ${names.join(', ')}`).toContain(mustInclude);
    expect(names.some((name) => mustExclude.test(name))).toBe(false);
  });

  it.each(products)('can find $name from its catalog type word', (product) => {
    const typeWord = distinctiveNameTokens(product).at(-1);
    expect(typeWord, `no type token for ${product.name}`).toBeTruthy();
    const results = matchProducts(
      products,
      context({
        category: product.category,
        originalQuery: typeWord as string,
        keywords: [typeWord as string],
      })
    );
    expect(
      results.some((item) => item.id === product.id),
      `${product.name} missing for "${typeWord}"; got ${results.map((item) => item.name).join(', ')}`
    ).toBe(true);
    expect(results.every((item) => item.category === product.category)).toBe(true);
  });
});
