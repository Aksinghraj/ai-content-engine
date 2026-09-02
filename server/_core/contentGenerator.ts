import { invokeLLM, type Message } from "./llm";

interface ContentGenerationInput {
  niche: string;
  targetAudience: string;
  platform: string;
  goal: string;
  contentStyle: string;
  language?: string;
  videoLength?: string;
  scriptLength?: string;
  customVideoSeconds?: number;
  customScriptWordTarget?: number;
  trendingTopics?: string[];
  referenceDocumentText?: string;
  referenceImageUrl?: string;
}

interface GeneratedContent {
  viralIdeas: string[];
  bestIdea: {
    idea: string;
    rationale: string;
  };
  hooks: string[];
  script: {
    hook: string;
    mainContent: string;
    ending: string;
  };
  caption: string;
  hashtags: string[];
  carousel: {
    slide1: string;
    slides2to6: string[];
    slide7: string;
  };
  repurpose: {
    twitterThread: string[];
    linkedInPost: string;
    youtubeShorts: string;
  };
  optimizationTips: {
    bestPostingTime: string;
    suggestedVisuals: string[];
    engagementTricks: string[];
  };
}

export async function generateContentPackage(
  input: ContentGenerationInput
): Promise<GeneratedContent> {
  const prompt = buildContentPrompt(input);

  try {
    const userContent: Message["content"] = input.referenceImageUrl
      ? [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: input.referenceImageUrl, detail: "high" } },
        ]
      : prompt;
    const messages: Message[] = [
      {
        role: "system",
        content: "You are a senior social media scriptwriter and content strategist. Write natural, fluent content that sounds excellent when read aloud. Avoid generic filler, repeated ideas, awkward phrasing, and unsupported claims. Follow the requested language, platform, content style, video duration, and script word target precisely. Structure the main script as Hook, Body, and CTA. Always return valid JSON matching the supplied schema.",
      },
      {
        role: "user",
        content: userContent,
      },
    ];

    const response = await invokeLLM({
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "content_package",
          schema: {
            type: "object",
            properties: {
              viralIdeas: {
                type: "array",
                items: { type: "string" },
                description: "10 viral content ideas",
              },
              bestIdea: {
                type: "object",
                properties: {
                  idea: { type: "string" },
                  rationale: { type: "string" },
                },
                required: ["idea", "rationale"],
              },
              hooks: {
                type: "array",
                items: { type: "string" },
                description: "5 scroll-stopping hooks",
              },
              script: {
                type: "object",
                properties: {
                  hook: { type: "string" },
                  mainContent: { type: "string" },
                  ending: { type: "string" },
                },
                required: ["hook", "mainContent", "ending"],
              },
              caption: { type: "string" },
              hashtags: {
                type: "array",
                items: { type: "string" },
                description: "20 hashtags",
              },
              carousel: {
                type: "object",
                properties: {
                  slide1: { type: "string" },
                  slides2to6: {
                    type: "array",
                    items: { type: "string" },
                  },
                  slide7: { type: "string" },
                },
                required: ["slide1", "slides2to6", "slide7"],
              },
              repurpose: {
                type: "object",
                properties: {
                  twitterThread: {
                    type: "array",
                    items: { type: "string" },
                  },
                  linkedInPost: { type: "string" },
                  youtubeShorts: { type: "string" },
                },
                required: ["twitterThread", "linkedInPost", "youtubeShorts"],
              },
              optimizationTips: {
                type: "object",
                properties: {
                  bestPostingTime: { type: "string" },
                  suggestedVisuals: {
                    type: "array",
                    items: { type: "string" },
                  },
                  engagementTricks: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["bestPostingTime", "suggestedVisuals", "engagementTricks"],
              },
            },
            required: [
              "viralIdeas",
              "bestIdea",
              "hooks",
              "script",
              "caption",
              "hashtags",
              "carousel",
              "repurpose",
              "optimizationTips",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from LLM");
    }

    const contentString = typeof content === "string" ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentString);
    return normalizeContentPackage(parsed);
  } catch (error) {
    console.error("Content generation failed:", error);
    throw error;
  }
}

function getLanguageName(language: string): string {
  const map: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    hinglish: "Hinglish",
    ta: "Tamil",
    te: "Telugu",
    kn: "Kannada",
    ml: "Malayalam",
    mr: "Marathi",
    gu: "Gujarati",
    bn: "Bengali",
    pa: "Punjabi",
    bho: "Bhojpuri", as: "Assamese", brx: "Bodo", doi: "Dogri", ks: "Kashmiri", kok: "Konkani", mai: "Maithili", mni: "Manipuri", ne: "Nepali", or: "Odia", sa: "Sanskrit", sat: "Santali", sd: "Sindhi", ur: "Urdu",
  };
  return map[language] || "English";
}

function getDetailedLanguageInstructions(language: string): string {
  const instructions: Record<string, string> = {
    en: "Generate content in clear, engaging English suitable for social media.",
    hi: "Generate ALL content in Hindi. Use simple and engaging Hindi language. Make it relatable and viral-worthy.",
    hinglish: "Generate content in Hinglish - mix Hindi and English naturally. Use casual, trendy language that resonates with Indian youth. Make it fun and relatable.",
    ta: "Generate ALL content in Tamil. Use engaging and simple Tamil language suitable for social media.",
    te: "Generate ALL content in Telugu. Use engaging and simple Telugu language suitable for social media.",
    kn: "Generate ALL content in Kannada. Use engaging and simple Kannada language suitable for social media.",
    ml: "Generate ALL content in Malayalam. Use engaging and simple Malayalam language suitable for social media.",
    mr: "Generate ALL content in Marathi. Use engaging and simple Marathi language suitable for social media.",
    gu: "Generate ALL content in Gujarati. Use engaging and simple Gujarati language suitable for social media.",
    bn: "Generate ALL content in Bengali. Use engaging and simple Bengali language suitable for social media.",
    pa: "Generate ALL content in Punjabi. Use engaging and simple Punjabi language suitable for social media.",
    bho: "Generate ALL content in natural Bhojpuri. Use simple, respectful, engaging Bhojpuri vocabulary and grammar suitable for social media. Do not silently switch to Hindi or English.",
  };
  const languageName = getLanguageName(language);
  return instructions[language] || (languageName !== "English" ? `Generate ALL content in natural, respectful ${languageName}. Do not silently switch to English; use the appropriate script and social-media style for ${languageName}.` : instructions.en);
}

function getVideoLengthInstructions(videoLength: string, customVideoSeconds?: number): string {
  if (videoLength === "custom" && customVideoSeconds) {
    const estimatedWords = Math.round(customVideoSeconds * 2.5);
    return `Make the complete spoken script approximately ${customVideoSeconds} seconds long (target about ${estimatedWords} words at a natural pace, with a hard minimum of ${Math.max(25, Math.floor(estimatedWords * 0.9))} words). This is a long-form request when the duration is 3 minutes or more; write the full narrative rather than a short summary.`;
  }
  const instructions: Record<string, string> = {
    "15s": "Make the script exactly 15 seconds when read aloud (about 35-40 words). Ultra-short, punchy, one key message.",
    "30s": "Make the script exactly 30 seconds when read aloud (about 75-80 words). Quick hook, one main point, strong CTA.",
    "60s": "Make the script exactly 60 seconds when read aloud (about 150-160 words). Hook, 2-3 key points, engaging CTA.",
    "90s": "Make the script exactly 90 seconds when read aloud (about 225-240 words). Hook, detailed content with 3-4 points, memorable ending.",
    "3min": "Make the complete spoken script exactly 3 minutes when read aloud (target 450-480 words, never less than 410 words). Use a full storytelling arc with hook, setup, problem, solution, examples, transitions, and CTA.",
    "5min": "Make the complete spoken script exactly 5 minutes when read aloud (target 750-800 words, never less than 680 words). Use a comprehensive deep dive with hook, setup, multiple clearly developed sections, examples, transitions, and a strong conclusion.",
    "short": "Make the script 30-45 seconds when read aloud (about 75-100 words). Quick, punchy, high-energy.",
    "long": "Make the complete spoken script 2-5 minutes when read aloud (about 300-750 words), but follow a longer selected video duration as the authoritative target. Use detailed, storytelling-driven sections rather than compressing the answer.",
  };
  return instructions[videoLength] || instructions["60s"];
}

function getScriptLengthInstructions(scriptLength: string, customScriptWordTarget?: number): string {
  if (scriptLength === "custom" && customScriptWordTarget) {
    return `Target approximately ${customScriptWordTarget} words for the complete script. Keep the hook, body, and CTA proportionate to this target.`;
  }
  const instructions: Record<string, string> = {
    "brief": "Keep the script brief and concise - maximum 50 words total. One hook, one point, one CTA.",
    "short": "Keep the script short - about 100-150 words. Quick hook, 1-2 main points, brief CTA.",
    "medium": "Make the script medium length - about 200-300 words. Proper structure with hook, 3 main points, and engaging CTA.",
    "long": "Make the script long and detailed - about 400-600 words. Full narrative with hook, multiple sections, examples, transitions, and powerful conclusion.",
    "extended": "Make the script extended/comprehensive - about 800-1200 words. Deep-dive content with storytelling, multiple examples, data points, and thorough conclusion.",
  };
  return instructions[scriptLength] || instructions["medium"];
}

function buildContentPrompt(input: ContentGenerationInput): string {
  const languageCode = input.language || "en";
  const languageName = getLanguageName(languageCode);
  const languageInstructions = getDetailedLanguageInstructions(languageCode);
  const videoLengthInstructions = getVideoLengthInstructions(input.videoLength || "60s", input.customVideoSeconds);
  const scriptLengthInstructions = getScriptLengthInstructions(input.scriptLength || "medium", input.customScriptWordTarget);
  const durationSeconds = input.videoLength === "custom" ? input.customVideoSeconds || 0 : ({ "15s": 15, "30s": 30, "60s": 60, "90s": 90, "3min": 180, "5min": 300 } as Record<string, number>)[input.videoLength || "60s"] || 60;
  const longFormDirection = durationSeconds >= 180 ? `
LONG-FORM PRIORITY:
The selected duration is ${Math.round(durationSeconds / 60)} minutes. The video duration is authoritative over any shorter script-length preset. Generate the entire script at approximately ${Math.round(durationSeconds * 2.5)} words, not a 2-3 minute summary. Divide the body into substantial scenes or chapters with transitions, visual direction, character/action beats where appropriate, and a satisfying ending. This must work for cartoon storytelling, faceless narration, explainers, documentaries, tutorials, and story-led channels. Do not stop after the hook and a few paragraphs.` : "";

  // Build trending topics section
  let trendingSection = "";
  if (input.trendingTopics && input.trendingTopics.length > 0) {
    trendingSection = `
CURRENT TRENDING TOPICS IN THIS NICHE:
${input.trendingTopics.map((t, i) => `${i + 1}. ${t}`).join("\n")}

CRITICAL: You MUST incorporate these trending topics into your content ideas, hooks, and scripts. Make the content feel current and timely by referencing these trends. Blend the user's niche with what's trending right now to maximize virality and relevance.`;
  } else {
    trendingSection = `
TRENDING CONTENT STRATEGY:
Since you are an expert in the "${input.niche}" niche, generate content that references current cultural moments, viral formats, and trending topics in this space. Think about what's currently popular and viral in this niche and create content that rides those trends.`;
  }

  return `Generate a complete, high-engagement content package in ${languageName}.

Content Details:
- Niche: ${input.niche}
- Target Audience: ${input.targetAudience}
- Platform: ${input.platform}
- Goal: ${input.goal}
- Content Style: ${input.contentStyle}
- Video Length: ${input.videoLength === "custom" ? `${input.customVideoSeconds} seconds (custom)` : input.videoLength || "60s"}
- Script Length: ${input.scriptLength === "custom" ? `${input.customScriptWordTarget} words (custom)` : input.scriptLength || "medium"}

${languageInstructions}

VIDEO/SCRIPT LENGTH REQUIREMENTS:
${videoLengthInstructions}
${scriptLengthInstructions}
${longFormDirection}

  ${trendingSection}

  REFERENCE MATERIAL:
  ${input.referenceDocumentText?.trim() || "No document reference was provided."}

  WRITING QUALITY AND SCRIPT RULES:
  - The script must sound natural when spoken aloud, with varied sentence rhythm.
  - Use a strong first-line hook, useful body beats, and a goal-aligned CTA.
  - Target the requested script length within approximately 10% when feasible; do not pad with repetition.
  - Respect both short-form and long-form requests, including custom duration and word targets; for 3+ minute selections, never collapse the script into a 2-3 minute summary.
  - Use only the supplied live trend titles as factual trend context; never invent metrics or claim a trend is live without evidence.
  - Use reference material only as context; do not expose private file contents outside the generated package.

  CRITICAL INSTRUCTION: Generate EVERY SINGLE piece of content (all viral ideas, hooks, scripts, captions, hashtags, carousel slides, tweets, LinkedIn posts, YouTube descriptions, and tips) ENTIRELY in ${languageName}. Do NOT use English unless the language is English or Hinglish. Everything must be in ${languageName}.

Return a JSON object with this exact structure:
{
  "viralIdeas": ["idea1", "idea2", ..., "idea10"],
  "bestIdea": {
    "idea": "The #1 most viral idea incorporating current trends",
    "rationale": "Why this will perform well given current trends"
  },
  "hooks": ["hook1", "hook2", "hook3", "hook4", "hook5"],
  "script": {
    "hook": "First 3 seconds hook that references trending topic",
    "mainContent": "Main content following the video/script length requirements",
    "ending": "CTA or twist ending"
  },
  "caption": "Strong opening line with value, relatability, and trend reference",
  "hashtags": ["tag1", "tag2", ..., "tag20"],
  "carousel": {
    "slide1": "Hook slide referencing trend",
    "slides2to6": ["slide2", "slide3", "slide4", "slide5", "slide6"],
    "slide7": "CTA slide"
  },
  "repurpose": {
    "twitterThread": ["tweet1", "tweet2", "tweet3", "tweet4", "tweet5"],
    "linkedInPost": "Full LinkedIn post",
    "youtubeShorts": "YouTube Shorts description"
  },
  "optimizationTips": {
    "bestPostingTime": "Best time to post for maximum reach",
    "suggestedVisuals": ["visual1", "visual2", "visual3"],
    "engagementTricks": ["trick1", "trick2", "trick3"]
  }
}

RULES:
- INCORPORATE TRENDING TOPICS into at least 50% of your ideas and content
- Avoid generic or overused content - make it feel CURRENT and TIMELY
- Make everything practical and ready-to-post
- Focus on HIGH ENGAGEMENT and VIRALITY
- Keep language simple and human-like
- Ensure all arrays have the exact number of items specified
- Make hooks max 12 words each, starting with attention-grabbing first 3 words
- Follow the VIDEO/SCRIPT LENGTH requirements exactly
- REMEMBER: ALL content must be in ${languageName}`;
}

function normalizeContentPackage(data: any): GeneratedContent {
  return {
    viralIdeas: Array.isArray(data.viralIdeas) ? data.viralIdeas.slice(0, 10) : [],
    bestIdea: {
      idea: data.bestIdea?.idea || "",
      rationale: data.bestIdea?.rationale || "",
    },
    hooks: Array.isArray(data.hooks) ? data.hooks.slice(0, 5) : [],
    script: {
      hook: data.script?.hook || "",
      mainContent: data.script?.mainContent || "",
      ending: data.script?.ending || "",
    },
    caption: data.caption || "",
    hashtags: Array.isArray(data.hashtags) ? data.hashtags.slice(0, 20) : [],
    carousel: {
      slide1: data.carousel?.slide1 || "",
      slides2to6: Array.isArray(data.carousel?.slides2to6)
        ? data.carousel.slides2to6.slice(0, 5)
        : [],
      slide7: data.carousel?.slide7 || "",
    },
    repurpose: {
      twitterThread: Array.isArray(data.repurpose?.twitterThread)
        ? data.repurpose.twitterThread.slice(0, 5)
        : [],
      linkedInPost: data.repurpose?.linkedInPost || "",
      youtubeShorts: data.repurpose?.youtubeShorts || "",
    },
    optimizationTips: {
      bestPostingTime: data.optimizationTips?.bestPostingTime || "",
      suggestedVisuals: Array.isArray(data.optimizationTips?.suggestedVisuals)
        ? data.optimizationTips.suggestedVisuals.slice(0, 3)
        : [],
      engagementTricks: Array.isArray(data.optimizationTips?.engagementTricks)
        ? data.optimizationTips.engagementTricks.slice(0, 3)
        : [],
    },
  };
}
