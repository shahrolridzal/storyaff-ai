require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const GEMINI_MODEL = "gemini-3.6-flash";
const OPENROUTER_MODEL = "openrouter/free";

const VERSION = "1.9.5";


// ============================================================
// STORYAFF AI
// V1.9.5
//
// AI:
// - Plain text only
// - No JSON
// - No URLs
// - No affiliate links
// - No product description
//
// BACKEND:
// - Parses story
// - Injects verified product facts
// - Injects affiliate URL once
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
            `\\b${word}\\b`,
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

He is NOT a human traveller.

He is a cat with human-like intelligence,
thoughts, opinions, curiosity and storytelling ability.

His cat identity naturally exists in his worldview.

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
- troublesome situations

Sofian can be:

- curious
- lazy
- practical
- sarcastic
- observant
- slightly mischievous
- budget-conscious

Do NOT repeatedly say "as a cat".

Do NOT make him meow every sentence.

Do NOT turn him into a human influencer called Sofian.

Do NOT make the cat identity merely visual.

The reader should naturally understand that the narrator is a travelling cat.
`;


// ============================================================
// SOFIAN VOICE
// ============================================================

const SOFIAN_VOICE = `

SOFIAN VOICE

Natural Malaysian Malay.

Casual.

Conversational.

Slight Malaysian Manglish is okay.

Light Northern Malaysian flavour is okay.

Possible words:

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

Do not put slang into every sentence.

Do not try too hard to sound Northern.

The voice should feel like a Malaysian friend talking naturally.

Not an influencer.

Not a copywriter.

Not corporate.

Not motivational.

Not polished advertising copy.

Humour comes from observation.

Personality comes from the way Sofian thinks.

Use short and medium sentences.

Avoid unnecessary explanations.

Avoid generic marketing phrases.

VOICE BENCHMARK:

"Hang pernah tak tengok balik video travel hang, lepastu rasa pening sebab footage bergegar teruk?"

"Niat pi melancong tu nak simpan kenangan comel-comel. Tapi bila playback balik, rasa macam naik roller coaster."

"Aku bukan kedekut. Aku cuma tak suka duit keluar tanpa sebab."

"Aku tengok benda travel, soalan pertama bukan cantik dak? Soalan pertama: boleh masuk beg dak?"

"Beg 7kg. Barang nak bawa 12kg. Matematik pun surrender."

Use the examples as voice references only.
Do not copy them into every story.
`;


// ============================================================
// TRUTH RULES
// ============================================================

const TRUTH_RULES = `

TRUTH RULES

Never fabricate facts.

Never fabricate personal experience.

Sofian must NOT claim he personally:

- bought
- used
- tested
- owned
- tried
- carried
- travelled with
- reviewed

the product unless explicitly provided.

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
- testimonials
- locations

Do not invent other people using the product.

Do not make unsupported comparisons.

Do not generate URLs.

Do not generate affiliate links.

Do not generate hashtags.

Do not use hard-sell language.

Avoid:

"wajib beli"
"confirm berbaloi"
"confirm puas hati"
"best gila"
"terbaik"
"number one"
"jangan lepaskan"

unless explicitly supported.

The story should feel like storytelling,
not advertising.
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

${TRUTH_RULES}

PRODUCT NAME:

${productName}

IMPORTANT:

You are NOT given the product description.

Therefore you MUST NOT invent what the product does.

You MUST NOT invent product specifications.

You MUST NOT invent product benefits.

You MUST NOT invent product performance.

The backend will insert the real product facts later.

You have two special placeholders:

{{PRODUCT_NAME}}

{{FACT_1}}

OPTIONAL:

{{FACT_2}}

{{FACT_3}}

{{FACT_4}}

{{FACT_5}}

Use:

{{PRODUCT_NAME}}

exactly ONCE.

Use:

{{FACT_1}}

exactly ONCE.

You may use FACT_2, FACT_3, FACT_4 or FACT_5
if they naturally fit.

IMPORTANT:

You do not know what the facts contain.

Do not alter them.

Do not explain them.

Simply place the placeholder where the real fact can naturally fit.

==================================================
STORY STRUCTURE
==================================================

Write 6–10 parts.

A natural story usually develops like this:

PART 1
A relatable travel observation or hook.

PART 2
The annoyance/problem becomes clearer.

PART 3
Sofian reacts or thinks about it.

PART 4
A small tension or trade-off.

PART 5
Natural introduction of {{PRODUCT_NAME}}.

PART 6
Use {{FACT_1}} naturally.

PART 7
Sofian gives an opinion based on the travel problem.

PART 8
Soft ending.

You do NOT have to follow this exact structure.

The story must feel spontaneous.

Do not make it sound planned.

Do not explain the product like a catalogue.

Do not repeat the product name.

Do not make every part about the product.

Do not immediately reveal the product in Part 1.

==================================================
SOFIAN CHARACTER
==================================================

Sofian is a travelling cat.

His perspective should sometimes feel slightly different from a human traveller.

He notices things humans ignore.

He thinks about:

- food
- smells
- space
- bags
- comfort
- money
- convenience
- hassle
- strange human behaviour

But do not turn every sentence into a cat joke.

The cat identity should feel natural.

==================================================
VOICE
==================================================

Write like someone casually telling a story to friends.

Not like an advertisement.

Not like an affiliate marketer.

Not like ChatGPT.

Avoid phrases such as:

"Yang menariknya"
"Pada masa kini"
"Ini merupakan"
"Perlu diketahui"
"Secara keseluruhannya"
"Jika anda sedang mencari"
"Pilihan terbaik"
"Sangat sesuai untuk"
"Berbaloi untuk dibeli"

Do not over-explain.

Do not use corporate language.

Do not use Indonesian-style language.

Use Malaysian Malay.

Light Northern flavour only where natural.

==================================================
PERSONAL EXPERIENCE
==================================================

DO NOT say:

"Aku dah guna"
"Aku dah cuba"
"Aku dah test"
"Aku beli"
"Aku pakai"
"Aku pernah guna"
"Aku pernah cuba"
"Aku test"

unless explicitly supplied.

Sofian can have opinions without claiming personal product use.

For example:

"Konsep macam ni nampak masuk akal."

"Kalau fikir pasal ruang beg, benda macam ni memang menarik."

"Idea dia simple."

Those are opinions, not fake experiences.

==================================================
OUTPUT FORMAT
==================================================

Return ONLY the story.

No JSON.

No markdown.

No introduction.

No explanation.

No hashtags.

No URL.

Use exactly this format:

PART 1: [story]

PART 2: [story]

PART 3: [story]

PART 4: [story]

PART 5: [story]

PART 6: [story]

PART 7: [story]

PART 8: [story]

You may produce 6–10 parts.

Nothing before PART 1.

Nothing after the final PART.
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
                    temperature: 0.65
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
                        0.65,

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

    let geminiError = null;

    // GEMINI FIRST

    try {

        const text =
            await callGemini(
                prompt
            );

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
            await callOpenRouter(
                prompt
            );

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
// PARSE PLAIN TEXT STORY
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


    // Remove accidental markdown fences

    cleaned =
        cleaned
            .replace(
                /^```[\s\S]*?\n/i,
                ""
            )
            .replace(
                /\n```$/i,
                ""
            )
            .trim();


    const lines =
        cleaned
            .split(/\r?\n/)
            .map(
                line => line.trim()
            )
            .filter(Boolean);


    const parts = [];


    for (const line of lines) {

        const match =
            line.match(
                /^PART\s*\d+\s*:\s*(.*)$/i
            );


        if (match) {

            const content =
                match[1].trim();


            if (content) {
                parts.push(
                    content
                );
            }
        }
    }


    // If PART format was not followed,
    // try a numbered fallback.

    if (parts.length === 0) {

        for (const line of lines) {

            const match =
                line.match(
                    /^\d+\s*[\.:)\-]\s*(.*)$/
                );


            if (match) {

                const content =
                    match[1].trim();


                if (content) {
                    parts.push(
                        content
                    );
                }
            }
        }
    }


    if (
        parts.length < 6 ||
        parts.length > 10
    ) {

        console.error(
            "RAW STORY FROM AI:"
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
// STORY SHELL VALIDATION
// ============================================================

function validateStoryShell(
    parts
) {

    if (
        !Array.isArray(parts)
    ) {

        throw new Error(
            "Story parser did not return an array."
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


    if (
        containsUrl(
            combined
        )
    ) {

        throw new Error(
            "AI generated a URL."
        );
    }


    if (
        containsBannedIndonesian(
            combined
        )
    ) {

        throw new Error(
            "AI generated Indonesian-style wording."
        );
    }


    if (
        containsFakeExperience(
            combined
        )
    ) {

        throw new Error(
            "AI generated possible fake personal experience."
        );
    }


    const productNameCount =
        (
            combined.match(
                /\{\{PRODUCT_NAME\}\}/g
            ) || []
        ).length;


    if (
        productNameCount !== 1
    ) {

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


    story =
        story.replace(
            /\{\{PRODUCT_NAME\}\}/g,
            productName
        );


    facts.forEach(
        (fact, index) => {

            const placeholder =
                `{{FACT_${index + 1}}}`;


            const escaped =
                placeholder.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );


            story =
                story.replace(
                    new RegExp(
                        escaped,
                        "g"
                    ),
                    fact
                );
        }
    );


    const unresolved =
        story.match(
            /\{\{[^}]+\}\}/g
        );


    if (
        unresolved &&
        unresolved.length > 0
    ) {

        throw new Error(
            `Unresolved placeholder: ${unresolved[0]}`
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


    if (
        containsUrl(
            story
        )
    ) {

        throw new Error(
            "Final story contains an unexpected URL."
        );
    }


    if (
        containsBannedIndonesian(
            story
        )
    ) {

        throw new Error(
            "Final story contains Indonesian-style wording."
        );
    }


    if (
        containsFakeExperience(
            story
        )
    ) {

        throw new Error(
            "Final story contains possible fake personal experience."
        );
    }


    if (
        !story.includes(
            productName
        )
    ) {

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


    if (
        parts.length < 6
    ) {

        throw new Error(
            "Story must contain at least 6 parts."
        );
    }


    parts[
        parts.length - 1
    ] =
        `${parts[parts.length - 1]}\n${affiliateUrl}`;


    return parts.join("\n");
}


// ============================================================
// FULL GENERATION
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


    console.log(
        "Generating Sofian story..."
    );


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


    const finalStory =
        injectProductFacts(
            parts,
            productName,
            productDescription
        );


    validateFinalStory(
        finalStory,
        productName
    );


    return {

        success: true,

        provider:
            ai.provider,

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
                    VERSION,

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
// SERVER START
// ============================================================

app.listen(
    PORT,
    () => {

        console.log(
            `StoryAff AI v${VERSION} running on port ${PORT}`
        );

    }
);
