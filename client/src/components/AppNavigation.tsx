import { Link, useLocation } from "wouter";
import { appNavigation, getNavigationArea } from "@/lib/appNavigation";

type NavigationProps = { compact?: boolean; onNavigate?: () => void; };

export function AppPrimaryNavigation({ compact = false, onNavigate }: NavigationProps) {
  const [location] = useLocation();
  return <nav className={compact ? "lumae-top-nav" : "lumae-side-nav"} aria-label="Application navigation">{appNavigation.map((area, index) => { const Icon = area.icon; const active = getNavigationArea(location)?.label === area.label; return <Link key={area.label} href={area.path} onClick={onNavigate} className={`lumae-nav-item ${active ? "is-active" : ""}`}><span className="lumae-nav-item__index">{String(index + 1).padStart(2, "0")}</span><Icon className="h-4 w-4"/><span>{area.label}</span></Link>; })}</nav>;
}

export function GroupedPageTabs() {
  const [location] = useLocation(); const activeArea = getNavigationArea(location); if (!activeArea?.tabs) return null;
  return <section className="lumae-group-tabs" aria-label={`${activeArea.label} sections`}><div className="lumae-group-tabs__title"><span>WORKSPACE</span><h1>{activeArea.label}</h1></div><div className="lumae-group-tabs__rail" role="tablist" aria-label={`${activeArea.label} tabs`}>{activeArea.tabs.map((tab, index) => { const active = location === tab.path; return <Link key={tab.path} href={tab.path} role="tab" aria-selected={active} className={`lumae-group-tab ${active ? "is-active" : ""}`}><i>{String(index + 1).padStart(2, "0")}</i>{tab.label}</Link>; })}</div></section>;
}
