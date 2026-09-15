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
// STORYAFF AI
// VERSION 1.9.4.1
// ============================================================


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
        "nggak",
        "enggak",
        "dong",
        "banget",
        "kamu",
        "anda"
    ];

    const lower = String(text).toLowerCase();

    return bannedWords.some(word => {
        const regex = new RegExp(
            `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
            "i"
        );

        return regex.test(lower);
    });
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
        /\baku test\b/i
    ];

    return patterns.some(pattern => pattern.test(text));
}


function extractJson(text) {

    if (!text) {
        throw new Error("AI returned empty response.");
    }

    let cleaned = String(text).trim();

    cleaned = cleaned.replace(/^```json\s*/i, "");
    cleaned = cleaned.replace(/^```\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/i, "");

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(
            firstBrace,
            lastBrace + 1
        );
    }

    try {
        return JSON.parse(cleaned);
    } catch (error) {
        throw new Error(
            "AI returned invalid JSON."
        );
    }
}


function normalizeParts(parts) {

    if (!Array.isArray(parts)) {
        throw new Error(
            "Story parts must be an array."
        );
    }

    return parts
        .map(part => String(part || "").trim())
        .filter(Boolean);
}


function splitProductFacts(description) {

    if (!description) {
        return [];
    }

    return String(description)
        .split(/(?<=[.!?])\s+|\n+/)
        .map(x => x.trim())
        .filter(Boolean)
        .slice(0, 5);
}


function replacePlaceholders(
    story,
    productName,
    facts
) {

    let output = story;

    output = output.replace(
        /\{\{PRODUCT_NAME\}\}/g,
        productName
    );

    facts.forEach((fact, index) => {

        const placeholder =
            `{{FACT_${index + 1}}}`;

        const escaped =
            placeholder.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

        output = output.replace(
            new RegExp(escaped, "g"),
            fact
        );
    });

    return output;
}


function cleanStoryParts(parts) {

    return parts.map((part, index) => {

        let clean = String(part).trim();

        clean = clean.replace(
            /^\s*(?:part|bahagian)\s*\d+\s*[:.)-]?\s*/i,
            ""
        );

        clean = clean.replace(
            /^\s*\d+\s*[:.)-]\s*/,
            ""
        );

        return `${index + 1}. ${clean.trim()}`;
    });
}


// ============================================================
// SOFIAN IDENTITY
// ============================================================

const SOFIAN_IDENTITY = `

SOFIAN THE TRAVELLING CAT

Sofian is literally a travelling cat.

He is NOT a human traveller.

He is a cat with human-like intelligence, thoughts,
opinions, curiosity and storytelling ability.

His cat identity must naturally exist in his worldview.

He notices:

- smells
- food
- strange human behaviour
- cramped spaces
- bags
- luggage
- comfort
- noise
- interesting places
- human habits
- things that look troublesome
- things that might make travel easier

Sofian can be:

- curious
- lazy
- practical
- sarcastic
- observant
- slightly mischievous
- budget-conscious

DO NOT repeatedly say:
"as a cat"

DO NOT make him meow every sentence.

DO NOT turn him into a human influencer called Sofian.

DO NOT make his cat identity merely visual.

The reader should naturally understand that the narrator is a travelling cat.
`;


// ============================================================
// SOFIAN VOICE
// ============================================================

const SOFIAN_VOICE = `

SOFIAN VOICE

Write in natural Malaysian Malay.

Casual.

Conversational.

Slight Malaysian Manglish is acceptable.

Light Northern Malaysian flavour is acceptable.

Possible words include:

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

BUT:

Do not force slang.

Do not put Northern words into every sentence.

Do not try too hard to sound Northern.

The voice should feel like a Malaysian friend talking naturally.

Not an influencer.

Not a copywriter.

Not a product reviewer.

Not a corporate social media manager.

Not a motivational speaker.

Not an AI advertisement.

Humour should come from observation.

Personality should come from the way Sofian thinks.

Use short and medium sentences.

Avoid overly polished sentences.

Avoid unnecessary explanations.

Avoid corporate phrases.

Avoid generic marketing phrases.

VOICE BENCHMARK:

"Hang pernah tak tengok balik video travel hang, lepastu rasa pening sebab footage bergegar teruk?"

"Niat pi melancong tu nak simpan kenangan comel-comel. Tapi bila playback balik, rasa macam naik roller coaster."

"Aku bukan kedekut. Aku cuma tak suka duit keluar tanpa sebab."

"Aku tengok benda travel, soalan pertama bukan cantik dak? Soalan pertama: boleh masuk beg dak?"

"Beg 7kg. Barang nak bawa 12kg. Matematik pun surrender."

These examples are voice references.

Do not copy them into every story.
`;


// ============================================================
// GENERAL TRUTH RULES
// ============================================================

const GENERAL_RULES = `

TRUTH RULES

Never fabricate facts.

Never fabricate personal experience.

Never claim Sofian personally:

- bought
- used
- tested
- owned
- tried
- carried
- travelled with
- reviewed

a product unless that experience is explicitly supplied.

Never invent:

- price
- discount
- review
- rating
- popularity
- battery life
- weight
- dimensions
- materials
- durability
- specifications
- performance
- customer opinions
- locations
- testimonials

Do not invent claims about other people using the product.

Do not make unsupported comparisons.

Do not generate URLs.

Do not generate affiliate links.

Do not generate hashtags unless specifically requested.

Do not use hard-sell language.

Avoid phrases like:

"wajib beli"
"confirm berbaloi"
"confirm puas hati"
"best gila"
"terbaik"
"number one"
"jangan lepaskan"

unless the claim is explicitly supported.

The story should feel like storytelling,
not advertising.
`;


// ============================================================
// STAGE 1
// SOFIAN BRAIN
// ============================================================

function buildBrainPrompt(productName) {

    return `

You are SOFIAN BRAIN.

You are responsible only for the thinking structure.

You are NOT writing the final Threads story.

${SOFIAN_IDENTITY}

${SOFIAN_VOICE}

${GENERAL_RULES}

PRODUCT:

${productName}

IMPORTANT:

You are NOT given the product description.

Therefore you must NOT invent:

- what the product does
- product specifications
- product benefits
- product performance
- product size
- product weight
- product price
- product features

Treat the product as an unknown object.

Your job is only to create a believable travel storytelling situation
where the product can later be introduced.

Think about:

1. travel_problem
2. sofian_observation
3. sofian_reaction
4. tension
5. product_role
6. sofian_opinion
7. ending_direction

The product_role must NOT contain product facts.

GOOD:

"Introduce the product naturally after the travel problem."

GOOD:

"Let Sofian become curious about whether the product could solve the problem."

BAD:

"The product is useful because it is lightweight."

BAD:

"The product has a 3-axis gimbal."

BAD:

"The product fits inside a pocket."

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
// STAGE 2
// SOFIAN WRITER
// ============================================================

function buildWriterPrompt(brain) {

    return `

You are SOFIAN WRITER.

Turn the supplied story blueprint into a natural Threads story.

${SOFIAN_IDENTITY}

${SOFIAN_VOICE}

${GENERAL_RULES}

STORY BLUEPRINT:

${JSON.stringify(brain, null, 2)}

IMPORTANT:

You do NOT know the product description.

The backend will insert the real product facts later.

Therefore:

DO NOT invent product facts.

DO NOT describe the product yourself.

DO NOT guess what the product does.

Use placeholders instead.

AVAILABLE PLACEHOLDERS:

{{PRODUCT_NAME}}

{{FACT_1}}

{{FACT_2}}

{{FACT_3}}

{{FACT_4}}

{{FACT_5}}

REQUIRED:

Use {{PRODUCT_NAME}} exactly once.

Use {{FACT_1}} exactly once.

{{FACT_2}} may be used if appropriate.

Do not invent the contents of the placeholders.

The backend will replace them with real information.

STORY:

The story should contain 6–10 parts.

Recommended flow:

Part 1:
Interesting observation or hook.

Part 2:
Travel annoyance or small problem.

Part 3:
Sofian reacts.

Part 4:
Tension / trade-off.

Part 5:
Natural introduction of {{PRODUCT_NAME}}.

Part 6:
Introduce {{FACT_1}} naturally.

Part 7:
Sofian's opinion.

Part 8:
Soft ending.

This is only a guide.

The story can be 6–10 parts.

Do not make every part about the product.

Do not turn the story into a product review.

Do not make Sofian claim personal product experience.

Do not say:

"I used it."

"I tried it."

"I bought it."

"I tested it."

"I've been using it."

"I brought it with me."

"I travelled with it."

unless that experience is explicitly provided.

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
// GEMINI
// ============================================================

async function callGemini(prompt) {

    if (!GEMINI_API_KEY) {
        throw new Error(
            "GEMINI_API_KEY is not configured."
        );
    }

    const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(
        url,
        {
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
        }
    );

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

        throw new Error(
            "Gemini returned empty response."
        );
    }

    return text;
}


// ============================================================
// OPENROUTER
// ============================================================

async function callOpenRouter(prompt) {

    if (!OPENROUTER_API_KEY) {

        throw new Error(
            "OPENROUTER_API_KEY is not configured."
        );
    }

    const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",

                "Authorization":
                    `Bearer ${OPENROUTER_API_KEY}`,

                "HTTP-Referer":
                    "https://storyaff-ai.onrender.com",

                "X-Title":
                    "StoryAff AI"
            },

            body: JSON.stringify({

                model:
                    OPENROUTER_MODEL,

                temperature:
                    0.65,

                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        }
    );

    const data =
        await response.json();

    if (!response.ok) {

        throw new Error(
            data?.error?.message ||
            "OpenRouter request failed."
        );
    }

    const text =
        data?.choices?.[0]?.message?.content;

    if (!text) {

        throw new Error(
            "OpenRouter returned empty response."
        );
    }

    return text;
}


// ============================================================
// AI ROUTER
// ============================================================

async function callAI(prompt) {

    let geminiError = null;

    // GEMINI FIRST

    try {

        const text =
            await callGemini(prompt);

        return {
            provider: "gemini",
            text
        };

    } catch (error) {

        geminiError =
            error;

        console.log(
            "Gemini failed:",
            error.message
        );
    }


    // OPENROUTER FALLBACK

    try {

        const text =
            await callOpenRouter(prompt);

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

    const brainText =
        JSON.stringify(brain);

    if (containsUrl(brainText)) {

        throw new Error(
            "Brain generated a URL."
        );
    }

    // IMPORTANT:
    // We intentionally DO NOT reject the Brain
    // for Indonesian wording.
    //
    // Brain is internal planning only.
    // Final writer output is what matters.

    return true;
}


// ============================================================
// STORY SHELL VALIDATION
// ============================================================

function validateStoryShell(
    parts,
    facts
) {

    if (!Array.isArray(parts)) {

        throw new Error(
            "Writer did not return story parts."
        );
    }


    if (
        parts.length < 6 ||
        parts.length > 10
    ) {

        throw new Error(
            `Story must contain 6–10 parts. Got ${parts.length}.`
        );
    }


    const combined =
        parts.join("\n");


    if (containsUrl(combined)) {

        throw new Error(
            "Writer generated a URL."
        );
    }


    // Only reject obvious Indonesian words
    // from final writer output.

    if (containsBannedIndonesian(combined)) {

        throw new Error(
            "Writer contains Indonesian-style wording."
        );
    }


    if (containsFakeExperience(combined)) {

        throw new Error(
            "Writer generated possible fake personal experience."
        );
    }


    const productNameCount =
        (
            combined.match(
                /\{\{PRODUCT_NAME\}\}/g
            ) || []
        ).length;


    if (productNameCount !== 1) {

        throw new Error(
            `{{PRODUCT_NAME}} must appear exactly once. Found ${productNameCount}.`
        );
    }


    const fact1Count =
        (
            combined.match(
                /\{\{FACT_1\}\}/g
            ) || []
        ).length;


    if (fact1Count !== 1) {

        throw new Error(
            `{{FACT_1}} must appear exactly once. Found ${fact1Count}.`
        );
    }


    for (
        let i = 2;
        i <= 5;
        i++
    ) {

        const placeholder =
            `{{FACT_${i}}}`;

        const escaped =
            placeholder.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

        const count =
            (
                combined.match(
                    new RegExp(
                        escaped,
                        "g"
                    )
                ) || []
            ).length;


        if (
            count > 0 &&
            !facts[i - 1]
        ) {

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

function injectProductFacts(
    parts,
    productName,
    productDescription
) {

    const facts =
        splitProductFacts(
            productDescription
        );


    if (!facts.length) {

        throw new Error(
            "Product description contains no usable facts."
        );
    }


    let story =
        parts.join("\n");


    story =
        replacePlaceholders(
            story,
            productName,
            facts
        );


    const leftoverPlaceholder =
        /\{\{(?:PRODUCT_NAME|FACT_\d+)\}\}/g;


    if (
        leftoverPlaceholder.test(
            story
        )
    ) {

        throw new Error(
            "Story contains unresolved product placeholders."
        );
    }


    return story;
}


// ============================================================
// FINAL STORY VALIDATION
// ============================================================

function validateFinalStory(
    story,
    productName
) {

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
            "Final story contains Indonesian-style wording."
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


    const parts =
        story
            .split("\n")
            .filter(Boolean);


    if (
        parts.length < 6 ||
        parts.length > 10
    ) {

        throw new Error(
            `Final story must contain 6–10 parts. Got ${parts.length}.`
        );
    }


    return true;
}


// ============================================================
// AFFILIATE URL INJECTION
// ============================================================

function injectAffiliateUrl(
    story,
    affiliateUrl
) {

    if (!affiliateUrl) {

        throw new Error(
            "Affiliate URL is required."
        );
    }


    if (
        !/^https?:\/\/.+/i.test(
            affiliateUrl
        )
    ) {

        throw new Error(
            "Invalid affiliate URL."
        );
    }


    if (containsUrl(story)) {

        throw new Error(
            "Cannot inject affiliate URL because story already contains a URL."
        );
    }


    const parts =
        story
            .split("\n")
            .filter(Boolean);


    if (parts.length < 6) {

        throw new Error(
            "Story needs at least 6 parts."
        );
    }


    const cleaned =
        parts.map(part =>
            part
                .replace(
                    /\s*AFFILIATE_LINK\s*$/i,
                    ""
                )
                .trim()
        );


    // ONLY final part receives affiliate URL.

    cleaned[cleaned.length - 1] =
        `${cleaned[cleaned.length - 1]}\n${affiliateUrl}`;


    return cleaned.join("\n");
}


// ============================================================
// FULL STORY PIPELINE
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


    // ========================================================
    // STEP 1
    // SOFIAN BRAIN
    // ========================================================

    console.log(
        "STEP 1: Running Sofian Brain..."
    );


    const brainPrompt =
        buildBrainPrompt(
            productName
        );


    const brainAI =
        await callAI(
            brainPrompt
        );


    const brain =
        extractJson(
            brainAI.text
        );


    validateBrain(
        brain
    );


    console.log(
        "Brain provider:",
        brainAI.provider
    );


    // ========================================================
    // STEP 2
    // SOFIAN WRITER
    // ========================================================

    console.log(
        "STEP 2: Running Sofian Writer..."
    );


    const writerPrompt =
        buildWriterPrompt(
            brain
        );


    const writerAI =
        await callAI(
            writerPrompt
        );


    const writer =
        extractJson(
            writerAI.text
        );


    let parts =
        normalizeParts(
            writer.parts
        );


    console.log(
        "Writer provider:",
        writerAI.provider
    );


    // ========================================================
    // STEP 3
    // VALIDATE SHELL
    // ========================================================

    const facts =
        splitProductFacts(
            productDescription
        );


    validateStoryShell(
        parts,
        facts
    );


    // ========================================================
    // STEP 4
    // NUMBER PARTS
    // ========================================================

    parts =
        cleanStoryParts(
            parts
        );


    // ========================================================
    // STEP 5
    // BACKEND FACT INJECTION
    // ========================================================

    console.log(
        "STEP 3: Injecting verified product facts..."
    );


    let finalStory =
        injectProductFacts(
            parts,
            productName,
            productDescription
        );


    // ========================================================
    // STEP 6
    // FINAL VALIDATION
    // ========================================================

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

        story:
            finalStory
    };
}


// ============================================================
// ROOT
// ============================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            app: "StoryAff AI",

            version: "1.9.4.1",

            status: "online"

        });

    }
);


// ============================================================
// HEALTH
// ============================================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            status: "healthy",

            version: "1.9.4.1",

            geminiConfigured:
                !!GEMINI_API_KEY,

            openrouterConfigured:
                !!OPENROUTER_API_KEY

        });

    }
);


// ============================================================
// AI TEST
// ============================================================

app.post(
    "/api/ai/test",
    async (req, res) => {

        try {

            const {
                productName,
                productDescription
            } = req.body;


            if (!productName) {

                return res.status(400).json({

                    success: false,

                    error:
                        "productName is required."

                });
            }


            if (!productDescription) {

                return res.status(400).json({

                    success: false,

                    error:
                        "productDescription is required."

                });
            }


            const result =
                await generateStory({

                    productName,

                    productDescription

                });


            return res.json({

                success: true,

                version:
                    "1.9.4.1",

                provider:
                    result.provider,

                brain:
                    result.brain,

                story:
                    result.story

            });


        } catch (error) {

            console.error(
                "/api/ai/test error:",
                error
            );


            return res.status(500).json({

                success: false,

                error:
                    error.message

            });
        }

    }
);


// ============================================================
// AI GENERATE
// ============================================================

app.post(
    "/api/ai/generate",
    async (req, res) => {

        try {

            const {
                productName,
                productDescription,
                affiliateUrl
            } = req.body;


            if (!productName) {

                return res.status(400).json({

                    success: false,

                    error:
                        "productName is required."

                });
            }


            if (!productDescription) {

                return res.status(400).json({

                    success: false,

                    error:
                        "productDescription is required."

                });
            }


            if (!affiliateUrl) {

                return res.status(400).json({

                    success: false,

                    error:
                        "affiliateUrl is required."

                });
            }


            // Generate story WITHOUT URL

            const result =
                await generateStory({

                    productName,

                    productDescription

                });


            // Inject URL ONCE

            const finalStory =
                injectAffiliateUrl(
                    result.story,
                    affiliateUrl
                );


            // Final URL protection

            const urlMatches =
                finalStory.match(
                    /https?:\/\/[^\s]+/gi
                ) || [];


            if (
                urlMatches.length !== 1
            ) {

                throw new Error(
                    `Affiliate URL protection failed. Expected 1 URL, found ${urlMatches.length}.`
                );
            }


            return res.json({

                success: true,

                version:
                    "1.9.4.1",

                provider:
                    result.provider,

                story:
                    finalStory,

                affiliateUrlInjected:
                    true,

                urlCount:
                    urlMatches.length

            });


        } catch (error) {

            console.error(
                "/api/ai/generate error:",
                error
            );


            return res.status(500).json({

                success: false,

                error:
                    error.message

            });
        }

    }
);


// ============================================================
// START SERVER
// ============================================================

app.listen(
    PORT,
    () => {

        console.log(
            `StoryAff AI v1.9.4.1 running on port ${PORT}`
        );

    }
);
