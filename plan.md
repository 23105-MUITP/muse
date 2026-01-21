Plan Summary

  Tech Stack

  - Next.js 14+ (App Router)
  - Gemini Models (gemini-1.5-flash for extraction, gemini-1.5-pro for responses)
  - Vercel AI SDK (useChat hook, streaming)
  - shadcn/ui + Tailwind CSS
  - Mock JSON data with placeholder images

  Core Features

  1. Conversational Chat UI - Streaming responses with useChat hook
  2. AI Context Extraction - Parse natural language into structured preferences
  3. Smart Product Matching - Scoring algorithm with confidence percentages
  4. Personalized Explanations - "Why it's perfect for you" reasoning
  5. Indian Market Focus - INR pricing, local preferences

  AI Pipeline

  User Query → Context Extraction (Gemini Flash)
             → Product Matching (Algorithm)
             → Response Generation (Gemini Pro, Streaming)

  Key Use Cases Covered

  - "Vegan snacks under ₹300" → 95% match
  - "Light ethnic wear for summer" → 92% match
  - "Protein-rich breakfast options" → 88% match
  - "Trendy casual wear under ₹1000" → 85% match

  The plan includes detailed data models, file structure, component designs, and prompt engineering strategies. Ready to implement when you approve!

────────────────────────────────────────────────────────────────────────────────────────────
 Ready to code?

 Here is Claude's plan:
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 E-Commerce Recommendation Bot - PRD & Implementation Plan

 1. Product Overview

 Problem Statement

 Indian D2C (Direct-to-Consumer) food and fashion brands struggle to provide personalized
 shopping experiences. Customers often face decision fatigue when browsing large catalogs
 without guidance tailored to their specific needs, preferences, and budget constraints.

 Solution

 An AI-powered conversational shopping assistant that:
 - Understands natural language queries in Indian context
 - Extracts user preferences (dietary needs, style, budget)
 - Provides hyper-personalized product recommendations with confidence scores
 - Explains WHY each product is recommended
 - Adapts to Indian market (INR pricing, cultural preferences)

 Target Users

 - Indian consumers shopping for D2C food and fashion products
 - Health-conscious shoppers with dietary restrictions
 - Budget-conscious buyers looking for value

 ---
 2. Use Cases

 UC1: Dietary-Based Food Search

 Actor: Health-conscious user
 Query: "I need vegan snacks under ₹300"
 System Response:
 - Extracts: category=food, dietary=vegan, budget.max=300
 - Returns: Plant-Based Protein Cookies (₹299, 95% match)
 - Explains: "Perfect vegan option within budget with high protein content"

 UC2: Occasion-Based Fashion Search

 Actor: Fashion shopper
 Query: "Light ethnic wear for summer"
 System Response:
 - Extracts: category=fashion, style=ethnic, season=summer, fabric=light
 - Returns: Handblock Print Kurta (₹1499, 92% match)
 - Explains: "100% cotton keeps you cool while maintaining traditional elegance"

 UC3: Budget-Constrained Casual Wear

 Actor: Trend-conscious buyer
 Query: "Trendy casual wear under ₹1000"
 System Response:
 - Extracts: category=fashion, style=casual, budget.max=1000
 - Returns: Oversized Cotton Tee (₹799, 85% match)
 - Explains: "On-trend oversized fit in premium cotton, perfect for casual outings"

 UC4: Nutritional Requirement Search

 Actor: Fitness enthusiast
 Query: "Protein-rich breakfast options"
 System Response:
 - Extracts: category=food, subcategory=breakfast, dietary.proteinRich=true
 - Returns: Oats & Chia Seed Bars (₹349, 88% match)
 - Explains: "15g plant protein per serving, ideal for active lifestyles"

 UC5: Follow-up Refinement

 Actor: Any user
 Query: (after receiving recommendations) "Show me something cheaper"
 System Response:
 - Uses conversation context to understand previous search
 - Adjusts budget constraint downward
 - Returns lower-priced alternatives in same category

 ---
 3. User Flows

 Primary Flow: Chat-Based Recommendation

 ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
 │   User      │     │   Chat      │     │    AI       │     │  Product    │
 │   Lands     │────▶│   Opens     │────▶│  Processes  │────▶│  Cards      │
 │   on App    │     │   Welcome   │     │   Query     │     │  Displayed  │
 └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                                        │
                           │         ┌─────────────┐               │
                           │         │   User      │               │
                           └────────▶│   Refines   │◀──────────────┘
                                     │   Search    │
                                     └─────────────┘

 Detailed User Journey

 1. Landing → User sees chat interface with welcome message and sample queries
 2. Query Input → User types natural language query
 3. Processing → Typing indicator shows while AI processes
 4. Results → Streaming response with product cards (name, price, match %, explanation)
 5. Interaction → User can:
   - Ask follow-up questions
   - Refine criteria
   - Start new search
 6. Persistence → Preferences saved in localStorage for return visits

 ---
 4. Technical Architecture

 Stack

 | Layer     | Technology                                     |
 |-----------|------------------------------------------------|
 | Framework | Next.js 14+ (App Router)                       |
 | AI/LLM    | Google Gemini via @ai-sdk/google               |
 | Chat SDK  | Vercel AI SDK (ai, @ai-sdk/react)              |
 | Styling   | Tailwind CSS + shadcn/ui                       |
 | Data      | Mock JSON (no database)                        |
 | State     | localStorage (preferences), React state (chat) |

 System Architecture

 ┌──────────────────────────────────────────────────────────────┐
 │                    FRONTEND (Next.js)                        │
 │  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐  │
 │  │ ChatContainer  │  │ ProductCard    │  │ Preferences   │  │
 │  │ (useChat)      │  │ Components     │  │ (localStorage)│  │
 │  └───────┬────────┘  └────────────────┘  └───────────────┘  │
 └──────────┼───────────────────────────────────────────────────┘
            │ Streaming
            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                    API LAYER (/api/chat)                     │
 │  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐  │
 │  │ 1. Context     │  │ 2. Product     │  │ 3. Response   │  │
 │  │ Extraction     │─▶│ Matching       │─▶│ Generation    │  │
 │  │ (Gemini Flash) │  │ (Algorithm)    │  │ (Gemini Pro)  │  │
 │  └────────────────┘  └────────────────┘  └───────────────┘  │
 └──────────────────────────────────────────────────────────────┘
            │
            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                    DATA LAYER                                │
 │  ┌────────────────────────────────────────────────────────┐ │
 │  │                   products.json                         │ │
 │  │  (15-20 Indian D2C food & fashion products)            │ │
 │  └────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────┘

 ---
 5. AI Pipeline

 Stage 1: Context Extraction

 - Model: gemini-1.5-flash (fast, structured output)
 - Method: generateObject with Zod schema
 - Extracts:
   - Intent (search/recommendation/comparison)
   - Category (food/fashion)
   - Budget constraints (min/max in INR)
   - Dietary preferences (vegan, gluten-free, protein-rich, etc.)
   - Style preferences (ethnic, casual, formal, occasion)
   - Keywords for fallback matching

 Stage 2: Product Matching & Scoring

 - Method: Programmatic algorithm (no AI call)
 - Scoring Breakdown (100 points):
   - Category match: 25 pts
   - Budget match: 25 pts
   - Preference match: 30 pts
   - Keyword match: 20 pts
 - Threshold: Products scoring < 40% are filtered out

 Stage 3: Response Generation

 - Model: gemini-1.5-pro (quality responses)
 - Method: streamText for real-time streaming
 - Generates:
   - Conversational acknowledgment
   - Product presentations with match %
   - Personalized "Why it's perfect" explanations
   - Optional follow-up suggestions

 ---
 6. Data Models

 Product Schema

 interface Product {
   id: string;
   name: string;
   description: string;
   category: "food" | "fashion";
   subcategory: string;
   price: number; // INR
   imageUrl: string;
   brand: string;
   dietary?: { isVegan, isVegetarian, isGlutenFree, isProteinRich, ... };
   style?: { type, occasion[], fabric, fit };
   tags: string[];
   rating: number;
   inStock: boolean;
 }

 Extracted Context Schema

 interface ExtractedContext {
   intent: "search" | "recommendation" | "comparison";
   category: "food" | "fashion" | "both";
   budget: { min?: number; max?: number; hasConstraint: boolean };
   dietaryPreferences: { vegan, vegetarian, glutenFree, proteinRich, ... };
   stylePreferences: { type?, occasion?, fabric?, fit? };
   keywords: string[];
 }

 ---
 7. File Structure

 /app
   page.tsx                      # Main chat page
   layout.tsx                    # Root layout
   globals.css                   # Global styles
   /api/chat
     route.ts                    # Main chat API endpoint

 /components
   /chat
     ChatContainer.tsx           # Main chat with useChat hook
     ChatMessage.tsx             # Message bubble component
     ChatInput.tsx               # Input with send button
     WelcomeMessage.tsx          # Initial greeting + sample queries
   /product
     ProductCard.tsx             # Recommendation card
     ConfidenceBadge.tsx         # Match % badge
     ProductGrid.tsx             # Grid layout for cards
   /ui
     (shadcn components)         # button, card, input, badge, etc.

 /lib
   /ai
     extract-context.ts          # Gemini context extraction
     generate-response.ts        # Gemini response streaming
   /recommendation
     matcher.ts                  # Product matching algorithm
     scorer.ts                   # Confidence score calculation
   /types
     index.ts                    # All TypeScript interfaces
   /utils
     format-price.ts             # INR formatting (₹)

 /data
   products.json                 # Mock product database (15-20 items)

 /hooks
   usePreferences.ts             # localStorage preference hook

 ---
 8. Implementation Phases

 Phase 1: Project Setup

 - Initialize Next.js with TypeScript
 - Install: ai, @ai-sdk/google, @ai-sdk/react, zod
 - Setup shadcn/ui with Tailwind
 - Configure environment variables

 Phase 2: Data & Types

 - Create TypeScript interfaces
 - Build products.json with 15-20 products
 - Implement utility functions

 Phase 3: AI Pipeline

 - Implement context extraction (generateObject)
 - Build matching algorithm with scoring
 - Create response generation (streamText)

 Phase 4: API Route

 - Build /api/chat route handler
 - Integrate all pipeline stages
 - Handle edge cases

 Phase 5: UI Components

 - ChatContainer with useChat hook
 - ProductCard with confidence badge
 - ChatInput with loading states
 - Responsive styling

 Phase 6: Polish

 - Welcome message with sample queries
 - Error handling
 - Mobile responsiveness
 - Demo preparation

 ---
 9. Key Dependencies

 {
   "dependencies": {
     "next": "^14.x",
     "react": "^18.x",
     "ai": "^4.x",
     "@ai-sdk/google": "^1.x",
     "@ai-sdk/react": "^1.x",
     "zod": "^3.x",
     "tailwindcss": "^3.x",
     "class-variance-authority": "^0.x",
     "clsx": "^2.x",
     "tailwind-merge": "^2.x",
     "lucide-react": "^0.x"
   }
 }

 ---
 10. Environment Setup

 # .env.local
 GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here

 ---
 11. Demo Scenarios

 | Query                            | Expected Result                   |
 |----------------------------------|-----------------------------------|
 | "Vegan snacks under ₹300"        | Plant-Based Protein Cookies (95%) |
 | "Light ethnic wear for summer"   | Handblock Print Kurta (92%)       |
 | "Protein-rich breakfast options" | Oats & Chia Seed Bars (88%)       |
 | "Trendy casual wear under ₹1000" | Oversized Cotton Tee (85%)        |
 | "Gluten-free healthy snacks"     | Quinoa Energy Bites (90%)         |

 ---
 12. Critical Files to Create

 1. /app/api/chat/route.ts - Core API orchestrating the AI pipeline
 2. /lib/ai/extract-context.ts - Gemini context extraction with Zod
 3. /lib/recommendation/matcher.ts - Product matching + scoring
 4. /components/chat/ChatContainer.tsx - Main UI with useChat
 5. /data/products.json - Mock Indian D2C product catalog