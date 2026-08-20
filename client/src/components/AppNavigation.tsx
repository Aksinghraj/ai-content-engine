import { Link, useLocation } from "wouter";
import { appNavigation, getNavigationArea } from "@/lib/appNavigation";

type NavigationProps = {
  compact?: boolean;
  onNavigate?: () => void;
};

export function AppPrimaryNavigation({ compact = false, onNavigate }: NavigationProps) {
  const [location] = useLocation();

  return (
    <nav className={compact ? "flex items-center gap-1 overflow-x-auto" : "space-y-1"} aria-label="Application navigation">
      {appNavigation.map((area) => {
        const Icon = area.icon;
        const active = getNavigationArea(location)?.label === area.label;
        const className = compact
          ? `inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${active ? "bg-[#161618] text-[#f5f5f7] ring-1 ring-[#2a2a2e]" : "text-[#a1a1a6] hover:bg-[#161618] hover:text-[#f5f5f7]"}`
          : `flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${active ? "bg-[#161618] text-[#f5f5f7] ring-1 ring-[#2a2a2e]" : "text-[#a1a1a6] hover:bg-[#161618] hover:text-[#f5f5f7]"}`;

        return (
          <Link key={area.label} href={area.path} onClick={onNavigate} className={className}>
            <Icon className={`h-4 w-4 ${active ? "text-[#0071e3]" : ""}`} />
            <span>{area.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function GroupedPageTabs() {
  const [location] = useLocation();
  const activeArea = getNavigationArea(location);

  if (!activeArea?.tabs) return null;

  return (
    <section className="mb-5 border-b border-[#2a2a2e] pb-3 sm:mb-6" aria-label={`${activeArea.label} sections`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-[#f5f5f7]">{activeArea.label}</h1>
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label={`${activeArea.label} tabs`}>
          {activeArea.tabs.map((tab) => {
            const active = location === tab.path;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                role="tab"
                aria-selected={active}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-[#0071e3] text-white" : "text-[#a1a1a6] hover:bg-[#161618] hover:text-[#f5f5f7]"}`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
