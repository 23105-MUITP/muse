# Muse — Pitch Deck Content (10 slides)

**Share this file with your teammate.** Copy each slide into PowerPoint / Google Slides. Keep slides visual; speak the notes, do not read bullets.

| | |
|---|---|
| **Product** | Muse — personal commerce AI |
| **Tagline** | Shop by saying what you want, not by scrolling. |
| **Capstone** | Personalized E-Commerce Recommender Bot |
| **Live demo** | https://new-age-technologies-chi.vercel.app |
| **GitHub** | *(paste repo URL)* |
| **Time** | 7 min pitch + demo · 3 min Q&A |
| **Team** | 2 members — both must speak |

**Suggested roles**

- **Speaker A — Product & Demo** (opens, problem, live demo, close)
- **Speaker B — Tech & AI** (pipeline, matching, stack, scalability)

Swap names below: `[A]` and `[B]`.

**Design notes for the deck**

- Background: warm ivory / soft lavender (match the Muse UI)
- Accent: saffron or `#8b6de2`
- Fonts: a display serif for titles, a clean sans for body
- Max 5 bullets per slide. Large type. Screenshots, not paragraphs.
- Put the live URL in the footer of every slide.

---

## Slide 1 — Title

**On slide**

```
MUSE
Personal commerce AI for Indian D2C food & fashion

Say what you want. Get products that actually fit.

Capstone · Personalized E-Commerce Recommender Bot
[Name A]  ·  [Name B]
Live: new-age-technologies-chi.vercel.app
```

**Visual:** Muse wordmark / glowing orb screenshot from the app header. No extra bullets.

**Speaker [A] (~20s)**
> “Hi, we’re [A] and [B]. Muse is a conversational shopping assistant for Indian D2C food and fashion. You talk the way you already shop — ‘vegan snacks under 300 rupees’ — and Muse returns ranked products with a clear reason why. We’ll show you the problem, the AI behind it, and a live demo.”

---

## Slide 2 — The Problem

**On slide (headline)**
> Indian shoppers know what they want. Store search does not.

**Bullets**

- Keyword search fails on intent: “light ethnic wear for summer” is not a filter checkbox
- Dietary, budget, occasion, and fabric live in different filters — if they exist at all
- D2C catalogs dump SKUs on the user; no one explains *why* this product
- Voice and Hinglish-style speech make keyword search even worse

**Visual:** Split — left: a typical e-commerce filter wall. Right: one natural sentence.

**Speaker [A] (~40s)**
> “If you open a D2C site and type ‘vegan snacks under 300’, most search bars look for the words vegan, snacks, 300 — or they miss entirely. Fashion is worse: ‘something light for a summer wedding’ is an occasion, a season, a fabric, and a budget. Shoppers in India also think in rupees, cotton kurtas, makhana, protein bars — not Western category trees. The result is decision fatigue and drop-off. That’s the problem we built for.”

---

## Slide 3 — Solution

**On slide (headline)**
> Muse turns a sentence into ranked, explained recommendations.

**Three pillars (use big numbers or icons)**

1. **Understand** — extract diet, style, budget, occasion from natural language
2. **Match** — hybrid scoring against a live Indian food + fashion catalog
3. **Explain** — match % + “why this fits you”, then refine in conversation

**One line under the pillars**
> Chat, voice, bag, compare, and checkout — a full shopping loop, not a chatbot demo.

**Visual:** One screenshot of a recommendation card (match badge + “Why Muse picked this”).

**Speaker [A] (~35s)**
> “Muse is not a keyword search with a chat skin. You describe the need. We extract structured preferences, score every product, and only show what clears a quality bar — with a confidence score and a plain-English reason. You can refine — ‘something cheaper’, ‘more protein’ — and Muse keeps the rest of your context. Voice works the same way as typing.”

---

## Slide 4 — How it works (Context Engineering)

**On slide (headline)**
> The core challenge is context, not the LLM.

**Pipeline (horizontal flow)**

```
User query
    → Extract context (structured JSON)
    → Merge follow-ups
    → Route intent
    → Score catalog
    → Generate grounded reply
    → Stream cards + actions
```

**Callouts under the flow**

- Extract: intent, category, ₹ budget, vegan / protein / gluten-free, ethnic / casual / occasion
- Follow-up: “show me cheaper” keeps vegan + snacks, only tightens budget
- Grounding: the model cannot invent products, venues, or prices

**Visual:** Simple left-to-right diagram. No architecture spaghetti.

**Speaker [B] (~55s)**
> “This is the heart of the project — context engineering. A fast model turns the sentence into a schema: search vs cart vs compare, food vs fashion, max budget in rupees, dietary flags, style, season, occasion. If it’s a follow-up, we merge with the last turn instead of starting over. Matching is *not* the LLM picking a SKU — that’s a deterministic scorer on the catalog, so results are explainable. A second model writes the reply, but it is grounded: it can only talk about products we actually returned. That is how we stop hallucinated inventory.”

---

## Slide 5 — AI logic & matching (technical depth)

**On slide (headline)**
> Hybrid filtering: AI for language, algorithm for ranking.

**Scoring (100 pts) — use a simple stacked bar or 4 tiles**

| Signal | Weight | What it does |
|---|---|---|
| Preferences | 30 | Vegan, protein, ethnic, cotton, summer, wedding… |
| Category | 25 | Food vs fashion — no snacks when you asked for kurtas |
| Budget | 25 | Hard filter over budget; rupees and spoken “five hundred” |
| Keywords / type | 20 | Cookies mean cookies, not “cotton” cousins |

- Threshold: score ≥ 40 · return top 5 with match % and reasons
- Product **type wins** over color/fabric (shirt ≠ kurta ≠ tee)
- Off-catalog asks (shoes, iPhone) return empty — we do not fake stock

**Speaker [B] (~50s)**
> “Preferences carry the most weight because that’s the personalization. Category and budget are hard constraints for the Indian shopper. Keywords fill the gap, but we learned the hard way that ‘cotton’ must not collapse a shirt query into kurtas. We built a type index from the live catalog so the noun you said wins. Spoken budgets normalize to numbers. If you ask for something we don’t sell, Muse says so. That honesty is part of the product.”

---

## Slide 6 — Key features & innovations

**On slide (headline)**
> A shopping product, not a prompt playground.

**Six tiles (2×3)**

| | |
|---|---|
| Natural language + voice | Type or tap mic — Groq Whisper in, spoken reply out |
| Match % + why | Every card explains the fit |
| Conversational refine | Context survives “cheaper” / “more protein” |
| Compare up to 3 | Side-by-side, from chat or cards |
| Bag → checkout | Mock UPI, card, COD · GST 5% · free shipping over ₹499 |
| Indian catalog | Food + fashion SKUs with real photos, ₹ pricing |

**Innovation callout (one sentence, highlight it)**
> Context merge + grounded generation + type-safe matching — so the bot stays useful after the first message.

**Speaker [A] (~40s)**
> “Beyond recommendations: you can compare products, add to bag, check out with UPI, card, or cash on delivery, and reopen past orders. Voice is first-class — including Indian shopping words like kurta and makhana, which speech-to-text often mangles. The UI is an AI workspace: sidebar history, magazine-style cards, taste profile from what’s already on this device. We designed it to feel like a personal atelier, not a support chatbot.”

---

## Slide 7 — Technology stack

**On slide (headline)**
> Fast to ship, strict about what the model is allowed to do.

**Table**

| Layer | Choice | Why |
|---|---|---|
| App | Next.js 14 (App Router) | Web demo, streaming, Vercel host |
| UI | React, Tailwind, shadcn/ui | Clean, accessible, fast to iterate |
| Chat | Vercel AI SDK (`useChat`) | Token streaming + structured product data |
| Language | Groq · gpt-oss-20b extract · gpt-oss-120b reply | Low latency for live demo |
| Voice | Groq Whisper STT · TTS (with browser fallback) | Hands-free shopping |
| Validation | Zod schemas | Extraction cannot drift into free-form mess |
| Ranking | TypeScript matcher (deterministic) | Explainable scores, unit-tested |
| Data | Curated JSON catalog (19 SKUs) | Food + fashion, Indian pricing |
| Payments | Mock checkout API | Full loop without a live gateway |

**Footer:** Hosted on Vercel · tested with Vitest + Playwright (including production)

**Speaker [B] (~40s)**
> “The stack is deliberately split. Language models extract and talk. TypeScript owns ranking, prices, and checkout totals so the AI cannot invent a discount. Zod keeps extraction in a contract. We stream the reply and the product payload together, so cards appear with the text. The catalog is curated on purpose — quality of match over a scraped million-SKU dump. That is what you need to judge the recommender.”

---

## Slide 8 — Live demo highlights

**On slide (headline)**
> Four sentences. Four different kinds of intent.

**Keep this slide up during the live demo. Large, readable.**

| Say this | Expect | Point at |
|---|---|---|
| “Vegan snacks under ₹300” | Protein Cookies ~₹299, high match | Diet + budget |
| “Light ethnic wear for summer” | Cotton / handblock kurta | Season + style |
| “Protein-rich breakfast options” | Oats & chia bars | Nutrition, not snacks |
| “Trendy casual wear under ₹1000” | Oversized cotton tee | Trend + budget |

**Then, if time:** “something cheaper” · tap Compare · “add to bag” · checkout UPI · optional voice: “kurta under five hundred”

**Visual:** Live site. Do not use a video unless the network fails — keep a 3-min backup recording.

**Demo script — Speaker [A] (~2 min 15s)**  ← this is the most important part of the 7 minutes

1. Open the live URL. Show the Muse workspace (orb, composer, sample chips).
2. Type **vegan snacks under ₹300**. Wait for stream. Hover a card: match % + why. Mention ₹ and vegan.
3. Type **something with more protein** (or cheaper). Show context merge.
4. New search: **light ethnic wear for summer**. Point at cotton / ethnic, not snacks.
5. Optional: **compare these** or add to bag → checkout → UPI success.
6. If mic works: one voice query. If not, skip — don’t debug on stage.

**Backup if wifi dies:** play the 3-minute demo video; still narrate the four queries.

---

## Slide 9 — Indian market & design

**On slide (headline)**
> Built for how India actually shops.

**Left — market**

- Prices in ₹, spoken amounts (“under five hundred”)
- Food: vegan, protein, makhana, millet-adjacent snacks
- Fashion: kurta, kurti, chikankari, palazzo, festive / shaadi / office / gym
- Payments people use: UPI, card, COD
- GST + free shipping threshold in checkout

**Right — UX**

- Magazine cards, not a spreadsheet of SKUs
- Match badge + “Why Muse picked this”
- Voice in the composer
- Sidebar: this session’s conversation, bag, orders, taste
- Warm atelier palette — shoppable, not “AI terminal”

**Speaker [A] (~30s)**
> “The brief asked for Indian pricing, seasonal and cultural preference, and brand-aligned reasons. That’s why wedding and gym are first-class occasions, why kurta is not kirtan, and why checkout looks like an Indian D2C cart. Design is part of trust: if the card looks like a real product and the reason is specific, people believe the recommendation.”

---

## Slide 10 — What’s next & close

**On slide (headline)**
> From capstone prototype to a layer D2C brands can embed.

**Now**

- Working web app, hosted
- Context extraction + hybrid recommender + explanations
- Voice, compare, bag, mock checkout
- Docs, tests, GitHub

**Next (business potential)**

- Plug into a real catalog / Shopify / unlisted D2C feed
- Razorpay (or brand’s PSP) instead of mock UPI
- Hindi + Hinglish as a first-class input language
- On-device taste memory that actually learns across sessions
- B2B: “Muse widget” on brand sites — they keep the SKU, we keep the conversation

**Closing line (large)**
> Muse doesn’t ask shoppers to learn filters. It learns the request.

**Team + links**
`[A] · [B]`  ·  Live URL  ·  GitHub  ·  Docs

**Speaker [A] (~35s)**
> “Today Muse is a focused catalog so you can judge the brain, not the scrape. The business path is a recommendation layer for Indian D2C brands who already have products but still lose people in search. We’re happy to take questions — including how extraction, scoring, and grounding are tested.”

Hand to Q&A. **Both stand.** Don’t freeze the demo tab.

---

# 7-minute timing card (print this)

| Min | Slide | Who | What |
|---|---|---|---|
| 0:00–0:20 | 1 Title | A | Names, one-liner |
| 0:20–1:00 | 2 Problem | A | Search vs intent |
| 1:00–1:35 | 3 Solution | A | Understand / match / explain |
| 1:35–2:30 | 4 Pipeline | B | Context engineering |
| 2:30–3:20 | 5 Scoring | B | Hybrid filter, no hallucinations |
| 3:20–4:00 | 6 Features | A | Voice, compare, checkout |
| 4:00–4:40 | 7 Stack | B | Next.js, Groq, Zod, matcher |
| 4:40–6:50 | 8 Demo | A | Four queries (+ refine / checkout if smooth) |
| 6:50–7:00 | 9–10 | A | India + close *(if demo ran long, skip 9 and close from 10)* |

If demo overruns, **cut slide 9** and close from memory. Never cut the demo.

---

# Who says what (individual marks)

Faculty marks individuals. Do not let one person narrate the whole 7 minutes.

**[A] owns:** story, problem, live demo, UX, close  
**[B] owns:** pipeline, scoring, stack, “what if the model lies”, Q&A on matching

During demo, [B] can point at the screen (match %, why-text) while [A] talks — looks coordinated, not chaotic.

---

# Q&A bank (3 minutes — prep both of you)

**How is this different from ChatGPT with a product list?**  
The model never picks the SKU. Extraction is structured; ranking is a tested algorithm; replies are grounded on returned products only.

**Why only ~19 products?**  
Capstone scope: prove context + matching + UX. A large dirty catalog hides whether the brain works. Next step is a real brand feed.

**What is hybrid filtering here?**  
Content-based scoring (diet, style, budget, type) plus conversational context. Not classic collaborative filtering (no user-user matrix yet) — say that honestly, then: “taste profile on-device is the start of personalization across sessions.”

**Why Groq, not Gemini?**  
Latency for a live 7-minute demo. Fast model for extraction, larger model for replies. Ranking still local.

**How do you stop hallucinations?**  
Grounding prompt + empty-catalog path + matcher that returns nothing for shoes/iPhones. Playwright covers “don’t invent photos / products.”

**Voice heard “kirtan” instead of “kurta”?**  
Shopping-biased STT prompt, homophone map, and a real under-₹500 cotton kurta in catalog so the match is possible.

**Is checkout real money?**  
No — mock UPI/card/COD, server re-prices from catalog, GST 5%, cards ending `0000` declined. Ready to swap for Razorpay.

**What did each of you build?**  
Fill this in before the pitch. Example split: [B] matcher, extraction, APIs; [A] UI, cards, checkout flow, voice UX, deck. Be specific.

**How would this make money?**  
SaaS widget / API for D2C brands: higher conversion on long-tail queries. Optional affiliate on multi-brand. Start with one food brand + one fashion brand.

---

# Suggested screenshot list (grab these before you design slides)

1. Welcome / Muse orb + sample queries  
2. Vegan snacks result with 95%-style badge  
3. “Why Muse picked this” on a card  
4. Ethnic summer kurta result  
5. Comparison table  
6. Bag + checkout (UPI)  
7. Voice mic in the composer  
8. Architecture diagram (slide 4) — draw in slides, don’t screenshot code  

---

# Copy-paste speaker script (if you want to rehearse word-for-word)

**[A]** Hi, we’re [A] and [B]. Muse is a personal shopping assistant for Indian D2C food and fashion. You say what you want in plain language — or by voice — and you get ranked products with a reason, not a wall of filters.

Indian e-commerce search still thinks in keywords. “Light ethnic wear for summer” is a season, a fabric, an occasion, and a look. “Vegan snacks under 300 rupees” is diet plus budget. Shoppers shouldn’t have to learn the taxonomy.

Muse understands the sentence, matches a real catalog, and explains the pick. You can refine in conversation, compare, add to bag, and check out.

**[B]** The hard part is context engineering. We extract a schema — intent, category, budget in rupees, dietary and style flags. Follow-ups merge; we don’t forget you asked for vegan. Ranking is hybrid and deterministic: preferences, category, budget, product type. The language model writes the reply but cannot invent SKUs. If you ask for shoes, we have none — we say so.

**[A]** You’ll also see voice, comparison, and an Indian checkout path — UPI, card, COD, GST. I’ll run the four brief queries now.

*(Demo.)*

**[A]** That’s Muse: built for rupees, kurtas, makhana, and the way people actually ask. Next is a real brand catalog and live payments. Happy to take questions.

---

# Slide count check (faculty brief)

| Required topic | Slide |
|---|---|
| Problem statement | 2 |
| Solution approach | 3, 4, 5 |
| Key features and innovations | 6 |
| Technology stack | 7 |
| Live demo highlights | 8 |
| Future scalability / business | 10 |
| (+ title, + India/UX) | 1, 9 |

10 slides. Do not add more.

---

# Teammate checklist before presentation day

- [ ] Names and GitHub URL filled on slides 1 and 10  
- [ ] Both can run the four demo queries on the **hosted** site, not only localhost  
- [ ] Backup 3-minute demo video downloaded offline  
- [ ] Mic permission tested on the presentation laptop  
- [ ] “What I built” sentence each, out loud, 15 seconds  
- [ ] Printed timing card + Q&A bank  
- [ ] Project documentation PDF/printout ready if faculty asks  
