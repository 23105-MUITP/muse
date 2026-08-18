import { describe, expect, it } from 'vitest';
import {
  applyQueryConstraints,
  parseBudgetFromQuery,
  parseDietaryFromQuery,
  parseGenderFromQuery,
} from './query-constraints';
import type { ExtractedContext } from '@/lib/types';

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

describe('query constraints', () => {
  it('reads above/over as a minimum, not a maximum', () => {
    expect(parseBudgetFromQuery("women's kurta above 1000")).toEqual({ min: 1000 });
    expect(parseBudgetFromQuery('kurta over 1000')).toEqual({ min: 1000 });
    expect(parseBudgetFromQuery('kurta under 500')).toEqual({ max: 500 });
  });

  it('corrects an LLM that mapped above 1000 to max 1000', () => {
    const resolved = applyQueryConstraints(
      context({
        budget: { max: 1000, hasConstraint: true },
        originalQuery: "women's kurta above 1000",
      })
    );
    expect(resolved.budget.min).toBe(1000);
    expect(resolved.budget.max).toBeUndefined();
    expect(resolved.gender).toBe('women');
  });

  it('detects woman/women and protein-rich breakfast', () => {
    expect(parseGenderFromQuery('woman kurta')).toBe('women');
    expect(parseGenderFromQuery("women's kurta above 1000")).toBe('women');
    expect(parseGenderFromQuery('mens kurta')).toBe('men');
    expect(parseDietaryFromQuery('Protein-rich breakfast options').proteinRich).toBe(true);
  });
});
