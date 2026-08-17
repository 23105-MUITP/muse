import { expect, test } from '@playwright/test';
import {
  askShop,
  expectNoFood,
  gotoShop,
  loadedProductImages,
  productNames,
  waitForProductsOrReply,
} from './helpers';

function expectCalmReply(body: string) {
  expect(body).not.toMatch(
    /lehenga|banquet|venue|photographer|roadster|iphone|nike air|hotel booking|jewellery|jewelry store/i
  );
}

test.describe('occasion and off-catalog queries', () => {
  test.describe.configure({ timeout: 120_000 });

  test('wedding look returns festive ethnic wear, not a freak-out', async ({ page }) => {
    await gotoShop(page);
    await askShop(page, 'something for a wedding');
    await waitForProductsOrReply(page);

    const names = await productNames(page);
    const body = await page.locator('body').innerText();
    expectNoFood(names);
    expectCalmReply(body);
    expect(names.length).toBeGreaterThan(0);
    expect(names.some((name) => /kurta|kurti|stole|palazzo|ethnic/i.test(name))).toBe(
      true
    );
    const images = await loadedProductImages(page);
    expect(images.length).toBeGreaterThan(0);
    expect(images.every((image) => image.width > 0)).toBe(true);
  });

  test('shaadi hinglish still stays on ethnic fashion', async ({ page }) => {
    await gotoShop(page);
    await askShop(page, 'shaadi ke liye kuch');
    await waitForProductsOrReply(page);

    const names = await productNames(page);
    expectNoFood(names);
    expectCalmReply(await page.locator('body').innerText());
    if (names.length > 0) {
      expect(names.some((name) => /kurta|kurti|stole|palazzo/i.test(name))).toBe(true);
    }
  });

  test('office wear stays formal or work-ready fashion', async ({ page }) => {
    await gotoShop(page);
    await askShop(page, 'office wear');
    await waitForProductsOrReply(page);

    const names = await productNames(page);
    expectNoFood(names);
    expect(names.length).toBeGreaterThan(0);
    expectCalmReply(await page.locator('body').innerText());
  });

  test('gym clothes return sportswear, not snacks', async ({ page }) => {
    await gotoShop(page);
    await askShop(page, 'gym workout clothes');
    await waitForProductsOrReply(page);

    const names = await productNames(page);
    expectNoFood(names);
    expect(names.some((name) => /track|jogger|athletic/i.test(name))).toBe(true);
  });

  test('festive function look stays ethnic', async ({ page }) => {
    await gotoShop(page);
    await askShop(page, 'outfit for a festive function');
    await waitForProductsOrReply(page);

    const names = await productNames(page);
    expectNoFood(names);
    expectCalmReply(await page.locator('body').innerText());
    expect(names.length).toBeGreaterThan(0);
  });

  test('off-catalog shoes do not dump random product photos', async ({ page }) => {
    await gotoShop(page);
    await askShop(page, 'running shoes under 2000');
    await waitForProductsOrReply(page);

    const names = await productNames(page);
    expect(names, `shoes should not map to ${names.join(', ')}`).toEqual([]);
    expectCalmReply(await page.locator('body').innerText());
  });

  test('iphone query stays empty instead of inventing electronics', async ({ page }) => {
    await gotoShop(page);
    await askShop(page, 'iphone 16');
    await waitForProductsOrReply(page);

    const names = await productNames(page);
    expect(names).toEqual([]);
    expectCalmReply(await page.locator('body').innerText());
  });

  test('spoken five hundred budget still finds a kurta', async ({ page }) => {
    await gotoShop(page);
    await askShop(page, 'kurta under five hundred');
    await waitForProductsOrReply(page);

    const names = await productNames(page);
    expectNoFood(names);
    expect(names.some((name) => /kurta/i.test(name))).toBe(true);
    const prices = await page.getByTestId('product-card').evaluateAll((els) =>
      els.map((el) => Number(el.getAttribute('data-product-price') || '0'))
    );
    if (prices.length > 0) {
      expect(prices.every((price) => price <= 500)).toBe(true);
    }
  });
});
