import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Clapperboard, FileText, Image, PenLine, Repeat2, ScanLine, Search, Send, Sparkles, WandSparkles, type LucideIcon } from "lucide-react";
import { appNavigation, getNavigationArea } from "@/lib/appNavigation";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";

type NavigationProps = { compact?: boolean; onNavigate?: () => void; };

type ContentStudioTool = {
  label: string;
  path: string;
  description: string;
  icon: LucideIcon;
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
  return <nav className={compact ? "lumae-top-nav" : "lumae-side-nav"} aria-label="Application navigation">{appNavigation.map((area, index) => { const Icon = area.icon; const active = getNavigationArea(location)?.label === area.label; return <Link key={area.label} href={area.path} onClick={onNavigate} className={`lumae-nav-item ${active ? "is-active" : ""}`}><span className="lumae-nav-item__index">{String(index + 1).padStart(2, "0")}</span><Icon className="h-4 w-4"/><span>{area.label}</span></Link>; })}</nav>;
}

export function GroupedPageTabs() {
  const [location, navigate] = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const activeArea = getNavigationArea(location);
  const isContentStudio = activeArea?.label === "Content Studio";
  const tools: ContentStudioTool[] = isContentStudio && activeArea?.tabs
    ? activeArea.tabs.map((tab) => ({ ...tab, ...(contentStudioTools[tab.label] ?? { description: "Open this content tool.", icon: Sparkles }) }))
    : [];

  useEffect(() => {
    if (!isContentStudio) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isContentStudio]);

  if (!activeArea?.tabs) return null;

  const selectTool = (path: string) => {
    setPaletteOpen(false);
    navigate(path);
  };

  return <section className={`lumae-group-tabs ${isContentStudio ? "lumae-group-tabs--complete" : ""}`} aria-label={`${activeArea.label} sections`}>
    <div className="lumae-group-tabs__title">
      <span>Workspace</span>
      <h1>{activeArea.label}</h1>
      {isContentStudio && <p>Choose one tool to keep every content task in the same workspace.</p>}
    </div>
    {isContentStudio && <button type="button" className="lumae-tool-search" onClick={() => setPaletteOpen(true)} aria-label="Search Content Studio tools"><Search className="h-4 w-4"/><span>Search tools</span><kbd>⌘ K</kbd></button>}
    <div className={`lumae-group-tabs__rail ${isContentStudio ? "lumae-group-tabs__rail--complete" : ""}`} role="tablist" aria-label={`${activeArea.label} tabs`}>
      {activeArea.tabs.map((tab, index) => {
        const active = location === tab.path;
        const tool = contentStudioTools[tab.label];
        const ToolIcon = tool?.icon;
        return <Link key={tab.path} href={tab.path} role="tab" aria-selected={active} className={`lumae-group-tab ${active ? "is-active" : ""}`}>
          <i>{String(index + 1).padStart(2, "0")}</i>
          {ToolIcon && <ToolIcon className="lumae-group-tab__icon h-4 w-4" aria-hidden="true"/>}
          <span>{tab.label}</span>
          {tool && <small>{tool.description}</small>}
        </Link>;
      })}
    </div>
    {isContentStudio && <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen} title="Switch Content Studio tool" description="Search and open a Content Studio tool." className="lumae-command-palette">
      <CommandInput placeholder="Search Content Studio tools…" />
      <CommandList>
        <CommandEmpty>No matching Content Studio tool.</CommandEmpty>
        <CommandGroup heading="Content Studio tools">
          {tools.map((tool, index) => { const ToolIcon = tool.icon; return <CommandItem key={tool.path} value={`${tool.label} ${tool.description}`} keywords={[tool.label, tool.description]} onSelect={() => selectTool(tool.path)}><ToolIcon className="h-4 w-4"/><div><strong>{tool.label}</strong><span>{tool.description}</span></div><CommandShortcut>{String(index + 1).padStart(2, "0")}</CommandShortcut></CommandItem>; })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>}
  </section>;
}
