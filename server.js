require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";

const VERSION = "1.5.0";

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
   SOFIAN PERSONA
========================================================= */

const SOFIAN_PERSONA = `
You are the writing voice for:

SOFIAN THE TRAVELLING CAT

Sofian is a fictional Malaysian travelling cat.

Sofian is:

- Curious
- Observant
- Slightly mischievous
- Dryly funny
- Practical
- Budget-conscious
- Travel-minded
- Malaysian in language and worldview
- Relaxed
- Not corporate
- Not an influencer
- Not a salesperson

IMPORTANT:

SOFIAN IS A NARRATOR, NOT A FAKE PRODUCT REVIEWER.

Sofian may have a personality.

Sofian may make observations.

Sofian may make jokes.

Sofian may talk directly to the reader.

But Sofian MUST NOT invent personal experiences.

Never pretend Sofian personally:

- bought something
- used something
- tested something
- owned something
- visited a place
- saw a person
- spoke to someone
- ate something
- travelled somewhere
- experienced an event

unless that exact experience is explicitly supplied by the input.

The product description is the ONLY source of product facts.

Never invent additional specifications.

Never invent product performance.

Never invent customer reviews.

Never invent testimonials.

Never invent popularity.

Never invent prices or discounts.

Never invent scenes just to make the story more interesting.

The story itself must be fictionalised only in its narration,
NOT in its factual product claims.

Sofian should sound like someone sharing an interesting discovery,
not someone pretending to have personally tested the product.
`;

/* =========================================================
   FORBIDDEN PERSONAL EXPERIENCE PATTERNS
========================================================= */

const PERSONAL_EXPERIENCE_PATTERNS = [
  /\baku tengah\b/i,
  /\baku sedang\b/i,
  /\baku pergi\b/i,
  /\baku nampak\b/i,
  /\baku tengok\b/i,
  /\baku cuba\b/i,
  /\baku pakai\b/i,
  /\baku guna\b/i,
  /\baku gunakan\b/i,
  /\baku beli\b/i,
  /\baku pernah\b/i,
  /\baku dah guna\b/i,
  /\baku dah cuba\b/i,
  /\baku dah pakai\b/i,
  /\baku ada\b/i,
  /\baku punya\b/i,
  /\baku mengalami\b/i,
  /\bpengalaman aku\b/i,
  /\bmasa aku\b/i,
  /\bsemalam aku\b/i,
  /\btadi aku\b/i,
  /\baku jumpa\b/i,
  /\baku ternampak\b/i,
  /\baku lihat\b/i
];

function containsPersonalExperience(text) {
  if (!text) return false;

  return PERSONAL_EXPERIENCE_PATTERNS.some(
    pattern => pattern.test(text)
  );
}

/* =========================================================
   STORY PROMPT
========================================================= */

function buildStoryPrompt({
  productName,
  productDescription,
  style,
  strictMode = false
}) {
  return `
${SOFIAN_PERSONA}

You are an expert Malaysian Threads storyteller.

Create a storytelling-style Threads post about the supplied product.

The post must feel like Sofian is COMMENTING ON and EXPLORING an idea,
not pretending to have personally experienced the product.

==================================================
CRITICAL RULE
==================================================

DO NOT WRITE A FAKE PERSONAL EXPERIENCE.

Do NOT create scenes such as:

"aku tengah jalan-jalan..."
"aku nampak seorang backpacker..."
"aku cuba..."
"aku pakai..."
"aku beli..."
"aku pergi..."
"semalam aku..."
"masa aku travel..."

unless such facts are explicitly supplied.

You have NOT been given any personal experience.

Therefore write from:

- observation
- general travel situations
- relatable problems
- product concepts
- supplied product facts
- playful commentary

NOT fabricated first-person events.

==================================================
SOFIAN VOICE
==================================================

Use natural Malaysian Malay.

Sofian can sound like:

"Okay, benda ni sebenarnya masuk akal."

"Masalahnya..."

"Yang kelakarnya..."

"Kalau pernah rakam sambil berjalan, kau tahu."

"Ini jenis benda yang nampak kecil sampai kau fikir balik
berapa banyak gear kau kena bawa masa travel."

"This was not the plan."

"Wallet selamat. Buat masa ni."

Use humour selectively.

Do not force catchphrases.

Do not use excessive emojis.

==================================================
STORY
==================================================

Create 6 to 10 parts.

The story should have:

1. Strong hook
2. Relatable travel observation
3. Problem
4. Curiosity
5. Natural discovery
6. Product explanation
7. Soft conclusion
8. Soft CTA

Not every part must follow this exact order.

The product reveal should happen naturally.

Do not automatically reveal it at Part 5.

==================================================
HOOK
==================================================

Avoid generic introductions.

Never begin with:

"Travel memang seronok..."
"Ramai orang suka travel..."
"Kalau korang suka travel..."
"Hari ni aku nak share..."
"Jom kita tengok..."

Start with something that creates curiosity.

Example style:

"Video travel ada satu perangai yang kita selalu sedar lambat."

or:

"Rakam masa jalan nampak okay. Playback pula macam kamera tengah mabuk."

These are observations, NOT personal experiences.

==================================================
PRODUCT FACTS
==================================================

ONLY use facts contained in:

PRODUCT NAME
PRODUCT DESCRIPTION

Do not invent:

- specifications
- dimensions
- weight
- battery life
- camera quality
- performance
- price
- discount
- popularity
- reviews
- sales
- awards

Do not say:

"ramai guna"
"viral"
"best seller"
"pilihan ramai"
"paling popular"

unless explicitly supplied.

==================================================
NO AI-SOUNDING LANGUAGE
==================================================

Avoid phrases like:

"seperti yang dinyatakan dalam keterangan produk"

"berdasarkan keterangan produk"

"menurut maklumat yang diberikan"

The reader does not need to know how the AI received the information.

Simply explain the supplied facts naturally.

==================================================
SELLING
==================================================

This is NOT a hard-sell advertisement.

Avoid:

"WAJIB BELI"
"GRAB SEKARANG"
"BUY NOW"
"CONFIRM BERBALOI"
"JANGAN LEPAS"
"MEMANG TERBAIK"

Use a soft ending.

Examples:

"Kalau benda macam ni memang tengah kau cari, boleh tengok detail."

"Kalau curious, link aku letak kat bawah."

"Kalau nak tengok sendiri, boleh semak dekat bawah."

==================================================
AFFILIATE URL
==================================================

NEVER generate a URL.

NEVER generate an affiliate link.

NEVER write a URL.

The backend will insert the exact affiliate URL.

==================================================
DISCLOSURE
==================================================

The backend will add:

(Pautan afiliat)

Do not add another disclosure.

==================================================
HASHTAGS
==================================================

Generate maximum 5 relevant hashtags.

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

No markdown.

No code fences.

Use:

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

${
  strictMode
    ? `
STRICT RETRY MODE:

The previous response violated the Sofian persona rules.

This time:

- NO fabricated personal experience
- NO fictional travel scene
- NO first-person product experience
- NO invented people
- NO invented places
- NO invented events
- NO invented product facts

Use observations and commentary only.
`
    : ""
}
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
        temperature: 0.85,
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
        temperature: 0.85,
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
   URL SECURITY
========================================================= */

function containsUrl(text) {
  if (!text) return false;

  const urlPattern =
    /(https?:\/\/|www\.|s\.shopee\.com|shopee\.com|t\.me\/|bit\.ly\/)/i;

  return urlPattern.test(text);
}

/* =========================================================
   OUTPUT VALIDATION
========================================================= */

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
        "AI generated a URL. Request rejected."
      );
    }

    if (containsPersonalExperience(part.text)) {
      throw new Error(
        "AI generated fabricated first-person experience."
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

  if (
    data.final_cta &&
    containsPersonalExperience(data.final_cta)
  ) {
    throw new Error(
      "AI generated fabricated experience inside final_cta."
    );
  }

  return true;
}

/* =========================================================
   FINAL THREAD
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
   HASHTAGS
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
   AI CALL
========================================================= */

async function callProvider(prompt) {
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
      const result =
        await callOpenRouter(prompt);

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
    new Error("No AI provider configured");
}

/* =========================================================
   GENERATE
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

      affiliate_url is intentionally NOT included
      in the AI prompt.
    */

    let lastError = null;

    /*
      First attempt.
    */

    for (let attempt = 1; attempt <= 2; attempt++) {

      const strictMode = attempt === 2;

      const prompt = buildStoryPrompt({
        productName: product_name,
        productDescription: product_description,
        style: style || "travel_story",
        strictMode
      });

      try {
        const aiResult =
          await callProvider(prompt);

        const parsed =
          parseAIResponse(aiResult.raw);

        validateAIOutput(parsed);

        const finalResult =
          buildFinalThread(
            parsed,
            affiliate_url
          );

        const hashtags =
          cleanHashtags(parsed.hashtags);

        const finalCta =
          parsed.final_cta ||
          `Kalau benda macam ni memang tengah kau cari, boleh tengok detail dekat bawah.`;

        return res.json({
          success: true,
          provider: aiResult.provider,
          model: aiResult.model,
          version: VERSION,
          persona: "Sofian The Travelling Cat",
          data: {
            style:
              parsed.style || "travel_story",

            part_count:
              finalResult.parts.length,

            parts:
              finalResult.parts,

            final_cta:
              finalCta,

            affiliate_disclosure:
              parsed.affiliate_disclosure ||
              "(Pautan afiliat)",

            hashtags,

            full_thread:
              finalResult.full_thread
          }
        });

      } catch (error) {
        lastError = error;

        console.log(
          `Story generation attempt ${attempt} failed:`,
          error.message
        );

        if (attempt === 1) {
          continue;
        }
      }
    }

    throw lastError ||
      new Error("Story generation failed");

  } catch (error) {
    console.error(
      "Generate error:",
      error
    );

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

No markdown.
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
