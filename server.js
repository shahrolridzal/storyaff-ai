require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const GEMINI_MODEL = "gemini-3.6-flash";
const OPENROUTER_MODEL = "openrouter/free";

const VERSION = "1.9.7";


// ============================================================
// STORYAFF AI
// V1.9.7
//
// AI                = storytelling
// BACKEND           = verified product facts
// BACKEND           = affiliate URL
//
// SOFIAN            = literally a travelling cat
//
// V1.9.7 CHANGE:
// Flexible story parser.
// AI does NOT have to perfectly follow PART formatting.
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
// LANGUAGE PROTECTION
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
        "bisa"
    ];

    const lower =
        String(text).toLowerCase();

    return bannedWords.some(word => {

        const regex =
            new RegExp(
                `\\b${word}\\b`,
                "i"
            );

        return regex.test(lower);

    });
}


// ============================================================
// FAKE EXPERIENCE PROTECTION
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
        pattern =>
            pattern.test(text)
    );
}


// ============================================================
// INVENTED SPECIFIC CLAIM PROTECTION
// ============================================================

function containsInventedSpecifics(text) {

    if (!text) return false;

    const patterns = [

        // Specific weight
        /\b\d+\s*kg\b/i,

        // Specific price
        /\bRM\s*\d+/i,
        /\bTHB\s*\d+/i,

        // Specific battery/time
        /\b\d+\s*(jam|hours|hour)\b/i,

        // Specific distance
        /\b\d+\s*(km|kilometer|kilometre)\b/i,

        // Specific duration
        /\b\d+\s*(hari|malam|minggu)\b/i,

        // Unsupported physical placement
        /\bmasuk poket\b/i,
        /\bmasuk saku\b/i,
        /\bdalam poket\b/i,
        /\bdalam saku\b/i,

        // Unsupported physical experience
        /\bbahu.*pegal\b/i,
        /\bbahu.*sakit\b/i,
        /\bpenat.*bawa\b/i,

        // Other people
        /\borang lain guna\b/i,
        /\borang lain pakai\b/i,
        /\borang lain beli\b/i,
        /\btravel blogger\b/i,
        /\breviewer\b/i,
        /\bkomen orang\b/i,

        // Unsupported performance
        /\bvideo.*smooth\b/i,
        /\bvideo.*blur\b/i,
        /\bgambar.*blur\b/i,

        // Unsupported ease of use
        /\bsenang digunakan\b/i,
        /\bmudah digunakan\b/i,
        /\btak perlu.*setup\b/i
    ];

    return patterns.some(
        pattern =>
            pattern.test(text)
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
            x => x.trim()
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

He is NOT a human pretending to be a cat.

He is a cat with human-like intelligence,
thoughts, opinions, curiosity and humour.

His cat identity influences the way he sees the world.

Sofian naturally notices things humans might ignore:

- food smells
- interesting smells
- places
- cramped spaces
- bags
- luggage
- comfort
- noise
- strange human behaviour
- unnecessary hassle
- things affecting travel

However:

DO NOT repeatedly say "as a cat".

DO NOT repeatedly say "I'm a cat".

DO NOT use "meow" jokes repeatedly.

DO NOT make cat jokes every paragraph.

DO NOT turn Sofian into a human influencer.

DO NOT make Sofian a generic human traveller.

The reader should naturally feel that the narrator is a travelling cat.

Sofian thinks like a person,
but remains unmistakably a cat.
`;


// ============================================================
// SOFIAN VOICE
// ============================================================

const SOFIAN_VOICE = `

SOFIAN VOICE

Natural Malaysian Malay.

Casual.

Conversational.

Relaxed.

Slight Malaysian Manglish is acceptable.

Light Northern Malaysian flavour is acceptable.

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

Do not sound like an influencer.

Do not sound like an affiliate marketer.

Do not sound like corporate marketing.

Do not sound like a copywriter.

Do not sound like ChatGPT.

Do not sound Indonesian.

Humour comes from observation.

Personality comes from thought.

The writing should feel like someone casually talking,
not someone trying to write a viral post.

Desired rhythm:

"Hang pernah tak tengok balik video travel hang, lepastu rasa pening sebab footage bergegar teruk?"

"Niat pi melancong tu nak simpan kenangan comel-comel."

"Aku bukan kedekut. Aku cuma tak suka duit keluar tanpa sebab."

"Aku tengok benda travel, soalan pertama bukan cantik dak? Soalan pertama: boleh masuk beg dak?"

These are references only.

Do not copy them.
`;


// ============================================================
// STORY RULES
// ============================================================

const STORY_RULES = `

STORY RULES

Write a natural Threads story.

6–10 parts.

The story should develop naturally.

Possible progression:

Observation
→ annoyance
→ thought
→ tension
→ discovery
→ product
→ verified fact
→ opinion
→ ending

Do not force every stage.

Do not make the story sound like a template.

Do not make every part about the product.

Do not dump product information.

Do not write a product review.

Do not write an advertisement.

Do not use hard selling.

The story should feel like Sofian had a thought
and simply followed that thought.

The product should normally appear around Part 4–6.

Do not reveal it in Part 1.
`;


// ============================================================
// TRUTH RULES
// ============================================================

const TRUTH_RULES = `

TRUTH RULES

You do NOT receive the product description.

Therefore:

DO NOT invent product facts.

DO NOT infer specifications from the product name.

DO NOT invent:

- price
- discount
- weight
- dimensions
- battery
- durability
- materials
- performance
- ratings
- reviews
- popularity
- accessories
- compatibility
- water resistance
- storage
- ease of use
- additional features

The backend will insert verified facts.

Use placeholders.

==================================================
PERSONAL EXPERIENCE
==================================================

Sofian must NOT claim:

"I bought it."

"I used it."

"I tested it."

"I tried it."

"I carried it."

"I held it."

"I reviewed it."

"I travelled with it."

unless such experience is explicitly provided.

Sofian can have an opinion without using the product.

Examples:

"Konsep macam ni nampak masuk akal."

"Kalau fikir pasal ruang beg, idea macam ni menarik."

"At least konsep dia tak serabut."

==================================================
TRAVEL FACTS
==================================================

Do not invent precise circumstances.

Do not invent:

- bag weight
- prices
- distances
- travel duration
- exact locations
- hotels
- airports
- trains
- other travellers
- specific personal experiences

Generic observations are allowed.

==================================================
PLACEHOLDERS
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

Do not invent the content of the placeholders.

==================================================
URL
==================================================

Never generate URLs.

Never generate affiliate links.

==================================================
HASHTAGS
==================================================

Do not generate hashtags.
`;


// ============================================================
// WRITER PROMPT
// ============================================================

function buildWriterPrompt(
    productName
) {

    return `

Write a Threads storytelling post for:

SOFIAN THE TRAVELLING CAT.

${SOFIAN_IDENTITY}

${SOFIAN_VOICE}

${STORY_RULES}

${TRUTH_RULES}

==================================================
PRODUCT CONTEXT
==================================================

Product name:

${productName}

You know only the product name.

You DO NOT know its description.

Do not infer facts from the name.

==================================================
MOST IMPORTANT RULE
==================================================

Do NOT manufacture a fake scene just to make the story interesting.

Do not invent:

"aku bawa..."

"aku guna..."

"aku cuba..."

"aku test..."

"aku beli..."

"aku pegang..."

Do not invent what Sofian physically did.

Do not invent what other people did.

Do not invent precise travel circumstances.

Create interest through Sofian's:

- observations
- thoughts
- curiosity
- frustration
- humour
- practical thinking
- personality
- cat perspective

==================================================
CAT PERSPECTIVE
==================================================

Sofian is a travelling cat.

His cat identity should subtly influence the story.

He may notice:

- food
- smells
- humans
- bags
- cramped spaces
- comfort
- noise
- unnecessary human behaviour

Do this naturally.

Do not force cat jokes.

Do not say "as a cat" repeatedly.

==================================================
PRODUCT
==================================================

Introduce:

{{PRODUCT_NAME}}

exactly once.

Then introduce:

{{FACT_1}}

exactly once.

The product should appear naturally.

Do not write a catalogue.

Do not repeat its name.

==================================================
VOICE
==================================================

Natural Malaysian Malay.

Casual.

Short and medium sentences.

Light Northern flavour.

No corporate language.

No advertising language.

No Indonesian wording.

Do not over-explain.

Do not sound polished.

Do not try to sound viral.

==================================================
ENDING
==================================================

End naturally.

Sofian can:

- leave the thought hanging
- make a small observation
- think about food
- notice something around him
- joke lightly
- move on

Do NOT end with:

"klik link"

"beli sekarang"

"wajib beli"

"jangan lepaskan"

"link di bio"

==================================================
OUTPUT
==================================================

Return ONLY the story.

No JSON.

No markdown.

No explanation.

No hashtags.

No URL.

You may number the parts.

Preferred:

PART 1: ...

PART 2: ...

PART 3: ...

But the backend can handle other numbering formats.

Write 6–10 parts.
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


    // Remove markdown fences

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


    // Remove accidental leading/trailing quotes

    if (
        cleaned.startsWith('"') &&
        cleaned.endsWith('"')
    ) {

        cleaned =
            cleaned.slice(
                1,
                -1
            );
    }


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

        // Not JSON.
        // Continue.

    }


    // ========================================================
    // METHOD 2
    // PART 1:
    // Part 1:
    // PART 1.
    // PART 1 -
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
                i + 1 <
                matches.length
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
    // NORMAL NUMBERED LINES
    //
    // 1. ...
    // 2. ...
    //
    // 1) ...
    // 2) ...
    //
    // 1: ...
    // 2: ...
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
                    line.replace(
                        /^[-•*]\s*/,
                        ""
                    ).trim()
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
    // PARAGRAPH MODE
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
    // LINE MODE
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
    //
    // Last resort if AI gives one continuous paragraph.
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


            // Make sure enough sentences remain
            // for remaining parts.

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


            // Keep chunks reasonably short.

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
        "================================================"
    );

    console.error(
        "V1.9.7 PARSER FAILED"
    );

    console.error(
        "RAW AI OUTPUT:"
    );

    console.error(
        cleaned
    );

    console.error(
        "================================================"
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
    // INVENTED SPECIFICS
    // --------------------------------------------------------

    if (
        containsInventedSpecifics(
            story
        )
    ) {

        throw new Error(
            "AI generated unsupported specific travel/product claims."
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
    // FACTS
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
    // UNRESOLVED PLACEHOLDER
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
    // URL PROTECTION
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


    // Story must NOT already contain a URL.

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


    // Exact affiliate URL goes ONLY into final part.

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
        "----------------------------------------"
    );

    console.log(
        `StoryAff AI ${VERSION}`
    );

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
            // FINAL URL COUNT
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
            // EXACT URL CHECK
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
