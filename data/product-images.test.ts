import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import productsData from '@/data/products.json';
import type { Product } from '@/lib/types';

const products = productsData.products as Product[];

/** Photos previously used on the wrong product (saree on kurta, cola on bars, etc.). */
const FORBIDDEN_PHOTO_IDS = [
  '1610030469983-98e550d6193c', // saree used as kurta
  '1617627143750-d86bc21e42bb', // saree used as kurti
  '1622483767028-3f66f32aef97', // Coca-Cola used as energy bars
  '1512621776951-a57141f2eefd', // salad used as quinoa bites
  '1599599810769-bcde5a160d32', // chocolates used as makhana
  '1490474418585-ba9bad8fd0ea', // fruit platter used as granola
  '1505253758473-96b7015fcd40', // curry used as peanut butter
  '1508747703725-719777637510', // onions used as trail mix
  '1556679343-c7306c1976bc', // iced cocktail used as green tea
  '1576995853123-5a10305d93c0', // jeans rack used as denim jacket
  '1594633312681-425c7b97ccd1', // joggers used as palazzo
  '1601924994987-69e26d50dc26', // puffer jackets used as stole
  '1515886657613-9f3515b0c78f', // crop hoodie tracksuit used as track pants
];

const EXPECTED_LOCAL_FILES = ['food-003', 'food-004', 'food-006', 'food-007'];

describe('catalog product photos', () => {
  it('gives every SKU its own photo', () => {
    const urls = products.map((product) => product.imageUrl);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('does not reuse the old mismatched Unsplash shots', () => {
    const haystack = products.map((product) => product.imageUrl).join('\n');
    for (const photoId of FORBIDDEN_PHOTO_IDS) {
      expect(haystack, `stale photo ${photoId} is still in the catalog`).not.toContain(
        photoId
      );
    }
  });

  it('keeps kurtas and kurtis off saree photos and off each other', () => {
    const ethnic = products.filter((product) =>
      /kurta|kurti/i.test(product.name)
    );
    expect(ethnic.length).toBeGreaterThanOrEqual(3);
    const urls = ethnic.map((product) => product.imageUrl);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every((url) => !url.includes('1610030469983'))).toBe(true);
    expect(urls.every((url) => !url.includes('1617627143750'))).toBe(true);
  });

  it('stores Indian-snack photos next to the app so they cannot drift', () => {
    for (const id of EXPECTED_LOCAL_FILES) {
      const product = products.find((item) => item.id === id);
      expect(product?.imageUrl).toBe(`/images/products/${id}.jpg`);
      expect(
        existsSync(path.join(process.cwd(), 'public', 'images', 'products', `${id}.jpg`))
      ).toBe(true);
    }
  });

  it('does not use placeholders', () => {
    expect(products.every((product) => Boolean(product.imageUrl))).toBe(true);
    expect(products.some((product) => product.imageUrl.includes('placehold.co'))).toBe(
      false
    );
  });
});
