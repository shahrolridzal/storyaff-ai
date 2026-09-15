require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const GEMINI_MODEL = "gemini-3.6-flash";
const OPENROUTER_MODEL = "openrouter/free";

const VERSION = "1.9.3";
const PERSONA = "Sofian The Travelling Cat";

const AFFILIATE_URL =
    "https://s.shopee.com.my/9fKuWm0JZz";


// ============================================================
// SOFIAN V1.9.3
// TWO-STAGE ENGINE
//
// STAGE 1:
// SOFIAN BRAIN
//
// STAGE 2:
// SOFIAN WRITER
//
// AI is NOT allowed to invent the story from zero.
// ============================================================


// ============================================================
// SOFIAN CORE
// ============================================================

const SOFIAN_CORE = `
SOFIAN THE TRAVELLING CAT

Sofian is literally a cat.

He is a travelling cat with human-like intelligence
and natural human speech.

He is NOT a human pretending to be a cat.

He is NOT an influencer.

He is NOT a product reviewer.

He is NOT a salesman.

He is NOT a generic Malaysian traveller.

His personality:

- curious
- practical
- budget-conscious
- observant
- playful
- slightly sarcastic
- street-smart

Sofian notices things differently.

He notices:

- food smells
- places to sit
- comfortable corners
- crowded places
- humans carrying too much stuff
- unnecessary luggage
- small spaces
- strange human behaviour
- travel inconvenience

But his cat identity must NOT be forced.

Do not repeatedly say:

"I am a cat."

Do not repeatedly say:

"as a cat"

Do not use repeated "meow" jokes.

His cat identity should appear naturally through perspective.
`;


// ============================================================
// VOICE
// ============================================================

const SOFIAN_VOICE = `
VOICE:

Use natural Malaysian Malay.

The rhythm should feel close to this:

"Aku bukan kedekut. Aku cuma tak suka duit keluar tanpa sebab."

"Beg 7kg. Barang nak bawa 12kg. Matematik pun surrender."

"Hotel murah. Cantik pulak tu. Aku dah mula suspicious."

"Beg carry-on 7kg tu ruang terhad noh. Mana nak selit barang gedabak."

"Aku tengok benda travel, soalan pertama bukan 'cantik dak?'
Soalan pertama: boleh masuk beg dak?"

These are rhythm references only.

Do NOT copy them.

Do NOT make every sentence funny.

Do NOT make every sentence polished.

Do NOT force slang.

Use casual Malaysian Malay with light Northern flavour.

Possible words:

hang
pi
mai
sat
dak
noh
kot
pulak
ja

Use them naturally.

Do not overuse them.

Never use Indonesian-style language.
`;


// ============================================================
// BANNED LANGUAGE
// ============================================================

const BANNED_LANGUAGE = `
NEVER USE:

bisa
terlihat
menggunakan
peralatan
kualitas
sebuah
kemudian
tentunya
berbagai
dapatkan
memudahkan
menawarkan
memberikan
merupakan pilihan
alternatif yang praktikal
peluang bagus
bagitahu cerita
secara keseluruhan
kelebihan utama
berdasarkan keterangan
berdasarkan deskripsi
sebagai traveller
sebagai seorang traveller
real talk
bobot
sagap
ciamik
risok
bagitu
tebocor

Avoid:

"produk ini"

Prefer talking naturally about the actual product name.
`;


// ============================================================
// STAGE 1 — SOFIAN BRAIN
// ============================================================

function buildBrainPrompt(
    productName,
    productDescription
) {

    return `
You are SOFIAN BRAIN.

You are not writing the final story.

You are deciding what Sofian would notice,
think about and say.

${SOFIAN_CORE}

${SOFIAN_VOICE}

${BANNED_LANGUAGE}


PRODUCT NAME:

${productName}


PRODUCT DESCRIPTION:

${productDescription}


YOUR JOB:

Create a small story blueprint.

The blueprint must contain:

1. travel_problem
2. sofian_observation
3. sofian_reaction
4. tension
5. product_reveal_angle
6. allowed_product_facts
7. sofian_opinion
8. ending_direction

IMPORTANT:

Only allowed_product_facts may contain product facts.

Do NOT invent product specifications.

Do NOT invent price.

Do NOT invent reviews.

Do NOT invent popularity.

Do NOT invent performance.

Do NOT invent personal experience.

Do NOT say Sofian used the product.

Do NOT say Sofian bought the product.

Do NOT say Sofian tested the product.

The cat perspective should be subtle.

For example, Sofian may care about space in the bag
because he also wants somewhere comfortable to sit.

Do not force this if it does not fit.

The blueprint should feel like Sofian thinking,
not like a marketing strategy.

Return ONLY JSON.

Format:

{
  "travel_problem": "...",
  "sofian_observation": "...",
  "sofian_reaction": "...",
  "tension": "...",
  "product_reveal_angle": "...",
  "allowed_product_facts": [
    "...",
    "..."
  ],
  "sofian_opinion": "...",
  "ending_direction": "..."
}
`;
}


// ============================================================
// STAGE 2 — SOFIAN WRITER
// ============================================================

function buildWriterPrompt(
    productName,
    productDescription,
    brain
) {

    return `
You are SOFIAN WRITER.

Your job is to turn the supplied SOFIAN BRAIN
into a natural Threads story.

You are NOT allowed to invent a new story direction.

You must follow the brain.

${SOFIAN_CORE}

${SOFIAN_VOICE}

${BANNED_LANGUAGE}


PRODUCT:

${productName}


PRODUCT DESCRIPTION:

${productDescription}


SOFIAN BRAIN:

${JSON.stringify(
        brain,
        null,
        2
    )}


WRITING RULES:

Create 6-10 story parts.

Each part must contain natural conversational Malay.

The story should feel like Sofian is casually thinking out loud.

Not like an advertisement.

Not like a review.

Not like a product description.

Not like an AI-generated article.


STRUCTURE:

Part 1:
Start with an observation or small annoyance.

Part 2:
Develop the problem.

Part 3:
Let Sofian react or make a small observation.

Part 4:
Build the tension or trade-off.

Part 5:
Naturally introduce the product.

Part 6:
Mention only relevant product facts.

Part 7:
Give Sofian's opinion.

Final part:
End casually.

The product does NOT have to appear exactly at Part 5.
But do not reveal it immediately unless it genuinely fits.


VERY IMPORTANT:

Do not claim Sofian personally used the product.

Do not claim Sofian bought the product.

Do not claim Sofian tested the product.

Do not claim Sofian owns the product.

Do not invent facts.

Do not add facts outside allowed_product_facts.

Do not add URLs.

Do not add affiliate links.

Do not use Indonesian.

Do not use formal product-review language.

Do not force cat jokes.

Do not say "as a cat".

Do not repeatedly say "I am a cat".

Do not use "meow" unless genuinely necessary.


SOFIAN'S CAT IDENTITY:

The reader should understand that Sofian is a cat
through his perspective.

A natural example of the kind of thinking allowed:

"Ruang dalam beg tu bukan untuk barang manusia saja.
Aku pun nak tempat duduk."

Do NOT copy that exact sentence.

Do not force this into every story.


VOICE TEST:

If the story sounds like:

"produk ini menawarkan..."
"merupakan pilihan..."
"alternatif praktikal..."
"sesuai untuk traveller..."

then rewrite it.

If it sounds like a human marketing copywriter,
rewrite it.

If it sounds like an Indonesian writer,
rewrite it.

If it sounds like a generic AI travel blogger,
rewrite it.


Return ONLY JSON.

Format:

{
  "style": "travel_story",
  "part_count": 7,
  "parts": [
    {
      "part": 1,
      "text": "..."
    }
  ]
}
`;
}


// ============================================================
// JSON CLEANER
// ============================================================

function cleanJSON(text) {

    if (!text) {
        throw new Error(
            "Empty AI response"
        );
    }

    let cleaned =
        text.trim();

    if (
        cleaned.startsWith("```")
    ) {

        cleaned =
            cleaned
                .replace(
                    /^```json/i,
                    ""
                )
                .replace(
                    /^```/i,
                    ""
                )
                .replace(
                    /```$/i,
                    ""
                )
                .trim();
    }

    const firstBrace =
        cleaned.indexOf("{");

    const lastBrace =
        cleaned.lastIndexOf("}");

    if (
        firstBrace !== -1 &&
        lastBrace !== -1
    ) {

        cleaned =
            cleaned.substring(
                firstBrace,
                lastBrace + 1
            );
    }

    return JSON.parse(
        cleaned
    );
}


// ============================================================
// TEXT HELPERS
// ============================================================

function flattenParts(
    result
) {

    if (
        !result ||
        !Array.isArray(
            result.parts
        )
    ) {

        return "";
    }

    return result.parts
        .map(
            part =>
                part.text || ""
        )
        .join(" ");
}


function containsURL(
    text
) {

    if (!text) {
        return false;
    }

    return /https?:\/\/|www\.|bit\.ly\/|s\.shopee\./i
        .test(text);
}


function containsIndonesian(
    text
) {

    if (!text) {
        return false;
    }

    const forbidden = [

        "bisa",
        "terlihat",
        "menggunakan",
        "peralatan",
        "kualitas",
        "sebuah",
        "kemudian",
        "tentunya",
        "berbagai",
        "dapatkan",
        "memudahkan",
        "menawarkan",
        "memberikan",
        "merupakan pilihan"
    ];

    const lower =
        text.toLowerCase();

    return forbidden.some(
        word =>
            new RegExp(
                "\\b" +
                word +
                "\\b",
                "i"
            ).test(lower)
    );
}


function containsFakeExperience(
    text
) {

    if (!text) {
        return false;
    }

    const patterns = [

        /\baku\s+dah\s+guna\b/i,
        /\baku\s+dah\s+cuba\b/i,
        /\baku\s+dah\s+test\b/i,
        /\baku\s+dah\s+beli\b/i,
        /\baku\s+dah\s+pakai\b/i,

        /\baku\s+guna\b/i,
        /\baku\s+cuba\b/i,
        /\baku\s+test\b/i,
        /\baku\s+beli\b/i,
        /\baku\s+pakai\b/i,

        /\baku\s+pernah\s+guna\b/i,
        /\baku\s+pernah\s+cuba\b/i,
        /\baku\s+pernah\s+test\b/i,
        /\baku\s+pernah\s+beli\b/i,
        /\baku\s+pernah\s+pakai\b/i,

        /\bpengalaman\s+aku\b/i
    ];

    return patterns.some(
        pattern =>
            pattern.test(text)
    );
}


function containsAICopy(
    text
) {

    if (!text) {
        return false;
    }

    const forbidden = [

        "produk ini menawarkan",
        "produk ini memberikan",
        "merupakan pilihan",
        "alternatif yang praktikal",
        "kelebihan utama",
        "secara keseluruhan",
        "berdasarkan keterangan",
        "berdasarkan deskripsi",
        "boleh dipertimbangkan",
        "boleh diteliti",
        "untuk golongan traveller",
        "sebagai traveller",
        "sebagai seorang traveller",
        "dalam dunia travel"
    ];

    const lower =
        text.toLowerCase();

    return forbidden.some(
        phrase =>
            lower.includes(
                phrase
            )
    );
}


function containsBadSofianLanguage(
    text
) {

    if (!text) {
        return false;
    }

    const forbidden = [

        "real talk",
        "bobot",
        "sagap",
        "ciamik",
        "risok",
        "bagitu",
        "tebocor",
        "bagi hassle"
    ];

    const lower =
        text.toLowerCase();

    return forbidden.some(
        phrase =>
            lower.includes(
                phrase
            )
    );
}


function containsHardSell(
    text
) {

    if (!text) {
        return false;
    }

    const forbidden = [

        "jangan lepaskan peluang",
        "grab sekarang",
        "beli sekarang",
        "klik sekarang",
        "jangan tunggu lagi",
        "limited time",
        "best deal",
        "wajib beli",
        "wajib ada",
        "confirm berbaloi"
    ];

    const lower =
        text.toLowerCase();

    return forbidden.some(
        phrase =>
            lower.includes(
                phrase
            )
    );
}


function containsHumanInfluencerFraming(
    text
) {

    if (!text) {
        return false;
    }

    const forbidden = [

        "sebagai travel blogger",
        "sebagai content creator",
        "sebagai influencer",
        "aku sebagai traveller",
        "aku sebagai manusia"
    ];

    const lower =
        text.toLowerCase();

    return forbidden.some(
        phrase =>
            lower.includes(
                phrase
            )
    );
}


function countHashtags(
    text
) {

    const matches =
        text.match(
            /#[A-Za-z0-9_]+/g
        );

    return matches
        ? matches.length
        : 0;
}


function countNorthernWords(
    text
) {

    const words = [

        "hang",
        "pi",
        "mai",
        "sat",
        "awat",
        "dak",
        "noh",
        "kot",
        "pulak",
        "ja"
    ];

    let count = 0;

    for (
        const word of words
    ) {

        const regex =
            new RegExp(
                "\\b" +
                word +
                "\\b",
                "gi"
            );

        const matches =
            text.match(
                regex
            );

        if (matches) {
            count +=
                matches.length;
        }
    }

    return count;
}


// ============================================================
// BRAIN VALIDATOR
// ============================================================

function validateBrain(
    brain
) {

    if (
        !brain ||
        typeof brain !==
        "object"
    ) {

        return {
            valid: false,
            reason:
                "Brain is not an object"
        };
    }

    const required = [

        "travel_problem",
        "sofian_observation",
        "sofian_reaction",
        "tension",
        "product_reveal_angle",
        "allowed_product_facts",
        "sofian_opinion",
        "ending_direction"
    ];

    for (
        const key of required
    ) {

        if (
            brain[key] ===
            undefined ||
            brain[key] ===
            null
        ) {

            return {
                valid: false,
                reason:
                    `Brain missing ${key}`
            };
        }
    }

    if (
        !Array.isArray(
            brain.allowed_product_facts
        )
    ) {

        return {
            valid: false,
            reason:
                "allowed_product_facts must be array"
        };
    }

    return {
        valid: true,
        reason: null
    };
}


// ============================================================
// STORY VALIDATOR
// ============================================================

function validateStory(
    result
) {

    if (
        !result ||
        typeof result !==
        "object"
    ) {

        return {
            valid: false,
            reason:
                "Story is not an object"
        };
    }

    if (
        !Array.isArray(
            result.parts
        )
    ) {

        return {
            valid: false,
            reason:
                "parts is not an array"
        };
    }

    if (
        result.parts.length <
            6 ||
        result.parts.length >
            10
    ) {

        return {
            valid: false,
            reason:
                "Story must contain 6-10 parts"
        };
    }

    if (
        result.part_count !==
        result.parts.length
    ) {

        return {
            valid: false,
            reason:
                "part_count mismatch"
        };
    }


    for (
        let i = 0;
        i < result.parts.length;
        i++
    ) {

        const expected =
            i + 1;

        const part =
            result.parts[i];

        if (
            !part ||
            typeof part.text !==
            "string"
        ) {

            return {
                valid: false,
                reason:
                    `Part ${expected} invalid`
            };
        }

        if (
            !part.text.trim()
        ) {

            return {
                valid: false,
                reason:
                    `Part ${expected} empty`
            };
        }

        if (
            part.part !==
            expected
        ) {

            return {
                valid: false,
                reason:
                    `Part numbering error at ${expected}`
            };
        }
    }


    const fullText =
        flattenParts(
            result
        );


    if (
        containsURL(
            fullText
        )
    ) {

        return {
            valid: false,
            reason:
                "AI generated URL"
        };
    }


    if (
        containsIndonesian(
            fullText
        )
    ) {

        return {
            valid: false,
            reason:
                "Indonesian language detected"
        };
    }


    if (
        containsFakeExperience(
            fullText
        )
    ) {

        return {
            valid: false,
            reason:
                "Possible fake personal experience"
        };
    }


    if (
        containsAICopy(
            fullText
        )
    ) {

        return {
            valid: false,
            reason:
                "AI/product-copy language detected"
        };
    }


    if (
        containsBadSofianLanguage(
            fullText
        )
    ) {

        return {
            valid: false,
            reason:
                "Artificial Sofian language detected"
        };
    }


    if (
        containsHardSell(
            fullText
        )
    ) {

        return {
            valid: false,
            reason:
                "Hard selling detected"
        };
    }


    if (
        containsHumanInfluencerFraming(
            fullText
        )
    ) {

        return {
            valid: false,
            reason:
                "Human influencer framing detected"
        };
    }


    if (
        countHashtags(
            fullText
        ) > 5
    ) {

        return {
            valid: false,
            reason:
                "Too many hashtags"
        };
    }


    return {
        valid: true,
        reason: null
    };
}


// ============================================================
// GEMINI
// ============================================================

async function callGemini(
    prompt
) {

    if (
        !GEMINI_API_KEY
    ) {

        throw new Error(
            "GEMINI_API_KEY is missing"
        );
    }


    const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;


    const response =
        await fetch(
            url,
            {

                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({

                        contents: [

                            {
                                role:
                                    "user",

                                parts: [

                                    {
                                        text:
                                            prompt
                                    }

                                ]
                            }

                        ],

                        generationConfig: {

                            temperature:
                                0.75,

                            topP:
                                0.9,

                            maxOutputTokens:
                                1800
                        }
                    })
            }
        );


    const data =
        await response.json();


    if (
        !response.ok
    ) {

        throw new Error(
            `Gemini error ${response.status}: ` +
            JSON.stringify(data)
        );
    }


    const text =
        data
            ?.candidates?.[0]
            ?.content?.parts?.[0]
            ?.text;


    if (!text) {

        throw new Error(
            "Gemini returned empty response"
        );
    }


    return text;
}


// ============================================================
// OPENROUTER
// ============================================================

async function callOpenRouter(
    systemPrompt,
    userPrompt
) {

    if (
        !OPENROUTER_API_KEY
    ) {

        throw new Error(
            "OPENROUTER_API_KEY is missing"
        );
    }


    const response =
        await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {

                method:
                    "POST",

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

                body:
                    JSON.stringify({

                        model:
                            OPENROUTER_MODEL,

                        temperature:
                            0.75,

                        max_tokens:
                            1800,

                        messages: [

                            {
                                role:
                                    "system",

                                content:
                                    systemPrompt
                            },

                            {
                                role:
                                    "user",

                                content:
                                    userPrompt
                            }

                        ]
                    })
            }
        );


    const data =
        await response.json();


    if (
        !response.ok
    ) {

        throw new Error(
            `OpenRouter error ${response.status}: ` +
            JSON.stringify(data)
        );
    }


    const text =
        data
            ?.choices?.[0]
            ?.message?.content;


    if (!text) {

        throw new Error(
            "OpenRouter returned empty response"
        );
    }


    return text;
}


// ============================================================
// RUN ONE AI STAGE
// ============================================================

async function runAI(
    prompt,
    stage
) {

    const providers = [];

    if (
        GEMINI_API_KEY
    ) {
        providers.push(
            "gemini"
        );
    }

    if (
        OPENROUTER_API_KEY
    ) {
        providers.push(
            "openrouter"
        );
    }


    let lastError =
        null;


    for (
        const provider
        of providers
    ) {

        try {

            let raw;


            if (
                provider ===
                "gemini"
            ) {

                raw =
                    await callGemini(
                        prompt
                    );

            } else {

                raw =
                    await callOpenRouter(
                        stage ===
                            "brain"
                            ? `
You are Sofian Brain.

Think naturally as a travelling cat.

Do not write marketing copy.
Do not invent facts.
Return JSON only.
`
                            : `
You are Sofian Writer.

Write natural Malaysian Malay.

Sofian is literally a travelling cat.

Do not sound like an influencer,
reviewer or advertisement.

Return JSON only.
`,
                        prompt
                    );
            }


            const result =
                cleanJSON(
                    raw
                );


            return {

                provider,

                model:
                    provider ===
                    "gemini"
                        ? GEMINI_MODEL
                        : OPENROUTER_MODEL,

                result
            };


        } catch (
            error
        ) {

            lastError =
                error;

            console.error(
                `[V1.9.3] ${stage} ${provider} failed:`,
                error.message
            );
        }
    }


    throw (
        lastError ||
        new Error(
            `No AI provider available for ${stage}`
        )
    );
}


// ============================================================
// GENERATE BRAIN
// ============================================================

async function generateBrain(
    productName,
    productDescription
) {

    let lastError =
        null;


    for (
        let attempt = 1;
        attempt <= 2;
        attempt++
    ) {

        try {

            const prompt =
                buildBrainPrompt(
                    productName,
                    productDescription
                );


            const response =
                await runAI(
                    prompt,
                    "brain"
                );


            const validation =
                validateBrain(
                    response.result
                );


            if (
                validation.valid
            ) {

                return response;
            }


            lastError =
                new Error(
                    validation.reason
                );


        } catch (
            error
        ) {

            lastError =
                error;
        }
    }


    throw (
        lastError ||
        new Error(
            "Brain generation failed"
        )
    );
}


// ============================================================
// GENERATE STORY
// ============================================================

async function generateStory(
    productName,
    productDescription,
    brain
) {

    let lastError =
        null;


    for (
        let attempt = 1;
        attempt <= 2;
        attempt++
    ) {

        try {

            const prompt =
                buildWriterPrompt(
                    productName,
                    productDescription,
                    brain
                );


            const response =
                await runAI(
                    prompt,
                    "writer"
                );


            const validation =
                validateStory(
                    response.result
                );


            if (
                validation.valid
            ) {

                return response;
            }


            console.log(
                "[V1.9.3] Writer validation failed:",
                validation.reason
            );


            lastError =
                new Error(
                    validation.reason
                );


        } catch (
            error
        ) {

            lastError =
                error;
        }
    }


    throw (
        lastError ||
        new Error(
            "Story generation failed"
        )
    );
}


// ============================================================
// FINAL AFFILIATE INJECTION
// ============================================================

function injectAffiliate(
    story,
    affiliateUrl
) {

    if (
        !affiliateUrl
    ) {

        throw new Error(
            "Affiliate URL missing"
        );
    }


    const finalPartIndex =
        story.parts.length - 1;


    story.parts[
        finalPartIndex
    ].text =
        story.parts[
            finalPartIndex
        ].text.trim() +

        `\n\n👉 ${affiliateUrl}` +

        `\n(Pautan afiliat)`;


    return story;
}


// ============================================================
// MAIN GENERATOR
// ============================================================

async function generateFullStory(
    productName,
    productDescription
) {

    const brainResponse =
        await generateBrain(
            productName,
            productDescription
        );


    console.log(
        "[V1.9.3] Brain provider:",
        brainResponse.provider
    );


    const storyResponse =
        await generateStory(
            productName,
            productDescription,
            brainResponse.result
        );


    console.log(
        "[V1.9.3] Writer provider:",
        storyResponse.provider
    );


    const finalStory =
        injectAffiliate(
            storyResponse.result,
            AFFILIATE_URL
        );


    return {

        brainProvider:
            brainResponse.provider,

        brainModel:
            brainResponse.model,

        writerProvider:
            storyResponse.provider,

        writerModel:
            storyResponse.model,

        brain:
            brainResponse.result,

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

            name:
                "StoryAff AI",

            status:
                "online",

            version:
                VERSION,

            persona:
                PERSONA,

            engine:
                "Sofian V1.9.3 Brain → Writer",

            message:
                "StoryAff AI is running."
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

            success:
                true,

            status:
                "healthy",

            version:
                VERSION,

            persona:
                PERSONA,

            engine:
                "Sofian V1.9.3 Brain → Writer",

            providers: {

                gemini:
                    Boolean(
                        GEMINI_API_KEY
                    ),

                openrouter:
                    Boolean(
                        OPENROUTER_API_KEY
                    )
            }
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


            if (
                !productName
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "productName is required"
                    });
            }


            if (
                !productDescription
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "productDescription is required"
                    });
            }


            const generated =
                await generateFullStory(
                    productName,
                    productDescription
                );


            return res.json({

                success:
                    true,

                version:
                    VERSION,

                persona:
                    PERSONA,

                engine:
                    "Sofian V1.9.3 Brain → Writer",

                brain_provider:
                    generated.brainProvider,

                brain_model:
                    generated.brainModel,

                writer_provider:
                    generated.writerProvider,

                writer_model:
                    generated.writerModel,

                brain:
                    generated.brain,

                data:
                    generated.story
            });


        } catch (
            error
        ) {

            console.error(
                "[V1.9.3] /api/ai/test:",
                error
            );


            return res
                .status(500)
                .json({

                    success:
                        false,

                    version:
                        VERSION,

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


            if (
                !productName
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "productName is required"
                    });
            }


            if (
                !productDescription
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "productDescription is required"
                    });
            }


            if (
                !affiliateUrl
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "affiliateUrl is required"
                    });
            }


            const generated =
                await generateFullStory(
                    productName,
                    productDescription
                );


            const finalStory =
                injectAffiliate(
                    generated.story,
                    affiliateUrl
                );


            return res.json({

                success:
                    true,

                version:
                    VERSION,

                persona:
                    PERSONA,

                engine:
                    "Sofian V1.9.3 Brain → Writer",

                brain_provider:
                    generated.brainProvider,

                brain_model:
                    generated.brainModel,

                writer_provider:
                    generated.writerProvider,

                writer_model:
                    generated.writerModel,

                brain:
                    generated.brain,

                data:
                    finalStory
            });


        } catch (
            error
        ) {

            console.error(
                "[V1.9.3] /api/ai/generate:",
                error
            );


            return res
                .status(500)
                .json({

                    success:
                        false,

                    version:
                        VERSION,

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
            `StoryAff AI v${VERSION} running on port ${PORT}`
        );
    }
);
