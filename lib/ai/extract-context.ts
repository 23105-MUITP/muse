import { generateObject } from 'ai';
import { z } from 'zod';
import type { ExtractedContext } from '@/lib/types';
import { AI_PRESETS } from './config';
import { applyQueryConstraints } from '@/lib/recommendation/query-constraints';

const contextSchema = z.object({
  intent: z.enum([
    'search',
    'recommendation',
    'comparison',
    'greeting',
    'refinement',
    'other',
    'add_to_cart',
    'view_cart',
    'remove_from_cart',
    'checkout',
    'view_orders',
  ]).describe('Detect user intent including cart, checkout, and order history'),
  category: z.enum(['food', 'fashion', 'both', 'unchanged']).describe('Use "unchanged" if user is refining previous search without mentioning category'),
  budget: z.object({
    min: z.number().nullish(),
    max: z.number().nullish(),
    hasConstraint: z.boolean(),
    unchanged: z.boolean().describe('True if user did not mention budget in this message'),
  }),
  dietaryPreferences: z.object({
    vegan: z.boolean(),
    vegetarian: z.boolean(),
    glutenFree: z.boolean(),
    proteinRich: z.boolean(),
    organic: z.boolean(),
    lowCalorie: z.boolean(),
    unchanged: z.boolean().describe('True if user did not mention dietary preferences in this message'),
  }),
  stylePreferences: z.object({
    type: z.enum(['ethnic', 'casual', 'formal', 'sportswear', 'streetwear']).optional().or(z.literal('')),
    occasion: z.string().optional(),
    fabric: z.string().optional(),
    fit: z.enum(['regular', 'slim', 'oversized', 'relaxed']).optional().or(z.literal('')),
    season: z.enum(['summer', 'winter', 'all-season', 'monsoon']).optional().or(z.literal('')),
    unchanged: z.boolean().describe('True if user did not mention style preferences in this message'),
  }),
  keywords: z.array(z.string()),
  gender: z.enum(['men', 'women', 'any', 'unchanged']).describe('Shopper gender for fashion. "women\'s kurta" is women. Use unchanged if they did not mention it.'),
  isFollowUp: z.boolean().describe('True if this is a follow-up/refinement of a previous search'),
  cartAction: z.object({
    type: z.enum(['add', 'remove', 'view', 'clear']).optional(),
    productName: z.string().optional().describe('Name or description of product for cart action'),
    productId: z.string().optional(),
  }).optional().describe('Cart action details when intent is cart-related'),
  comparisonProducts: z.array(z.string()).optional().describe('Product names/descriptions to compare when intent is comparison'),
});

// Store the last context for maintaining conversation state
let lastContext: ExtractedContext | null = null;

function asStyleType(
  value: string | undefined
): ExtractedContext['stylePreferences']['type'] {
  if (value === 'ethnic' || value === 'casual' || value === 'formal' || value === 'sportswear' || value === 'streetwear') {
    return value;
  }
  return undefined;
}

function asFit(
  value: string | undefined
): ExtractedContext['stylePreferences']['fit'] {
  if (value === 'regular' || value === 'slim' || value === 'oversized' || value === 'relaxed') {
    return value;
  }
  return undefined;
}

function asSeason(
  value: string | undefined
): ExtractedContext['stylePreferences']['season'] {
  if (value === 'summer' || value === 'winter' || value === 'all-season' || value === 'monsoon') {
    return value;
  }
  return undefined;
}

export async function extractContext(
  query: string,
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<ExtractedContext> {
  // A fresh thread must not inherit another shopper's last search.
  if (!conversationHistory || conversationHistory.length === 0) {
    lastContext = null;
  }

  // Build conversation context summary
  const recentMessages = conversationHistory?.slice(-6) || [];
  const historyContext = recentMessages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.substring(0, 200)}`)
    .join('\n');

  const systemPrompt = `You are a context extraction AI for an Indian e-commerce platform selling food and fashion products.

CRITICAL: This is a CONVERSATIONAL shopping assistant. Users often make follow-up requests that REFINE their previous search rather than starting a new one.

Examples of follow-up refinements:
- After "show me ethnic wear" → "something cheaper" = ethnic wear with lower budget
- After "vegan snacks under 300" → "show me more options" = same search, more results
- After "casual tees" → "in blue" = casual tees in blue color
- After "kurtas for summer" → "under 1000" = summer kurtas under ₹1000

${historyContext ? `\n=== CONVERSATION HISTORY ===\n${historyContext}\n=== END HISTORY ===\n` : ''}

${lastContext ? `\n=== PREVIOUS SEARCH CONTEXT ===
Category: ${lastContext.category}
Budget: ${lastContext.budget.hasConstraint ? `₹${lastContext.budget.min || 0} - ₹${lastContext.budget.max || 'no limit'}` : 'No constraint'}
Style: ${lastContext.stylePreferences.type || 'Not specified'}
Dietary: ${Object.entries(lastContext.dietaryPreferences).filter(([k, v]) => v === true && k !== 'unchanged').map(([k]) => k).join(', ') || 'None'}
Keywords: ${lastContext.keywords.join(', ')}
=== END PREVIOUS CONTEXT ===` : ''}

Analyze the CURRENT user query: "${query}"

Instructions:
1. Determine if this is a NEW search or a REFINEMENT of the previous search
2. If it's a refinement (isFollowUp=true):
   - Set "unchanged" to true for fields the user did NOT mention
   - Only extract values for fields the user DID mention
   - Example: "under 1000" only changes budget, everything else is "unchanged"
3. If it's a new search (isFollowUp=false):
   - Extract all relevant fields fresh
   - Set "unchanged" to false for all fields
4. Intent "refinement" = user is adjusting previous search
5. Budget is in INR (₹). Common patterns:
   - "under X", "below X", "less than X", "within X" → max = X
   - "above X", "over X", "starting at X", "from X", "X+" → min = X, NOT max
   Never treat "above 1000" as a maximum of 1000.

GENDER AND WHO THE CLOTHES ARE FOR:
- "women's", "woman", "ladies", "for her" → gender women
- "men's", "man", "gents", "for him" → gender men
- In this catalog kurtis, palazzos, and stoles are women's; kurtas, shirts, and chinos are typically men's; tees/jackets/joggers are unisex
- "women's kurta" or "woman kurta" means the women's kurti, never a men's kurta

DIETARY AND MEAL QUERIES:
- "protein-rich", "protein rich", "high protein" → proteinRich true, category food
- "breakfast" is a real meal we sell (bars, granola). Never say the catalog has no breakfast items if those exist.
- Keep breakfast and protein in keywords

PRODUCT TYPE ALWAYS WINS OVER COLOR, FABRIC, FIT, AND BRAND.
Whatever they asked for — shirt, kurta, tee, palazzo, chinos, jacket, stole, cookies, tea, makhana, granola — keep that product type in keywords.
A cotton shirt is a shirt. A cotton kurta is a kurta. Do not replace the type with a material or color.

Be generous with detecting follow-ups. Phrases like "show me cheaper", "something else", "more options", "different color", "lower price" are ALL follow-ups.

OCCASION QUERIES ARE PRODUCT SEARCHES, never "other":
- wedding, shaadi, shadi, bridal, marriage, festive, function, diwali → category fashion, style ethnic, occasion wedding/festive
- office, work, meeting → fashion, often formal or ethnic office wear
- gym, workout, running → fashion sportswear
- party, date night → fashion
- winter/summer/monsoon → set season and search fashion (and food if they asked for food)
Hinglish: "shaadi ke liye", "sasta kurta", "kuch vegan snacks" are shopping searches.

VOICE / HOMOPHONE CORRECTIONS:
- In this shop, "kirtan", "kirten", "khurta", or "curtain" almost always means "kurta"
- "stool" in a fashion query means "stole"
- Set keywords to include "kurta" (and "kurti" if relevant), category fashion
- Never treat kirtan as music, playlists, or an unknown product that should browse the whole catalog

CART ACTION DETECTION:
- "add to cart", "buy this", "I'll take it", "add the first one" → intent: add_to_cart
- "show my cart", "what's in my bag", "view cart" → intent: view_cart
- "remove from cart", "take out", "delete from cart" → intent: remove_from_cart
- For cart actions, extract the product name if mentioned (e.g., "add the kurta to cart" → productName: "kurta")

CHECKOUT AND ORDERS:
- "checkout", "pay", "place order", "buy now", "complete purchase" → intent: checkout
- "my orders", "order history", "track order" → intent: view_orders

COMPARISON DETECTION:
- "compare these", "which is better", "compare the first two" → intent: comparison
- Extract product names/references for comparison`;

  try {
    const { object } = await generateObject({
      model: AI_PRESETS.extraction.model,
      schema: contextSchema,
      system: systemPrompt,
      prompt: query,
      temperature: AI_PRESETS.extraction.temperature,
    });

    // Merge with previous context if this is a follow-up
    let finalContext: ExtractedContext;

    if (object.isFollowUp && lastContext) {
      finalContext = {
        intent: object.intent === 'refinement' ? 'search' : object.intent,
        category: object.category === 'unchanged' ? lastContext.category : (object.category as 'food' | 'fashion' | 'both' | 'unknown'),
        budget: object.budget.unchanged
          ? lastContext.budget
          : {
              min: object.budget.min ?? undefined,
              max: object.budget.max ?? undefined,
              hasConstraint: object.budget.hasConstraint
            },
        dietaryPreferences: object.dietaryPreferences.unchanged
          ? lastContext.dietaryPreferences
          : {
              vegan: object.dietaryPreferences.vegan,
              vegetarian: object.dietaryPreferences.vegetarian,
              glutenFree: object.dietaryPreferences.glutenFree,
              proteinRich: object.dietaryPreferences.proteinRich,
              organic: object.dietaryPreferences.organic,
              lowCalorie: object.dietaryPreferences.lowCalorie,
            },
        stylePreferences: object.stylePreferences.unchanged
          ? lastContext.stylePreferences
          : {
              type: asStyleType(object.stylePreferences.type),
              occasion: object.stylePreferences.occasion || undefined,
              fabric: object.stylePreferences.fabric || undefined,
              fit: asFit(object.stylePreferences.fit),
              season: asSeason(object.stylePreferences.season),
            },
        keywords: object.keywords.length > 0
          ? Array.from(new Set([...lastContext.keywords, ...object.keywords]))
          : lastContext.keywords,
        gender:
          object.gender === 'unchanged' || object.gender === 'any'
            ? lastContext.gender
            : object.gender,
        originalQuery: query,
        cartAction: object.cartAction,
        comparisonProducts: object.comparisonProducts,
      };
    } else {
      finalContext = {
        intent: object.intent === 'refinement' ? 'search' : object.intent,
        category: object.category === 'unchanged' ? 'unknown' : (object.category as 'food' | 'fashion' | 'both' | 'unknown'),
        budget: {
          min: object.budget.min ?? undefined,
          max: object.budget.max ?? undefined,
          hasConstraint: object.budget.hasConstraint
        },
        dietaryPreferences: {
          vegan: object.dietaryPreferences.vegan,
          vegetarian: object.dietaryPreferences.vegetarian,
          glutenFree: object.dietaryPreferences.glutenFree,
          proteinRich: object.dietaryPreferences.proteinRich,
          organic: object.dietaryPreferences.organic,
          lowCalorie: object.dietaryPreferences.lowCalorie,
        },
        stylePreferences: {
          type: asStyleType(object.stylePreferences.type),
          occasion: object.stylePreferences.occasion || undefined,
          fabric: object.stylePreferences.fabric || undefined,
          fit: asFit(object.stylePreferences.fit),
          season: asSeason(object.stylePreferences.season),
        },
        keywords: object.keywords,
        gender: object.gender === 'men' || object.gender === 'women' ? object.gender : undefined,
        originalQuery: query,
        cartAction: object.cartAction,
        comparisonProducts: object.comparisonProducts,
      };
    }

    finalContext = applyQueryConstraints(finalContext);

    // Save context for next turn
    if (
      finalContext.intent !== 'greeting' &&
      finalContext.intent !== 'other' &&
      finalContext.intent !== 'checkout' &&
      finalContext.intent !== 'view_orders' &&
      finalContext.intent !== 'view_cart' &&
      finalContext.intent !== 'add_to_cart' &&
      finalContext.intent !== 'remove_from_cart'
    ) {
      lastContext = finalContext;
    }

    return finalContext;
  } catch (error) {
    console.error('Context extraction error:', error);
    // Return a default context on error, preserving last context if available
    const fallback: ExtractedContext = lastContext || {
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
      keywords: query.toLowerCase().split(' ').filter((w) => w.length > 2),
      originalQuery: query,
    };
    return applyQueryConstraints({ ...fallback, originalQuery: query });
  }
}

// Reset context (can be called when conversation is cleared)
export function resetContext() {
  lastContext = null;
}
