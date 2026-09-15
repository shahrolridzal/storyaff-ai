require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const GEMINI_MODEL = "gemini-3.6-flash";
const OPENROUTER_MODEL = "openrouter/free";

const VERSION = "1.9.8";


// ============================================================
// STORYAFF AI
// V1.9.8
//
// AI:
// - storytelling
// - Sofian personality
// - story structure
//
// BACKEND:
// - verified product facts
// - product name injection
// - affiliate URL injection
// - validation
//
// SOFIAN:
// Literally a travelling cat.
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


// ============================================================
// INDONESIAN / AI-LANGUAGE PROTECTION
// ============================================================

function containsBannedIndonesian(text) {

    if (!text) return false;

    const bannedWords = [

        "nggak",
        "enggak",
        "banget",
        "dong",
        "kamu",
        "anda",
        "bisa",
        "gue",
        "gua",
        "aku banget",
        "ngapain"
    ];

    const lower =
        String(text).toLowerCase();

    return bannedWords.some(word => {

        const regex =
            new RegExp(
                `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
                "i"
            );

        return regex.test(lower);

    });
}


// ============================================================
// FAKE PERSONAL EXPERIENCE PROTECTION
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

        /\baku review\b/i,
        /\baku dah review\b/i,
        /\baku pernah review\b/i
    ];

    return patterns.some(
        pattern =>
            pattern.test(text)
    );
}


// ============================================================
// UNSUPPORTED SPECIFIC CLAIM DETECTOR
// ============================================================
//
// Important:
// We DO NOT reject normal storytelling observations.
//
// We only reject claims that look like:
// - invented measurable specifications
// - invented prices
// - invented personal product experience
// - invented social proof
// - strong unsupported guarantees
//
// ============================================================

function getInventedSpecificClaim(text) {

    if (!text) return null;

    const patterns = [

        // ----------------------------------------------------
        // Specific weight
        // ----------------------------------------------------

        /\b\d+\s*kg\b/i,

        /\b\d+\s*(g|gram|grams)\b/i,


        // ----------------------------------------------------
        // Specific prices
        // ----------------------------------------------------

        /\bRM\s*\d+/i,

        /\bTHB\s*\d+/i,

        /\bMYR\s*\d+/i,


        // ----------------------------------------------------
        // Specific battery / duration claims
        // ----------------------------------------------------

        /\b\d+\s*(jam|hours|hour)\b/i,

        /\b\d+\s*(minit|minutes|minute)\b/i,


        // ----------------------------------------------------
        // Specific distance
        // ----------------------------------------------------

        /\b\d+\s*(km|kilometer|kilometre)\b/i,


        // ----------------------------------------------------
        // Specific travel duration
        // ----------------------------------------------------

        /\b\d+\s*(hari|malam|minggu)\b/i,


        // ----------------------------------------------------
        // Specific dimensions
        // ----------------------------------------------------

        /\b\d+\s*(cm|mm|inci|inch)\b/i,


        // ----------------------------------------------------
        // Strong guarantees
        // ----------------------------------------------------

        /\b100%\s*(stabil|selamat|tahan|berkesan)\b/i,

        /\bconfirm\s+(stabil|selamat|tahan|bagus|terbaik)\b/i,

        /\bpasti\s+(stabil|selamat|tahan|bagus|terbaik)\b/i,

        /\bdijamin\s+(stabil|selamat|tahan|bagus|terbaik)\b/i,


        // ----------------------------------------------------
        // Fake social proof
        // ----------------------------------------------------

        /\bramai\s+(orang|traveller|pelancong)\s+(guna|pakai|beli)\b/i,

        /\bbanyak\s+(orang|traveller|pelancong)\s+(guna|pakai|beli)\b/i,

        /\bpopular\s+(di|kalangan)\b/i,

        /\bviral\s+(di|kalangan)\b/i,


        // ----------------------------------------------------
        // Specific fabricated product specification
        // ----------------------------------------------------

        /\bberatnya\s+\d+/i,

        /\bsaiznya\s+\d+/i,

        /\bbateri.*\d+\s*(jam|hours|hour)\b/i,

        /\btahan.*\d+\s*(jam|hours|hour)\b/i,


        // ----------------------------------------------------
        // Product ownership / experience wording
        // ----------------------------------------------------

        /\baku\s+(guna|cuba|test|beli|pakai|pegang)\s+(kamera|produk|benda|ni|ini)\b/i,

        /\baku\s+(dah|sudah|pernah)\s+(guna|cuba|test|beli|pakai|pegang)\b/i
    ];


    for (
        const pattern of patterns
    ) {

        const match =
            String(text).match(
                pattern
            );

        if (match) {

            return match[0];
        }
    }


    return null;
}


function containsInventedSpecifics(text) {

    return !!getInventedSpecificClaim(
        text
    );
}


// ============================================================
// PRODUCT FACTS
// ============================================================

function splitProductFacts(
    description
) {

    if (!description) {

        return [];
    }


    return String(description)
        .split(
            /(?<=[.!?])\s+|\n+/
        )
        .map(
            x =>
                x.trim()
        )
        .filter(Boolean)
        .slice(0, 5);
}


// ============================================================
// SOFIAN IDENTITY
// ============================================================

const SOFIAN_IDENTITY = `

SOFIAN THE TRAVELLING CAT

Sofian is literally a travelling cat.

He is a CAT.

He is NOT a human pretending to be a cat.

He is a cat with human-like intelligence,
thoughts, opinions, curiosity and humour.

His identity as a cat is part of how he sees the world.

He notices things naturally:

- food smells
- interesting smells
- places
- small spaces
- bags
- luggage
- comfort
- noise
- humans
- strange human behaviour
- unnecessary hassle

Sofian can think and speak like a person.

But he remains a travelling cat.

IMPORTANT:

Do not repeatedly say:

"I am a cat."

"as a cat..."

"meow..."

Do not turn the story into a cat parody.

Do not make him a human influencer.

Do not make him a generic Malaysian human traveller.

The reader should naturally feel that the narrator is Sofian,
a travelling cat with a human-like mind.
`;


// ============================================================
// SOFIAN VOICE
// ============================================================

const SOFIAN_VOICE = `

VOICE

Natural Malaysian Malay.

Casual.

Conversational.

Relaxed.

Light Manglish is okay.

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

But do NOT force slang.

Do NOT put slang in every sentence.

Do NOT overdo Northern dialect.

Do NOT sound like an influencer.

Do NOT sound like an affiliate marketer.

Do NOT sound like corporate marketing.

Do NOT sound like an advertisement.

Do NOT sound like ChatGPT.

Do NOT sound Indonesian.

Humour should come naturally from observation.

Personality should come naturally from thought.

The story should feel like Sofian is thinking out loud.

Not like someone writing marketing copy.

REFERENCE FEEL:

"Hang pernah tak tengok balik video travel hang,
lepas tu rasa pening sebab footage bergegar teruk?"

"Niat pi melancong tu nak simpan kenangan."

"Aku bukan kedekut.
Aku cuma tak suka duit keluar tanpa sebab."

"Aku tengok benda travel,
soalan pertama bukan cantik dak?
Soalan pertama: boleh masuk beg dak?"

These are voice references only.

Do not copy them.
`;


// ============================================================
// STORY RULES
// ============================================================

const STORY_RULES = `

STORY

Write a natural Threads storytelling post.

6–10 parts.

The story should feel like one continuous thought.

Natural progression can be:

observation
→ small annoyance
→ Sofian's thought
→ practical tension
→ discovery
→ product
→ verified fact
→ opinion
→ natural ending

Do not force every stage.

Do not make every part about the product.

Do not dump product information.

Do not write like a product review.

Do not write like an advertisement.

Do not hard sell.

Product reveal should normally happen around Part 4–6.

Do not reveal the product in Part 1.

Short and medium sentences.

Avoid repetitive sentence structures.

Avoid every part ending with a punchline.

Avoid generic influencer hooks.
`;


// ============================================================
// TRUTH RULES
// ============================================================

const TRUTH_RULES = `

TRUTH

You do NOT receive the product description.

You must NOT invent product specifications.

You must NOT infer specifications from the product name.

Do not invent:

price
discount
weight
dimensions
battery
materials
durability
performance numbers
ratings
reviews
popularity
accessories
compatibility
water resistance
storage
technical specifications

The backend will insert verified product facts.

Use placeholders.

==================================================
PERSONAL EXPERIENCE
==================================================

Sofian must NOT claim he:

bought the product
used the product
tested the product
tried the product
carried the product
held the product
owned the product
reviewed the product

unless explicitly provided.

Sofian CAN have an opinion about the concept.

For example:

"Konsep macam ni nampak masuk akal."

"Kalau fikir pasal ruang beg, idea macam ni menarik."

"Aku suka idea benda yang tak serabut."

==================================================
TRAVEL
==================================================

Do not invent precise travel circumstances.

Do not invent:

specific airports
specific hotels
specific train journeys
specific prices
specific distances
specific luggage weights
specific travel duration
specific other travellers
specific reviews
specific user behaviour

Generic observations are allowed.

==================================================
PRODUCT PLACEHOLDERS
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

if necessary.

Never write the actual fact yourself.

==================================================
URL
==================================================

Never generate a URL.

Never generate an affiliate link.

==================================================
HASHTAGS
==================================================

Do not generate hashtags.
`;


// ============================================================
// WRITER PROMPT
// ============================================================
//
// IMPORTANT:
// The actual product name is intentionally NOT sent to the AI.
// This reduces the chance of the model using known internet
// knowledge about the product and hallucinating specifications.
//
// ============================================================

function buildWriterPrompt() {

    return `

You are writing for:

SOFIAN THE TRAVELLING CAT.

${SOFIAN_IDENTITY}

${SOFIAN_VOICE}

${STORY_RULES}

${TRUTH_RULES}

==================================================
VERY IMPORTANT
==================================================

You are a STORY WRITER.

You are NOT a product researcher.

You are NOT a reviewer.

You are NOT a salesperson.

You do not know the product specifications.

Do not use outside knowledge.

Do not guess.

The backend will insert the actual product name and verified facts.

==================================================
CAT PERSPECTIVE
==================================================

Sofian is literally a travelling cat.

His cat identity should subtly influence his observations.

For example, he may naturally notice:

food
smells
quiet corners
small spaces
bags
human behaviour
comfort
noise

But don't turn every paragraph into a cat joke.

Don't repeatedly mention that he is a cat.

Let the perspective come naturally.

==================================================
PRODUCT
==================================================

Use this placeholder:

{{PRODUCT_NAME}}

exactly once.

Use this verified fact placeholder:

{{FACT_1}}

exactly once.

If another fact is genuinely useful,
you may use:

{{FACT_2}}

But do not invent its content.

==================================================
WRITING
==================================================

Do not fabricate a personal experience.

Do not write:

"I bought it."

"I used it."

"I tested it."

"I tried it."

"I carried it."

"I held it."

"I reviewed it."

Instead, Sofian can observe and think.

Example:

"Konsep macam ni nampak masuk akal."

"Kalau fikir pasal travel, benda ringkas memang menarik."

==================================================
STYLE
==================================================

Natural Malaysian Malay.

Casual.

Conversational.

Slightly playful.

Slightly sarcastic.

Dry humour.

Observational.

Do not overdo slang.

Do not use Indonesian vocabulary.

Do not sound polished.

Do not sound like an AI.

Do not sound like a copywriter.

Do not sound like an influencer.

Do not try too hard to be funny.

==================================================
HOOK
==================================================

Start with a normal observation or thought.

Avoid generic hooks like:

"Guys, korang kena tengok ni!"

"Ini memang wajib!"

"Kalau korang traveller..."

"Travel hack yang ramai tak tahu!"

"Produk viral!"

"Best gila!"

==================================================
ENDING
==================================================

End naturally.

Sofian may:

leave the thought hanging
make a small observation
think about food
notice something nearby
make a light joke
move on

Do not hard sell.

Do not say:

"beli sekarang"

"wajib beli"

"klik link"

"link di bio"

"jangan lepaskan"

==================================================
OUTPUT
==================================================

Return ONLY the story.

No JSON.

No markdown.

No explanation.

No hashtags.

No URLs.

6–10 parts.

You may use:

PART 1: ...

PART 2: ...

PART 3: ...

or:

1. ...

2. ...

3. ...

or simply separate paragraphs.

The backend has a flexible parser.
`;
}


// ============================================================
// GEMINI
// ============================================================

async function callGemini(
    prompt
) {

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
                                    text:
                                        prompt
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
            ?.content?.parts?.[0]
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

async function callOpenRouter(
    prompt
) {

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

async function callAI(
    prompt
) {

    let geminiError =
        null;


    // --------------------------------------------------------
    // GEMINI FIRST
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // OPENROUTER FALLBACK
    // --------------------------------------------------------

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
// CLEAN AI OUTPUT
// ============================================================

function cleanAIOutput(
    text
) {

    let cleaned =
        String(text || "")
            .trim();


    cleaned =
        cleaned
            .replace(
                /^```(?:text|markdown|json)?\s*/i,
                ""
            )
            .replace(
                /\s*```$/i,
                ""
            )
            .trim();


    return cleaned;
}


// ============================================================
// FLEXIBLE STORY PARSER
// ============================================================

function parseStory(
    text
) {

    if (!text) {

        throw new Error(
            "AI returned empty story."
        );
    }


    const cleaned =
        cleanAIOutput(
            text
        );


    // ========================================================
    // METHOD 1
    // JSON RECOVERY
    // ========================================================

    try {

        const parsed =
            JSON.parse(
                cleaned
            );


        if (
            parsed &&
            Array.isArray(
                parsed.parts
            )
        ) {

            const jsonParts =
                parsed.parts
                    .map(
                        x =>
                            String(x)
                                .trim()
                    )
                    .filter(Boolean);


            if (
                jsonParts.length >= 6 &&
                jsonParts.length <= 10
            ) {

                return jsonParts;
            }
        }

    } catch (error) {

        // Continue.
    }


    // ========================================================
    // METHOD 2
    // PART 1:
    // Part 1:
    // PART 1.
    // ========================================================

    const partRegex =
        /(?:^|\n)\s*(?:PART|Part|part)\s*\d+\s*[:.)\-]\s*/g;


    const matches =
        [
            ...cleaned.matchAll(
                partRegex
            )
        ];


    if (
        matches.length >= 6 &&
        matches.length <= 10
    ) {

        const parts = [];


        for (
            let i = 0;
            i < matches.length;
            i++
        ) {

            const start =
                matches[i].index +
                matches[i][0].length;


            const end =
                i + 1 < matches.length
                    ? matches[i + 1].index
                    : cleaned.length;


            const content =
                cleaned
                    .slice(
                        start,
                        end
                    )
                    .trim();


            if (content) {

                parts.push(
                    content
                );
            }
        }


        if (
            parts.length >= 6 &&
            parts.length <= 10
        ) {

            return parts;
        }
    }


    // ========================================================
    // METHOD 3
    // NUMBERED LINES
    // ========================================================

    const lines =
        cleaned
            .split(/\r?\n/)
            .map(
                line =>
                    line.trim()
            )
            .filter(Boolean);


    const numberedParts = [];


    for (
        const line of lines
    ) {

        const match =
            line.match(
                /^\d+\s*[\.:)\-]\s*(.+)$/s
            );


        if (
            match &&
            match[1].trim()
        ) {

            numberedParts.push(
                match[1].trim()
            );
        }
    }


    if (
        numberedParts.length >= 6 &&
        numberedParts.length <= 10
    ) {

        return numberedParts;
    }


    // ========================================================
    // METHOD 4
    // BULLET LINES
    // ========================================================

    const bulletParts =
        lines
            .map(
                line =>
                    line
                        .replace(
                            /^\s*[-•*]\s*/,
                            ""
                        )
                        .trim()
            )
            .filter(Boolean);


    if (
        bulletParts.length >= 6 &&
        bulletParts.length <= 10
    ) {

        return bulletParts;
    }


    // ========================================================
    // METHOD 5
    // PARAGRAPHS
    // ========================================================

    const paragraphs =
        cleaned
            .split(
                /\n\s*\n+/
            )
            .map(
                paragraph =>
                    paragraph
                        .replace(
                            /^\s*(?:[-•*])\s*/,
                            ""
                        )
                        .trim()
            )
            .filter(Boolean);


    if (
        paragraphs.length >= 6 &&
        paragraphs.length <= 10
    ) {

        return paragraphs;
    }


    // ========================================================
    // METHOD 6
    // SIMPLE LINES
    // ========================================================

    if (
        lines.length >= 6 &&
        lines.length <= 10
    ) {

        return lines;
    }


    // ========================================================
    // METHOD 7
    // SENTENCE GROUPING
    // ========================================================

    const sentences =
        cleaned
            .split(
                /(?<=[.!?])\s+/
            )
            .map(
                sentence =>
                    sentence.trim()
            )
            .filter(Boolean);


    if (
        sentences.length >= 6
    ) {

        const targetParts =
            Math.min(
                8,
                Math.max(
                    6,
                    Math.ceil(
                        sentences.length / 2
                    )
                )
            );


        const grouped = [];

        let current = "";


        for (
            let i = 0;
            i < sentences.length;
            i++
        ) {

            const remainingSentences =
                sentences.length - i;


            const remainingParts =
                targetParts -
                grouped.length;


            if (
                remainingSentences <=
                remainingParts
            ) {

                if (current) {

                    grouped.push(
                        current.trim()
                    );

                    current = "";
                }


                grouped.push(
                    sentences[i]
                );

                continue;
            }


            if (!current) {

                current =
                    sentences[i];

            } else {

                current +=
                    " " +
                    sentences[i];
            }


            if (
                current.length >= 140 &&
                grouped.length <
                    targetParts - 1
            ) {

                grouped.push(
                    current.trim()
                );

                current = "";
            }
        }


        if (current) {

            grouped.push(
                current.trim()
            );
        }


        if (
            grouped.length >= 6 &&
            grouped.length <= 10
        ) {

            return grouped;
        }
    }


    // ========================================================
    // FAILED
    // ========================================================

    console.error(
        "=============================================="
    );

    console.error(
        "V1.9.8 PARSER FAILED"
    );

    console.error(
        "RAW AI OUTPUT:"
    );

    console.error(
        cleaned
    );

    console.error(
        "=============================================="
    );


    throw new Error(
        "AI story format could not be parsed into 6–10 parts."
    );
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
            "Invalid story structure."
        );
    }


    if (
        parts.length < 6 ||
        parts.length > 10
    ) {

        throw new Error(
            `Story must contain 6–10 parts. Found ${parts.length}.`
        );
    }


    const story =
        parts.join("\n");


    // --------------------------------------------------------
    // URL
    // --------------------------------------------------------

    if (
        containsUrl(
            story
        )
    ) {

        throw new Error(
            "AI generated a URL."
        );
    }


    // --------------------------------------------------------
    // LANGUAGE
    // --------------------------------------------------------

    if (
        containsBannedIndonesian(
            story
        )
    ) {

        throw new Error(
            "AI generated Indonesian-style wording."
        );
    }


    // --------------------------------------------------------
    // FAKE EXPERIENCE
    // --------------------------------------------------------

    if (
        containsFakeExperience(
            story
        )
    ) {

        throw new Error(
            "AI generated fake personal experience."
        );
    }


    // --------------------------------------------------------
    // UNSUPPORTED CLAIMS
    // --------------------------------------------------------

    const inventedClaim =
        getInventedSpecificClaim(
            story
        );


    if (inventedClaim) {

        throw new Error(
            `AI generated unsupported specific claim: "${inventedClaim}"`
        );
    }


    // --------------------------------------------------------
    // PRODUCT PLACEHOLDER
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // FACT 1
    // --------------------------------------------------------

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


    if (
        facts.length === 0
    ) {

        throw new Error(
            "Product description contains no usable facts."
        );
    }


    let story =
        parts.join("\n");


    // --------------------------------------------------------
    // PRODUCT NAME
    // --------------------------------------------------------

    story =
        story.replace(
            /\{\{PRODUCT_NAME\}\}/g,
            productName
        );


    // --------------------------------------------------------
    // VERIFIED FACTS
    // --------------------------------------------------------

    facts.forEach(
        (
            fact,
            index
        ) => {

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


    // --------------------------------------------------------
    // UNRESOLVED PLACEHOLDERS
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // URL
    // --------------------------------------------------------

    if (
        containsUrl(
            story
        )
    ) {

        throw new Error(
            "Unexpected URL found in final story."
        );
    }


    // --------------------------------------------------------
    // LANGUAGE
    // --------------------------------------------------------

    if (
        containsBannedIndonesian(
            story
        )
    ) {

        throw new Error(
            "Indonesian-style wording found in final story."
        );
    }


    // --------------------------------------------------------
    // FAKE EXPERIENCE
    // --------------------------------------------------------

    if (
        containsFakeExperience(
            story
        )
    ) {

        throw new Error(
            "Fake personal experience found in final story."
        );
    }


    // --------------------------------------------------------
    // UNSUPPORTED CLAIM
    // --------------------------------------------------------

    const inventedClaim =
        getInventedSpecificClaim(
            story
        );


    if (inventedClaim) {

        throw new Error(
            `Unsupported specific claim found in final story: "${inventedClaim}"`
        );
    }


    // --------------------------------------------------------
    // PRODUCT NAME
    // --------------------------------------------------------

    if (
        !story.includes(
            productName
        )
    ) {

        throw new Error(
            "Product name missing from final story."
        );
    }


    // --------------------------------------------------------
    // PART COUNT
    // --------------------------------------------------------

    const parts =
        story
            .split("\n")
            .filter(
                line =>
                    line.trim()
            );


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


    // --------------------------------------------------------
    // AI STORY MUST NOT ALREADY HAVE URL
    // --------------------------------------------------------

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
            .filter(
                line =>
                    line.trim()
            );


    if (
        parts.length < 6
    ) {

        throw new Error(
            "Story must contain at least 6 parts."
        );
    }


    // --------------------------------------------------------
    // EXACT URL
    // ONLY FINAL PART
    // --------------------------------------------------------

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


    console.log(
        "----------------------------------------------"
    );

    console.log(
        `StoryAff AI v${VERSION}`
    );

    console.log(
        "Generating Sofian story..."
    );


    const prompt =
        buildWriterPrompt();


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


    console.log(
        "Parsed parts:",
        parts.length
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


    console.log(
        "Story validation: PASS"
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


            // ------------------------------------------------
            // URL COUNT
            // ------------------------------------------------

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


            // ------------------------------------------------
            // EXACT URL
            // ------------------------------------------------

            if (
                urls[0] !== affiliateUrl
            ) {

                throw new Error(
                    "Affiliate URL was modified."
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