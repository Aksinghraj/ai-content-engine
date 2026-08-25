import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { LayoutDashboard, LogOut, PanelLeft, Users, Calendar, Settings, Bot, TrendingUp, Repeat, Sparkles, BarChart3, Zap, Wand2, DollarSign, Youtube, AlertTriangle, Image, ChevronDown, MessageCircle, CreditCard, Crown, Wallet, Send, Moon, Sun, Keyboard } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { AppPrimaryNavigation, GroupedPageTabs } from "./AppNavigation";
import { getNavigationArea } from "@/lib/appNavigation";
import { getWorkspaceShortcut, shouldIgnoreWorkspaceShortcut, workspaceShortcuts } from "@/lib/workspaceShortcuts";
import { useTheme } from "@/contexts/ThemeContext";
import { LumaeLightPulseIntroModal } from "@/components/LumaeLightPulseIntroModal";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const [location] = useLocation();
  const { loading, user } = useAuth();
  const showLightPulseIntroduction = location === "/dashboard";

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  // Redirect unauthenticated users to login — must be called before any early returns (React rules of hooks)
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = getLoginUrl(`${window.location.pathname}${window.location.search}`);
    }
  }, [loading, user]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    // Show spinner while redirect is in progress
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 rounded-full border-4 border-[#6366f1] border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          <Button
            variant="ghost"
            onClick={() => { window.location.href = "/"; }}
            className="text-muted-foreground hover:text-foreground gap-2 text-sm"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-static-motion lumae-product-shell">
      <SidebarProvider
        defaultOpen={true}
        style={
          {
            "--sidebar-width": `${sidebarWidth}px`,
          } as CSSProperties
        }
      >
        <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
          {children}
        </DashboardLayoutContent>
        {showLightPulseIntroduction && <LumaeLightPulseIntroModal />}
      </SidebarProvider>
    </div>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function WorkspaceShortcutReference({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Workspace shortcuts</DialogTitle>
          <DialogDescription>
            Use these shortcuts from anywhere in the workspace. They pause while you are typing or using a dialog.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 pt-1" aria-label="Primary workspace keyboard shortcuts">
          {workspaceShortcuts.map((shortcut) => (
            <div key={shortcut.path} className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2 text-sm">
              <span className="font-medium text-foreground">{shortcut.label}</span>
              <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">{shortcut.shortcutLabel}</kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = getNavigationArea(location);
  const isMobile = useIsMobile();
  const { effectiveTheme, toggleTheme } = useTheme();
  const [shortcutReferenceOpen, setShortcutReferenceOpen] = useState(false);
  const [shortcutAnnouncement, setShortcutAnnouncement] = useState("");

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  useEffect(() => {
    const handleWorkspaceShortcut = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        !event.altKey ||
        !event.shiftKey ||
        event.ctrlKey ||
        event.metaKey ||
        shouldIgnoreWorkspaceShortcut(event.target) ||
        document.querySelector("[role='dialog'][data-state='open']")
      ) {
        return;
      }

      const shortcut = getWorkspaceShortcut(event.key);
      if (!shortcut) return;

      event.preventDefault();
      setLocation(shortcut.path);
      setShortcutAnnouncement(`Opened ${shortcut.label}`);
    };

    window.addEventListener("keydown", handleWorkspaceShortcut);
    return () => window.removeEventListener("keydown", handleWorkspaceShortcut);
  }, [setLocation]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-border/70 bg-sidebar"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-20 justify-center border-b border-border/70">
            <div className="flex items-center gap-3 px-3 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src="/manus-storage/lumae-logo-icon_ccacaad9.jpg"
                    alt="Lumae AI"
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-md object-cover shrink-0 ring-1 ring-primary/35"
                  />
                  <span className="font-semibold tracking-tight truncate text-sm">
                    Lumae AI
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="min-h-0 gap-0 overflow-y-auto overscroll-contain">
            <div className="px-2 py-2 group-data-[collapsible=icon]:px-1">
              <AppPrimaryNavigation />
            </div>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-border/70">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={async () => { await logout(); window.location.assign("/login"); }}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {!isMobile && (
          <div className="sticky top-0 z-30 hidden h-14 items-center justify-end border-b border-border/70 bg-background/92 px-5 backdrop-blur-xl md:flex">
            <Button variant="ghost" size="sm" onClick={() => setShortcutReferenceOpen(true)} className="mr-1 gap-2 text-muted-foreground hover:text-foreground" aria-label="Open workspace keyboard shortcuts" title="Keyboard shortcuts">
              <Keyboard className="h-4 w-4" />
              <span className="hidden lg:inline">Shortcuts</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="shrink-0 text-muted-foreground hover:text-foreground" aria-label={`Switch to ${effectiveTheme === "dark" ? "bright" : "dark"} mode`} title={`Switch to ${effectiveTheme === "dark" ? "bright" : "dark"} mode`}>
              {effectiveTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        )}
        {isMobile && (
          <div className="flex border-b border-border/70 h-14 items-center justify-between bg-background/92 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 text-muted-foreground hover:text-foreground" aria-label={`Switch to ${effectiveTheme === "dark" ? "bright" : "dark"} mode`}>
              {effectiveTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 h-9">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuItem
                    onClick={() => setShortcutReferenceOpen(true)}
                    className="cursor-pointer"
                  >
                    <Keyboard className="mr-2 h-4 w-4" />
                    <span>Keyboard shortcuts</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => { await logout(); window.location.assign("/login"); }}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
        <main className="lumae-product-main flex-1 overflow-x-hidden p-4 sm:p-5 md:p-7">
          <div className="sr-only" aria-live="polite">{shortcutAnnouncement}</div>
          <GroupedPageTabs />
          {children}
        </main>
        <WorkspaceShortcutReference open={shortcutReferenceOpen} onOpenChange={setShortcutReferenceOpen} />
      </SidebarInset>
    </>
  );
}
