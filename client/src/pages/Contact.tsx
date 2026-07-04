import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Mail, Globe, Clock, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    // Simulate form submission — in production this would send to imankitsingh.in@gmail.com
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("Message sent! We'll get back to you within 24 hours.");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-xl font-bold text-white">Contact Us</h1>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Have a question, feedback, or need support? We're here to help. Reach out to us and we'll respond within 24 hours.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>

            <Card className="bg-slate-800 border-slate-700 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Email</h3>
                <a
                  href="mailto:imankitsingh.in@gmail.com"
                  className="text-purple-400 hover:text-purple-300 underline transition-colors"
                >
                  imankitsingh.in@gmail.com
                </a>
                <p className="text-slate-400 text-sm mt-1">For all inquiries, support, and feedback</p>
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Website</h3>
                <a
                  href="https://lumae.co.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline transition-colors"
                >
                  lumae.co.in
                </a>
                <p className="text-slate-400 text-sm mt-1">Visit our main website</p>
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Response Time</h3>
                <p className="text-slate-300">Within 24 hours</p>
                <p className="text-slate-400 text-sm mt-1">Monday – Saturday, 9 AM – 6 PM IST</p>
              </div>
            </Card>

            <div className="bg-gradient-to-br from-purple-900/30 to-slate-800 border border-purple-700/30 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-2">Owner</h3>
              <p className="text-slate-300 font-medium">Ankit Singh</p>
              <p className="text-slate-400 text-sm">Founder & Owner, Lumae AI</p>
              <p className="text-slate-400 text-sm mt-1">
                <a href="mailto:imankitsingh.in@gmail.com" className="text-purple-400 hover:text-purple-300 underline">
                  imankitsingh.in@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Send a Message</h2>

            {submitted ? (
              <Card className="bg-slate-800 border-slate-700 p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-slate-300 mb-6">
                  Thank you for reaching out. We'll get back to you at <strong>{formData.email}</strong> within 24 hours.
                </p>
                <Button
                  onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "", message: "" }); }}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:text-white"
                >
                  Send Another Message
                </Button>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700 p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="What is this about?"
                      className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us how we can help you..."
                      rows={5}
                      className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                  <p className="text-slate-400 text-xs text-center">
                    By submitting this form, you agree to our{" "}
                    <button type="button" onClick={() => navigate("/privacy-policy")} className="text-purple-400 hover:text-purple-300 underline">
                      Privacy Policy
                    </button>
                  </p>
                </form>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-400 text-sm">
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
