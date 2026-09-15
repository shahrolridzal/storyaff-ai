require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";

const VERSION = "1.4.0";

/* =========================================================
   BASIC
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    app: "StoryAff AI",
    version: VERSION,
    status: "online"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    version: VERSION,
    gemini_configured: !!GEMINI_API_KEY,
    openrouter_configured: !!OPENROUTER_API_KEY
  });
});

/* =========================================================
   PERSONA
========================================================= */

const SOFIAN_PERSONA = `
You are writing content for a fictional travel persona called:

SOFIAN THE TRAVELLING CAT

Sofian is a Malaysian travelling cat who loves exploring places,
food, transport, travel gear, weird discoveries and useful things
that make travelling easier.

PERSONALITY:

- Curious
- Observant
- Slightly mischievous
- Dry sense of humour
- Sometimes sarcastic, but never rude
- Practical
- Budget-conscious
- Adventurous
- Easily distracted by interesting things
- Malaysian in worldview and language
- Sounds like a real person posting on Threads
- Does NOT sound like an influencer
- Does NOT sound like a corporate brand
- Does NOT sound like an advertisement

SOFIAN'S WRITING STYLE:

Use natural Malaysian Malay.

Casual is good.

Examples of natural expressions:

"Entah macam mana..."
"Okay..."
"Aku ingat..."
"Rupanya..."
"Masalahnya..."
"Yang peliknya..."
"Sampai sini..."
"Tak plan pun sebenarnya."
"Ini memang tak dijangka."
"Wallet selamat. Buat masa ni."
"Apparently..."
"This was not the plan."

Do NOT force these phrases into every post.

Do NOT overuse emojis.

Do NOT make every sentence funny.

Humour should come naturally from observation.

Sofian should feel like a travelling friend telling a story,
not an affiliate marketer trying to close a sale.

IMPORTANT:

Sofian is a fictional persona.

Never claim that Sofian personally bought, used, tested,
owned, visited or experienced a product unless the input
explicitly provides that information.

Never invent personal experiences.

Never invent reviews or testimonials.
`;

/* =========================================================
   STORY PROMPT
========================================================= */

function buildStoryPrompt({
  productName,
  productDescription,
  style
}) {
  return `
${SOFIAN_PERSONA}

You are also an expert Threads storyteller.

Your task is to create a short Threads story around the supplied product.

The purpose is NOT to write an advertisement.

The purpose is to make people:

1. Stop scrolling
2. Recognise a relatable situation
3. Become curious
4. Follow the story
5. Discover the product naturally
6. Understand why the product may be relevant
7. Reach the final soft CTA

==================================================
STORY STRUCTURE
==================================================

Create between 6 and 10 parts.

You decide the appropriate number.

Do NOT mechanically follow the same structure every time.

A strong story usually contains:

- HOOK
- CONTEXT
- PROBLEM / OBSERVATION
- ESCALATION OR CURIOSITY
- DISCOVERY
- PRODUCT CONNECTION
- CONCLUSION
- SOFT CTA

The product should NOT automatically be revealed at Part 5.

Choose the reveal point naturally.

The first few parts should work as a story even before
the reader knows what product is being discussed.

==================================================
HOOK
==================================================

Part 1 must create curiosity.

Avoid generic openings such as:

"Travel memang seronok..."
"Ramai orang suka melancong..."
"Kalau korang suka travel..."
"Jom kita tengok..."
"Hari ni aku nak share..."

Instead, begin with:

- an observation
- an unexpected problem
- a funny situation
- a contradiction
- a small travel disaster
- an oddly specific situation

The reader should feel:

"Eh, aku pernah kena."

or:

"Kenapa benda ni betul?"

or:

"Okay, what happened next?"

==================================================
STORYTELLING
==================================================

Do not make every part a standalone advertisement sentence.

Each part should naturally lead to the next.

Use short and medium sentences.

Vary sentence length.

Occasionally use a very short sentence for emphasis.

Example:

"Aku ingat dah settle.

Rupanya belum."

Use paragraphs naturally.

Do not over-explain.

==================================================
PRODUCT REVEAL
==================================================

The product should feel discovered rather than announced.

BAD:

"Peralatan yang dimaksudkan ialah DJI Osmo Pocket 3."

BETTER:

"Kat situ baru aku faham kenapa kamera kecil macam ni wujud."

Then reveal the product naturally.

Do not use dramatic fake hype.

==================================================
PRODUCT FACTS
==================================================

Only use information explicitly supplied in:

PRODUCT NAME
PRODUCT DESCRIPTION

Do not invent specifications.

Do not invent prices.

Do not invent discounts.

Do not invent ratings.

Do not invent sales numbers.

Do not invent popularity.

Do not say:

"ramai guna"
"viral"
"best seller"
"pilihan ramai"
"paling popular"
"everyone is buying this"

unless those facts are explicitly provided.

==================================================
PERSONAL EXPERIENCE
==================================================

Never write:

"Aku dah guna..."
"Aku cuba..."
"Aku beli..."
"Aku pakai..."
"Pengalaman aku..."

unless the input explicitly states that Sofian personally
did those things.

The persona is fictional.

Do not fake first-hand experience.

==================================================
SELLING STYLE
==================================================

Avoid hard selling.

Do NOT use:

"WAJIB BELI"
"JANGAN LEPAS"
"GRAB SEKARANG"
"BUY NOW"
"CONFIRM BERBALOI"
"MEMANG TERBAIK"

Use a soft ending instead.

Examples:

"Kalau benda macam ni memang tengah kau cari, boleh tengok detail."

"Kalau curious, aku letak link dekat bawah."

"Kalau nak tengok sendiri, link aku letak kat bawah."

==================================================
AFFILIATE LINK
==================================================

NEVER generate any URL.

NEVER generate an affiliate link.

NEVER modify a URL.

NEVER put a URL in the response.

The backend will insert the affiliate link later.

==================================================
DISCLOSURE
==================================================

The final part will contain:

(Pautan afiliat)

Do not write another affiliate disclosure elsewhere.

==================================================
HASHTAGS
==================================================

Generate a maximum of 5 relevant hashtags.

Avoid generic spammy hashtag lists.

Prefer specific relevant hashtags.

==================================================
OUTPUT FORMAT
==================================================

Return ONLY valid JSON.

Do not use markdown.

Do not wrap JSON in code fences.

Use exactly this structure:

{
  "style": "travel_story",
  "part_count": 7,
  "parts": [
    {
      "part": 1,
      "text": "..."
    }
  ],
  "final_cta": "...",
  "affiliate_disclosure": "(Pautan afiliat)",
  "hashtags": [
    "#..."
  ]
}

==================================================
INPUT
==================================================

Product name:
${productName}

Product description:
${productDescription}

Requested style:
${style || "travel_story"}
`;
}

/* =========================================================
   GEMINI
========================================================= */

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [
          {
            text: SOFIAN_PERSONA
          }
        ]
      },
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
        temperature: 0.9,
        responseMimeType: "application/json"
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data?.error?.message ||
      `Gemini request failed with status ${response.status}`;

    const error = new Error(errorMessage);
    error.status = response.status;

    throw error;
  }

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return text;
}

/* =========================================================
   OPENROUTER
========================================================= */

async function callOpenRouter(prompt) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://storyaff-ai.onrender.com",
        "X-Title": "StoryAff AI"
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        temperature: 0.9,
        messages: [
          {
            role: "system",
            content: SOFIAN_PERSONA
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data?.error?.message ||
      `OpenRouter request failed with status ${response.status}`;

    const error = new Error(errorMessage);
    error.status = response.status;

    throw error;
  }

  const text =
    data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("OpenRouter returned an empty response");
  }

  return text;
}

/* =========================================================
   JSON CLEANER
========================================================= */

function cleanJsonText(text) {
  if (!text) {
    throw new Error("AI response is empty");
  }

  let cleaned = text.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  return cleaned;
}

function parseAIResponse(text) {
  const cleaned = cleanJsonText(text);

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      const possibleJson =
        cleaned.substring(firstBrace, lastBrace + 1);

      return JSON.parse(possibleJson);
    }

    throw new Error("AI returned invalid JSON");
  }
}

/* =========================================================
   SECURITY
========================================================= */

function containsUrl(text) {
  if (!text) return false;

  const urlPattern =
    /(https?:\/\/|www\.|s\.shopee\.com|shopee\.com|t\.me\/|bit\.ly\/)/i;

  return urlPattern.test(text);
}

function validateAIOutput(data) {
  if (!data || typeof data !== "object") {
    throw new Error("AI output is not an object");
  }

  if (!Array.isArray(data.parts)) {
    throw new Error("AI output does not contain parts");
  }

  if (data.parts.length < 6 || data.parts.length > 10) {
    throw new Error(
      `Invalid part count: ${data.parts.length}. Must be 6-10.`
    );
  }

  for (const part of data.parts) {
    if (
      !part ||
      typeof part.part !== "number" ||
      typeof part.text !== "string"
    ) {
      throw new Error("Invalid story part structure");
    }

    if (containsUrl(part.text)) {
      throw new Error(
        "AI generated a URL. Request rejected for affiliate-link security."
      );
    }
  }

  if (data.final_cta && containsUrl(data.final_cta)) {
    throw new Error(
      "AI generated a URL inside final_cta."
    );
  }

  if (
    data.affiliate_disclosure &&
    containsUrl(data.affiliate_disclosure)
  ) {
    throw new Error(
      "AI generated a URL inside affiliate_disclosure."
    );
  }

  return true;
}

/* =========================================================
   FINAL THREAD BUILDER
========================================================= */

function buildFinalThread(data, affiliateUrl) {
  const parts = [...data.parts];

  const finalIndex = parts.length - 1;

  const finalText =
    parts[finalIndex].text.trim();

  const disclosure =
    data.affiliate_disclosure ||
    "(Pautan afiliat)";

  parts[finalIndex].text =
    `${finalText}\n\n👉 ${affiliateUrl}\n${disclosure}`;

  const fullThread =
    parts
      .map(part => part.text.trim())
      .join("\n\n");

  return {
    parts,
    full_thread: fullThread
  };
}

/* =========================================================
   HASHTAG CLEANER
========================================================= */

function cleanHashtags(hashtags) {
  if (!Array.isArray(hashtags)) {
    return [];
  }

  return hashtags
    .filter(item => typeof item === "string")
    .map(item => item.trim())
    .filter(item => item.startsWith("#"))
    .slice(0, 5);
}

/* =========================================================
   AI GENERATION
========================================================= */

async function generateWithFallback(prompt) {
  let geminiError = null;

  if (GEMINI_API_KEY) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await callGemini(prompt);

        return {
          provider: "gemini",
          model: GEMINI_MODEL,
          raw: result
        };
      } catch (error) {
        geminiError = error;

        const status = error.status;

        const retryable =
          status === 429 ||
          status === 500 ||
          status === 502 ||
          status === 503 ||
          status === 504;

        if (!retryable || attempt === 2) {
          break;
        }

        await new Promise(resolve =>
          setTimeout(resolve, 1200)
        );
      }
    }
  }

  if (OPENROUTER_API_KEY) {
    try {
      const result = await callOpenRouter(prompt);

      return {
        provider: "openrouter",
        model: OPENROUTER_MODEL,
        raw: result
      };
    } catch (openRouterError) {
      throw new Error(
        `Gemini failed: ${
          geminiError?.message || "unknown error"
        }. OpenRouter failed: ${
          openRouterError?.message || "unknown error"
        }`
      );
    }
  }

  throw geminiError ||
    new Error("No AI provider is configured");
}

/* =========================================================
   GENERATE ENDPOINT
========================================================= */

app.post("/api/ai/generate", async (req, res) => {
  try {
    const {
      product_name,
      product_description,
      affiliate_url,
      style
    } = req.body;

    if (!product_name) {
      return res.status(400).json({
        success: false,
        error: "product_name is required"
      });
    }

    if (!product_description) {
      return res.status(400).json({
        success: false,
        error: "product_description is required"
      });
    }

    if (!affiliate_url) {
      return res.status(400).json({
        success: false,
        error: "affiliate_url is required"
      });
    }

    /*
      IMPORTANT:
      Affiliate URL is never sent to AI.
    */

    const prompt = buildStoryPrompt({
      productName: product_name,
      productDescription: product_description,
      style: style || "travel_story"
    });

    const aiResult =
      await generateWithFallback(prompt);

    const parsed =
      parseAIResponse(aiResult.raw);

    validateAIOutput(parsed);

    const finalResult =
      buildFinalThread(parsed, affiliate_url);

    const hashtags =
      cleanHashtags(parsed.hashtags);

    const finalCta =
      parsed.final_cta ||
      `Kalau nak tengok detail ${product_name}, boleh semak dekat bawah.`;

    return res.json({
      success: true,
      provider: aiResult.provider,
      model: aiResult.model,
      version: VERSION,
      persona: "Sofian The Travelling Cat",
      data: {
        style: parsed.style || "travel_story",
        part_count: finalResult.parts.length,
        parts: finalResult.parts,
        final_cta: finalCta,
        affiliate_disclosure:
          parsed.affiliate_disclosure ||
          "(Pautan afiliat)",
        hashtags,
        full_thread:
          finalResult.full_thread
      }
    });

  } catch (error) {
    console.error("Generate error:", error);

    return res.status(500).json({
      success: false,
      version: VERSION,
      error: error.message
    });
  }
});

/* =========================================================
   GEMINI TEST
========================================================= */

app.post("/api/ai/test", async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "GEMINI_API_KEY is not configured"
      });
    }

    const prompt = `
Return ONLY this JSON:

{
  "message": "StoryAff AI Gemini connection successful."
}

Do not add markdown.
`;

    const result =
      await callGemini(prompt);

    const parsed =
      parseAIResponse(result);

    return res.json({
      success: true,
      message: parsed.message,
      model: GEMINI_MODEL,
      version: VERSION
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      version: VERSION
    });
  }
});

/* =========================================================
   SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(
    `StoryAff AI v${VERSION} running on port ${PORT}`
  );
});
