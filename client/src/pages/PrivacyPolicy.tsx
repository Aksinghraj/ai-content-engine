import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
          <h1 className="text-xl font-bold text-foreground">Privacy Policy</h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: July 2026</p>
          </div>

          {/* Introduction */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Lumae AI ("we," "us," "our," or "Company"), owned and operated by <strong className="text-foreground">Ankit Singh</strong>. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong className="text-foreground">lumae.co.in</strong> and use our AI-powered content generation services.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions or concerns about this policy, please contact us at{" "}
              <a href="mailto:imankitsingh.in@gmail.com" className="text-purple-600 hover:text-purple-700 underline">
                imankitsingh.in@gmail.com
              </a>.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">We collect information that you provide directly to us, including:</p>
            <div className="bg-muted/50 rounded-lg p-6 border border-border space-y-3">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>Name and email address when you create an account</li>
                  <li>Profile information such as bio, profile photo, and social media handles</li>
                  <li>Content you create, generate, or schedule using our platform</li>
                  <li>Payment information (processed securely through Razorpay)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Automatically Collected Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages visited, time spent, actions taken)</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Analytics data through Google Analytics</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">We use the information we collect for various purposes:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>To provide, maintain, and improve our services</li>
              <li>To process transactions and send related information</li>
              <li>To send promotional communications (with your consent)</li>
              <li>To analyze usage patterns and improve user experience</li>
              <li>To detect and prevent fraudulent transactions and other illegal activities</li>
              <li>To comply with legal obligations</li>
              <li>To personalize your experience and deliver targeted advertising</li>
            </ul>
          </section>

          {/* Google Analytics & Advertising */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">4. Google Analytics & Advertising</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use Google Analytics to understand how visitors use our website. Google Analytics collects information such as:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
              <li>Pages you visit and time spent on each page</li>
              <li>Traffic sources and user flow</li>
              <li>Device and browser information</li>
              <li>Geographic location (anonymized)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              We also use Google AdSense to display personalized advertisements. Google AdSense may use cookies to serve ads based on your prior visits to our website and other websites. You can opt out of personalized advertising by visiting{" "}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 underline">
                Google Ads Settings
              </a>.
            </p>
          </section>

          {/* Cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">5. Cookies & Tracking Technologies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience. Please refer to our{" "}
              <a href="/cookie-policy" className="text-purple-600 hover:text-purple-700 underline">
                Cookie Policy
              </a>{" "}
              for detailed information about the cookies we use and how to manage them.
            </p>
          </section>

          {/* Data Sharing */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">6. Data Sharing & Third Parties</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell your personal information to third parties. However, we may share information with:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Service Providers:</strong> Razorpay (payment processing), Google (analytics & advertising)</li>
              <li><strong>Social Media Platforms:</strong> When you authorize us to post content on your behalf</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">7. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your personal information, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>SSL/TLS encryption for all data in transit</li>
              <li>Secure password hashing and storage</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Compliance with PCI DSS standards for payment data</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">8. Your Privacy Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on your location, you may have the following rights:
            </p>
            <div className="bg-muted/50 rounded-lg p-6 border border-border space-y-3">
              <div>
                <h3 className="font-semibold text-foreground mb-2">GDPR (EU Users)</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>Right to access your personal data</li>
                  <li>Right to rectify inaccurate data</li>
                  <li>Right to erasure ("right to be forgotten")</li>
                  <li>Right to restrict processing</li>
                  <li>Right to data portability</li>
                  <li>Right to object to processing</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">CCPA (California Users)</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>Right to know what personal information is collected</li>
                  <li>Right to know whether personal information is sold or disclosed</li>
                  <li>Right to opt out of the sale or sharing of personal information</li>
                  <li>Right to delete personal information</li>
                  <li>Right to correct inaccurate personal information</li>
                </ul>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise any of these rights, please contact us at{" "}
              <a href="mailto:imankitsingh.in@gmail.com" className="text-purple-600 hover:text-purple-700 underline">
                imankitsingh.in@gmail.com
              </a>.
            </p>
          </section>

          {/* Data Retention */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">9. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. You can request deletion of your account and associated data at any time by contacting us at{" "}
              <a href="mailto:imankitsingh.in@gmail.com" className="text-purple-600 hover:text-purple-700 underline">
                imankitsingh.in@gmail.com
              </a>.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information immediately.
            </p>
          </section>

          {/* International Data Transfers */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">11. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to, stored in, and processed in countries other than your country of residence. These countries may have data protection laws that differ from your home country. By using our service, you consent to the transfer of your information to countries outside your country of residence.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">12. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website and updating the "Last updated" date above. Your continued use of our service following the posting of revised Privacy Policy means that you accept and agree to the changes.
            </p>
          </section>

          {/* Contact Us */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">13. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions or concerns about this Privacy Policy or our privacy practices, please contact us:
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
              This Privacy Policy is compliant with GDPR (EU), CCPA (California), LGPD (Brazil), PIPEDA (Canada), and Google AdSense policies. We are committed to protecting your privacy and maintaining transparency in our data practices.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
