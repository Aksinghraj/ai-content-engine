import { useEffect, useMemo } from "react";
import { CalendarDays, Clock3, Instagram, Linkedin, Share2, Twitter } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { Streamdown } from "streamdown";
import { blogPosts, founder, formatCategory, getBlogPost, getRelatedPosts } from "@/lib/blog";
import { Button } from "@/components/ui/button";
import { BlogCard } from "./Blog";

function headingSlug(value: string) { return value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-"); }

export default function BlogPost() {
  const [, params] = useRoute("/blog/:category/:slug");
  const [, navigate] = useLocation();
  const post = params ? getBlogPost(params.category, params.slug) : undefined;
  const headings = useMemo(() => post ? Array.from(post.content.matchAll(/^##\s+(.+)$/gm)).map((match) => ({ title: match[1], id: headingSlug(match[1]) })) : [], [post]);

  useEffect(() => {
    if (!post) return;
    document.title = `${post.title} | Lumae AI Journal`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", post.excerpt);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", `https://lumae.co.in/blog/${post.category}/${post.slug}`);
    const setProperty = (property: string, content: string) => document.querySelector(`meta[property="${property}"]`)?.setAttribute("content", content);
    setProperty("og:title", post.title);
    setProperty("og:description", post.excerpt);
    setProperty("og:url", `https://lumae.co.in/blog/${post.category}/${post.slug}`);
    setProperty("og:image", `https://lumae.co.in${post.coverImage}`);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", post.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", post.excerpt);
    document.querySelector('meta[name="twitter:image"]')?.setAttribute("content", `https://lumae.co.in${post.coverImage}`);
    const jsonLd = document.createElement("script");
    jsonLd.type = "application/ld+json";
    jsonLd.id = "lumae-blog-article-jsonld";
    jsonLd.text = JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.excerpt, datePublished: post.date, image: post.coverImage, author: { "@type": "Person", name: founder.name, jobTitle: founder.title }, publisher: { "@type": "Organization", name: "Lumae AI" } });
    document.head.appendChild(jsonLd);
    return () => document.getElementById("lumae-blog-article-jsonld")?.remove();
  }, [post]);

  if (!post) return <main className="min-h-screen bg-[#09090b] px-4 py-24 text-center text-[#f5f5f7]"><h1 className="text-3xl font-semibold">Article not found</h1><Button onClick={() => navigate("/blog")} className="lumae-gradient-cta mt-6">Return to the blog</Button></main>;
  const related = getRelatedPosts(post); const suggestions = related.length ? related : blogPosts.filter((item) => item.slug !== post.slug).slice(0, 2);
  const share = (network: "twitter" | "linkedin") => { const url = encodeURIComponent(window.location.href); const text = encodeURIComponent(post.title); window.open(network === "twitter" ? `https://twitter.com/intent/tweet?text=${text}&url=${url}` : `https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer"); };

  return <main className="min-h-screen bg-[#09090b] text-[#f5f5f7]"><section className="border-b border-[#26262b] px-4 py-14 sm:px-6 sm:py-20"><div className="mx-auto max-w-4xl"><Link href={`/blog/category/${post.category}`} className="text-xs font-semibold uppercase tracking-[.14em] text-[#06b6d4]">{formatCategory(post.category)}</Link><h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">{post.title}</h1><p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#9a9aa2]">{post.excerpt}</p><div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-[#9a9aa2]"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{new Date(post.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</span><span className="flex items-center gap-2"><Clock3 className="h-4 w-4" />{post.readMinutes} min read</span></div><div className="mt-7 inline-flex items-center gap-3 rounded-xl border border-[#26262b] bg-[#141417] px-3 py-2.5"><img src={founder.image} alt={founder.name} width={56} height={56} className="h-14 w-14 rounded-full object-cover ring-1 ring-[#6366f1]/50" /><div className="text-left"><p className="text-sm font-semibold text-[#f5f5f7]">{founder.name}</p><p className="text-xs font-medium text-[#06b6d4]">Founder / CEO, Lumae AI</p></div></div></div></section>
  <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,720px)_220px]"><article className="min-w-0"><div className="mb-10 flex h-64 items-center justify-center rounded-2xl border border-[#26262b] bg-[radial-gradient(circle_at_35%_30%,rgba(99,102,241,.32),transparent_36%),linear-gradient(135deg,#09090b,#141417)]"><img src={post.coverImage} alt="" width={144} height={144} className="h-32 w-32 rounded-3xl object-cover ring-1 ring-white/10" /></div><div className="blog-prose prose prose-invert max-w-none prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-[#d0d0d5] prose-p:leading-8 prose-li:text-[#d0d0d5] prose-strong:text-[#f5f5f7] prose-blockquote:border-[#6366f1] prose-blockquote:text-[#c4b5fd]"><Streamdown>{post.content}</Streamdown></div>
  <section className="mt-12 rounded-2xl border border-[#26262b] bg-[#141417] p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><img src={founder.image} alt={founder.name} width={112} height={112} className="h-24 w-24 rounded-full object-cover ring-2 ring-[#6366f1]/50" /><div><p className="font-semibold text-[#f5f5f7]">{founder.name}</p><p className="text-sm text-[#06b6d4]">Founder / CEO, Lumae AI</p><p className="mt-2 text-sm leading-relaxed text-[#9a9aa2]">{founder.bio}</p><a href={founder.instagram} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#c4b5fd] hover:text-white"><Instagram className="h-4 w-4" />Follow Veer on Instagram</a></div></div></section>
  <section className="mt-8 rounded-2xl border border-[#6366f1]/35 bg-[#141417] p-6"><p className="text-sm font-semibold text-[#f5f5f7]">Ready to turn ideas into content?</p><p className="mt-2 text-sm leading-relaxed text-[#9a9aa2]">Start with a free Basic Script or use the full AI Generator for brand-aware, platform-ready content.</p><div className="mt-4 flex flex-wrap gap-3"><Button onClick={() => navigate("/content-studio/basic-script")} className="lumae-gradient-cta">Try Lumae free</Button><Button variant="outline" onClick={() => navigate("/content-studio/ai-generator")} className="border-[#26262b] bg-transparent text-[#f5f5f7] hover:bg-[#09090b]">Open AI Generator</Button></div></section></article>
  <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit"><div className="rounded-xl border border-[#26262b] bg-[#141417] p-4"><p className="text-sm font-semibold">In this article</p><nav className="mt-3 space-y-2">{headings.map((heading) => <a key={heading.id} href={`#${heading.id}`} className="block text-sm text-[#9a9aa2] hover:text-[#c4b5fd]">{heading.title}</a>)}</nav></div><div className="rounded-xl border border-[#26262b] bg-[#141417] p-4"><p className="text-sm font-semibold">Share</p><div className="mt-3 flex gap-2"><Button variant="outline" size="icon" onClick={() => share("twitter")} className="border-[#26262b] bg-transparent hover:bg-[#09090b]"><Twitter className="h-4 w-4" /></Button><Button variant="outline" size="icon" onClick={() => share("linkedin")} className="border-[#26262b] bg-transparent hover:bg-[#09090b]"><Linkedin className="h-4 w-4" /></Button><Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(window.location.href)} className="border-[#26262b] bg-transparent hover:bg-[#09090b]"><Share2 className="h-4 w-4" /></Button></div></div></aside></div>
  {suggestions.length > 0 && <section className="border-t border-[#26262b] px-4 py-14 sm:px-6"><div className="mx-auto max-w-6xl"><h2 className="text-2xl font-semibold">More from Lumae AI</h2><div className="mt-6 grid gap-5 md:grid-cols-2">{suggestions.map((item) => <BlogCard key={item.slug} post={item} />)}</div></div></section>}</main>;
}
