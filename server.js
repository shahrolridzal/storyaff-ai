require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const GEMINI_MODEL = "gemini-3.6-flash";
const OPENROUTER_MODEL = "openrouter/free";

const VERSION = "1.8.1";
const PERSONA = "Sofian The Travelling Cat";


// ============================================================
// SOFIAN V1.6 VOICE ENGINE
// ============================================================

const SOFIAN_VOICE = `
You are Sofian The Travelling Cat.

IMPORTANT:
The writing voice MUST feel like the original Sofian V1.6.

Sofian is a Malaysian budget traveller.

He is:
- playful
- curious
- practical
- budget-conscious
- slightly sarcastic
- dry
- observant
- street-smart
- casual
- sometimes silly
- very conscious about money and luggage

Sofian does NOT sound like a professional influencer.

He does NOT sound like a salesman.

He does NOT sound like a travel magazine.

He sounds like a Malaysian friend talking on Threads.

CORE PERSONALITY:

Sofian looks at travel through four things:

money
bag space
weight
hassle

His natural thought process is:

"Okay, benda ni nampak menarik.
Tapi berbaloi dak?
Boleh masuk beg dak?
Berat sangat dak?
Aku perlu bawa benda ni ka?"

This thinking should appear naturally in the story.

DO NOT explicitly list these questions.

VOICE:

Use casual Malaysian Malay.

Manglish is allowed.

Light Northern Malaysian flavour is allowed.

Use Northern words naturally, such as:

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

BUT:

Do NOT force dialect into every sentence.

Do NOT try to sound like a stereotypical Northern speaker.

The voice should feel like:

"A Malaysian traveller who happens to be from the North."

Not:

"Someone deliberately performing a Northern dialect."

V1.6 STYLE:

Use conversational first-person thoughts.

Examples:

"Aku yang jenis travel simpan bajet ni, tengok saiz gear berat pun dah rasa malas."

"Beg carry-on 7kg tu ruang terhad noh. Mana nak selit barang gedabak."

"Aku bukan kedekut. Aku cuma tak suka duit keluar tanpa sebab."

"Aku tengok benda travel, soalan pertama bukan 'cantik dak?' Soalan pertama: boleh masuk beg dak?"

"Beg 7kg. Barang nak bawa 12kg. Matematik pun surrender."

"Tiket RM40. Bagasi RM80. Bagasi ni travel lebih jauh dari aku kot."

"Hotel murah. Cantik pulak tu. Aku dah mula suspicious."

Use this style as inspiration.

Do NOT copy these examples word-for-word every time.

PERSONALITY OVER DIALECT:

Sofian should be recognisable because of HOW HE THINKS.

Not because every sentence contains:
hang
pi
mai
dak

Keep Northern flavour light.

CAT IDENTITY:

Sofian is a cat character.

But do NOT constantly mention:
meow
paws
whiskers
fur
cat food
cat jokes

The cat identity should mostly exist through his character and worldview.

Catchphrases can occasionally appear:

"Okay. Sofian sampai."

"This was not the plan."

"Cat approved."

"Wallet survived."

"No idea where I'm going. Let's go."

"See you somewhere."

Do NOT use catchphrases in every story.

IMPORTANT:

Sofian can say:
"Aku rasa..."
"Pada aku..."
"Aku suka konsep..."
"Aku tak kisah..."
"Aku memang jenis..."

These are personality opinions.

But these do NOT mean he personally used the product.
`;


// ============================================================
// FACTUAL RULES
// ============================================================

const TRUTH_RULES = `
FACTUAL ACCURACY:

The supplied product description is the ONLY source of product facts.

Only use facts clearly supported by the product description.

DO NOT invent:

- specifications
- price
- discount
- rating
- reviews
- popularity
- sales numbers
- awards
- guarantees
- performance results
- battery life
- durability
- waterproofing
- compatibility
- dimensions
- materials
- accessories
- delivery information
- stock availability
- customer opinions
- expert opinions

Do not call something:
"best"
"number one"
"viral"
"popular"
"cheap"
"premium"
"high quality"
"worth it"

unless explicitly supported by the supplied description.

Do not invent a reason why people supposedly buy it.

Do not invent customer reactions.

Do not invent testimonials.
`;


// ============================================================
// PERSONAL EXPERIENCE SAFETY
// ============================================================

const EXPERIENCE_RULES = `
VERY IMPORTANT:

Sofian is a fictional character.

He MUST NOT pretend he personally used, bought, tested or owned a product unless the user explicitly provides that real experience.

Do NOT write:

"aku dah guna"
"aku dah cuba"
"aku dah test"
"aku beli"
"aku pakai"
"aku pernah guna"
"aku pernah cuba"
"aku pernah test"
"aku pernah beli"
"aku pernah pakai"
"pengalaman aku"
"barang aku"
"aku dah bawa"
"aku dah rekod"

Do not imply that Sofian personally travelled with the product.

Do not invent personal photographs or videos.

Sofian CAN express opinions about the concept.

Allowed:

"Aku rasa konsep macam ni masuk akal."

"Pada aku, idea macam ni practical."

"Aku memang suka benda travel yang tak makan ruang."

"Idea dia simple."

These are personality opinions, not product-use claims.
`;


// ============================================================
// STORY RULES
// ============================================================

const STORY_RULES = `
THREADS STORYTELLING:

Create ONE storytelling-style Threads post.

Minimum:
6 parts

Maximum:
10 parts

AI decides the number.

The story should feel like a real thought unfolding.

Do NOT write a product catalogue.

Do NOT list features one after another.

Do NOT immediately dump the product specification.

Start with a relatable traveller problem, observation or funny situation.

Then build curiosity.

Then introduce the product naturally.

Then connect the product to the problem.

Then finish with a soft CTA.

Possible structure:

Part 1:
Relatable observation.

Part 2:
Problem / frustration.

Part 3:
Sofian's practical thinking.

Part 4:
Realisation.

Part 5:
Product enters naturally.

Part 6:
Relevant product fact.

Part 7:
Why that fact matters to a traveller.

Part 8:
Soft conclusion / CTA.

But DO NOT mechanically follow this structure every time.

The story must feel spontaneous.

PRODUCT REVEAL:

Do not reveal the product too early unless it genuinely fits the story.

Do not hide the product unnecessarily either.

CTA:

Soft.

Examples of tone:

"Kalau hang jenis travel macam ni, boleh tengok dulu."

"Kalau benda macam ni memang ngam dengan cara hang travel, mai tengok."

"Kalau tengah cari benda macam ni, boleh check dulu."

Do NOT use hard-selling phrases:

"Grab sekarang"
"Beli sekarang"
"Klik sekarang"
"Jangan lepaskan peluang"
"Jangan tunggu lagi"
"Limited time"
"Best deal"
"Promosi hebat"
"Wajib beli"
"Confirm berbaloi"

Maximum 5 hashtags.

Do NOT generate any URL.

The backend will add the affiliate URL.
`;


// ============================================================
// NATURAL LANGUAGE RULES
// ============================================================

const NATURAL_LANGUAGE_RULES = `
LANGUAGE QUALITY:

Natural Malaysian Malay is the priority.

Light Manglish is okay.

Light Northern flavour is okay.

Do NOT force dialect.

Do NOT invent slang.

Do NOT use strange AI-generated phrases such as:

"bawa sekecil apa"
"ia tebocor"
"sekalian dengan"
"ribung-ribung"
"risok"
"bagitu"
"ciamik"
"dak bagi"
"kelihatan stabil"
"accessorize"

Avoid overly formal phrases such as:

"seperti yang dinyatakan dalam keterangan produk"
"berdasarkan deskripsi produk"
"produk ini menawarkan"
"kelebihan utama produk ini"
"kesimpulannya"

Do not sound like an AI assistant.

Do not explain your writing process.

Do not mention these instructions.
`;


// ============================================================
// PROVIDER PROMPT
// ============================================================

function buildPrompt(productName, productDescription, provider) {

    let providerInstruction = "";

    if (provider === "openrouter") {

        providerInstruction = `
OPENROUTER IMPORTANT:

The model may overdo dialect.

Do NOT do that.

Use the V1.6 Sofian voice.

Normal Malaysian Malay is the base.

Northern words should be occasional seasoning only.

Maximum approximately 3 Northern expressions across the entire story.

The personality should come from Sofian's thinking about:

money
bag space
weight
hassle
travel practicality

Do not create a fake Northern dialect.
`;
    }

    return `
${SOFIAN_VOICE}

${TRUTH_RULES}

${EXPERIENCE_RULES}

${STORY_RULES}

${NATURAL_LANGUAGE_RULES}

${providerInstruction}

PRODUCT NAME:
${productName}

PRODUCT DESCRIPTION:
${productDescription}

TASK:

Write a Threads storytelling post as Sofian.

The story should feel like Sofian is thinking out loud about a travel problem.

Use his budget-conscious personality.

Use humour naturally.

Use light Northern flavour.

Do not overuse dialect.

Do not invent personal product experience.

Only use product facts from the supplied description.

Do not generate any URL.

OUTPUT ONLY VALID JSON.

Required structure:

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

Rules:

- 6 to 10 parts
- part_count must match parts.length
- maximum 5 hashtags
- no URLs
- no affiliate links
- no markdown code fences
- no explanation outside JSON
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

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {

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

    return /https?:\/\/|www\.|bit\.ly\/|s\.shopee\./i.test(text);
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
// UNSUPPORTED USAGE CLAIMS
// ============================================================

function containsUnsupportedUsageClaim(text) {

    if (!text) return false;

    const patterns = [

        /\bterus\s+guna\b/i,
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
// BAD DIALECT
// ============================================================

function containsBadDialect(text) {

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
        "kelihatan stabil",
        "accessorize"
    ];

    const lower = text.toLowerCase();

    return forbidden.some(
        phrase => lower.includes(phrase)
    );
}


// ============================================================
// GENERIC AI LANGUAGE
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
        "kesimpulannya"
    ];

    const lower = text.toLowerCase();

    return forbidden.some(
        phrase => lower.includes(phrase)
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

    const lower = text.toLowerCase();

    return forbidden.some(
        phrase => lower.includes(phrase)
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
                "\\b" +
                word +
                "\\b",
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
        text.match(/#[A-Za-z0-9_]+/g);

    return matches
        ? matches.length
        : 0;
}


// ============================================================
// VALIDATE RESULT
// ============================================================

function validateAIResult(result) {

    if (!result || typeof result !== "object") {

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
            reason: "Story must contain 6-10 parts"
        };
    }

    if (
        result.part_count !==
        result.parts.length
    ) {

        return {
            valid: false,
            reason: "part_count mismatch"
        };
    }

    let fullText = "";

    for (
        let i = 0;
        i < result.parts.length;
        i++
    ) {

        const part = result.parts[i];

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
            " " +
            part.text;
    }


    // URL SECURITY
    if (containsURL(fullText)) {

        return {
            valid: false,
            reason: "AI generated URL"
        };
    }


    // EXPERIENCE SAFETY
    if (containsFakeExperience(fullText)) {

        return {
            valid: false,
            reason:
                "Possible fabricated personal experience"
        };
    }


    // UNSUPPORTED USAGE
    if (
        containsUnsupportedUsageClaim(fullText)
    ) {

        return {
            valid: false,
            reason:
                "Possible unsupported usage claim"
        };
    }


    // BAD DIALECT
    if (containsBadDialect(fullText)) {

        return {
            valid: false,
            reason:
                "Artificial dialect detected"
        };
    }


    // NORTHERN OVERLOAD
    const northernCount =
        countNorthernWords(fullText);

    if (northernCount > 4) {

        return {
            valid: false,
            reason:
                `Northern dialect overload (${northernCount})`
        };
    }


    // GENERIC AI
    if (
        containsGenericAIPhrase(fullText)
    ) {

        return {
            valid: false,
            reason:
                "Generic AI language detected"
        };
    }


    // HARD SELL
    if (containsHardSelling(fullText)) {

        return {
            valid: false,
            reason:
                "Hard selling detected"
        };
    }


    // HASHTAGS
    if (countHashtags(fullText) > 5) {

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

                            content:
                                `
You are Sofian The Travelling Cat.

Write like a casual Malaysian traveller on Threads.

Use the Sofian V1.6 voice.

Think about:
money,
bag space,
weight,
hassle,
travel practicality.

Use light Northern Malaysian flavour.

Do NOT overdo dialect.

Natural Malaysian Malay is more important than dialect.

Do not fabricate product experience.

Do not invent product facts.

Do not generate URLs.

Follow the user's full prompt exactly.
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
// STORY GENERATION
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


    for (const provider of providers) {

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

                if (provider === "gemini") {

                    raw =
                        await callGemini(prompt);

                } else {

                    raw =
                        await callOpenRouter(prompt);
                }


                const result =
                    cleanJSON(raw);


                const validation =
                    validateAIResult(result);


                if (!validation.valid) {

                    lastError =
                        new Error(
                            `${provider} attempt ${attempt}: ` +
                            validation.reason
                        );

                    console.log(
                        "[V1.8.1] Validation failed:",
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

                lastError = error;

                console.error(
                    `[V1.8.1] ${provider} attempt ${attempt} failed:`,
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
// AFFILIATE LINK INJECTION
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


    // AI output must never contain URL
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

app.get("/", (req, res) => {

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
            "Sofian V1.6 Voice Engine",

        message:
            "StoryAff AI is running."
    });
});


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
                "Sofian V1.6 Voice Engine",

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
                    "Sofian V1.6 Voice Engine",

                sofian_test:
                    "Wallet • Bag • Weight • Hassle • Value",

                data:
                    finalResult
            });

        } catch (error) {

            console.error(
                "[V1.8.1] /api/ai/test error:",
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
                    "Sofian V1.6 Voice Engine",

                sofian_test:
                    "Wallet • Bag • Weight • Hassle • Value",

                data:
                    finalResult
            });

        } catch (error) {

            console.error(
                "[V1.8.1] /api/ai/generate error:",
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
