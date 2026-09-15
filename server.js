require("dotenv").config();

const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const VERSION = "1.9.9";

// ============================================================
// API KEYS
// ============================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ============================================================
// MODELS
// ============================================================

const GEMINI_MODEL = "gemini-3.6-flash";
const OPENROUTER_MODEL = "openrouter/free";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";

// ============================================================
// AFFILIATE URL
// IMPORTANT:
// AI NEVER SEES THIS URL.
// AI NEVER GENERATES THIS URL.
// BACKEND INJECTS IT ONLY AT THE END.
// ============================================================

const DEFAULT_AFFILIATE_URL =
    "https://s.shopee.com.my/9fKuWm0JZz";

// ============================================================
// SOFIAN IDENTITY
// ============================================================

const SOFIAN_IDENTITY = `
SOFIAN THE TRAVELLING CAT

Sofian is literally a CAT.

He is not a human influencer pretending to be a cat.
He is not a human traveller with a cat name.
He is a travelling cat with human-like intelligence,
thoughts, opinions and humour.

His cat identity must naturally exist inside his worldview.

He notices things a cat might naturally notice:
- smells
- food
- quiet places
- uncomfortable places
- humans behaving strangely
- bags
- tight spaces
- warmth
- noise
- movement
- curiosity
- comfort

But DO NOT constantly say "as a cat".

Do not make repetitive meow jokes.

Sofian should feel like a real character living in the travel world,
not a generic human Malaysian narrator.
`;

// ============================================================
// SOFIAN VOICE
// ============================================================

const SOFIAN_VOICE = `
VOICE:

Natural Malaysian Malay.

Casual.
Conversational.
Slightly sarcastic.
Observational.
Playful.
Street-smart.
Budget-conscious.

Use light Northern Malaysian flavour naturally.

Words such as:
hang
pi
mai
sat
awat
dak
depa
noh
kot
haa
pulak
ja
baguih

may appear occasionally.

DO NOT force these words into every paragraph.

The voice should feel like a Malaysian friend talking naturally,
not an influencer,
not a salesman,
not corporate copy,
not an AI essay.

Use simple sentences.

Avoid polished marketing language.

Avoid phrases such as:

"Menurut saya"
"secara keseluruhan"
"boleh dipertimbangkan"
"pilihan yang menarik"
"amat praktikal"
"sesuai untuk semua"
"nilai yang baik"
"solusi"
"alternatif yang bagus"
"wajar dipertimbangkan"

Do not sound like an advertisement.

DO NOT use Indonesian-style wording.

Avoid:
nggak
enggak
banget
dong
gue
gua
kamu
anda
bisa
rekam
traveling
pakai
saja when "ja" is more natural
`;

// ============================================================
// STORY DNA
// ============================================================

const STORY_RULES = `
STORY STYLE:

The story should feel like a thought developing naturally.

Typical movement:

1. Notice something.
2. Sofian reacts.
3. A small travel annoyance appears.
4. There is a practical tension.
5. Sofian thinks about the trade-off.
6. Product enters naturally.
7. Product facts are mentioned.
8. Sofian gives a simple opinion.
9. End softly.

Do NOT follow this structure mechanically every time.

The important thing is that the story must feel like
a natural chain of thoughts.

The product should NOT appear immediately unless the story naturally needs it.

Do not begin with:
"Ini produk..."
"Kalau hang cari..."
"Jom tengok..."
"Today I want to talk about..."

Do not write like an affiliate marketer.

The reader should feel like they accidentally listened
to Sofian thinking about a travel problem.
`;

// ============================================================
// TRUTH RULES
// ============================================================

const TRUTH_RULES = `
TRUTH RULES:

You may ONLY use product information supplied by the backend
through PRODUCT FACT placeholders.

Never invent:
- price
- discount
- promotion
- popularity
- reviews
- ratings
- sales numbers
- battery life
- weight
- dimensions
- durability
- waterproofing
- performance beyond supplied facts
- specifications
- accessories
- personal experience
- ownership
- purchase
- usage
- testing
- seeing someone use it
- hearing about it
- recommendations from other people

Never say Sofian bought, used, tested, held, owned,
reviewed or personally experienced the product.

Never create fake travel scenes involving the product.

Never claim the product saved money.

Never claim the product reduced weight unless that exact fact
is supplied.

Never claim the product fits inside a particular pocket,
bag, luggage compartment or space unless explicitly supplied.

Never claim something is easy to use unless explicitly supplied.

Never claim something is smooth, fast, powerful, durable,
lightweight or convenient unless the supplied facts support it.

Do not add facts just because they sound obvious.
`;

// ============================================================
// OUTPUT RULES
// ============================================================

const OUTPUT_RULES = `
OUTPUT:

Return ONLY the story.

No JSON.

No markdown.

No title.

No introduction.

No explanation.

No numbering.

Separate each story part with a blank line.

The backend will decide the final numbering.

Create 6 to 10 natural story parts.

Use these placeholders exactly:

{{PRODUCT_NAME}}

{{FACT_1}}

You may use:

{{FACT_2}}

{{FACT_3}}

ONLY when genuinely useful.

{{PRODUCT_NAME}} should appear exactly once.

{{FACT_1}} must appear exactly once.

Do not write the actual product name.

Do not rewrite product facts yourself.

Do not create URLs.

Do not create hashtags.

Do not include affiliate links.

Do not include markdown links.

Do not use quotation marks around placeholders.

Do not create fake personal experience.
`;

// ============================================================
// BUILD PROMPT
// ============================================================

function buildPrompt(productDescription) {
    return `
You are writing a Threads story for a character called
Sofian The Travelling Cat.

${SOFIAN_IDENTITY}

${SOFIAN_VOICE}

${STORY_RULES}

${TRUTH_RULES}

${OUTPUT_RULES}

PRODUCT DESCRIPTION:

${productDescription}

IMPORTANT:

You do NOT receive the actual product name.

The product name will be inserted by the backend.

You do NOT write product facts yourself.

The backend will insert exact product facts.

Your job is ONLY to create the storytelling shell.

Think about:
- travel
- money
- bag space
- comfort
- hassle
- curiosity
- human behaviour
- things Sofian notices
- practical travel situations

But do NOT invent specific measurable facts.

Do not invent a specific location.

Do not invent a specific trip.

Do not invent a specific person.

Do not invent previous product usage.

Do not invent prices.

Do not invent product specifications.

Do not invent reviews.

Do not invent popularity.

The story must sound like Sofian,
not like an AI trying to imitate a Malaysian influencer.

Return ONLY the story.
`;
}

// ============================================================
// TEXT CLEANING
// ============================================================

function cleanAIText(text) {
    if (!text) return "";

    let cleaned = String(text);

    cleaned = cleaned
        .replace(/```[\s\S]*?```/g, "")
        .replace(/^```/gm, "")
        .replace(/```$/gm, "")
        .trim();

    return cleaned;
}

// ============================================================
// GEMINI
// ============================================================

async function callGemini(prompt) {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    const url =
        `https://generativelanguage.googleapis.com/v1beta/models/` +
        `${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 1800
            }
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data?.error?.message ||
            `Gemini HTTP ${response.status}`
        );
    }

    const text =
        data?.candidates?.[0]?.content?.parts
            ?.map(part => part.text || "")
            .join("")
            .trim();

    if (!text) {
        throw new Error("Gemini returned empty response");
    }

    return text;
}

// ============================================================
// OPENROUTER
// ============================================================

async function callOpenRouter(prompt) {
    if (!OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://storyaff-ai.onrender.com",
                "X-Title": "StoryAff AI"
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.85,
                max_tokens: 1800
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data?.error?.message ||
            `OpenRouter HTTP ${response.status}`
        );
    }

    const text =
        data?.choices?.[0]?.message?.content;

    if (!text) {
        throw new Error("OpenRouter returned empty response");
    }

    return text.trim();
}

// ============================================================
// OPENAI
// ============================================================

async function callOpenAI(prompt) {
    if (!OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured");
    }

    const response = await fetch(
        "https://api.openai.com/v1/responses",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: OPENAI_MODEL,
                input: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "input_text",
                                text: prompt
                            }
                        ]
                    }
                ],
                max_output_tokens: 1800
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data?.error?.message ||
            `OpenAI HTTP ${response.status}`
        );
    }

    let text = "";

    // Standard Responses API output extraction
    if (Array.isArray(data.output)) {
        for (const item of data.output) {
            if (!Array.isArray(item.content)) continue;

            for (const content of item.content) {
                if (
                    content.type === "output_text" &&
                    typeof content.text === "string"
                ) {
                    text += content.text;
                }
            }
        }
    }

    // Extra fallback for possible SDK/API formatting
    if (!text && typeof data.output_text === "string") {
        text = data.output_text;
    }

    text = text.trim();

    if (!text) {
        throw new Error("OpenAI returned empty response");
    }

    return text;
}

// ============================================================
// AI PROVIDER FALLBACK
// Gemini → OpenRouter → OpenAI
// ============================================================

async function generateWithFallback(prompt) {
    const errors = [];

    // --------------------------------------------------------
    // 1. GEMINI
    // --------------------------------------------------------

    if (GEMINI_API_KEY) {
        try {
            const result = await callGemini(prompt);

            return {
                provider: "gemini",
                text: result
            };
        } catch (error) {
            errors.push(`Gemini: ${error.message}`);
        }
    } else {
        errors.push("Gemini: API key not configured");
    }

    // --------------------------------------------------------
    // 2. OPENROUTER
    // --------------------------------------------------------

    if (OPENROUTER_API_KEY) {
        try {
            const result = await callOpenRouter(prompt);

            return {
                provider: "openrouter",
                text: result
            };
        } catch (error) {
            errors.push(`OpenRouter: ${error.message}`);
        }
    } else {
        errors.push("OpenRouter: API key not configured");
    }

    // --------------------------------------------------------
    // 3. OPENAI
    // --------------------------------------------------------

    if (OPENAI_API_KEY) {
        try {
            const result = await callOpenAI(prompt);

            return {
                provider: "openai",
                text: result
            };
        } catch (error) {
            errors.push(`OpenAI: ${error.message}`);
        }
    } else {
        errors.push("OpenAI: API key not configured");
    }

    throw new Error(
        "All AI providers failed. " +
        errors.join(" | ")
    );
}

// ============================================================
// STORY PARSER
// ============================================================

function parseStory(text) {
    if (!text) return [];

    let cleaned = cleanAIText(text);

    // --------------------------------------------------------
    // Remove common accidental prefixes
    // --------------------------------------------------------

    cleaned = cleaned
        .replace(/^Here is the story:\s*/i, "")
        .replace(/^Story:\s*/i, "")
        .trim();

    // --------------------------------------------------------
    // JSON recovery
    // --------------------------------------------------------

    if (
        cleaned.startsWith("{") ||
        cleaned.startsWith("[")
    ) {
        try {
            const parsed = JSON.parse(cleaned);

            if (Array.isArray(parsed)) {
                return parsed
                    .map(item =>
                        typeof item === "string"
                            ? item.trim()
                            : item?.text ||
                              item?.story ||
                              item?.content ||
                              ""
                    )
                    .filter(Boolean);
            }

            if (Array.isArray(parsed.parts)) {
                return parsed.parts
                    .map(item =>
                        typeof item === "string"
                            ? item.trim()
                            : item?.text ||
                              item?.story ||
                              item?.content ||
                              ""
                    )
                    .filter(Boolean);
            }

            if (typeof parsed.story === "string") {
                return parseStory(parsed.story);
            }
        } catch (error) {
            // Continue with text parser
        }
    }

    // --------------------------------------------------------
    // PART labels
    // --------------------------------------------------------

    const partMatches = cleaned
        .split(/\n\s*(?=PART\s*\d+\s*:?\s*)/i)
        .map(part =>
            part
                .replace(/^PART\s*\d+\s*:?\s*/i, "")
                .trim()
        )
        .filter(Boolean);

    if (partMatches.length >= 6 && partMatches.length <= 12) {
        return partMatches;
    }

    // --------------------------------------------------------
    // Numbered lines
    // --------------------------------------------------------

    const numbered = cleaned
        .split(/\n+/)
        .map(line =>
            line
                .replace(/^\s*\d+\s*[\.\)\-:]\s*/, "")
                .trim()
        )
        .filter(Boolean);

    if (numbered.length >= 6 && numbered.length <= 12) {
        return numbered;
    }

    // --------------------------------------------------------
    // Bullet lines
    // --------------------------------------------------------

    const bullets = cleaned
        .split(/\n+/)
        .map(line =>
            line
                .replace(/^\s*[-*•]\s*/, "")
                .trim()
        )
        .filter(Boolean);

    if (bullets.length >= 6 && bullets.length <= 12) {
        return bullets;
    }

    // --------------------------------------------------------
    // Paragraphs
    // --------------------------------------------------------

    const paragraphs = cleaned
        .split(/\n\s*\n+/)
        .map(p => p.trim())
        .filter(Boolean);

    if (paragraphs.length >= 6 && paragraphs.length <= 12) {
        return paragraphs;
    }

    // --------------------------------------------------------
    // Simple lines
    // --------------------------------------------------------

    const lines = cleaned
        .split(/\n+/)
        .map(line => line.trim())
        .filter(Boolean);

    if (lines.length >= 6 && lines.length <= 12) {
        return lines;
    }

    // --------------------------------------------------------
    // Sentence fallback
    // --------------------------------------------------------

    const sentences = cleaned
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(Boolean);

    if (sentences.length >= 6) {
        const grouped = [];

        const targetParts = Math.min(
            10,
            Math.max(6, Math.ceil(sentences.length / 2))
        );

        const perPart = Math.ceil(
            sentences.length / targetParts
        );

        for (let i = 0; i < sentences.length; i += perPart) {
            grouped.push(
                sentences
                    .slice(i, i + perPart)
                    .join(" ")
                    .trim()
            );
        }

        if (grouped.length >= 6 && grouped.length <= 10) {
            return grouped;
        }
    }

    return [];
}

// ============================================================
// PRODUCT FACTS
// ============================================================

function splitProductFacts(description) {
    if (!description) return [];

    return description
        .split(/(?<=[.!?])\s+/)
        .map(sentence => sentence.trim())
        .filter(Boolean);
}

// ============================================================
// VALIDATORS
// ============================================================

function containsUrl(text) {
    return /https?:\/\/|www\./i.test(text);
}

function containsBannedIndonesian(text) {
    const banned = [
        /\bnggak\b/i,
        /\benggak\b/i,
        /\bbanget\b/i,
        /\bdong\b/i,
        /\bgue\b/i,
        /\bgua\b/i,
        /\bkamu\b/i,
        /\banda\b/i,
        /\baku banget\b/i,
        /\bngapain\b/i,
        /\brekam\b/i,
        /\btraveling\b/i,
        /\bpakai\b/i,
        /\bbisa\b/i
    ];

    return banned.some(pattern => pattern.test(text));
}

function containsFakeExperience(text) {
    const patterns = [
        /\baku dah guna\b/i,
        /\baku sudah guna\b/i,
        /\baku pernah guna\b/i,
        /\baku pernah cuba\b/i,
        /\baku dah cuba\b/i,
        /\baku sudah cuba\b/i,
        /\baku pernah test\b/i,
        /\baku dah test\b/i,
        /\baku sudah test\b/i,
        /\baku pernah beli\b/i,
        /\baku dah beli\b/i,
        /\baku sudah beli\b/i,
        /\baku pernah pakai\b/i,
        /\baku dah pakai\b/i,
        /\baku sudah pakai\b/i,
        /\baku pernah pegang\b/i,
        /\baku dah pegang\b/i,
        /\baku sudah pegang\b/i,
        /\baku bawa\b/i,
        /\baku review\b/i,
        /\baku guna\b/i,
        /\baku cuba\b/i,
        /\baku test\b/i,
        /\baku beli\b/i,
        /\baku pakai\b/i,
        /\baku pegang\b/i,
        /\baku dah beli\b/i,
        /\baku pernah tengok sendiri\b/i
    ];

    return patterns.some(pattern => pattern.test(text));
}

function getInventedSpecificClaim(text) {
    const patterns = [
        /\b\d+(?:\.\d+)?\s*(?:kg|g|gram|grams)\b/i,
        /\b\d+(?:\.\d+)?\s*(?:rm|thb|myr)\b/i,
        /\b\d+(?:\.\d+)?\s*(?:km|kilometer|kilometres?)\b/i,
        /\b\d+(?:\.\d+)?\s*(?:cm|mm|inch|inches)\b/i,
        /\b\d+(?:\.\d+)?\s*(?:hour|hours|jam|minit|minutes)\b/i,
        /\b\d+(?:\.\d+)?\s*(?:hari|days|minggu|weeks|malam|nights)\b/i,

        /\b100%\b/i,
        /\bpasti\b/i,
        /\bdijamin\b/i,
        /\bconfirm\b/i,

        /\bviral\b/i,
        /\bpopular\b/i,
        /\bramai guna\b/i,
        /\bbanyak orang guna\b/i,
        /\bbanyak orang pakai\b/i,
        /\bbanyak orang beli\b/i,

        /\bbattery\b/i,
        /\bbateri tahan\b/i,
        /\bberatnya\b/i,
        /\bberat cuma\b/i,
        /\bdimensi\b/i,
        /\bwaterproof\b/i,
        /\bkalis air\b/i
    ];

    for (const pattern of patterns) {
        if (pattern.test(text)) {
            return pattern.toString();
        }
    }

    return null;
}

// ============================================================
// STORY SHELL VALIDATION
// ============================================================

function validateStoryShell(parts) {
    if (!Array.isArray(parts)) {
        throw new Error("AI story parser returned invalid format.");
    }

    if (parts.length < 6 || parts.length > 10) {
        throw new Error(
            `AI story must contain 6–10 parts. Found ${parts.length}.`
        );
    }

    const fullText = parts.join("\n");

    if (!fullText.includes("{{PRODUCT_NAME}}")) {
        throw new Error(
            "AI story must contain {{PRODUCT_NAME}}."
        );
    }

    if (!fullText.includes("{{FACT_1}}")) {
        throw new Error(
            "AI story must contain {{FACT_1}}."
        );
    }

    const productNameCount =
        (fullText.match(/\{\{PRODUCT_NAME\}\}/g) || []).length;

    if (productNameCount !== 1) {
        throw new Error(
            `{{PRODUCT_NAME}} must appear exactly once. Found ${productNameCount}.`
        );
    }

    const fact1Count =
        (fullText.match(/\{\{FACT_1\}\}/g) || []).length;

    if (fact1Count !== 1) {
        throw new Error(
            `{{FACT_1}} must appear exactly once. Found ${fact1Count}.`
        );
    }

    if (containsUrl(fullText)) {
        throw new Error(
            "AI story contains a URL. AI is not allowed to generate URLs."
        );
    }

    if (containsFakeExperience(fullText)) {
        throw new Error(
            "AI story contains a possible fabricated personal experience."
        );
    }

    const inventedClaim =
        getInventedSpecificClaim(fullText);

    if (inventedClaim) {
        throw new Error(
            "AI story contains an unsupported specific claim."
        );
    }

    return true;
}

// ============================================================
// FINAL VALIDATION AFTER FACT INJECTION
// ============================================================

function validateFinalStory(parts) {
    if (!Array.isArray(parts)) {
        throw new Error("Final story is invalid.");
    }

    if (parts.length < 6 || parts.length > 10) {
        throw new Error(
            `Final story must contain 6–10 parts. Found ${parts.length}.`
        );
    }

    const fullText = parts.join("\n");

    if (containsUrl(fullText)) {
        throw new Error(
            "Final story unexpectedly contains a URL."
        );
    }

    if (containsFakeExperience(fullText)) {
        throw new Error(
            "Final story contains possible fabricated personal experience."
        );
    }

    return true;
}

// ============================================================
// INJECT PRODUCT FACTS
// ============================================================

function injectProductFacts(
    parts,
    productName,
    productDescription
) {
    const facts = splitProductFacts(productDescription);

    if (facts.length === 0) {
        throw new Error(
            "Product description does not contain usable facts."
        );
    }

    const fact1 = facts[0];

    const fact2 =
        facts.length > 1
            ? facts[1]
            : "";

    const fact3 =
        facts.length > 2
            ? facts[2]
            : "";

    return parts.map(part => {
        return part
            .replace(
                /\{\{PRODUCT_NAME\}\}/g,
                productName
            )
            .replace(
                /\{\{FACT_1\}\}/g,
                fact1
            )
            .replace(
                /\{\{FACT_2\}\}/g,
                fact2
            )
            .replace(
                /\{\{FACT_3\}\}/g,
                fact3
            )
            .replace(/\s+\./g, ".")
            .replace(/\.\./g, ".")
            .trim();
    });
}

// ============================================================
// FINAL STORY NUMBERING
// ============================================================

function formatStory(parts) {
    return parts
        .map((part, index) => {
            return `${index + 1}. ${part}`;
        })
        .join("\n\n");
}

// ============================================================
// AFFILIATE INJECTION
// ============================================================

function injectAffiliateUrl(story, affiliateUrl) {
    if (!affiliateUrl) {
        throw new Error(
            "affiliateUrl is required."
        );
    }

    const cleanUrl = String(affiliateUrl).trim();

    if (!/^https?:\/\//i.test(cleanUrl)) {
        throw new Error(
            "affiliateUrl must be a valid HTTP/HTTPS URL."
        );
    }

    // Remove accidental copies first
    const escaped = cleanUrl.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

    const existingCount =
        (story.match(new RegExp(escaped, "g")) || [])
            .length;

    if (existingCount > 1) {
        throw new Error(
            "Affiliate URL appears more than once."
        );
    }

    if (existingCount === 1) {
        return story;
    }

    return `${story}\n\n${cleanUrl}`;
}

// ============================================================
// FULL STORY GENERATOR
// ============================================================

async function generateFullStory({
    productName,
    productDescription,
    affiliateUrl,
    requireAffiliate = true
}) {
    if (!productName) {
        throw new Error(
            "productName is required."
        );
    }

    if (!productDescription) {
        throw new Error(
            "productDescription is required."
        );
    }

    if (requireAffiliate && !affiliateUrl) {
        throw new Error(
            "affiliateUrl is required for /api/ai/generate."
        );
    }

    const prompt =
        buildPrompt(productDescription);

    const aiResult =
        await generateWithFallback(prompt);

    const rawText =
        cleanAIText(aiResult.text);

    const parts =
        parseStory(rawText);

    validateStoryShell(parts);

    const finalParts =
        injectProductFacts(
            parts,
            productName,
            productDescription
        );

    validateFinalStory(finalParts);

    let finalStory =
        formatStory(finalParts);

    let affiliateUrlInjected = false;

    if (requireAffiliate) {
        finalStory =
            injectAffiliateUrl(
                finalStory,
                affiliateUrl
            );

        affiliateUrlInjected = true;
    }

    const urlCount =
        (
            finalStory.match(
                /https?:\/\/\S+/g
            ) || []
        ).length;

    if (requireAffiliate && urlCount !== 1) {
        throw new Error(
            `Expected exactly 1 affiliate URL. Found ${urlCount}.`
        );
    }

    return {
        version: VERSION,
        provider: aiResult.provider,
        story: finalStory,
        affiliateUrlInjected,
        urlCount
    };
}

// ============================================================
// ROOT
// ============================================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        name: "StoryAff AI",
        version: VERSION,
        status: "online",
        providers: {
            gemini: !!GEMINI_API_KEY,
            openrouter: !!OPENROUTER_API_KEY,
            openai: !!OPENAI_API_KEY
        },
        fallbackOrder: [
            "gemini",
            "openrouter",
            "openai"
        ]
    });
});

// ============================================================
// HEALTH
// ============================================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        version: VERSION,
        status: "healthy",
        aiProviders: {
            gemini: GEMINI_API_KEY
                ? "configured"
                : "missing",

            openrouter: OPENROUTER_API_KEY
                ? "configured"
                : "missing",

            openai: OPENAI_API_KEY
                ? "configured"
                : "missing"
        }
    });
});

// ============================================================
// AI TEST
// NO AFFILIATE URL REQUIRED
// ============================================================

app.post("/api/ai/test", async (req, res) => {
    try {
        const {
            productName,
            productDescription
        } = req.body;

        if (!productName) {
            return res.status(400).json({
                success: false,
                error: "productName is required."
            });
        }

        if (!productDescription) {
            return res.status(400).json({
                success: false,
                error: "productDescription is required."
            });
        }

        const result =
            await generateFullStory({
                productName,
                productDescription,
                requireAffiliate: false
            });

        return res.json({
            success: true,
            version: VERSION,
            provider: result.provider,
            story: result.story,
            affiliateUrlInjected: false,
            urlCount: 0
        });

    } catch (error) {
        console.error(
            "[/api/ai/test ERROR]",
            error
        );

        return res.status(500).json({
            success: false,
            version: VERSION,
            error: error.message
        });
    }
});

// ============================================================
// AI GENERATE
// AFFILIATE URL REQUIRED
// ============================================================

app.post("/api/ai/generate", async (req, res) => {
    try {
        const {
            productName,
            productDescription,
            affiliateUrl
        } = req.body;

        if (!productName) {
            return res.status(400).json({
                success: false,
                error: "productName is required."
            });
        }

        if (!productDescription) {
            return res.status(400).json({
                success: false,
                error: "productDescription is required."
            });
        }

        if (!affiliateUrl) {
            return res.status(400).json({
                success: false,
                error: "affiliateUrl is required."
            });
        }

        const result =
            await generateFullStory({
                productName,
                productDescription,
                affiliateUrl,
                requireAffiliate: true
            });

        return res.json({
            success: true,
            version: VERSION,
            provider: result.provider,
            story: result.story,
            affiliateUrlInjected:
                result.affiliateUrlInjected,
            urlCount: result.urlCount
        });

    } catch (error) {
        console.error(
            "[/api/ai/generate ERROR]",
            error
        );

        return res.status(500).json({
            success: false,
            version: VERSION,
            error: error.message
        });
    }
});

// ============================================================
// 404
// ============================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Endpoint not found.",
        version: VERSION
    });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
    console.error(
        "[GLOBAL ERROR]",
        err
    );

    res.status(500).json({
        success: false,
        error: "Internal server error.",
        version: VERSION
    });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
    console.log(
        `StoryAff AI ${VERSION} running on port ${PORT}`
    );

    console.log(
        "AI fallback order: Gemini → OpenRouter → OpenAI"
    );

    console.log(
        `Gemini configured: ${!!GEMINI_API_KEY}`
    );

    console.log(
        `OpenRouter configured: ${!!OPENROUTER_API_KEY}`
    );

    console.log(
        `OpenAI configured: ${!!OPENAI_API_KEY}`
    );

    console.log(
        `OpenAI model: ${OPENAI_MODEL}`
    );
});