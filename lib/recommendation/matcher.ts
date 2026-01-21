import type { Product, ExtractedContext, ScoredProduct } from '@/lib/types';

const SCORE_WEIGHTS = {
  category: 25,
  budget: 25,
  preferences: 30,
  keywords: 20,
};

const MINIMUM_SCORE_THRESHOLD = 40;

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
  context: ExtractedContext
): { score: number; reasons: string[] } {
  if (context.keywords.length === 0) {
    return { score: SCORE_WEIGHTS.keywords * 0.5, reasons: [] };
  }

  const productText = [
    product.name,
    product.description,
    product.brand,
    product.subcategory,
    ...product.tags,
  ]
    .join(' ')
    .toLowerCase();

  let matchedKeywords = 0;
  const reasons: string[] = [];

  for (const keyword of context.keywords) {
    if (productText.includes(keyword.toLowerCase())) {
      matchedKeywords++;
      if (product.name.toLowerCase().includes(keyword.toLowerCase())) {
        reasons.push(`Matches "${keyword}"`);
      }
    }
  }

  const score = (matchedKeywords / context.keywords.length) * SCORE_WEIGHTS.keywords;
  return { score, reasons };
}

export function matchProducts(
  products: Product[],
  context: ExtractedContext
): ScoredProduct[] {
  const scoredProducts: ScoredProduct[] = products
    .filter((p) => p.inStock)
    .map((product) => {
      const categoryScore = calculateCategoryScore(product, context);
      const budgetScore = calculateBudgetScore(product, context);
      const { score: preferenceScore, reasons: prefReasons } = calculatePreferenceScore(
        product,
        context
      );
      const { score: keywordScore, reasons: kwReasons } = calculateKeywordScore(product, context);

      const totalScore = categoryScore + budgetScore + preferenceScore + keywordScore;
      const matchScore = Math.round(totalScore);

      // Combine all reasons
      const matchReasons: string[] = [];

      if (context.budget.hasConstraint && context.budget.max && product.price <= context.budget.max) {
        matchReasons.push('Within budget');
      }

      matchReasons.push(...prefReasons, ...kwReasons);

      // Add generic reasons if we don't have enough
      if (matchReasons.length === 0) {
        if (product.rating >= 4.5) matchReasons.push('Highly rated');
        if (product.category === context.category) matchReasons.push(`Top ${context.category} pick`);
      }

      return {
        ...product,
        matchScore,
        matchReasons: matchReasons.slice(0, 3), // Max 3 reasons
      };
    })
    .filter((p) => p.matchScore >= MINIMUM_SCORE_THRESHOLD)
    .sort((a, b) => b.matchScore - a.matchScore);

  return scoredProducts.slice(0, 5); // Return top 5 matches
}
