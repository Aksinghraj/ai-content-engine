import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Mail, Globe, Clock, Send, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Contact() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [honeypot, setHoneypot] = useState(""); // Honeypot field for spam detection
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // tRPC mutation for sending contact form
  const sendContactMessage = trpc.system.sendContactMessage.useMutation();

  // Simple math CAPTCHA
  const [captcha, setCaptcha] = useState(() => generateCaptcha());

  function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    return {
      question: `${num1} + ${num2} = ?`,
      answer: num1 + num2,
      userAnswer: "",
    };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check honeypot field - if filled, it's likely a bot
    if (honeypot.trim() !== "") {
      console.warn("Honeypot field filled - likely spam bot");
      // Silently fail to confuse bots
      setSubmitted(true);
      return;
    }

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate CAPTCHA
    if (parseInt(captcha.userAnswer) !== captcha.answer) {
      toast.error("CAPTCHA answer is incorrect. Please try again.");
      setCaptcha(generateCaptcha());
      return;
    }

    setIsSubmitting(true);

    try {
      await sendContactMessage.mutateAsync({
        name: formData.name,
        email: formData.email,
        subject: formData.subject || "Contact Form Inquiry",
        message: formData.message,
      });

      setSubmitted(true);
      toast.success("Message sent! We'll get back to you within 24 hours.");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send message. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setHoneypot("");
    setCaptcha(generateCaptcha());
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/10">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-xl font-bold text-foreground">Contact Us</h1>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Get in Touch</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question, feedback, or need support? We're here to help. Reach out to us and we'll respond within 24 hours.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>

            {/* Email Card */}
            <Card className="bg-muted/50 border-border p-6 flex items-start gap-4 hover:bg-muted/70 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Email</h3>
                <a
                  href="mailto:imankitsingh.in@gmail.com"
                  className="text-purple-600 hover:text-purple-700 underline transition-colors font-medium"
                >
                  imankitsingh.in@gmail.com
                </a>
                <p className="text-muted-foreground text-sm mt-2">For all inquiries, support, and feedback</p>
              </div>
            </Card>

            {/* Website Card */}
            <Card className="bg-muted/50 border-border p-6 flex items-start gap-4 hover:bg-muted/70 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Website</h3>
                <a
                  href="https://lumae.co.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline transition-colors font-medium"
                >
                  lumae.co.in
                </a>
                <p className="text-muted-foreground text-sm mt-2">Visit our main website</p>
              </div>
            </Card>

            {/* Response Time Card */}
            <Card className="bg-muted/50 border-border p-6 flex items-start gap-4 hover:bg-muted/70 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Response Time</h3>
                <p className="text-foreground font-medium">Within 24 hours</p>
                <p className="text-muted-foreground text-sm mt-1">Monday – Saturday, 9 AM – 6 PM IST</p>
              </div>
            </Card>

            {/* Owner Card */}
            <Card className="bg-gradient-to-br from-purple-950/30 to-background border border-purple-900/50 p-6">
              <h3 className="font-semibold text-foreground mb-3">Owner & Founder</h3>
              <p className="text-foreground font-bold text-lg mb-1">Veer Rajput</p>
              <p className="text-muted-foreground text-sm mb-3">Founder / CEO, Lumae AI</p>
              <a
                href="mailto:imankitsingh.in@gmail.com"
                className="text-purple-600 hover:text-purple-700 underline transition-colors text-sm font-medium"
              >
                imankitsingh.in@gmail.com
              </a>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Send a Message</h2>

            {submitted ? (
              <Card className="bg-muted/50 border-border p-8 text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Message Sent Successfully!</h3>
                <p className="text-muted-foreground mb-2">
                  Thank you for reaching out, <strong className="text-foreground">{formData.name}</strong>.
                </p>
                <p className="text-muted-foreground mb-6">
                  We've received your message and will get back to you at <strong className="text-foreground">{formData.email}</strong> within 24 hours.
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={resetForm}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Send Another Message
                  </Button>
                  <Button
                    onClick={() => navigate("/")}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Home
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="bg-muted/50 border-border p-6">
                {error && (
                  <div className="mb-4 p-4 bg-red-950/30 border border-red-900/50 rounded-lg flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-600">Error</h4>
                      <p className="text-red-600/80 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="What is this about?"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Message <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us how we can help you..."
                      rows={5}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 resize-none transition-colors"
                      required
                    />
                  </div>

                  {/* Honeypot Field - Hidden from users */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    style={{ display: "none" }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  {/* Math CAPTCHA */}
                  <div className="bg-purple-950/20 border border-purple-900/30 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      Verify you're human <span className="text-red-600">*</span>
                    </label>
                    <p className="text-foreground font-medium mb-3">{captcha.question}</p>
                    <input
                      type="number"
                      value={captcha.userAnswer}
                      onChange={(e) => setCaptcha({ ...captcha, userAnswer: e.target.value })}
                      placeholder="Enter your answer"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || sendContactMessage.isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 transition-all"
                  >
                    {isSubmitting || sendContactMessage.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>

                  <p className="text-muted-foreground text-xs text-center">
                    By submitting this form, you agree to our{" "}
                    <a href="/privacy-policy" className="text-purple-600 hover:text-purple-700 underline">
                      Privacy Policy
                    </a>
                    {" "}and{" "}
                    <a href="/terms" className="text-purple-600 hover:text-purple-700 underline">
                      Terms of Service
                    </a>
                  </p>
                </form>
              </Card>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 pt-12 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-muted/50 border-border p-6">
              <h3 className="font-semibold text-foreground mb-2">How quickly will I get a response?</h3>
              <p className="text-muted-foreground text-sm">
                We aim to respond to all inquiries within 24 hours during business hours (Monday – Saturday, 9 AM – 6 PM IST).
              </p>
            </Card>
            <Card className="bg-muted/50 border-border p-6">
              <h3 className="font-semibold text-foreground mb-2">What if I have billing questions?</h3>
              <p className="text-muted-foreground text-sm">
                For billing and payment issues, please email us directly at imankitsingh.in@gmail.com with details of your transaction.
              </p>
            </Card>
            <Card className="bg-muted/50 border-border p-6">
              <h3 className="font-semibold text-foreground mb-2">Can I request a refund?</h3>
              <p className="text-muted-foreground text-sm">
                Refunds are available within 7 days of purchase if the service is not functioning as described. Contact us for assistance.
              </p>
            </Card>
            <Card className="bg-muted/50 border-border p-6">
              <h3 className="font-semibold text-foreground mb-2">How do I report a bug or issue?</h3>
              <p className="text-muted-foreground text-sm">
                Please use this contact form to report any bugs or issues. Include as much detail as possible to help us resolve it faster.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
