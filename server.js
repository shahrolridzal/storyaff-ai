require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        app: "StoryAff AI",
        version: "1.0.0",
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
// AI STORY GENERATOR
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

        const prompt = `
You are StoryAff AI, an affiliate content writer for Malaysian audiences.

Create a natural Threads-style affiliate post about this product.

PRODUCT:
${product_name}

DESCRIPTION:
${product_description || "No additional description provided."}

AFFILIATE URL:
${affiliate_url || ""}

STYLE:
${style}

IMPORTANT RULES:

1. Write in casual Malaysian Malay.
2. Make it sound like a real person sharing something useful.
3. Do NOT invent product specifications.
4. Do NOT invent prices.
5. Do NOT invent personal experiences.
6. Do NOT create fake testimonials.
7. Do NOT make unsupported claims.
8. Do not sound like a hard-selling advertisement.
9. The affiliate URL must remain exactly as provided.
10. Include a simple affiliate disclosure.
11. Maximum 5 hashtags.
12. Make the opening hook interesting.
13. The post should be suitable for Threads.
14. Avoid excessive emojis.
15. Keep the story concise and readable.

Return ONLY valid JSON using exactly this structure:

{
  "hook": "",
  "story": "",
  "cta": "",
  "affiliate_disclosure": "",
  "hashtags": [],
  "full_post": ""
}
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
                            text: "You are a careful Malaysian affiliate content writer. Never fabricate facts."
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
                    temperature: 0.8,
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
