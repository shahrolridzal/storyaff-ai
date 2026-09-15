require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL =
    process.env.OPENROUTER_MODEL || "openrouter/free";

// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        app: "StoryAff AI",
        version: "1.3.0",
        status: "online",
        ai: {
            gemini: GEMINI_API_KEY ? "configured" : "not_configured",
            openrouter: OPENROUTER_API_KEY ? "configured" : "not_configured"
        }
    });
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// WAIT
// ==========================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// GEMINI
// ==========================================

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
            systemInstruction: {
                parts: [
                    {
                        text: `
You are StoryAff AI, an expert Malaysian Threads storyteller.

Your job is NOT to write advertisements.

Your job is to create stories that make people stop scrolling,
continue reading, become curious, and only then discover the product.

IMPORTANT RULES:

1. Never fabricate product facts.
2. Never fabricate personal experiences.
3. Never fabricate testimonials.
4. Never claim something is popular, viral, bestselling,
   widely used, or chosen by many people unless that information
   is explicitly provided.
5. Never invent prices, discounts, ratings, reviews, awards,
   specifications, results or guarantees.
6. Only use facts explicitly provided in PRODUCT DESCRIPTION.
7. Never create or include URLs.
8. The backend will insert the affiliate URL separately.
9. Do not mention the actual affiliate URL.
10. Return ONLY valid JSON.

The story should feel like a Malaysian person sharing something
interesting on Threads, NOT like a salesperson.
`
                    }
                ]
            },

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
                temperature: 0.9,
                responseMimeType: "application/json"
            }
        })
    });

    const data = await response.json();

    if (!response.ok) {

        const error = new Error(
            data?.error?.message ||
            `Gemini request failed with status ${response.status}`
        );

        error.status = response.status;
        error.provider = "gemini";
        error.details = data;

        throw error;
    }

    const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!aiText) {

        const error =
            new Error("Gemini returned an empty response.");

        error.status = 502;
        error.provider = "gemini";

        throw error;
    }

    return aiText;
}

// ==========================================
// GEMINI RETRY
// ==========================================

async function callGeminiWithRetry(prompt) {

    const maxAttempts = 2;

    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {

        try {

            console.log(
                `Gemini attempt ${attempt}/${maxAttempts}`
            );

            return await callGemini(prompt);

        } catch (error) {

            lastError = error;

            console.log(
                `Gemini attempt ${attempt} failed:`,
                error.message
            );

            const status = error.status;

            const retryable =
                status === 429 ||
                status === 500 ||
                status === 502 ||
                status === 503 ||
                status === 504;

            if (!retryable || attempt === maxAttempts) {
                break;
            }

            await sleep(1500);
        }
    }

    throw lastError;
}

// ==========================================
// OPENROUTER
// ==========================================

async function callOpenRouter(prompt) {

    if (!OPENROUTER_API_KEY) {

        const error =
            new Error("OPENROUTER_API_KEY is not configured.");

        error.status = 500;
        error.provider = "openrouter";

        throw error;
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
                model: OPENROUTER_MODEL,

                messages: [
                    {
                        role: "system",
                        content: `
You are StoryAff AI, an expert Malaysian Threads storyteller.

Your job is NOT to write advertisements.

Your job is to create stories that make people stop scrolling,
continue reading, become curious, and only then discover the product.

Never fabricate product facts.

Never fabricate personal experiences.

Never fabricate testimonials.

Never claim something is popular, viral, bestselling,
widely used, or chosen by many people unless explicitly provided.

Never invent prices, discounts, ratings, reviews, awards,
specifications, results or guarantees.

Only use facts explicitly provided in PRODUCT DESCRIPTION.

Never create or include URLs.

The backend will insert the affiliate URL separately.

Return ONLY valid JSON.
`
                    },

                    {
                        role: "user",
                        content: prompt
                    }
                ],

                temperature: 0.9
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {

        const error = new Error(
            data?.error?.message ||
            `OpenRouter request failed with status ${response.status}`
        );

        error.status = response.status;
        error.provider = "openrouter";
        error.details = data;

        throw error;
    }

    const aiText =
        data?.choices?.[0]?.message?.content || "";

    if (!aiText) {

        const error =
            new Error("OpenRouter returned an empty response.");

        error.status = 502;
        error.provider = "openrouter";

        throw error;
    }

    return aiText;
}

// ==========================================
// AI TEST
// ==========================================

app.get("/api/ai/test", async (req, res) => {

    if (!GEMINI_API_KEY) {

        return res.status(500).json({
            success: false,
            error:
                "GEMINI_API_KEY is not configured in Render."
        });
    }

    try {

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
                                text:
                                    "Reply with exactly: StoryAff AI Gemini connection successful."
                            }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {

            return res.status(response.status).json({
                success: false,
                error: "Gemini API error",
                details: data
            });
        }

        const aiText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        return res.json({
            success: true,
            message:
                "Gemini AI is connected successfully.",
            model: GEMINI_MODEL,
            response: aiText
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            error:
                "Failed to connect to Gemini.",
            details: error.message
        });
    }
});

// ==========================================
// STORY GENERATOR
// ==========================================

app.post("/api/ai/generate", async (req, res) => {

    if (!GEMINI_API_KEY && !OPENROUTER_API_KEY) {

        return res.status(500).json({
            success: false,
            error:
                "No AI provider is configured."
        });
    }

    try {

        const {
            product_name,
            product_description,
            affiliate_url,
            style = "personal_story"
        } = req.body;

        // ==========================================
        // INPUT VALIDATION
        // ==========================================

        if (!product_name) {

            return res.status(400).json({
                success: false,
                error:
                    "product_name is required."
            });
        }

        if (!affiliate_url) {

            return res.status(400).json({
                success: false,
                error:
                    "affiliate_url is required."
            });
        }

        // ==========================================
        // STORY PROMPT
        // ==========================================

        const prompt = `
You are creating a Malaysian Threads storytelling post.

PRODUCT NAME:
${product_name}

PRODUCT DESCRIPTION:
${product_description || "No additional description provided."}

STORY STYLE:
${style}

==========================================
MAIN OBJECTIVE
==========================================

Create a story that feels natural enough that someone would
actually stop and read it on Threads.

This is NOT a product advertisement.

The product should feel like the answer to a story,
not the reason the story exists.

==========================================
STORY LENGTH
==========================================

Minimum: 6 parts
Maximum: 10 parts

You decide the correct number.

Do not force 10 parts.

Use 6 if the story is complete in 6.

Use 7-10 only when additional storytelling genuinely helps.

==========================================
STORY ARC
==========================================

Use this general structure:

PART 1 — HOOK

Start with something that creates curiosity.

Good examples of hook types:

- annoying travel problem
- unexpected observation
- relatable frustration
- surprising realization
- "baru sedar" moment
- question that makes people think
- small problem that becomes bigger

Do NOT start like an advertisement.

Do NOT mention the product immediately unless it is genuinely
necessary for the hook.

------------------------------------------

PART 2 — CONTEXT

Explain what happened.

Make the situation relatable.

------------------------------------------

PART 3 — PROBLEM

Show why the situation is annoying, inconvenient,
interesting or worth solving.

------------------------------------------

PART 4 — CURIOSITY

Build anticipation.

Make the reader want to know what solution was discovered.

Do not reveal the product too early.

------------------------------------------

PART 5 — DISCOVERY / REVEAL

Introduce the product naturally.

The reveal should feel like:

"Oh, rupanya benda ni yang dia jumpa."

Not:

"BUY THIS PRODUCT NOW."

------------------------------------------

PART 6+

Explain only the relevant product facts provided
in PRODUCT DESCRIPTION.

Connect those facts to the original problem.

Do not invent benefits beyond the provided facts.

------------------------------------------

FINAL PART

Close the story naturally.

Use a soft CTA.

Include the affiliate disclosure wording:

(Pautan afiliat)

DO NOT include the affiliate URL.

The backend will insert the exact URL.

==========================================
IMPORTANT WRITING RULE
==========================================

Never make unsupported claims such as:

"ramai orang guna"

"viral"

"best seller"

"everyone is buying"

"pilihan ramai"

"benda ni tengah trending"

"confirm berbaloi"

unless those facts are explicitly present in PRODUCT DESCRIPTION.

Instead, describe only what is actually known.

==========================================
NATURAL MALAYSIAN STYLE
==========================================

Use casual Malaysian Malay.

Natural words are allowed:

- korang
- memang
- sebenarnya
- rupanya
- leceh
- benda ni
- nak
- tak
- je
- bila
- sebab tu

But do not overuse slang.

Avoid corporate copywriting.

Avoid excessive emojis.

Avoid fake enthusiasm.

Avoid repetitive sentence structures.

Vary sentence length.

Make the story feel written by a real person.

==========================================
NO FAKE EXPERIENCE
==========================================

Do not say:

"Aku dah guna..."

"Semalam aku test..."

"Aku memang suka..."

unless that experience was explicitly provided.

The writer is NOT allowed to pretend they personally used the product.

==========================================
NO URL
==========================================

DO NOT create any URL.

DO NOT include:

https://

www.

Shopee links

affiliate links

or any other URL.

==========================================
HASHTAGS
==========================================

Generate maximum 5 relevant hashtags.

Avoid generic spam hashtags.

==========================================
OUTPUT
==========================================

Return ONLY valid JSON.

Use exactly:

{
  "style": "",
  "part_count": 0,
  "parts": [
    {
      "part": 1,
      "text": ""
    }
  ],
  "final_cta": "",
  "affiliate_disclosure": "",
  "hashtags": []
}

Do not include full_thread.

The backend will create full_thread.

Do not include the affiliate URL.
`;

        // ==========================================
        // AI PROVIDER
        // ==========================================

        let aiText = "";
        let providerUsed = "";

        // Gemini first

        if (GEMINI_API_KEY) {

            try {

                aiText =
                    await callGeminiWithRetry(prompt);

                providerUsed = "gemini";

            } catch (geminiError) {

                console.log(
                    "Gemini failed. Falling back to OpenRouter."
                );

                console.log(
                    geminiError.message
                );
            }
        }

        // OpenRouter fallback

        if (!aiText && OPENROUTER_API_KEY) {

            try {

                aiText =
                    await callOpenRouter(prompt);

                providerUsed = "openrouter";

            } catch (openRouterError) {

                return res.status(502).json({
                    success: false,
                    error:
                        "Both AI providers failed.",
                    details:
                        openRouterError.message
                });
            }
        }

        if (!aiText) {

            return res.status(502).json({
                success: false,
                error:
                    "AI generation failed."
            });
        }

        // ==========================================
        // PARSE JSON
        // ==========================================

        let result;

        try {

            result =
                JSON.parse(aiText);

        } catch (parseError) {

            return res.status(500).json({
                success: false,
                error:
                    "AI returned invalid JSON.",
                provider:
                    providerUsed,
                raw_response:
                    aiText
            });
        }

        // ==========================================
        // PART VALIDATION
        // ==========================================

        if (
            !result.parts ||
            !Array.isArray(result.parts)
        ) {

            return res.status(500).json({
                success: false,
                error:
                    "AI response does not contain valid parts."
            });
        }

        const partCount =
            result.parts.length;

        if (
            partCount < 6 ||
            partCount > 10
        ) {

            return res.status(500).json({
                success: false,
                error:
                    "AI generated an invalid number of parts.",
                part_count:
                    partCount
            });
        }

        // ==========================================
        // URL SECURITY
        // ==========================================

        const urlPattern =
            /(https?:\/\/|www\.|s\.shopee\.com|shopee\.com)/i;

        for (const part of result.parts) {

            if (
                part.text &&
                urlPattern.test(part.text)
            ) {

                return res.status(500).json({
                    success: false,
                    error:
                        "Security check failed: AI generated a URL."
                });
            }
        }

        // ==========================================
        // FINAL PART
        // ==========================================

        const finalPartIndex =
            result.parts.length - 1;

        let finalPart =
            result.parts[finalPartIndex].text || "";

        finalPart =
            finalPart
                .replace(
                    /\(Pautan afiliat\)/gi,
                    ""
                )
                .trim();

        finalPart =
            `${finalPart}\n\n👉 ${affiliate_url}\n(Pautan afiliat)`;

        result.parts[finalPartIndex].text =
            finalPart;

        // ==========================================
        // CTA
        // ==========================================

        if (!result.final_cta) {

            result.final_cta =
                "Kalau nak tengok detail, boleh check link di bawah.";
        }

        if (!result.affiliate_disclosure) {

            result.affiliate_disclosure =
                "(Pautan afiliat)";
        }

        // ==========================================
        // HASHTAGS
        // ==========================================

        if (
            !Array.isArray(result.hashtags)
        ) {

            result.hashtags = [];
        }

        result.hashtags =
            result.hashtags.slice(0, 5);

        // ==========================================
        // FULL THREAD
        // ==========================================

        result.full_thread =
            result.parts
                .map(part => part.text)
                .join("\n\n");

        result.part_count =
            partCount;

        // ==========================================
        // FINAL URL SECURITY
        // ==========================================

        for (
            let i = 0;
            i < result.parts.length - 1;
            i++
        ) {

            if (
                result.parts[i].text &&
                result.parts[i].text.includes(
                    affiliate_url
                )
            ) {

                return res.status(500).json({
                    success: false,
                    error:
                        "Security check failed: affiliate URL appeared before final part."
                });
            }
        }

        if (
            !result.parts[finalPartIndex].text.includes(
                affiliate_url
            )
        ) {

            return res.status(500).json({
                success: false,
                error:
                    "Security check failed: exact affiliate URL missing."
            });
        }

        // ==========================================
        // SUCCESS
        // ==========================================

        return res.json({
            success: true,

            provider:
                providerUsed,

            model:
                providerUsed === "gemini"
                    ? GEMINI_MODEL
                    : OPENROUTER_MODEL,

            data:
                result
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            error:
                "AI generation failed.",
            details:
                error.message
        });
    }
});

// ==========================================
// STORY STYLES
// ==========================================

app.get("/api/ai/styles", (req, res) => {

    res.json({
        success: true,

        styles: [
            {
                id: "personal_story",
                name: "Personal Story"
            },
            {
                id: "problem_solution",
                name: "Problem → Solution"
            },
            {
                id: "curiosity",
                name: "Curiosity"
            },
            {
                id: "funny",
                name: "Funny"
            },
            {
                id: "discovery",
                name: "Discovery"
            },
            {
                id: "baru_tahu",
                name: "Baru Tahu"
            },
            {
                id: "travel_story",
                name: "Travel Story"
            },
            {
                id: "comparison",
                name: "Comparison"
            },
            {
                id: "mini_review",
                name: "Mini Review"
            },
            {
                id: "soft_sell",
                name: "Soft Sell"
            }
        ]
    });
});

// ==========================================
// THREADS STATUS
// ==========================================

app.get("/api/threads/status", (req, res) => {

    res.json({
        success: true,
        status: "not_connected",
        message:
            "Threads API will be connected in the next stage."
    });
});

// ==========================================
// PRODUCTS
// ==========================================

app.get("/api/products", (req, res) => {

    res.json({
        success: true,
        products: [],
        message:
            "Shopee affiliate product engine will be connected in the next stage."
    });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log("=================================");
    console.log("       STORYAFF AI BACKEND");
    console.log("=================================");

    console.log(
        "Server running on port " + PORT
    );

    console.log(
        "Gemini model: " + GEMINI_MODEL
    );

    console.log(
        "OpenRouter model: " + OPENROUTER_MODEL
    );

    console.log(
        "Gemini API key: " +
        (
            GEMINI_API_KEY
                ? "CONFIGURED"
                : "NOT CONFIGURED"
        )
    );

    console.log(
        "OpenRouter API key: " +
        (
            OPENROUTER_API_KEY
                ? "CONFIGURED"
                : "NOT CONFIGURED"
        )
    );
});
