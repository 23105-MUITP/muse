import { streamText } from 'ai';
import type { ExtractedContext, ScoredProduct, Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { AI_PRESETS } from './config';
import { CATALOG_SCOPE } from './grounding';

export async function generateRecommendationResponse(
  context: ExtractedContext,
  products: ScoredProduct[],
  isRefinement: boolean = false
) {
  const productList = products
    .map(
      (p, i) =>
        `${i + 1}. **${p.name}** by ${p.brand}
   - Price: ${formatPrice(p.price)}
   - Match Score: ${p.matchScore}%
   - Why it's perfect: ${p.matchReasons.join(', ') || 'Great quality product'}
   - Description: ${p.description}`
    )
    .join('\n\n');

  const systemPrompt = `You are Lumin, a warm shopping assistant for Indian food and fashion.

${CATALOG_SCOPE}

Response guidelines:
1. ${isRefinement ? 'Acknowledge that you understood their refinement' : 'Start with a brief, friendly acknowledgment of what they\'re looking for'}
2. Present ONLY the products listed below. Do not invent items, playlists, venues, or off-catalog recommendations.
3. Mention the match percentage and key reasons for each product
4. Use INR (₹) for all prices
5. End with a helpful suggestion or question
6. Keep responses concise (2-3 short paragraphs max)
${isRefinement ? '7. Reference that this is an updated/refined search' : ''}
If the shopper said "kirtan", they mean a kurta. If they said wedding/shaadi, talk about festive ethnic wear from the list, never venues or lehengas we do not sell.

DO NOT include any JSON, code, or markdown tables. Just write natural conversational text.`;

  const userPrompt = `User's query: "${context.originalQuery}"
${isRefinement ? '\nNote: This is a FOLLOW-UP/REFINEMENT of their previous search. They are narrowing down their options.\n' : ''}
Extracted preferences:
- Category: ${context.category}
- Budget: ${context.budget.hasConstraint ? `Up to ${formatPrice(context.budget.max || 0)}` : 'No specific budget'}
- Style: ${context.stylePreferences.type || 'Not specified'}
- Key interests: ${context.keywords.join(', ') || 'General browsing'}

Here are the best matching products to recommend:

${productList}

Write a friendly, conversational response presenting these products to the user.${isRefinement ? ' Acknowledge that you\'ve adjusted the results based on their new criteria.' : ''}`;

  return streamText({
    model: AI_PRESETS.chat.model,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: AI_PRESETS.chat.temperature,
  });
}

export async function generateGreetingResponse() {
  const systemPrompt = `You are Lumin, a friendly shopping assistant.

${CATALOG_SCOPE}

Respond to greetings warmly and briefly. Suggest 2-3 example queries from the catalog (kurtas, festive wear, vegan snacks).`;

  return streamText({
    model: AI_PRESETS.chat.model,
    system: systemPrompt,
    prompt: 'The user has just greeted me. Respond warmly and help them get started.',
    temperature: AI_PRESETS.chat.temperature,
  });
}

export async function generateNoResultsResponse(context: ExtractedContext) {
  const systemPrompt = `You are Lumin. There are no matching products to show.

${CATALOG_SCOPE}

Be calm and brief:
1. Acknowledge what they asked for
2. Say we do not have that in this catalog
3. Offer two real searches we can do instead
Never invent inventory, prices, brands, or markdown tables.`;

  return streamText({
    model: AI_PRESETS.chat.model,
    system: systemPrompt,
    prompt: `User searched for: "${context.originalQuery}"
Category: ${context.category}
Keywords: ${context.keywords.join(', ')}

There are zero matching products. Do not name fake items.`,
    temperature: 0.2,
  });
}

export async function generateOtherResponse(query: string) {
  const systemPrompt = `You are Lumin, a shopping assistant.

${CATALOG_SCOPE}

If this is off-topic, answer in one sentence and steer back to food or fashion we actually sell.
Keep responses brief.`;

  return streamText({
    model: AI_PRESETS.chat.model,
    system: systemPrompt,
    prompt: query,
    temperature: AI_PRESETS.chat.temperature,
  });
}

// Cart response generator
export async function generateCartResponse(
  action: 'view' | 'add' | 'remove' | 'clear',
  product?: Product,
  cartSummary?: string
) {
  const systemPrompt = `You are ShopSmart AI, a friendly shopping assistant. Respond to cart actions naturally and helpfully.

For 'add': Confirm the item was added, mention the product name and price, and ask if they need anything else.
For 'view': Present the cart summary in a friendly way, mention the total if items exist.
For 'remove': Confirm removal and suggest they might want to look at alternatives.
For 'clear': Confirm cart was cleared and invite them to continue shopping.

Keep responses brief (1-2 sentences) and conversational.`;

  const prompts: Record<string, string> = {
    view: `User wants to view their cart. Cart contents:\n${cartSummary || 'Your cart is empty.'}`,
    add: `User added "${product?.name}" to their cart. Price: ${product ? formatPrice(product.price) : 'N/A'}`,
    remove: `User removed an item from their cart.`,
    clear: `User cleared their entire cart.`,
  };

  return streamText({
    model: AI_PRESETS.chat.model,
    system: systemPrompt,
    prompt: prompts[action],
    temperature: AI_PRESETS.chat.temperature,
  });
}

// Comparison response generator
export async function generateComparisonResponse(products: ScoredProduct[]) {
  const productDetails = products
    .map(
      (p) =>
        `- **${p.name}** by ${p.brand}
  Price: ${formatPrice(p.price)}
  Match Score: ${p.matchScore}%
  Rating: ${p.rating}/5
  Key Features: ${p.matchReasons.join(', ')}`
    )
    .join('\n\n');

  const systemPrompt = `You are ShopSmart AI. Generate a helpful comparison analysis of the products.

Guidelines:
1. Highlight key differences between the products
2. Consider value for money, features, and quality
3. Make a recommendation based on the match scores and features
4. Be conversational but informative
5. Keep the comparison concise (2-3 short paragraphs)`;

  return streamText({
    model: AI_PRESETS.analysis.model,
    system: systemPrompt,
    prompt: `Compare these ${products.length} products for the user:\n\n${productDetails}`,
    temperature: AI_PRESETS.analysis.temperature,
  });
}

export async function generateCheckoutResponse() {
  const systemPrompt = `You are Lumin, a warm shopping assistant. The checkout panel is opening so the user can pay with mock UPI, card, or cash on delivery.

Keep it to 1-2 sentences. Mention they can complete payment in the checkout panel. Do not invent order IDs.`;

  return streamText({
    model: AI_PRESETS.chat.model,
    system: systemPrompt,
    prompt: 'The user wants to checkout and pay.',
    temperature: AI_PRESETS.chat.temperature,
  });
}

export async function generateOrdersResponse() {
  const systemPrompt = `You are Lumin. The orders panel is opening. In one short sentence, tell the user they can review past mock orders there.`;

  return streamText({
    model: AI_PRESETS.chat.model,
    system: systemPrompt,
    prompt: 'The user wants to see their orders.',
    temperature: AI_PRESETS.chat.temperature,
  });
}
