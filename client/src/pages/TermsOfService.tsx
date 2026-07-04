import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-300 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
          </Button>
          <h1 className="text-xl font-bold text-white">Terms & Conditions</h1>
        </div>
      </div>
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Terms & Conditions</h1>
        <p className="text-slate-400 mb-8">Last updated: July 4, 2026</p>
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Agreement to Terms</h2>
            <p className="text-slate-300 leading-relaxed">By accessing and using Lumae AI, operated by <strong className="text-white">Ankit Singh</strong> at <strong className="text-white">lumae.co.in</strong>, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our service.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p className="text-slate-300 leading-relaxed">Lumae AI is an AI-powered content generation and social media automation platform. The Service allows users to generate viral content, schedule posts, automate social media publishing, and analyze content performance across multiple platforms including Instagram, Twitter/X, LinkedIn, Facebook, YouTube, and TikTok.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
            <p className="text-slate-300 leading-relaxed mb-3">When you create an account with us, you must provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account and password, and for all activities that occur under your account. Notify us immediately of any unauthorized use at <a href="mailto:imankitsingh.in@gmail.com" className="text-purple-400 hover:text-purple-300 underline">imankitsingh.in@gmail.com</a>.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Subscription Plans and Payments</h2>
            <p className="text-slate-300 leading-relaxed mb-3">Lumae AI offers both free and paid subscription plans. By subscribing to a paid plan, you agree to pay the applicable fees. Payments are processed securely through Razorpay. Subscriptions automatically renew unless cancelled before the renewal date. Refunds are provided within 7 days of purchase if the service is not functioning as described.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Free Tier Limitations</h2>
            <p className="text-slate-300 leading-relaxed">The free tier provides up to 5 AI content generations per day. Users who exceed the free tier limits will be prompted to upgrade to a paid subscription plan. We reserve the right to modify free tier limits at any time.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Acceptable Use Policy</h2>
            <p className="text-slate-300 leading-relaxed mb-3">You agree not to use the Service to generate illegal, harmful, or defamatory content; violate any applicable laws; infringe on intellectual property rights; spam or engage in deceptive practices; attempt to gain unauthorized access to any part of the Service; or reverse engineer any part of the platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Intellectual Property</h2>
            <p className="text-slate-300 leading-relaxed">The Service and its original content, features, and functionality are the exclusive property of Ankit Singh and Lumae AI. You retain ownership of any content you create using our platform, but grant us a limited license to process and store your content to provide the Service.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Disclaimer of Warranties</h2>
            <p className="text-slate-300 leading-relaxed">The Service is provided on an "AS IS" basis without any warranties of any kind. AI-generated content may not always be accurate or appropriate. You are responsible for reviewing all AI-generated content before publishing.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed">To the maximum extent permitted by applicable law, Lumae AI and Ankit Singh shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Governing Law</h2>
            <p className="text-slate-300 leading-relaxed">These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts located in India.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Changes to Terms</h2>
            <p className="text-slate-300 leading-relaxed">We reserve the right to modify these Terms at any time. We will provide notice of significant changes by updating the "Last updated" date. Your continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Contact Us</h2>
            <p className="text-slate-300 leading-relaxed">If you have any questions about these Terms, please contact us:</p>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 mt-3 space-y-2">
              <p className="text-slate-300"><strong className="text-white">Owner:</strong> Ankit Singh</p>
              <p className="text-slate-300"><strong className="text-white">Website:</strong> lumae.co.in</p>
              <p className="text-slate-300"><strong className="text-white">Email:</strong> <a href="mailto:imankitsingh.in@gmail.com" className="text-purple-400 hover:text-purple-300 underline">imankitsingh.in@gmail.com</a></p>
            </div>
          </section>
        </div>
      </main>
      <footer className="border-t border-slate-700 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2026 Lumae AI. All rights reserved. Owned by Ankit Singh.</p>
          <div className="flex justify-center gap-4 mt-2 flex-wrap">
            <button onClick={() => navigate("/privacy-policy")} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => navigate("/terms")} className="hover:text-white transition-colors">Terms & Conditions</button>
            <button onClick={() => navigate("/contact")} className="hover:text-white transition-colors">Contact</button>
            <button onClick={() => navigate("/about")} className="hover:text-white transition-colors">About Us</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
