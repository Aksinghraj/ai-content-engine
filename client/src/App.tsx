import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import LoginEnhanced from "./pages/LoginEnhanced";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import SimpleDashboard from "./pages/SimpleDashboard";
import Settings from "./pages/Settings";
import Payments from "./pages/Payments";
import Generator from "./pages/Generator";
import Pricing from "./pages/Pricing";
import Automation from "./pages/Automation";
import AdvancedAutomation from "./pages/AdvancedAutomation";
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
import SocialAutomationV3 from "./pages/SocialAutomationV3";
import SocialAutomation from "./pages/SocialAutomation";
import PostScheduling from "./pages/PostScheduling";
import DemoVideos from "./pages/DemoVideos";
import { SimpleAutomation } from "./pages/SimpleAutomation";
import KimiAdvancedHome from "./pages/KimiAdvancedHome";
import { OAuthSettings } from "./pages/OAuthSettings";
import AutoReplySystem from "./pages/AutoReplySystem";
import ROIDashboard from "./pages/ROIDashboard";
import VideoRepurposingEngine from "./pages/VideoRepurposingEngine";
import ContentFormattingAgent from "./pages/ContentFormattingAgent";
import SentimentEscalation from "./pages/SentimentEscalation";
import MediaGeneration from "./pages/MediaGeneration";
import VerifyEmail from "./pages/VerifyEmail";
import UsageAnalytics from "./pages/UsageAnalytics";
import ConnectedAccounts from "./pages/ConnectedAccounts";
import AutoReplyAdvanced from "./pages/AutoReplyAdvanced";
import CreatePostAdvanced from "./pages/CreatePostAdvanced";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="auto" switchable>
        <TooltipProvider>
          <Switch>
            {/* Public Routes */}
            <Route path="/" component={Home} />
            <Route path="/login" component={LoginEnhanced} />
            <Route path="/privacy" component={PrivacyPolicy} />
            <Route path="/terms" component={TermsOfService} />
            <Route path="/verify-email" component={VerifyEmail} />

            {/* Protected Routes */}
            <Route path="/dashboard" component={SimpleDashboard} />
            <Route path="/settings" component={Settings} />
            <Route path="/payments" component={Payments} />
            <Route path="/generator" component={Generator} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/automation" component={Automation} />
            <Route path="/advanced-automation" component={AdvancedAutomation} />
            <Route path="/automation-dashboard" component={AutomationDashboardNew} />
            <Route path="/credits" component={Credits} />
            <Route path="/automation-manager" component={AutomationManager} />
            <Route path="/viral-score" component={ViralScoreGenerator} />
            <Route path="/content-rewriter" component={ContentRewriter} />
            <Route path="/repurposing" component={RepurposingEngine} />
            <Route path="/brand-voice" component={BrandVoice} />
            <Route path="/analytics" component={AnalyticsDashboard} />
            <Route path="/calendar" component={ContentCalendar} />
            <Route path="/ai-assistant" component={AIAssistant} />
            <Route path="/personal-ai" component={PersonalAI} />
            <Route path="/social-automation-v3" component={SocialAutomationV3} />
            <Route path="/social-automation" component={SocialAutomation} />
            <Route path="/post-scheduling" component={PostScheduling} />
            <Route path="/demo-videos" component={DemoVideos} />
            <Route path="/simple-automation" component={SimpleAutomation} />
            <Route path="/oauth-settings" component={OAuthSettings} />
            <Route path="/auto-reply" component={AutoReplySystem} />
            <Route path="/roi-dashboard" component={ROIDashboard} />
            <Route path="/video-repurposing" component={VideoRepurposingEngine} />
            <Route path="/content-formatting" component={ContentFormattingAgent} />
            <Route path="/sentiment-escalation" component={SentimentEscalation} />
            <Route path="/media-generation" component={MediaGeneration} />
            <Route path="/usage-analytics" component={UsageAnalytics} />
            <Route path="/connected-accounts" component={ConnectedAccounts} />
            <Route path="/auto-reply-advanced" component={AutoReplyAdvanced} />
            <Route path="/create-post-advanced" component={CreatePostAdvanced} />
            <Route path="*" component={NotFound} />
          </Switch>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
