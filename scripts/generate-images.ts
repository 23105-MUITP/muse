import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Product interface matching our data structure
interface Product {
  id: string;
  name: string;
  description: string;
  category: 'food' | 'fashion';
  subcategory: string;
  brand: string;
  tags: string[];
  dietary?: {
    isVegan: boolean;
    isVegetarian: boolean;
    isGlutenFree: boolean;
    isProteinRich: boolean;
    isOrganic: boolean;
    isLowCalorie: boolean;
  };
  style?: {
    type: string;
    occasion: string[];
    fabric: string;
    fit: string;
    season: string;
  };
}

// Initialize Google GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

// Build a detailed prompt for product image generation
function buildImagePrompt(product: Product): string {
  if (product.category === 'food') {
    const dietaryInfo = product.dietary
      ? Object.entries(product.dietary)
          .filter(([, v]) => v === true)
          .map(([k]) => k.replace('is', '').toLowerCase())
          .join(', ')
      : '';

    return `Professional e-commerce product photography of ${product.name}.

Product details:
- Description: ${product.description}
- Brand: ${product.brand}
- Category: ${product.subcategory}
${dietaryInfo ? `- Dietary: ${dietaryInfo}` : ''}

Style requirements:
- Clean white or light gradient background
- Soft, professional studio lighting
- Appetizing food presentation showing the product packaging and/or the food itself
- High-resolution, e-commerce quality
- Square format (1:1 aspect ratio)
- Modern, premium aesthetic suitable for an Indian D2C brand
- Product should be the clear focus, centered in frame`;
  } else {
    // Fashion product
    const styleInfo = product.style;
    return `Professional e-commerce fashion photography of ${product.name}.

Product details:
- Description: ${product.description}
- Brand: ${product.brand}
- Category: ${product.subcategory}
${styleInfo ? `- Style: ${styleInfo.type}, ${styleInfo.fit} fit` : ''}
${styleInfo?.fabric ? `- Fabric: ${styleInfo.fabric}` : ''}
${styleInfo?.occasion ? `- Occasion: ${styleInfo.occasion.join(', ')}` : ''}

Style requirements:
- Clean white or neutral background
- Soft, professional studio lighting
- Clothing displayed on invisible mannequin or laid flat in an attractive arrangement
- Show fabric texture and details clearly
- High-resolution, e-commerce quality
- Square format (1:1 aspect ratio)
- Modern, premium aesthetic suitable for an Indian fashion brand
- Product should be the clear focus, centered in frame`;
  }
}

// Generate image for a single product
async function generateProductImage(product: Product, outputDir: string): Promise<string | null> {
  const prompt = buildImagePrompt(product);

  try {
    console.log(`  Generating image for: ${product.name}...`);

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: prompt,
      config: {
        responseModalities: ['IMAGE'],
        imageConfig: {
          aspectRatio: '1:1',
        },
      },
    });

    // Extract and save image from response
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      console.error(`  No candidates in response for ${product.id}`);
      return null;
    }

    const parts = candidates[0].content?.parts;
    if (!parts) {
      console.error(`  No parts in response for ${product.id}`);
      return null;
    }

    for (const part of parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        if (!imageData) continue;

        const buffer = Buffer.from(imageData, 'base64');
        const imagePath = path.join(outputDir, `${product.id}.png`);
        fs.writeFileSync(imagePath, buffer);

        console.log(`  Saved: ${imagePath}`);
        return `/images/products/${product.id}.png`;
      }
    }

    console.error(`  No image data found in response for ${product.id}`);
    return null;
  } catch (error) {
    console.error(`  Error generating image for ${product.id}:`, error);
    return null;
  }
}

// Add delay between API calls to avoid rate limiting
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function
async function main() {
  console.log('Starting product image generation...\n');

  // Read products data
  const productsPath = path.join(process.cwd(), 'data', 'products.json');
  const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  const products: Product[] = productsData.products;

  console.log(`Found ${products.length} products to process.\n`);

  // Ensure output directory exists
  const outputDir = path.join(process.cwd(), 'public', 'images', 'products');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Process each product
  const updatedProducts = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`[${i + 1}/${products.length}] Processing ${product.name}`);

    // Check if image already exists
    const existingImagePath = path.join(outputDir, `${product.id}.png`);
    if (fs.existsSync(existingImagePath)) {
      console.log(`  Skipping - image already exists`);
      updatedProducts.push({
        ...product,
        imageUrl: `/images/products/${product.id}.png`,
      });
      successCount++;
      continue;
    }

    const localPath = await generateProductImage(product, outputDir);

    if (localPath) {
      updatedProducts.push({
        ...product,
        imageUrl: localPath,
      });
      successCount++;
    } else {
      // Keep original URL if generation fails
      updatedProducts.push(product);
      failCount++;
    }

    // Add delay between requests to avoid rate limiting (3 seconds)
    if (i < products.length - 1) {
      console.log('  Waiting before next request...\n');
      await delay(3000);
    }
  }

  // Update products.json with new image paths
  const updatedData = { products: updatedProducts };
  fs.writeFileSync(productsPath, JSON.stringify(updatedData, null, 2));

  console.log('\n========================================');
  console.log('Image generation complete!');
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`  Products.json updated with local image paths.`);
  console.log('========================================\n');
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
