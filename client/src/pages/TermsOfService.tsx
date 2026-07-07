import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/10">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-xl font-bold text-foreground">Terms & Conditions</h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Terms & Conditions</h1>
            <p className="text-muted-foreground">Last updated: July 2026</p>
          </div>

          {/* Agreement to Terms */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Lumae AI, operated by <strong className="text-foreground">Ankit Singh</strong> at <strong className="text-foreground">lumae.co.in</strong>, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our service. We reserve the right to modify these terms at any time, and your continued use of the service constitutes acceptance of any changes.
            </p>
          </section>

          {/* Description of Service */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lumae AI is an AI-powered content generation and social media automation platform. The Service allows users to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Generate AI-powered viral content</li>
              <li>Schedule and automate social media posts</li>
              <li>Analyze content performance and engagement</li>
              <li>Manage multiple social media accounts</li>
              <li>Access advanced analytics and insights</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Supported platforms include Instagram, Twitter/X, LinkedIn, Facebook, YouTube, TikTok, and others.
            </p>
          </section>

          {/* User Accounts */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Complying with all applicable laws and regulations</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Contact us immediately at{" "}
              <a href="mailto:imankitsingh.in@gmail.com" className="text-purple-600 hover:text-purple-700 underline">
                imankitsingh.in@gmail.com
              </a>{" "}
              if you suspect unauthorized access to your account.
            </p>
          </section>

          {/* Subscription Plans & Payments */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">4. Subscription Plans & Payments</h2>
            <div className="bg-muted/50 rounded-lg p-6 border border-border space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Free Tier</h3>
                <p className="text-muted-foreground text-sm">
                  Our free tier provides limited access to core features. Users on the free tier may have usage limits and may see advertisements.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Paid Plans</h3>
                <p className="text-muted-foreground text-sm">
                  By subscribing to a paid plan, you agree to pay the applicable fees in INR (Indian Rupees). Payments are processed securely through Razorpay. Subscriptions automatically renew unless cancelled before the renewal date.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Refund Policy</h3>
                <p className="text-muted-foreground text-sm">
                  Refunds are provided within 7 days of purchase if the service is not functioning as described. No refunds are provided for change of mind or cancellation after 7 days. For refund requests, contact us at imankitsingh.in@gmail.com.
                </p>
              </div>
            </div>
          </section>

          {/* Free Tier Limitations */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">5. Free Tier Limitations</h2>
            <p className="text-muted-foreground leading-relaxed">
              The free tier provides limited access to our services. Users who exceed free tier limits will be prompted to upgrade to a paid subscription plan. We reserve the right to modify free tier limits at any time with notice.
            </p>
          </section>

          {/* Acceptable Use Policy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">6. Acceptable Use Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Generate illegal, harmful, defamatory, or offensive content</li>
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Infringe on intellectual property rights or copyrights</li>
              <li>Spam, harass, or engage in deceptive practices</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Reverse engineer, decompile, or attempt to derive the source code</li>
              <li>Engage in any form of fraud or malicious activity</li>
              <li>Violate social media platform terms of service</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We reserve the right to suspend or terminate accounts that violate this policy.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">7. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service and its original content, features, and functionality are the exclusive property of Ankit Singh and Lumae AI, protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You retain ownership of any content you create using our platform. However, you grant us a limited, non-exclusive license to process, store, and display your content to provide the Service. You are responsible for ensuring that content you generate complies with all applicable laws and does not infringe on third-party rights.
            </p>
          </section>

          {/* User-Generated Content */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">8. User-Generated Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are solely responsible for any content you generate, upload, or post using our Service. You represent and warrant that:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>You own or have the right to use all content you generate</li>
              <li>Your content does not violate any third-party rights</li>
              <li>Your content complies with all applicable laws</li>
              <li>Your content is not defamatory, obscene, or offensive</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We are not responsible for user-generated content and reserve the right to remove content that violates these terms.
            </p>
          </section>

          {/* Disclaimer of Warranties */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">9. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We do not warrant that the Service will be uninterrupted, error-free, or secure. Your use of the Service is at your own risk.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">10. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, LUMAE AI AND ANKIT SINGH SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR USE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE PAST 12 MONTHS.
            </p>
          </section>

          {/* Indemnification */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">11. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless Lumae AI, Ankit Singh, and their officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any law or third-party rights</li>
              <li>Content you generate or post</li>
            </ul>
          </section>

          {/* Third-Party Links */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">12. Third-Party Links & Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service may contain links to third-party websites and services. We are not responsible for the content, accuracy, or practices of these third-party sites. Your use of third-party services is governed by their terms and privacy policies. We encourage you to review these policies before using any third-party service.
            </p>
          </section>

          {/* Termination */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">13. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to terminate or suspend your account and access to the Service at any time, with or without cause, with or without notice. Grounds for termination include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Violation of these Terms</li>
              <li>Illegal or fraudulent activity</li>
              <li>Non-payment of fees</li>
              <li>Abuse of the Service</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Upon termination, your right to use the Service ceases immediately. We may retain your data as required by law.
            </p>
          </section>

          {/* Governing Law */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">14. Governing Law & Jurisdiction</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by the laws of India, without regard to its conflict of law principles. Any disputes shall be resolved in the courts of India. You consent to the exclusive jurisdiction of these courts.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">15. Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed">
              Before initiating legal proceedings, we encourage you to contact us to resolve any disputes. If a dispute cannot be resolved through negotiation, it shall be subject to the laws and jurisdiction specified in Section 14.
            </p>
          </section>

          {/* Advertising & Monetization */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">16. Advertising & Monetization</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our website displays advertisements powered by Google AdSense. These advertisements may be personalized based on your browsing history and interests. We comply with Google AdSense policies and all applicable advertising regulations. You can opt out of personalized advertising through your Google account settings.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">17. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms at any time. We will notify you of any material changes by posting the updated Terms on our website and updating the "Last updated" date. Your continued use of the Service following the posting of revised Terms means that you accept and agree to the changes.
            </p>
          </section>

          {/* Contact Us */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">18. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions or concerns about these Terms, please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-6 border border-border space-y-2">
              <p className="text-muted-foreground">
                <strong className="text-foreground">Email:</strong> imankitsingh.in@gmail.com
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Website:</strong> https://lumae.co.in
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Company:</strong> Lumae AI
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Owner:</strong> Ankit Singh
              </p>
            </div>
          </section>

          {/* Compliance Notice */}
          <section className="space-y-4 bg-purple-950/20 border border-purple-900/50 rounded-lg p-6">
            <h2 className="text-lg font-bold text-foreground">Compliance Notice</h2>
            <p className="text-muted-foreground text-sm">
              These Terms of Service are compliant with Google AdSense policies, Indian consumer protection laws, and international e-commerce regulations. We are committed to maintaining transparency and protecting user rights.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
