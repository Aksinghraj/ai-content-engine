import { Link } from "wouter";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <img
                src="/manus-storage/lumae-logo-icon_ccacaad9.jpg"
                alt="Lumae AI"
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <h3 className="text-lg font-bold text-foreground leading-tight">Lumae AI</h3>
                <p className="text-xs text-muted-foreground tracking-widest uppercase">Made to Scale</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered social media content generation and automation platform.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a href="mailto:imankitsingh.in@gmail.com" className="hover:text-foreground transition-colors">
                  imankitsingh.in@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>India</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <a href="/ads.txt" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Ads.txt
                </a>
              </li>
            </ul>
          </div>

          {/* Compliance Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Compliance</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-[#10b981] mt-1">✓</span>
                <span>GDPR Compliant</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#10b981] mt-1">✓</span>
                <span>Google AdSense Approved</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#10b981] mt-1">✓</span>
                <span>CCPA Compliant</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#10b981] mt-1">✓</span>
                <span>SSL Encrypted</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} Lumae AI. All rights reserved. | Owned & Operated by{" "}
            <span className="font-semibold text-foreground">Ankit Singh</span>
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="/privacy-policy" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <span>•</span>
            <a href="/cookie-policy" className="hover:text-foreground transition-colors">
              Cookies
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Lumae AI is an independent service and is not affiliated with, endorsed by, or connected to Instagram, Twitter/X, LinkedIn, Facebook, YouTube, TikTok, or any other social media platform. All trademarks and logos are the property of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
