require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        app: "StoryAff AI",
        version: "1.1.0",
        status: "online",
        ai: GEMINI_API_KEY ? "connected" : "not_configured"
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
                                text: "Reply with exactly: StoryAff AI Gemini connection successful."
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

    if (!GEMINI_API_KEY) {
        return res.status(500).json({
            success: false,
            error: "GEMINI_API_KEY is not configured in Render."
        });
    }

    try {

        const {
            product_name,
            product_description,
            affiliate_url,
            style = "personal_story"
        } = req.body;

        if (!product_name) {
            return res.status(400).json({
                success: false,
                error: "product_name is required."
            });
        }

        // ==========================================
        // STORY PROMPT
        // ==========================================

        const prompt = `
You are StoryAff AI.

Your job is to create a natural, engaging Malaysian Malay storytelling thread for an affiliate product.

PRODUCT NAME:
${product_name}

PRODUCT DESCRIPTION:
${product_description || "No additional description provided."}

AFFILIATE URL:
${affiliate_url || ""}

STORY STYLE:
${style}

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
- contain the affiliate link
- contain the affiliate disclosure

==========================================
AFFILIATE LINK RULE
==========================================

CRITICAL:

The affiliate URL:

${affiliate_url || ""}

MUST NOT appear anywhere in Parts 1 through 9.

The affiliate URL may ONLY appear in the FINAL PART.

If the story contains 6 parts, the link appears in Part 6.

If the story contains 7 parts, the link appears in Part 7.

If the story contains 8 parts, the link appears in Part 8.

If the story contains 9 parts, the link appears in Part 9.

If the story contains 10 parts, the link appears in Part 10.

The URL must remain EXACTLY as provided.

Do not shorten it.
Do not modify it.
Do not create another URL.

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
  "hashtags": [],
  "full_thread": ""
}

IMPORTANT:

part_count MUST be between 6 and 10.

The number of objects inside "parts" MUST equal part_count.

The affiliate URL MUST appear ONLY in the final part.

The affiliate URL MUST also appear in "full_thread" only where the final part appears.

Do not put the affiliate URL in any other field.
`;

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

The affiliate URL must only appear in the final part.
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
            return res.status(response.status).json({
                success: false,
                error: "Gemini API error",
                details: data
            });
        }

        const aiText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        let result;

        try {
            result = JSON.parse(aiText);
        } catch (parseError) {

            return res.status(500).json({
                success: false,
                error: "Gemini returned invalid JSON.",
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
                error: "AI response does not contain valid parts."
            });
        }

        const partCount = result.parts.length;

        if (partCount < 6 || partCount > 10) {
            return res.status(500).json({
                success: false,
                error: "AI generated an invalid number of parts.",
                part_count: partCount
            });
        }

        // ==========================================
        // AFFILIATE LINK SECURITY CHECK
        // ==========================================

        if (affiliate_url) {

            let earlyPartContainsLink = false;

            for (let i = 0; i < result.parts.length - 1; i++) {

                if (
                    result.parts[i].text &&
                    result.parts[i].text.includes(affiliate_url)
                ) {
                    earlyPartContainsLink = true;
                }
            }

            if (earlyPartContainsLink) {

                return res.status(500).json({
                    success: false,
                    error: "Security check failed: affiliate URL appeared before the final part."
                });
            }

            const finalPart =
                result.parts[result.parts.length - 1];

            if (
                !finalPart.text ||
                !finalPart.text.includes(affiliate_url)
            ) {

                return res.status(500).json({
                    success: false,
                    error: "Security check failed: affiliate URL is missing from the final part."
                });
            }
        }

        // ==========================================
        // BUILD FULL THREAD
        // ==========================================

        const fullThread = result.parts
            .map((part) => part.text)
            .join("\n\n");

        result.full_thread = fullThread;
        result.part_count = partCount;

        return res.json({
            success: true,
            model: GEMINI_MODEL,
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
        message: "Threads API will be connected in the next stage."
    });
});

// ==========================================
// PRODUCTS
// ==========================================

app.get("/api/products", (req, res) => {

    res.json({
        success: true,
        products: [],
        message: "Shopee affiliate product engine will be connected in the next stage."
    });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log("=================================");
    console.log("       STORYAFF AI BACKEND");
    console.log("=================================");
    console.log("Server running on port " + PORT);
    console.log("Gemini model: " + GEMINI_MODEL);
    console.log(
        "Gemini API key: " +
        (GEMINI_API_KEY ? "CONFIGURED" : "NOT CONFIGURED")
    );

});
