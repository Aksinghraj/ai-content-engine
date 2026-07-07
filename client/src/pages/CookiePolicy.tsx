export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/10">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Cookie Policy</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: July 2026
            </p>
          </div>

          {/* Introduction */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lumae AI ("we," "us," "our," or "Company") uses cookies and similar tracking technologies to enhance your experience on our website. This Cookie Policy explains what cookies are, how we use them, and your choices regarding their use.
            </p>
          </section>

          {/* What are Cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files stored on your device (computer, tablet, or mobile phone) when you visit a website. They help websites remember information about your visit, such as your preferences and login status. Cookies can be either "persistent" (stored until you delete them or they expire) or "session" (deleted when you close your browser).
            </p>
          </section>

          {/* Types of Cookies */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Types of Cookies We Use</h2>
            
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-6 border border-border">
                <h3 className="font-bold text-foreground mb-2">1. Essential Cookies</h3>
                <p className="text-muted-foreground text-sm">
                  These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. Without these cookies, the website cannot operate correctly.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  <strong>Examples:</strong> Session cookies, authentication tokens, CSRF protection
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 border border-border">
                <h3 className="font-bold text-foreground mb-2">2. Analytics Cookies</h3>
                <p className="text-muted-foreground text-sm">
                  These cookies help us understand how visitors use our website. They collect information about page visits, traffic sources, and user behavior. This data helps us improve our website's performance and user experience.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  <strong>Provider:</strong> Google Analytics (GA4)
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 border border-border">
                <h3 className="font-bold text-foreground mb-2">3. Advertising Cookies</h3>
                <p className="text-muted-foreground text-sm">
                  These cookies are used to deliver relevant advertisements based on your interests. They help us measure the effectiveness of advertising campaigns and prevent you from seeing the same ads repeatedly.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  <strong>Provider:</strong> Google AdSense, Google Ads
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 border border-border">
                <h3 className="font-bold text-foreground mb-2">4. Personalization Cookies</h3>
                <p className="text-muted-foreground text-sm">
                  These cookies remember your preferences and settings, such as language choice, theme preference, and user interface customizations. They enable a personalized experience on subsequent visits.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  <strong>Examples:</strong> Theme preference, language selection, saved settings
                </p>
              </div>
            </div>
          </section>

          {/* Cookie Consent */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Your Cookie Consent</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you first visit our website, we display a cookie consent banner. You have the following options:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Accept All:</strong> Enables all cookies including analytics and advertising cookies.</li>
              <li><strong>Essential Only:</strong> Enables only essential cookies required for website functionality.</li>
              <li><strong>Reject All:</strong> Disables all non-essential cookies.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can change your cookie preferences at any time by clearing your browser cookies or visiting our website again.
            </p>
          </section>

          {/* Third-Party Cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Third-Party Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use third-party services that may set their own cookies:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Google Analytics:</strong> Analyzes website traffic and user behavior</li>
              <li><strong>Google AdSense:</strong> Delivers personalized advertisements</li>
              <li><strong>Google Ads:</strong> Measures advertising campaign performance</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These third parties have their own privacy policies and cookie policies. We encourage you to review them.
            </p>
          </section>

          {/* Data Protection */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Data Protection & Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We are committed to protecting your privacy. All data collected through cookies is:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Encrypted and securely transmitted</li>
              <li>Used only for the purposes described in this policy</li>
              <li>Never sold to third parties</li>
              <li>Retained only as long as necessary</li>
              <li>Subject to our Privacy Policy</li>
            </ul>
          </section>

          {/* Browser Controls */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Browser Controls</h2>
            <p className="text-muted-foreground leading-relaxed">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>View cookies stored on your device</li>
              <li>Delete cookies at any time</li>
              <li>Block cookies from specific websites</li>
              <li>Enable "Do Not Track" (if supported)</li>
              <li>Use private/incognito browsing mode</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Please note that disabling cookies may affect website functionality.
            </p>
          </section>

          {/* Compliance */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Legal Compliance</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Cookie Policy complies with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>GDPR (EU):</strong> General Data Protection Regulation</li>
              <li><strong>CCPA (US):</strong> California Consumer Privacy Act</li>
              <li><strong>LGPD (Brazil):</strong> Lei Geral de Proteção de Dados</li>
              <li><strong>PIPEDA (Canada):</strong> Personal Information Protection and Electronic Documents Act</li>
              <li><strong>Google AdSense Policies:</strong> Ad serving and personalization requirements</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Cookie Policy or our use of cookies, please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-6 border border-border space-y-2">
              <p className="text-muted-foreground">
                <strong>Email:</strong> imankitsingh.in@gmail.com
              </p>
              <p className="text-muted-foreground">
                <strong>Website:</strong> https://lumae.co.in
              </p>
              <p className="text-muted-foreground">
                <strong>Company:</strong> Lumae AI
              </p>
            </div>
          </section>

          {/* Changes */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website and updating the "Last updated" date above.
            </p>
          </section>

          {/* Footer */}
          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              © 2026 Lumae AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
