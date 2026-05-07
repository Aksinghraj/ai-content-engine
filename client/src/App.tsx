import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import LoginEnhanced from "./pages/LoginEnhanced";
import Features from "./pages/Features";
import Settings from "./pages/Settings";
import Payments from "./pages/Payments";
import HomeNew from "./pages/HomeNew";
import Generator from "./pages/Generator";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Automation from "./pages/Automation";
import AdvancedAutomation from "./pages/AdvancedAutomation";
import Analytics from "./pages/Analytics";
import AutomationDashboardNew from "./pages/AutomationDashboardNew";
import Credits from "./pages/Credits";
import AutomationManager from "./pages/AutomationManager";

function Router() {
  return (
    <>
      <Switch>
        <Route path={"/"} component={LoginEnhanced} />
        <Route path={"/login"} component={LoginEnhanced} />
        <Route path={"/home"} component={HomeNew} />
        <Route path={"/features"} component={Features} />
        <Route path={"/settings"} component={Settings} />
        <Route path={"/payments"} component={Payments} />
        <Route path={"/landing"} component={Home} />
        <Route path={"/generator"} component={Generator} />
        <Route path={"/pricing"} component={Pricing} />
        <Route path={"/dashboard"} component={Dashboard} />
         <Route path={"automation"} component={Automation} />
        <Route path={"advanced-automation"} component={AdvancedAutomation} />
        <Route path={"automation-dashboard"} component={AutomationDashboardNew} />
        <Route path={"analytics"} component={Analytics} />
        <Route path={"credits"} component={Credits} />
        <Route path={"automation-manager"} component={AutomationManager} />
        <Route path={"404"} component={NotFound} />
        {/* Final fallback route - redirect to login */}
        <Route component={LoginEnhanced} />
      </Switch>
    </>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="auto"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
