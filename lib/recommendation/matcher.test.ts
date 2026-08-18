import { describe, expect, it } from 'vitest';
import productsData from '@/data/products.json';
import { matchProducts } from './matcher';
import type { ExtractedContext, Product } from '@/lib/types';

const products = productsData.products as Product[];

function context(overrides: Partial<ExtractedContext> = {}): ExtractedContext {
  return {
    intent: 'search',
    category: 'food',
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

describe('matchProducts', () => {
  it('returns vegan snacks under ₹300', () => {
    const results = matchProducts(
      products,
      context({
        budget: { max: 300, hasConstraint: true },
        dietaryPreferences: {
          vegan: true,
          vegetarian: false,
          glutenFree: false,
          proteinRich: false,
          organic: false,
          lowCalorie: false,
        },
        keywords: ['snacks'],
        originalQuery: 'vegan snacks under 300',
      })
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].price).toBeLessThanOrEqual(300);
    expect(results[0].dietary?.isVegan).toBe(true);
    expect(results[0].matchScore).toBeGreaterThanOrEqual(40);
  });

  it('maps kirtan to kurtas and keeps results under budget', () => {
    const results = matchProducts(
      products,
      context({
        category: 'fashion',
        budget: { max: 500, hasConstraint: true },
        keywords: ['kirtan'],
        originalQuery: 'kirtan under 500',
      })
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((product) => product.price <= 500)).toBe(true);
    expect(results.every((product) => /kurta|kurti/i.test(product.name))).toBe(true);
    expect(results.some((product) => product.id === 'fashion-011')).toBe(true);
  });

  it('does not dump unrelated products for an unknown item', () => {
    const results = matchProducts(
      products,
      context({
        category: 'unknown',
        budget: { max: 500, hasConstraint: true },
        keywords: [],
        originalQuery: 'xylophone under 500',
      })
    );

    expect(results).toEqual([]);
  });

  it('keeps palazzo pants off track pants', () => {
    const results = matchProducts(
      products,
      context({
        category: 'fashion',
        keywords: ['palazzo', 'pants'],
        originalQuery: 'palazzo pants',
      })
    );

    expect(results.map((product) => product.name)).toContain('Printed Palazzo Pants');
    expect(results.map((product) => product.name)).not.toContain(
      'Athletic Dry-Fit Track Pants'
    );
  });

  it('returns in-budget casual wear instead of an empty list', () => {
    const results = matchProducts(
      products,
      context({
        category: 'fashion',
        budget: { max: 1000, hasConstraint: true },
        keywords: ['casual wear'],
        originalQuery: 'casual wear under 1000',
      })
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((product) => product.category === 'fashion')).toBe(true);
    expect(results.every((product) => product.price <= 1000)).toBe(true);
  });

  it('treats light ethnic wear for summer as a browse, not an unknown noun', () => {
    const results = matchProducts(
      products,
      context({
        category: 'fashion',
        keywords: ['light', 'ethnic', 'wear', 'summer'],
        originalQuery: 'Light ethnic wear for summer',
      })
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((product) => product.category === 'fashion')).toBe(true);
  });

  it('treats wedding and shaadi as festive ethnic wear', () => {
    const wedding = matchProducts(
      products,
      context({
        category: 'fashion',
        keywords: ['wedding'],
        originalQuery: 'something for a wedding',
      })
    );
    const shaadi = matchProducts(
      products,
      context({
        category: 'fashion',
        keywords: ['shaadi'],
        originalQuery: 'shaadi ke liye kuch',
      })
    );

    expect(wedding.length).toBeGreaterThan(0);
    expect(wedding.every((product) => product.category === 'fashion')).toBe(true);
    expect(
      wedding.some((product) =>
        /kurta|kurti|stole|palazzo/i.test(product.name)
      )
    ).toBe(true);
    expect(wedding.every((product) => product.category !== 'food')).toBe(true);
    expect(shaadi.some((product) => /kurta|kurti|stole|palazzo/i.test(product.name))).toBe(
      true
    );
  });

  it('returns office and gym looks from occasion, not snacks', () => {
    const office = matchProducts(
      products,
      context({
        category: 'fashion',
        originalQuery: 'office wear',
        keywords: ['office'],
      })
    );
    const gym = matchProducts(
      products,
      context({
        category: 'fashion',
        originalQuery: 'gym workout clothes',
        keywords: ['gym', 'workout'],
      })
    );

    expect(office.length).toBeGreaterThan(0);
    expect(office.every((product) => product.category === 'fashion')).toBe(true);
    expect(gym.some((product) => /track|jogger|athletic/i.test(product.name))).toBe(true);
    expect(gym.every((product) => product.category === 'fashion')).toBe(true);
  });

  it('does not substitute random catalog items for shoes or a jacket under 500', () => {
    const shoes = matchProducts(
      products,
      context({
        category: 'unknown',
        originalQuery: 'running shoes under 2000',
        keywords: ['shoes'],
      })
    );
    const jacket = matchProducts(
      products,
      context({
        category: 'fashion',
        budget: { max: 500, hasConstraint: true },
        originalQuery: 'denim jacket under 500',
        keywords: ['denim', 'jacket'],
      })
    );

    expect(shoes).toEqual([]);
    expect(jacket).toEqual([]);
  });

  it('does not substitute track pants for running shoes even if style is sportswear', () => {
    const results = matchProducts(
      products,
      context({
        category: 'fashion',
        stylePreferences: { type: 'sportswear' },
        budget: { max: 2000, hasConstraint: true },
        originalQuery: 'running shoes under 2000',
        keywords: ['shoes', 'running', 'sportswear'],
      })
    );

    expect(results).toEqual([]);
  });

  it('hard-filters products over the stated budget', () => {
    const results = matchProducts(
      products,
      context({
        category: 'fashion',
        budget: { max: 500, hasConstraint: true },
        keywords: ['kurta'],
        originalQuery: 'kurta under 500',
      })
    );

    expect(results.every((product) => product.price <= 500)).toBe(true);
    expect(results.some((product) => /kurta/i.test(product.name))).toBe(true);
    expect(results.some((product) => product.price === 1499)).toBe(false);
  });

  it('filters out-of-stock products', () => {
    const withOos = [
      ...products,
      { ...products[0], id: 'oos', inStock: false, name: 'Out of stock vegan snack' },
    ];
    const results = matchProducts(
      withOos,
      context({
        keywords: ['out', 'of', 'stock'],
        dietaryPreferences: {
          vegan: true,
          vegetarian: false,
          glutenFree: false,
          proteinRich: false,
          organic: false,
          lowCalorie: false,
        },
      })
    );
    expect(results.every((p) => p.id !== 'oos')).toBe(true);
  });

  it('white cotton shirt returns the shirt, not cotton kurtas or tees', () => {
    const results = matchProducts(
      products,
      context({
        category: 'fashion',
        keywords: ['white', 'cotton', 'shirt'],
        originalQuery: 'white cotton shirt',
      })
    );

    expect(results.map((product) => product.name)).toContain('Linen Blend Formal Shirt');
    expect(results.every((product) => /shirt/i.test(product.name))).toBe(true);
    expect(results.some((product) => /kurta|kurti|tee|cookie|makhana/i.test(product.name))).toBe(
      false
    );
  });

  it('cotton kurta stays kurtas, not the formal shirt', () => {
    const results = matchProducts(
      products,
      context({
        category: 'fashion',
        keywords: ['cotton', 'kurta'],
        originalQuery: 'cotton kurta',
      })
    );

    expect(results.some((product) => /kurta/i.test(product.name))).toBe(true);
    expect(results.some((product) => /formal shirt/i.test(product.name))).toBe(false);
  });

  it('protein-rich breakfast options returns breakfast protein, not an empty catalog', () => {
    const results = matchProducts(
      products,
      context({
        category: 'unknown',
        keywords: ['protein', 'rich', 'breakfast', 'options'],
        originalQuery: 'Protein-rich breakfast options',
      })
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((product) => product.category === 'food')).toBe(true);
    expect(results.every((product) => product.dietary?.isProteinRich)).toBe(true);
    expect(results.map((product) => product.name)).toContain('Oats & Chia Seed Energy Bars');
    expect(results.some((product) => /kurta|kurti|shirt|tee/i.test(product.name))).toBe(false);
  });

  it("women's kurta above 1000 is the kurti, not a cheap men's kurta", () => {
    const results = matchProducts(
      products,
      context({
        category: 'fashion',
        budget: { max: 1000, hasConstraint: true },
        keywords: ['kurta'],
        originalQuery: "women's kurta above 1000",
      })
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((product) => product.price >= 1000)).toBe(true);
    expect(results.every((product) => product.audience !== 'men')).toBe(true);
    expect(results.map((product) => product.name)).toContain('Embroidered Chikankari Kurti');
    expect(results.some((product) => /Everyday Cotton Kurta/i.test(product.name))).toBe(false);
  });

  it('woman kurta stays on women ethnic wear', () => {
    const results = matchProducts(
      products,
      context({
        category: 'fashion',
        keywords: ['kurta'],
        originalQuery: 'woman kurta',
      })
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((product) => product.audience !== 'men')).toBe(true);
    expect(results.map((product) => product.name)).toContain('Embroidered Chikankari Kurti');
  });

  it('hard-filters products below the stated minimum', () => {
    const results = matchProducts(
      products,
      context({
        category: 'fashion',
        budget: { min: 1000, hasConstraint: true },
        keywords: ['kurta'],
        originalQuery: 'kurta above 1000',
      })
    );

    expect(results.every((product) => product.price >= 1000)).toBe(true);
    expect(results.some((product) => product.price < 1000)).toBe(false);
  });

  it('slim fit chinos and denim jacket hit the named garment', () => {
    const chinos = matchProducts(
      products,
      context({
        category: 'fashion',
        originalQuery: 'slim fit chinos',
        keywords: ['slim', 'fit', 'chinos'],
      })
    );
    const jacket = matchProducts(
      products,
      context({
        category: 'fashion',
        originalQuery: 'denim jacket',
        keywords: ['denim', 'jacket'],
      })
    );

    expect(chinos.map((product) => product.name)).toContain('Slim Fit Chinos');
    expect(chinos.every((product) => /chino/i.test(product.name))).toBe(true);
    expect(jacket.map((product) => product.name)).toContain('Classic Denim Jacket');
    expect(jacket.every((product) => /jacket/i.test(product.name))).toBe(true);
  });
});
