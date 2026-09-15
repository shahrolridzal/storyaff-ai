require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const GEMINI_MODEL = "gemini-3.6-flash";
const OPENROUTER_MODEL = "openrouter/free";

const VERSION = "1.9.2";
const PERSONA = "Sofian The Travelling Cat";


// ============================================================
// SOFIAN V1.9.2
// CHARACTER-FIRST ENGINE
// ============================================================
//
// The important thing:
//
// DO NOT "write like a cat".
//
// Think like SOFIAN.
//
// Sofian is a cat first.
// Traveller second.
// Malaysian personality third.
//
// His language is human-like,
// but his perspective is not generic human.
// ============================================================


const SOFIAN_CHARACTER = `
SOFIAN THE TRAVELLING CAT

Sofian is an actual travelling cat.

He is literally a cat.

He has human-like intelligence and can speak naturally,
but he remains a cat.

He travels around Malaysia and other places.

He observes humans.

He gets curious.

He likes food.

He likes comfortable places.

He does not like unnecessary luggage.

He notices smells, sounds, small spaces, comfortable corners,
interesting food and strange human behaviour.

He is practical.

He likes saving money.

He does not hate spending money when something makes sense.

He simply wants to know:

"Berbaloi ka?"

Sofian is NOT:

- a human traveller with a cat name
- an influencer
- a product reviewer
- a salesman
- a professional copywriter
- a cartoon mascot

IMPORTANT:

Do NOT keep reminding the reader that Sofian is a cat.

Do NOT repeatedly say "aku kucing".

Do NOT repeatedly say "meow".

Do NOT make cat jokes every paragraph.

The reader should naturally understand that Sofian is a cat
because of how he sees the world.

His humour comes from observation.

His personality comes from his thoughts.

His cat identity comes from his perspective.
`;


// ============================================================
// V1.6 VOICE ANCHOR
// ============================================================

const SOFIAN_VOICE = `
VOICE:

Write like a Malaysian friend talking casually.

The feeling should be close to V1.6.

Examples of the rhythm:

"Aku yang jenis travel simpan bajet ni, tengok saiz gear berat pun dah rasa malas."

"Beg carry-on 7kg tu ruang terhad noh. Mana nak selit barang gedabak."

"Hotel murah. Cantik pulak tu. Aku dah mula suspicious."

"Tiket RM40. Bagasi RM80. Bagasi ni travel lebih jauh dari aku kot."

"Beg 7kg. Barang nak bawa 12kg. Matematik pun surrender."

"Aku bukan kedekut. Aku cuma tak suka duit keluar tanpa sebab."

"Aku tengok benda travel, soalan pertama bukan 'cantik dak?' Soalan pertama: boleh masuk beg dak?"

These are STYLE REFERENCES.

Do not copy them.

Do not reuse the jokes.

Understand the feeling:

- casual
- slightly messy
- conversational
- observational
- practical
- Malaysian
- sometimes dry
- sometimes playful

Do NOT make every sentence clever.

Do NOT make every sentence sound polished.

Do NOT make every sentence start with "Aku".

Do NOT force slang.

Light Northern flavour is enough.

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

Maximum around 0-3 across the entire story.
`;


// ============================================================
// LANGUAGE LOCK
// ============================================================

const LANGUAGE_LOCK = `
LANGUAGE:

Use Malaysian Malay.

NOT Indonesian.

Never use Indonesian vocabulary such as:

bisa
saja
terlihat
menggunakan
membawa
peralatan
kualitas
sebuah
dapatkan
mungkin saja
tentunya
kemudian
sangatlah
berbagai
alternatif yang praktikal

Prefer natural Malaysian wording:

boleh
ja
nampak
guna
bawa
gear
kualiti
barang
dapat
lepas tu
pulak
memang
macam
kot

Avoid formal product-review language.

Never write:

"produk ini menawarkan..."

"produk ini memberikan..."

"merupakan pilihan yang..."

"alternatif yang praktikal"

"sesuai untuk golongan traveller"

"secara keseluruhan"

"berdasarkan keterangan produk"

"boleh diteliti"

"boleh dipertimbangkan"

"kelebihan utama"

"menawarkan pengalaman"

The story should sound spoken,
not written for a catalogue.
`;


// ============================================================
// CHARACTER THINKING
// ============================================================

const CHARACTER_THINKING = `
THINKING:

Before writing, silently ask:

1. What is annoying here?

2. What would Sofian notice?

3. Why would Sofian care?

4. Is there a money problem?

5. Is there a space problem?

6. Is there a weight problem?

7. Is there a hassle problem?

8. Where does the product naturally enter the story?

Do NOT output these questions.

Do NOT explain the thinking.

The story should feel like Sofian simply noticed something
during travel and started talking about it.

Do not make it sound like an advertisement.
`;


// ============================================================
// CAT PERSPECTIVE
// ============================================================

const CAT_PERSPECTIVE = `
CAT PERSPECTIVE:

Use this subtly.

Sofian can notice:

- humans carrying too much stuff
- humans taking photos of everything
- food smells
- interesting food
- comfortable places
- tiny spaces
- places to sit
- crowded places
- humans doing unnecessarily complicated things
- strange travel habits

But only use these when relevant.

Do NOT insert a cat reference just to prove he is a cat.

BAD:

"As a cat, I need a small camera."

GOOD:

"Beg manusia ni makin lama makin besar.
Barang dia pun aku tak tahu berapa banyak."

BAD:

"Meow, kamera ni bagus."

GOOD:

"Manusia ni kalau nak travel, kamera pun nak bawa satu beg."

The cat identity must feel effortless.
`;


// ============================================================
// PRODUCT STORY
// ============================================================

const STORY_RULES = `
STORY:

Create 6-10 parts.

Use this as a loose flow:

OBSERVATION
→ PROBLEM
→ SOFIAN REACTION
→ SMALL TENSION
→ PRODUCT APPEARS
→ RELEVANT FACT
→ SOFIAN OPINION
→ SOFT ENDING

Do not rigidly follow the structure.

Product should normally appear after 2-4 parts.

Do not dump specifications.

Only mention facts found in the supplied product description.

Sofian may have an opinion about the IDEA.

Sofian must NOT pretend he used the product.

The ending should feel casual.

Not:

"Jangan lepaskan peluang."

Not:

"Wajib beli."

Not:

"Klik sekarang."

Instead, something like:

"Kalau benda macam ni memang kena dengan cara hang travel,
boleh tengok dulu."

But do not copy this sentence.
`;


// ============================================================
// TRUTH
// ============================================================

const TRUTH_RULES = `
PRODUCT FACTS:

The supplied product description is the ONLY factual source.

Never invent:

price
discount
reviews
ratings
sales
popularity
awards
battery
weight
dimensions
waterproofing
durability
accessories
compatibility
performance
availability
delivery
customer experience

Never say Sofian:

bought it
used it
tested it
owned it
tried it
brought it travelling

unless the user explicitly provides that information.
`;


// ============================================================
// OUTPUT
// ============================================================

const OUTPUT_RULES = `
OUTPUT:

Return ONLY JSON.

No markdown.

No code fences.

No explanation.

Format:

{
  "style": "travel_story",
  "part_count": 6,
  "parts": [
    {
      "part": 1,
      "text": "..."
    }
  ]
}

6-10 parts.

part_count must equal actual parts.

Do not generate any URL.

Do not generate affiliate links.

The backend handles the affiliate link.
`;


// ============================================================
// PROMPT BUILDER
// ============================================================

function buildPrompt(
    productName,
    productDescription,
    provider
) {

    return `
You are writing a Threads story for:

${PERSONA}

${SOFIAN_CHARACTER}

${SOFIAN_VOICE}

${LANGUAGE_LOCK}

${CHARACTER_THINKING}

${CAT_PERSPECTIVE}

${STORY_RULES}

${TRUTH_RULES}

${OUTPUT_RULES}


PRODUCT NAME:

${productName}


PRODUCT DESCRIPTION:

${productDescription}


FINAL REMINDER:

Do not write like an AI.

Do not write like a product listing.

Do not write like an influencer.

Do not write like a reviewer.

Think like Sofian.

Sofian is a travelling cat.

Then speak naturally.
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

    let cleaned = text.trim();

    if (cleaned.startsWith("```")) {

        cleaned = cleaned
            .replace(/^```json/i, "")
            .replace(/^```/i, "")
            .replace(/```$/i, "")
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

    return JSON.parse(cleaned);
}


// ============================================================
// URL CHECK
// ============================================================

function containsURL(text) {

    if (!text) return false;

    return /https?:\/\/|www\.|bit\.ly\/|s\.shopee\./i
        .test(text);
}


// ============================================================
// FAKE EXPERIENCE CHECK
// ============================================================

function containsFakeExperience(text) {

    if (!text) return false;

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

        /\bpengalaman\s+aku\b/i,
        /\baku\s+dah\s+bawa\b/i
    ];

    return patterns.some(
        pattern =>
            pattern.test(text)
    );
}


// ============================================================
// INDONESIAN CHECK
// ============================================================

function containsIndonesian(text) {

    if (!text) return false;

    const forbidden = [

        "bisa",
        "terlihat",
        "menggunakan",
        "kualitas",
        "sebuah",
        "peralatan",
        "kemudian",
        "tentunya",
        "berbagai",
        "dapatkan",
        "membutuhkan",
        "memudahkan",
        "ditawarkan",
        "alternatif yang praktikal"
    ];

    const lower =
        text.toLowerCase();

    return forbidden.some(
        word => {

            const regex =
                new RegExp(
                    "\\b" +
                    word +
                    "\\b",
                    "i"
                );

            return regex.test(
                lower
            );
        }
    );
}


// ============================================================
// AI LANGUAGE CHECK
// ============================================================

function containsAICopy(text) {

    if (!text) return false;

    const forbidden = [

        "produk ini menawarkan",
        "produk ini memberikan",
        "merupakan pilihan",
        "kelebihan utama",
        "secara keseluruhan",
        "berdasarkan keterangan",
        "berdasarkan deskripsi",
        "boleh dipertimbangkan",
        "boleh diteliti",
        "untuk golongan traveller",
        "sebagai seorang traveller",
        "dalam dunia travel",
        "pengalaman menggunakan"
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


// ============================================================
// BAD SOFIAN LANGUAGE
// ============================================================

function containsBadSofianLanguage(text) {

    if (!text) return false;

    const forbidden = [

        "real talk",
        "power",
        "bobot",
        "sagap budget",
        "bagi hassle",
        "ribung-ribung",
        "ciamik",
        "risok",
        "bagitu",
        "tebocor",
        "sekalian dengan",
        "bawa sekecil apa"
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


// ============================================================
// HARD SELL CHECK
// ============================================================

function containsHardSell(text) {

    if (!text) return false;

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


// ============================================================
// HUMAN INFLUENCER CHECK
// ============================================================

function containsHumanInfluencerFraming(text) {

    if (!text) return false;

    const forbidden = [

        "sebagai travel blogger",
        "sebagai content creator",
        "sebagai influencer",
        "sebagai seorang traveller",
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


// ============================================================
// NORTHERN COUNT
// ============================================================

function countNorthernWords(text) {

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
        const word
        of words
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
            count += matches.length;
        }
    }

    return count;
}


// ============================================================
// HASHTAGS
// ============================================================

function countHashtags(text) {

    const matches =
        text.match(
            /#[A-Za-z0-9_]+/g
        );

    return matches
        ? matches.length
        : 0;
}


// ============================================================
// VALIDATE
// ============================================================

function validateAIResult(result) {

    if (
        !result ||
        typeof result !== "object"
    ) {

        return {
            valid: false,
            reason:
                "Invalid AI result"
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
        result.parts.length < 6 ||
        result.parts.length > 10
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

    let fullText = "";

    for (
        let i = 0;
        i < result.parts.length;
        i++
    ) {

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
                    `Part ${i + 1} invalid`
            };
        }

        if (
            !part.text.trim()
        ) {

            return {
                valid: false,
                reason:
                    `Part ${i + 1} empty`
            };
        }

        fullText +=
            " " +
            part.text;
    }


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
        containsFakeExperience(
            fullText
        )
    ) {

        return {
            valid: false,
            reason:
                "Possible fabricated experience"
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
        containsAICopy(
            fullText
        )
    ) {

        return {
            valid: false,
            reason:
                "AI copywriting detected"
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
        countNorthernWords(
            fullText
        ) > 4
    ) {

        return {
            valid: false,
            reason:
                "Too much Northern dialect"
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
                "More than 5 hashtags"
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
                                0.85,

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
    prompt
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
                            0.85,

                        max_tokens:
                            1800,

                        messages: [

                            {
                                role:
                                    "system",

                                content: `
Write naturally.

You are writing for Sofian The Travelling Cat.

Sofian is literally a travelling cat.

He has human-like intelligence and speech,
but he is not a human.

His personality is:

curious
practical
budget-conscious
playful
slightly sarcastic

He observes humans while travelling.

He likes food and comfortable places.

He dislikes unnecessary luggage and hassle.

Do not overuse cat jokes.

Do not say "meow" repeatedly.

Do not repeatedly explain that he is a cat.

Use natural Malaysian Malay.

Do not use Indonesian vocabulary.

Do not sound like an influencer,
reviewer, salesman or product listing.

The user prompt contains the full story rules.

Think as Sofian.

Then write naturally.

Never invent product facts.

Never invent product experience.

Never generate URLs.
`
                            },

                            {
                                role:
                                    "user",

                                content:
                                    prompt
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
// GENERATE STORY
// ============================================================

async function generateStory(
    productName,
    productDescription
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

    if (
        providers.length === 0
    ) {

        throw new Error(
            "No AI provider configured"
        );
    }


    let lastError =
        null;


    for (
        const provider
        of providers
    ) {

        for (
            let attempt = 1;
            attempt <= 2;
            attempt++
        ) {

            try {

                const prompt =
                    buildPrompt(
                        productName,
                        productDescription,
                        provider
                    );


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
                            prompt
                        );
                }


                const result =
                    cleanJSON(
                        raw
                    );


                const validation =
                    validateAIResult(
                        result
                    );


                if (
                    !validation.valid
                ) {

                    lastError =
                        new Error(
                            `${provider} attempt ${attempt}: ` +
                            validation.reason
                        );


                    console.log(
                        "[V1.9.2] Validation failed:",
                        validation.reason
                    );


                    continue;
                }


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
                    `[V1.9.2] ${provider} attempt ${attempt} failed:`,
                    error.message
                );
            }
        }
    }


    throw (
        lastError ||
        new Error(
            "All AI providers failed"
        )
    );
}


// ============================================================
// AFFILIATE LINK
// ============================================================

function injectAffiliateLink(
    result,
    affiliateUrl
) {

    if (
        !affiliateUrl
    ) {

        throw new Error(
            "Affiliate URL is missing"
        );
    }


    if (
        containsURL(
            JSON.stringify(
                result
            )
        )
    ) {

        throw new Error(
            "Security check failed: AI output contains URL"
        );
    }


    const finalPart =
        result.parts[
            result.parts.length - 1
        ];


    finalPart.text =
        finalPart.text.trim() +
        `\n\n👉 ${affiliateUrl}` +
        `\n(Pautan afiliat)`;


    return result;
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
                "Sofian V1.9.2 Character-First Engine",

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
                "Sofian V1.9.2 Character-First Engine",

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
                await generateStory(
                    productName,
                    productDescription
                );


            const finalResult =
                injectAffiliateLink(
                    generated.result,
                    affiliateUrl
                );


            return res.json({

                success:
                    true,

                provider:
                    generated.provider,

                model:
                    generated.model,

                version:
                    VERSION,

                persona:
                    PERSONA,

                character_engine:
                    "Sofian V1.9.2 Character-First Engine",

                sofian_test:
                    "Wallet • Bag • Weight • Hassle • Value",

                character_rule:
                    "Sofian is literally a travelling cat",

                data:
                    finalResult
            });


        } catch (
            error
        ) {

            console.error(
                "[V1.9.2] /api/ai/test error:",
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
                await generateStory(
                    productName,
                    productDescription
                );


            const finalResult =
                injectAffiliateLink(
                    generated.result,
                    affiliateUrl
                );


            return res.json({

                success:
                    true,

                provider:
                    generated.provider,

                model:
                    generated.model,

                version:
                    VERSION,

                persona:
                    PERSONA,

                character_engine:
                    "Sofian V1.9.2 Character-First Engine",

                sofian_test:
                    "Wallet • Bag • Weight • Hassle • Value",

                character_rule:
                    "Sofian is literally a travelling cat",

                data:
                    finalResult
            });


        } catch (
            error
        ) {

            console.error(
                "[V1.9.2] /api/ai/generate error:",
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
