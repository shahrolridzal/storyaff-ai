require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const GEMINI_MODEL = "gemini-3.6-flash";
const OPENROUTER_MODEL = "openrouter/free";


// ============================================================
// BASIC HELPERS
// ============================================================

function containsUrl(text) {
    if (!text) return false;

    return /https?:\/\/|www\.|t\.me\/|bit\.ly\/|tinyurl\.com|s\.shopee\.com/i.test(
        String(text)
    );
}


function containsBannedIndonesian(text) {
    if (!text) return false;

    const bannedWords = [
        "bisa",
        "sangatlah",
        "kamu",
        "anda",
        "nggak",
        "enggak",
        "gak",
        "dong",
        "banget",
        "cuma perlu",
        "langsung saja",
        "terbaik",
        "mantap sekali",
        "wajib banget"
    ];

    const lower = String(text).toLowerCase();

    return bannedWords.some(word => lower.includes(word));
}


function containsFakeExperience(text) {
    if (!text) return false;

    const patterns = [
        /\baku dah guna\b/i,
        /\baku sudah guna\b/i,
        /\baku dah cuba\b/i,
        /\baku sudah cuba\b/i,
        /\baku dah test\b/i,
        /\baku sudah test\b/i,
        /\baku pernah guna\b/i,
        /\baku pernah cuba\b/i,
        /\baku pernah test\b/i,
        /\baku beli\b/i,
        /\baku dah beli\b/i,
        /\baku sudah beli\b/i,
        /\baku pakai\b/i,
        /\baku dah pakai\b/i,
        /\baku sudah pakai\b/i,
        /\baku test\b/i,
        /\baku cuba\b/i,
        /\baku guna\b/i
    ];

    return patterns.some(pattern => pattern.test(text));
}


function extractJson(text) {
    if (!text) {
        throw new Error("AI returned empty response.");
    }

    let cleaned = String(text).trim();

    // Remove markdown fences
    cleaned = cleaned.replace(/^```json\s*/i, "");
    cleaned = cleaned.replace(/^```\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/i, "");

    // Find first JSON object
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    try {
        return JSON.parse(cleaned);
    } catch (error) {
        throw new Error("AI returned invalid JSON.");
    }
}


function normalizeParts(parts) {
    if (!Array.isArray(parts)) {
        throw new Error("Story parts must be an array.");
    }

    return parts
        .map(part => String(part || "").trim())
        .filter(Boolean);
}


function splitProductFacts(description) {
    if (!description) return [];

    return String(description)
        .split(/(?<=[.!?])\s+|\n+/)
        .map(x => x.trim())
        .filter(Boolean)
        .slice(0, 5);
}


function replacePlaceholders(story, productName, facts) {
    let output = story;

    output = output.replace(
        /\{\{PRODUCT_NAME\}\}/g,
        productName
    );

    facts.forEach((fact, index) => {
        const placeholder = `{{FACT_${index + 1}}}`;

        output = output.replace(
            new RegExp(
                placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "g"
            ),
            fact
        );
    });

    return output;
}


function cleanStoryParts(parts) {
    return parts.map((part, index) => {
        let clean = String(part).trim();

        // Remove AI numbering if it added it
        clean = clean.replace(
            /^\s*(?:part|bahagian)\s*\d+\s*[:.)-]?\s*/i,
            ""
        );

        // Also remove accidental numbered format
        clean = clean.replace(
            /^\s*\d+\s*[:.)-]\s*/,
            ""
        );

        return `${index + 1}. ${clean.trim()}`;
    });
}


// ============================================================
// SOFIAN PERSONA
// ============================================================

const SOFIAN_IDENTITY = `
Sofian The Travelling Cat is literally a travelling cat.

He is NOT a human traveller.

He is a cat with human-like thoughts, opinions and storytelling ability.

His cat identity must naturally exist inside his worldview:
- he notices smells
- he notices food
- he notices strange human behaviour
- he notices cramped spaces
- he notices bags and luggage
- he notices comfort
- he notices whether something feels troublesome
- he gets curious
- he can be lazy
- he can be practical
- he can be sarcastic
- he can observe humans from a cat's perspective

Do NOT repeatedly say "as a cat".

Do NOT make him meow every sentence.

Do NOT turn him into a human influencer called Sofian.

The reader should naturally feel that the narrator is a travelling cat.
`;


const SOFIAN_VOICE = `
VOICE:

Natural Malaysian Malay.

Casual.

Conversational.

Slight Malaysian Manglish is okay.

Very light Northern Malaysian flavour.

Possible words:
hang, pi, mai, sat, awat, dak, depa, noh, kot, haa, pulak, ja.

But DO NOT force these words.

The writing must sound like a Malaysian person thinking out loud,
not like advertising copy.

Use short and medium sentences.

Avoid corporate language.

Avoid motivational language.

Avoid influencer language.

Avoid "content creator" style.

Avoid polished marketing language.

Avoid fake jokes.

Humour should come from observation.

The personality should come from the way Sofian thinks,
not from repeatedly inserting slang.

VOICE BENCHMARK:

"Hang pernah tak tengok balik video travel hang, lepastu rasa pening sebab footage bergegar teruk?"

"Niat pi melancong tu nak simpan kenangan comel-comel. Tapi bila playback balik, rasa macam naik roller coaster."

"Aku bukan kedekut. Aku cuma tak suka duit keluar tanpa sebab."

"Aku tengok benda travel, soalan pertama bukan cantik dak? Soalan pertama: boleh masuk beg dak?"

"Beg 7kg. Barang nak bawa 12kg. Matematik pun surrender."

These examples define the naturalness,
NOT facts that must appear in every story.
`;


const GENERAL_RULES = `
IMPORTANT:

Never fabricate facts.

Never fabricate personal experience.

Never claim Sofian bought, used, tested, owned or personally experienced a product.

Never claim a product was seen, recommended, used or tested by another person unless explicitly supplied as a fact.

Never invent:
- prices
- discounts
- reviews
- ratings
- popularity
- battery life
- specifications
- dimensions
- weight
- materials
- durability
- performance
- locations
- customer opinions
- personal experience

Do not make unsupported comparisons.

Do not make medical, financial or safety claims.

Do not generate URLs.

Do not generate affiliate links.

Do not write hashtags unless specifically requested.

Do not use hard-sell language.

Do not say:
"wajib beli"
"jangan lepaskan"
"confirm berbaloi"
"confirm puas hati"
"best gila"
"number one"
"terbaik"
unless those claims are explicitly supported.

The story must feel like an observation,
not an advertisement.
`;


// ============================================================
// STAGE 1 — SOFIAN BRAIN
// ============================================================

function buildBrainPrompt(productName) {

    return `
You are SOFIAN BRAIN.

Your job is NOT to write the final story.

Your job is to think about a travel situation
that could naturally lead to a product mention.

${SOFIAN_IDENTITY}

${SOFIAN_VOICE}

${GENERAL_RULES}

VERY IMPORTANT:

You are NOT given the product description.

You must NOT invent what the product does.

You must NOT invent product specifications.

You must NOT invent product benefits.

You only know that the story will eventually introduce:

"${productName}"

Treat the product as an unknown object.

Your job is to create the storytelling structure around it.

Think about:

1. travel_problem
2. sofian_observation
3. sofian_reaction
4. tension
5. product_role
6. sofian_opinion
7. ending_direction

The product_role must NOT contain product facts.

For example:

GOOD:
"Introduce the product as a possible answer to the problem."

BAD:
"Introduce it because it is lightweight and has a 3-axis gimbal."

Return JSON only.

Required structure:

{
  "travel_problem": "",
  "sofian_observation": "",
  "sofian_reaction": "",
  "tension": "",
  "product_role": "",
  "sofian_opinion": "",
  "ending_direction": ""
}
`;
}


// ============================================================
// STAGE 2 — SOFIAN WRITER
// ============================================================

function buildWriterPrompt(brain) {

    return `
You are SOFIAN WRITER.

Turn the supplied story blueprint into a natural Threads storytelling post.

${SOFIAN_IDENTITY}

${SOFIAN_VOICE}

${GENERAL_RULES}

STORY BLUEPRINT:

${JSON.stringify(brain, null, 2)}

CRITICAL PRODUCT RULE:

You DO NOT know the product description.

You are intentionally NOT given the product facts.

Therefore you MUST NOT invent product facts.

The backend will insert the real product facts later.

You have these placeholders:

{{PRODUCT_NAME}}

{{FACT_1}}

{{FACT_2}}

{{FACT_3}}

{{FACT_4}}

{{FACT_5}}

Use {{PRODUCT_NAME}} exactly ONCE.

Use {{FACT_1}} exactly ONCE.

You may use {{FACT_2}} if it exists.

Do not invent what FACT_1 or FACT_2 says.

Treat those placeholders as factual information supplied later by the backend.

IMPORTANT:

The story must still feel natural when the placeholders are replaced.

Example structure:

Part 1:
Observation / hook.

Part 2:
Small travel problem.

Part 3:
Sofian's reaction.

Part 4:
Tension or trade-off.

Part 5:
Natural product reveal using {{PRODUCT_NAME}}.

Part 6:
Use {{FACT_1}} naturally.

Part 7:
Sofian's opinion.

Part 8:
Soft ending.

This is only a suggested structure.
You may use 6–10 parts.

Do not force the product into the story too early.

Do not make every part about the product.

Do not sound like an advertisement.

Do not claim personal use.

Do not say:
"I used it"
"I tried it"
"I bought it"
"I tested it"
"I've been using it"
"I brought it with me"
"I took it travelling"

unless such experience was explicitly supplied.

Do NOT generate URLs.

Do NOT generate affiliate links.

Do NOT generate hashtags.

Return JSON only.

Required structure:

{
  "parts": [
    "",
    "",
    ""
  ]
}
`;
}


// ============================================================
// AI PROVIDERS
// ============================================================

async function callGemini(prompt) {

    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured.");
    }

    const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

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
                temperature: 0.65,
                responseMimeType: "application/json"
            }
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data?.error?.message ||
            "Gemini request failed."
        );
    }

    const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error("Gemini returned empty response.");
    }

    return text;
}


async function callOpenRouter(prompt) {

    if (!OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured.");
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
                temperature: 0.65,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data?.error?.message ||
            "OpenRouter request failed."
        );
    }

    const text =
        data?.choices?.[0]?.message?.content;

    if (!text) {
        throw new Error("OpenRouter returned empty response.");
    }

    return text;
}


async function callAI(prompt) {

    let geminiError = null;

    // Gemini first
    try {
        const text = await callGemini(prompt);

        return {
            provider: "gemini",
            text
        };

    } catch (error) {

        geminiError = error;

        console.log(
            "Gemini failed:",
            error.message
        );
    }


    // OpenRouter fallback
    try {

        const text = await callOpenRouter(prompt);

        return {
            provider: "openrouter",
            text
        };

    } catch (error) {

        throw new Error(
            `Both AI providers failed. Gemini: ${geminiError?.message || "unknown"} | OpenRouter: ${error.message}`
        );
    }
}


// ============================================================
// BRAIN VALIDATION
// ============================================================

function validateBrain(brain) {

    const required = [
        "travel_problem",
        "sofian_observation",
        "sofian_reaction",
        "tension",
        "product_role",
        "sofian_opinion",
        "ending_direction"
    ];

    for (const field of required) {

        if (
            !brain[field] ||
            typeof brain[field] !== "string"
        ) {
            throw new Error(
                `Brain missing field: ${field}`
            );
        }
    }

    const brainText = JSON.stringify(brain);

    if (containsUrl(brainText)) {
        throw new Error(
            "Brain generated a URL."
        );
    }

    if (containsBannedIndonesian(brainText)) {
        throw new Error(
            "Brain contains banned Indonesian wording."
        );
    }

    return true;
}


// ============================================================
// STORY SHELL VALIDATION
// ============================================================

function validateStoryShell(parts, facts) {

    if (!Array.isArray(parts)) {
        throw new Error(
            "Writer did not return story parts."
        );
    }

    if (parts.length < 6 || parts.length > 10) {
        throw new Error(
            `Story must contain 6–10 parts. Got ${parts.length}.`
        );
    }

    const combined = parts.join("\n");

    if (containsUrl(combined)) {
        throw new Error(
            "Writer generated a URL."
        );
    }

    if (containsBannedIndonesian(combined)) {
        throw new Error(
            "Writer contains banned Indonesian wording."
        );
    }

    if (containsFakeExperience(combined)) {
        throw new Error(
            "Writer generated fake personal experience."
        );
    }

    const productNameCount =
        (combined.match(/\{\{PRODUCT_NAME\}\}/g) || []).length;

    if (productNameCount !== 1) {
        throw new Error(
            `{{PRODUCT_NAME}} must appear exactly once. Found ${productNameCount}.`
        );
    }

    const fact1Count =
        (combined.match(/\{\{FACT_1\}\}/g) || []).length;

    if (fact1Count !== 1) {
        throw new Error(
            `{{FACT_1}} must appear exactly once. Found ${fact1Count}.`
        );
    }

    // If the description has multiple facts,
    // the writer may use FACT_2 but cannot use
    // placeholders that don't exist.
    for (let i = 2; i <= 5; i++) {

        const placeholder =
            `{{FACT_${i}}}`;

        const count =
            (combined.match(
                new RegExp(
                    placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                    "g"
                )
            ) || []).length;

        if (count > 0 && !facts[i - 1]) {
            throw new Error(
                `Writer used ${placeholder}, but that fact does not exist.`
            );
        }

        if (count > 1) {
            throw new Error(
                `${placeholder} may only appear once.`
            );
        }
    }

    return true;
}


// ============================================================
// PRODUCT FACT INJECTION
// ============================================================

function injectProductFacts(parts, productName, productDescription) {

    const facts = splitProductFacts(
        productDescription
    );

    if (!facts.length) {
        throw new Error(
            "Product description contains no usable facts."
        );
    }

    // At minimum FACT_1 must exist.
    let story = parts.join("\n");

    story = replacePlaceholders(
        story,
        productName,
        facts
    );

    // Make sure no placeholder survives
    const leftoverPlaceholder =
        /\{\{(?:PRODUCT_NAME|FACT_\d+)\}\}/g;

    if (leftoverPlaceholder.test(story)) {
        throw new Error(
            "Story contains unresolved product placeholders."
        );
    }

    return story;
}


// ============================================================
// FINAL STORY VALIDATION
// ============================================================

function validateFinalStory(story, productName) {

    if (!story) {
        throw new Error(
            "Final story is empty."
        );
    }

    if (containsUrl(story)) {
        throw new Error(
            "Final story unexpectedly contains a URL."
        );
    }

    if (containsBannedIndonesian(story)) {
        throw new Error(
            "Final story contains banned Indonesian wording."
        );
    }

    if (containsFakeExperience(story)) {
        throw new Error(
            "Final story contains possible fake personal experience."
        );
    }

    if (!story.includes(productName)) {
        throw new Error(
            "Product name missing from final story."
        );
    }

    const parts = story
        .split("\n")
        .filter(Boolean);

    if (parts.length < 6 || parts.length > 10) {
        throw new Error(
            `Final story must contain 6–10 parts. Got ${parts.length}.`
        );
    }

    return true;
}


// ============================================================
// AFFILIATE INJECTION
// ============================================================

function injectAffiliateUrl(story, affiliateUrl) {

    if (!affiliateUrl) {
        throw new Error(
            "Affiliate URL is required."
        );
    }

    if (!/^https?:\/\/.+/i.test(affiliateUrl)) {
        throw new Error(
            "Invalid affiliate URL."
        );
    }

    // The story must NEVER already contain a URL.
    if (containsUrl(story)) {
        throw new Error(
            "Cannot inject affiliate URL because story already contains a URL."
        );
    }

    const parts = story
        .split("\n")
        .filter(Boolean);

    if (parts.length < 6) {
        throw new Error(
            "Story needs at least 6 parts before affiliate injection."
        );
    }

    // Remove accidental previous affiliate marker
    const cleaned = parts.map(part =>
        part.replace(
            /\s*AFFILIATE_LINK\s*$/i,
            ""
        ).trim()
    );

    // Inject ONLY into final part.
    cleaned[cleaned.length - 1] =
        `${cleaned[cleaned.length - 1]}\n${affiliateUrl}`;

    return cleaned.join("\n");
}


// ============================================================
// FULL GENERATION PIPELINE
// ============================================================

async function generateStory({
    productName,
    productDescription
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


    // --------------------------------------------------------
    // STEP 1
    // Sofian Brain
    // --------------------------------------------------------

    const brainPrompt =
        buildBrainPrompt(productName);

    const brainAI =
        await callAI(brainPrompt);

    const brain =
        extractJson(brainAI.text);

    validateBrain(brain);


    // --------------------------------------------------------
    // STEP 2
    // Sofian Writer
    // --------------------------------------------------------

    const writerPrompt =
        buildWriterPrompt(brain);

    const writerAI =
        await callAI(writerPrompt);

    const writer =
        extractJson(writerAI.text);

    let parts =
        normalizeParts(writer.parts);


    // --------------------------------------------------------
    // STEP 3
    // Validate AI shell
    // --------------------------------------------------------

    const facts =
        splitProductFacts(productDescription);

    validateStoryShell(
        parts,
        facts
    );


    // --------------------------------------------------------
    // STEP 4
    // Add numbering
    // --------------------------------------------------------

    parts =
        cleanStoryParts(parts);


    // --------------------------------------------------------
    // STEP 5
    // Backend fact injection
    // --------------------------------------------------------

    let finalStory =
        injectProductFacts(
            parts,
            productName,
            productDescription
        );


    // --------------------------------------------------------
    // STEP 6
    // Final validation
    // --------------------------------------------------------

    validateFinalStory(
        finalStory,
        productName
    );


    return {
        success: true,

        provider: {
            brain: brainAI.provider,
            writer: writerAI.provider
        },

        brain,

        story: finalStory
    };
}


// ============================================================
// ROUTES
// ============================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        app: "StoryAff AI",
        version: "1.9.4",
        status: "online"
    });

});


app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        status: "healthy",
        version: "1.9.4",
        geminiConfigured: !!GEMINI_API_KEY,
        openrouterConfigured: !!OPENROUTER_API_KEY
    });

});


// ============================================================
// AI TEST
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
            await generateStory({
                productName,
                productDescription
            });


        return res.json({
            success: true,
            version: "1.9.4",
            provider: result.provider,
            brain: result.brain,
            story: result.story
        });


    } catch (error) {

        console.error(
            "/api/ai/test error:",
            error
        );

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }

});


// ============================================================
// AI GENERATE
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


        // ----------------------------------------------------
        // Generate story WITHOUT affiliate URL
        // ----------------------------------------------------

        const result =
            await generateStory({
                productName,
                productDescription
            });


        // ----------------------------------------------------
        // Inject affiliate URL ONCE
        // ----------------------------------------------------

        const finalStory =
            injectAffiliateUrl(
                result.story,
                affiliateUrl
            );


        // ----------------------------------------------------
        // Final URL count protection
        // ----------------------------------------------------

        const urlMatches =
            finalStory.match(
                /https?:\/\/[^\s]+/gi
            ) || [];


        if (urlMatches.length !== 1) {
            throw new Error(
                `Affiliate URL protection failed. Expected 1 URL, found ${urlMatches.length}.`
            );
        }


        return res.json({

            success: true,

            version: "1.9.4",

            provider: result.provider,

            story: finalStory,

            affiliateUrlInjected: true,

            urlCount: urlMatches.length

        });


    } catch (error) {

        console.error(
            "/api/ai/generate error:",
            error
        );

        return res.status(500).json({

            success: false,

            error: error.message

        });

    }

});


// ============================================================
// SERVER
// ============================================================

app.listen(PORT, () => {

    console.log(
        `StoryAff AI v1.9.4 running on port ${PORT}`
    );

});
