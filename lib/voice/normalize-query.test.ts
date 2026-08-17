import { describe, expect, it } from 'vitest';
import { normalizeShoppingQuery } from './normalize-query';

describe('normalizeShoppingQuery', () => {
  it('turns spoken budgets into digits', () => {
    expect(normalizeShoppingQuery('kurta under five hundred')).toBe('kurta under 500');
    expect(normalizeShoppingQuery('snacks under 1k')).toBe('snacks under 1000');
    expect(normalizeShoppingQuery('tee under ₹800 rs')).toBe('tee under 800');
  });

  it('still corrects kirtan to kurta', () => {
    expect(normalizeShoppingQuery('kirtan under five hundred')).toBe('kurta under 500');
  });
});
