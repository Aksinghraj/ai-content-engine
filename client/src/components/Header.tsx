import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Monitor, LogOut, User, Settings, Sparkles, Zap, BarChart3, Cog, Coins } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

// Credit Balance Component
function CreditBalance() {
  const { data: balance } = trpc.credits.getBalance.useQuery();
  const balanceAmount = typeof balance === 'object' ? balance?.balance : balance;
  return <span>{balanceAmount || 0} credits</span>;
}

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">AI Content Engine</span>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          {/* Theme Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-foreground">
                {theme === "light" && <Sun className="w-4 h-4" />}
                {theme === "dark" && <Moon className="w-4 h-4" />}
                {theme === "auto" && <Monitor className="w-4 h-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="w-4 h-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("auto")}>
                <Monitor className="w-4 h-4 mr-2" />
                Auto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Credit Balance Display */}
          {isAuthenticated && user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
              <Coins className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-slate-900">
                {/* Credit balance will be fetched from tRPC */}
                <CreditBalance />
              </span>
            </div>
          )}

          {/* User Menu */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  {user.name || "Account"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email || user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                {user.subscriptionTier === "pro" && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/automation")}>
                      <Zap className="w-4 h-4 mr-2" />
                      Automation
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/advanced-automation")}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Advanced Automation
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/automation-dashboard")}>
                      <Cog className="w-4 h-4 mr-2" />
                      Automation Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/analytics")}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/automation-manager")}>
                      <Zap className="w-4 h-4 mr-2" />
                      Automation Manager
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/credits")}>
                      <Coins className="w-4 h-4 mr-2" />
                      Credits
                    </DropdownMenuItem>
                  </>
                )}
                {user.subscriptionTier === "free" && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/credits")}>
                      <Coins className="w-4 h-4 mr-2" />
                      Buy Credits
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/pricing")}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
