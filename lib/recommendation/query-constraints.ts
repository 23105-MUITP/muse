import type { DietaryPreferences, ExtractedContext, ShopperGender } from '@/lib/types';

export function parseGenderFromQuery(query: string): ShopperGender | undefined {
  const text = query.toLowerCase();
  if (/\b(women'?s?|woman'?s?|ladies|lady|female|girls?)\b/.test(text)) {
    return 'women';
  }
  if (/\b(men'?s?|man'?s?|menswear|gents|male|boys?)\b/.test(text)) {
    return 'men';
  }
  return undefined;
}

export function parseBudgetFromQuery(query: string): { min?: number; max?: number } {
  const text = query.toLowerCase().replace(/,/g, '');

  const between = text.match(
    /\bbetween\s*(?:rs|₹)?\s*(\d+)\s*(?:and|to|-)\s*(?:rs|₹)?\s*(\d+)/
  );
  if (between) {
    const first = Number(between[1]);
    const second = Number(between[2]);
    return { min: Math.min(first, second), max: Math.max(first, second) };
  }

  const maxMatch = text.match(
    /\b(?:under|below|less than|upto|up to|within|max(?:imum)?)\s*(?:rs|₹)?\s*(\d+)/
  );
  const minMatch =
    text.match(
      /\b(?:above|over|starting(?:\s+(?:at|from))?|at least|min(?:imum)?|more than|greater than|from)\s*(?:rs|₹)?\s*(\d+)/
    ) || text.match(/\b(?:rs|₹)?\s*(\d+)\s*(?:\+|and above|or more|onwards)\b/);

  const budget: { min?: number; max?: number } = {};
  if (maxMatch) budget.max = Number(maxMatch[1]);
  if (minMatch) budget.min = Number(minMatch[1]);
  return budget;
}

export function parseDietaryFromQuery(query: string): Partial<DietaryPreferences> {
  const text = query.toLowerCase();
  const dietary: Partial<DietaryPreferences> = {};
  if (/\bvegan\b/.test(text)) dietary.vegan = true;
  if (/\bvegetarian\b/.test(text)) dietary.vegetarian = true;
  if (/\bgluten[- ]?free\b/.test(text)) dietary.glutenFree = true;
  if (/\bprotein([- ]?rich)?\b/.test(text)) dietary.proteinRich = true;
  if (/\borganic\b/.test(text)) dietary.organic = true;
  if (/\blow[- ]?cal(orie)?\b/.test(text)) dietary.lowCalorie = true;
  return dietary;
}

function withKeyword(keywords: string[], keyword: string): string[] {
  if (keywords.some((item) => item.toLowerCase() === keyword.toLowerCase())) {
    return keywords;
  }
  return [...keywords, keyword];
}

/**
 * Overlay deterministic constraints from the shopper's actual words.
 * LLMs often map "above 1000" to a max, drop "women", or miss "protein-rich".
 */
export function applyQueryConstraints(context: ExtractedContext): ExtractedContext {
  const query = context.originalQuery || '';
  const parsedBudget = parseBudgetFromQuery(query);
  const gender = parseGenderFromQuery(query) || context.gender;
  const dietary = parseDietaryFromQuery(query);

  const budget = { ...context.budget };
  if (parsedBudget.min != null || parsedBudget.max != null) {
    budget.min = parsedBudget.min ?? budget.min;
    budget.max = parsedBudget.max ?? budget.max;
    budget.hasConstraint = true;
    if (parsedBudget.min != null && parsedBudget.max == null && budget.max === parsedBudget.min) {
      delete budget.max;
    }
    if (parsedBudget.max != null && parsedBudget.min == null && budget.min === parsedBudget.max) {
      delete budget.min;
    }
  }

  const dietaryPreferences = {
    ...context.dietaryPreferences,
    ...dietary,
  };

  let keywords = [...context.keywords];
  if (/\bbreakfast\b/i.test(query)) keywords = withKeyword(keywords, 'breakfast');
  if (gender === 'women' && /\bkurtas?\b/i.test(query)) {
    keywords = withKeyword(keywords, 'kurti');
  }

  let category = context.category;
  if (category === 'unknown') {
    const fashionHit = /\b(kurta|kurti|shirt|tee|tees|jacket|palazzo|chino|jogger|stole|ethnic|fashion|wear)\b/i.test(
      query
    );
    const foodHit = /\b(breakfast|snack|snacks|vegan|protein|granola|cookie|makhana|tea|food)\b/i.test(
      query
    );
    if (fashionHit && foodHit) category = 'both';
    else if (fashionHit) category = 'fashion';
    else if (foodHit) category = 'food';
  }

  return {
    ...context,
    category,
    budget,
    dietaryPreferences,
    gender,
    keywords,
  };
}
