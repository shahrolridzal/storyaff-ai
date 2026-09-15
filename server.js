require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const GEMINI_MODEL = "gemini-3.6-flash";
const OPENROUTER_MODEL = "openrouter/free";

const VERSION = "1.9.6";


// ============================================================
// STORYAFF AI
// V1.9.6
//
// CORE:
// AI = storytelling
// BACKEND = verified product facts
// BACKEND = affiliate URL
//
// Sofian is ALWAYS a travelling cat.
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
        "banget",
        "dong",
        "kamu",
        "anda",
        "bisa"
    ];

    const lower = String(text).toLowerCase();

    return bannedWords.some(word => {
        const regex = new RegExp(
            `\\b${word}\\b`,
            "i"
        );

        return regex.test(lower);
    });
}


// ============================================================
// STRONG FAKE EXPERIENCE CHECK
// ============================================================

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

        /\baku pegang\b/i,
        /\baku dah pegang\b/i,
        /\baku pernah pegang\b/i,

        /\baku bawa\b/i,
        /\baku dah bawa\b/i,
        /\baku pernah bawa\b/i,

        /\baku guna tadi\b/i,
        /\baku cuba tadi\b/i,
        /\baku test tadi\b/i,

        /\baku punya\b/i
    ];

    return patterns.some(
        pattern => pattern.test(text)
    );
}


// ============================================================
// UNSUPPORTED SPECIFIC TRAVEL CLAIMS
// ============================================================

function containsInventedSpecifics(text) {

    if (!text) return false;

    const patterns = [

        // Specific weight claims
        /\b\d+\s*kg\b/i,

        // Specific money claims
        /\bRM\s*\d+/i,
        /\bTHB\s*\d+/i,

        // Specific battery claims
        /\b\d+\s*(jam|hours|hour)\b/i,

        // Specific distance
        /\b\d+\s*(km|kilometer|kilometre)\b/i,

        // Specific travel duration
        /\b\d+\s*(hari|malam|minggu)\b/i,

        // Specific physical product placement
        /\bmasuk poket\b/i,
        /\bmasuk saku\b/i,
        /\bdalam poket\b/i,
        /\bdalam saku\b/i,

        // Unsupported physical travel experience
        /\bbahu.*pegal\b/i,
        /\bbahu.*sakit\b/i,
        /\bpenat.*bawa\b/i,

        // Claims about other users
        /\borang lain guna\b/i,
        /\borang lain pakai\b/i,
        /\borang lain beli\b/i,
        /\btravel blogger\b/i,
        /\breviewer\b/i,
        /\bkomen orang\b/i,

        // Unsupported product testing
        /\bvideo.*smooth\b/i,
        /\bvideo.*blur\b/i,
        /\bgambar.*blur\b/i,

        // Unsupported ease-of-use claims
        /\bsenang digunakan\b/i,
        /\bmudah digunakan\b/i,
        /\btak perlu.*setup\b/i
    ];

    return patterns.some(
        pattern => pattern.test(text)
    );
}


// ============================================================
// PRODUCT FACTS
// ============================================================

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


// ============================================================
// SOFIAN IDENTITY
// ============================================================

const SOFIAN_IDENTITY = `

SOFIAN THE TRAVELLING CAT

Sofian is literally a travelling cat.

He is NOT a human pretending to be a cat.

He is a cat with human-like intelligence,
thoughts, opinions, curiosity and humour.

This identity must influence the way he observes the world.

Sofian notices things such as:

- food smells
- places humans ignore
- cramped spaces
- bags
- luggage
- comfort
- noise
- strange human behaviour
- unnecessary hassle
- things that affect his travel

However:

DO NOT repeatedly mention that he is a cat.

DO NOT use "meow" jokes repeatedly.

DO NOT say "as a cat" every few lines.

DO NOT make cat jokes the entire personality.

The cat identity should feel natural.

Sofian can think like a human,
but he remains a cat.
`;


// ============================================================
// SOFIAN VOICE
// ============================================================

const SOFIAN_VOICE = `

VOICE

Natural Malaysian Malay.

Casual.

Conversational.

Slight Malaysian Manglish is acceptable.

Light Northern Malaysian flavour.

Use Northern words only when natural:

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

Do NOT force them.

Do NOT put slang into every sentence.

Do NOT sound like a Malaysian influencer.

Do NOT sound like a copywriter.

Do NOT sound like corporate marketing.

Do NOT sound like ChatGPT.

Do NOT sound like Indonesian social media writing.

Sofian should sound like a Malaysian traveller casually thinking out loud.

Humour should come from observation.

Not from forced jokes.

Examples of the desired rhythm:

"Hang pernah tak tengok balik video travel hang, lepastu rasa pening sebab footage bergegar teruk?"

"Niat pi melancong tu nak simpan kenangan comel-comel."

"Aku bukan kedekut. Aku cuma tak suka duit keluar tanpa sebab."

"Aku tengok benda travel, soalan pertama bukan cantik dak? Soalan pertama: boleh masuk beg dak?"

These are voice references only.

Do not copy them directly.
`;


// ============================================================
// STORY RULES
// ============================================================

const STORY_RULES = `

STORY RULES

Write 6–10 parts.

The story should feel like a genuine thought developing.

Suggested flow:

1. Observation
2. Problem
3. Sofian reaction
4. Small tension
5. Product appears naturally
6. Verified fact
7. Sofian opinion
8. Soft ending

Do not make every part about the product.

Do not reveal the product immediately.

Do not turn the story into a product review.

Do not write:

"Ini ialah produk yang..."
"Produk ini sangat..."
"Kalau anda sedang mencari..."
"Pilihan terbaik..."
"Berbaloi untuk dibeli."

Avoid advertising language.

The story should feel like:

Sofian noticed something.

Sofian thought about it.

A product concept came into the thought.

Sofian considered whether the idea made sense.

Then he moved on.

That is enough.
`;


// ============================================================
// TRUTH RULES
// ============================================================

const TRUTH_RULES = `

TRUTH RULES

This is extremely important.

You are NOT allowed to invent product facts.

You do NOT know the product description.

The backend will provide verified product facts later.

Therefore you MUST NOT invent:

- specifications
- weight
- dimensions
- battery
- price
- discount
- durability
- performance
- popularity
- ratings
- reviews
- materials
- accessories
- features
- ease of use
- compatibility
- water resistance
- storage
- quality claims

You may only discuss the product concept generally.

The verified facts will appear through placeholders.

Do not modify the placeholders.

Do not explain the placeholders.

Do not add information to them.

==================================================
PERSONAL EXPERIENCE
==================================================

Sofian must NOT claim that he personally:

- bought the product
- used the product
- tested the product
- owned the product
- carried the product
- held the product
- reviewed the product
- travelled with the product

He can have an opinion without having used it.

For example:

"Konsep macam ni nampak masuk akal."

"Kalau fikir pasal ruang beg, idea macam ni menarik."

"At least konsep dia tak serabut."

These are opinions.

==================================================
TRAVEL EXPERIENCE
==================================================

Do not invent precise travel circumstances.

Do not invent:

- exact bag weight
- exact prices
- exact distances
- exact travel duration
- exact locations
- other travellers
- hotel situations
- airport situations
- specific personal experiences

Generic observations are allowed.

Example:

"Barang travel ni memang ada satu perangai. Makin lama tengok, makin banyak benda rasa perlu."

That is an observation.

But:

"Beg aku dah 7kg."

is NOT allowed.

==================================================
PRODUCT FACT PLACEHOLDERS
==================================================

Use:

{{PRODUCT_NAME}}

exactly once.

Use:

{{FACT_1}}

exactly once.

You may use:

{{FACT_2}}
{{FACT_3}}
{{FACT_4}}
{{FACT_5}}

if naturally needed.

Do not invent what those facts say.

==================================================
URL
==================================================

Never generate URLs.

Never generate affiliate links.

Never generate links in any form.

==================================================
HASHTAGS
==================================================

Do not generate hashtags.
`;


// ============================================================
// WRITER PROMPT
// ============================================================

function buildWriterPrompt(productName) {

    return `

You are writing a Threads storytelling post for:

SOFIAN THE TRAVELLING CAT.

${SOFIAN_IDENTITY}

${SOFIAN_VOICE}

${STORY_RULES}

${TRUTH_RULES}

The product name is:

${productName}

You may know the name only so that you understand the context.

You DO NOT know the product description.

You MUST NOT infer specifications from the product name.

==================================================
IMPORTANT WRITING PRINCIPLE
==================================================

Do not manufacture a scene just to make the story interesting.

Do not invent what Sofian physically did.

Do not invent what Sofian carried.

Do not invent what Sofian bought.

Do not invent what Sofian tested.

Do not invent what other people did.

Instead, create interest through:

- observation
- thought
- frustration
- curiosity
- humour
- contrast
- practical thinking
- Sofian's personality

==================================================
CAT PERSPECTIVE
==================================================

Sofian is a travelling cat.

His cat identity should subtly influence his worldview.

For example, he may notice:

- humans carrying too much
- food
- smells
- comfortable places
- annoying noise
- cramped spaces
- bags
- humans doing unnecessarily complicated things

But don't force cat references.

One or two subtle cat-perspective moments are enough.

==================================================
PRODUCT REVEAL
==================================================

Do not reveal the product in Part 1.

Usually reveal it around Part 4–6.

Use:

{{PRODUCT_NAME}}

exactly once.

Then use:

{{FACT_1}}

exactly once.

The verified fact should feel like information Sofian has noticed,
not like a catalogue specification dump.

==================================================
ENDING
==================================================

Do not end with:

"link di bio"

"klik link"

"beli sekarang"

"jangan lepaskan"

"wajib beli"

Instead, end naturally.

Sofian can simply:

- move on
- make a small observation
- think about travel
- mention food
- joke about humans
- leave the thought hanging

==================================================
OUTPUT
==================================================

Return ONLY the story.

No JSON.

No markdown.

No explanation.

No hashtags.

No URL.

Exactly:

PART 1: ...

PART 2: ...

PART 3: ...

PART 4: ...

PART 5: ...

PART 6: ...

PART 7: ...

PART 8: ...

6–10 parts total.
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

    const response =
        await fetch(
            url,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
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

                        temperature:
                            0.55

                    }

                })
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data?.error?.message ||
            "Gemini request failed."
        );
    }


    const text =
        data
            ?.candidates?.[0]
            ?.content
            ?.parts?.[0]
            ?.text;


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


    const response =
        await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

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
                        0.55,

                    messages: [

                        {
                            role: "user",

                            content:
                                prompt

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
        data
            ?.choices?.[0]
            ?.message
            ?.content;


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

    let geminiError =
        null;


    // GEMINI FIRST

    try {

        const text =
            await callGemini(
                prompt
            );


        return {

            provider:
                "gemini",

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
            await callOpenRouter(
                prompt
            );


        return {

            provider:
                "openrouter",

            text

        };

    } catch (error) {

        throw new Error(

            `Both AI providers failed. Gemini: ${geminiError?.message || "unknown"} | OpenRouter: ${error.message}`

        );

    }
}


// ============================================================
// PARSE STORY
// ============================================================

function parseStory(text) {

    if (!text) {

        throw new Error(
            "AI returned empty story."
        );
    }


    let cleaned =
        String(text)
            .trim();


    // Remove markdown fences if AI accidentally adds them.

    cleaned =
        cleaned
            .replace(
                /^```(?:text)?\s*/i,
                ""
            )
            .replace(
                /\s*```$/i,
                ""
            )
            .trim();


    const lines =
        cleaned
            .split(/\r?\n/)
            .map(
                line =>
                    line.trim()
            )
            .filter(Boolean);


    const parts = [];


    for (
        const line of lines
    ) {

        const match =
            line.match(
                /^PART\s*\d+\s*:\s*(.*)$/i
            );


        if (
            match &&
            match[1].trim()
        ) {

            parts.push(
                match[1].trim()
            );

        }

    }


    // Fallback numbering

    if (
        parts.length === 0
    ) {

        for (
            const line of lines
        ) {

            const match =
                line.match(
                    /^\d+\s*[\.:)\-]\s*(.*)$/
                );


            if (
                match &&
                match[1].trim()
            ) {

                parts.push(
                    match[1].trim()
                );

            }

        }

    }


    if (
        parts.length < 6 ||
        parts.length > 10
    ) {

        console.error(
            "RAW AI STORY:"
        );

        console.error(
            cleaned
        );


        throw new Error(
            `AI story must contain 6–10 parts. Found ${parts.length}.`
        );

    }


    return parts;
}


// ============================================================
// STORY VALIDATION
// ============================================================

function validateStoryShell(parts) {

    if (
        !Array.isArray(parts)
    ) {

        throw new Error(
            "Invalid story structure."
        );

    }


    const story =
        parts.join("\n");


    // URL protection

    if (
        containsUrl(
            story
        )
    ) {

        throw new Error(
            "AI generated a URL."
        );

    }


    // Language protection

    if (
        containsBannedIndonesian(
            story
        )
    ) {

        throw new Error(
            "AI generated Indonesian-style wording."
        );

    }


    // Fake experience

    if (
        containsFakeExperience(
            story
        )
    ) {

        throw new Error(
            "AI generated fake personal experience."
        );

    }


    // Invented specifics

    if (
        containsInventedSpecifics(
            story
        )
    ) {

        throw new Error(
            "AI generated unsupported specific travel/product claims."
        );

    }


    // Product placeholder

    const productCount =
        (
            story.match(
                /\{\{PRODUCT_NAME\}\}/g
            ) || []
        ).length;


    if (
        productCount !== 1
    ) {

        throw new Error(
            `{{PRODUCT_NAME}} must appear exactly once. Found ${productCount}.`
        );

    }


    // Fact 1

    const fact1Count =
        (
            story.match(
                /\{\{FACT_1\}\}/g
            ) || []
        ).length;


    if (
        fact1Count !== 1
    ) {

        throw new Error(
            `{{FACT_1}} must appear exactly once. Found ${fact1Count}.`
        );

    }


    return true;
}


// ============================================================
// FACT INJECTION
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


    if (
        facts.length === 0
    ) {

        throw new Error(
            "Product description contains no usable facts."
        );

    }


    let story =
        parts.join("\n");


    // Product name

    story =
        story.replace(
            /\{\{PRODUCT_NAME\}\}/g,
            productName
        );


    // Facts

    facts.forEach(
        (
            fact,
            index
        ) => {

            const placeholder =
                `{{FACT_${index + 1}}}`;


            story =
                story.replace(
                    new RegExp(
                        placeholder.replace(
                            /[.*+?^${}()|[\]\\]/g,
                            "\\$&"
                        ),
                        "g"
                    ),
                    fact
                );

        }
    );


    // Make sure nothing is left unresolved.

    const unresolved =
        story.match(
            /\{\{[^}]+\}\}/g
        );


    if (
        unresolved &&
        unresolved.length
    ) {

        throw new Error(
            `Unresolved placeholder: ${unresolved[0]}`
        );

    }


    return story;
}


// ============================================================
// FINAL VALIDATION
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


    if (
        containsUrl(
            story
        )
    ) {

        throw new Error(
            "Unexpected URL found in final story."
        );

    }


    if (
        containsBannedIndonesian(
            story
        )
    ) {

        throw new Error(
            "Indonesian-style wording found in final story."
        );

    }


    if (
        containsFakeExperience(
            story
        )
    ) {

        throw new Error(
            "Fake personal experience found in final story."
        );

    }


    if (
        !story.includes(
            productName
        )
    ) {

        throw new Error(
            "Product name missing."
        );

    }


    const lines =
        story
            .split("\n")
            .filter(Boolean);


    if (
        lines.length < 6 ||
        lines.length > 10
    ) {

        throw new Error(
            `Final story must contain 6–10 parts. Got ${lines.length}.`
        );

    }


    return true;
}


// ============================================================
// AFFILIATE URL
// ============================================================

function injectAffiliateUrl(
    story,
    affiliateUrl
) {

    if (!affiliateUrl) {

        throw new Error(
            "affiliateUrl is required."
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


    if (
        containsUrl(
            story
        )
    ) {

        throw new Error(
            "Story already contains a URL."
        );

    }


    const parts =
        story
            .split("\n")
            .filter(Boolean);


    parts[
        parts.length - 1
    ] =
        `${parts[parts.length - 1]}\n${affiliateUrl}`;


    return parts.join("\n");
}


// ============================================================
// GENERATE STORY
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


    const prompt =
        buildWriterPrompt(
            productName
        );


    const ai =
        await callAI(
            prompt
        );


    console.log(
        "AI provider:",
        ai.provider
    );


    const parts =
        parseStory(
            ai.text
        );


    validateStoryShell(
        parts
    );


    const story =
        injectProductFacts(
            parts,
            productName,
            productDescription
        );


    validateFinalStory(
        story,
        productName
    );


    return {

        success: true,

        provider:
            ai.provider,

        story

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

            app:
                "StoryAff AI",

            version:
                VERSION,

            status:
                "online"

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

            status:
                "healthy",

            version:
                VERSION,

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
                    VERSION,

                provider:
                    result.provider,

                story:
                    result.story

            });


        } catch (error) {

            console.error(
                "/api/ai/test:",
                error.message
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


            const result =
                await generateStory({

                    productName,

                    productDescription

                });


            const finalStory =
                injectAffiliateUrl(
                    result.story,
                    affiliateUrl
                );


            const urls =
                finalStory.match(
                    /https?:\/\/[^\s]+/gi
                ) || [];


            if (
                urls.length !== 1
            ) {

                throw new Error(
                    `Affiliate URL protection failed. Expected 1 URL, found ${urls.length}.`
                );

            }


            return res.json({

                success: true,

                version:
                    VERSION,

                provider:
                    result.provider,

                story:
                    finalStory,

                affiliateUrlInjected:
                    true,

                urlCount:
                    urls.length

            });


        } catch (error) {

            console.error(
                "/api/ai/generate:",
                error.message
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
// START
// ============================================================

app.listen(
    PORT,
    () => {

        console.log(
            `StoryAff AI v${VERSION} running on port ${PORT}`
        );

    }
);
