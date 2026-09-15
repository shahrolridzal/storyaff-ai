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
        version: "1.2.0",
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
// HELPER - WAIT
// ==========================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// GEMINI CALL
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
You are StoryAff AI.

You are a careful Malaysian affiliate storytelling writer.

Never fabricate product facts.

Never fabricate personal experiences.

Never fabricate testimonials.

Always obey the 6-10 part storytelling structure.

IMPORTANT:
The backend will handle the affiliate URL separately.

DO NOT create, invent, modify, or include any URL.

DO NOT include any affiliate link.

The final part should contain a natural CTA and affiliate disclosure wording,
but NOT the actual URL.

Return ONLY valid JSON.
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
                temperature: 0.85,
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
        const error = new Error("Gemini returned an empty response.");
        error.status = 502;
        error.provider = "gemini";

        throw error;
    }

    return aiText;
}

// ==========================================
// GEMINI WITH RETRY
// ==========================================

async function callGeminiWithRetry(prompt) {

    const maxAttempts = 2;

    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {

        try {

            console.log(
                `Gemini attempt ${attempt}/${maxAttempts}`
            );

            const result = await callGemini(prompt);

            console.log("Gemini request successful.");

            return result;

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

            console.log("Retrying Gemini in 1500ms...");

            await sleep(1500);
        }
    }

    throw lastError;
}

// ==========================================
// OPENROUTER CALL
// ==========================================

async function callOpenRouter(prompt) {

    if (!OPENROUTER_API_KEY) {

        const error = new Error(
            "OPENROUTER_API_KEY is not configured."
        );

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
You are StoryAff AI.

You are a careful Malaysian affiliate storytelling writer.

Never fabricate product facts.

Never fabricate personal experiences.

Never fabricate testimonials.

Always obey the 6-10 part storytelling structure.

IMPORTANT:
The backend will handle the affiliate URL separately.

DO NOT create, invent, modify, or include any URL.

DO NOT include any affiliate link.

The final part should contain a natural CTA and affiliate disclosure wording,
but NOT the actual URL.

Return ONLY valid JSON.
`
                    },

                    {
                        role: "user",
                        content: prompt
                    }
                ],

                temperature: 0.85
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

        const error = new Error(
            "OpenRouter returned an empty response."
        );

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
            error: "GEMINI_API_KEY is not configured in Render."
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
            message: "Gemini AI is connected successfully.",
            model: GEMINI_MODEL,
            response: aiText
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            error: "Failed to connect to Gemini.",
            details: error.message
        });
    }
});

// ==========================================
// AI THREADS STORY GENERATOR
// ==========================================

app.post("/api/ai/generate", async (req, res) => {

    if (!GEMINI_API_KEY && !OPENROUTER_API_KEY) {

        return res.status(500).json({
            success: false,
            error:
                "No AI provider is configured. Please configure Gemini or OpenRouter."
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
        // VALIDATION
        // ==========================================

        if (!product_name) {

            return res.status(400).json({
                success: false,
                error: "product_name is required."
            });
        }

        if (!affiliate_url) {

            return res.status(400).json({
                success: false,
                error: "affiliate_url is required."
            });
        }

        // ==========================================
        // STORY PROMPT
        // ==========================================

        const prompt = `
You are StoryAff AI.

Create a natural, engaging Malaysian Malay storytelling thread for an affiliate product.

PRODUCT NAME:
${product_name}

PRODUCT DESCRIPTION:
${product_description || "No additional description provided."}

STORY STYLE:
${style}

IMPORTANT:
The affiliate URL is handled by the backend.

DO NOT include any URL in your response.

==========================================
STORY STRUCTURE
==========================================

Create a storytelling thread with:

MINIMUM: 6 parts
MAXIMUM: 10 parts

You decide the number of parts based on how much storytelling is actually needed.

Do NOT automatically make every story 10 parts.

Use 6 parts when the story can be told effectively in 6 parts.

Use more parts when additional storytelling, curiosity, explanation or context genuinely improves the story.

Every part must move the story forward.

==========================================
PART STRUCTURE
==========================================

PART 1

Strong hook.

The first part must make people curious enough to continue reading.

Do not reveal the product immediately unless necessary.

PART 2

Introduce the situation, problem, observation or context.

PART 3+

Develop the story naturally.

You may use:

- curiosity
- problem
- discovery
- realization
- comparison
- useful information
- unexpected observation
- travel situation
- funny moment

The exact structure depends on the product and selected style.

FINAL PART

The final part must:

- conclude the story
- provide a natural CTA
- contain a natural affiliate disclosure

DO NOT include the actual affiliate URL.

The backend will insert the exact affiliate URL after the AI response.

==========================================
WRITING STYLE
==========================================

Write in casual Malaysian Malay.

The writing should feel like a real person posting on Threads.

Avoid corporate language.

Avoid sounding like an advertisement.

Do not make every sentence perfect or overly formal.

Use natural Malaysian expressions where appropriate.

Do not overuse emojis.

Do not use fake personal experiences.

Do not claim the writer personally used the product unless that information is explicitly provided.

Do not create fake testimonials.

Do not invent:

- prices
- discounts
- specifications
- awards
- reviews
- ratings
- results
- guarantees
- product features

Only use information provided in the product description.

==========================================
THREADS READABILITY
==========================================

Each part should be relatively short and easy to read.

Use line breaks where appropriate.

Avoid giant paragraphs.

The reader should naturally want to continue to the next part.

Do not start every part with:

"Part 1"
"Part 2"
etc.

The API will identify the parts separately.

==========================================
HASHTAGS
==========================================

Generate maximum 5 relevant hashtags.

Do not use irrelevant trending hashtags.

==========================================
AFFILIATE DISCLOSURE
==========================================

The final part must clearly disclose that the link is an affiliate link.

Use natural Malaysian wording such as:

"(Pautan afiliat)"

==========================================
OUTPUT
==========================================

Return ONLY valid JSON.

Use exactly this structure:

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

IMPORTANT:

part_count MUST be between 6 and 10.

The number of objects inside "parts" MUST equal part_count.

DO NOT include any URL anywhere in the JSON.

DO NOT create any URL.

DO NOT modify any URL.

DO NOT mention the affiliate URL.
`;

        // ==========================================
        // AI PROVIDER
        // ==========================================

        let aiText = "";
        let providerUsed = "";

        // ------------------------------------------
        // TRY GEMINI FIRST
        // ------------------------------------------

        if (GEMINI_API_KEY) {

            try {

                aiText =
                    await callGeminiWithRetry(prompt);

                providerUsed = "gemini";

            } catch (geminiError) {

                console.log(
                    "Gemini failed. Trying OpenRouter fallback..."
                );

                console.log(
                    "Gemini error:",
                    geminiError.message
                );
            }
        }

        // ------------------------------------------
        // FALLBACK TO OPENROUTER
        // ------------------------------------------

        if (!aiText && OPENROUTER_API_KEY) {

            try {

                aiText =
                    await callOpenRouter(prompt);

                providerUsed = "openrouter";

            } catch (openRouterError) {

                console.log(
                    "OpenRouter failed:",
                    openRouterError.message
                );

                return res.status(502).json({
                    success: false,
                    error: "Both AI providers failed.",
                    gemini: "failed",
                    openrouter: "failed",
                    details: openRouterError.message
                });
            }
        }

        if (!aiText) {

            return res.status(502).json({
                success: false,
                error:
                    "AI generation failed. No fallback provider available."
            });
        }

        // ==========================================
        // PARSE AI JSON
        // ==========================================

        let result;

        try {

            result = JSON.parse(aiText);

        } catch (parseError) {

            return res.status(500).json({
                success: false,
                error: "AI returned invalid JSON.",
                provider: providerUsed,
                raw_response: aiText
            });
        }

        // ==========================================
        // BASIC VALIDATION
        // ==========================================

        if (
            !result.parts ||
            !Array.isArray(result.parts)
        ) {

            return res.status(500).json({
                success: false,
                error:
                    "AI response does not contain valid parts.",
                provider: providerUsed
            });
        }

        const partCount = result.parts.length;

        if (partCount < 6 || partCount > 10) {

            return res.status(500).json({
                success: false,
                error:
                    "AI generated an invalid number of parts.",
                part_count: partCount,
                provider: providerUsed
            });
        }

        // ==========================================
        // CHECK THAT AI DID NOT GENERATE URL
        // ==========================================

        const urlPattern =
            /(https?:\/\/|www\.|s\.shopee\.com|shopee\.com)/i;

        let aiGeneratedUrl = false;

        for (const part of result.parts) {

            if (
                part.text &&
                urlPattern.test(part.text)
            ) {
                aiGeneratedUrl = true;
                break;
            }
        }

        if (aiGeneratedUrl) {

            return res.status(500).json({
                success: false,
                error:
                    "Security check failed: AI generated a URL. No affiliate link was inserted.",
                provider: providerUsed
            });
        }

        // ==========================================
        // FINAL PART
        // ==========================================

        const finalPartIndex =
            result.parts.length - 1;

        let finalPart =
            result.parts[finalPartIndex].text || "";

        // Remove accidental duplicate disclosure
        finalPart =
            finalPart
                .replace(/\(Pautan afiliat\)/gi, "")
                .trim();

        // ==========================================
        // BACKEND INSERTS EXACT AFFILIATE URL
        // ==========================================

        finalPart =
            `${finalPart}\n\n👉 ${affiliate_url}\n(Pautan afiliat)`;

        result.parts[finalPartIndex].text =
            finalPart;

        // ==========================================
        // FINAL CTA
        // ==========================================

        if (!result.final_cta) {

            result.final_cta =
                "Kalau nak tengok detail produk, boleh check link di bawah.";
        }

        if (!result.affiliate_disclosure) {

            result.affiliate_disclosure =
                "(Pautan afiliat)";
        }

        // ==========================================
        // BUILD FULL THREAD
        // ==========================================

        const fullThread =
            result.parts
                .map((part) => part.text)
                .join("\n\n");

        result.full_thread = fullThread;
        result.part_count = partCount;

        // ==========================================
        // FINAL SECURITY CHECK
        // ==========================================

        for (let i = 0; i < result.parts.length - 1; i++) {

            if (
                result.parts[i].text &&
                result.parts[i].text.includes(affiliate_url)
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
                    "Security check failed: exact affiliate URL missing from final part."
            });
        }

        // ==========================================
        // SUCCESS
        // ==========================================

        return res.json({
            success: true,

            provider: providerUsed,

            model:
                providerUsed === "gemini"
                    ? GEMINI_MODEL
                    : OPENROUTER_MODEL,

            data: result
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            error: "AI generation failed.",
            details: error.message
        });
    }
});

// ==========================================
// AVAILABLE STORY STYLES
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
