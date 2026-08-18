import type { Product, ExtractedContext, ScoredProduct, ShopperGender } from '@/lib/types';
import {
  BROWSE_WORDS,
  CATEGORY_WORDS,
  COLOR_WORDS,
  DIETARY_WORDS,
  MATERIAL_WORDS,
  expandKeyword,
  hasTerm,
  occasionLabelsFor,
  requiredProductNoun,
  seasonsFor,
  specificProductKeywords,
  styleTypesFor,
  tokenize,
} from './vocabulary';

import { catalogTypeGate } from './catalog-types';
import { applyQueryConstraints } from './query-constraints';

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
    product.audience || '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function productMatchesNoun(
  product: Product,
  noun: string,
  gender?: ShopperGender
): boolean {
  const name = product.name.toLowerCase();
  const text = productSearchText(product);

  if (noun === 'shirt') {
    return hasTerm(text, 'shirt') && !/tee|t-shirt|kurta|kurti/i.test(name);
  }
  if (noun === 'tee') {
    return hasTerm(name, 'tee') || hasTerm(text, 'tshirt') || hasTerm(text, 't-shirt');
  }
  if (noun === 'kurta') {
    const aliases =
      gender === 'men'
        ? ['kurta', 'kurtas']
        : gender === 'women'
          ? ['kurti', 'kurtis', 'kurta', 'kurtas']
          : ['kurta', 'kurtas', 'kurti', 'kurtis'];
    return aliases.some((alias) => hasTerm(text, alias));
  }
  if (noun === 'tea') {
    return hasTerm(text, 'tea') && !hasTerm(name, 'tee');
  }
  return expandKeyword(noun).some((alias) => hasTerm(text, alias)) || productMatchesKeyword(product, noun);
}

export function productMatchesKeyword(product: Product, keyword: string): boolean {
  const lower = keyword.toLowerCase();
  const productText = productSearchText(product);

  if (expandKeyword(lower).some((alias) => hasTerm(productText, alias))) {
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
    return 0;
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
    if (aliases.some((alias) => hasTerm(productText, alias))) {
      matchedKeywords++;
      if (aliases.some((alias) => hasTerm(product.name.toLowerCase(), alias))) {
        reasons.push(`Matches "${keyword}"`);
      }
    }
  }

  const score = (matchedKeywords / keywords.length) * SCORE_WEIGHTS.keywords;
  return { score, reasons };
}

function productMatchesGender(product: Product, gender?: ShopperGender): boolean {
  if (!gender || product.category !== 'fashion') return true;
  const audience = product.audience || 'unisex';
  return audience === 'unisex' || audience === gender;
}

function tightenBy<T>(items: T[], predicate: (item: T) => boolean): T[] {
  const next = items.filter(predicate);
  return next.length > 0 ? next : items;
}

export function matchProducts(
  products: Product[],
  rawContext: ExtractedContext
): ScoredProduct[] {
  const context = applyQueryConstraints(rawContext);
  const searchKeywords = mergedSearchKeywords(context);
  const spokenTokens = specificProductKeywords(tokenize(context.originalQuery || ''));
  const typeGate = catalogTypeGate(
    spokenTokens.length > 0 ? spokenTokens : searchKeywords,
    products
  );
  const requiredNoun = requiredProductNoun(searchKeywords);
  const specificKeywords = searchKeywords.filter(
    (keyword) => !BROWSE_WORDS.has(keyword) && !COLOR_WORDS.has(keyword)
  );
  const materials = searchKeywords.filter((keyword) => MATERIAL_WORDS.has(keyword));
  const browseKeywords = searchKeywords.filter(
    (keyword) =>
      occasionLabelsFor(keyword).length > 0 ||
      seasonsFor(keyword).length > 0 ||
      styleTypesFor(keyword).length > 0 ||
      DIETARY_WORDS.has(keyword) ||
      CATEGORY_WORDS.has(keyword)
  );
  const dietaryKeywords = browseKeywords.filter((keyword) => DIETARY_WORDS.has(keyword));
  const otherBrowseKeywords = browseKeywords.filter((keyword) => !DIETARY_WORDS.has(keyword));
  const primaryKeyword = [...specificKeywords].sort((a, b) => b.length - a.length)[0];
  const nounInCatalog = requiredNoun
    ? products.some(
        (product) =>
          product.inStock && productMatchesNoun(product, requiredNoun, context.gender)
      )
    : primaryKeyword
      ? products.some((product) => product.inStock && productMatchesKeyword(product, primaryKeyword))
      : false;

  let candidates = products
    .filter((p) => p.inStock)
    .filter((product) => {
      if (!context.budget.hasConstraint) return true;
      if (context.budget.max && product.price > context.budget.max) return false;
      if (context.budget.min && product.price < context.budget.min) return false;
      return true;
    })
    .filter((product) => productMatchesGender(product, context.gender))
    .filter((product) => {
      if (typeGate) {
        return typeGate.has(product.id);
      }

      if (requiredNoun) {
        return nounInCatalog && productMatchesNoun(product, requiredNoun, context.gender);
      }

      if (primaryKeyword && !nounInCatalog) {
        return false;
      }

      const nounHit = primaryKeyword
        ? productMatchesKeyword(product, primaryKeyword)
        : specificKeywords.some((keyword) => productMatchesKeyword(product, keyword));
      const dietaryHit =
        dietaryKeywords.length === 0 ||
        dietaryKeywords.every((keyword) => productMatchesKeyword(product, keyword));
      const otherBrowseHit =
        otherBrowseKeywords.length === 0 ||
        otherBrowseKeywords.some((keyword) => productMatchesKeyword(product, keyword));
      const browseHit = dietaryHit && otherBrowseHit;

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
    });

  if (dietaryKeywords.length > 0 && otherBrowseKeywords.length > 0) {
    candidates = tightenBy(
      candidates,
      (product) =>
        dietaryKeywords.every((keyword) => productMatchesKeyword(product, keyword)) &&
        otherBrowseKeywords.some((keyword) => productMatchesKeyword(product, keyword))
    );
  }

  if (context.dietaryPreferences.proteinRich) {
    candidates = tightenBy(candidates, (product) => Boolean(product.dietary?.isProteinRich));
  }
  if (context.dietaryPreferences.vegan) {
    candidates = tightenBy(candidates, (product) => Boolean(product.dietary?.isVegan));
  }
  if (context.dietaryPreferences.glutenFree) {
    candidates = tightenBy(candidates, (product) => Boolean(product.dietary?.isGlutenFree));
  }
  if (context.dietaryPreferences.organic) {
    candidates = tightenBy(candidates, (product) => Boolean(product.dietary?.isOrganic));
  }

  if ((typeGate || requiredNoun) && materials.length > 0) {
    candidates = tightenBy(candidates, (product) =>
      materials.some((material) => productMatchesKeyword(product, material))
    );
  }

  const scoredProducts: ScoredProduct[] = candidates
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
      if (context.budget.min && product.price >= context.budget.min) {
        matchReasons.push(`From ₹${context.budget.min}`);
      }
      if (context.gender === 'women' && product.audience === 'women') {
        matchReasons.push('For women');
      }
      if (context.gender === 'men' && product.audience === 'men') {
        matchReasons.push('For men');
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
