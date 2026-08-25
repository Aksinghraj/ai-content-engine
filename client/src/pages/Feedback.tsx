import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Lightbulb, MessageCircle, Send, ShieldCheck, Sparkles, Star, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

const feedbackCategories = [
  { value: "glitch", label: "Something is broken", description: "A screen, button, or result did not work as expected.", icon: Wrench },
  { value: "problem", label: "I had a problem", description: "Share what made your workflow difficult or unclear.", icon: MessageCircle },
  { value: "suggestion", label: "I have a suggestion", description: "Tell us how Lumae could be more useful for you.", icon: Lightbulb },
  { value: "feature_request", label: "I need a feature", description: "Describe a capability that would improve your work.", icon: Sparkles },
] as const;

type FeedbackCategory = (typeof feedbackCategories)[number]["value"] | "other";

function FeedbackPageContent() {
  const [location] = useLocation();
  const utils = trpc.useUtils();
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<FeedbackCategory>("glitch");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const feedbackHistory = trpc.feedback.mine.useQuery();
  const submitFeedback = trpc.feedback.submit.useMutation({
    onSuccess: async () => {
      setSubmitted(true);
      setMessage("");
      setRating(0);
      await utils.feedback.mine.invalidate();
    },
  });

  const selectedCategory = useMemo(
    () => feedbackCategories.find((item) => item.value === category) ?? feedbackCategories[0],
    [category],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(false);
    if (!rating || message.trim().length < 10 || submitFeedback.isPending) return;
    submitFeedback.mutate({ rating, category, message: message.trim(), pagePath: location });
  };

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 pb-10">
      <header className="space-y-2">
        <p className="lumae-eyebrow"><span className="lumae-live-dot" />Product feedback</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Help make Lumae better.</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Rate your experience, report a glitch, or share an idea. Your feedback goes directly to the Lumae team for review.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <form onSubmit={handleSubmit} className="rounded-xl border border-border/80 bg-card p-5 sm:p-7" noValidate>
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-foreground">How would you rate Lumae today?</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Rating out of five stars">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} out of 5 stars`}
                  onClick={() => setRating(value)}
                  className={`feedback-rating-star ${rating >= value ? "is-selected" : ""}`}
                >
                  <Star className="h-5 w-5" fill="currentColor" />
                </button>
              ))}
            </div>
            {!rating && <p className="text-xs text-muted-foreground">Choose one to five stars.</p>}
          </fieldset>

          <fieldset className="mt-7 space-y-3">
            <legend className="text-sm font-semibold text-foreground">What would you like to share?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {feedbackCategories.map(({ value, label, description, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  className={`feedback-category-option ${category === value ? "is-selected" : ""}`}
                  aria-pressed={category === value}
                >
                  <Icon className="h-4 w-4" />
                  <span><b>{label}</b><small>{description}</small></span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-7 space-y-2">
            <label htmlFor="feedback-message" className="text-sm font-semibold text-foreground">
              Tell us more about {selectedCategory.label.toLowerCase()}
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              minLength={10}
              maxLength={2000}
              rows={6}
              placeholder="What happened, what did you expect, and what would make it better?"
              className="w-full resize-y rounded-lg border border-border bg-background px-3 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              aria-describedby="feedback-privacy feedback-length"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span id="feedback-privacy">Please do not include passwords, verification codes, API keys, or private client information.</span>
              <span id="feedback-length">{message.length}/2000</span>
            </div>
          </div>

          {submitFeedback.error && <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{submitFeedback.error.message}</p>}
          {submitted && <p className="mt-4 flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300" role="status"><CheckCircle2 className="h-4 w-4" />Thanks — your feedback has been submitted.</p>}

          <Button type="submit" disabled={!rating || message.trim().length < 10 || submitFeedback.isPending} className="mt-6 w-full gap-2 sm:w-auto">
            <Send className="h-4 w-4" />
            {submitFeedback.isPending ? "Submitting feedback…" : "Send feedback"}
          </Button>
        </form>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-muted/30 p-5">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-semibold text-foreground">Private by design</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Your report is tied to your account only so the team can understand context. It is not published as a public review.</p>
          </div>
          <div className="rounded-xl border border-border/80 bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">Your recent reports</h2>
            <div className="mt-3 space-y-3">
              {feedbackHistory.isLoading ? <p className="text-sm text-muted-foreground">Loading reports…</p> : feedbackHistory.data?.length ? feedbackHistory.data.map((item) => (
                <div key={item.id} className="border-l-2 border-primary/60 pl-3">
                  <p className="text-sm font-medium text-foreground">{"★".repeat(item.rating)}<span className="text-muted-foreground">{"★".repeat(5 - item.rating)}</span></p>
                  <p className="mt-1 text-xs capitalize text-muted-foreground">{item.category.replace("_", " ")} · {item.status}</p>
                </div>
              )) : <p className="text-sm leading-6 text-muted-foreground">Your submitted reports will appear here.</p>}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default function FeedbackPage() {
  return <DashboardLayout><FeedbackPageContent /></DashboardLayout>;
}
