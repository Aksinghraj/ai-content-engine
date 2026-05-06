import { invokeLLM } from "./llm";

export type AutomationType = "blog" | "tweet" | "email" | "instagram" | "facebook";

export interface AutomationGeneratorInput {
  niche: string;
  topic: string;
  tone: string;
  language: string;
  platform: AutomationType;
}

interface BlogOutput {
  title: string;
  introduction: string;
  sections: Array<{
    heading: string;
    content: string;
  }>;
  conclusion: string;
  seoKeywords: string[];
  callToAction: string;
}

interface TweetOutput {
  tweets: string[];
  hashtags: string[];
  bestTweet: string;
}

interface EmailOutput {
  subject: string;
  preheader: string;
  greeting: string;
  body: string[];
  callToAction: string;
  signature: string;
}

interface SocialPostOutput {
  caption: string;
  hashtags: string[];
  callToAction: string;
  bestTime: string;
  visualSuggestions: string[];
}

export async function generateBlogPost(input: AutomationGeneratorInput): Promise<BlogOutput> {
  const prompt = `You are an expert blog writer. Generate a comprehensive blog post in ${input.language}.
  
Niche: ${input.niche}
Topic: ${input.topic}
Tone: ${input.tone}

Create a blog post with:
1. A compelling title
2. An engaging introduction (2-3 sentences)
3. 4-5 main sections with headings and detailed content
4. A strong conclusion
5. 5-7 SEO keywords relevant to the topic
6. A clear call-to-action

Respond in valid JSON format with this structure:
{
  "title": "string",
  "introduction": "string",
  "sections": [{"heading": "string", "content": "string"}],
  "conclusion": "string",
  "seoKeywords": ["string"],
  "callToAction": "string"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert content writer. Always respond with valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "blog_post",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            introduction: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  heading: { type: "string" },
                  content: { type: "string" },
                },
                required: ["heading", "content"],
              },
            },
            conclusion: { type: "string" },
            seoKeywords: { type: "array", items: { type: "string" } },
            callToAction: { type: "string" },
          },
          required: ["title", "introduction", "sections", "conclusion", "seoKeywords", "callToAction"],
        },
      },
    },
  });

  const content = response.choices[0]?.message.content;
  if (typeof content === "string") {
    return JSON.parse(content);
  }
  throw new Error("Failed to generate blog post");
}

export async function generateTweets(input: AutomationGeneratorInput): Promise<TweetOutput> {
  const prompt = `You are a Twitter expert. Generate 5 engaging tweets in ${input.language} about "${input.topic}" for the ${input.niche} niche.

Tone: ${input.tone}

Requirements:
- Each tweet must be under 280 characters
- Include relevant hashtags
- Mix of informational, engaging, and call-to-action tweets
- Identify the best performing tweet

Respond in valid JSON format:
{
  "tweets": ["string"],
  "hashtags": ["string"],
  "bestTweet": "string"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a Twitter content expert. Always respond with valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "tweets",
        strict: true,
        schema: {
          type: "object",
          properties: {
            tweets: { type: "array", items: { type: "string" } },
            hashtags: { type: "array", items: { type: "string" } },
            bestTweet: { type: "string" },
          },
          required: ["tweets", "hashtags", "bestTweet"],
        },
      },
    },
  });

  const content = response.choices[0]?.message.content;
  if (typeof content === "string") {
    return JSON.parse(content);
  }
  throw new Error("Failed to generate tweets");
}

export async function generateEmailCampaign(input: AutomationGeneratorInput): Promise<EmailOutput> {
  const prompt = `You are an email marketing expert. Generate a professional email campaign in ${input.language}.

Niche: ${input.niche}
Topic: ${input.topic}
Tone: ${input.tone}

Create an email with:
1. A compelling subject line (under 50 characters)
2. A preheader (under 100 characters)
3. A warm greeting
4. 3-4 body paragraphs with valuable content
5. A strong call-to-action
6. A professional signature

Respond in valid JSON format:
{
  "subject": "string",
  "preheader": "string",
  "greeting": "string",
  "body": ["string"],
  "callToAction": "string",
  "signature": "string"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an email marketing expert. Always respond with valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "email_campaign",
        strict: true,
        schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            preheader: { type: "string" },
            greeting: { type: "string" },
            body: { type: "array", items: { type: "string" } },
            callToAction: { type: "string" },
            signature: { type: "string" },
          },
          required: ["subject", "preheader", "greeting", "body", "callToAction", "signature"],
        },
      },
    },
  });

  const content = response.choices[0]?.message.content;
  if (typeof content === "string") {
    return JSON.parse(content);
  }
  throw new Error("Failed to generate email campaign");
}

export async function generateInstagramPost(input: AutomationGeneratorInput): Promise<SocialPostOutput> {
  const prompt = `You are an Instagram content expert. Generate an Instagram post in ${input.language}.

Niche: ${input.niche}
Topic: ${input.topic}
Tone: ${input.tone}

Create an Instagram post with:
1. An engaging caption (150-300 characters)
2. 10-15 relevant hashtags
3. A clear call-to-action
4. Best time to post
5. 3-4 visual suggestions

Respond in valid JSON format:
{
  "caption": "string",
  "hashtags": ["string"],
  "callToAction": "string",
  "bestTime": "string",
  "visualSuggestions": ["string"]
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an Instagram content expert. Always respond with valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "instagram_post",
        strict: true,
        schema: {
          type: "object",
          properties: {
            caption: { type: "string" },
            hashtags: { type: "array", items: { type: "string" } },
            callToAction: { type: "string" },
            bestTime: { type: "string" },
            visualSuggestions: { type: "array", items: { type: "string" } },
          },
          required: ["caption", "hashtags", "callToAction", "bestTime", "visualSuggestions"],
        },
      },
    },
  });

  const content = response.choices[0]?.message.content;
  if (typeof content === "string") {
    return JSON.parse(content);
  }
  throw new Error("Failed to generate Instagram post");
}

export async function generateFacebookPost(input: AutomationGeneratorInput): Promise<SocialPostOutput> {
  const prompt = `You are a Facebook content expert. Generate a Facebook post in ${input.language}.

Niche: ${input.niche}
Topic: ${input.topic}
Tone: ${input.tone}

Create a Facebook post with:
1. An engaging caption (200-500 characters)
2. 5-10 relevant hashtags
3. A clear call-to-action
4. Best time to post
5. 3-4 visual suggestions

Respond in valid JSON format:
{
  "caption": "string",
  "hashtags": ["string"],
  "callToAction": "string",
  "bestTime": "string",
  "visualSuggestions": ["string"]
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a Facebook content expert. Always respond with valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "facebook_post",
        strict: true,
        schema: {
          type: "object",
          properties: {
            caption: { type: "string" },
            hashtags: { type: "array", items: { type: "string" } },
            callToAction: { type: "string" },
            bestTime: { type: "string" },
            visualSuggestions: { type: "array", items: { type: "string" } },
          },
          required: ["caption", "hashtags", "callToAction", "bestTime", "visualSuggestions"],
        },
      },
    },
  });

  const content = response.choices[0]?.message.content;
  if (typeof content === "string") {
    return JSON.parse(content);
  }
  throw new Error("Failed to generate Facebook post");
}

export async function generateAutomationContent(
  input: AutomationGeneratorInput
): Promise<BlogOutput | TweetOutput | EmailOutput | SocialPostOutput> {
  switch (input.platform) {
    case "blog":
      return generateBlogPost(input);
    case "tweet":
      return generateTweets(input);
    case "email":
      return generateEmailCampaign(input);
    case "instagram":
      return generateInstagramPost(input);
    case "facebook":
      return generateFacebookPost(input);
    default:
      throw new Error(`Unknown automation type: ${input.platform}`);
  }
}
