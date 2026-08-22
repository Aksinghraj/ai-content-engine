import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch, useLocation } from "wouter";
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
import BasicScriptGeneration from "./pages/BasicScriptGeneration";
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
import AnalyticsDashboardEnhanced from "./pages/AnalyticsDashboardEnhanced";
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
import SettingsAdvanced from "./pages/SettingsAdvanced";
import ProfileAdvanced from "./pages/ProfileAdvanced";
import RazorpayPayments from "./pages/RazorpayPayments";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import MyCredits from "./pages/MyCredits";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import CookiePolicy from "./pages/CookiePolicy";
import CookieConsentBanner from "./components/CookieConsentBanner";
import Footer from "./components/Footer";
import SocialMediaPublishing from "./pages/SocialMediaPublishing";
import PublishingTestDashboard from "./pages/PublishingTestDashboard";
import { GroupedRouteShell } from "./components/GroupedRouteShell";
import Blog from "./pages/Blog";
import BlogCategory from "./pages/BlogCategory";
import BlogPost from "./pages/BlogPost";
import PublicProfile from "./pages/PublicProfile";
import TwoFactorLogin from "./pages/TwoFactorLogin";
import BusinessAutomation from "./pages/BusinessAutomation";
import VerifyLocalEmail from "./pages/VerifyLocalEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DeleteAccount from "./pages/DeleteAccount";

function GroupedGenerator() {
  return <GroupedRouteShell><Generator /></GroupedRouteShell>;
}

function GroupedContentRewriter() {
  return <GroupedRouteShell><ContentRewriter /></GroupedRouteShell>;
}

function GroupedRepurposing() {
  return <GroupedRouteShell><RepurposingEngine /></GroupedRouteShell>;
}

function GroupedAutomation() {
  return <GroupedRouteShell><Automation /></GroupedRouteShell>;
}

function GroupedViralScore() {
  return <GroupedRouteShell><ViralScoreGenerator /></GroupedRouteShell>;
}

function BusinessEmailAutomation() {
  return <GroupedRouteShell><BusinessAutomation channel="email" /></GroupedRouteShell>;
}

function BusinessWhatsAppAutomation() {
  return <GroupedRouteShell><BusinessAutomation channel="whatsapp" /></GroupedRouteShell>;
}

function App() {
  const [location] = useLocation();
  const applicationPrefixes = [
    "/dashboard", "/content-studio", "/scheduling", "/automation", "/business", "/analytics", "/account", "/billing",
    "/ai-assistant", "/personal-ai", "/brand-voice", "/calendar", "/content-calendar", "/demo-videos", "/publishing-test-dashboard",
  ];
  const showPublicFooter = !applicationPrefixes.some((prefix) => location === prefix || location.startsWith(`${prefix}/`));

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="auto" switchable>
        <TooltipProvider>
          <CookieConsentBanner />
          <Switch>
            {/* Public Routes */}
            <Route path="/" component={Home} />
            <Route path="/login" component={LoginEnhanced} />
            <Route path="/privacy" component={PrivacyPolicy} />
            <Route path="/privacy-policy" component={PrivacyPolicy} />
            <Route path="/terms" component={TermsOfService} />
            <Route path="/about" component={AboutUs} />
            <Route path="/contact" component={Contact} />
            <Route path="/cookie-policy" component={CookiePolicy} />
            <Route path="/cookies" component={CookiePolicy} />
            <Route path="/verify-email" component={VerifyEmail} />
            <Route path="/verify-local-email" component={VerifyLocalEmail} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/reset-password" component={ResetPassword} />
            <Route path="/delete-account" component={DeleteAccount} />
            <Route path="/two-factor" component={TwoFactorLogin} />
            <Route path="/blog" component={Blog} />
            <Route path="/blog/category/:category" component={BlogCategory} />
            <Route path="/blog/:category/:slug" component={BlogPost} />
            <Route path="/u/:slug" component={PublicProfile} />

            {/* Canonical seven-area application routes */}
            <Route path="/dashboard" component={SimpleDashboard} />

            <Route path="/content-studio/ai-generator" component={GroupedGenerator} />
            <Route path="/content-studio/basic-script" component={BasicScriptGeneration} />
            <Route path="/content-studio/media-generation" component={MediaGeneration} />
            <Route path="/content-studio/content-rewriter" component={GroupedContentRewriter} />
            <Route path="/content-studio/repurposing" component={GroupedRepurposing} />
            <Route path="/content-studio/video-repurposing" component={VideoRepurposingEngine} />
            <Route path="/content-studio/format-agent" component={ContentFormattingAgent} />
            <Route path="/content-studio/create-post-pro" component={CreatePostAdvanced} />

            <Route path="/scheduling/post-scheduling" component={PostScheduling} />
            <Route path="/scheduling/social-publishing" component={SocialMediaPublishing} />
            <Route path="/scheduling/connected-accounts" component={ConnectedAccounts} />

            <Route path="/automation/auto-reply" component={AutoReplySystem} />
            <Route path="/automation/reply-inbox" component={AutoReplyAdvanced} />
            <Route path="/automation/escalation" component={SentimentEscalation} />
            <Route path="/automation/social-automation" component={GroupedAutomation} />

            <Route path="/business/email-automation" component={BusinessEmailAutomation} />
            <Route path="/business/whatsapp-automation" component={BusinessWhatsAppAutomation} />

            <Route path="/analytics/usage" component={UsageAnalytics} />
            <Route path="/analytics/roi" component={ROIDashboard} />
            <Route path="/analytics/viral-score" component={GroupedViralScore} />

            <Route path="/account/profile" component={ProfileAdvanced} />
            <Route path="/account/settings" component={SettingsAdvanced} />
            <Route path="/account/oauth-settings" component={OAuthSettings} />

            <Route path="/billing/buy-credits" component={RazorpayPayments} />
            <Route path="/billing/my-credits" component={MyCredits} />
            <Route path="/billing/subscription-plans" component={SubscriptionPlans} />

            {/* Legacy URLs retained as redirects to the canonical grouped routes */}
            <Route path="/generator"><Redirect to="/content-studio/ai-generator" /></Route>
            <Route path="/media-generation"><Redirect to="/content-studio/media-generation" /></Route>
            <Route path="/content-rewriter"><Redirect to="/content-studio/content-rewriter" /></Route>
            <Route path="/rewriter"><Redirect to="/content-studio/content-rewriter" /></Route>
            <Route path="/repurposing"><Redirect to="/content-studio/repurposing" /></Route>
            <Route path="/video-repurposing"><Redirect to="/content-studio/video-repurposing" /></Route>
            <Route path="/content-formatting"><Redirect to="/content-studio/format-agent" /></Route>
            <Route path="/create-post-advanced"><Redirect to="/content-studio/create-post-pro" /></Route>
            <Route path="/post-scheduling"><Redirect to="/scheduling/post-scheduling" /></Route>
            <Route path="/social-publishing"><Redirect to="/scheduling/social-publishing" /></Route>
            <Route path="/connected-accounts"><Redirect to="/scheduling/connected-accounts" /></Route>
            <Route path="/auto-reply"><Redirect to="/automation/auto-reply" /></Route>
            <Route path="/auto-reply-advanced"><Redirect to="/automation/reply-inbox" /></Route>
            <Route path="/sentiment-escalation"><Redirect to="/automation/escalation" /></Route>
            <Route path="/social-automation"><Redirect to="/automation/social-automation" /></Route>
            <Route path="/automation"><Redirect to="/automation/auto-reply" /></Route>
            <Route path="/advanced-automation"><Redirect to="/automation/social-automation" /></Route>
            <Route path="/automation-dashboard"><Redirect to="/automation/social-automation" /></Route>
            <Route path="/automation-manager"><Redirect to="/automation/social-automation" /></Route>
            <Route path="/simple-automation"><Redirect to="/automation/social-automation" /></Route>
            <Route path="/social-automation-v3"><Redirect to="/automation/social-automation" /></Route>
            <Route path="/usage-analytics"><Redirect to="/analytics/usage" /></Route>
            <Route path="/roi-dashboard"><Redirect to="/analytics/roi" /></Route>
            <Route path="/viral-score"><Redirect to="/analytics/viral-score" /></Route>
            <Route path="/analytics"><Redirect to="/analytics/usage" /></Route>
            <Route path="/analytics-dash"><Redirect to="/analytics/usage" /></Route>
            <Route path="/profile-advanced"><Redirect to="/account/profile" /></Route>
            <Route path="/settings-advanced"><Redirect to="/account/settings" /></Route>
            <Route path="/settings"><Redirect to="/account/settings" /></Route>
            <Route path="/oauth-settings"><Redirect to="/account/oauth-settings" /></Route>
            <Route path="/razorpay-payments"><Redirect to="/billing/buy-credits" /></Route>
            <Route path="/my-credits"><Redirect to="/billing/my-credits" /></Route>
            <Route path="/subscription-plans"><Redirect to="/billing/subscription-plans" /></Route>
            <Route path="/credits"><Redirect to="/billing/my-credits" /></Route>
            <Route path="/payments"><Redirect to="/billing/buy-credits" /></Route>

            {/* Retained specialist pages that remain outside the primary navigation */}
            <Route path="/brand-voice" component={BrandVoice} />
            <Route path="/calendar" component={ContentCalendar} />
            <Route path="/content-calendar" component={ContentCalendar} />
            <Route path="/ai-assistant" component={AIAssistant} />
            <Route path="/personal-ai" component={PersonalAI} />
            <Route path="/demo-videos" component={DemoVideos} />
            <Route path="/publishing-test-dashboard" component={PublishingTestDashboard} />
            <Route path="/pricing" component={Pricing} />
            <Route path="*" component={NotFound} />
          </Switch>
          {showPublicFooter && <Footer />}
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
