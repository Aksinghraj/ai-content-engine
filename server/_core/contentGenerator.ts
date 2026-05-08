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
  trendingTopics?: string[];
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
    const messages: Message[] = [
      {
        role: "system",
        content: "You are an expert social media content strategist who stays on top of current trends. Generate high-engagement, viral-worthy content packages that incorporate trending topics and current cultural moments. Always respond with valid JSON.",
      },
      {
        role: "user",
        content: prompt,
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
  };
  return instructions[language] || instructions["en"];
}

function getVideoLengthInstructions(videoLength: string): string {
  const instructions: Record<string, string> = {
    "15s": "Make the script exactly 15 seconds when read aloud (about 35-40 words). Ultra-short, punchy, one key message.",
    "30s": "Make the script exactly 30 seconds when read aloud (about 75-80 words). Quick hook, one main point, strong CTA.",
    "60s": "Make the script exactly 60 seconds when read aloud (about 150-160 words). Hook, 2-3 key points, engaging CTA.",
    "90s": "Make the script exactly 90 seconds when read aloud (about 225-240 words). Hook, detailed content with 3-4 points, memorable ending.",
    "3min": "Make the script exactly 3 minutes when read aloud (about 450-480 words). Full storytelling arc with hook, problem, solution, examples, and CTA.",
    "5min": "Make the script exactly 5 minutes when read aloud (about 750-800 words). Comprehensive deep-dive with hook, multiple sections, examples, and strong conclusion.",
    "short": "Make the script 30-45 seconds when read aloud (about 75-100 words). Quick, punchy, high-energy.",
    "long": "Make the script 2-5 minutes when read aloud (about 300-750 words). Detailed, storytelling-driven, comprehensive.",
  };
  return instructions[videoLength] || instructions["60s"];
}

function getScriptLengthInstructions(scriptLength: string): string {
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
  const videoLengthInstructions = getVideoLengthInstructions(input.videoLength || "60s");
  const scriptLengthInstructions = getScriptLengthInstructions(input.scriptLength || "medium");

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
- Video Length: ${input.videoLength || "60s"}
- Script Length: ${input.scriptLength || "medium"}

${languageInstructions}

VIDEO/SCRIPT LENGTH REQUIREMENTS:
${videoLengthInstructions}
${scriptLengthInstructions}

${trendingSection}

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
