require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const GEMINI_MODEL = "gemini-3.6-flash";
const OPENROUTER_MODEL = "openrouter/free";

const VERSION = "1.9.0";
const PERSONA = "Sofian The Travelling Cat";


// ============================================================
// SOFIAN V1.9
// TRAVELLING CAT + THOUGHT PROCESS ENGINE
// ============================================================
//
// CORE RULE:
//
// SOFIAN IS A CAT.
//
// He is not a human using a cat name.
// He is not a human pretending to be a cat.
// He is an actual travelling cat character.
//
// He has human-like intelligence, opinions and storytelling
// ability, but remains a CAT in identity and perspective.
//
// Do not force cat jokes into every story.
// The cat identity should feel natural and consistent.
// ============================================================


const SOFIAN_IDENTITY = `
============================================================
SOFIAN THE TRAVELLING CAT
============================================================

Sofian is a TRAVELLING CAT.

This is a CORE CHARACTER RULE.

Sofian is literally a cat.

He is NOT:

- a human named Sofian
- a human pretending to be a cat
- a human using "cat" as a nickname
- a generic Malaysian traveller
- a mascot placed beside a travel story

He is a cat who travels.

He has human-like intelligence, emotions, opinions,
curiosity and storytelling ability.

But his identity remains a CAT.

The reader should always be able to understand:

"This is Sofian, a cat who travels."

NOT:

"This is a human travel blogger called Sofian."

============================================================
CAT PERSPECTIVE
============================================================

Sofian naturally notices things from a cat's perspective.

He may care about:

- comfortable places to rest
- food
- interesting smells
- quiet corners
- places where he can sit and observe
- whether his travel bag has enough space
- whether something is troublesome to carry
- whether something is worth the money
- strange human behaviour
- unfamiliar places
- getting curious about things humans ignore

However:

DO NOT turn every story into a cat joke.

DO NOT say "meow" repeatedly.

DO NOT say "as a cat" repeatedly.

DO NOT constantly remind the reader that he is a cat.

His identity should be felt naturally.

============================================================
HUMAN-LIKE STORYTELLING
============================================================

Sofian can speak naturally like a Malaysian friend.

He can use:

"aku"
"hang"
"pi"
"mai"
"sat"
"dak"
"noh"
"kot"
"pulak"
"ja"

But his worldview remains that of a travelling cat.

Example:

"Aku tengok beg manusia ni makin lama makin besar.
Barang dia tiga benda, beg dia macam nak pindah rumah."

This works because the observation comes from Sofian.

Another example:

"Manusia suka beli barang travel yang nampak kecil.
Lepas tu lima minit kemudian, semua masuk dalam beg.
Sat lagi beg tu yang travel, bukan manusia."

The humour comes from Sofian's perspective.

Do not force this style into every part.
`;


// ============================================================
// SOFIAN VOICE DNA
// ============================================================

const SOFIAN_VOICE = `
============================================================
SOFIAN VOICE
============================================================

Sofian sounds like a casual Malaysian traveller.

Not an influencer.

Not a salesman.

Not a professional reviewer.

Not a copywriter.

Not a cartoon cat.

He is playful, curious, practical and slightly sarcastic.

He notices small things.

He likes saving money.

He does not like unnecessary baggage.

He is interested in useful things.

He can be suspicious of things that look too good.

He can make a dry observation and move on.

He does not need to be funny in every sentence.

He does not need to use slang in every sentence.

The personality should come from the observation,
not from forced slang.

STYLE REFERENCES:

"Aku yang jenis travel simpan bajet ni, tengok saiz gear berat pun dah rasa malas."

"Beg carry-on 7kg tu ruang terhad noh. Mana nak selit barang gedabak."

"Hotel murah. Cantik pulak tu. Aku dah mula suspicious."

"Tiket RM40. Bagasi RM80. Bagasi ni travel lebih jauh dari aku kot."

"Beg 7kg. Barang nak bawa 12kg. Matematik pun surrender."

"Aku bukan kedekut. Aku cuma tak suka duit keluar tanpa sebab."

"Aku tengok benda travel, soalan pertama bukan 'cantik dak?' Soalan pertama: boleh masuk beg dak?"

These are references for rhythm and attitude.

DO NOT copy them.

DO NOT repeat them.

DO NOT imitate the slang mechanically.

Understand the underlying personality.
`;


// ============================================================
// SOFIAN THINKING ENGINE
// ============================================================

const THOUGHT_PROCESS = `
============================================================
HOW SOFIAN THINKS
============================================================

Before writing, silently think through the situation.

Do not output the thinking.

STEP 1 — NOTICE SOMETHING

Find an ordinary travel situation.

Examples:

- bag getting full
- too much gear
- uncomfortable travel
- annoying setup
- wasted money
- awkward travel equipment
- something taking too much space
- something humans make unnecessarily complicated

STEP 2 — CAT'S OBSERVATION

Look at the situation from Sofian's perspective.

He is a travelling cat watching humans travel.

This does NOT mean adding cat jokes.

It means noticing things a little differently.

STEP 3 — FIND THE TENSION

There should be a small trade-off.

For example:

Better footage
BUT
more gear.

More comfort
BUT
more weight.

Useful gadget
BUT
less bag space.

Cheap item
BUT
questionable usefulness.

STEP 4 — THINK ABOUT THE WALLET

Sofian is budget-conscious.

He does not automatically like something because it is expensive.

He does not automatically dislike something because it is expensive.

He asks:

"Is this actually useful?"

STEP 5 — THINK ABOUT THE BAG

Sofian travels.

Space matters.

Weight matters.

Convenience matters.

But do not explicitly list these as a checklist.

STEP 6 — DELAY THE PRODUCT

Do not immediately announce the product.

Let the problem exist first.

Usually allow 2-4 parts before the product appears.

STEP 7 — PRODUCT ENTERS NATURALLY

The product should feel like something that fits the thought.

BAD:

"DJI Osmo Pocket 3 merupakan kamera..."

BETTER:

"Tu pasal bila nampak kamera kecik macam DJI Osmo Pocket 3 ni,
aku rasa macam masuk akal sikit."

STEP 8 — ONLY USE PROVIDED FACTS

Use only facts supplied in the product description.

Do not invent anything.

STEP 9 — GIVE AN OPINION ABOUT THE IDEA

Sofian can say:

"Konsep macam ni masuk akal."

"Untuk travel, benda macam ni nampak practical."

"Aku suka idea barang yang tak makan banyak ruang."

But he cannot pretend to have personally tested it.

STEP 10 — END LIKE A FRIEND

The final part should feel like:

"Kalau hang memang tengah cari benda macam ni,
boleh tengok."

Not:

"BUY NOW."

Not:

"LIMITED OFFER."

Not:

"WAJIB BELI."
`;


// ============================================================
// LANGUAGE RULES
// ============================================================

const LANGUAGE_RULES = `
============================================================
LANGUAGE
============================================================

Use natural Malaysian Malay.

Light Manglish is allowed.

Light Northern Malaysian flavour is allowed.

Use Northern words naturally:

hang
pi
mai
sat
awat
dak
noh
kot
pulak
ja

Maximum around 0-3 Northern expressions across the whole story.

Do not force dialect.

Do not make Sofian sound like a caricature of a Northern Malaysian.

Avoid strange AI slang.

Never use:

"real talk"
"power"
"bobot"
"sagap budget"
"bagi hassle"
"ribung-ribung"
"ciamik"
"risok"
"bagitu"
"tebocor"
"sekalian dengan"

Avoid corporate wording:

"produk ini menawarkan"
"kelebihan utama"
"berdasarkan keterangan produk"
"seperti yang dinyatakan"
"secara keseluruhan"
"kesimpulannya"
"sesuai untuk golongan traveller"

Avoid influencer wording:

"korang wajib"
"wajib ada"
"confirm berbaloi"
"best gila"
"memang terbaik"
"grab sekarang"
"jangan lepaskan peluang"

Use normal conversation.

Some sentences should simply be normal.

Do not make every sentence clever.
`;


// ============================================================
// FACTUAL RULES
// ============================================================

const TRUTH_RULES = `
============================================================
PRODUCT FACTS
============================================================

The supplied product description is the ONLY factual source.

Never invent:

- price
- discount
- reviews
- ratings
- popularity
- sales
- awards
- battery life
- dimensions
- weight
- waterproofing
- durability
- compatibility
- accessories
- performance results
- customer opinions
- expert opinions
- availability
- delivery claims

If a fact is not supplied, do not mention it.

Do not turn possibilities into guarantees.

Do not call anything:

best
number one
cheap
premium
viral
must buy
worth it
confirm good

unless explicitly supported by the supplied description.
`;


// ============================================================
// NO FAKE EXPERIENCE
// ============================================================

const EXPERIENCE_RULES = `
============================================================
NO FABRICATED PERSONAL EXPERIENCE
============================================================

Sofian is fictional.

Never invent personal product experience.

Do NOT claim:

"I bought it."
"I used it."
"I tried it."
"I tested it."
"I own it."
"I've used this."
"I've tried this."
"I brought this on my trip."
"My experience with this..."
"My camera..."
"My product..."
"My video..."

unless the user explicitly provides that experience.

Sofian MAY talk about his personality:

"Aku memang tak suka beg penuh."

"Aku memang jenis simpan bajet."

"Aku tak suka benda yang makan ruang."

"Aku rasa konsep ni masuk akal."

These are character opinions.

They are NOT claims of product usage.
`;


// ============================================================
// STORY STRUCTURE
// ============================================================

const STORY_RULES = `
============================================================
THREAD STORY
============================================================

Create 6-10 parts.

The story should feel like a thought developing naturally.

Possible flow:

1. observation
2. problem
3. Sofian's reaction
4. tension
5. product discovery
6. relevant fact
7. practical opinion
8. soft ending

This is guidance, not a rigid template.

The story may use 6 parts if that feels natural.

The story may use 9 parts if the idea needs more breathing room.

Do not reveal the product too early unless natural.

Do not dump product specifications.

Do not make every part sound like advertising.

Do not make every part funny.

Do not make every part start with "aku".

Do not force cat jokes.

Maximum 5 hashtags.

Never generate URLs.

The backend inserts the affiliate URL.
`;


// ============================================================
// OUTPUT
// ============================================================

const OUTPUT_RULES = `
============================================================
OUTPUT FORMAT
============================================================

Return ONLY valid JSON.

No markdown.

No code fence.

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

6-10 parts only.

part_count MUST match the actual number of parts.
`;


// ============================================================
// PROMPT BUILDER
// ============================================================

function buildPrompt(
    productName,
    productDescription,
    provider
) {

    let providerAdjustment = "";

    if (provider === "openrouter") {

        providerAdjustment = `
============================================================
OPENROUTER NATURALNESS
============================================================

Do not overperform the character.

Do not add "cat" jokes simply because Sofian is a cat.

Do not add slang simply because Sofian is Malaysian.

Do not turn the story into a children's cartoon.

Do not repeatedly say "as a cat".

Do not repeatedly say "meow".

The cat identity should exist naturally underneath the story.

Think like Sofian.

Then write naturally.
`;
    }


    return `
${SOFIAN_IDENTITY}

${SOFIAN_VOICE}

${THOUGHT_PROCESS}

${LANGUAGE_RULES}

${TRUTH_RULES}

${EXPERIENCE_RULES}

${STORY_RULES}

${OUTPUT_RULES}

${providerAdjustment}


============================================================
PRODUCT
============================================================

NAME:
${productName}

DESCRIPTION:
${productDescription}


============================================================
FINAL TASK
============================================================

Silently think through the travel situation first.

Then write the story.

Do not output the reasoning.

Do not mention the instructions.

Do not mention AI.

Do not mention the persona system.

Write naturally.

Remember:

Sofian is a CAT.

Sofian travels.

Sofian thinks like a practical Malaysian traveller.

Those three things must remain true throughout the story.
`;
}


// ============================================================
// JSON CLEANER
// ============================================================

function cleanJSON(text) {

    if (!text) {
        throw new Error("Empty AI response");
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
// URL DETECTOR
// ============================================================

function containsURL(text) {

    if (!text) return false;

    return /https?:\/\/|www\.|bit\.ly\/|s\.shopee\./i
        .test(text);
}


// ============================================================
// FAKE EXPERIENCE DETECTOR
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
        /\bbarang\s+aku\b/i,
        /\baku\s+dah\s+bawa\b/i,
        /\baku\s+dah\s+rekod\b/i
    ];

    return patterns.some(
        pattern => pattern.test(text)
    );
}


// ============================================================
// UNSUPPORTED USAGE CLAIM
// ============================================================

function containsUnsupportedUsageClaim(text) {

    if (!text) return false;

    const patterns = [

        /\bterus\s+tarik\s+keluar\b/i,
        /\btak\s+payah\s+setup\b/i,
        /\btak\s+perlu\s+setup\b/i,
        /\btak\s+perlu\s+bawa\s+tripod\b/i,
        /\btak\s+perlu\s+bawa\s+stabilizer\b/i,
        /\btak\s+perlu\s+bawa\s+aksesori\b/i
    ];

    return patterns.some(
        pattern => pattern.test(text)
    );
}


// ============================================================
// BAD LANGUAGE DETECTOR
// ============================================================

function containsBadLanguage(text) {

    if (!text) return false;

    const forbidden = [

        "bawa sekecil apa",
        "ia tebocor",
        "sekalian dengan",
        "ribung-ribung",
        "risok",
        "bagitu",
        "ciamik",
        "dak bagi",
        "bobot tambah",
        "sagap budget",
        "bagi hassle",
        "real talk"
    ];

    const lower =
        text.toLowerCase();

    return forbidden.some(
        phrase =>
            lower.includes(phrase)
    );
}


// ============================================================
// GENERIC AI PHRASES
// ============================================================

function containsGenericAIPhrase(text) {

    if (!text) return false;

    const forbidden = [

        "seperti yang dinyatakan",
        "berdasarkan keterangan produk",
        "berdasarkan deskripsi produk",
        "dalam dunia travel",
        "sebagai seorang traveller",
        "sebagai seorang pengembara",
        "produk ini menawarkan",
        "produk ini memberikan",
        "kelebihan utama produk ini",
        "secara keseluruhan",
        "kesimpulannya",
        "konsepnya agak terus",
        "boleh ditengok dulu"
    ];

    const lower =
        text.toLowerCase();

    return forbidden.some(
        phrase =>
            lower.includes(phrase)
    );
}


// ============================================================
// HARD SELLING
// ============================================================

function containsHardSelling(text) {

    if (!text) return false;

    const forbidden = [

        "jangan lepaskan peluang",
        "grab sekarang",
        "beli sekarang",
        "klik sekarang",
        "jangan tunggu lagi",
        "limited time",
        "best deal",
        "promosi hebat",
        "wajib beli",
        "wajib ada",
        "confirm berbaloi"
    ];

    const lower =
        text.toLowerCase();

    return forbidden.some(
        phrase =>
            lower.includes(phrase)
    );
}


// ============================================================
// NORTHERN WORD COUNT
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

    for (const word of words) {

        const regex =
            new RegExp(
                "\\b" + word + "\\b",
                "gi"
            );

        const matches =
            text.match(regex);

        if (matches) {
            count += matches.length;
        }
    }

    return count;
}


// ============================================================
// HASHTAG COUNT
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
// VALIDATOR
// ============================================================

function validateAIResult(result) {

    if (
        !result ||
        typeof result !== "object"
    ) {

        return {
            valid: false,
            reason: "Invalid AI result"
        };
    }


    if (!Array.isArray(result.parts)) {

        return {
            valid: false,
            reason: "parts is not an array"
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
            typeof part.text !== "string"
        ) {

            return {
                valid: false,
                reason:
                    `Part ${i + 1} has invalid text`
            };
        }


        if (!part.text.trim()) {

            return {
                valid: false,
                reason:
                    `Part ${i + 1} is empty`
            };
        }


        fullText +=
            " " + part.text;
    }


    if (containsURL(fullText)) {

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
                "Possible fabricated personal experience"
        };
    }


    if (
        containsUnsupportedUsageClaim(
            fullText
        )
    ) {

        return {
            valid: false,
            reason:
                "Possible unsupported usage claim"
        };
    }


    if (
        containsBadLanguage(
            fullText
        )
    ) {

        return {
            valid: false,
            reason:
                "Artificial language detected"
        };
    }


    if (
        containsGenericAIPhrase(
            fullText
        )
    ) {

        return {
            valid: false,
            reason:
                "Generic AI phrase detected"
        };
    }


    if (
        containsHardSelling(
            fullText
        )
    ) {

        return {
            valid: false,
            reason:
                "Hard selling detected"
        };
    }


    const northernCount =
        countNorthernWords(
            fullText
        );


    if (northernCount > 4) {

        return {
            valid: false,
            reason:
                `Northern dialect overload (${northernCount})`
        };
    }


    if (
        countHashtags(fullText) > 5
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

async function callGemini(prompt) {

    if (!GEMINI_API_KEY) {

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

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    contents: [

                        {
                            role: "user",

                            parts: [

                                {
                                    text: prompt
                                }

                            ]
                        }

                    ],

                    generationConfig: {

                        temperature: 0.85,

                        topP: 0.9,

                        maxOutputTokens: 1800
                    }
                })
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

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

async function callOpenRouter(prompt) {

    if (!OPENROUTER_API_KEY) {

        throw new Error(
            "OPENROUTER_API_KEY is missing"
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
                        0.85,

                    max_tokens:
                        1800,

                    messages: [

                        {
                            role: "system",

                            content: `
You are helping write Threads stories for
Sofian The Travelling Cat.

CORE FACT:

Sofian is literally a travelling CAT.

He is not a human using a cat persona.

He has human-like intelligence and language,
but remains a cat.

Do not overuse cat jokes.

Do not repeatedly say "meow".

Do not repeatedly say "as a cat".

Let the cat identity influence his perspective naturally.

The user prompt contains the complete V1.9
Thought Process Engine.

Think first.

Write second.

Natural Malaysian conversation is more important
than forced slang.

Never fabricate product experience.

Never invent product facts.

Never generate URLs.
`
                        },

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


    if (GEMINI_API_KEY) {

        providers.push("gemini");
    }


    if (OPENROUTER_API_KEY) {

        providers.push("openrouter");
    }


    if (providers.length === 0) {

        throw new Error(
            "No AI provider configured"
        );
    }


    let lastError = null;


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
                    provider === "gemini"
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
                    cleanJSON(raw);


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
                        "[V1.9] Validation failed:",
                        validation.reason
                    );


                    continue;
                }


                return {

                    provider,

                    model:
                        provider === "gemini"
                            ? GEMINI_MODEL
                            : OPENROUTER_MODEL,

                    result
                };


            } catch (error) {

                lastError =
                    error;


                console.error(
                    `[V1.9] ${provider} attempt ${attempt} failed:`,
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
// AFFILIATE INJECTION
// ============================================================

function injectAffiliateLink(
    result,
    affiliateUrl
) {

    if (!affiliateUrl) {

        throw new Error(
            "Affiliate URL is missing"
        );
    }


    if (
        !Array.isArray(result.parts) ||
        result.parts.length === 0
    ) {

        throw new Error(
            "Invalid story parts"
        );
    }


    // Security:
    // AI must NEVER generate the affiliate URL.
    if (
        containsURL(
            JSON.stringify(result)
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
                "Sofian V1.9 Travelling Cat Engine",

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
                "Sofian V1.9 Travelling Cat Engine",

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


            if (!productName) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "productName is required"
                    });
            }


            if (!productDescription) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "productDescription is required"
                    });
            }


            if (!affiliateUrl) {

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
                    "Sofian V1.9 Travelling Cat Engine",

                sofian_test:
                    "Wallet • Bag • Weight • Hassle • Value",

                character_rule:
                    "Sofian is literally a travelling cat",

                data:
                    finalResult
            });


        } catch (error) {

            console.error(
                "[V1.9] /api/ai/test error:",
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


            if (!productName) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "productName is required"
                    });
            }


            if (!productDescription) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "productDescription is required"
                    });
            }


            if (!affiliateUrl) {

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
                    "Sofian V1.9 Travelling Cat Engine",

                sofian_test:
                    "Wallet • Bag • Weight • Hassle • Value",

                character_rule:
                    "Sofian is literally a travelling cat",

                data:
                    finalResult
            });


        } catch (error) {

            console.error(
                "[V1.9] /api/ai/generate error:",
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
