import type { Product, ExtractedContext, ScoredProduct } from '@/lib/types';
import {
  BROWSE_WORDS,
  DIETARY_WORDS,
  expandKeyword,
  occasionLabelsFor,
  seasonsFor,
  specificProductKeywords,
  styleTypesFor,
  tokenize,
} from './vocabulary';

export { specificProductKeywords } from './vocabulary';

const SCORE_WEIGHTS = {
  category: 25,
  budget: 25,
  preferences: 30,
  keywords: 20,
};

const MINIMUM_SCORE_THRESHOLD = 40;

function productSearchText(product: Product): string {
  return [
    product.name,
    product.description,
    product.brand,
    product.subcategory,
    ...product.tags,
    product.style?.type,
    product.style?.fabric,
    product.style?.fit,
    product.style?.season,
    ...(product.style?.occasion || []),
    product.dietary?.isVegan ? 'vegan' : '',
    product.dietary?.isGlutenFree ? 'gluten-free gluten' : '',
    product.dietary?.isProteinRich ? 'protein' : '',
    product.dietary?.isOrganic ? 'organic' : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function productMatchesKeyword(product: Product, keyword: string): boolean {
  const lower = keyword.toLowerCase();
  const productText = productSearchText(product);

  if (expandKeyword(lower).some((alias) => productText.includes(alias))) {
    return true;
  }

  const occasions = occasionLabelsFor(lower);
  if (
    occasions.length > 0 &&
    product.style?.occasion.some((occasion) => occasions.includes(occasion.toLowerCase()))
  ) {
    return true;
  }

  const seasons = seasonsFor(lower);
  if (seasons.length > 0 && product.style && seasons.includes(product.style.season)) {
    return true;
  }

  const types = styleTypesFor(lower);
  if (types.length > 0 && product.style && types.includes(product.style.type)) {
    return true;
  }

  if (DIETARY_WORDS.has(lower) && product.dietary) {
    if (lower === 'vegan') return product.dietary.isVegan;
    if (lower === 'vegetarian') return product.dietary.isVegetarian;
    if (lower === 'gluten') return product.dietary.isGlutenFree;
    if (lower === 'protein') return product.dietary.isProteinRich;
    if (lower === 'organic') return product.dietary.isOrganic;
    if (lower === 'healthy') {
      return product.dietary.isVegan || product.dietary.isLowCalorie || product.dietary.isOrganic;
    }
  }

  return false;
}

function mergedSearchKeywords(context: ExtractedContext): string[] {
  return Array.from(
    new Set([
      ...specificProductKeywords(context.keywords),
      ...specificProductKeywords(tokenize(context.originalQuery || '')),
      ...specificProductKeywords([
        context.stylePreferences.occasion || '',
        context.stylePreferences.type || '',
        context.stylePreferences.season || '',
      ]),
    ])
  );
}

function calculateCategoryScore(product: Product, context: ExtractedContext): number {
  if (context.category === 'unknown' || context.category === 'both') {
    return SCORE_WEIGHTS.category * 0.5; // Partial match for unknown/both
  }
  return product.category === context.category ? SCORE_WEIGHTS.category : 0;
}

function calculateBudgetScore(product: Product, context: ExtractedContext): number {
  if (!context.budget.hasConstraint) {
    return SCORE_WEIGHTS.budget; // Full score if no budget constraint
  }

  const { min, max } = context.budget;
  const price = product.price;

  if (max && price > max) {
    // Over budget - penalize based on how much over
    const overPercentage = (price - max) / max;
    return Math.max(0, SCORE_WEIGHTS.budget * (1 - overPercentage * 2));
  }

  if (min && price < min) {
    // Under budget minimum - slight penalty
    return SCORE_WEIGHTS.budget * 0.7;
  }

  // Within budget
  return SCORE_WEIGHTS.budget;
}

function calculatePreferenceScore(
  product: Product,
  context: ExtractedContext
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const maxScore = SCORE_WEIGHTS.preferences;

  if (product.category === 'food' && product.dietary) {
    const dietary = context.dietaryPreferences;
    let matchCount = 0;
    let totalPreferences = 0;

    if (dietary.vegan) {
      totalPreferences++;
      if (product.dietary.isVegan) {
        matchCount++;
        reasons.push('Vegan-friendly');
      }
    }
    if (dietary.vegetarian) {
      totalPreferences++;
      if (product.dietary.isVegetarian) {
        matchCount++;
        reasons.push('Vegetarian');
      }
    }
    if (dietary.glutenFree) {
      totalPreferences++;
      if (product.dietary.isGlutenFree) {
        matchCount++;
        reasons.push('Gluten-free');
      }
    }
    if (dietary.proteinRich) {
      totalPreferences++;
      if (product.dietary.isProteinRich) {
        matchCount++;
        reasons.push('High in protein');
      }
    }
    if (dietary.organic) {
      totalPreferences++;
      if (product.dietary.isOrganic) {
        matchCount++;
        reasons.push('Organic');
      }
    }
    if (dietary.lowCalorie) {
      totalPreferences++;
      if (product.dietary.isLowCalorie) {
        matchCount++;
        reasons.push('Low calorie');
      }
    }

    if (totalPreferences > 0) {
      score = (matchCount / totalPreferences) * maxScore;
    } else {
      score = maxScore * 0.5; // No specific preferences - partial match
    }
  } else if (product.category === 'fashion' && product.style) {
    const stylePrefs = context.stylePreferences;
    let matchCount = 0;
    let totalPreferences = 0;

    if (stylePrefs.type) {
      totalPreferences++;
      if (product.style.type === stylePrefs.type) {
        matchCount++;
        reasons.push(`${stylePrefs.type} style`);
      }
    }
    if (stylePrefs.occasion) {
      totalPreferences++;
      const occasionLower = stylePrefs.occasion.toLowerCase();
      if (product.style.occasion.some((o) => o.toLowerCase().includes(occasionLower))) {
        matchCount++;
        reasons.push(`Perfect for ${stylePrefs.occasion}`);
      }
    }
    if (stylePrefs.fabric) {
      totalPreferences++;
      if (product.style.fabric.toLowerCase().includes(stylePrefs.fabric.toLowerCase())) {
        matchCount++;
        reasons.push(`${product.style.fabric} fabric`);
      }
    }
    if (stylePrefs.fit) {
      totalPreferences++;
      if (product.style.fit === stylePrefs.fit) {
        matchCount++;
        reasons.push(`${stylePrefs.fit} fit`);
      }
    }
    if (stylePrefs.season) {
      totalPreferences++;
      if (product.style.season === stylePrefs.season || product.style.season === 'all-season') {
        matchCount++;
        reasons.push(`Great for ${stylePrefs.season}`);
      }
    }

    if (totalPreferences > 0) {
      score = (matchCount / totalPreferences) * maxScore;
    } else {
      score = maxScore * 0.5;
    }
  } else {
    score = maxScore * 0.3; // Category mismatch or missing data
  }

  return { score, reasons };
}

function calculateKeywordScore(
  product: Product,
  keywords: string[]
): { score: number; reasons: string[] } {
  if (keywords.length === 0) {
    return { score: SCORE_WEIGHTS.keywords * 0.5, reasons: [] };
  }

  const productText = productSearchText(product);

  let matchedKeywords = 0;
  const reasons: string[] = [];

  for (const keyword of keywords) {
    const aliases = expandKeyword(keyword);
    if (aliases.some((alias) => productText.includes(alias))) {
      matchedKeywords++;
      if (aliases.some((alias) => product.name.toLowerCase().includes(alias))) {
        reasons.push(`Matches "${keyword}"`);
      }
    }
  }

  const score = (matchedKeywords / keywords.length) * SCORE_WEIGHTS.keywords;
  return { score, reasons };
}

export function matchProducts(
  products: Product[],
  context: ExtractedContext
): ScoredProduct[] {
  const searchKeywords = mergedSearchKeywords(context);
  const specificKeywords = searchKeywords.filter(
    (keyword) => !BROWSE_WORDS.has(keyword)
  );
  const browseKeywords = searchKeywords.filter(
    (keyword) =>
      occasionLabelsFor(keyword).length > 0 ||
      seasonsFor(keyword).length > 0 ||
      styleTypesFor(keyword).length > 0 ||
      DIETARY_WORDS.has(keyword)
  );
  const primaryKeyword = [...specificKeywords].sort((a, b) => b.length - a.length)[0];
  const nounInCatalog = primaryKeyword
    ? products.some((product) => product.inStock && productMatchesKeyword(product, primaryKeyword))
    : false;

  const scoredProducts: ScoredProduct[] = products
    .filter((p) => p.inStock)
    .filter((product) => {
      if (!context.budget.hasConstraint || !context.budget.max) return true;
      return product.price <= context.budget.max;
    })
    .filter((product) => {
      if (primaryKeyword && !nounInCatalog) {
        return false;
      }

      const nounHit = primaryKeyword
        ? productMatchesKeyword(product, primaryKeyword)
        : specificKeywords.some((keyword) => productMatchesKeyword(product, keyword));
      const browseHit =
        browseKeywords.length === 0 ||
        browseKeywords.some((keyword) => productMatchesKeyword(product, keyword));

      if (primaryKeyword && browseKeywords.length > 0) {
        return nounHit || browseHit;
      }
      if (primaryKeyword || specificKeywords.length > 0) {
        return nounHit;
      }
      if (browseKeywords.length > 0) {
        return browseHit;
      }
      return true;
    })
    .map((product) => {
      const categoryScore = calculateCategoryScore(product, context);
      const budgetScore = calculateBudgetScore(product, context);
      const { score: preferenceScore, reasons: prefReasons } = calculatePreferenceScore(
        product,
        context
      );
      const { score: keywordScore, reasons: kwReasons } = calculateKeywordScore(
        product,
        searchKeywords
      );

      const totalScore = categoryScore + budgetScore + preferenceScore + keywordScore;
      const matchScore = Math.round(totalScore);

      const matchReasons: string[] = [];

      if (context.budget.hasConstraint && context.budget.max && product.price <= context.budget.max) {
        matchReasons.push('Within budget');
      }

      matchReasons.push(...prefReasons, ...kwReasons);

      if (matchReasons.length === 0) {
        if (product.rating >= 4.5) matchReasons.push('Highly rated');
        if (product.category === context.category) matchReasons.push(`Top ${context.category} pick`);
      }

      return {
        ...product,
        matchScore,
        matchReasons: matchReasons.slice(0, 3),
      };
    })
    .filter((p) => p.matchScore >= MINIMUM_SCORE_THRESHOLD)
    .sort((a, b) => b.matchScore - a.matchScore);

  return scoredProducts.slice(0, 5);
}
