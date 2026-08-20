import { useRoute } from "wouter";
import { blogPosts, BLOG_CATEGORIES, formatCategory } from "@/lib/blog";
import Blog, { BlogCard } from "./Blog";

export default function BlogCategory() {
  const [, params] = useRoute("/blog/category/:category");
  const category = params?.category;
  if (!category || !BLOG_CATEGORIES.includes(category as typeof BLOG_CATEGORIES[number])) return <Blog />;
  const posts = blogPosts.filter((post) => post.category === category);
  return <main className="min-h-screen bg-[#09090b] px-4 py-16 text-[#f5f5f7] sm:px-6"><div className="mx-auto max-w-6xl"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#06b6d4]">Category</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">{formatCategory(category)}</h1><p className="mt-3 text-[#9a9aa2]">Articles from the Lumae AI Journal.</p><div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{posts.map((post) => <BlogCard key={post.slug} post={post} />)}</div></div></main>;
}
