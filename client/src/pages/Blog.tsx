import { useMemo, useState } from "react";
import { CalendarDays, Clock3, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { BLOG_CATEGORIES, blogPosts, formatCategory, type BlogCategory, type BlogPost } from "@/lib/blog";

export function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <article className={`overflow-hidden rounded-2xl border border-[#263940] bg-[#111c22] transition-colors duration-180 hover:border-[#2dd4bf]/60 ${featured ? "md:grid md:grid-cols-[0.8fr_1.2fr]" : ""}`}>
      <div className={`flex min-h-44 items-center justify-center bg-[radial-gradient(circle_at_35%_30%,rgba(45,212,191,.26),transparent_36%),linear-gradient(135deg,#0a1116,#111c22)] ${featured ? "md:min-h-full" : ""}`}>
        <img src={post.coverImage} alt="" width={120} height={120} className="h-24 w-24 rounded-2xl object-cover ring-1 ring-white/10" />
      </div>
      <div className="p-5 sm:p-6">
        <Link href={`/blog/category/${post.category}`} className="text-xs font-semibold uppercase tracking-[0.14em] text-[#78e2d0]">{formatCategory(post.category)}</Link>
        <h2 className={`mt-3 font-semibold tracking-tight text-[#f5f7f6] ${featured ? "text-2xl sm:text-3xl" : "text-xl"}`}><Link href={`/blog/${post.category}/${post.slug}`} className="hover:text-[#2dd4bf]">{post.title}</Link></h2>
        <p className="mt-3 leading-relaxed text-[#9aabb2]">{post.excerpt}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#9aabb2]"><span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{new Date(post.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })}</span><span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{post.readMinutes} min read</span></div>
      </div>
    </article>
  );
}

export default function Blog() {
  const [category, setCategory] = useState<BlogCategory | "all">("all");
  const posts = useMemo(() => category === "all" ? blogPosts : blogPosts.filter((post) => post.category === category), [category]);
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const remaining = posts.filter((post) => post.slug !== featured?.slug);

  return (
    <main className="lumae-journal-signal min-h-screen bg-[#0a1116] text-[#f5f7f6]">
      <section className="border-b border-[#263940] px-4 py-16 sm:px-6 sm:py-20"><div className="mx-auto max-w-6xl"><div className="inline-flex items-center gap-2 rounded-full border border-[#263940] bg-[#111c22] px-3 py-1.5 text-xs font-medium text-[#9aabb2]"><Sparkles className="h-3.5 w-3.5 text-[#78e2d0]" />Lumae AI Journal</div><h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Practical ideas for creating, publishing, and growing with AI.</h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#9aabb2]">Product notes, thoughtful marketing systems, and the honest story of building Lumae AI.</p></div></section>
      <section className="px-4 py-8 sm:px-6"><div className="mx-auto max-w-6xl"><div className="flex flex-wrap gap-2" role="tablist" aria-label="Blog categories"><button onClick={() => setCategory("all")} className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${category === "all" ? "bg-gradient-to-r from-[#2dd4bf] via-[#78e2d0] to-[#ff6b5f] text-[#0a1116]" : "bg-[#111c22] text-[#9aabb2] hover:text-white"}`}>All posts</button>{BLOG_CATEGORIES.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${category === item ? "bg-gradient-to-r from-[#2dd4bf] via-[#78e2d0] to-[#ff6b5f] text-[#0a1116]" : "bg-[#111c22] text-[#9aabb2] hover:text-white"}`}>{formatCategory(item)}</button>)}</div>
      {featured && <div className="mt-8"><BlogCard post={featured} featured /></div>}
      {remaining.length > 0 && <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{remaining.map((post) => <BlogCard key={post.slug} post={post} />)}</div>}
      </div></section>
    </main>
  );
}
