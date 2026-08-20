import { LogOut, User } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { AppPrimaryNavigation } from "@/components/AppNavigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#26262b] bg-[#09090b]/95 text-[#f5f5f7] backdrop-blur-xl">
      <div className="mx-auto flex h-15 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <button onClick={() => navigate("/dashboard")} className="flex shrink-0 items-center gap-2 rounded-lg text-left" aria-label="Lumae AI dashboard">
          <img src="/manus-storage/lumae-logo-icon_ccacaad9.jpg" alt="Lumae AI" width={32} height={32} className="h-8 w-8 rounded-lg object-cover" />
          <span className="text-base font-semibold tracking-tight">Lumae AI</span>
        </button>

        {isAuthenticated && user && (
          <div className="hidden min-w-0 flex-1 justify-center md:flex">
            <AppPrimaryNavigation compact />
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-[#26262b] bg-transparent text-[#f5f5f7] hover:bg-[#141417] hover:text-white">
                  <User className="mr-2 h-4 w-4" />
                  <span className="max-w-28 truncate">{user.name || "Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-[#26262b] bg-[#141417] text-[#f5f5f7]">
                <DropdownMenuLabel className="text-[#f5f5f7]">{user.email || user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#26262b]" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-300 focus:bg-red-500/10 focus:text-red-200">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => (window.location.href = getLoginUrl())} size="sm" className="lumae-gradient-cta">
              Log In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
