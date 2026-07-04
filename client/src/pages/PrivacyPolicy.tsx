import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-400 mb-8">Last updated: July 4, 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p className="text-slate-300 leading-relaxed">
              Welcome to Lumae AI ("we", "our", or "us"), owned and operated by <strong className="text-white">Ankit Singh</strong>. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong className="text-white">lumae.co.in</strong> and use our AI-powered content generation services.
            </p>
            <p className="text-slate-300 leading-relaxed mt-3">
              If you have any questions or concerns about this policy, please contact us at{" "}
              <a href="mailto:imankitsingh.in@gmail.com" className="text-purple-400 hover:text-purple-300 underline">
                imankitsingh.in@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <p className="text-slate-300 leading-relaxed mb-3">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Name and email address when you create an account</li>
              <li>Profile information such as bio, profile photo, and social media handles</li>
              <li>Content you create, generate, or schedule using our platform</li>
              <li>Payment information processed securely through Razorpay (we do not store card details)</li>
              <li>Communications you send us via email or contact forms</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-3">We also automatically collect certain information when you use our service:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Log data including IP address, browser type, pages visited, and time spent</li>
              <li>Device information including hardware model and operating system</li>
              <li>Usage data about how you interact with our features</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Use of Data</h2>
            <p className="text-slate-300 leading-relaxed mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Provide, operate, and maintain our AI content generation services</li>
              <li>Process transactions and send related information including payment confirmations</li>
              <li>Send administrative information such as updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Improve our platform based on how you use it</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect and prevent fraudulent transactions and other illegal activities</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Social Media Data</h2>
            <p className="text-slate-300 leading-relaxed">
              If you connect your social media accounts (Instagram, YouTube, Twitter/X, LinkedIn, Facebook, TikTok), we collect data necessary to schedule and publish content on your behalf. We share this data with the respective social media platforms only to enable the content publishing and automation features you have explicitly requested. We do not sell or share your social media data with any other third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Cookies and Advertising</h2>
            <p className="text-slate-300 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our platform. We also use Google AdSense to display advertisements. Google AdSense uses cookies to serve ads based on your prior visits to our website or other websites. You may opt out of personalized advertising by visiting{" "}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">
                Google Ads Settings
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Data Security</h2>
            <p className="text-slate-300 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. We use industry-standard SSL encryption for data transmission. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Data Retention and Deletion</h2>
            <p className="text-slate-300 leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time by contacting us at{" "}
              <a href="mailto:imankitsingh.in@gmail.com" className="text-purple-400 hover:text-purple-300 underline">
                imankitsingh.in@gmail.com
              </a>. We will respond to deletion requests within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Your Rights</h2>
            <p className="text-slate-300 leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Data portability — receive your data in a structured, machine-readable format</li>
              <li>Withdraw consent at any time where processing is based on consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Children's Privacy</h2>
            <p className="text-slate-300 leading-relaxed">
              Our service is not directed to children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and believe your child has provided us with personal data, please contact us immediately at{" "}
              <a href="mailto:imankitsingh.in@gmail.com" className="text-purple-400 hover:text-purple-300 underline">
                imankitsingh.in@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Changes to This Privacy Policy</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Contact Us</h2>
            <p className="text-slate-300 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 mt-3 space-y-2">
              <p className="text-slate-300"><strong className="text-white">Owner:</strong> Ankit Singh</p>
              <p className="text-slate-300"><strong className="text-white">Website:</strong> lumae.co.in</p>
              <p className="text-slate-300">
                <strong className="text-white">Email:</strong>{" "}
                <a href="mailto:imankitsingh.in@gmail.com" className="text-purple-400 hover:text-purple-300 underline">
                  imankitsingh.in@gmail.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
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
