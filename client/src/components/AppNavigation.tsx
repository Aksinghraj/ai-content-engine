import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Clapperboard, FileText, History, Image, PenLine, Repeat2, ScanLine, Search, Send, Sparkles, Star, WandSparkles, X, type LucideIcon } from "lucide-react";
import { appNavigation, getNavigationArea } from "@/lib/appNavigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";

type NavigationProps = { compact?: boolean; onNavigate?: () => void; };
type ContentStudioTool = { label: string; path: string; description: string; icon: LucideIcon; };

const RECENT_TOOLS_KEY = "lumae.content-studio.recent-tools";
const FAVORITE_TOOLS_KEY = "lumae.content-studio.favorite-tools";
const DISCOVERY_HINT_KEY = "lumae.content-studio.discovery-hint-dismissed";

const readStoredPaths = (key: string) => {
  if (typeof window === "undefined") return [] as string[];
  try { const value = JSON.parse(window.localStorage.getItem(key) ?? "[]"); return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; } catch { return []; }
};

const storePaths = (key: string, paths: string[]) => {
  try { window.localStorage.setItem(key, JSON.stringify(paths)); } catch { /* Storage may be unavailable in private browsing. */ }
};

const contentStudioTools: Record<string, Omit<ContentStudioTool, "label" | "path">> = {
  "AI Generator": { description: "Turn a brief into a post.", icon: WandSparkles },
  "Basic Script Free": { description: "Use free daily script drafts.", icon: FileText },
  "Media Generation": { description: "Generate visual media from prompts.", icon: Image },
  "Content Rewriter": { description: "Refresh an existing draft.", icon: PenLine },
  "Repurposing Engine": { description: "Reuse one idea across channels.", icon: Repeat2 },
  "Video Repurposing": { description: "Turn video ideas into short clips.", icon: Clapperboard },
  "Format Agent": { description: "Match the right content format.", icon: ScanLine },
  "Create Post Pro": { description: "Create a polished final post.", icon: Send },
};

export function AppPrimaryNavigation({ compact = false, onNavigate }: NavigationProps) {
  const [location] = useLocation();
  const { t } = useLanguage();
  return <nav className={compact ? "lumae-top-nav" : "lumae-side-nav"} aria-label="Application navigation">{appNavigation.map((area, index) => { const Icon = area.icon; const active = getNavigationArea(location)?.label === area.label; return <Link key={area.label} href={area.path} onClick={onNavigate} className={`lumae-nav-item ${active ? "is-active" : ""}`}><span className="lumae-nav-item__index">{String(index + 1).padStart(2, "0")}</span><Icon className="h-4 w-4"/><span>{t(area.label)}</span></Link>; })}</nav>;
}

export function GroupedPageTabs() {
  const [location, navigate] = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [recentPaths, setRecentPaths] = useState<string[]>(() => readStoredPaths(RECENT_TOOLS_KEY));
  const [favoritePaths, setFavoritePaths] = useState<string[]>(() => readStoredPaths(FAVORITE_TOOLS_KEY));
  const [showDiscoveryHint, setShowDiscoveryHint] = useState(() => typeof window !== "undefined" && window.localStorage.getItem(DISCOVERY_HINT_KEY) !== "true");
  const activeArea = getNavigationArea(location);
  const { t } = useLanguage();
  const isContentStudio = activeArea?.label === "Content Studio";
  const tools: ContentStudioTool[] = isContentStudio && activeArea?.tabs
    ? activeArea.tabs.map((tab) => ({ ...tab, ...(contentStudioTools[tab.label] ?? { description: "Open this content tool.", icon: Sparkles }) }))
    : [];
  const recentTools = recentPaths.map((path) => tools.find((tool) => tool.path === path)).filter((tool): tool is ContentStudioTool => Boolean(tool));
  const favoriteTools = favoritePaths.map((path) => tools.find((tool) => tool.path === path)).filter((tool): tool is ContentStudioTool => Boolean(tool));

  useEffect(() => {
    if (!isContentStudio) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPaletteOpen(true); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isContentStudio]);

  if (!activeArea?.tabs) return null;

  const recordRecent = (path: string) => {
    if (!isContentStudio) return;
    setRecentPaths((current) => { const next = [path, ...current.filter((item) => item !== path)].slice(0, 4); storePaths(RECENT_TOOLS_KEY, next); return next; });
  };
  const selectTool = (path: string) => { recordRecent(path); setPaletteOpen(false); navigate(path); };
  const toggleFavorite = (event: React.MouseEvent<HTMLButtonElement>, path: string) => {
    event.preventDefault(); event.stopPropagation();
    setFavoritePaths((current) => { const next = current.includes(path) ? current.filter((item) => item !== path) : [...current, path]; storePaths(FAVORITE_TOOLS_KEY, next); return next; });
  };
  const dismissHint = () => { setShowDiscoveryHint(false); try { window.localStorage.setItem(DISCOVERY_HINT_KEY, "true"); } catch { /* no-op */ } };

  return <section className={`lumae-group-tabs ${isContentStudio ? "lumae-group-tabs--complete" : ""}`} aria-label={`${t(activeArea.label)} sections`}>
    <div className="lumae-group-tabs__title"><span>{t("Workspace")}</span><h1>{t(activeArea.label)}</h1>{isContentStudio && <p>{t("Choose one tool to keep every content task in the same workspace.")}</p>}</div>
    {isContentStudio && <><button type="button" className="lumae-tool-search" onClick={() => setPaletteOpen(true)} aria-label={t("Search Content Studio tools")}><Search className="h-4 w-4"/><span>{t("Search tools")}</span><kbd>⌘ K</kbd></button>{showDiscoveryHint && <aside className="lumae-discovery-hint" aria-label={t("What is new in Content Studio")}><Sparkles className="h-4 w-4"/><div><strong>{t("What’s new")}</strong><p>{t("Pin your go-to tools, then use Search tools to switch faster.")}</p></div><button type="button" onClick={dismissHint} aria-label={t("Dismiss Content Studio update")}><X className="h-4 w-4"/></button></aside>}</>}
    <div className={`lumae-group-tabs__rail ${isContentStudio ? "lumae-group-tabs__rail--complete" : ""}`} role="tablist" aria-label={`${t(activeArea.label)} tabs`}>
      {activeArea.tabs.map((tab, index) => {
        const active = location === tab.path; const tool = contentStudioTools[tab.label]; const ToolIcon = tool?.icon; const isFavorite = favoritePaths.includes(tab.path);
        return <div className={`lumae-tool-card ${isFavorite ? "is-favorite" : ""}`} key={tab.path}><Link href={tab.path} onClick={() => recordRecent(tab.path)} role="tab" aria-selected={active} className={`lumae-group-tab ${active ? "is-active" : ""}`}><i>{String(index + 1).padStart(2, "0")}</i>{ToolIcon && <ToolIcon className="lumae-group-tab__icon h-4 w-4" aria-hidden="true"/>}<span>{t(tab.label)}</span>{tool && <small>{t(tool.description)}</small>}</Link>{isContentStudio && <button type="button" className="lumae-tool-pin" onClick={(event) => toggleFavorite(event, tab.path)} aria-label={`${isFavorite ? t("Remove") : t("Add")} ${t(tab.label)} ${isFavorite ? t("from") : t("to")} ${t("favorites")}`} aria-pressed={isFavorite}><Star className="h-3.5 w-3.5" fill={isFavorite ? "currentColor" : "none"}/></button>}</div>;
      })}
    </div>
    {isContentStudio && <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen} title="Switch Content Studio tool" description="Search and open a Content Studio tool." className="lumae-command-palette"><CommandInput placeholder="Search Content Studio tools…"/><CommandList><CommandEmpty>No matching Content Studio tool.</CommandEmpty>{recentTools.length > 0 && <CommandGroup heading="Recently used">{recentTools.map((tool) => <ToolCommandItem key={`recent-${tool.path}`} tool={tool} onSelect={selectTool} icon={History}/>)}</CommandGroup>}{favoriteTools.length > 0 && <CommandGroup heading="Favorites">{favoriteTools.map((tool) => <ToolCommandItem key={`favorite-${tool.path}`} tool={tool} onSelect={selectTool} icon={Star}/>)}</CommandGroup>}<CommandGroup heading="All Content Studio tools">{tools.map((tool, index) => <ToolCommandItem key={tool.path} tool={tool} onSelect={selectTool} shortcut={String(index + 1).padStart(2, "0")}/>)}</CommandGroup></CommandList></CommandDialog>}
  </section>;
}

function ToolCommandItem({ tool, onSelect, shortcut, icon: PrefixIcon }: { tool: ContentStudioTool; onSelect: (path: string) => void; shortcut?: string; icon?: LucideIcon }) {
  const ToolIcon = PrefixIcon ?? tool.icon;
  return <CommandItem value={`${tool.label} ${tool.description}`} keywords={[tool.label, tool.description]} onSelect={() => onSelect(tool.path)}><ToolIcon className="h-4 w-4"/><div><strong>{tool.label}</strong><span>{tool.description}</span></div>{shortcut && <CommandShortcut>{shortcut}</CommandShortcut>}</CommandItem>;
}
