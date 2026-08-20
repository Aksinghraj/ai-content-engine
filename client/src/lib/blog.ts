export const BLOG_CATEGORIES = ["product-updates", "marketing-tips", "company"] as const;
export type BlogCategory = typeof BLOG_CATEGORIES[number];

export type BlogPost = {
  title: string;
  slug: string;
  category: BlogCategory;
  date: string;
  excerpt: string;
  coverImage: string;
  author: "founder";
  featured: boolean;
  content: string;
  readMinutes: number;
};

export const founder = {
  name: "Veer Rajput",
  title: "Founder / CEO",
  bio: "Veer Rajput is the founder of Lumae AI, building practical AI tools that help creators and brands generate, schedule, and automate social content without losing their voice.",
  image: "/manus-storage/lumae-founder-ankit-singh_e71f093e.jpg",
  instagram: "https://www.instagram.com/veer_rajpute04?igsi=MTY4NHB0MXVtMjFzNw==",
};

export const lumaeInstagram = "https://www.instagram.com/lumaeai?igsi=ejdjZGxmbGw2ZHZz";

const markdownFiles = import.meta.glob("../content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function parseFrontmatter(source: string): BlogPost {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) throw new Error("Blog post is missing frontmatter");
  const metadata = Object.fromEntries(match[1].split("\n").map((line) => {
    const [key, ...value] = line.split(":");
    return [key.trim(), value.join(":").trim().replace(/^"|"$/g, "")];
  }));
  const content = match[2].trim();
  return {
    title: metadata.title,
    slug: metadata.slug,
    category: metadata.category as BlogCategory,
    date: metadata.date,
    excerpt: metadata.excerpt,
    coverImage: metadata.coverImage,
    author: "founder",
    featured: metadata.featured === "true",
    content,
    readMinutes: Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 220)),
  };
}

export const blogPosts = Object.values(markdownFiles).map(parseFrontmatter).sort((a, b) => b.date.localeCompare(a.date));

export function getBlogPost(category: string, slug: string) {
  return blogPosts.find((post) => post.category === category && post.slug === slug);
}

export function getRelatedPosts(post: BlogPost, limit = 3) {
  return blogPosts.filter((candidate) => candidate.category === post.category && candidate.slug !== post.slug).slice(0, limit);
}

export function formatCategory(category: string) {
  return category.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
}
