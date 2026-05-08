import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import LoginEnhanced from "./pages/LoginEnhanced";
import Home from "./pages/Home";
import LandingPremium from "./pages/LandingPremium";
import LandingPage from "./pages/LandingPage";
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
import ViralScoreGenerator from "./pages/ViralScoreGenerator";
import ContentRewriter from "./pages/ContentRewriter";
import RepurposingEngine from "./pages/RepurposingEngine";
import BrandVoice from "./pages/BrandVoice";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import ContentCalendar from "./pages/ContentCalendar";
import AIAssistant from "./pages/AIAssistant";
import PersonalAI from "./pages/PersonalAI";
import SocialAutomationV2 from "./pages/SocialAutomationV2";
import { SimpleAutomation } from "./pages/SimpleAutomation";
import DemoVideos from "./pages/DemoVideos";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

// List of public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/landing"];

// Protected Route Wrapper
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return <Component {...rest} />;
}

// Public Route Wrapper
function PublicRoute({ component: Component, path, ...rest }: any) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // If user is authenticated and tries to access login page, redirect to dashboard
    if (!loading && user && (path === "/" || path === "/login")) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate, path]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <>
      <Switch>
        {/* Public Routes - No login required */}
        <Route path={"/"}>
          {(params) => <PublicRoute component={LoginEnhanced} path="/" {...params} />}
        </Route>
        <Route path={"/login"}>
          {(params) => <PublicRoute component={LoginEnhanced} path="/login" {...params} />}
        </Route>
        <Route path={"/landing"} component={LandingPage} />
        <Route path={"/landing-premium"} component={LandingPremium} />

        {/* Protected Routes - Login required */}
        <Route path={"/home"}>
          {(params) => <ProtectedRoute component={HomeNew} {...params} />}
        </Route>
        <Route path={"/dashboard"}>
          {(params) => <ProtectedRoute component={Dashboard} {...params} />}
        </Route>
        <Route path={"/features"}>
          {(params) => <ProtectedRoute component={Features} {...params} />}
        </Route>
        <Route path={"/settings"}>
          {(params) => <ProtectedRoute component={Settings} {...params} />}
        </Route>
        <Route path={"/payments"}>
          {(params) => <ProtectedRoute component={Payments} {...params} />}
        </Route>
        <Route path={"/generator"}>
          {(params) => <ProtectedRoute component={Generator} {...params} />}
        </Route>
        <Route path={"/pricing"}>
          {(params) => <ProtectedRoute component={Pricing} {...params} />}
        </Route>
        <Route path={"/automation"}>
          {(params) => <ProtectedRoute component={Automation} {...params} />}
        </Route>
        <Route path={"/advanced-automation"}>
          {(params) => <ProtectedRoute component={AdvancedAutomation} {...params} />}
        </Route>
        <Route path={"/automation-dashboard"}>
          {(params) => <ProtectedRoute component={AutomationDashboardNew} {...params} />}
        </Route>
        <Route path={"/analytics"}>
          {(params) => <ProtectedRoute component={Analytics} {...params} />}
        </Route>
        <Route path={"/credits"}>
          {(params) => <ProtectedRoute component={Credits} {...params} />}
        </Route>
        <Route path={"/automation-manager"}>
          {(params) => <ProtectedRoute component={AutomationManager} {...params} />}
        </Route>
        <Route path={"/viral-score"}>
          {(params) => <ProtectedRoute component={ViralScoreGenerator} {...params} />}
        </Route>
        <Route path={"/rewriter"}>
          {(params) => <ProtectedRoute component={ContentRewriter} {...params} />}
        </Route>
        <Route path={"/repurposing"}>
          {(params) => <ProtectedRoute component={RepurposingEngine} {...params} />}
        </Route>
        <Route path={"/brand-voice"}>
          {(params) => <ProtectedRoute component={BrandVoice} {...params} />}
        </Route>
        <Route path={"/analytics-dashboard"}>
          {(params) => <ProtectedRoute component={AnalyticsDashboard} {...params} />}
        </Route>
        <Route path={"/content-calendar"}>
          {(params) => <ProtectedRoute component={ContentCalendar} {...params} />}
        </Route>
        <Route path={"/ai-assistant"}>
          {(params) => <ProtectedRoute component={AIAssistant} {...params} />}
        </Route>
        <Route path={"/personal-ai"}>
          {(params) => <ProtectedRoute component={PersonalAI} {...params} />}
        </Route>
        <Route path={"/simple-automation"}>
          {(params) => <ProtectedRoute component={SimpleAutomation} {...params} />}
        </Route>
        <Route path={"/social-automation"}>
          {(params) => <ProtectedRoute component={SocialAutomationV2} {...params} />}
        </Route>
        <Route path={"/demo-videos"}>
          {(params) => <ProtectedRoute component={DemoVideos} {...params} />}
        </Route>

        {/* 404 Route */}
        <Route path={"/404"} component={NotFound} />

        {/* Fallback - redirect to landing */}
        <Route component={LandingPremium} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="auto"
        switchable
      >
        <TooltipProvider>
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
